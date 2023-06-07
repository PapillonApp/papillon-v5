<script lang="ts">
import { IonApp, IonContent, IonButton, IonButtons, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonRouterOutlet, IonHeader, IonToolbar, IonSplitPane, toastController, IonSkeletonText, alertController, IonModal, IonThumbnail } from '@ionic/vue';

import { StatusBar, Style } from '@capacitor/status-bar';

import { Browser } from '@capacitor/browser';

const { BackgroundFetch } = require("@transistorsoft/capacitor-background-fetch");

import { Capacitor } from '@capacitor/core';

const { version, canal } = require('/package')

import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';

const { changelog } = require('/src/update')

import { globeOutline } from 'ionicons/icons';
import { AndroidShortcuts } from 'capacitor-android-shortcuts';

import { createAnimation } from '@ionic/vue';

const GetUser = require('./functions/fetch/GetUserData');
const GetRecap = require('./functions/fetch/GetRecap');
const GetToken = require('./functions/login/GetToken');

import { LocalNotifications } from '@capacitor/local-notifications';

import { SplashScreen } from '@capacitor/splash-screen';

// defines the user data return interface
interface UserData {
	student: {
		name: string,
		avatar: string,
		ine: string,
		contact: {
			email: string,
			phone: string
		}
	},
	class: {
		name: string,
		school: string
	}
}

export default defineComponent({
	name: 'App',
	components: {
		IonApp,
		IonContent,
		IonItem,
		IonLabel,
		IonList,
		IonMenu,
		IonMenuToggle,
		IonRouterOutlet,
		IonSplitPane,
		IonHeader,
		IonToolbar,
		IonSkeletonText,
		IonModal,
		IonThumbnail,
		IonButtons,
		IonButton
	},
	data() {
		return {
			loggedIn: localStorage.loggedIn,
			dataLoading: true,
			userData: {
				student: {
					name: '',
					avatar: '',
					ine: '',
					contact: {
						email: '',
						phone: ''
					}
				},
				class: {
					name: '',
					school: ''
				}
			},
			avatar: '',
			presentingElement: undefined as any,
			isMenuOpened: false,
			changeStatusTimeout: true,
			connectedToServer: "",
			showTransition: undefined as any,
			selectedIndex: 0,
		}
	},
	setup() {
		// defines the tabs shown in the menu
		// GLOBAL - Accueil
		const appPages = [
			{
				title: 'Accueil',
				url: '/home',
				icon: "home",
				disabled: false
			}
		];

		// SKOLENGO
		if (localStorage.getItem("loginService") === "skolengo") {
			appPages.push({
					title: 'Emploi du temps',
					url: '/timetable',
					icon: "calendar_month",
					disabled: false,
				},
				{
					title: 'Travail à faire',
					url: '/homework',
					icon: "auto_stories",
					disabled: false,
				},
				{
					title: 'Actualités',
					url: '/news',
					icon: "newspaper",
					disabled: false,
				})
		}

		// PRONOTE
		if (localStorage.getItem("loginService") === "pronote") {
			appPages.push({
					title: 'Emploi du temps',
					url: '/timetable',
					icon: "calendar_month",
					disabled: false,
				},
				{
					title: 'Travail à faire',
					url: '/homework',
					icon: "auto_stories",
					disabled: false,
				},
				{
					title: 'Notes',
					url: '/grades',
					icon: "insights",
					disabled: false,
				})

			if (localStorage.getItem('viescolaireEnabled') == 'true') {
				appPages.push({
					title: 'Vie scolaire',
					url: '/schoollife',
					icon: "gavel",
					disabled: false,
				})
			}
			appPages.push({
					title: 'Actualités',
					url: '/news',
					icon: "newspaper",
					disabled: false,
				},
				{
					title: 'Conversations',
					url: '/conversations',
					icon: "forum",
					disabled: false,
				})
		}

		// ECOLEDIRECTE
		if (localStorage.getItem("loginService") === "ecoledirecte") {
			let usercache = localStorage.getItem("UserCache");
			if (usercache != null) {
				let JSONUserCache = JSON.parse(usercache);
				JSONUserCache.modules.forEach((module1: any) => {
					switch (module1.code) {
						case "VIE_SCOLAIRE":
							if (module1.enable) {
								appPages.push({
									title: 'Vie scolaire',
									url: '/schoollife',
									icon: "gavel",
									disabled: false
								})
							}
							break;
						case "VIE_DE_LA_CLASSE":
							if (module1.enable) {
								appPages.push({
									title: 'Vie de la classe (non dispo.)',
									url: '/classlife',
									icon: "forum",
									disabled: true
								})
							}
							break;
						case "NOTES":
							if (module1.enable) {
								appPages.push({
									title: 'Notes',
									url: '/grades',
									icon: "insights",
									disabled: false
								})
							}
							break;
						case "CLOUD":
							if (module1.enable) {
								appPages.push({
									title: 'Cloud (non dispo.)',
									url: '/cloud',
									icon: "cloud",
									disabled: true
								})
							}
							break;
						case "MESSAGERIE":
							if (module1.enable) {
								appPages.push({
									title: 'Messagerie (non dispo.)',
									url: '/mails',
									icon: "mail",
									disabled: true
								})
							}
							break;
						case "EDT":
							if (module1.enable) {
								appPages.push({
									title: 'Emploi du temps',
									url: '/timetable',
									icon: "calendar_month",
									disabled: false
								})
							}
							break;
						//documents élèves
						case "CAHIER_DE_TEXTES":
							if (module1.enable) {
								appPages.push({
									title: 'Travail à faire',
									url: '/homework',
									icon: "auto_stories",
									disabled: false
								})
							}
							break;
					}
				})

			}
		}

		// GLOBAL - Paramètres
		appPages.push({
			title: 'Paramètres',
			url: '/settings',
			icon: "settings",
			disabled: false
		})

		const route = useRoute();

		return {
			appCanal: canal,
			appVersion: version,
			appUpdates: changelog,
			appPages,
			labels: [],
			isSelected: (url: string) => url === route.path ? 'selected' : ''
		}
	},
	methods: {
		checkAndroidShortcuts() {
			AndroidShortcuts.isDynamicSupported().then((result) => {
				if (result) {
					AndroidShortcuts.addListener('shortcut', (response: any) => {
						switch (response.data) {
							case "timetable":
								this.$router.push('/timetable');
								break;
							case "homework":
								this.$router.push('/homework');
								break;
							case "grades":
								this.$router.push('/grades');
								break;
							default:
								break;
						}
					});
				}
			})
		},
		async notify(title: string, body: string) {
			LocalNotifications.schedule({
				notifications: [
					{
						title: title,
						body: body,
						id: this.randomID(),
						schedule: { at: new Date(Date.now() + 1000) },
					}
				]
			});
		},
		async openURL(url: string) {
			await Browser.open({
				url: url,
				presentationStyle: 'popover',
			});
		},
		randomID() {
			return Math.floor(Math.random() * 100000 + 1000);
		},
		async backgroundFetchEvent(taskId: any) {
			GetToken.default().then(async (token: any) => {
				if (token) {
					GetRecap.default().then(async (recap: any) => {
						if (recap) {
							// grades
							const lastGrades = JSON.parse(localStorage.getItem('lastGrades') || '[]');
							const recapGrades = recap.grades.last;

							if (lastGrades.length === 0) {
								localStorage.setItem('lastGrades', JSON.stringify(recapGrades));
							}
							else if (JSON.stringify(lastGrades[0]) == JSON.stringify(recapGrades[0])) {
								// get last grade
								let lastGrade = recapGrades[0];
								let description = lastGrade.info.description

								// get grade as 20
								let gradeAs20 = Math.round((lastGrade.grade.value / lastGrade.grade.out_of) * 20);

								const reactions = {
									0: 'Bon... 💀',
									5: 'Aïe aïe aïe... 😤',
									10: 'Peut-être une prochaine fois... 🫡',
									12: 'Bien joué 👍',
									14: 'Sympa ! 👌',
									17: 'Bravo ! 🤩',
									18: 'Félicitations ! 👏',
									20: 'Champagne ! 🍾'
								}

								let reaction = '';

								// get reaction if gradeAs20 is over a certain value
								for (const [key, value] of Object.entries(reactions)) {
									if (gradeAs20 >= parseInt(key)) {
										reaction = value;
									}
								}

								if (description.trim() === '') {
									description = 'votre nouvelle note.';
								}
								else {
									description = '"' + description + '".';
								}

								this.notify(
									'Nouvelle note en ' + lastGrade.info.subject,
									'Vous avez eu ' + lastGrade.grade.value + '/' + lastGrade.grade.out_of + ' sur ' + description + ' ' + reaction
								);

								localStorage.setItem('lastGrades', JSON.stringify(recapGrades));
							}
						}
						await BackgroundFetch.finish(taskId);
					});
				}
			});
		},
		async configureBackgroundFetch() {
			await BackgroundFetch.configure({ minimumFetchInterval: 15 }, async (taskId: any) => {
				console.log('[js] BackgroundFetch event received: ', taskId);

				try {
					this.backgroundFetchEvent(taskId);
				} catch (e) {
					console.error(e);
					await BackgroundFetch.finish(taskId);
				}
			}, () => {
				console.error('[js] RNBackgroundFetch failed to start');
			});
		},
		checkIosShortcuts() {
			return false;
		},
		RGBToHSL(r: number, g: number, b: number) {
			r /= 255;
			g /= 255;
			b /= 255;
			const l = Math.max(r, g, b);
			const s = l - Math.min(r, g, b);
			const h = s
				? l === r
					? (g - b) / s
					: l === g
						? 2 + (b - r) / s
						: 4 + (r - g) / s
				: 0;
			return [
				60 * h < 0 ? 60 * h + 360 : 60 * h,
				100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
				(100 * (2 * l - s)) / 2,
			];
		},
		async presentToast(header: string, msg: string, color: string, icon: any) {
			const toast = await toastController.create({
				header: header,
				duration: 2000,
				position: "top",
				color: color,
				icon: icon,
				cssClass: "toast-small",
			});

			await toast.present();
		},
		getUserData() {
			// get user data
			this.dataLoading = true;
			GetUser.default().then((data: UserData) => {
				this.userData = data;

				if (data.student) {
					this.dataLoading = false;
				}

				if (!localStorage.getItem('avatarCache')) {
					this.avatar = data.student.avatar;
				}

				// check if user has custom name
				if (localStorage.getItem('customName')) {
					this.userData.student.name = localStorage.getItem('customName') as string;
				}

				// set userData in localStorage
				if (data !== undefined) {
					localStorage.userData = JSON.stringify(data);

					document.dispatchEvent(new CustomEvent('userDataLoaded'));
				}

				// put last word of this.userData.student.name first
				const name = this.userData.student.name.split(' ');
				const lastName = name[name.length - 1];
				name.pop();
				name.unshift(lastName);
				this.userData.student.name = name.join(' ');
			});
		},
		changePage(url: string, index: number) {
			console.log(index);

			// change index
			this.selectedIndex = index;

			// close menu
			const menu = document.querySelector('ion-menu');
			setTimeout(() => {
				menu?.toggle();
			}, 100);
		},
		async askNotifPerms() {
			await LocalNotifications.requestPermissions();
		},
		async TestNotif() {
			const toast = await toastController.create({
				header: "Bonjour, c'est une notification de test !",
				message: "Exemple de notification",
				duration: 200000,
				position: "top",
				color: "light",
			});

			await toast.present();
		},
		transition(baseEl: any, opts: any) {
			const enteringAnimation = createAnimation()
				.addElement(opts.enteringEl)
				.fromTo('opacity', 0, 1)
				.duration(100);

			const leavingAnimation = createAnimation()
				.addElement(opts.leavingEl)
				.fromTo('opacity', 1, 0)
				.duration(100);

			const animation = createAnimation()
				.addAnimation(enteringAnimation)
				.addAnimation(leavingAnimation);

			return animation;
		},
		async menuOpened(isOpen: boolean) {
			if (isOpen) {
				StatusBar.setStyle({ style: Style.Dark })
			}
			else {
				if (this.changeStatusTimeout) {
					StatusBar.setStyle({ style: Style.Default })
				}

				setTimeout(() => {
					if (this.isMenuOpened == true) {
						StatusBar.setStyle({ style: Style.Dark })
					}
				}, 500);
			}
		},
		async displayDevMsg() {
			const alert = await alertController.create({
				header: 'Version de développement',
				message: 'Papillon fonctionne actuellement en mode développement. Certaines fonctionnalités ne sont pas encore terminées et risquent de ne pas fonctionner correctement.',
				mode: 'md',
				buttons: ['Je comprends']
			});

			await alert.present();
		},
		async displayDevMessage() {
			const alert = await alertController.create({
				header: 'Fonctionnalité non disponible',
				message: "Cette fonctionnalité n'est pas disponible pour le moment. Elle le sera prochainement.",
				mode: 'md',
				buttons: ['Je comprends']
			});

			await alert.present();
		},
		showChangelog() {
			// update version
			localStorage.setItem('version', this.appVersion);

			// show changelog
			const changelogModal = (this.$refs.changelogModal as any).$el;
			changelogModal.present();
		},
		hideChangelog() {
			const changelogModal = (this.$refs.changelogModal as any).$el;
			changelogModal.dismiss();
		},
		setSelectedIndex(path: string) {
			// find index of page in appPages
			let index = this.appPages.findIndex((page) => {
				return page.url == path;
			});

			// change index
			this.selectedIndex = index;
		},
	},
	watch: {
		$route(to, from) {
			let path = to.path;
			this.setSelectedIndex(path);
		}
	},
	mounted() {
		// get current page from URL
		const currentUrl = window.location.pathname;
		this.setSelectedIndex(currentUrl);

		// hide splash screen when dom is loaded
		this.$nextTick(function () {
			setTimeout(() => {
				SplashScreen.hide();
			}, 220);
		})

		// shortcuts
		if (Capacitor.getPlatform() === 'android') {
			this.checkAndroidShortcuts();
		}
		else if (Capacitor.getPlatform() === 'ios') {
			this.checkIosShortcuts();
			this.configureBackgroundFetch();
		}

		// user data if logged in
		if (localStorage.loggedIn) {
			this.getUserData();
		}

		let lastRefesh = new Date();

		document.addEventListener('connectionState', (e: any) => {
			let state = e.detail;
			this.connectedToServer = state;

			lastRefesh = new Date();
		});

		// check if lastRefesh is older than 5 minutes
		setInterval(() => {
			let now = new Date();
			let diff = now.getTime() - lastRefesh.getTime();
			let minutes = Math.floor((diff / 1000) / 60);

			if (minutes >= 5) {
				this.connectedToServer = "paused";
			}
		}, 1000);

		document.addEventListener('tokenUpdated', () => {
			this.getUserData();
		});

		// if avatarCache is set, make it the avatar
		if (localStorage.getItem('customAvatar')) {
			this.avatar = localStorage.getItem('customAvatar') as string;
		}
		else if (localStorage.getItem('avatarCache')) {
			this.avatar = localStorage.getItem('avatarCache') as string;
		}

		document.addEventListener('userDataUpdated', () => {
			if (localStorage.getItem('customAvatar')) {
				this.avatar = localStorage.getItem('customAvatar') as string;
			}
			else if (localStorage.getItem('avatarCache')) {
				this.avatar = localStorage.getItem('avatarCache') as string;
			}

			// check if user has custom name
			if (localStorage.getItem('customName')) {
				this.userData.student.name = localStorage.getItem('customName') as string;
			}
			else {
				this.getUserData();
			}
		});

		// check internet connection
		window.addEventListener('online', () => {
			this.presentToast('Vous êtes de nouveau connecté.', 'Certaines informations nécessiteront peut-être un rafraîchissement.', 'success', globeOutline)
			document.dispatchEvent(new CustomEvent('connectionState', { detail: 'paused' }));
		});

		window.addEventListener('offline', () => {
			this.presentToast('Vous n\'êtes plus connecté à Internet.', 'Vous n\'aurez accès qu\'aux informations déjà téléchargées.', 'danger', globeOutline)
			document.dispatchEvent(new CustomEvent('connectionState', { detail: 'disconnected' }));
		});

		// check if online
		if (!navigator.onLine) {
			this.presentToast('Vous n\'êtes pas connecté à Internet.', 'Vous n\'aurez accès qu\'aux informations déjà téléchargées.', 'danger', globeOutline)
			document.dispatchEvent(new CustomEvent('connectionState', { detail: 'disconnected' }));
		}

		this.askNotifPerms();

		// on settingsUpdated event, setup the app
		document.addEventListener('settingsUpdated', () => {
			// if viescolaireEnabled is set to false, remove school life tab
			if (localStorage.getItem('viescolaireEnabled') !== 'true') {
				// remove school life tab
				this.appPages.splice(3, 1);
			}
			else {
				// add school life tab
				this.appPages.splice(3, 0, {
					title: 'Vie scolaire',
					url: '/schoollife',
					icon: "gavel",
					disabled: false
				});
			}
		});

		// apply customizations
		if (localStorage.getItem('customizations')) {
			let customizations = JSON.parse(localStorage.getItem('customizations') as string);

			if (customizations.color) {
				document.body.style.setProperty('--ion-color-primary', customizations.color.color.hex);
				document.body.style.setProperty('--ion-color-primary-rgb', customizations.color.color.rgb);
			}
		}

		// check current version in local storage
		if (localStorage.getItem('version')) {
			if (localStorage.getItem('version') !== this.appVersion) {
				this.showChangelog();
			}
		}
		else if (!this.loggedIn) {
			// do nothing
		}
		else {
			// this.showChangelog();
		}

		document.addEventListener('showChangelog', () => {
			this.showChangelog();
		})

		document.addEventListener('navTransitionEnable', (e: any) => {
			this.showTransition = undefined;

			setTimeout(() => {
				this.showTransition = this.transition;
			}, 200);

			console.log('navTransitionEnable', e.detail);
		});
	}
});
</script>

<template>
	<ion-app>
		<div id="debug_banner" v-if="appCanal == 'dev'" @click="displayDevMsg">
			Devbuild
		</div>

		<ion-split-pane content-id="main-content">
			<ion-menu @ionWillOpen="menuOpened(true)" @ionWillClose="menuOpened(false)" @ionDidOpen="menuOpened(true)"
				@ionDidClose="menuOpened(false)" type="overlay" content-id="main-content" class="menu" v-if="loggedIn"
				:swipeGesture="true">
				<ion-header collapse="fade">
					<div class="userItem" :style="`background-image: url('${avatar}');`">
						<div class="userItem_content">
							<div class="avatar" v-if="dataLoading">
								<ion-skeleton-text :animated="true"
									style="width: 100%;height: 100%;border-radius: 50%;"></ion-skeleton-text>
							</div>
							<img v-else class="avatar" :src="avatar" ref="avatar" />

							<div class="userData" v-if="dataLoading">
								<h3><ion-skeleton-text :animated="true"
										style="width: 40%;margin-bottom: 5px;height: 18px;"></ion-skeleton-text></h3>
								<p><ion-skeleton-text :animated="true" style="width: 80%;"></ion-skeleton-text></p>
							</div>
							<div class="userData" v-else>
								<h3>{{ userData.student.name }}</h3>
								<p v-if="userData.class.school.trim() != ''">{{ userData.class.name }} —
									{{ userData.class.school }}</p>
							</div>
						</div>
					</div>
				</ion-header>
				<ion-content>
					<ion-list id="inbox-list">
						<ion-item mode="md" @click="changePage(p.url, i)" :router-link="p.url" v-for="(p, i) in appPages" :key="i" button routerDirection="root" lines="none" :detail="false" :class="{ selected: selectedIndex === i }">
							<span class="material-symbols-outlined mdls" slot="start">{{ p.icon }}</span>
							<ion-label>{{ p.title }}</ion-label>
						</ion-item>
					</ion-list>

					<ion-list id="bottomActionsList">
						<ion-item @click="openURL('https://docs.getpapillon.xyz')" button mode="md" lines="none"
							:detail="false">
							<span class="material-symbols-outlined mdls" slot="start">support</span>
							<ion-label>Aide de Papillon</ion-label>
						</ion-item>
						<ion-item button mode="md" lines="none" :detail="false">
							<span class="material-symbols-outlined mdls" slot="start">dns</span>
							<ion-label>Serveur</ion-label>

							<ion-chip slot="end" color="success" v-if="connectedToServer == 'connected'">
								<ion-label>Connecté</ion-label>
							</ion-chip>
							<ion-chip slot="end" color="warning" v-else-if="connectedToServer == 'connecting'">
								<ion-label>Reconnexion</ion-label>
							</ion-chip>
							<ion-chip slot="end" color="danger" v-else-if="connectedToServer == 'disconnected'">
								<ion-label>Déconnecté</ion-label>
							</ion-chip>
							<ion-chip slot="end" color="medium" v-else>
								<ion-label>En pause</ion-label>
							</ion-chip>
						</ion-item>
					</ion-list>
				</ion-content>
			</ion-menu>
			<ion-router-outlet ref="outlet" :animated="true" :animation="transition" id="main-content" v-slot="{ Component }">
				<component :is="Component" />
			</ion-router-outlet>
		</ion-split-pane>
		
		<ion-modal ref="changelogModal">
			<ion-header>
				<ion-toolbar>
					<ion-title>Notes de mise à jour</ion-title>
					<ion-buttons slot="end">
						<ion-button :strong="true" @click="hideChangelog">Terminé</ion-button>
					</ion-buttons>
				</ion-toolbar>
			</ion-header>
			<ion-content class="update">
				<div class="update_inner">
					<div id="update-header">
						<img class="logoPapillon" src="/assets/icons/icon-192.webp" />

						<h1>Quoi de neuf dans Papillon ?</h1>
						<p>Voici les dernières nouveautés de Papillon.</p>
					</div>

					<ion-list inset>
						<ion-item v-for="(feature, i) in appUpdates.features" :key="i">
							<span class="material-symbols-outlined mdls" slot="start">{{ feature.icon }}</span>
							<ion-label class="ion-text-wrap">
								<h2>{{ feature.name }}</h2>
								<p>{{ feature.description }}</p>
							</ion-label>
						</ion-item>
					</ion-list>

					<ion-button mode="md" @click="hideChangelog" fill="solid" class="endButton">Accéder à
						Papillon</ion-button>
					<p class="warning">Cet écran n’apparaîtra pas au redémarrage de Papillon. Il restera accessible dans les
						paramètres.</p>
				</div>
			</ion-content>
		</ion-modal>
	</ion-app>
</template>

<style scoped>
ion-menu::part(container) {
	border-radius: 0px;
}

ion-menu ion-list {
	background: none;
}

.navLink {
	text-decoration: none;
}

.userItem {
	display: flex;
	padding: 0px;
	align-items: center;

	background-size: cover;
	background-position: center;

	min-height: 120px;
}

.ios .userItem {
	width: 100%;
}

.userItem * {
	margin: 0;
	padding: 0;
}

.userItem_content {
	width: 100%;

	display: flex;
	padding: 10px 12px;
	gap: 12px;
	align-items: center;

	background-color: #00000080;
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(20px);

	padding-top: calc(var(--papillon-safe-area-top) + 10px) !important;
}

.userItem .avatar {
	width: 42px;
	height: 42px;
	border-radius: 50%;
	object-fit: cover;
}

.userData {
	width: calc(100% - 12px - 42px);
}

.userData p {
	text-transform: uppercase;
}

.userItem h3 {
	font-size: 18px;
	font-weight: 600;
	margin-bottom: 1px;
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}


.userItem p {
	font-size: 15px;
	color: #888;
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-top: 3px;
}

.ios .userItem p {
	font-size: 16px;
	margin-top: 0;
	font-family: var(--papillon-font);
}

.userItem_content {
	flex-direction: column;
	align-items: flex-start;
	padding: 16px 16px;
	color: #fff;
}

.userItem h3 {
	font-size: 20px;
}

.userItem p {
	color: #ffffffc2;
}

.userData {
	width: calc(100%);
}

ion-menu ion-content {
	--background: var(--ion-toolbar-background);
}

ion-menu ion-content {
	--padding-start: 0px;
	--padding-end: 8px;
	--padding-top: 8px;
	--padding-bottom: 20px;
}

ion-menu ion-list {
	padding: 0px 0;
}

ion-menu ion-note {
	margin-bottom: 30px;
}

ion-menu ion-list-header,
ion-menu ion-note {
	padding-left: 10px;
}

ion-menu ion-list#inbox-list ion-list-header {
	font-size: 22px;
	font-weight: 600;

	min-height: 20px;
}

ion-menu ion-list#labels-list ion-list-header {
	font-size: 16px;

	margin-bottom: 18px;

	color: #757575;

	min-height: 26px;
}

ion-item *:not(span) {
	font-family: var(--papillon-font), sans-serif !important;
}

ion-menu ion-item {
	--padding-start: 20px;
	--padding-end: 10px;

	border-top-right-radius: 300px;
	border-bottom-right-radius: 300px;

	isolation: isolate;
}

ion-menu ion-item ion-chip {
	margin: 0;
	margin-right: -10px;
	margin-left: 5px;
}

ion-menu ion-item {
	color: var(--ion-color-step-500);
	margin-bottom: 2px;
	--background: transparent;
}

ion-menu .router-link-active ion-item {
	--background: rgba(var(--ion-color-primary-rgb), 0.14);
	color: var(--ion-color-primary-rgb);
}

ion-menu ion-item .mdls {
	margin-right: calc(var(--padding-start) + 2px);
}

ion-menu .router-link-active ion-item ion-icon {
	color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
	color: var(--color);
}

ion-menu ion-item ion-label {
	font-weight: 500;
}

ion-note {
	display: inline-block;
	font-size: 16px;

	color: var(--ion-color-medium-shade);
}

ion-item.selected {
	background: rgba(var(--ion-color-primary-rgb), 0.1);
}

ion-item.selected * {
	--color: var(--ion-color-primary) !important;
	color: var(--color);
}

ion-item.selected:hover {
	background: rgba(var(--ion-color-primary-rgb), 0.2);
	cursor: pointer;
}

a:not(.selected) ion-menu-toggle ion-item {
	--color: var(--ion-color-medium-shade);
}

a:not(.selected) ion-menu-toggle ion-item:hover {
	opacity: 0.75;
	cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
	transition-property: opacity;
	transition-duration: .25s;
}

.fade-enter-active {
	transition-delay: .25s;
}

.fade-enter,
.fade-leave-active {
	opacity: 0
}

/* updates */
#update-header {
	margin: 40px 25px;

	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;

	color: #000;
	border-radius: 10px;

	margin-bottom: 30px;
	margin-top: 30px;
}

.dark #update-header {
	color: #fff !important;
}

#update-header * {
	margin: 0;
	padding: 0;
	text-align: center;
}

#update-header .updateIcon {
	margin-bottom: 15px !important;

	height: 62px;
}

#update-header h1 {
	font-size: 24px;
	letter-spacing: -0.2px;
	margin-bottom: 5px;
	color: var(--ion-color-primary);
}

#update-header p {
	font-size: 16px;
	opacity: 0.5;
}

#update-header .logoPapillon {
	height: 56px;

	border-radius: 12px;

	margin-bottom: 10px !important;
}

.md #update-header .logoPapillon {
	border-radius: 56px;
}

.update .warning {
	margin: 0px 40px;
	font-size: 13px;
	opacity: 0.5;
	text-align: center;
	margin-top: 10px;
}

.update::part(scroll) {
	padding-bottom: calc(var(--papillon-safe-area-bottom) + 100px) !important;
}

.endButton {
	width: calc(100% - 40px);
	margin: 0px 20px;

	--border-radius: 8px;
}

.update ion-list {
	margin-bottom: 30px;
}

.menuContent {
	overflow: hidden !important;
}

#bottomActionsList {
	width: 100%;
	background: var(--ion-toolbar-background);

	position: fixed;
	padding-bottom: calc(var(--papillon-safe-area-bottom) + 20px) !important;
	padding-top: 10px;

	bottom: 0;
	left: 0;

	padding-left: 0px;
	padding-right: 10px;
}</style>
