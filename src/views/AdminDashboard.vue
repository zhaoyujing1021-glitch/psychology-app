<template>
  <el-container class="dashboard-container">
    <el-header class="header">
      <span>管理者ダッシュボード - クライアント監視システム</span>
      <el-button type="danger" size="small" @click="$emit('logout')">ログアウト</el-button>
    </el-header>
    <el-main>
      <el-row :gutter="20">
        <!-- クライアント選択リスト -->
        <el-col :span="8">
          <el-card header="クライアント一覧">
            <el-table :data="clients" @current-change="handleSelectClient" highlight-current-row style="width: 100%">
              <el-table-column prop="username" label="ユーザー名" />
              <el-table-column prop="chats.length" label="対話数" width="90" />
            </el-table>
          </el-card>
        </el-col>

        <!-- 選択されたクライアントの詳細なチャットおよび心理レポート分析 -->
        <el-col :span="16">
          <el-card v-if="selectedClient" :header="selectedClient.username + 'さんの詳細カルテ'">
            <el-tabs>
              <el-tab-pane label="チャット履歴・感情傾向">
                <div class="admin-chat-box">
                  <div v-for="c in selectedClient.chats" :key="c.id" :class="['admin-msg', c.role]">
                    <span class="role-tag">{{ c.role === 'user' ? 'ユーザー' : 'AI' }}</span>
                    <p>{{ c.content }}</p>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="心・晴雨表レポート履歴">
                <div v-if="selectedClient.reports.length === 0" style="color: #999;">レポートはまだ生成されていません。</div>
                <div v-for="r in selectedClient.reports" :key="r.id" class="admin-report-card">
                  <div class="report-date">{{ r.date }}</div>
                  <pre>{{ r.content }}</pre>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
          <el-card v-else>
            <div style="text-align: center; color: #999; padding: 40px;">左側のリストからクライアントを選択してください。</div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const clients = ref([]);
const selectedClient = ref(null);

const loadClients = async () => {
  const res = await axios.get('http://localhost:3000/api/admin/all-data');
  if (res.data.success) {
    clients.value = res.data.clients;
  }
};

const handleSelectClient = (row) => {
  if (row) selectedClient.value = row;
};

onMounted(loadClients);
</script>

<style scoped>
.dashboard-container { height: 100vh; }
.header { display: flex; justify-content: space-between; align-items: center; background: #2b2f3a; color: #fff; }
.admin-chat-box { height: 50vh; overflow-y: auto; padding: 10px; background: #fcfcfc; border: 1px solid #ebeef5; }
.admin-msg { margin-bottom: 10px; padding: 8px; border-radius: 4px; }
.admin-msg.user { background: #e6f7ff; text-align: left; }
.admin-msg.assistant { background: #f6ffed; text-align: left; }
.role-tag { font-size: 12px; font-weight: bold; color: #666; }
.admin-report-card { border-left: 4px solid #409eff; background: #f4f4f5; padding: 10px; margin-bottom: 10px; }
.report-date { font-weight: bold; font-size: 12px; color: #909399; }
.admin-report-card pre {white-space: pre-wrap;word-break: break-all;font-family: inherit;margin: 5px 0 0 0; color: #333;                 /* 字体颜色 */
}
</style>