<script setup lang="ts">
	import { onMounted, onUnmounted, ref, inject } from "vue";
	import { useRoute } from "vue-router";
	import Session from "supertokens-web-js/recipe/session";
	import BlueTick from "/bluetick.svg";
	import GreyTick from "/greytick.svg";

	let userId = ref<string | null>(null);
	const userInfo = ref<string | null>("");
	let backgroundColor = ref<boolean>(false);
	let showFilters = ref<boolean>(false);
	let displayNotifications = ref<boolean>(false);
	let isLoggedIn = ref<boolean>(false);
	let sseStream: any = null;

	let unreadNotificationsCount = inject(
		"unreadNotificationsCount",
		0,
	) as number;
	const getNotifications = inject("getNotifications", () => {}) as Function;
	const notifications = inject("notifications", []) as Record<string, any>;

	const apiUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";
	const websiteUrl =
		import.meta.env.VITE_APP_WEBSITE_URL || "http://localhost:3000";

	const route = useRoute();

	async function getJWT() {
		if (await Session.doesSessionExist()) {
			userId.value = (await Session.getUserId()) as string;
			// let jwt = await Session.getAccessToken();
		}
	}

	const toggleBackgroundColor = (value: boolean) => {
		if (window.scrollY > 50) {
			backgroundColor.value = true;
		} else {
			backgroundColor.value = value;
		}
		showFilters.value = value;
	};

	const toggleNotificationReadStatusFunction = async (
		readStatus: boolean,
		index?: number,
	) => {
		try {
			const notificationsData = await fetch(
				`${apiUrl}/togglenotificationreadstatus`,
				{
					signal: AbortSignal.timeout(7000),
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						index: index,
						readStatus: !readStatus,
						userEmail: userInfo.value,
					}),
				},
			);

			const response = await notificationsData.json();
			if (response.error) {
				console.error("Error toggling notification read status:");
				return;
			}
			getNotifications(userInfo.value);
		} catch (error) {
			console.error("Error toggling notification read status:", error);
		}
	};

	async function logout() {
		await Session.signOut();
		isLoggedIn.value = await Session.doesSessionExist();
		if (!isLoggedIn.value) {
			window.location.href = "/";
			localStorage.removeItem("userInfo");
			localStorage.removeItem("userWatchlist");
			localStorage.removeItem("userFeaturedNetworks");
		}
	}

	onMounted(async () => {
		userInfo.value = localStorage.getItem("userInfo");
		getJWT();
		let scroll;
		window.addEventListener(
			"scroll",
			(scroll = async () => {
				if (window.scrollY > 50) {
					backgroundColor.value = true;
				} else backgroundColor.value = showFilters.value;
			}),
		);
		scroll();
		if (userInfo.value && route.path !== websiteUrl) {
			getNotifications(userInfo.value);
		}
		// set up SSE consume
		if (userInfo.value) {
			const url = `${apiUrl}/api/events/stream?userId=${userInfo.value}`;
			sseStream = new EventSource(url);

			sseStream.onmessage = () => {
				if (userInfo.value) {
					getNotifications(userInfo.value);
				}
			};

			sseStream.onerror = () => {
				console.log(
					"Stream connection interrupted. Will retry using Last-Event-ID header...",
				);
			};
		}
		const url = `${apiUrl}/api/events/stream?userId=${userInfo.value}`;
		sseStream = new EventSource(url);

		sseStream.onmessage = () => {
			if (userInfo.value) {
				getNotifications(userInfo.value);
			}
		};

		sseStream.onerror = () => {
			console.log(
				"Stream connection interrupted. Will retry using Last-Event-ID header...",
			);
		};
	});

	onUnmounted(() => {
		if (sseStream) {
			sseStream.close();
		}
	});
</script>

<template>
	<header>
		<nav
			:class="`${backgroundColor && 'bg-amber-600'} fixed font-krub text-sm lg:text-base 2xl:text-3x pt-4 h-22 w-screen text-white z-10 flex flex-col gap-4`"
		>
			<div
				class="w-full flex flex-col gap-0 md:flex-row justify-around items-end md:items-start"
			>
				<section
					class="w-full md:w-1/2 text-4xl md:text-[40px] 2xl:text-[50px] font-semibold tracking-tight flex justify-center"
				>
					<router-link to="/">TV Series Hub</router-link>
				</section>
				<section class="flex flex-col w-full lg:w-1/2 items-center">
					<div class="w-5/6 lg:w-3/6 flex flex-col items-end">
						<div
							:class="`flex font-semibold w-full flex-row gap-2 md:gap-4 text-[13px] 2xl:text-base ${userId ? 'justify-between' : 'justify-center'} self-center lg:gap-8`"
						>
							<section
								v-if="userId"
								class="w-auto hover:underline underline-offset-2 cursor-pointer text-nowrap"
								@click="logout"
								aria-controls="Log out"
							>
								Log Out
							</section>
							<section
								v-if="!userId"
								class="w-auto hover:underline underline-offset-2"
							>
								<router-link to="/auth">Connect</router-link>
							</section>
							<section class="w-auto hover:underline underline-offset-2">
								<router-link to="/networks">Networks</router-link>
							</section>
							<section
								v-if="userId"
								class="w-auto hover:underline underline-offset-2"
							>
								<router-link to="/watchlist">Watchlist</router-link>
							</section>
							<div
								v-if="userId"
								:class="`flex w-max flex-row justify-end cursor-pointer ${displayNotifications && notifications.length > 0 ? 'bg-amber-50 text-black px-0.5' : ''}`"
							>
								<p @click="displayNotifications = !displayNotifications">
									Notifications
								</p>
								<p
									class="bg-red-600 text-white w-[15px] h-[15px] lg:w-[18px] lg:h-[18px] p-1 flex flex-row justify-center justify-items-end items-center relative -top-2 left-0 rounded-full text-[8px] lg:text-[10px]"
									v-if="(unreadNotificationsCount as unknown as number) > 0"
								>
									{{
										Object.keys(notifications).filter(
											(key: string) => notifications[key].readStatus === false,
										).length
									}}
								</p>
							</div>
						</div>
					</div>
					<div class="w-5/6 lg:w-3/6 flex flex-col items-end">
						<div
							v-if="
								displayNotifications && Object.keys(notifications).length > 0
							"
							class="bg-amber-50 relative z-20 w-1/2"
						>
							<div
								class="w-full overflow-y-auto h-[calc(100dvh-20dvh)] text-black font-normal 2xl:text-base"
							>
								<div
									class="flex flex-col border-2 border-amber-50"
									v-for="(notification, index) in notifications"
									:key="index"
								>
									<section
										:class="`${!notification.readStatus ? 'bg-gray-300' : 'bg-amber-50'} p-1 flex flex-row`"
									>
										<span v-html="notification.message"></span>
										<img
											class="cursor-pointer"
											:src="notification.readStatus ? GreyTick : BlueTick"
											alt="Read Status"
											:aria-labelledby="
												notification.readStatus
													? 'Notification is read'
													: 'Notification is not read'
											"
											@click="
												toggleNotificationReadStatusFunction(
													notification.readStatus, //
													index as unknown as number,
												)
											"
										/>
									</section>
								</div>
							</div>
							<button
								@click="toggleNotificationReadStatusFunction(false)"
								class="rounded-none bg-gray-50 text-black w-full cursor-pointer active:bg-gray-300 border-t-1 border-t-black 2xl:text-base"
							>
								Dismiss All
							</button>
						</div>
					</div>
				</section>
			</div>
		</nav>
	</header>
	<body>
		<div
			class="font-krub text-sm lg:text-base min-h-dvh bg-[url('/stars.webp')] bg-repeat bg-[length:300px_300px]"
			id="home-container"
		>
			<slot :toggleBg="toggleBackgroundColor" />
		</div>
	</body>
</template>
