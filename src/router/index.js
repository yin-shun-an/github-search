import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import SearchResult from "../views/SearchResult.vue";
import UserDetail from "../views/UserDetail.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/search", component: SearchResult },
  { path: "/user/:username", component: UserDetail },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
