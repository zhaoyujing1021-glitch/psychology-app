const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const app = express();
app.use(express.json());
app.use(cors());

const DB_FILE = path.join(__dirname, 'db.json');

// データベース初期化
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    users: [
      { id: 'u1', username: 'user1', password: 'password', role: 'user' },
      { id: 'admin', username: 'admin', password: 'password', role: 'admin' }
    ],
    chats: [], // { id, userId, role('user'|'assistant'), content, timestamp, mood }
    reports: [] // { id, userId, date, summary, weather }
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// 1. ログイン
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, token: 'mock-token-' + user.id, role: user.role, userId: user.id, username: user.username });
  } else {
    res.status(401).json({ success: false, message: '認証に失敗しました。ユーザー名またはパスワードが正しくありません。' });
  }
});

// 2. メッセージ送信・AI対話
app.post('/api/chat', async (req, res) => {
  const { userId, message } = req.body;
  const db = readDB();

  //ユーザー別対話履歴閲覧
  const userMsg = { id: Date.now().toString(), userId, role: 'user', content: message, timestamp: new Date().toISOString() };
  db.chats.push(userMsg);

  try {
    // DeepSeek API
    const response = await axios.post(
      config.DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "あなたはプロフェッショナルで共感的な心理カウンセラーAIです。ユーザーの気持ちに寄り添い、優しく日本語で対話してください。また、返答の最後に [情緒: 晴れ/曇り/雨] のようにユーザーの心理状態を推定してタグをつけてください。" },
          { role: "user", content: message }
        ],
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${config.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const replyContent = response.data.choices[0].message.content;
    
    // AIメッセージ　記録
    const aiMsg = { id: (Date.now() + 1).toString(), userId, role: 'assistant', content: replyContent, timestamp: new Date().toISOString() };
    db.chats.push(aiMsg);
    writeDB(db);

    res.json({ success: true, reply: replyContent });
  } catch (error) {
    console.error('DeepSeek API Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'AIサービスとの通信に失敗しました。' });
  }
});

// 3. チャット履歴一覧取得
app.get('/api/user/data/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDB();
  const userChats = db.chats.filter(c => c.userId === userId);
  const userReports = db.reports.filter(r => r.userId === userId);
  res.json({ chats: userChats, reports: userReports });
});

// 4. AI要約レポート
app.post('/api/user/generate-report', async (req, res) => {
  const { userId } = req.body;
  const db = readDB();
  const userChats = db.chats.filter(c => c.userId === userId);
  
  if (userChats.length === 0) {
    return res.status(400).json({ success: false, message: '分析するチャット履歴がありません。' });
  }

  
  const chatContext = userChats.map(c => `${c.role === 'user' ? 'ユーザー' : 'AI'}: ${c.content}`).join('\n');
  
  try {
    const response = await axios.post(
      config.DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "以下のユーザーとの対話履歴を分析し、心理状態の「晴れ・曇り・雨」の天気予報（晴雨表）メタファーを用いた短い分析レポート（日本語）を生成してください。フォーマット例：【心理晴雨表】晴れ\n【専属アドバイス】..." },
          { role: "user", content: chatContext }
        ]
      },
      {
        headers: { 'Authorization': `Bearer ${config.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' }
      }
    );

    const reportContent = response.data.choices[0].message.content;
    const today = new Date().toISOString().split('T')[0];
    
    // 保存报告
    const newReport = { id: Date.now().toString(), userId, date: today, content: reportContent };
    db.reports.push(newReport);
    writeDB(db);

    res.json({ success: true, report: newReport });
  } catch (e) {
    res.status(500).json({ success: false, message: 'レポートの生成に失敗しました。' });
  }
});

// 5. 管理者
app.get('/api/admin/all-data', (req, res) => {
  const db = readDB();
  // 管理者以外
  const clients = db.users.filter(u => u.role === 'user').map(u => ({
    id: u.id,
    username: u.username,
    chats: db.chats.filter(c => c.userId === u.id),
    reports: db.reports.filter(r => r.userId === u.id)
  }));
  res.json({ success: true, clients });
});

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});