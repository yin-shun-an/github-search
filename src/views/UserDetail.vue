<template>
  <div class="page">
    <div class="header">
      <router-link to="/">← 返回首页</router-link>
    </div>

    <div v-if="loading" class="state">加载中…</div>

    <div v-else-if="error" class="state error">
      <p>{{ error }}</p>
      <button @click="fetchData">重试</button>
    </div>

    <template v-else-if="user">
      <div class="user-header">
        <img :src="user.avatar_url" :alt="user.login" class="avatar" />
        <div class="user-info">
          <h1>{{ user.name || user.login }}</h1>
          <p class="login">@{{ user.login }}</p>
          <p v-if="user.bio" class="bio">{{ user.bio }}</p>
          <div class="meta">
            <span>粉丝 {{ user.followers }}</span>
            <span>关注 {{ user.following }}</span>
            <span>仓库 {{ user.public_repos }}</span>
          </div>
        </div>
      </div>

      <div class="repos">
        <h2>仓库列表</h2>

        <div v-if="reposLoading" class="state">仓库加载中…</div>

        <div v-else-if="repos.length === 0" class="state">
          这个用户还没有公开仓库
        </div>

        <template v-else>
          <div class="repo-list">
            <div v-for="repo in repos" :key="repo.id" class="repo-card">
              <a :href="repo.html_url" target="_blank" class="repo-name">
                {{ repo.name }}
              </a>
              <p v-if="repo.description" class="repo-desc">
                {{ repo.description }}
              </p>
              <div class="repo-meta">
                <span v-if="repo.language">{{ repo.language }}</span>
                <span>⭐ {{ repo.stargazers_count }}</span>
                <span>🍴 {{ repo.forks_count }}</span>
              </div>
            </div>
          </div>

          <div class="pagination">
            <button :disabled="page <= 1" @click="changePage(page - 1)">
              上一页
            </button>
            <span>第 {{ page }} 页</span>
            <button
              :disabled="repos.length < perPage"
              @click="changePage(page + 1)"
            >
              下一页
            </button>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const username = computed(() => route.params.username || "");

const user = ref(null);
const repos = ref([]);
const loading = ref(false);
const reposLoading = ref(false);
const error = ref("");
const page = ref(1);
const perPage = 10;

// 简单的内存缓存：同一个用户名短时间内不重复请求
const cache = new Map();

// 拉用户信息 + 仓库列表（两个接口并行）
async function fetchData() {
  const name = username.value;
  if (!name) return;

  // 缓存命中：直接用，不再发请求
  if (cache.has(name)) {
    const cached = cache.get(name);
    user.value = cached.user;
    repos.value = cached.repos;
    error.value = "";
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = "";
  user.value = null;
  repos.value = [];

  try {
    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${name}`, {
        headers: { Accept: "application/vnd.github+json" },
      }),
      axios.get(`https://api.github.com/users/${name}/repos`, {
        params: { page: page.value, per_page: perPage, sort: "updated" },
        headers: { Accept: "application/vnd.github+json" },
      }),
    ]);

    user.value = userRes.data;
    repos.value = reposRes.data || [];
    cache.set(name, { user: user.value, repos: [...repos.value] });
  } catch (e) {
    if (e.response && e.response.status === 404) {
      error.value = "用户不存在";
    } else if (e.response && e.response.status === 403) {
      error.value = "请求太频繁了，等一分钟再试";
    } else {
      error.value = "请求失败，请检查网络后重试";
    }
  } finally {
    loading.value = false;
  }
}

// 只拉仓库（翻页时用，不重新拉用户信息）
async function fetchRepos() {
  const name = username.value;
  if (!name) return;

  reposLoading.value = true;
  try {
    const res = await axios.get(`https://api.github.com/users/${name}/repos`, {
      params: { page: page.value, per_page: perPage, sort: "updated" },
      headers: { Accept: "application/vnd.github+json" },
    });
    repos.value = res.data || [];
  } catch (e) {
    repos.value = [];
  } finally {
    reposLoading.value = false;
  }
}

function changePage(newPage) {
  page.value = newPage;
  fetchRepos();
}

// 用户名变了就重新拉
watch(
  username,
  () => {
    page.value = 1;
    fetchData();
  },
  { immediate: true },
);
</script>

<style scoped>
.page {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}
.header {
  margin-bottom: 16px;
}
.header a {
  color: #333;
  font-size: 14px;
}

.state {
  text-align: center;
  padding: 40px 0;
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

.user-header {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding: 24px;
  border: 1px solid #eee;
  border-radius: 10px;
  margin-bottom: 32px;
}
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
.user-info h1 {
  margin: 0 0 4px;
  font-size: 24px;
}
.login {
  color: #666;
  margin: 0 0 12px;
  font-size: 15px;
}
.bio {
  color: #333;
  font-size: 14px;
  margin: 0 0 12px;
}
.meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #555;
}

.repos h2 {
  font-size: 20px;
  margin-bottom: 16px;
}
.repo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.repo-card {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.repo-name {
  font-size: 16px;
  font-weight: 600;
  color: #0366d6;
  text-decoration: none;
}
.repo-name:hover {
  text-decoration: underline;
}
.repo-desc {
  color: #555;
  font-size: 14px;
  margin: 8px 0;
}
.repo-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
.pagination button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
