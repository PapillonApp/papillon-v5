<script>
	import {
		defineComponent
	} from 'vue';
	import {
		IonHeader,
		IonToolbar
	} from '@ionic/vue';

	const displayToast = require('@/functions/utils/displayToast.js');

	import GetAbsences from '@/functions/fetch/GetAbsences.js';
	import GetPunishments from '@/functions/fetch/GetPunishments.js';

	import {
		Swiper,
		SwiperSlide
	} from 'swiper/vue';
	import 'swiper/css';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
		},
		setup() {
			return {

			}
		},
		methods: {

		},
		data() {
			return {

			}
		},
		mounted() {
			GetAbsences();
			GetPunishments();
		}
	});
</script>

<template>
	<ion-page ref="page">
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<ion-menu-button color="dark" mode="md"></ion-menu-button>
				</ion-buttons>

				<ion-title mode="md">Vie scolaire</ion-title>

			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>

			<IonHeader collapse="condense">
				<IonToolbar>
					<ion-title size="large">Vie scolaire</ion-title>
				</IonToolbar>
			</IonHeader>
		</ion-content>

	</ion-page>
</template>

<style scoped>

</style>