<script setup lang="ts">
	import { ref } from "vue";
	import DownArrow from "/down-arrow.svg";
	import UpArrow from "/up-arrow.svg";

	const showNetworksFilters = ref<boolean>(false);
	const showLanguagesFilters = ref<boolean>(false);
	const showGenresFilters = ref<boolean>(false);
	const showStatusFilters = ref<boolean>(false);
	const filterCategoryToDisplay = ref<boolean>(false);
	const filterCategoryData = ref<Array<string>>([]);
	const networksToFilterFor = defineModel<Array<any>>("networks");
	const genresToFilterFor = defineModel<Array<any>>("genres");
	const statusToFilterFor = defineModel<Array<any>>("status");
	const languagesToFilterFor = defineModel<Array<any>>("languages");

	defineProps<{
		category: string;
		data: any;
	}>();

	// display/hide filter category function
	const showFilterCategory = (category: string, data: any) => {
		if (category === "Networks") {
			showNetworksFilters.value = !showNetworksFilters.value;
			filterCategoryData.value = [data.networks];
			filterCategoryToDisplay.value = showNetworksFilters.value;
			showGenresFilters.value = false;
			showLanguagesFilters.value = false;
			showStatusFilters.value = false;
		} else if (category === "Genres") {
			showNetworksFilters.value = false;
			showGenresFilters.value = !showGenresFilters.value;
			filterCategoryData.value = [data.genres];
			filterCategoryToDisplay.value = showGenresFilters.value;
			showLanguagesFilters.value = false;
			showStatusFilters.value = false;
		} else if (category === "Language") {
			showNetworksFilters.value = false;
			showGenresFilters.value = false;
			showLanguagesFilters.value = !showLanguagesFilters.value;
			filterCategoryData.value = [data.languages];
			filterCategoryToDisplay.value = showLanguagesFilters.value;
			showStatusFilters.value = false;
		} else if (category === "Status") {
			showNetworksFilters.value = false;
			showGenresFilters.value = false;
			showLanguagesFilters.value = false;
			showStatusFilters.value = !showStatusFilters.value;
			filterCategoryData.value = [data.status];
			filterCategoryToDisplay.value = showStatusFilters.value;
		}
	};
</script>

<template>
	<div>
		<div class="flex flex-row items-baseline gap-2">
			<h2 class="2xl:text-base">{{ category }}</h2>
			<img
				@click="showFilterCategory(category, data)"
				:src="`${(category === 'Genres' && showGenresFilters) || (category === 'Status' && showStatusFilters) || (category === 'Language' && showLanguagesFilters) || (category === 'Networks' && showNetworksFilters) ? UpArrow : DownArrow}`"
				class="w-4 h-4 cursor-pointer relative top-1"
			/>
		</div>
		<div
			:class="`${category === 'Status' ? 'h-12' : 'h-30'} grid grid-cols-1 md:flex md:flex-row w-auto md:flex-wrap overflow-y-auto no-scrollbar border-1 md:gap-1 p-2 border-white rounded`"
			v-show="filterCategoryToDisplay"
		>
			<div v-for="filter in filterCategoryData[0]" :key="filter">
				<div class="flex flex-row items-baseline gap-2 p-1">
					<h2 class="2xl:text-base">{{ filter }}</h2>
					<input
						v-if="category === 'Networks'"
						type="checkbox"
						v-model="networksToFilterFor"
						:value="filter"
					/>
					<input
						v-if="category === 'Genres'"
						type="checkbox"
						v-model="genresToFilterFor"
						:value="filter"
					/>
					<input
						v-if="category === 'Status'"
						type="checkbox"
						v-model="statusToFilterFor"
						:value="filter"
					/>
					<input
						v-if="category === 'Language'"
						type="checkbox"
						v-model="languagesToFilterFor"
						:value="filter"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
