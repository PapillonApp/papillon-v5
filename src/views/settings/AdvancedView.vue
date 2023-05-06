<script>
	import { defineComponent } from 'vue';
	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonItem,
		IonLabel,
		IonButtons,
		IonTitle,
		IonContent,
		IonNavLink,
		loadingController,
		IonBackButton
	} from '@ionic/vue';

	import LogView from './LogView.vue';

	import displayToast from '@/functions/utils/displayToast.js';
	import GetToken from '@/functions/login/GetToken.js';
	import { fetchDaysOffAndHolidays } from '@/functions/utils/datetimePicker.js';
	import PapillonBackButton from '@/components/PapillonBackButton.vue';

	import { Dialog } from '@capacitor/dialog';

	import { checkmarkOutline, informationOutline, warningOutline } from 'ionicons/icons';

	import { SplashScreen } from '@capacitor/splash-screen';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonButtons,
			IonBackButton,
			IonList,
			IonItem,
			IonLabel,
			IonTitle,
			IonContent,
			IonNavLink,
		},
		data() {
			return {
				LogView: LogView,
				
			}
		},
		methods: {
			pop() {
				return false;
			},
			resetColors() {
				localStorage.removeItem('SubjectColors');
				displayToast.presentToastSmall("Couleurs réinitialisées.", "success", checkmarkOutline)
				setTimeout(() => {
					this.localStorageSize = this.getLocalStorageSize() + ' kb';
				}, 1000);
			},
			async emptyCache() {
				const loading = await loadingController.create({
					message: 'Veuillez patienter...'
				});
					
				loading.present();
				// empty cache
				localStorage.removeItem('UserCache');
				localStorage.removeItem('TimetableCache');
				localStorage.removeItem('NewsCache');
				localStorage.removeItem('GradeCache');
				localStorage.removeItem('HomeworkCache');
				localStorage.removeItem('AbsencesCache');
				localStorage.removeItem('PunishmentsCache');
				localStorage.removeItem('DelaysCache');
				localStorage.removeItem('MenuCache');
				localStorage.removeItem('ConversationsCache');
				localStorage.removeItem('SubjectColors');
				await GetToken()
				.catch((err) => {
					loading.dismiss()
					displayToast.presentError("Erreur lors de la reconnexion, veuillez réessayer ultérieurement.", "danger", err)
				})
				// show toast
				this.localStorageSize = this.getLocalStorageSize() + ' kb';
				loading.dismiss()
				displayToast.presentToastSmall("Le cache a bien été vidé", "success", checkmarkOutline)
			},
			getLocalStorageSize() {
				let total = 0;
				for (let i = 0; i < localStorage.length; i++) {
					let key = localStorage.key(i);
					let value = localStorage.getItem(key);
					total += value.length;
				}
				return total / 1024;
			},
			async setAcadName() {
				const { value, cancelled } = await Dialog.prompt({
					title: 'Nom de l\'académie',
					message: 'Entrez le nom de l\'académie.\nAttention, cela doit être le nom exact de l\'académie, sinon les vacances scolaires ne seront pas affichées correctement.',
					cancelable: true,
					inputPlaceholder: 'Bordeaux',
					confirmButtonText: 'Valider',
					cancelButtonText: 'Réinitialiser',
				});

				if (value) {
					localStorage.setItem('acadName', value);
					displayToast.presentToastSmall("Nom de l'académie enregistré.", "success", checkmarkOutline)
				}

				if (cancelled) {
					displayToast.presentToastSmall("Annulé", "tertiary", informationOutline)
				}
			},
			async refreshToken() {
				const loading = await loadingController.create({
					message: 'Reconnexion, veuillez patienter...'
				});
				loading.present()
				await GetToken()
				.then(() => {
					displayToast.presentToastSmall("Reconnecté avec succès", "success", checkmarkOutline)
					loading.dismiss()
				})
				.catch((err) => {
					loading.dismiss()
					displayToast.presentError("Erreur lors de la reconnexion, veuillez réessayer ultérieurement.", "danger", err)
				})
			},
			clearLogs() {
				localStorage.setItem("logs", JSON.stringify([]));
				this.logs = [];

				displayToast.presentToastSmall("Logs effacés avec succès", "success", checkmarkOutline)
			},
			async setCustomApiUrl() {
				const { value, cancelled } = await Dialog.prompt({
					title: 'URL personnalisée',
					message: 'Entrez l\'URL personnalisée de l\'API (ou laissez vide pour réinitialiser)',
					cancelable: true,
					inputPlaceholder: 'https://api.getpapillon.xyz',
					confirmButtonText: 'Valider',
					cancelButtonText: 'Réinitialiser',
				});

				if (value) {
					localStorage.setItem('customApiUrl', value);
					displayToast.presentToastSmall("URL personnalisée enregistrée", "success", checkmarkOutline)

					await Dialog.alert({
						title: 'Attention',
						message: 'Vous devez redémarrer l\'application pour que les changements soient pris en compte',
						confirmButtonText: 'OK',
					});
				}
				if(!value) {
					displayToast.presentToastSmall("L'API utilisée a été réinitialisée.", "warning", warningOutline)
					localStorage.removeItem('customApiUrl');
					await Dialog.alert({
						title: 'Attention',
						message: 'Vous devez redémarrer l\'application pour que les changements soient pris en compte',
						confirmButtonText: 'OK',
					});
				}
				if (cancelled) {
					displayToast.presentToastSmall("Annulé", "tertiary", informationOutline)
				}
			},
			async refreshDaysAndHolidays() {
				const loading = await loadingController.create({
					message: 'Veuillez patienter...'
				});
					
				loading.present();
				try {
					await fetchDaysOffAndHolidays()
					loading.dismiss()
					displayToast.presentToastSmall("Jours fériés et vacances scolaires mis à jour", "success", checkmarkOutline)
				} catch (error) {
					loading.dismiss()					
				}
			},
			async rebootApp() {
				SplashScreen.show()
				document.location.pathname = "/home"
			}
		},
		mounted() {
			localStorage.getItem('loginService') == 'pronote' ? this.isPronote = true : this.isPronote = false;
			return false;
		}
	});
</script>

<template>
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<IonBackButton class="only-ios" text="Paramètres" @click="pop"></IonBackButton>
					<IonBackButton class="only-md" @click="pop"></IonBackButton>
				</ion-buttons>

				<ion-title>Options avancées</ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-header collapse="condense">
				<ion-toolbar>
					<ion-title size="large">Options avancées</ion-title>
				</ion-toolbar>
			</ion-header>

			<IonLabel class="listGroupTitle">
				<p>Options disponibles</p>
			</IonLabel>

			<IonList class="listGroup" lines="inset">
				<IonItem button @click="emptyCache()">
					<span class="material-symbols-outlined mdls" slot="start">auto_delete</span>
					<IonLabel class="ion-text-wrap">
						<h2>Vider le cache des données</h2>
						<p>Réinitialise les données pré-téléchargées hors ligne</p>  
					</IonLabel>
				</IonItem>

				<IonItem button @click="resetColors()">
					<span class="material-symbols-outlined mdls" slot="start">format_color_fill</span>
					<IonLabel class="ion-text-wrap">
						<h2>Réattribuer les couleurs de matières</h2>
						<p>Réinitialise les couleurs des matières pour en obtenir de nouvelles</p>  
					</IonLabel>
				</IonItem>

				<IonItem button @click="refreshToken()">
					<span class="material-symbols-outlined mdls" slot="start">key</span>
					<IonLabel class="ion-text-wrap">
						<h2>Régénérer les clés de connexion</h2>
						<p>Permet de demander une nouvelle autorisation à votre établissement</p>  
					</IonLabel>
				</IonItem>

				<IonItem button @click="refreshDaysAndHolidays()">
					<span class="material-symbols-outlined mdls" slot="start">event_repeat</span>
					<IonLabel class="ion-text-wrap">
						<h2>Récupérer de nouveau les vacances et jours fériés</h2>
						<p>Permet de faire une nouvelle requête et de remplacer les vacances et jours fériés actuellement enregistrés</p>  
					</IonLabel>
				</IonItem>

				<IonItem button @click="setAcadName()">
					<span class="material-symbols-outlined mdls" slot="start">badge</span>
					<IonLabel class="ion-text-wrap">
						<h2>Définir l'académie utilisée</h2>
						<p>Permet de définir l'académie d'appartenance manuellement</p>  
					</IonLabel>
				</IonItem>

				<IonItem button @click="setCustomApiUrl()" v-if="isPronote">
					<span class="material-symbols-outlined mdls" slot="start">api</span>
					<IonLabel class="ion-text-wrap">
						<h2>Changer d'API</h2>
						<p>Permet de définir sa propre URL vers une instance de Papillon-Python</p>  
					</IonLabel>
				</IonItem>

				<IonItem button @click="clearLogs()">
					<span class="material-symbols-outlined mdls" slot="start">delete_sweep</span>
					<IonLabel class="ion-text-wrap">
						<h2>Effacer les logs</h2>
						<p>Supprime les logs de l'application</p>  
					</IonLabel>
				</IonItem>

				<IonItem button @click="rebootApp()">
					<span class="material-symbols-outlined mdls" slot="start">restart_alt</span>
					<IonLabel class="ion-text-wrap">
						<h2>Redémarrer Papillon</h2>
						<p>Permet de redémarrer Papillon sans le fermer, pour appliquer des changements</p>  
					</IonLabel>
				</IonItem>

				<ion-nav-link router-direction="forward" :component="LogView">
					<IonItem button>
						<span class="material-symbols-outlined mdls" slot="start">developer_mode</span>
						<IonLabel>
							<h2>Voir les logs</h2>
							<p>Consulter les logs de l'application</p>
						</IonLabel>
					</IonItem>
				</ion-nav-link>
				<IonItem button @click="rebootApp()">
					<span class="material-symbols-outlined mdls" slot="start">restart_alt</span>
					<IonLabel class="ion-text-wrap">
						<h2>Redémarrer Papillon</h2>
						<p>Permet de redémarrer Papillon sans le fermer, pour appliquer des changements</p>  
					</IonLabel>
				</IonItem>
			</IonList>
		</ion-content>
</template>

<style scoped>
	.md .paddingFixMd {
		padding-left: 15px;
	}

	ion-item .mdls[slot=start] {
		width: auto;
		padding: 7px;
		background-color: #00000012;
		border-radius: 300px;

		margin-right: 20px;
	}

	.dark ion-item .mdls[slot=start] {
		background-color: #ffffff22;
	}
</style>