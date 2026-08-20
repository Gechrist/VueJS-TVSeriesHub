<script setup lang="ts">
	import { toRefs, ref } from "vue";
	import { Carousel, Slide, Navigation } from "vue3-carousel";
	import Add from "/round-add.svg";
	import Remove from "/round-remove.svg";
	import NoImage from "/no-poster-image.svg";

	const props = defineProps<{
		network: { name: string; logo: string };
		shows: [
			{
				name: string;
				tvMazeId: number;
				summary: string;
				runtime: number;
				status: string;
				premiered: string;
				image: { medium: string };
				links: {
					previousepisode: { name: string };
				};
			},
		];
		userWatchlist: Array<number>;
		editWatchlist: Function;
		enableButton: boolean;
	}>();
	const { network, shows, userWatchlist, editWatchlist, enableButton } =
		toRefs(props);

	const carouselConfig = {
		itemsToShow: "auto",
		wrapAround: false,
		autoplay: 0,
		dir: "ltr" as const,
		gap: 20,
		breakpoints: {
			1024: {
				gap: 40,
			},
			1440: {
				gap: 50,
			},
			1536: {
				gap: 20,
			},
		},
		mouseDrag: true,
		touchDrag: true,
		slideEffect: "slide" as const,
		snapAlign: "center" as const,
	};

	const networkNameAsText = ref<boolean>(false);
	const displayDetails = ref<boolean>(false);
	const showName = ref<string>("");
	const showWatchlistHint = ref<boolean>(false);
	const watchlistButtonIsPressed = ref<boolean>(false);
	const showSummary = ref<string | null>(null);
	const showGenres = ref<string[] | null>(null);
	const showLanguage = ref<string | null>(null);
	const showRating = ref<{ average: string } | null>(null);
	const showRuntime = ref<string | null>(null);
	const showStatus = ref<string | null>(null);
	const showPremiered = ref<string | null>(null);

	const displayDetailsFunction = (show: any) => {
		showGenres.value = show.genres ? show.genres : [];
		showName.value = show.name;
		showSummary.value = show.summary ? show.summary : "N/A";
		showLanguage.value = show.language ? show.language : "N/A";
		showRating.value = show.rating.average ? show.rating.average : "N/A";
		showRuntime.value = show.runtime;
		showStatus.value = show.status ? show.status : "N/A";
		showPremiered.value = show.premiered;
		displayDetails.value = true;
	};

	const hideDetailsFunction = () => {
		displayDetails.value = false;
	};

	const showNetworkNameAsText = (networkImage: string) => {
		const networkImgId = document.getElementById(
			networkImage,
		) as HTMLImageElement;
		const networkText = document.createElement("h2");
		networkNameAsText.value = true;
		if (networkImgId) {
			networkImgId.style.display = "none";
			networkImgId.replaceWith(networkText);
			networkText.innerHTML = networkImage.slice(12);
			networkText.className = "font-bold text-3xl";
		}
	};
	const showWatchlistHintFunction = () => {
		showWatchlistHint.value = true;
	};

	const hideWatchlistHintFunction = () => {
		showWatchlistHint.value = false;
	};
	const watchlistButtonIsPressedFunction = () => {
		watchlistButtonIsPressed.value = !watchlistButtonIsPressed.value;
	};
</script>

<template>
	<section>
		<div v-if="shows" class="w-full flex flex-col justify-center gap-4">
			<div class="w-full flex flex-row justify-center gap-2">
				<div
					v-if="!network.logo.includes('undefined')"
					class="relative flex flex-col gap-0 justify-center items-center w-auto"
				>
					<div class="h-[120px] flex items-center">
						<img
							:id="`networkImgId${network.name}`"
							class="h-[120px] w-full"
							:src="network.logo"
							@error="showNetworkNameAsText(`networkImgId${network.name}`)"
							:alt="network.name"
						/>
					</div>
				</div>
				<div
					v-if="network.logo.includes('undefined')"
					class="relative flex flex-row items-baseline gap-2 justify-center"
				>
					<div class="h-[120px] 2xl:h-[350px] flex items-center">
						<h2 id="networkTextId" class="font-bold text-3xl">
							{{ network.name }}
						</h2>
					</div>
				</div>
			</div>
			<div class="flex flex-col gap-0 justify-center">
				<Carousel v-bind="carouselConfig">
					<Slide
						@click="displayDetailsFunction(show)"
						@mouseenter="displayDetailsFunction(show)"
						v-for="show in shows"
						:key="show.name"
						:class="`p-1 2xl:p-1.5 min-h-full rounded-md ${displayDetails && showName == show.name ? 'bg-blue-800' : ''}`"
					>
						<div
							class="flex flex-row gap-0 items-start absolute top-2 -left-3 z-50"
						>
							<img
								v-if="
									displayDetails && showName == show.name && !showWatchlistHint
								"
								@mouseenter="showWatchlistHintFunction"
								class="w-[20px] lg:w-[25px] xl:w-[30px] cursor-pointer"
								:src="
									userWatchlist?.length > 0
										? userWatchlist?.includes(show.tvMazeId)
											? Remove
											: Add
										: Add
								"
								:alt="
									userWatchlist?.length > 0
										? userWatchlist?.includes(show.tvMazeId)
											? 'from Watchlist'
											: 'to Watchlist'
										: 'to Watchlist'
								"
								:aria-labelledby="
									userWatchlist?.length > 0
										? userWatchlist?.includes(show.tvMazeId)
											? 'from Watchlist'
											: 'to Watchlist'
										: 'to Watchlist'
								"
							/>
							<span
								v-if="
									displayDetails && showName == show.name && showWatchlistHint
								"
								@click="
									enableButton
										? editWatchlist(
												userWatchlist?.length > 0
													? userWatchlist.includes(show.tvMazeId)
														? true
														: false
													: false,
												show.tvMazeId,
												show.name,
												show?.links?.previousepisode?.name
													? show.links.previousepisode.name
													: 'N/A',

												show.status,
											)
										: ''
								"
								@mouseleave="hideWatchlistHintFunction"
								class="flex flex-row bg-amber-600 active:bg-amber-800 rounded-l-2xl rounded-r-xl"
							>
								<img
									v-if="displayDetails && showName == show.name"
									@mousedown="watchlistButtonIsPressedFunction"
									@mouseup="watchlistButtonIsPressedFunction"
									@mouseenter="showWatchlistHintFunction"
									class="w-[20px] lg:w-[25px] xl:w-[30px] z-50 cursor-pointer active:fill-amber-800"
									:src="
										userWatchlist?.length > 0
											? userWatchlist?.includes(show.tvMazeId)
												? Remove
												: Add
											: Add
									"
									:alt="
										userWatchlist?.length > 0
											? userWatchlist?.includes(show.tvMazeId)
												? 'from Watchlist'
												: 'to Watchlist'
											: 'to Watchlist'
									"
									:aria-labelledby="
										userWatchlist?.length > 0
											? userWatchlist?.includes(show.tvMazeId)
												? 'from Watchlist'
												: 'to Watchlist'
											: 'to Watchlist'
									"
								/>
								<p
									@mousedown="watchlistButtonIsPressedFunction"
									@click="
										enableButton
											? editWatchlist(
													userWatchlist?.length > 0
														? userWatchlist.includes(show.tvMazeId)
															? true
															: false
														: false,
													show.tvMazeId,
													show.name,
													show?.links?.previousepisode?.name
														? show.links.previousepisode.name
														: 'N/A',
													show.status,
												)
											: ''
									"
									@mouseup="watchlistButtonIsPressedFunction"
									:class="`${showWatchlistHint && watchlistButtonIsPressed ? 'bg-amber-800 rounded-2xl p-1 animate-expand-right cursor-pointer w-auto text-nowrap text-[11px] md:text-[13px] lg:text-[15px]' : 'bg-amber-600 rounded-2xl p-1 animate-expand-right cursor-pointer w-auto text-nowrap text-[11px] md:text-[13px] lg:text-[15px]'}`"
								>
									{{
										userWatchlist?.length > 0
											? userWatchlist?.includes(show.tvMazeId)
												? "from Watchlist"
												: "to Watchlist"
											: "to Watchlist"
									}}
								</p></span
							>
						</div>
						<div
							:class="`w-[75px] md:w-[100px] flex flex-col h-auto gap-1 md:gap-1.5 2xl:gap-3.5`"
						>
							<img
								v-if="show.image"
								class="w-auto rounded shadow-gray-400 shadow-sm h-[100px] lg:h-[150px]"
								:src="show.image.medium"
								:alt="show.name"
							/>
							<img
								v-else
								class="w-auto h-[100px] lg:h-[150px]"
								:src="NoImage"
								alt="No image"
							/>
							<p
								class="text-wrap text-center w-[75px] md:w-[100px] lg:text-base"
							>
								{{ show.name }}
							</p>
						</div>
					</Slide>
					<template #addons>
						<Navigation />
					</template>
				</Carousel>
				<div
					v-if="displayDetails"
					@mouseleave="hideDetailsFunction"
					class="bg-blue-800 animate-move-up flex w-full flex-col gap-1 2xl:gap-3 p-4 text-sm text-justify lg:text-base rounded-t-xl text-wrap"
				>
					<span v-html="showSummary"></span>
					<p>
						<span class="font-bold">Genres:</span>
						{{
							showGenres!.length > 0
								? JSON.stringify(showGenres).replace(/[\[\]"]|,(?!\s)/g, (m) =>
										m === "," ? ", " : "",
									)
								: "N/A"
						}}
					</p>
					<p><span class="font-bold">Language:</span> {{ showLanguage }}</p>
					<p><span class="font-bold">Premiered:</span> {{ showPremiered }}</p>
					<p><span class="font-bold">Rating:</span> {{ showRating }}</p>
					<p v-if="showRuntime && showRuntime !== 'No runtime available'">
						<span class="font-bold">Runtime:</span> {{ showRuntime }} min
					</p>
					<p v-else><span class="font-bold">Runtime:</span> N/A</p>
					<p><span class="font-bold">Status:</span> {{ showStatus }}</p>
				</div>
			</div>
		</div>
	</section>
</template>
