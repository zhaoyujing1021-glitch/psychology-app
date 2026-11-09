# 心理サポートシステム (Psychology Support System)

Vue 3（CDN/Vite）と Node.js（Express）をベースに構築された、DeepSeek API 連携型の心理カウンセリング・メンタルサポートシステムです。

---

## 🛠️ プロジェクト構成 (Project Structure)

```text
psychology-app/
├── server/                    # バックエンド (Node.js / Express)
│   ├── .env                   # ⚠️ DeepSeek APIキー設定（Git非同期）
│   ├── config.js              # 独立API設定ファイル（Git非同期）
│   ├── db.json                # ローカル簡易データベース（チャット・レポート保存）
│   └── server.js              # バックエンドメインサーバー
└── frontend/                  # フロントエンド (Vue 3 CDN)
    └── index.html             # すべての画面・ロジックを統合したシングルHTML
```

---

## 🚀 クローン後の実行方法（初期設定・ビルド不要）

GitHub からリポジトリをクローン（またはダウンロード）した後、以下の手順に従って起動してください。

### 1. バックエンドの起動
ターミナルで `server/` フォルダに移動します：
```bash
cd server
```
必要な依存パッケージをインストールします：
```bash
npm install express cors axios dotenv
```
DeepSeek API キーの設定（重要）：
`server/` フォルダ内に `.env` という名前のファイルを作成し、次のようにあなたの API キーを記述します：
```env
DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key-here
```
※ `config.js` と `.env` は `.gitignore` に含まれているため、GitHubへは同期されません。

バックエンドサーバーを起動します：
```bash
node server.js
```
* 起動成功の表示：`Server running on port 3000`

### 2. フロントエンドの起動
このプロジェクトは CDN 版 Vue 3 を採用しているため、複雑なビルドツール（ViteやWebpack）や `npm install` の前端設定は一切不要です。
* **方法 A（最もおすすめ・簡単）**：VS Code などのエディタで `frontend/index.html` を開き、Live Server などの拡張機能を使ってプレビューします。
* **方法 B（ブラウザで直接開く）**：`frontend/index.html` ファイルをダブルクリックして、Google Chrome などのブラウザで直接開くことも可能です。

---

## 👥 ログインアカウントと権限

システムには初期データ（`db.json`）があらかじめ組み込まれているため、追加の設定なしですぐに以下のテストアカウントでログインできます：

* **一般ユーザー画面**
  * ユーザー名 (`username`): `user1`
  * パスワード (`password`): `password`
  * 機能: AI 心理カウンセラーとの対話、毎日の心理「晴雨表（天気メタファー）」レポートの自動生成。

* **管理者（Admin）画面**
  * ユーザー名 (`username`): `admin`
  * パスワード (`password`): `password`
  * 機能: すべてのクライアント一覧の確認、個別のチャット履歴および心理レポートのカルテ一元管理。

---

## 🛡️ セキュリティ・Git 非同期について

API キー（`server/.env` および `server/config.js`）や実行時データ（`server/db.json`）は、すべて `.gitignore` によって Git の管理対象外に設定されています。
リポジトリをパブリックに公開しても、秘密情報や個人データが誤って流出することはありません。

---

## 💡 ほかの企業の API（OpenAIなど）へ切り替える方法

本システムは、コードを変更せずに環境変数の設定だけで、DeepSeek 以外の他社 API（OpenAI や互換性のある LLM API）に切り替えて利用することができます。

設定を変更する際は、**ソースコードのファイルを一切変更・Git同期する必要はありません**。以下の手順に従ってローカル環境のみで設定を行ってください。

### 手順：
1. バックエンドの `server/` フォルダ内にある `.env` ファイルを開きます（ない場合は新規作成してください）。
2. 使用したい企業の **APIエンドポイント（URL）** と **APIキー** に書き換えます。

```env
# 例：OpenAI API を利用する場合
DEEPSEEK_API_KEY=sk-your-openai-or-other-api-key-here
DEEPSEEK_API_URL=https://api.openai.com/v1/chat/completions
```

> **🔒 注意（Git非同期について）：**
> `.env` ファイルおよび設定ファイル（`config.js`）は、プロジェクトの `.gitignore` によってあらかじめ Git の管理対象外（非同期）に指定されています。そのため、APIキーや他社サービスの接続情報が誤って GitHub に公開される心配はありません。