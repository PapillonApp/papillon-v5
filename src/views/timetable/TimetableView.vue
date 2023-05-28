<script>
  import { defineComponent } from 'vue';
  import { IonButtons, IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonList, IonModal, IonItem, IonDatetime, IonRefresher, IonRefresherContent, IonLabel, IonSpinner, IonFab, IonInput, IonProgressBar, alertController, IonNavLink, IonPopover } from '@ionic/vue';

  import { Share } from '@capacitor/share';
  import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';
  import { Dialog } from '@capacitor/dialog';

  import { CapacitorCalendar } from 'capacitor-calendar';
  import { Capacitor } from '@capacitor/core';

  import CoursView from './CoursView.vue';

  import { App } from '@capacitor/app';
  import { Network } from '@capacitor/network';

  import displayToast from '@/functions/utils/displayToast.js';
  import subjectColor from '@/functions/utils/subjectColor.js';
  import timetableEdit from '@/functions/utils/timetableEdit.js';
  
  import { calendarOutline, calendarSharp, todayOutline, todaySharp, notifications } from 'ionicons/icons';

  import { LocalNotifications } from '@capacitor/local-notifications';

  import { Virtual, EffectCoverflow } from 'swiper'
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import 'swiper/css';
  import 'swiper/css/effect-cube';

  import CoursElement from '@/components/timetable/CoursElement.vue';

  import GetTimetable from '@/functions/fetch/GetTimetable.js';

  export default defineComponent({
	name: 'FolderPage',
	components: {
		IonButtons,
		IonButton,
		IonContent,
		IonHeader,
		IonMenuButton,
		IonPage,
		IonTitle,
		IonToolbar,
		IonList,
		IonModal,
		CoursElement,
		IonDatetime,
		Swiper,
		SwiperSlide,
		IonRefresher,
		IonRefresherContent,
		IonItem,
		IonLabel,
		IonSpinner,
		IonFab,
		IonInput,
		IonProgressBar,
		IonNavLink,
		IonPopover
	},
	setup() {
		return {
			baseIndex: 250,
			minDate: require('@/functions/utils/datetimePicker.js').minCalendarDate(),
			maxDate: require('@/functions/utils/datetimePicker.js').maxCalendarDate(),
			isDateAvailable: require('@/functions/utils/datetimePicker.js').isDateAvailable,
			calendarOutline,
			calendarSharp,
			todayOutline,
			todaySharp,
			presentingElement: null,
			Virtual,
			EffectCoverflow,
			ey: []
		}
	},
	methods: {
		createDateString(date) {
			let dateObject = new Date(date);
			let day_string = dateObject.toLocaleString('default', { weekday: 'long' }).slice(0, 3);
			// return string like "jeu. 1"
			return day_string + ". " + dateObject.getDate();
		},
		rnInputChanged() {
			if(!this.isChangingDate) {
				// get new date from rnInput
				let newDate = new Date(this.$refs.rnInput.$el.value);

				// update rn
				this.$rn = newDate;
				this.baseRn = newDate;

				// reset swiper
				this.swiper.slideTo(this.baseIndex, 0, false);

				// reset days
				this.days = [];

				// emit event
				document.dispatchEvent(new CustomEvent('rnChanged', { detail: newDate }));
			}
			else {
				this.isChangingDate = false;
			}
		},
		confirmRnInput() {
			this.changernPickerModalOpen(false);
		},
		openRnPicker() {
			this.$refs.rnPickerModal.$el.present();
		},
		editTimetable(timetable, date) {
			timetable = timetableEdit(timetable);

			// add custom courses
			let customCourses = JSON.parse(localStorage.getItem('customCourses')) || [];
			customCourses.forEach((customCourse) => {
				// if course is in the same day
				let customDay = new Date(customCourse.day);
				let currentDay = new Date(date);

				let st = new Date(customCourse.course.time.start);
				let en = new Date(customCourse.course.time.end);

				// make st and en the same day as currentDay
				st.setDate(currentDay.getDate());
				st.setMonth(currentDay.getMonth());
				st.setFullYear(currentDay.getFullYear());

				en.setDate(currentDay.getDate());
				en.setMonth(currentDay.getMonth());
				en.setFullYear(currentDay.getFullYear());

				if (customDay.getDate() == currentDay.getDate() && customDay.getMonth() == currentDay.getMonth() && customDay.getFullYear() == currentDay.getFullYear()) {
					customCourse.course.time.start = st;
					customCourse.course.time.end = en;
					customCourse.course.course.color = subjectColor.getSubjectColor(customCourse.course.data.subject, subjectColor.getRandomColor(true), true);
					timetable.push(customCourse.course);
				}
			});

			// order timetable by time
			timetable.sort((a, b) => {
				let aStart = new Date(a.time.start);
				let bStart = new Date(b.time.start);

				return aStart - bStart;
			});

			return timetable;
		},
		resetSwiper() {
			// this.swiper.slideTo(1, 0);

			this.day1.error = "STILL_LOADING";
			this.day0.error = "STILL_LOADING";
			this.day2.error = "STILL_LOADING";
		},
		async getTimetables(force, goTo, event) {
			let startloading = setTimeout(() => {
				this.isLoading = true;
			}, 500);

			for (let i = 0; i < 3; i++) {
				let index = this.swiper.realIndex + (i - 1);

				// get index diff
				let indexDiff = this.baseIndex - index;

				// get rn
				let selectedRN = new Date(this.baseRn);

				if(goTo) {
					selectedRN = new Date(this.$rn);
				}

				selectedRN.setDate(selectedRN.getDate() - indexDiff);

				// if i is 1
				if(i == 1) {
					this.$rn = selectedRN;
					this.rnButtonString = this.createDateString(this.$rn);
					this.rnCalendarString = this.$rn.toISOString().split('T')[0];
				}

				// get timetable for rn
				GetTimetable(selectedRN, force).then((timetable) => {
					if(i == 2) {
						clearTimeout(startloading);
						this.isLoading = false;

						if(event) {
							event.detail.complete();
						}
					}
					
					if(timetable.error) {
						if(timetable.error == "ERR_BAD_REQUEST") {
							if(this.days[index]) {
								this.days[index].loading = true;
							}
						}
						else {
							this.days[index] = [];
							if(this.days[index]) {
								this.days[index].error = timetable.error;
							}
						}
					}
					else {
						this.days[index] = this.editTimetable(timetable, selectedRN);
						this.loadedrnButtonString = this.createDateString(this.$rn);
						if(this.days[index]) {
							this.days[index].loading = false;
						}
					}
				});
			}

			// set connection status
			this.connected = await Network.getStatus()
			this.connected = this.connected.connected;
		},
		handleRefresh(event) {
			// get new timetable data
			this.getTimetables(true, false, event);
		},
		getStringToAsciiArray(string) {
			let charCodeArr = [];
			for(let i = 0; i < string.length; i++){
				let code = string.charCodeAt(i);
				charCodeArr.push(code);
			}

			return charCodeArr;
		},
		setNewCoursModalOpen(state) {
			this.newCoursModalOpen = state;
		},
		addNewCours() {
			let st = new Date();
			let en = new Date();

			let stValue = this.$refs.newCoursStartRef.$el.value;

			// this.$refs.newCoursStart.value returns HH:mm
			st.setHours(stValue.split(':')[0]);
			st.setMinutes(stValue.split(':')[1]);

			// this.$refs.newCoursEnd.value returns HH:mm
			en.setHours(this.$refs.newCoursEndRef.$el.value.split(':')[0]);
			en.setMinutes(this.$refs.newCoursEndRef.$el.value.split(':')[1]);

			// check if cours is valid
			if(stValue == "" || this.$refs.newCoursEndRef.$el.value == "" || this.$refs.newCoursNameRef.$el.value == "" || this.$refs.newCoursTeacherRef.$el.value == "" || this.$refs.newCoursRoomRef.$el.value == "") {
				displayToast.presentError("Veuillez remplir tous les champs", "danger", "Tous les champs sont obligatoires");
				return;
			}

			// create new cours
			let newCourse = {
				course: {
					id: Math.floor(Math.random() * 10000000),
					color: "#0066ff",
					num: Math.floor(Math.random() * 10000000),
				},
				data: {
					subject: this.$refs.newCoursNameRef.$el.value,
					teachers: [this.$refs.newCoursTeacherRef.$el.value],
					rooms: [this.$refs.newCoursRoomRef.$el.value],
					groupNames: [],
					memo: null,
					hasMemo: false,
					linkVirtual: null,
				},
				time: {
					start: st,
					end: en
				},
				status: {
					isCancelled: false,
					isExempted: false,
					isDetention: false,
					isOuting: false,
					isTest: false,
					isCustom: true,
					status: null
				}
			};

			let customCourse = {
				"day": this.$rn,
				"course": newCourse
			};

			// save to local storage
			let customCourses = JSON.parse(localStorage.getItem('customCourses')) || [];
			customCourses.push(customCourse);
			localStorage.setItem('customCourses', JSON.stringify(customCourses));

			// close newCoursModal
			this.setNewCoursModalOpen(false);

			// refresh timetable
			this.getTimetables(true);
		},
		changernPickerModalOpen(state) {
			this.rnPickerModalOpen = state;
		},
		deleteCustomCourse(id) {
			// get custom courses
			let customCourses = JSON.parse(localStorage.getItem('customCourses')) || [];

			// remove custom course
			customCourses = customCourses.filter(course => course.course.course.id != id);

			// save to local storage
			localStorage.setItem('customCourses', JSON.stringify(customCourses));

			// close cours modal
			this.$refs.coursModal.$el.dismiss();

			// refresh timetable
			this.getTimetables(true);
		},
		async unsetNotif(course) {
			// find notification
			await LocalNotifications.getPending().then((res) => {
				let notifs = res.notifications;

				let time = new Date(course.time.start);
				time.setMinutes(time.getMinutes() - 5);

				// check if time = schedule.at
				notifs.forEach(async (notif) => {
					let notifTime = new Date(notif.schedule.at);

					if(notifTime.getTime() == time.getTime()) {
						await LocalNotifications.cancel({ notifications: [notif] });

						// notify user
						this.selectedCourse.notificationEnabled = false;

						displayToast.presentToastFull(
							'Notifications désactivées pour ' + course.data.subject,
							'Vous ne receverez plus de notifications pour ce cours',
							'light',
							notifications
						);
					}
				});
			});
		},
		async displayBetaMsg() {
				const alert = await alertController.create({
					header: 'Emploi du temps',
					message: 'Cette page subit actuellement des grands changements. Son comportement pourrait être inhabituel et des bugs peuvent survenir.',
					mode: 'md',
					buttons: ['Je comprends']
				});

				await alert.present();
		},
		async addDayToCalendar() {
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

						let selectedCalendar = result.availableCalendars[selected.index];

						// for each course of the day
						let todayCourses = this.days[this.currentIndex];

						if(todayCourses.length <= 0) {
							await Dialog.alert({
								title: 'Aucun cours',
								message: 'Il n\'y a aucun cours à ajouter au calendrier.',
								mode: 'md',
								buttons: ['Ok']
							});

							return;
						}


						for (const course of todayCourses) {
							if(!course.status.isCancelled) {
								// create event
								let id = course.course.id;
								let subject = course.data.subject;
								let rooms = course.data.rooms.join(', ');
								let teachers = course.data.teachers.join(', ');
								
								let startMillis = new Date(course.time.start).getTime();
								let endMillis = new Date(course.time.end).getTime();

								let status = "Le cours se déroule normalement.";
								if(course.status.status) {
									status = course.status.status;
								}
								
								let finalStatus;
								if(teachers && rooms === null){
									finalStatus = `Ce cours n'a ni salle et ni professeur attribué à celui-ci. ${status}`
								} else {
									finalStatus = `Vous êtes avec ${teachers} en ${rooms}. ${status}`;
								}
								// add event to calendar
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
							}
						}

						await Dialog.alert({
                            title: 'Tous les cours ont été ajoutés !',
                            message: 'Votre journée a bien été ajoutée à votre calendrier.',
                        });
					} catch (e) {
                        console.error('Error creating calendar event', e);
                        // dialog
                        await Dialog.alert({
                            title: 'Erreur',
                            message: 'Une erreur est survenue lors de l\'ajout des cours à votre calendrier.',
                        });
                    }
				}
			}
		}
	},
	data() {
		const slides = Array.from({ length: this.baseIndex * 2 }).map(
			(el, index) => `Slide ${index}`
		);

		return {
			CoursView: CoursView,
			baseRn: new Date(),
			slides,
			currentIndex: this.baseIndex,
			rnButtonString: this.createDateString(this.$rn),
			loadedrnButtonString: this.createDateString(this.$rn),
			rnCalendarString: this.$rn.toISOString().split('T')[0],
			day0: [],
			day1: [],
			day2: [],
			days: [],
			connected: false,
			shouldResetSwiper: false,
			selectedCourse: {
				name: '',
				teacher: '',
				room: '',
				groupNames: '',
				start: '',
				end: '',
				length: '',
				status: '',
				notificationEnabled: false,
			},
			newCoursModalOpen: false,
			rnPickerModalOpen: false,
			isChangingDate: false,
			isLoading: true,
			swiper: null,
		}
	},
	mounted() {
		this.swiper = this.$refs.swiper.$el.swiper;
		
		// sets presentingElement
		this.presentingElement = this.$refs.pageHere.$el;

		// on rnChanged, update rnButtonString
		document.addEventListener('rnChanged', (e) => {
			this.rnButtonString = this.createDateString(e.detail);
			this.getTimetables(false, e.detail);
		});

		// get timetable data
		this.getTimetables();

		// on token changed, get new timetable data
		document.addEventListener('tokenUpdated', () => {
			this.getTimetables();
		});

		// detect swiper slide change

		this.swiper.on('slideChangeTransitionEnd', () => {
			// reset swiper
			this.resetSwiper()
			// isChangingDate
			this.isChangingDate = true;
			// emit event
			this.getTimetables();
		});

		this.swiper.on('activeIndexChange', () => {
			this.currentIndex = this.swiper.activeIndex;
		});

		App.addListener('backButton', () => {
			if(this.newCoursModalOpen) {
				this.newCoursModalOpen = false;
			} 
			else if(this.rnPickerModalOpen) {
				this.rnPickerModalOpen = false;
			}
		});
	}
  });
</script>

<template>
	<ion-page ref="pageHere">
		<IonHeader class="AppHeader">
			<IonToolbar>

				<ion-buttons slot="start">
					<ion-menu-button color="dark"></ion-menu-button>
				</ion-buttons>

				<ion-title id="title">
					Ma journée

					<span class="expand_title material-symbols-outlined mdls">expand_more</span>
				</ion-title>

				<ion-popover trigger="title" trigger-action="click">
					<ion-list lines="none">
						<ion-item @click="addDayToCalendar()" :button="true" :detail="false">
							Ajouter au calendrier
						</ion-item>
					</ion-list>
				</ion-popover>

				<ion-buttons slot="end">
					<ion-button id="rnPickerModalButton" color="dark" @click="changernPickerModalOpen(true)">
						<span class="material-symbols-outlined mdls" slot="start">calendar_month</span>

						<p>{{ rnButtonString }}</p>
					</ion-button>
				</ion-buttons>

				<ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>

			</IonToolbar>
		</IonHeader>
		
		<ion-content :fullscreen="true" class="content">
			<ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>

			<IonFab slot="fixed" vertical="bottom" horizontal="end" class="newCoursBtnFab">
				<ion-button @click="setNewCoursModalOpen(true)" size="large" shape="round" class="newCoursBtn" mode="md">
					<span class="material-symbols-outlined mdls" slot="icon-only">add</span>
				</ion-button>
			</IonFab>

			

			<div id="noTouchZone"></div>
			
			<swiper class="swiper" ref="swiper" :modules="[Virtual]" virtual :initialSlide="baseIndex" :speed="200" :spaceBetween="10" :preventClicks="true">
				<swiper-slide class="slide"
				v-for="(slideContent, index) in slides"
				:key="index"
				:virtualIndex="index"
				>
				<IonList>
					<IonNavLink v-for="cours in days[`${index}`]" :key="cours.id" router-direction="forward" :component="CoursView" :componentProps="{urlCours: encodeURIComponent(JSON.stringify(cours))}">
						<CoursElement
							:subject="cours.data.subject"
							:teachers="cours.data.teachers.join(', ') || 'Pas de professeur'"
							:rooms="cours.data.rooms.join(', ') || 'Pas de salle'"
							:groupNames="cours.data.groupNames.join('') || null"
							:memo="cours.data.hasMemo"
							:start="cours.time.start"
							:end="cours.time.end"
							:color="cours.course.color"
							:sameTime="cours.course.sameTime"
							:status="cours.status.status"
							:isCancelled="cours.status.isCancelled"
							:isDetention="cours.status.isDetention"
							:isExempted="cours.status.isExempted"
							:isOuting="cours.status.isOuting"
							:isTest="cours.status.isTest"
							:distance="cours.course.distance"
							:lengthCours="cours.course.lengthCours"
						/>
					</IonNavLink>

						<div v-if="days[`${index}`]">
							<div class="NoCours" v-if="days[`${index}`].length == 0 && !days[`${index}`].error && !days[`${index}`].loading">
								<h1>😌</h1>
								<h2>Aucun cours aujourd'hui</h2>
								<p>Sélectionnez un autre jour dans le calendrier ou balayez l’écran pour changer de journée.</p>

								<ion-button mode="md" fill="clear" @click="changernPickerModalOpen(true)" class="changeDayButton">Ouvrir le calendrier</ion-button>
							</div>

							<div class="NoCours" v-if="days[`${index}`].length == 0 && days[`${index}`].error == 'ERR_NETWORK' && !days[`${index}`].loading && !connected">
								<h1>🌏</h1>
								<h2>Pas de connexion à Internet</h2>
								<p>Vous pouvez uniquement consulter les journées déjà chargées préalablement lorsque vous êtes hors-ligne.</p>
							</div>

							<div class="NoCours" v-if="days[`${index}`].length == 0 && days[`${index}`].error == 'ERR_NETWORK' && !days[`${index}`].loading && connected">
								<h1>🛠️</h1>
								<h2>Serveurs indisponibles</h2>
								<p>Vous pouvez uniquement consulter les journées déjà chargées préalablement. Nos serveurs seront bientôt de nouveaux disponibles.</p>
							</div>
						</div>
						<div v-else>
							<div class="loadingSpin">
								<IonSpinner></IonSpinner>
							</div>
						</div>
					</IonList>
				</swiper-slide>
			</swiper>

			<IonModal :canDismiss="true" @didDismiss="setNewCoursModalOpen(false)" ref="newCoursModal" class="newCoursModal" :is-open="newCoursModalOpen" :presenting-element="presentingElement">
				<IonHeader>
					<IonToolbar>
						<ion-buttons slot="start">
							<ion-button @click="setNewCoursModalOpen(false)">Annuler</ion-button>
						</ion-buttons>
						<ion-title>Ajouter un cours</ion-title>
						<ion-buttons slot="end">
							<ion-button @click="addNewCours()" color="primary">Ajouter</ion-button>
						</ion-buttons>
					</IonToolbar>
				</IonHeader>
				<ion-content>
					<ion-list inset>
						<ion-item>
							<span class="material-symbols-outlined mdls" slot="start" style="margin-right:5px">edit</span>
							<ion-input type="text" name="CourseTitle" ref="newCoursNameRef" placeholder="Nom du cours"></ion-input>
						</ion-item>

						<ion-item>
							<span class="material-symbols-outlined mdls" slot="start" style="margin-right:5px">pin_drop</span>
							<ion-input type="text" name="Place" ref="newCoursRoomRef" placeholder="Lieu"></ion-input>
						</ion-item>

						<ion-item>
							<span class="material-symbols-outlined mdls" slot="start" style="margin-right:5px">Person</span>
							<ion-input type="text" name="Person" ref="newCoursTeacherRef" placeholder="Professeur"></ion-input>
						</ion-item>
					</ion-list>

					<ion-list inset>
						<ion-item class="input">
							<span class="material-symbols-outlined mdls" slot="start" style="margin-right:15px">schedule</span>
							<ion-label>Heure de début</ion-label>
							<div class="timeInput" slot="end">
								<ion-input ref="newCoursStartRef" class="timeInInput" name="Start" type="time" value="12:30"></ion-input>
							</div>
						</ion-item>

						<ion-item class="input">
							<span class="material-symbols-outlined mdls" slot="start" style="margin-right:15px">schedule</span>
							<ion-label>Heure de fin</ion-label>
							<div class="timeInput" slot="end">
								<ion-input class="timeInInput" name="End" ref="newCoursEndRef" type="time" value="13:30"></ion-input>
							</div>
						</ion-item>
					</ion-list>
				</ion-content>
			</IonModal>


			<IonModal :is-open="rnPickerModalOpen" ref="rnPickerModal" class="datetimeModal" @didDismiss="changernPickerModalOpen(false)" :keep-contents-mounted="true" :initial-breakpoint="0.55" :breakpoints="[0, 0.55]">
				<IonHeader>
				<IonToolbar>
					<ion-title>Sélection de la date</ion-title>
					<ion-buttons slot="end">
					<ion-button @click="confirmRnInput()">Terminé</ion-button>
					</ion-buttons>
				</IonToolbar>
				</IonHeader>
				<ion-content>
				<IonDatetime 
					presentation="date"
					ref="rnInput"
					size="cover"
					:value="rnCalendarString"
					:firstDayOfWeek="1"
					:min="minDate"
					:max="maxDate"
					:is-date-enabled="isDateAvailable"
					@ionChange="rnInputChanged()"
				>
				</IonDatetime>
				</ion-content>
			</IonModal>

			<IonModal ref="coursModal" class="coursModal" :keep-contents-mounted="true" :presenting-element="presentingElement" :handle="true" :canDismiss="true">
				<IonHeader>
					<IonToolbar>
					<ion-title>{{selectedCourse.name}}</ion-title>
					</IonToolbar>
				</IonHeader>
				<ion-content>
					<ion-list >
						<ion-item class="info-item">
							<span class="material-symbols-outlined mdls" slot="start">history_edu</span>
							<ion-label>
								<p>Nom de la matière</p>
								<h2>{{selectedCourse.name}}</h2>
							</ion-label>
							<ion-button class="itemBtn" fill="clear" slot="end" @click="shareCours(selectedCourse.originalCourse)">
								<span class="material-symbols-outlined mdls" slot="start">share</span>
								Partager
							</ion-button>
						</ion-item>

						<ion-item class="info-item">
							<span class="material-symbols-outlined mdls" slot="start">face</span>
							<ion-label>
								<p>Professeur</p>
								<h2>{{selectedCourse.teachers}}</h2>
							</ion-label>
						</ion-item>

						<ion-item class="info-item">
							<span class="material-symbols-outlined mdls" slot="start">meeting_room</span>
							<ion-label>
								<p>Salle</p>
								<h2>{{selectedCourse.rooms}}</h2>
							</ion-label>
						</ion-item>

						<ion-item class="info-item" v-if="selectedCourse.hasMemo">
							<span class="material-symbols-outlined mdls" slot="start">description</span>
							<ion-label>
								<p>Mémo</p>
								<h2 class="display-all">{{selectedCourse.memo}}</h2>
							</ion-label>
						</ion-item>

						<ion-item class="info-item">
							<span class="material-symbols-outlined mdls" slot="start">schedule</span>
							<ion-label>
								<p>Horaires</p>
								<h2>De {{selectedCourse.start}} à {{selectedCourse.end}}</h2>
							</ion-label>

							<ion-button v-if="!selectedCourse.notificationEnabled" class="itemBtn" fill="clear" slot="end" @click="setNotif(selectedCourse.originalCourse)">
								<span class="material-symbols-outlined mdls" slot="start">notifications</span>
								Me notifier
							</ion-button>
							<ion-button v-else class="itemBtn" color="danger" fill="clear" slot="end" @click="unsetNotif(selectedCourse.originalCourse)">
								<span class="material-symbols-outlined mdls" slot="start">notifications_off</span>
								Ne pas me notifier
							</ion-button>
						</ion-item>

						<ion-item class="info-item">
							<span class="material-symbols-outlined mdls" slot="start">pending_actions</span>
							<ion-label>
								<p>Durée du cours</p>
								<h2>{{selectedCourse.length}}</h2>
							</ion-label>
						</ion-item>

						<ion-item class="info-item" v-if="selectedCourse.isCancelled" style="color: var(--ion-color-danger);">
							<span class="material-symbols-outlined mdls" slot="start">error</span>
							<ion-label>
								<p>Statut</p>
								<h2>Ce cours n'est pas maintenu<br>Motif : {{selectedCourse.status}}</h2>
							</ion-label>
						</ion-item>

						<ion-item class="info-item" v-else-if="selectedCourse.hasStatus" style="color: var(--ion-color-warning);">
							<span class="material-symbols-outlined mdls" slot="start">info</span>
							<ion-label class="ion-text-wrap">
								<p>Statut</p>
								<h2>{{selectedCourse.status}}</h2>
							</ion-label>
						</ion-item>

						<ion-item class="info-item" v-else>
							<span class="material-symbols-outlined mdls" slot="start">info</span>
							<ion-label>
								<p>Statut</p>
								<h2>{{selectedCourse.status}}</h2>
							</ion-label>

							<ion-button color="danger" fill="clear" class="itemBtn" slot="end" v-if="selectedCourse.custom" @click="deleteCustomCourse(selectedCourse.id)">
								<span class="material-symbols-outlined mdls" slot="start">delete</span>
								Supprimer
							</ion-button>
						</ion-item>
					</ion-list>
				</ion-content>
			</IonModal>
		</ion-content>
	</ion-page>
</template>
  
<style scoped>
	.content {
		overflow: hidden !important;
		height: calc(100vh - (54px + env(safe-area-inset-top)));
		padding-bottom: 0px !important;
	}

	.content::part(scroll) {
		padding-bottom: 0px !important;
	}

	.swiper {
		height: calc(100vh - (54px + env(safe-area-inset-top)));
		
		overflow: hidden;
		padding-top: 8px !important;

		margin-bottom: 0;
	}

	.loadingSpin {
		width: 100%;
		min-height: 40vh;
		height: 100%;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.changeDayButton {
		margin-top: 16px !important;
	}

	.display-all {
		white-space: pre-line;
	}
	
	.coursModal h2 {
		font-size: 16px !important;
	}

	.newCoursBtn {
		width: 56px;
		height: 56px;
	}

	.ios .newCoursModal .header-ios ion-toolbar:last-of-type {
		--border-width: 0 0 0 0 !important;
	}

	.ios .newCoursModal ion-content::part(scroll) {
		background: var(--ion-toolbar-background, var(--ion-color-step-50, #f7f7f7));
	}

	.ios .newCoursModal ion-list.list-inset {
		background : var(--ion-background-color) !important;
		border-radius: 10px !important;
	}

	.ios .newCoursModal ion-list.list-inset > * {
		--background : var(--ion-background-color) !important;
	}

	.dark .ios .newCoursModal ion-list.list-inset {
		background : var(--ion-color-step-100) !important;
	}

	.dark .ios .newCoursModal ion-list.list-inset > * {
		--background : var(--ion-color-step-100) !important;
	}

	.dark .ios .newCoursModal .timeInput {
		background: var(--ion-color-step-150) !important;
	}

	.ios .newCoursModal .timeInput {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;

		background: var(--ion-color-step-50);
		border-radius: 8px;

		width: 70px;
		height: 34px;
		padding-left: 9px;

	}

	.ios .newCoursModal .timeInInput {
		all: unset;
		font-size: 18px;
	}

	.ios .timeInInput::-webkit-calendar-picker-indicator {
		background: none !important;
		display:none;
	}

	.md .newCoursModal ion-list {
		padding: 0 15px;
	}

	.expand_title {
		height: 18px !important;
		opacity: 0.4;
	}
</style>
