<script setup lang="ts">
	import {
		ref,
		onMounted,
		Ref,
		onBeforeUnmount,
		nextTick,
		onUpdated,
		inject,
	} from "vue";
	import { useRouter } from "vue-router";
	import { toast } from "vue3-toastify";
	import VueSlider from "vue-3-slider-component";
	import BaseLayout from "../layouts/BaseLayout.vue";
	import NetworkShow from "../components/NetworkShowsComponent.vue";
	import FilterCheckboxComponent from "../components/FilterCheckboxComponent.vue";
	import LoadingIcon from "/loadingicon.svg";
	import TopArrow from "/topArrow.svg";
	import SortArrow from "/sort-arrow.svg";
	import Search from "/search.svg";
	import Filters from "/filters.svg";
	import Close from "/close.svg";

	const apiUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:3001";
	const router = useRouter();

	const enableButton = ref<boolean>(true);
	const data: Array<any> | Ref<any> = ref([]);
	const dataForFiltersArray: Ref<any> = ref({});
	let limit: number = 3;
	const list = ref(null);
	const loadMoreStatus = ref("idle");
	let networkList = "popular";
	let warning = ref<string>("");
	let backgroundColor = ref<boolean>(false);
	let sortOrder = ref<string>("asc");
	let searchTextBox = ref<string>("");
	let showSearch = ref<boolean>(false);
	let showFilters = ref<boolean>(false);
	let resultsForSearchOnDisplay = ref<boolean>(false);
	let resultsForFiltersOnDisplay = ref<boolean>(false);
	let userDataAvailable = ref<boolean>(false);
	let displayTooShortSearchTerm = ref<boolean>(false);
	let vertScrollbarTrue = ref<boolean>(true);
	const showShowsWithoutRating = ref<boolean>(true);
	const ratingToFilterFor = ref<Array<number>>([0.0, 10.0]);
	const runtimeToFilterFor = ref<Array<number>>([0, 120]);
	const genresToFilterFor = ref<Array<any>>([]);
	const networksToFilterFor = ref<Array<any>>([]);
	const languagesToFilterFor = ref<Array<any>>([]);
	const statusToFilterFor = ref<Array<any>>([]);
	const vueSliderWidth = ref<number>(0);
	const vueSliderFontSize = ref<string>("12px");
	const userInfo = localStorage.getItem("userInfo");

	let userData = ref<{
		watchlist: Array<number>;
		featuredNetworks: Array<string>;
	}>({ watchlist: [], featuredNetworks: [] });
	let localStorageUserFeaturedNetworks = localStorage.getItem(
		"userFeaturedNetworks",
	)
		? JSON.parse(localStorage.getItem("userFeaturedNetworks") as string)
		: [];
	let localStorageUserWatchlist = localStorage.getItem("userWatchlist")
		? JSON.parse(localStorage.getItem("userWatchlist") as string)
		: [];

	//sort order function
	const sortOrderFunction = () => {
		if (!data.value) {
			return;
		}
		limit = 3;
		data.value = [];
		loadMoreStatus.value = "loading";
		sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
		if (resultsForFiltersOnDisplay.value || userDataAvailable.value) {
			getResultsForFiltersFunction(
				resultsForFiltersOnDisplay.value
					? true
					: userDataAvailable.value
						? false
						: true,
			);
			return;
		}
		if (searchTextBox.value) {
			getSearchResultsFunction(searchTextBox.value);
			return;
		}
		loadData(networkList, sortOrder.value);
	};

	//show filter section function
	const filtersFunction = () => {
		showFilters.value = !showFilters.value;
		if (showFilters.value) {
			backgroundColor.value = true;
		} else if (window.scrollY > 50) {
			return;
		} else {
			backgroundColor.value = false;
		}
	};

	// search box function
	const searchFunction = () => {
		// check for minimum 3 characters
		if (
			searchTextBox.value &&
			searchTextBox.value.length < 3 &&
			showSearch.value
		) {
			displayTooShortSearchTerm.value = true;
			return;
		}

		// clear search results when deleting search term
		if (resultsForSearchOnDisplay.value && !searchTextBox.value) {
			resultsForSearchOnDisplay.value = false;
			limit = 3;
			data.value = [];
			loadMoreStatus.value = "loading";
			loadData(networkList);
			nextTick(() => {
				vertScrollbarTrue.value =
					window.innerWidth - document.documentElement.clientWidth > 0;
			});
		}
		warning.value = "";
		// perform search
		if (searchTextBox.value) {
			displayTooShortSearchTerm.value = false;
			loadMoreStatus.value = "loading";
			limit = 3;
			data.value = [];
			getSearchResultsFunction(searchTextBox.value);
		} else {
			displayTooShortSearchTerm.value = false;
			showSearch.value = !showSearch.value;
		}
	};

	//get search results function
	const getSearchResultsFunction = async (searchTerm: string) => {
		resultsForSearchOnDisplay.value = true;
		loadMoreStatus.value = "loading";
		try {
			const response = await fetch(
				`${apiUrl}/searchshows?limit=${limit}&searchterm=${searchTerm}&sortOrder=${sortOrder.value}`,
				{
					signal: AbortSignal.timeout(7000),
					method: "GET",
					headers: {
						"Content-Type": "application)/json",
					},
				},
			);
			const searchData: any = await response.json();
			if (searchData.warning) {
				data.value = [];
				warning.value = searchData.warning;
				loadMoreStatus.value = "no-more";
				nextTick(() => {
					vertScrollbarTrue.value =
						window.innerWidth - document.documentElement.clientWidth > 0;
				});
				return;
			}
			data.value.push(...searchData);
			loadMoreStatus.value = searchData.length < 3 ? "no-more" : "idle";
			limit += 3;
			nextTick(() => {
				vertScrollbarTrue.value =
					window.innerWidth - document.documentElement.clientWidth > 0;
			});
		} catch (e: any) {
			warning.value = "Failed to fetch search results. Please try again later";
		}
	};

	// initiate filters function
	const initiateFilterFunction = () => {
		showFilters.value = false;
		backgroundColor.value = false;

		if (
			networksToFilterFor.value.length !== 0 ||
			genresToFilterFor.value.length !== 0 ||
			statusToFilterFor.value.length !== 0 ||
			languagesToFilterFor.value.length !== 0 ||
			ratingToFilterFor.value[0] !== 0.0 ||
			ratingToFilterFor.value[1] !== 10.0 ||
			runtimeToFilterFor.value[0] !== 0 ||
			runtimeToFilterFor.value[1] !== 120 ||
			!showShowsWithoutRating.value
		) {
			data.value = [];
			limit = 3;
			loadMoreStatus.value = "loading";
			warning.value = "";
			getResultsForFiltersFunction(true);
		}
	};

	//get results for filters function
	const getResultsForFiltersFunction = async (showFilterResults: boolean) => {
		loadMoreStatus.value = "loading";
		if (showFilterResults) {
			resultsForFiltersOnDisplay.value = true;
		}
		try {
			const response = await fetch(
				`${apiUrl}/getshowsbyfilters?limit=${limit}&sortOrder=${sortOrder.value}&rating=${ratingToFilterFor.value}&unratedShows=${showShowsWithoutRating.value}&runtime=${runtimeToFilterFor.value}&networks=${encodeURIComponent(networksToFilterFor.value as unknown as string)}&genres=${encodeURIComponent(genresToFilterFor.value as unknown as string)}&status=${encodeURIComponent(statusToFilterFor.value as unknown as string)}&languages=${encodeURIComponent(languagesToFilterFor.value as unknown as string)}`,
				{
					signal: AbortSignal.timeout(7000),
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
			const filteredData: any = await response.json();
			if (filteredData.warning) {
				data.value = [];
				warning.value = filteredData.warning;
				loadMoreStatus.value = "no-more";
				``;
				nextTick(() => {
					vertScrollbarTrue.value =
						window.innerWidth - document.documentElement.clientWidth > 0;
				});
				return;
			}
			data.value.push(...filteredData);
			loadMoreStatus.value = filteredData.length < 3 ? "no-more" : "idle";
			limit += 3;
			nextTick(() => {
				vertScrollbarTrue.value =
					window.innerWidth - document.documentElement.clientWidth > 0;
			});
		} catch (e) {
			warning.value =
				"Failed to fetch filtered results. Please try again later";
		}
	};

	// get data for filter function
	const getFilterDataFunction = async () => {
		try {
			const response = await fetch(`${apiUrl}/getfilterdata`, {
				signal: AbortSignal.timeout(7000),
				method: "GET",
				headers: {
					"Content-Type": "application)/json",
				},
			});
			const dataFilter: any = await response.json();
			if (dataFilter.error) {
				warning.value = dataFilter.error;
				console.error("Failed to fetch filter data:\n" + dataFilter.error);
				return [];
			}
			dataForFiltersArray.value = { ...dataFilter };
		} catch (e) {
			warning.value = "Failed to fetch filter data. Please try again later";
			console.error("Failed to fetch filter data:\n" + e);
			return [];
		}
	};

	//clear search or filters results function
	const clearSearchOrFiltersResultsFunction = () => {
		data.value = [];
		limit = 3;
		if (userDataAvailable.value) {
			getResultsForFiltersFunction(false);
		} else {
			loadData(networkList);
			loadMoreStatus.value = "loading";
		}
		resultsForSearchOnDisplay.value = false;
		resultsForFiltersOnDisplay.value = false;
		searchTextBox.value = "";
		showSearch.value = false;
		clearFilterFields();
	};

	//clear filter fields function
	const clearFilterFields = () => {
		networksToFilterFor.value = [];
		genresToFilterFor.value = [];
		statusToFilterFor.value = [];
		showShowsWithoutRating.value = true;
		languagesToFilterFor.value = [];
		ratingToFilterFor.value = [0.0, 10.0];
		runtimeToFilterFor.value = [0, 120];
	};

	//show all networks function
	const showAll = () => {
		data.value = [];
		limit = 3;
		userDataAvailable.value = false;
		networkList = "all";
		loadData(networkList);
		loadMoreStatus.value = "loading";
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	//load initial data function
	const loadData = async (networkList: string, sortOrder?: string) => {
		try {
			const response = await fetch(
				`${apiUrl}/getshowsbynetwork?limit=${limit}&networklist=${networkList}&sortorder=${sortOrder}`,
				{
					signal: AbortSignal.timeout(7000),
					method: "GET",
					headers: {
						"Content-Type": "application)/json",
					},
				},
			);
			const newData: Array<any> = await response.json();
			data.value.push(...newData);
			loadMoreStatus.value = newData.length < 3 ? "no-more" : "idle";
			limit += 3;
			nextTick(() => {
				vertScrollbarTrue.value =
					window.innerWidth - document.documentElement.clientWidth > 0;
			});
		} catch (error) {
			warning.value = "Failed to fetch data. Please try again later.";
			loadMoreStatus.value = "no-more";
			console.error("Failed to fetch data:\n" + error);
		}
	};

	// VueSlider values for different screen sizes
	const resizeValuesForRatingRuntimeSlider = () => {
		if (window.innerWidth >= 1536) {
			vueSliderWidth.value = 600;
		} else if (window.innerWidth >= 1024) {
			vueSliderWidth.value = 300;
			vueSliderFontSize.value = "16px";
		} else {
			vueSliderWidth.value = 200;
			vueSliderFontSize.value = "12px";
		}
	};

	//scroll to top function
	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// edit user data
	const getNotifications = inject("getNotifications", () => {}) as Function;

	const editWatchlist = async (
		isInWatchlist: boolean,
		showId: number,
		showName: string,
		previousEpisode: string,
		nextEpisode: string,
		status: string,
	) => {
		enableButton.value = false;
		if (!userInfo) {
			router.push("/auth");
			return;
		}
		if (isInWatchlist) {
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
					console.log("Error removing show from watchlist:", data);
					return;
				}
				userData.value.watchlist = data.watchlist;
				localStorage.setItem(
					"userWatchlist",
					JSON.stringify(userData.value.watchlist),
				);
				getNotifications(userInfo);
				enableButton.value = true;
			} catch (e: any) {
				enableButton.value = true;
				toast.error("Failed to update the watchlist");
				console.error("Error removing show from watchlist:", e);
			}
		} else {
			try {
				const response = await fetch(`${apiUrl}/addtowatchlist`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						showId: showId,
						showName: showName,
						userEmail: userInfo,
						previousEpisode: previousEpisode,
						nextEpisode: nextEpisode,
						status: status,
					}),
				});
				const data = await response.json();
				if (data.error) {
					toast.error(data.error);
					console.error("Error adding show to watchlist:", data.error);
					return;
				}
				userData.value.watchlist = data.watchlist;
				localStorage.setItem(
					"userWatchlist",
					JSON.stringify(userData.value.watchlist),
				);
				getNotifications(userInfo);
				enableButton.value = true;
			} catch (e: any) {
				enableButton.value = true;

				toast.error("Failed to update watchlist");
				console.error("Error adding show to watchlist:", e);
			}
		}
		localStorageUserWatchlist = localStorage.getItem("userWatchlist");
	};

	onMounted(async () => {
		// get user data
		userData.value = {
			watchlist: localStorageUserWatchlist,
			featuredNetworks: localStorageUserFeaturedNetworks,
		};
		if (userData.value.featuredNetworks.length) {
			userDataAvailable.value = true;
			networksToFilterFor.value = userData.value.featuredNetworks;
		}
		// get data for filters
		getFilterDataFunction();
		resizeValuesForRatingRuntimeSlider();
		window.addEventListener("resize", resizeValuesForRatingRuntimeSlider);
		//listen for reaching the bottom of the page
		let scrollCb;
		window.addEventListener(
			"scroll",
			(scrollCb = async () => {
				if (window.scrollY > 50 || showFilters.value) {
					backgroundColor.value = true;
				} else if (window.scrollY <= 50) {
					backgroundColor.value = showFilters.value;
				}
				if (
					loadMoreStatus.value == "idle" &&
					(list!.value! as HTMLUListElement)?.getBoundingClientRect().bottom <
						window.innerHeight
				) {
					if (resultsForFiltersOnDisplay.value || userDataAvailable.value) {
						getResultsForFiltersFunction(
							resultsForFiltersOnDisplay.value
								? true
								: userDataAvailable.value
									? false
									: true,
						);
					} else if (resultsForSearchOnDisplay.value) {
						getSearchResultsFunction(searchTextBox.value);
					} else {
						loadMoreStatus.value = "loading";
						loadData(networkList);
					}
				}
			}),
		);
		scrollCb();
	});

	onBeforeUnmount(() => {
		window.removeEventListener("scroll", () => {});
		window.removeEventListener("resize", resizeValuesForRatingRuntimeSlider);
	});

	onUpdated(() => {
		nextTick(() => {
			vertScrollbarTrue.value =
				window.innerWidth - document.documentElement.clientWidth > 0;
		});
	});
</script>

<template>
	<BaseLayout>
		<template #default="{ toggleBg }">
			<section class="w-full">
				<div class="flex flex-col text-white" ref="list">
					<div
						:class="`${backgroundColor && 'bg-amber-600'} mt-22 fixed h-auto w-full pb-2 lg:pb-4 2xl:pt-2 md:pl-3 z-5 flex flex-col`"
					>
						<div class="flex flex-row justify-center gap-2">
							<div>
								<img
									@click="
										() => {
											filtersFunction();
											toggleBg(showFilters);
										}
									"
									class="w-[20px] lg:w-[30px] cursor-pointer"
									:src="Filters"
									alt="Display filters"
									aria-labelledby="Display filters"
								/>
							</div>
							<div @click="sortOrderFunction">
								<img
									class="w-[20px] lg:w-[25px] relative top-1 cursor-pointer"
									:src="SortArrow"
									alt="Sort networks in ascending or descending order"
									aria-labelledby="Sort networks in ascending or descending order"
								/>
							</div>
							<div class="flex flex-col gap-2 lg:flex-row lg:gap-8">
								<div class="flex flex-row gap-2">
									<input
										v-model="searchTextBox"
										:class="`${showSearch ? '' : 'hidden'} bg-white rounded px-2 2xl:text-base text-black italic 2xl:w-[400px]`"
										placeholder="Search..."
										@keyup.enter="searchFunction"
										@keyup.escape="clearSearchOrFiltersResultsFunction"
									/><img
										@click="searchFunction"
										class="w-[20px] lg:w-[30px] cursor-pointer"
										:src="Search"
										aria-labelledby="Search for shows"
										alt="Search for shows"
									/>
								</div>
								<div
									v-if="displayTooShortSearchTerm"
									class="text-white w-full italic self-center text-sm lg:text-base"
								>
									The search query is too short
								</div>
							</div>
							<div
								v-if="resultsForSearchOnDisplay || resultsForFiltersOnDisplay"
							>
								<img
									@click="clearSearchOrFiltersResultsFunction"
									class="w-[20px] lg:w-[30px] cursor-pointer"
									:src="Close"
									alt="clear search or filter results"
									aria-labelledby="clear search or filter results"
								/>
							</div>
						</div>
						<div
							v-if="showFilters"
							class="w-full p-2 mt-2 lg:mt-4 2xl:mt-8 overflow-y-auto no-scrollbar h-[450px] 2xl:h-auto"
						>
							<div class="w-full flex flex-col gap-4 justify-center">
								<div
									v-for="category in [
										'Genres',
										'Language',
										'Networks',
										'Status',
									]"
									class="flex flex-col gap-2"
								>
									<FilterCheckboxComponent
										v-model:networks="networksToFilterFor"
										v-model:genres="genresToFilterFor"
										v-model:status="statusToFilterFor"
										v-model:languages="languagesToFilterFor"
										:category="category"
										:data="dataForFiltersArray"
									/>
								</div>
								<div class="flex flex-col mt-4 gap-6 w-full justify-around">
									<span class="flex flex-row justify-start items-baseline gap-2"
										><h2 class="2xl:text-base">
											Include shows with no rating?
										</h2>
										<input type="checkbox" v-model="showShowsWithoutRating"
									/></span>
									<div
										class="flex flex-row justify-start items-center gap-2 xl:gap-12"
									>
										<h2 class="2xl:text-base">Rating:</h2>
										<VueSlider
											v-model="ratingToFilterFor"
											tooltip="always"
											:tooltipStyle="{
												backgroundColor: '#1E3A8A',
												fontSize: vueSliderFontSize,
											}"
											:processStyle="{ backgroundColor: '#1E3A8A' }"
											:width="vueSliderWidth"
											:min="0"
											:max="10"
											:interval="0.1"
										></VueSlider>
									</div>
									<div
										class="flex flex-row justify-start items-center gap-2 xl:gap-18"
									>
										<h2 class="2xl:text-base">Runtime:</h2>
										<VueSlider
											v-model="runtimeToFilterFor"
											tooltip="always"
											:tooltipStyle="{
												backgroundColor: '#1E3A8A',
												fontSize: vueSliderFontSize,
											}"
											:processStyle="{ backgroundColor: '#1E3A8A' }"
											:width="vueSliderWidth"
											:min="0"
											:max="120"
											:tooltip-formatter="`${runtimeToFilterFor} min`"
										></VueSlider>
									</div>
								</div>
							</div>
							<div
								class="w-full flex flex-row gap-2 2xl:gap-4 mt-4 justify-center"
							>
								<button
									@click="
										() => {
											initiateFilterFunction();
											toggleBg(showFilters);
										}
									"
									class="bg-blue-900 cursor-pointer w-[133px] 2xl:w-[277px] active:bg-blue-700 2xl:text-base"
								>
									Apply Filters</button
								><button
									@click="clearFilterFields"
									class="bg-red-900 cursor-pointer active:bg-red-700 w-[133px] 2xl:w-[277px] 2xl:text-base"
								>
									Clear Filter Fields
								</button>
							</div>
						</div>
					</div>
					<div
						v-if="!data.length && loadMoreStatus === 'loading'"
						class="h-dvh flex flex-row w-full justify-center"
					>
						<img class="w-[40px]" :src="LoadingIcon" alt="Loading..." />
					</div>
					<div
						v-if="data.length"
						class="mt-22 lg:mt-32 px-2 flex flex-col gap-0"
						v-for="networkShows in data"
					>
						<NetworkShow
							v-if="networkShows?.shows?.length"
							:network="networkShows.network"
							:shows="networkShows.shows"
							:userWatchlist="userData.watchlist"
							:editWatchlist="editWatchlist"
							:enableButton="enableButton"
						/>
					</div>
				</div>
				<div
					v-if="warning && loadMoreStatus == 'no-more'"
					class="text-white h-dvh flex flex-col items-center w-full justify-center text-xs lg:text-3xl"
				>
					<p>{{ warning }}</p>
				</div>
				<div
					v-if="!data.length && loadMoreStatus == 'no-more' && !warning"
					class="text-white h-dvh flex flex-col items-center w-full justify-center text-xs lg:text-3xl"
				>
					<p>No shows found</p>
				</div>
				<div
					v-if="data.length"
					:class="`flex flex-row w-full ${!vertScrollbarTrue ? 'absolute bottom-0' : ''} justify-center py-2`"
				>
					<img
						v-if="
							loadMoreStatus === 'loading' ||
							(warning && loadMoreStatus == 'no-more')
						"
						class="w-[40px]"
						:src="LoadingIcon"
						alt="Loading..."
					/>
					<div v-else class="w-full flex flex-row mt-30 justify-center pb-10">
						<button
							v-if="
								!resultsForSearchOnDisplay &&
								!resultsForFiltersOnDisplay &&
								userDataAvailable
							"
							class="cursor-pointer"
							@click="showAll"
						>
							Show All
						</button>
						<img
							v-if="vertScrollbarTrue"
							:class="`w-[40px] cursor-pointer ${resultsForSearchOnDisplay || resultsForFiltersOnDisplay ? 'relative' : 'absolute'} right-0`"
							@click="scrollToTop"
							:src="TopArrow"
							alt="Scroll to top"
						/>
					</div>
				</div>
			</section>
		</template>
	</BaseLayout>
</template>
