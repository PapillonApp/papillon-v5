<script>
	import {
		defineComponent
	} from 'vue';
	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonItem,
		IonLabel,
		IonButtons,
		IonTitle,
		IonContent,
		IonSkeletonText,
		IonBackButton,
		IonToggle
	} from '@ionic/vue';

	import { Capacitor } from '@capacitor/core';

	import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';

	import { Dialog } from '@capacitor/dialog';

	import { Browser } from '@capacitor/browser';

	import { CapacitorCalendar } from 'capacitor-calendar';

	import { Share } from '@capacitor/share';

	import { LocalNotifications } from '@capacitor/local-notifications';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonButtons,
			IonBackButton,
			IonTitle,
			IonContent,
			IonSkeletonText,
			IonList,
			IonItem,
			IonLabel,
			IonToggle
		},
		props: {
			urlCours: {
				type: String,
				required: true,
			}
		},
		data() {
			let backTitle = 'Retour';

			// get current route
			const currentRoute = this.$router.currentRoute.value;

			if(currentRoute.name == "Timetable") {
				backTitle = 'Emp. du temps';
			}

			return {
				pageTitle: 'Cours',
				backTitle: backTitle,
				openedCours: [],
				openCours_course: [],
				openCours_data: [],
				openCours_status: [],
				openCours_time: [],
				teachers: "",
				rooms: "",
				groupNames: "",
				notificationEnabled: false,
				disableShowGroup: localStorage.getItem('disableShowGroup'),
			}
		},
		methods: {
			async addToCalendar() {
				if (Capacitor.isNativePlatform()) {
					// create calendar event on mobile
					let result = { availableCalendars: [] };

					try {
						// the first time, the user will be prompted to grant permission
						result = await CapacitorCalendar.getAvailableCalendars();
					} catch(e) {
						// if the user denied permission, we'll end up here
						console.log('Error', e);
						return;
					}

					if (result?.availableCalendars.length) {
						try {
							// ask which calendar to use
							const opts = [];

							for (const cal of result.availableCalendars) {
								opts.push({
									title: cal.name,
								});
							}

							opts.push({
								title: 'Annuler',
								style: ActionSheetButtonStyle.Cancel,
							});

							const selected = await ActionSheet.showActions({
								title: 'Sélectionnez un calendrier',
								message: 'Choisissez le calendrier dans lequel ajouter le cours.',
								options: opts,
							});

							if (selected.index === opts.length - 1) {
								return;
							}

							const selectedCalendar = result.availableCalendars[selected.index];

							// get data
							const id = this.openCours_course.id;

							const subject = this.openCours_data.subject;
							const teachers = this.teachers;
							const rooms = this.rooms;

							let status = "Le cours se déroule normalement.";
							if(this.openCours_status.status) {
								status = this.openCours_status.status;
							}

							const finalStatus = `Vous êtes avec ${teachers} en ${rooms}. ${status}`;

							const startMillis = new Date(this.openCours_time.start).getTime();

							const endMillis = new Date(this.openCours_time.end).getTime();

							// use default calendar
							await CapacitorCalendar.createEvent({
								id: id,
								title: subject,
								location: rooms,
								notes: finalStatus,
								startDate: startMillis,
								endDate: endMillis,
								calendarId: selectedCalendar.id,
							});
							
							// dialog
							await Dialog.alert({
								title: 'Cours ajouté',
								message: 'Le cours a bien été ajouté à votre calendrier.',
							});
						} catch (e) {
							console.error('Error creating calendar event', e);
							// dialog
							await Dialog.alert({
								title: 'Erreur',
								message: 'Une erreur est survenue lors de l\'ajout du cours à votre calendrier.',
							});
						}
					}
				}
			},
			async deleteCustomCourse() {
				if (Capacitor.isNative) {
					ActionSheet.showActions({
						title: 'Êtes-vous sûr de vouloir supprimer ce cours ?',
						message: 'Ce cours devra être recréé si vous souhaitez le récupérer.',
						options: [
							{
								title: 'Supprimer',
								style: ActionSheetButtonStyle.Destructive,
							},
							{
								title: 'Annuler',
								style: ActionSheetButtonStyle.Cancel,
							},
						],
					}).then((result) => {
						if(result.index == 0) {
							this.deleteCourse()
						}
					});
				} else {
					this.deleteCourse()
				}
			},
			async deleteCourse() {
				let customCourses = JSON.parse(localStorage.getItem('customCourses')) || [];

				customCourses = customCourses.filter(course => course.course.course.id != this.openCours_course.id);

				localStorage.setItem('customCourses', JSON.stringify(customCourses));

				// dialog
				await Dialog.alert({
					title: 'Cours supprimé',
					message: 'Le cours a bien été supprimé.',
				});
			},
			async openLink(url) {
				await Browser.open({
					url: url,
					presentationStyle: 'popover',
				});
			},
			getStringToAsciiArray(string) {
				const charCodeArr = [];
				for(let i = 0; i < string.length; i++){
					const code = string.charCodeAt(i);
					charCodeArr.push(code);
				}

				return charCodeArr;
			},
			async shareCours() {
				const sharedCourse = {
					name: this.openedCours.data.subject,
					teachers: this.openedCours.data.teachers.join(', ') || "Aucun professeur",
					rooms: this.openedCours.data.rooms.join(', ') || "Aucune salle",
					start: new Date(this.openedCours.time.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
					end: new Date(this.openedCours.time.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
					status: this.openedCours.status.status,
					color: this.openedCours.course.color,
					memo: this.openedCours.data.memo || "none"
				}

				// get first name of user
				let firstName = JSON.parse(localStorage.getItem("userData")).student.name;
				firstName = firstName.split(" ")[firstName.split(" ").length - 1];

				// if custom name is set, use it instead
				if(localStorage.getItem("customName")) {
					firstName = localStorage.getItem("customName").split(" ")[localStorage.getItem("customName").split(" ").length - 1];
				}

				// Set customizable data to ascii
				firstName = this.getStringToAsciiArray(firstName).join('-');
				sharedCourse.name = this.getStringToAsciiArray(sharedCourse.name).join('-');
				sharedCourse.teachers = this.getStringToAsciiArray(sharedCourse.teachers).join('-');
				sharedCourse.rooms = this.getStringToAsciiArray(sharedCourse.rooms).join('-');
				if (sharedCourse.status != null) {
					sharedCourse.status = this.getStringToAsciiArray(sharedCourse.status).join('-');
				} else {
					sharedCourse.status = this.getStringToAsciiArray("null").join('-');
				}

				let urlElems = "";
				urlElems += firstName + "$"; // first name
				urlElems += sharedCourse.name + "$";
				urlElems += sharedCourse.teachers + "$";
				urlElems += sharedCourse.rooms + "$";
				urlElems += sharedCourse.start + "$";
				urlElems += sharedCourse.end + "$";
				urlElems += sharedCourse.color + "$";
				urlElems += sharedCourse.status + "$";
				urlElems += sharedCourse.memo;

				// base64 encode urlElems
				const url = "https://getpapillon.xyz/course?c=" + btoa(urlElems);

				// share url
				await Share.share({
					url: url,
					dialogTitle: "Partager votre cours de " + this.openedCours.data.subject
				});
			},
			async setNotif() {
				const course = this.openedCours;

				try {
					const subject = course.data.subject;
					const room = course.data.rooms[0] || "salle inconnue";
					const teacher = course.data.teachers[0];

					const time = new Date(course.time.start);
					time.setMinutes(time.getMinutes() - 5);

					// check if time is in the future
					if(time.getTime() < new Date().getTime()) {
						return false;
					}
					else {
						// Check permission
						const permission = await LocalNotifications.checkPermissions();
						if (permission != 'granted') {
							try {
								await LocalNotifications.requestPermissions();
							} catch (error) {
								return;
							}
						}

						try{
							await LocalNotifications.schedule({
								notifications: [
									{
										title: `${subject} - Ça commence bientôt !`,
										body: `Vous êtes en ${room} avec ${teacher}. Le cours commence dans 5 minutes.`,
										id: 1,
										schedule: { at: time },
										sound: "tone.ogg",
										attachments: null,
										actionTypeId: "",
										extra: null
									}
								]
							});
						}
						catch(error) {
							// dialog
							await Dialog.alert({
								title: 'Erreur',
								message: 'Une erreur est survenue lors de la création de la notification. Veuillez réessayer.',
							});

							// untoggle switch
							this.notificationEnabled = false;
							this.$refs.notifSwitch.checked = false;

							return;
						}

						
						// notify user
						this.notificationEnabled = true;
					}
				} catch (error) {
					console.error(error);
				}
			},
			async unsetNotif() {
				const course = this.openedCours;

				// find notification
				await LocalNotifications.getPending().then((res) => {
					const notifs = res.notifications;

					const time = new Date(course.time.start);
					time.setMinutes(time.getMinutes() - 5);

					// check if time = schedule.at
					notifs.forEach(async (notif) => {
						const notifTime = new Date(notif.schedule.at);

						if(notifTime.getTime() == time.getTime()) {
							await LocalNotifications.cancel({ notifications: [notif] });

							// notify user
							this.notificationEnabled = false;
						}
					});
				});
			},
			changeNotif(event) {
				if(event.target.checked) {
					this.setNotif();
				}
				else {
					this.unsetNotif();
				}
			}
		},
		async mounted() {
			// if urlNews prop is set
			if(this.urlCours) {
				const encoded = this.urlCours;

				// decode url
				const decoded = decodeURIComponent(encoded);

				// parse json
				const parsed = JSON.parse(decoded);

				// open urlNews
				this.openedCours = parsed;

				this.openCours_course = parsed.course;
				this.openCours_data = parsed.data;
				this.openCours_status = parsed.status;
				this.openCours_time = parsed.time;

				this.teachers = parsed.data.teachers.join(', ');
				this.rooms = parsed.data.rooms.join(', ');
				this.groupNames = parsed.data.groupNames.join(', ');

				this.groupNames = this.groupNames.replace(/[[\]]/g, '');
				this.pageTitle = this.openCours_data.subject;

				// if this.pageTitle is over 11 chars
				if(this.pageTitle.length > 11) {
					
					if(this.backTitle == "Emp. du temps") {
						this.backTitle = "Ma journ.";
					}

					this.pageTitle = this.pageTitle.substring(0, 16) + "...";
				}

				// check notifs

				await LocalNotifications.getPending().then((res) => {
					const notifs = res.notifications;

					const time = new Date(this.openCours_time.start);
					time.setMinutes(time.getMinutes() - 5);

					// check if time = schedule.at
					notifs.forEach((notif) => {
						const notifTime = new Date(notif.schedule.at);

						if(notifTime.getTime() == time.getTime()) {
							this.notificationEnabled = true;
							this.$refs.toggle.$el.checked = true;
						}
					});
				});
			}

			return false;
		}
	});
</script>

<template>
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<IonBackButton class="only-ios" :text="backTitle" @click="pop"></IonBackButton>
					<IonBackButton class="only-md" @click="pop"></IonBackButton>
				</ion-buttons>

				<ion-title v-if="openedCours">{{ pageTitle }}</ion-title>
				<ion-title v-else><ion-skeleton-text style="width: 200px;"></ion-skeleton-text></ion-title>

				<ion-buttons slot="end">
					<ion-button class="itemBtn" @click="shareCours()">
						Partager
					</ion-button>
				</ion-buttons>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<div v-if="openedCours">

				<IonLabel class="listGroupTitle">
					<p>Détails du cours</p>
				</IonLabel>

				<IonList class="listGroup">     
					<ion-item class="info-item">
						<span class="material-symbols-outlined mdls" slot="start">history_edu</span>
						<ion-label>
							<p>Nom de la matière</p>
							<h2>{{openCours_data.subject || "Pas de matière"}}</h2>
						</ion-label>
					</ion-item>
					<ion-item class="info-item">
						<span class="material-symbols-outlined mdls" slot="start">face</span>
						<ion-label>
							<p>Professeurs</p>
							<h2>{{teachers || "Pas de professeur"}}</h2>
						</ion-label>
					</ion-item>
					<ion-item class="info-item">
						<span class="material-symbols-outlined mdls" slot="start">meeting_room</span>
						<ion-label>
							<p>Salle</p>
							<h2>{{rooms || "Pas de salle" }}</h2>
						</ion-label>
					</ion-item>
					<ion-item class="info-item" v-if="disableShowGroup == 'true' && groupNames.length">
						<span class="material-symbols-outlined mdls" slot="start">groups</span>
						<ion-label>
							<p>Groupe</p>
							<h2>{{groupNames || "Pas de groupe" }}</h2>
						</ion-label>
					</ion-item>
				</IonList>

				<IonLabel class="listGroupTitle">
					<p>Horaires</p>
				</IonLabel>

				<IonList class="listGroup times" lines="none">
					<ion-item class="info-item">
						<span class="material-symbols-outlined mdls" slot="start">schedule</span>
						<ion-label>
							<p>Début</p>
							<h2>{{ new Date(openCours_time.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</h2>
							<h4>{{ new Date(openCours_time.start).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) }}</h4>
						</ion-label>
					</ion-item>
					<ion-item class="info-item">
						<span class="material-symbols-outlined mdls" slot="start">schedule</span>
						<ion-label>
							<p>Fin</p>
							<h2>{{ new Date(openCours_time.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</h2>
							<h4>{{ new Date(openCours_time.end).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) }}</h4>
						</ion-label>
					</ion-item>
				</IonList>

				<IonLabel class="listGroupTitle" v-if="openCours_status.status || openCours_data.memo">
					<p>Statut du cours</p>
				</IonLabel>

				<IonList class="listGroup" v-if="openCours_status.status || openCours_data.memo">
					<ion-item class="info-item" v-if="openCours_status.status" :class="{ cancelled: openCours_status.isCancelled }">
						<span class="material-symbols-outlined mdls" slot="start">information-circle</span>
						<ion-label class="ion-text-wrap">
							<p>Statut du cours</p>
							<h2 v-if="openCours_status.isCancelled">Ce cours n'est pas maintenu.<br/>Motif : {{ openCours_status.status }}</h2>
							<h2 v-else>{{ openCours_status.status }}</h2>
						</ion-label>
					</ion-item>
					<ion-item class="info-item" v-if="openCours_data.memo">
						<span class="material-symbols-outlined mdls" slot="start">sticky_note_2</span>
						<ion-label class="ion-text-wrap">
							<p>Mémo</p>
							<h2>{{ openCours_data.memo }}</h2>
						</ion-label>
					</ion-item>
				</IonList>

				<IonLabel class="listGroupTitle">
					<p>Actions</p>
				</IonLabel>

				<IonList class="listGroup">
					<ion-item>
						<span class="material-symbols-outlined mdls" slot="start">notifications</span>
						<ion-label class="ion-text-wrap">
							<h2>Activer les notifications</h2>
							<p>Vous allez recevoir une notification 5 minutes avant le début du cours</p>
						</ion-label>

						<ion-toggle @ionChange="changeNotif($event)" slot="end" :value="notificationEnabled" ref="toggle"></ion-toggle>
					</ion-item>
					<IonItem v-if="openCours_status.isCustom" button  @click="deleteCustomCourse()">
						<span class="material-symbols-outlined mdls" slot="start">delete</span>
						<ion-label class="ion-text-wrap">
							<h2>Supprimer le cours personnalisé</h2>
							<p>Supprime le cours personnalisé de votre emploi du temps</p>
						</ion-label>
					</IonItem>
					<IonItem button  @click="addToCalendar()">
						<span class="material-symbols-outlined mdls" slot="start">event</span>
						<ion-label class="ion-text-wrap">
							<h2>Ajouter au calendrier</h2>
							<p>Ajouter ce cours au calendrier par défaut de votre appareil</p>
						</ion-label>
					</IonItem>
				</IonList>

			</div>
		</ion-content>
</template>

<style scoped>
.listGroup.times {
	display: flex;
}

.info-item.cancelled {
	color: var(--ion-color-danger);
}
</style>
