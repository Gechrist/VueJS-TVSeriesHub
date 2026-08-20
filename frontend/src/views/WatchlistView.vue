<script setup lang="ts">
	import { useRouter } from "vue-router";
	import { ref, onMounted, inject } from "vue";
	import { Carousel, Slide, Navigation } from "vue3-carousel";
	import { toast } from "vue3-toastify";
	import Close from "/close.svg";
	import LoadingIcon from "/loadingicon.svg";
	import BaseLayout from "../layouts/BaseLayout.vue";

	const carouselConfig = {
		itemsToShow: "auto",
		wrapAround: false,
		autoplay: 0,
		dir: "ttb" as const,
		gap: 4,
		breakpoints: {
			1024: {
				gap: 40,
			},
			1440: {
				gap: 50,
			},
			1536: {
				gap: 60,
			},
		},
		mouseDrag: true,
		touchDrag: true,
		slideEffect: "slide" as const,
		snapAlign: "start" as const,
	};

	const apiUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";
	const editedFeaturedNetworks = ref<Array<string>>([]);
	const router = useRouter();
	const userInfo = localStorage.getItem("userInfo");
	const userWatchlistData = ref<Array<any>>([]);
	const networks = ref<Array<string>>([]);
	const showNetworks = ref<boolean>(false);
	const networkWarningMessage = ref<string>("");
	const watchlistWarningMessage = ref<string>("");
	let localStorageUserFeaturedNetworks = localStorage.getItem(
		"userFeaturedNetworks",
	)
		? JSON.parse(localStorage.getItem("userFeaturedNetworks") as string)
		: [];
	let localStorageUserWatchlist = localStorage.getItem("userWatchlist")
		? JSON.parse(localStorage.getItem("userWatchlist") as string)
		: [];
	// const userInfo = ref<string | null>("");

	// edit user data
	const getNotifications = inject("getNotifications", () => {}) as Function;

	const editFeaturedNetworksFunction = async () => {
		if (!userInfo) {
			router.push("/auth");
			return;
		}
		try {
			const response = await fetch(`${apiUrl}/savefeaturednetworks`, {
				signal: AbortSignal.timeout(7000),
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					networks: editedFeaturedNetworks.value,
					userEmail: userInfo,
				}),
			});
			const data = await response.json();
			if (data.error) {
				toast.error(data.error);
				return;
			}
			if (data) {
				editedFeaturedNetworks.value = data.featuredNetworks;
				localStorage.setItem(
					"userFeaturedNetworks",
					JSON.stringify(data.featuredNetworks),
				);
				toast.success("Featured networks updated successfully");
			}
		} catch (e: any) {
			toast.error("Error removing network from featured networks");
			console.error("Error removing network from featured networks:", e);
			return;
		}
	};
	const displaySummary = ref<boolean>(false);
	const showSummaryId = ref<number | null>(null);

	const displaySummaryFunction = (showId: number) => {
		if (displaySummary.value && showSummaryId.value === showId) {
			displaySummary.value = false;
			showSummaryId.value = null;
			return;
		}
		displaySummary.value = true;
		showSummaryId.value = showId;
	};
	const getUserWatchlistDataFunction = async () => {
		if (userInfo) {
			try {
				const response = await fetch(
					`${apiUrl}/getwatchlistshows?shows=${localStorageUserWatchlist}`,
					{
						signal: AbortSignal.timeout(7000),
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					},
				);
				let data = await response.json();
				if (data.warning) {
					watchlistWarningMessage.value = data.warning;
					return;
				}
				userWatchlistData.value = [...data];
			} catch (e: any) {
				watchlistWarningMessage.value =
					"Failed to fetch watchlist data. Please try again later";
				console.error("Error fetching watchlist data:", e);
			}
		}
	};

	const getNetworksFunction = async () => {
		try {
			const response = await fetch(`${apiUrl}/getnetworks`, {
				signal: AbortSignal.timeout(7000),
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			if (data.warning) {
				networkWarningMessage.value = data.warning;
				return;
			}
			networks.value = data;
		} catch (e: any) {
			networkWarningMessage.value = "Error fetching networks";
			console.error("Error fetching networks:", e);
		}
	};

	const removeNetworksFromFeaturedFunction = (network: string) => {
		editedFeaturedNetworks.value = editedFeaturedNetworks.value.filter(
			(n) => n !== network,
		);
	};

	const removeshowFromWatchlistFunction = async (
		showId: number,
		showName: string,
	) => {
		try {
			const response = await fetch(`${apiUrl}/removefromwatchlist`, {
				signal: AbortSignal.timeout(7000),
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					showId: showId,
					showName: showName,
					userEmail: userInfo,
				}),
			});
			const data = await response.json();
			if (data.error) {
				toast.error(data.error);
				console.error("Error removing show from watchlist:", data.error);
				return;
			}
			//remove shows
			userWatchlistData.value = userWatchlistData.value
				.map((data) => ({
					...data,
					shows: data.shows.filter((show: any) => show.tvMazeId !== showId),
				}))
				.filter((data) => data.shows.length > 0);
			if (userWatchlistData.value.length === 0) {
				watchlistWarningMessage.value = "Your watchlist is empty";
				localStorage.setItem("userWatchlist", JSON.stringify([]));
				localStorageUserWatchlist = localStorage.getItem("userWatchlist")
					? JSON.parse(localStorage.getItem("userWatchlist") as string)
					: [];
			}
			localStorage.setItem(
				"userWatchlist",
				JSON.stringify(
					localStorageUserWatchlist.filter((id: number) => id !== showId),
				),
			);
			localStorageUserWatchlist = localStorage.getItem("userWatchlist")
				? JSON.parse(localStorage.getItem("userWatchlist") as string)
				: [];

			getNotifications(userInfo);
		} catch (e: any) {
			toast.error("Failed to update the watchlist");
			console.error("Error removing show from watchlist:", e);
		}
	};

	onMounted(() => {
		editedFeaturedNetworks.value = localStorageUserFeaturedNetworks;
		if (localStorageUserWatchlist.length) {
			getUserWatchlistDataFunction();
		} else {
			watchlistWarningMessage.value = "Your watchlist is empty";
		}
		getNetworksFunction();
	});
</script>

<style scoped>
	:deep(.carousel__viewport) {
		padding: 0px !important;
	}
</style>

<template>
	<BaseLayout>
		<div
			class="absolute mt-10 bg-[url('/stars.webp')] bg-repeat bg-[length:300px_300px] w-full h-auto"
		>
			<div
				class="mt-20 2xl:mt-38 font-bold text-xl md:text-2xl flex flex-row w-full pl-2"
			>
				<h2 v-if="showNetworks" class="w-1/2 flex flex-row justify-start">
					Featured Networks
				</h2>
				<h2 v-else class="w-1/2 flex flex-row justify-start">Watchlist</h2>
				<div
					class="w-1/2 flex flex-col gap-0.5 text-white font-normal text-xs lg:text-base 2xl:text-xl items-end mr-1 2xl:mr-5"
				>
					<aside
						@click="showNetworks = true"
						class="ribbon text-center cursor-pointer w-auto`"
					>
						Featured Networks
					</aside>
					<aside
						@click="showNetworks = false"
						:class="`${!showNetworks ? 'w-[160px] lg:w-[200px] 2xl:w-[290px]' : ' w-auto'}  ribbon text-center cursor-pointer`"
					>
						Watchlist
					</aside>
				</div>
			</div>
			<div v-if="showNetworks" class="w-full flex flex-wrap xl:gap-4 flex-row">
				<div
					v-if="networks.length === 0 && !networkWarningMessage"
					class="h-dvh flex flex-row w-full justify-center items-start"
				>
					<img class="w-[40px]" :src="LoadingIcon" alt="Loading..." />
				</div>
				<div
					v-if="networkWarningMessage"
					class="text-white mt-20 lg:mt-32 2xl:mt-40 flex flex-row w-full justify-center items-start text-xs lg:text-3xl"
				>
					<p>{{ networkWarningMessage }}</p>
				</div>
				<div
					v-else
					class="p-2"
					v-for="network in editedFeaturedNetworks"
					:key="network"
				>
					<div
						class="w-auto flex flex-row p-2 gap-0.5 md:gap-2 bg-red-600 rounded-4xl h-auto flex-nowrap"
					>
						<p class="text-white text-xs md:text-base 2xl:text-xl w-auto">
							{{ network }}
						</p>
						<img
							class="cursor-pointer w-[15px] md:w-[20px]"
							:src="Close"
							@click="removeNetworksFromFeaturedFunction(network)"
						/>
					</div>
				</div>
			</div>
			<div
				v-if="showNetworks"
				class="w-full p-4 mt-2 lg:mt-4 2xl:mt-8 overflow-y-auto no-scrollbar h-[250px] md:h-[400px] xl:h-[450px] 2xl:h-[550px]"
			>
				<div
					class="w-full grid md:grid-cols-3 xl:grid-cols-4 gap-4 justify-center"
				>
					<div
						v-for="network in networks"
						:key="network"
						class="flex w-full flex-row items-baseline gap-2"
					>
						<h2 class="lg:text-base 2xl:text-xl">{{ network }}</h2>
						<input
							type="checkbox"
							class="accent-red-600"
							:checked="localStorageUserFeaturedNetworks.includes(network)"
							v-model="editedFeaturedNetworks"
							:value="network"
						/>
					</div>
				</div>
			</div>
			<div
				v-if="showNetworks"
				class="w-full flex justify-center mt-4 2xl:mt-8 mb-2"
			>
				<button
					v-if="!networkWarningMessage"
					class="w-[133px] cursor-pointer"
					@click="editFeaturedNetworksFunction"
				>
					Save
				</button>
			</div>
			<div v-else class="w-full mt-2 lg:mt-4 2xl:mt-8">
				<div
					v-if="watchlistWarningMessage"
					class="text-white mt-20 lg:mt-32 2xl:mt-40 flex flex-row w-full justify-center items-start text-xs lg:text-3xl"
				>
					<p>{{ watchlistWarningMessage }}</p>
				</div>
				<div
					v-if="
						localStorageUserWatchlist.length !== 0 &&
						userWatchlistData.length === 0 &&
						!watchlistWarningMessage
					"
					class="h-dvh flex flex-row w-full justify-center items-start"
				>
					<img class="w-[40px]" :src="LoadingIcon" alt="Loading..." />
				</div>
				<div
					v-else
					v-for="data in userWatchlistData"
					:key="data.index"
					class="flex flex-col w-full"
				>
					<h2 class="mt-4 text-2xl">{{ data.network.name }}</h2>
					<Carousel v-bind="carouselConfig">
						<Slide
							v-for="show in data.shows"
							:key="show.name"
							class="px-1 w-full flex flex-row z-0 h-auto gap-2 items-center text-white py-1 lg:border-0"
						>
							<section class="w-1/5 flex flex-col gap-2 items-center">
								<img
									class="w-auto rounded shadow-gray-400 shadow-sm h-[100px] lg:h-[150px] 2xl:h-[200px]"
									:src="
										show.image
											? show.image.original
											: '/no-image-available.webp'
									"
									:alt="show.name"
								/>
								<p class="2xl:text-2xl text-wrap w-auto">
									{{
										show.name.length > 20
											? show.name.slice(0, 30) + "..."
											: show.name
									}}
								</p>
								<p
									class="text-amber-400 cursor-pointer md:hidden"
									@click="displaySummaryFunction(show.tvMazeId)"
								>
									Summary
								</p>
							</section>
							<section
								class="w-3/5 flex text-white flex-col gap-1 items-center"
							>
								<div
									class="w-full flex text-white flex-row flex-wrap gap-1 2xl:gap-4 text-xs xl:text-base justify-center"
								>
									<div
										class="w-auto p-1 2xl:p-4 bg-blue-900 rounded-full h-10 flex flex-row justify-center items-center"
									>
										<p>{{ show.language }}</p>
									</div>
									<div
										v-if="show.genres.length > 0"
										class="w-auto p-1 2xl:p-4 bg-blue-900 rounded-full h-10 flex flex-row justify-center items-center"
									>
										<p>
											{{
												JSON.stringify(show.genres).replace(
													/[\[\]"]|,(?!\s)/g,
													(m) => (m === "," ? ", " : ""),
												)
											}}
										</p>
									</div>
									<div
										class="w-auto p-1 2xl:p-4 bg-blue-900 rounded-full h-10 flex flex-row justify-center items-center"
									>
										<p>{{ show.premiered.slice(0, 4) }}</p>
									</div>
									<div
										v-if="show.rating && show.rating.average"
										class="h-10 p-4 flex flex-row justify-center items-center bg-blue-900 rounded-full"
									>
										<p>{{ show.rating.average }}</p>
									</div>

									<div
										class="w-auto p-1 2xl:p-4 bg-blue-900 rounded-full 2xl:h-10 flex flex-row justify-center items-center"
										v-if="
											show.runtime && show.runtime !== 'No runtime available'
										"
									>
										<p class="">{{ show.runtime }} min</p>
									</div>
									<div
										class="w-auto p-1 2xl:p-4 bg-blue-900 rounded-full 2xl:h-10 flex flex-row justify-center items-center"
									>
										<p class="px-1 2xl:p-0">{{ show.status }}</p>
									</div>
								</div>
								<div
									:class="`w-full h-full flex flex-row absolute top-0 z-50 bg-blue-900 ${displaySummary && showSummaryId === show.tvMazeId ? 'block p-1' : 'hidden'} md:block md:relative md:bg-transparent gap-1 text-xs xl:text-base  text-justify grow`"
								>
									<div class="w-full grow p-1 h-auto overflow-y-auto">
										<span v-html="show.summary"></span>
									</div>
									<div
										class="w-[30px] grow flex flex-col items-start md:hidden"
									>
										<img
											class="cursor-pointer w-[30px]"
											@click="displaySummaryFunction(show.tvMazeId)"
											:src="Close"
											alt="Close Show Summary"
											aria-labelledby="Close Show Summary"
										/>
									</div>
								</div>
							</section>

							<section
								class="w-auto flex flex-row justify-center ml-1 mr-0.5 xl:ml-4 2xl:ml-8"
							>
								<button
									@click="
										removeshowFromWatchlistFunction(show.tvMazeId, show.name)
									"
									class="bg-red-600 active:bg-red-900 cursor-pointer text-xs p-2 2xl:p-4 xl:text-base"
								>
									Remove
								</button>
							</section>
						</Slide>
						<template #addons>
							<Navigation />
						</template>
					</Carousel>
				</div>
			</div>
		</div>
	</BaseLayout>
</template>
