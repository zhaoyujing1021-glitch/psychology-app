<template>
  <div id="app">
    <div v-if="!isLoggedIn" class="login-container">
      <el-card class="login-card">
        <h2>心理サポートシステム ログイン</h2>
        <el-form :model="loginForm" label-width="90px">
          <el-form-item label="ユーザー名">
            <el-input v-model="loginForm.username" placeholder="user1 または admin" />
          </el-form-item>
          <el-form-item label="パスワード">
            <el-input type="password" v-model="loginForm.password" show-password />
          </el-form-item>
          <el-button type="primary" style="width: 100%;" @click="handleLogin">ログイン</el-button>
        </el-form>
      </el-card>
    </div>

    <div v-else>
      <!-- 管理者画面 -->
      <AdminDashboard v-if="role === 'admin'" @logout="handleLogout" />
      <!-- ユーザー画面 -->
      <UserDashboard v-else :userId="userId" :username="username" @logout="handleLogout" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import UserDashboard from './views/UserDashboard.vue';
import AdminDashboard from './views/AdminDashboard.vue';

const isLoggedIn = ref(false);
const role = ref('');
const userId = ref('');
const username = ref('');
const loginForm = ref({ username: '', password: '' });

const handleLogin = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/login', loginForm.value);
    if (res.data.success) {
      isLoggedIn.value = true;
      role.value = res.data.role;
      userId.value = res.data.userId;
      username.value = res.data.username;
      ElMessage.success('ログインに成功しました。');
    }
  } catch (e) {
    ElMessage.error('ログイン失敗：ユーザー名またはパスワードを確認してください。');
  }
};

const handleLogout = () => {
  isLoggedIn.value = false;
  loginForm.value = { username: '', password: '' };
};
</script>

<style>
body {
  margin: 0;
  background-color: #f4f7fc;
  font-family: sans-serif;
}
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-card {
  width: 420px;
  padding: 20px;
}
</style>