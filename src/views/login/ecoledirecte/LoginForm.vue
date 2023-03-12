<script>
	import { defineComponent } from 'vue';
	import { IonItem, IonList, IonIcon, IonBackButton, IonSearchbar, IonModal, IonListHeader, IonSpinner, loadingController, IonInput, 
	IonButton, actionSheetController, alertController } from '@ionic/vue';

	import axios from 'axios';

	import { App } from '@capacitor/app';
	
	import { linkOutline, linkSharp, qrCodeOutline, qrCodeSharp, schoolOutline, schoolSharp, businessOutline, businessSharp, navigateOutline, navigateSharp, personCircleOutline, personCircleSharp, serverOutline, serverSharp } from 'ionicons/icons';

	import displayToast from '@/functions/utils/displayToast.js';
	import { fetchDaysOffAndHolidays } from '@/functions/utils/datetimePicker.js';

	import { Geolocation } from '@capacitor/geolocation';
	import { Dialog } from '@capacitor/dialog';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonBackButton,
			IonItem,
			IonList,
//			IonIcon,
//			IonSearchbar,
			IonModal,
//			IonListHeader,
			IonSpinner,
			IonInput,
			IonButton
		},
		setup() {
			return { 
				linkOutline,
				linkSharp,
				qrCodeOutline,
				qrCodeSharp,
				schoolOutline,
				schoolSharp,
				serverOutline,
				serverSharp,
				businessOutline,
				businessSharp,
				navigateOutline,
				navigateSharp,
				personCircleOutline,
				personCircleSharp
			}
		},
		mounted() {
			//this.getENTs();
			//this.GetLocation();
			this.displayLogin()
		},
		methods: {
			decodeEntities(encodedString) {
				var translate_re = /&(nbsp|amp|quot|lt|gt|Eacute|eacute|Egrave|egrave);/g;
				var translate = {
					"nbsp": " ",
					"amp" : "&",
					"quot": "\"",
					"lt"  : "<",
					"gt"  : ">",
					"Eacute" : "É",
					"eacute" : "é",
					"Egrave" : "È",
					"egrave" : "è",
				};
				return encodedString.replace(translate_re, function(match, entity) {
					return translate[entity];
				}).replace(/&#(\d+);/gi, function(match, numStr) {
					var num = parseInt(numStr, 10);
					return String.fromCharCode(num);
				});
			},
			
			displayLogin() {

				this.$refs.loginModal.$el.present()
			},
			dismiss() {
				this.$refs.loginModal.$el.dismiss();
			},
			
			login() {
				const EDAPI = "https://api.ecoledirecte.com/v3"

				let username = this.$refs.user.$el.value;
				let password = this.$refs.pass.$el.value;

				var requestOptions = {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
				};
				var body = `data={
						"uuid": "",
						"identifiant": "${username}",
						"motdepasse": "${password}",
						"isReLogin": false
					}`

				displayToast.presentToast("Connexion en cours...", "light", true)

				/*fetch(EDAPI + "/login.awp", requestOptions)
					.then(response => response.text())
					.then(result => {
						if(!result.token) {
							console.log
							if(result.code == 505) {
								displayToast.presentError("Identifiants incorrects.", "danger", result.error)
							} else {
								displayToast.presentError("Une erreur s'est produite.", "danger", result.error)
							}
						}
						else {
							let token = result.token;

							// save token
							localStorage.token = token;
							localStorage.loggedIn = true;
							localStorage.loginData = btoa(JSON.stringify({
								username: username,
								password: password,
							}));
							localStorage.loginService = "ecoledirecte";

							localStorage.setItem("disabledDays", JSON.stringify([0]));
							const ACAD_NAME_API = "https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-adresse-et-geolocalisation-etablissements-premier-et-second-degre&q=&facet=code_postal_uai&facet=nature_uai_libe&facet=libelle_academie&timezone=Europe%2FParis"
							/*axios.get(ACAD_NAME_API + "&refine.numero_uai=" + url.split("/")[2].split(".")[0].toUpperCase())
								.then(response => response.json())
								.then(result => {
									if(result.records.length > 0) {
										localStorage.setItem("acadName", result.records[0].fields.libelle_academie);
									}
								})

							fetchDaysOffAndHolidays();*/
								/*
							// go to home
							window.location.replace("/");
						}
					});*/

				axios.post(EDAPI + "/login.awp", body, requestOptions)
				.then(data => {
					let rsp = data.data
					if(!rsp.token) {
						if(rsp.code == 505) {
							displayToast.presentError("Identifiants incorrects.", "danger", rsp.error)
						} else {
							displayToast.presentError("Une erreur s'est produite.", "danger", rsp.error)
						}
					}
					else {
						let token = data.token;
							// save token
						localStorage.token = token;
						localStorage.loggedIn = true;
						localStorage.loginData = btoa(JSON.stringify({
							username: username,
							password: password,
						}));
						localStorage.loginService = "ecoledirecte";
						localStorage.setItem("disabledDays", JSON.stringify([0]));
						const ACAD_NAME_API = "https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-adresse-et-geolocalisation-etablissements-premier-et-second-degre&q=&facet=code_postal_uai&facet=nature_uai_libe&facet=libelle_academie&timezone=Europe%2FParis"
						/*axios.get(ACAD_NAME_API + "&refine.numero_uai=" + url.split("/")[2].split(".")[0].toUpperCase())
							.then(response => response.json())
							.then(result => {
								if(result.records.length > 0) {
									localStorage.setItem("acadName", result.records[0].fields.libelle_academie);
								}
							})
						fetchDaysOffAndHolidays();*/
						// go to home
						window.location.replace("/");
					}
				})
			}
		},
		data() {
			return {
				presentingElement: null,
				terms: "",
				isLoading: false,
				retries: 0,
			}
		},
	});
</script>

<template>
	<ion-header>
		<ion-toolbar>
			<ion-buttons slot="start">
				<ion-back-button class="only-ios" text="Retour"></ion-back-button>
				<ion-back-button class="only-md"></ion-back-button>
			</ion-buttons>
			<ion-title>Connexion à EcoleDirecte</ion-title>
			<ion-buttons slot="end" style="padding-right: 10px;">
				<ion-spinner v-if="isLoading"></ion-spinner>
			</ion-buttons>
		</ion-toolbar>
		
	</ion-header>
	<ion-modal ref="loginModal" trigger="open-loginModal" :swipeToClose="true">
			<ion-header>
				<ion-toolbar>
					<ion-title>Se connecter</ion-title>
					<ion-buttons slot="end">
					<ion-button @click="dismiss()">Fermer</ion-button>
					</ion-buttons>
				</ion-toolbar>
			</ion-header>
			<ion-content>
				<div class="loginPage">
					
					<div class="loginIntro">
						<img src="assets/welcome/ecoledirecte_logo.png" alt="Pronote Logo" class="logo"/>
						<div class="introData">
							<h2>Connexion à Papillon</h2>
							<p class="description">Vous souhaitez vous connecter à <B>EcoleDirecte</B></p>
						</div>
					</div>

					<ion-list class="loginInput">
						<ion-item mode="md" fill="solid" class="userIn">
							<ion-label position="floating">Identifiant</ion-label>
							<ion-input ref="user" type="text" placeholder="j.dupont6" autocomplete="username"></ion-input>
						</ion-item>

						<ion-item mode="md" fill="solid" class="passIn">
							<ion-label position="floating">Mot de passe</ion-label>
							<ion-input ref="pass" type="password" placeholder="*********"></ion-input>
						</ion-item>

						<ion-button class="loginBtn" @click="login" expand="block" mode="md">
							Se connecter
						</ion-button>
					</ion-list>

					<div class="loginConditions">
						Vos données ne sont pas stockées sur nos serveurs. En vous connectant avec cette application, vous acceptez les <a href="https://getpapillon.xyz/privacy.pdf">conditions d'utilisation</a> de Papillon.
					</div>

				</div>
			</ion-content>
		</ion-modal> 
</template>
  
<style scoped>
	.ios .icon {
		opacity: 50%;
	}

	.loginIntro {
		background: var(--ion-color-step-50);
		margin: 20px;
		border-radius: 10px;

		display: flex;
		flex-direction: row;
		align-items: center;

		padding: 20px;
		gap: 20px;
	}

	.loginIntro * {
		margin: 0;
	}

	.loginIntro .logo {
		height: 44px;
	}

	.loginIntro .introData {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.loginIntro .introData h2 {
		font-size: 18px;
	}

	.loginIntro .introData .description {
		font-size: 15px;
		opacity: 0.7;
	}

	.loginIntro .isEduconnectLogin {
		font-size: 15px;
		opacity: 0.5;
		margin-top: 10px;
	}

	.loginInput {
		margin: 0px 20px;
	}

	.loginBtn {
		margin-top: 20px;
		--border-radius: 8px !important;
	}

	.loginInput ion-item {
		margin-bottom: 10px;
	}

	.loginInput ion-item::part(native) {
		--border-color: var(--ion-color-step-200) !important;
		--border-top-left-radius: 8px !important;
		--border-top-right-radius: 8px !important;
	}

	.loginConditions {
		margin: 20px;
		font-size: 12px;
		opacity: 0.5;
		text-align: center;
	}
</style>
