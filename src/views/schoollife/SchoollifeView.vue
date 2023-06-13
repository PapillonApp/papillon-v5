<script>
	import {
		defineComponent
	} from 'vue';
	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonItem,
		IonChip,
		IonPage,
		alertController,
		IonLabel
	} from '@ionic/vue';

	import GetAbsences from '@/functions/fetch/GetAbsences.js';
	import GetPunishments from '@/functions/fetch/GetPunishments.js';
	import GetDelays from '@/functions/fetch/GetDelays.js';

	import getEDSchoollife from '@/functions/fetch/getEDSchoollife.js'

	import SchoollifeAbsItemView from "./SchoollifeAbsItemView.vue"

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonList,
			IonItem,
			IonChip,
			IonPage,
			IonLabel
		},
		setup() {
			return {

			}
		},
		methods: {
			getDatas(force) {
				try {
					switch(localStorage.loginService) {
						case 'pronote':
							GetAbsences(force).then((res) => {
								this.absences = res;
								this.absError = false;
							})
							.catch((err) => {
								console.error("[School Life View]: Get absences - " + err);
								this.absError = true;
							});

							GetPunishments(force).then((res) => {
								this.punishments = res;
							})
							.catch((err) => {
								console.error("[School Life View]: Get punishments - " + err);
								this.punishmentsError = true;
							});

							GetDelays(force).then((res) => {
								this.delays = res;
							})
							.catch((err) => {
								console.error("[School Life View]: Get delays - " + err);
								this.delaysError = true;
							});
						break;

						case 'ecoledirecte':
							getEDSchoollife(force).then((res) => {
								this.delays = res.delays || [];
								this.punishments = res.punishments || [];
								this.absences = res.absences || [];
							})
							.catch((err) => {
								console.error("[School Life View]: Get ed schoollife - " + err);
								this.delaysError = true;
							});
						break;
					}
					
				}
				catch (err) {
					console.error("[School Life View]: " + err);
					this.punishmentsError = true;
					this.absError = true;
					this.delaysError = true;
					this.punishments = [];
				}
			},
			handleRefresh(event) {
				this.getDatas(true);

				setTimeout(() => {
					event.detail.complete();
				}, 2000);
			},
			async displayBetaMsg() {
				const alert = await alertController.create({
					header: 'Page vie scolaire',
					message: 'Cette page est en cours de développement. Elle ne contient pas tout le contenu prévu et subira de multiples changements à l\'avenir.',
					mode: 'md',
					buttons: ['Je comprends']
				});

				await alert.present();
			}
		},
		data() {
			return {
				SchoollifeAbsItemView: SchoollifeAbsItemView,
				absences: [],
				absError: false,
				punishments: [],
				punishmentsError: false,
				delays: [],
				delaysError: false,
				loginService: localStorage.getItem("loginService")
			}
		},
		mounted() {
			try {
				this.getDatas(false);
			}
			catch (err) {
				console.error("[School Life View]: " + err);
				this.punishmentsError = true;
				this.absError = true;
				this.delaysError = true;
				this.punishments = [];
			}
		}
	});
</script>

<template>
	<ion-page ref="page">
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<ion-menu-button color="dark"></ion-menu-button>
				</ion-buttons>

				<ion-title>Vie scolaire</ion-title>

			</IonToolbar>
		</IonHeader>

		<ion-content>
			<ion-header collapse="condense">
				<ion-toolbar>
					<ion-title size="large">Vie scolaire</ion-title>
				</ion-toolbar>
			</ion-header>

			<ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>

			<ion-list inset>
				<ion-item color="primary">
					<span class="material-symbols-outlined mdls" slot="start">gavel</span>
					<ion-label class="ion-text-wrap">
						<h2>L'onglet vie scolaire est en développement</h2>
						<p>Il est possible que certaines fonctionnalités ne soient pas disponibles.</p>
					</ion-label>
				</ion-item>
			</ion-list>

			<IonLabel class="listGroupTitle">
				<p>Absences</p>
			</IonLabel>

			<ion-list class="listGroup">
				<ion-item v-if="absError">
					<ion-label>
						<p>Impossible de récupérer les absences pour le moment.</p>
					</ion-label>
				</ion-item>

				<ion-item v-if="absences.length == 0 && !absError">
					<ion-label>
						<p>Aucune absence.</p>
					</ion-label>
				</ion-item>

				<IonList v-for="(miss, i) in absences" :key="i">
					<ion-nav-link router-direction="forward" :component="SchoollifeAbsItemView" :componentProps="{evenement1: encodeURIComponent(JSON.stringify(miss))}">
						<IonItem button>
							<span class="material-symbols-outlined mdls" slot="start">door_open</span>

							<ion-label>
								<h2 v-if="miss.data.reasons.length !== 0">{{ miss.data.reasons[0] }}</h2>
								<h2 v-else>Absence non justifiée</h2>

								<p v-if="miss.data.hours !== '0h00'">{{ miss.data.hours }} {{ this.loginService === 'ecoledirecte' ? '' : 'heures' }} manquées</p>
								<h3>le {{ new Date(miss.date.from).toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' }) }} à {{ new Date (miss.date.from).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'}).split(' ')[1] }}</h3>
								<!-- <h3 v-else>le {{ new Date(miss.date.from).toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' }) }} à {{  }}</h3> -->
							</ion-label>

							<ion-chip slot="end" v-if="!miss.data.isJustified" color="warning">
								<span class="material-symbols-outlined mdls">error</span>
								Injustifié
							</ion-chip>
							<ion-chip slot="end" v-else color="success">
								<span class="material-symbols-outlined mdls">check</span>
								Justifié
							</ion-chip>
						</IonItem>
					</ion-nav-link>
				</IonList>
			</ion-list>

			<IonLabel class="listGroupTitle">
				<p>Punitions</p>
			</IonLabel>

			<ion-list class="listGroup">
				<ion-item v-if="punishmentsError">
					<ion-label>
						<p>Impossible de récupérer les punitions pour le moment.</p>
					</ion-label>
				</ion-item>

				<ion-item v-if="punishments.length == 0 && !punishmentsError">
					<ion-label>
						<p>Aucune punition.</p>
					</ion-label>
				</ion-item>

				<ion-item v-for="(punish, i) in punishments" :key="i">
					<span class="material-symbols-outlined mdls" slot="start">gavel</span>

					<ion-label>
						<h2>{{ punish.homeworks.text }}</h2>

						<p>{{ punish.data.reasons.text[0] }} - {{ punish.data.reasons.circumstances }}</p>

						<h3>le {{ new Date (punish.date.givenDate).toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' }) }} à {{ new Date (punish.date.givenDate).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'}).split(' ')[1] }}</h3>
					</ion-label>
				</ion-item>
			</ion-list>

			<IonLabel class="listGroupTitle">
				<p>Retards</p>
			</IonLabel>

			<ion-list class="listGroup">
				<ion-item v-if="delaysError">
					<ion-label>
						<p>Impossible de récupérer les retards pour le moment.</p>
					</ion-label>
				</ion-item>

				<ion-item v-if="delays.length == 0 && !delaysError">
					<ion-label>
						<p>Aucun retard.</p>
					</ion-label>
				</ion-item>

				<ion-item v-for="(delay, i) in delays" :key="i">
					<span class="material-symbols-outlined mdls" slot="start">schedule</span>

					<ion-label>
						<h2 v-if="delay.data.reasons.length !== 0">{{ delay.data.reasons[0] }}</h2>
						<h2 v-else>Absence non justifiée</h2>

						<p>{{ delay.date.duration }} minutes manquées</p>

						<h3>le {{ new Date (delay.date.date).toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' }) }} à {{ new Date (delay.date.date).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'}).split(' ')[1] }}</h3>
					</ion-label>

					<ion-chip slot="end" v-if="!delay.data.isJustified" color="warning">
						<span class="material-symbols-outlined mdls">error</span>
						Injustifié
					</ion-chip>
					<ion-chip slot="end" v-else color="success">
						<span class="material-symbols-outlined mdls">check</span>
						Justifié
					</ion-chip>
				</ion-item>
			</ion-list>

			<br /><br /><br /><br /><br />

		</ion-content>

	</ion-page>
</template>

<style scoped>
	ion-chip span {
		margin-right: 5px;
	}
</style>