<script>
	import { defineComponent } from 'vue';
	import { Share } from '@capacitor/share';
	import displayToast from '@/functions/utils/displayToast.js';

	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonListHeader,
		IonItem,
		IonBackButton,
		IonButtons,
		IonButton,
		IonLabel,
		IonContent,
		IonPage,
		IonTitle,
		IonCardContent,
		IonCard
	} from '@ionic/vue';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonBackButton,
			IonButtons,
			IonButton,
			IonLabel,
			IonItem,
			IonList,
			IonContent,
			IonTitle,
			IonPage,
		},
		data() {
			return {
				logs: [],
			}
		},
		methods: {
			clear() {
				localStorage.removeItem("logs");
				this.logs = [];
			},
			getTypeColor(type) {
				switch (type) {
					case "error":
						return "danger";
					case "log":
						return "primary";
					case "warn":
						return "warning";
				}
			},
			share() {
				try {
					// await Share.share({
					// 	title: 'Exporter les logs',
					// 	text: this.logs.map(log => `[${log.date}] - ${log.type} - ${log.message}`).join("\n"),
					// 	dialogTitle: 'Partager les logs'
					// });
				}
				catch (e) {
					console.error(e);
					displayToast.presentError("Impossible de partager les logs", "danger", e)
				}
			}
		},
		mounted() {
			this.logs = JSON.parse(localStorage.getItem("logs"));

			this.logs.sort((a, b) => {
				return new Date(b.date) - new Date(a.date);
			});
		}
	});
</script>

<template>
	<ion-page ref="page">
		<IonHeader class="AppHeader" collapse="fade" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<IonBackButton mode="md" default-href="settings"></IonBackButton>
				</ion-buttons>

				<ion-title mode="md">Logs</ion-title>

				<ion-buttons slot="end">
					<IonButton @click="clear()">Effacer les logs</IonButton>
					<IonButoon @click="share()">
						<span class="material-symbols-outlined mdls">send</span>
					</IonButoon>
				</ion-buttons>

			</IonToolbar>


		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-list>
				<ion-item v-for="log in logs" :key="log.id">
					<ion-label :color="getTypeColor(log.type)">
						<h2>{{ log.message }}</h2>
						<p>{{ new Date(log.date).toLocaleString("fr-fr", {dateStyle: 'long', timeStyle: 'medium'}) }}</p>
					</ion-label>
				</ion-item>
			</ion-list>

		</ion-content>
	</ion-page>
</template>

<style scoped>
	.md .paddingFixMd {
		padding-left: 15px;
	}
</style>