import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AuthView from "../views/AuthView.vue";
import NetworksView from "../views/NetworksView.vue";
import DashboardView from "../views/DashboardView.vue";
import WatchlistView from "../views/WatchlistView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
		},
		{
			path: "/auth/:pathMatch(.*)*",
			name: "auth",
			component: AuthView,
		},
		{
			path: "/networks",
			name: "networks",
			component: NetworksView,
		},
		{
			path: "/dashboard",
			name: "dashboard",
			component: DashboardView,
		},
		{
			path: "/watchlist",
			name: "watchlist",
			component: WatchlistView,
			// beforeEnter: async (_, _1, next) => {
			// 	if (!(await Session.doesSessionExist())) {
			// 		next("/auth");
			// 	} else {
			// 		next();
			// 	}
			// },
		},
	],
});

export default router;
