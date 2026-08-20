<script setup lang="ts">
	import { ref, onMounted, inject } from "vue";
	import { Carousel, Slide } from "vue3-carousel";
	import { toast } from "vue3-toastify";
	import Netflix from "/netflix.svg";
	import Hulu from "/hulu.svg";
	import HBO from "/hbo.svg";
	import PrimeVideo from "/amazon-prime.svg";
	import AppleTv from "/apple-tv.svg";
	import ParamountPlus from "/paramount+.svg";
	import DisneyPlus from "/disney+.svg";
	import BBC from "/bbc.svg";
	import SkyAtlantic from "/sky-atlantic.svg";
	import MovistarPlus from "/movistar.svg";
	import * as Session from "supertokens-web-js/recipe/session";
	import BaseLayout from "../layouts/BaseLayout.vue";
	import "vue3-carousel/carousel.css";

	// Define reactive variables
	const doesSessionExist = ref(false);
	const userData = ref<any>(null);

	const apiUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

	const networkLogos: Array<string> = [
		AppleTv,
		BBC,
		DisneyPlus,
		HBO,
		Hulu,
		MovistarPlus,
		Netflix,
		ParamountPlus,
		PrimeVideo,
		SkyAtlantic,
	];

	const carouselConfig = {
		itemsToShow: 1,
		wrapAround: true,
		autoplay: 4000,
		dir: "ttb" as const,
		slideEffect: "fade" as const,
	};

	const getUserDataFunction = async (userInfo: string) => {
		if (userInfo) {
			localStorage.setItem("userInfo", userInfo);
			const getUserData = await fetch(
				`${apiUrl}/getuserdata?email=${userInfo}`,
				{
					signal: AbortSignal.timeout(7000),
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
			userData.value = await getUserData.json();
			localStorage.setItem(
				"userWatchlist",
				JSON.stringify(userData.value.watchlist),
			);
			localStorage.setItem(
				"userFeaturedNetworks",
				JSON.stringify(userData.value.featuredNetworks),
			);
		}
	};
	const getNotifications = inject("getNotifications", () => {}) as Function;

	onMounted(async () => {
		if (userData.value) {
			return;
		}
		doesSessionExist.value = await Session.doesSessionExist();
		if (doesSessionExist.value) {
			try {
				const userEmailData = await fetch(apiUrl + "/useremailasid", {
					signal: AbortSignal.timeout(7000),
					method: "GET",
					credentials: "include",
				});
				const userEmail = await userEmailData.text();
				await getUserDataFunction(userEmail);
				getNotifications(userEmail);
			} catch (error) {
				toast.error("Error fetching user data. Please try again later.");
				console.error("Error fetching user data:", error);
			}
		} else {
			console.log("No active session found.");
		}
	});
</script>

<template>
	<BaseLayout>
		<section
			class="flex flex-col justify-center gap-0 md:gap-1 lg:md-10 bg-[url(/TVsmall.jpg)] md:bg-[url(/TV.jpg)] bg-cover bg-center w-full h-dvh"
		>
			<div
				class="text-white w-full flex flex-col justify-center items-center md:gap-2"
			>
				<div>
					<Carousel class="-mt-18" v-bind="carouselConfig">
						<Slide v-for="logo in networkLogos" :key="logo">
							<img
								class="w-auto h-[50px] md:h-[75px] xl:h-[100px]"
								:src="logo"
							/>
						</Slide>
					</Carousel>
				</div>
				<div class="w-3/4 md:w-full flex justify-center">
					<h2
						class="text-white text-center md:text-[15px] lg:text-[20px] 2xl:text-[30px] animate-flash"
					>
						Track every TV show on every platform at one place
					</h2>
				</div>
			</div>
		</section>
	</BaseLayout>
</template>
