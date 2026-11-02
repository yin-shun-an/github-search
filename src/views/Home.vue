<template>
  <div class="page">
    <h1>GitHub 用户搜索</h1>
    <div class="search-box">
      <input
        v-model="keyword"
        placeholder="输入用户名，比如 torvalds"
        @keyup.enter="goSearch"
      />
      <button @click="goSearch">搜索</button>
    </div>

    <div class="history" v-if="history.length">
      <p>搜索历史：</p>
      <span
        v-for="(h, i) in history"
        :key="i"
        class="history-item"
        @click="searchHistory(h)"
        >{{ h }}</span
      >
      <button class="clear-btn" @click="clearHistory">清空</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const keyword = ref("");
const history = ref(JSON.parse(localStorage.getItem("gh_history")) || []);

function goSearch() {
  const q = keyword.value.trim();
  if (!q) return;

  history.value = [q, ...history.value.filter((h) => h !== q)].slice(0, 8);
  localStorage.setItem("gh_history", JSON.stringify(history.value));

  router.push({ path: "/search", query: { q } });
}

function searchHistory(h) {
  keyword.value = h;
  goSearch();
}

function clearHistory() {
  history.value = [];
  localStorage.removeItem("gh_history");
}
</script>

<style scoped>
.page {
  max-width: 600px;
  margin: 60px auto;
  padding: 0 20px;
}
h1 {
  font-size: 24px;
  margin-bottom: 24px;
}
.search-box {
  display: flex;
  gap: 8px;
}
.search-box input {
  flex: 1;
  padding: 10px 14px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
}
.search-box input:focus {
  border-color: #333;
}
.search-box button {
  padding: 0 20px;
  border: none;
  background: #333;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
}
.history {
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}
.history-item {
  display: inline-block;
  margin: 0 8px 8px 0;
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
}
.history-item:hover {
  background: #e0e0e0;
}
.clear-btn {
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  font-size: 13px;
  text-decoration: underline;
}
</style>
