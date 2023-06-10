<script>
	import { defineComponent } from 'vue';
	import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonButtons, IonList, IonListHeader, IonLabel, IonItem, actionSheetController, IonNavLink, IonChip, IonSkeletonText, IonAvatar } from '@ionic/vue';

	import { Browser } from '@capacitor/browser';

	import ThemeView from './ThemeView.vue';
	import OptionsView from './OptionsView.vue';
	import HomeCustomView from './HomeCustomView.vue';
	import UserView from './UserView.vue';
	import AdvancedView from './AdvancedView.vue';

	import packageInfo from '/package'
	import { Capacitor } from '@capacitor/core';

	import getContributors from '@/functions/fetch/GetContributors';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonContent,
			IonToolbar,
			IonTitle,
			IonMenuButton,
			IonButtons,
			IonList,
			IonLabel,
			IonItem,
			IonNavLink,
			IonChip,
			IonSkeletonText,
			IonAvatar
		},
		setup() {
			return { 
				appVersion: packageInfo.version,
				appCanal: packageInfo.canal,
				appPlatform: Capacitor.getPlatform(),
				localStorageSize: '',
			}
		},
		data() {
			return {
				contributors: [],
				contributorsLoading: true,
				userAvatar: '',
				ThemeView: ThemeView,
				OptionsView: OptionsView,
				HomeCustomView: HomeCustomView,
				UserView: UserView,
				AdvancedView: AdvancedView,
				randomTextWidth: [],
				randomTitleWidth: [],
			}
		},
		methods: {
			async logout() {
				const actionSheet = await actionSheetController.create({
					header: 'Êtes-vous sûr de vouloir vous déconnecter ?',
					subHeader: 'Vous perdrez vos paramètres et vos données seront supprimées de votre appareil.',
					buttons: [
						{
							text: 'Se déconnecter',
							role: 'destructive',
							data: {
								action: 'delete',
							},
							handler: () => {
								this.logoutFunc();
							},
						},
						{
							text: 'Annuler',
							role: 'cancel',
							data: {
								action: 'cancel',
							},
						},
					],
				});

				await actionSheet.present();
			},
			logoutFunc() {
				// empty all local storage
				localStorage.clear();
				// go to login page
				location.href = '/login';
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
			getApiVersion() {
				const API = this.$api;

				const cacheApiVersion = localStorage.getItem('apiVersion');

				fetch(API + "/infos")
					.then(response => response.json())
					.then(result => {
						const apiVer = result.version;
						localStorage.setItem('apiVersion', apiVer);
						this.apiVersion = apiVer;
					});

				this.apiVersion = cacheApiVersion ?? 'Inconnue';
			},
			async openURL(url) {
				await Browser.open({
					url: url,
					presentationStyle: 'popover',
				});
			},
			getContributorsList(){
				getContributors(5).then((contributors) => {
					setTimeout(() => {
						this.contributors = contributors;
						this.contributorsLoading = false;
					}, 1000);
				});
			},
			showChangelog() {
				document.dispatchEvent(new CustomEvent('showChangelog'));
			},
			getUserData() {
				const userData = JSON.parse(localStorage.getItem('userData'));

				if (userData) {
					this.userName = userData.student.name;
					this.userClass = userData.class.name;
					this.userSchool = userData.class.school;
					this.userAvatar = userData.student.avatar;

					// check if user has custom avatar
					if (localStorage.getItem('customAvatar')) {
						this.userAvatar = localStorage.getItem('customAvatar');
					}
					else if(localStorage.getItem('avatarCache')) {
						this.userAvatar = localStorage.getItem('avatarCache');
					}

					// check if user has custom name
					if (localStorage.getItem('customName')) {
						this.userName = localStorage.getItem('customName');
					}
				}
			}
		},
		mounted() {
			this.getApiVersion();

			// Get user data
			this.getUserData();

			document.addEventListener('userDataUpdated', () => {
				this.getUserData();
			});

			this.getApiVersion();
			this.getContributorsList();

			// Get localStorage size
			this.localStorageSize = this.getLocalStorageSize() + ' kb';

			// Set random width for skeleton text
			for (let i = 0; i < 6; i++) {
				this.randomTextWidth.push(Math.floor(Math.random() * 50) + 50);
				this.randomTitleWidth.push(Math.floor(Math.random() * 50) + 20);
			}
		}
	});
</script>

<template>
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>
				<ion-buttons slot="start">
					<ion-menu-button color="dark"></ion-menu-button>
				</ion-buttons>

				<ion-title>Paramètres</ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-header collapse="condense">
				<ion-toolbar>
					<ion-title size="large">Paramètres</ion-title>
				</ion-toolbar>
			</ion-header>

			<IonLabel class="listGroupTitle">
				<p>Utilisateur connecté</p>
			</IonLabel>

			<IonList class="listGroup" lines="none">
				<ion-nav-link router-direction="forward" :component="UserView">
					<IonItem button>
						<img :src="userAvatar" slot="start" class="avatar" />
						<IonLabel class="ion-text-wrap">
							<h2>{{ userName }}</h2>
							<p>{{ userClass }} - {{ userSchool }}</p>
						</IonLabel>
						<span class="only-md next-md-icon material-symbols-outlined mdls" slot="end">navigate_next</span>
					</IonItem>
				</ion-nav-link>
			</IonList>

			<IonLabel class="listGroupTitle">
				<p>Paramètres de base</p>
			</IonLabel>

			<IonList class="listGroup contains-nav-link">
				<ion-nav-link router-direction="forward" :component="OptionsView">
					<IonItem button>
						<span class="material-symbols-outlined mdls" slot="start">tune</span>
						<IonLabel class="ion-text-wrap">
							<h2>Options de Papillon</h2>
							<p>Modifier le comportement de Papillon</p>
						</IonLabel>
						<span class="only-md next-md-icon material-symbols-outlined mdls" slot="end">navigate_next</span>
					</IonItem>
				</ion-nav-link>
				<ion-nav-link router-direction="forward" :component="HomeCustomView">
					<IonItem button>
						<span class="material-symbols-outlined mdls" slot="start">home</span>
						<IonLabel class="ion-text-wrap">
							<h2>Personnalisation de l'écran d'accueil</h2>
							<p>Affichez ou masquez les informations à votre guise sur l'écran d'accueil !</p>
						</IonLabel>
						<span class="only-md next-md-icon material-symbols-outlined mdls" slot="end">navigate_next</span>
					</IonItem>
				</ion-nav-link>
				<ion-nav-link router-direction="forward" :component="ThemeView">
					<IonItem button>
						<span class="material-symbols-outlined mdls" slot="start">palette</span>
						<IonLabel class="ion-text-wrap">
							<h2>Apparence de Papillon</h2>
							<p>Ouvrir le menu de customisation de l'app</p>
						</IonLabel>
						<span class="only-md next-md-icon material-symbols-outlined mdls" slot="end">navigate_next</span>
					</IonItem>
				</ion-nav-link>
			</IonList>

			<IonLabel class="listGroupTitle">
				<p>Options avancées</p>
			</IonLabel>

			<IonList class="listGroup contains-nav-link">
				<IonItem button @click="logout()">
					<span class="material-symbols-outlined mdls" slot="start">logout</span>
					<IonLabel class="ion-text-wrap">
						<h2>Se déconnecter de Papillon</h2>
						<p>Supprime toutes les données de connexion de l'application</p>  
					</IonLabel>
					<span class="only-md next-md-icon material-symbols-outlined mdls" slot="end">navigate_next</span>
				</IonItem>
				<ion-nav-link router-direction="forward" :component="AdvancedView">
					<IonItem button>
						<span class="material-symbols-outlined mdls" slot="start">monitor_heart</span>
						<IonLabel class="ion-text-wrap">
							<h2>Options avancées</h2>
							<p>Permettent de manipuler Papillon en détail</p>
						</IonLabel>
						<span class="only-md next-md-icon material-symbols-outlined mdls" slot="end">navigate_next</span>
					</IonItem>
				</ion-nav-link>
			</IonList>

			<IonLabel class="listGroupTitle">
				<p>Contributeurs les plus actifs</p>
			</IonLabel>

			<IonList class="listGroup">
				<div v-if="contributors != null && !contributorsLoading">
					<IonItem v-for="(contributor, i) in contributors" :key="i" button @click="openURL(contributor.html_url)">
						<img :src="contributor.avatar_url" slot="start" class="avatar" />
						<IonLabel>
							<h2>{{ contributor.login }}</h2>
							<p>{{ contributor.contributions }} contributions à Papillon</p>
						</IonLabel>
					</IonItem>
				</div>

				<div v-else>
					<IonItem v-for="n in 5" :key="n">
						<ion-avatar slot="start" class="avatar">
							<IonSkeletonText :animated="true" :style="{width: '100%', height: '100%'}"></IonSkeletonText>
						</ion-avatar>

						<IonLabel>
							<IonSkeletonText :animated="true" :style="{width: randomTitleWidth[n] + '%', height: '12px'}"></IonSkeletonText>
							<IonSkeletonText :animated="true" :style="{width: randomTextWidth[n] + '%', 'margin-top': '10px'}"></IonSkeletonText>
						</IonLabel>
					</IonItem>
				</div>
			</IonList>

			<IonLabel class="listGroupTitle">
				<p>Communauté & liens externes</p>
			</IonLabel>

			<IonList class="listGroup">
				<IonItem button @click="openURL('https://ko-fi.com/thepapillonapp')" class="only-md">
					<span class="material-symbols-outlined mdls" slot="start">volunteer_activism</span>
					<IonLabel>
						<p>Donation</p>
						<h2>Nous soutenir</h2>
					</IonLabel>
				</IonItem>
				
				<IonItem button @click="openURL('https://discord.gg/DMx3TDyz2U')">
					<span class="material-symbols-outlined mdls" slot="start">support</span>
					<IonLabel>
						<p>Discord</p>
						<h2>Rejoindre le serveur Discord</h2>
					</IonLabel>
				</IonItem>
				<IonItem button @click="openURL('https://github.com/PapillonApp/papillon-v5/')">
					<span class="material-symbols-outlined mdls" slot="start">data_object</span>
					<IonLabel>
						<p>GitHub</p>
						<h2>Contribuer au projet Papillon</h2>
					</IonLabel>
				</IonItem>
				<IonItem button @click="openURL('https://docs.getpapillon.xyz/documents/politique-de-confidentialite-et-mentions-legales')">
					<span class="material-symbols-outlined mdls" slot="start">shield</span>
					<IonLabel>
						<p>Document officiel</p>
						<h2>Politique de confidentialité</h2>
					</IonLabel>
				</IonItem>
			</IonList>

			<IonLabel class="listGroupTitle">
				<p>A propos de l'app</p>
			</IonLabel>

			<IonList class="listGroup">
				<IonItem @click="showChangelog">
					<span class="material-symbols-outlined mdls" slot="start">security_update_good</span>
					<IonLabel>
						<p>Version de l'app</p>
						<h2>{{ appVersion }}-{{ appPlatform }}</h2>
					</IonLabel>

					<IonChip v-if="appCanal == 'dev'" slot="end" color="danger">
						Développement
					</IonChip>
					<IonChip v-if="appCanal == 'beta'" slot="end" color="warning">
						Accès anticipé
					</IonChip>
				</IonItem>

				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">webhook</span>
					<IonLabel>
						<p>Version de l'API</p>
						<h2>{{ apiVersion }}</h2>
					</IonLabel>
				</IonItem>

				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">storage</span>
					<IonLabel>
						<p>Taille du cache</p>
						<h2>{{ localStorageSize }}</h2>
					</IonLabel>
				</IonItem>
			</IonList>
		</ion-content>
</template>
  
<style scoped>
	.avatar {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		object-fit: cover;
	}

	.next-md-icon {
		opacity: 0.5;
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
