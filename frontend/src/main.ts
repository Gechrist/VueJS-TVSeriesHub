import { createApp } from "vue";
import { initSuperTokensWebJS } from "./config";
import { ref, computed } from "vue";
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";

initSuperTokensWebJS();

const apiUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";
let unreadNotificationsCount = ref<number>(0);
let notifications = ref<any>([]);
const getNotifications = async (userInfo: string) => {
	try {
		const response = await fetch(
			`${apiUrl}/getnotifications?userEmail=${userInfo}`,
		);
		const data = await response.json();
		if (data.error) {
			console.error("Error fetching notifications:", data.error);
			return;
		}
		notifications.value = data || [];
		unreadNotificationsCount.value = Object.keys(notifications.value).filter(
			(key: string) => notifications.value[key].readStatus === false,
		).length;
	} catch (error) {
		console.error("Error fetching notifications:", error);
	}
};

const app = createApp(App)
	.use(router)
	.use(Vue3Toastify, {
		autoclose: 3000,
		theme: "colored",
		position: "top-center",
	} as ToastContainerOptions);

app.provide("getNotifications", getNotifications);
app.provide(
	"unreadNotificationsCount",
	computed(() => unreadNotificationsCount.value),
);
app.provide(
	"notifications",
	computed(() => notifications.value),
);

app.mount("#app");
