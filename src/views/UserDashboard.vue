<template>
  <el-container class="dashboard-container">
    <el-header class="header">
      <span>心理ケアプラットフォーム - ようこそ、{{ username }} さん</span>
      <el-button type="danger" size="small" @click="$emit('logout')">ログアウト</el-button>
    </el-header>
    <el-main>
      <el-tabs type="border-card">
        <!-- タブ 1：AIメンタルカウンセリングおよび気圧計 -->
        <el-tab-pane label="AIメンタルカウンセリング">
          <div class="chat-layout">
            <div class="chat-box" ref="chatBoxRef">
              <div v-for="msg in chats" :key="msg.id" :class="['msg-item', msg.role]">
                <div class="msg-bubble">{{ msg.content }}</div>
              </div>
            </div>
            <div class="input-box">
              <el-input v-model="inputMessage" placeholder="今の気持ちを入力..." @keyup.enter="sendMessage" />
              <el-button type="primary" @click="sendMessage">送信</el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- タブ 2：個人向け心理レポートおよび気圧計 -->
        <el-tab-pane label="マイ心理レポート・晴雨表">
          <el-button type="success" @click="generateReport" style="margin-bottom: 20px;">本日のレポートを生成する</el-button>
          <el-timeline>
            <el-timeline-item v-for="rep in reports" :key="rep.id" :timestamp="rep.date" placement="top">
              <el-card>
                <pre class="report-content">{{ rep.content }}</pre>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const props = defineProps(['userId', 'username']);
const emit = defineEmits(['logout']);

const chats = ref([]);
const reports = ref([]);
const inputMessage = ref('');
const chatBoxRef = ref(null);

const loadData = async () => {
  const res = await axios.get(`http://localhost:3000/api/user/data/${props.userId}`);
  chats.value = res.data.chats;
  reports.value = res.data.reports;
  scrollToBottom();
};

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;
  const text = inputMessage.value;
  inputMessage.value = '';

  // ユーザーメッセージを一時的に描画する
  chats.value.push({ id: Date.now(), userId: props.userId, role: 'user', content: text });
  scrollToBottom();

  try {
    const res = await axios.post('http://localhost:3000/api/chat', { userId: props.userId, message: text });
    if (res.data.success) {
      chats.value.push({ id: Date.now() + 1, userId: props.userId, role: 'assistant', content: res.data.reply });
      scrollToBottom();
    }
  } catch (e) {
    ElMessage.error('メッセージの送信に失敗しました。');
  }
};

const generateReport = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/user/generate-report', { userId: props.userId });
    if (res.data.success) {
      reports.value.unshift(res.data.report);
      ElMessage.success('新しい心理レポートが生成されました。');
    }
  } catch (e) {
    ElMessage.error('レポート生成に失敗しました。');
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBoxRef.value) {
      chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight;
    }
  });
};

onMounted(loadData);
</script>

<style scoped>
.dashboard-container { height: 100vh; }
.header { display: flex; justify-content: space-between; align-items: center; background: #fff; border-bottom: 1px solid #dcdfe6; }
.chat-layout { display: flex; flex-Direction: column; height: 60vh; }
.chat-box { flex: 1; border: 1px solid #ebeef5; padding: 15px; overflow-y: auto; background: #fafafa; border-radius: 4px; margin-bottom: 10px; }
.msg-item { margin-bottom: 12px; display: flex; }
.msg-item.user { justify-content: flex-end; }
.msg-item.assistant { justify-content: flex-start; }
.msg-bubble { max-width: 70%; padding: 10px 15px; border-radius: 8px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
.user .msg-bubble { background-color: #409eff; color: #fff; }
.assistant .msg-bubble { background-color: #fff; color: #333; border: 1px solid #dcdfe6; }
.input-box { display: flex; gap: 10px; }
.report-content { font-family: inherit; white-space: pre-wrap; margin: 0; }
</style>