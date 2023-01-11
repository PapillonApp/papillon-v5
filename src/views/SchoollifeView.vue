<script>
	import {
		defineComponent
	} from 'vue';
	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonListHeader,
		IonItem,
		IonChip
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
			IonList,
			IonListHeader,
			IonItem,
			IonChip
		},
		setup() {
			return {

			}
		},
		methods: {

		},
		data() {
			return {
				absences: [],
				absError: false,
				punishments: [],
				punishmentsError: false
			}
		},
		mounted() {
			GetAbsences().then((res) => {
				this.absences = res;
				this.absError = false;
			})
			.catch((err) => {
				console.log(err);
				this.absError = true;
			});

			GetPunishments().then((res) => {
				this.punishments = res;
				console.log(res);
			})
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

			<ion-list>
				<ion-list-header>
					<ion-label>Absences</ion-label>
				</ion-list-header>

				<ion-item v-if="absError">
					<ion-label>
						<p>Impossible de récupérer les absences pour le moment.</p>
					</ion-label>
				</ion-item>

				<ion-item v-if="absences.length == 0">
					<ion-label>
						<p>Aucune absence.</p>
					</ion-label>
				</ion-item>

				<ion-item v-for="(miss, i) in absences" :key="i">
					<span class="material-symbols-outlined mdls" slot="start">door_open</span>

					<ion-label>
						<p>{{ miss.data.hours }} heures manquées le {{ new Date (miss.date.from).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' }) }}</p>

						<h2 v-if="miss.data.reasons.length !== 0">{{ miss.data.reasons[0] }}</h2>
						<h2 v-else>Absence non justifiée</h2>
					</ion-label>

					<ion-chip slot="end" v-if="!miss.data.isJustified" color="warning">
						<span class="material-symbols-outlined mdls">error</span>
						Injustifié
					</ion-chip>
					<ion-chip slot="end" v-else color="success">
						<span class="material-symbols-outlined mdls">check</span>
						Justifié
					</ion-chip>
				</ion-item>
			</ion-list>

			<ion-list>
				<ion-list-header>
					<ion-label>Punitions</ion-label>
				</ion-list-header>

				<ion-item v-if="punishmentsError">
					<ion-label>
						<p>Impossible de récupérer les absences pour le moment.</p>
					</ion-label>
				</ion-item>

				<ion-item v-if="punishments.length == 0">
					<ion-label>
						<p>Aucune punition.</p>
					</ion-label>
				</ion-item>

				<ion-item v-for="(punish, i) in punishments" :key="i">
					<span class="material-symbols-outlined mdls" slot="start">gavel</span>

					<ion-label>
						<p>{{ punish.data.nature }} le {{ new Date(punish.date.givenDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</p>

						<h2>{{ punish.homeworks.text }}</h2>

						<h4>{{ punish.data.reasons.text[0] }} - {{ punish.data.reasons.circumstances }}</h4>
					</ion-label>
				</ion-item>
			</ion-list>

			<ion-list>
				<ion-list-header>
					<ion-label>Retards</ion-label>
				</ion-list-header>

				<ion-item>
					<ion-label>
						<p>Impossible de récupérer les retards pour le moment.</p>
					</ion-label>
				</ion-item>
			</ion-list>

		</ion-content>

	</ion-page>
</template>

<style scoped>
	ion-chip span {
		margin-right: 5px;
	}
</style>