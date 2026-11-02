# GitHub 用户搜索器

基于 Vue 3 + Vue Router + Axios 的 GitHub 用户搜索应用。

## 在线演示

https://github-search-gold-mu.vercel.app/

## 功能

- 搜索 GitHub 用户，展示头像和用户名
- 搜索历史本地持久化（localStorage，最多 8 条）
- 用户详情页展示基本信息与仓库列表
- 仓库列表支持分页
- 完整的 loading / error / empty 三种状态处理
- 处理 GitHub API 403 限流提示

## 技术要点

- Vue Router 动态路由 `/user/:username`，query 传参 `/search?q=xxx`
- 详情页使用 `Promise.all` 并行请求用户信息与仓库列表
- 翻页时只请求仓库，不重复请求用户信息
- Vercel 配置 SPA rewrite 回退到 index.html，解决刷新 404

## 本地运行

npm install
npm run dev
