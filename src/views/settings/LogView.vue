<script>
	import { defineComponent } from 'vue';
	import { Capacitor } from '@capacitor/core';
	import { Device } from '@capacitor/device';
	import { Share } from '@capacitor/share';
	import displayToast from '@/functions/utils/displayToast.js';

	import { version, canal } from '/package'

	import {
		IonHeader,
		IonToolbar,
		IonList,
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
				channel: canal,
				apiVersion: this.getApiVersion(),
				localStorageSize : this.getLocalStorageSize(),
				account: {
					name: "",
					etab: "",
					etabUrl: "",
					cas: "",
				}
			}
		},
		methods: {
			clearLog(log) {
				this.logs = this.logs.filter(l => l !== log);
				localStorage.setItem("logs", JSON.stringify(this.logs));
			},
			getAccountInfo() {
				try {
					let loginData = JSON.parse(atob(localStorage.getItem('loginData')));
					let userData = JSON.parse(localStorage.getItem('userData'));

					this.account.name = userData.student.name;
					this.account.etab = userData.class.school;
					this.account.etabUrl = loginData.url;
					this.account.cas = loginData.cas;

					if (this.account.cas == "") {
						this.account.cas = "Aucun";
					}
				} catch (error) {
					displayToast.presentNativeToast("Impossible de récupérer les informations de l'utilisateur");
					this.account.name = "Inconnu";
					this.account.etab = "Inconnu";
					this.account.etabUrl = "Inconnu";
					this.account.cas = "Inconnu";
					console.error("[Log View]: " + error);
				}
			},
			getLocalStorageSize() {
				// get localStorage size in kb
				let localStorageSize = 0;
				for (let i = 0; i < localStorage.length; i++) {
					localStorageSize += localStorage.getItem(localStorage.key(i)).length;
				}

				// convert to kb
				localStorageSize = localStorageSize / 1024;

				// round to 2 decimals
				localStorageSize = Math.round(localStorageSize * 100) / 100;

				// return size
				return localStorageSize;
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
				let link = "Indisponible";
				try {
					displayToast.presentNativeToast("Préparation des logs...");

					// Post logs to hastebin (https://logs.getpapillon.xyz)
					let response = await fetch("https://cors.api.getpapillon.xyz/https://logs.getpapillon.xyz/documents", {
						method: "POST",
						body: this.logs.map(log => { return `[${log.type}] - ${log.date.replace('T', ' ')} - ${log.message}`; }).join("\n")
					});
					let result = await response.json();

					// Get the link
					link = `https://logs.getpapillon.xyz/${result.key}`;
					displayToast.presentNativeToast("Logs prêts à être partagés");
				} catch (error) {
					console.error("[Log View]: Failed upload logs - " + error);
					displayToast.presentNativeToast("Impossible d'envoyer les logs sur le serveur")
				}

				try {
					await Share.share({
						title: 'Exporter les logs',
						text: 
`Le **${ new Date().toLocaleString('fr-FR', {dateStyle: 'long', timeStyle: 'short'}) }**
Contient **${this.logs.length}** logs

*Application* :
> **Version** : ${version}
> **Canal** : ${this.channel}
> **Type de plateforme** : ${Capacitor.getPlatform()}
> **Version API** : ${this.apiVersion}
> **Taille du cache** : ${this.localStorageSize} kb

*Appareil* :
> **ID** : ${await Device.getId().then(id => id.uuid)}
> **Modèle** : ${await Device.getInfo().then(info => info.model)}
> **Version OS** : ${await Device.getInfo().then(info => info.osVersion)}
> **Marque** : ${await Device.getInfo().then(info => info.manufacturer)}

*Compte* :
> **Nom** : ${this.account.name}
> **Établissement** : ${this.account.etab}
> **URL** : ${this.account.etabUrl}
> **CAS** : ${this.account.cas}\n

**Voir les logs** : *${link}*
> NB. Les logs sont supprimés après 48h de nos serveurs.`,
						dialogTitle: 'Partager les logs sur Github ou Discord à l\'équipe de développement'
					});
				}
				catch (e) {
					console.error(`[Log View]: ${e}`);
					displayToast.presentNativeToast("Impossible de partager les logs")
				}
			},
			handleRefresh(event) {
				this.refreshLogs();
				event.target.complete();
			},
			getCanal() {
				if (canal == 'dev') {
					this.channel = "Développement";
				} else if (canal == 'beta') {
					this.channel = "Bêta";
				} else if (canal == 'prod') {
					this.channel = "Stable";
				} else {
					this.channel = "Inconnu";
				}
			},
			refreshLogs() {
				this.logs = JSON.parse(localStorage.getItem("logs"));

				if(this.logs.length > 0) {
					this.logs.sort((a, b) => {
						return new Date(b.date) - new Date(a.date);
					});
				}
			}
		},
		mounted() {
			this.refreshLogs()
			this.getAccountInfo();
			this.getCanal();
		}
	});
</script>

<template>
	<ion-page ref="page">
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<PapillonBackButton></PapillonBackButton>
				</ion-buttons>

				<ion-title mode="md">Logs</ion-title>

				<ion-buttons slot="end">
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

			<div class="NoCours" v-if="logs.length == 0">
				<span class="material-symbols-outlined mdls">developer_mode</span>
				<h2>Aucun rapport n'a été enregistré.</h2>
				<p>C'est parfait, il n'y a aucun problème sur l'application (ou alors vous les avez effacés). Détendez-vous, profitez-en !</p>
			</div>

			<ion-list v-else>
				<ion-item-sliding v-for="log in logs" :key="log.id">
					<ion-item>
						<ion-label class="ion-text-wrap" :color="getTypeColor(log.type)">
							<h2>{{ log.message }}</h2>
							<p>{{ new Date(log.date).toLocaleString("fr-fr", {dateStyle: 'long', timeStyle: 'short'}) }}</p>
						</ion-label>
					</ion-item>

					<ion-item-options side="end">
						<ion-item-option color="danger" @click="clearLog(log, $event)">
							<span class="material-symbols-outlined mdls">delete</span>
							Supprimer
						</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>

				<div class="NoCours">
					<p v-if="this.logs.length <= 1">Vous avez atteint la fin de la liste.</p>
					<p v-else>Vous avez atteint la fin de la liste.<br/>Mais il y a tout de même {{ this.logs.length }} journaux !</p>
				</div>
			</ion-list>

		</ion-content>
	</ion-page>
</template>

<style scoped>
	.md .paddingFixMd {
		padding-left: 15px;
	}
</style>