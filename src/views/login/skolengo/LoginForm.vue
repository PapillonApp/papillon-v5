<script>
	import { defineComponent } from 'vue';
	import { IonItem, IonList, IonIcon, IonBackButton, IonSearchbar, IonListHeader, IonSpinner, loadingController, IonInput, 
	IonButton, actionSheetController, alertController } from '@ionic/vue';
	
	import { linkOutline, linkSharp, qrCodeOutline, qrCodeSharp, schoolOutline, schoolSharp, businessOutline, businessSharp, navigateOutline, navigateSharp, personCircleOutline, personCircleSharp, serverOutline, serverSharp } from 'ionicons/icons';

	import displayToast from '@/functions/utils/displayToast.js';
	import {ApiUrl, ApiVersion, Kdecole} from 'kdecole-api'

	export default defineComponent({
		name: 'FolderPage',
		props: ['ent'],
		computed: {
			ApiVersion() {
				return ApiVersion
			},
			ApiUrl() {
				return ApiUrl
			}
		},
		components: {
			IonBackButton,
			IonItem,
			IonList,
//			IonIcon,
//			IonSearchbar,
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
			//Nothing here
			
		},
		methods: {
			skolengoENTString(ent) {
                return ent.replace('PROD_', '').replace(/_/g, ' ').toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, l => l.toUpperCase())
            },
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
			
			async login() {
				const loading = await loadingController.create({
					message: 'Connexion en cours...'
				});

				console.log(this.ent)
				const ent = this.ent
				const username = this.$refs.user.$el.value;
				const password = this.$refs.pass.$el.value;

				loading.present();

				if(password.length === 125) {
					const user = new Kdecole(password, ApiVersion[ent], 0, 'https://cors.api.getpapillon.xyz/' + ApiUrl[ent])
					user.starting().then(() => {
						localStorage.token = password
						localStorage.loggedIn = true
						localStorage.loginService = "skolengo";
						localStorage.ent = ent;
						window.location.replace("/");
					}).catch((e) => {
						loading.dismiss()
						displayToast.presentError(`${e.message}`, "danger", e)
					})
				} else {
					Kdecole.login(username, password, ApiVersion[ent], 'https://cors.api.getpapillon.xyz/' + ApiUrl[ent]).then(token => {
						localStorage.token = token
						localStorage.loggedIn = true
						localStorage.loginService = "skolengo";
						localStorage.ent = ent;
						window.location.replace("/");
					}).catch((e) => {
						loading.dismiss()
						displayToast.presentError(`${e.message}`, "danger", e)
					})
				}
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
			<ion-title>Connexion à {{ skolengoENTString(this.ent) }}</ion-title>
			<ion-buttons slot="end" style="padding-right: 10px;">
				<ion-spinner v-if="isLoading"></ion-spinner>
			</ion-buttons>
		</ion-toolbar>
		
	</ion-header>
			<ion-content>
				<div class="loginPage">

					<div class="alphaMessage">
						<span class="material-symbols-outlined mdls icon">sms_failed</span>
						<div class="alphaText">
							<h2>{{ skolengoENTString(this.ent) }} est instable</h2>
							<p class="description">L'utilisation des ENT régionaux basés sur Skolengo avec Papillon est encore extrêmement instable. L'équipe de Papillon ne serait être tenue responsable de tout dysfonctionnement.</p>
						</div>
					</div>
					
					<div class="loginIntro">
						<img src="assets/welcome/skolengo_logo.png" alt="Pronote Logo" class="logo"/>
						<div class="introData">
							<h2>Connexion à Papillon</h2>
							<p class="description">Vous souhaitez vous connecter à <B>{{ skolengoENTString(this.ent) }}</B></p>
						</div>
					</div>

					<ion-list class="loginInput">
						<ion-item mode="md" fill="solid" class="userIn">
							<ion-label position="floating">Identifiant</ion-label>
							<ion-input ref="user" type="text" placeholder="j.dupont6" autocomplete="username"></ion-input>
						</ion-item>

						<ion-item mode="md" fill="solid" class="passIn">
							<ion-label position="floating">Mot de passe temporaire ou jeton</ion-label>
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

	.loginIntro {
		font-size: 15px;
		opacity: 0.5;
		margin-top: 10px;
	}

	/* Alpha warning */
	.alphaMessage {
		background: var(--ion-color-danger);
		margin: 20px;
		border-radius: 10px;

		display: flex;
		flex-direction: row;
		align-items: center;

		padding: 20px;
		gap: 20px;

		color: #fff;
	}

	.alphaMessage * {
		margin: 0;
	}

	.alphaMessage .icon {
		height: 44px;
		width: 44px;
		font-size: 30px;
		overflow: visible !important;

		color: #fff;
		opacity: 1 !important;
	}

	.alphaMessage .alphaText {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.alphaMessage .alphaText h2 {
		font-size: 18px;
	}

	.alphaMessage .alphaText .description {
		font-size: 15px;
		opacity: 0.7;
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
