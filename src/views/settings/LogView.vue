<script>
	import { defineComponent } from 'vue';
	import { Capacitor } from '@capacitor/core';
	import { Device } from '@capacitor/device';
	import { Share } from '@capacitor/share';
	import displayToast from '@/functions/utils/displayToast.js';

	import { version } from '/package'

	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonListHeader,
		IonItem,
		IonItemSliding,
		IonItemOption,
		IonItemOptions,
		IonButtons,
		IonButton,
		IonLabel,
		IonContent,
		IonPage,
		IonTitle,
		IonCardContent,
		IonCard,
		IonRefresher,
		IonRefresherContent,
	} from '@ionic/vue';

	import PapillonBackButton from '@/components/PapillonBackButton.vue';


	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			PapillonBackButton,
			IonButtons,
			IonButton,
			IonLabel,
			IonItem,
			IonItemSliding,
			IonItemOption,
			IonItemOptions,
			IonList,
			IonContent,
			IonTitle,
			IonPage,
			IonRefresher,
			IonRefresherContent,
		},
		data() {
			return {
				logs: [],
				apiVersion: this.getApiVersion()
			}
		},
		methods: {
			clear() {
				localStorage.removeItem("logs");
				this.logs = [];
			},
			clearLog(log, event) {
				this.logs = this.logs.filter(l => l !== log);
				localStorage.setItem("logs", JSON.stringify(this.logs));
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
			getApiVersion() {
                const API = this.$api;

                let cacheApiVersion = localStorage.getItem('apiVersion');

                fetch(API + "/infos")
                    .then(response => response.json())
                    .then(result => {
                        let apiVer = result.version;
                        localStorage.setItem('apiVersion', apiVer);
                        this.apiVersion = apiVer;
                    });

                this.apiVersion = cacheApiVersion ?? 'Inconnue';
            }, 
			async share() {
				try {
					await Share.share({
						title: 'Exporter les logs',
						text: 
							`Le ${ new Date().toLocaleString('fr-FR', {dateStyle: 'long', timeStyle: 'short'}) }
							Contient ${this.logs.length} logs

							Application :
							> Version : ${version}
							> Type de plateforme : ${Capacitor.getPlatform()}
							> Version API : ${this.apiVersion}
							
							Appareil :
							> ID : ${await Device.getId().then(id => id.uuid)}
							> Modèle : ${await Device.getInfo().then(info => info.model)}
							> Version OS : ${await Device.getInfo().then(info => info.osVersion)}
							> Marque : ${await Device.getInfo().then(info => info.manufacturer)}\n
						` + "```" 
						+ `
							${this.logs.map(log => {
								return `[${log.type}] - ${log.date} - ${log.message}`;
							}).join("\n")}
						` + "```",
						dialogTitle: 'Partager les logs sur Github ou Discord à l\'équipe de développement'
					});
				}
				catch (e) {
					console.error(`[Log Share]: ${e}`);
					displayToast.presentError("Impossible de partager les logs", "danger", e)
				}
			},
			handleRefresh(event) {
				this.refreshLogs();
				event.target.complete();
			},
			refreshLogs() {
				this.logs = JSON.parse(localStorage.getItem("logs"));

				this.logs.sort((a, b) => {
					return new Date(b.date) - new Date(a.date);
				});
			}
		},
		mounted() {
			this.refreshLogs()
		}
	});
</script>

<template>
	<ion-page ref="page">
		<IonHeader class="AppHeader" collapse="fade" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<PapillonBackButton></PapillonBackButton>
				</ion-buttons>

				<ion-title mode="md">Logs</ion-title>

				<ion-buttons slot="end">
					<IonButton @click="clear()">Effacer les logs</IonButton>
					<IonButton @click="share()">
						<span class="material-symbols-outlined mdls">ios_share</span>
					</IonButton>
				</ion-buttons>

			</IonToolbar>


		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>

			<ion-list>
				<ion-item-sliding v-for="log in logs" :key="log.id">
					<ion-item>
						<ion-label class="ion-text-wrap" :color="getTypeColor(log.type)">
							<h2>{{ log.message }}</h2>
							<p>{{ new Date(log.date).toLocaleString("fr-fr", {dateStyle: 'long', timeStyle: 'medium'}) }}</p>
						</ion-label>
					</ion-item>

					<ion-item-options side="end">
						<ion-item-option color="danger" @click="clearLog(log, $event)">
							<span class="material-symbols-outlined mdls">delete</span>
							Supprimer
						</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>

		</ion-content>
	</ion-page>
</template>

<style scoped>
	.md .paddingFixMd {
		padding-left: 15px;
	}
</style>