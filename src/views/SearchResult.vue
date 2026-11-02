<template>
  <div class="page">
    <div class="header">
      <router-link to="/">← 返回首页</router-link>
      <h1>搜索结果：{{ keyword }}</h1>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="state">加载中…</div>

    <!-- 出错 -->
    <div v-else-if="error" class="state error">
      <p>{{ error }}</p>
      <button @click="fetchUsers">重试</button>
    </div>

    <!-- 空结果 -->
    <div v-else-if="users.length === 0" class="state">
      没找到用户，换个关键词试试
    </div>

    <!-- 列表 -->
    <div v-else class="user-list">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-card"
        @click="goDetail(user.login)"
      >
        <img :src="user.avatar_url" :alt="user.login" class="avatar" />
        <div class="info">
          <p class="name">{{ user.login }}</p>
          <a :href="user.html_url" target="_blank" class="link" @click.stop>
            主页链接
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const keyword = computed(() => route.query.q || "");
const users = ref([]);
const loading = ref(false);
const error = ref("");

async function fetchUsers() {
  const q = keyword.value;
  if (!q) {
    users.value = [];
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const res = await axios.get("https://api.github.com/search/users", {
      params: { q, per_page: 20 },
      headers: { Accept: "application/vnd.github+json" },
    });
    users.value = res.data.items || [];
  } catch (e) {
    if (e.response && e.response.status === 403) {
      error.value = "请求太频繁了，GitHub 限制了访问次数，等一分钟再试";
    } else {
      error.value = "请求失败，请检查网络后重试";
    }
    users.value = [];
  } finally {
    loading.value = false;
  }
}

function goDetail(login) {
  router.push(`/user/${login}`);
}

// 关键词变化时重新请求
watch(keyword, fetchUsers, { immediate: true });
</script>

<style scoped>
.page {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}
.header {
  margin-bottom: 24px;
}
.header a {
  color: #333;
  font-size: 14px;
}
.header h1 {
  font-size: 22px;
  margin: 12px 0 0;
}

.state {
  text-align: center;
  padding: 60px 0;
  color: #666;
}
.state.error {
  color: #c00;
}
.state button {
  margin-top: 12px;
  padding: 8px 20px;
  border: none;
  background: #333;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.user-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
.info {
  flex: 1;
}
.name {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 4px;
}
.link {
  font-size: 13px;
  color: #0366d6;
}
</style>
