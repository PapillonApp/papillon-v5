<script>
  import { defineComponent } from 'vue';
  import { IonButtons, IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonList, IonModal, IonItem, IonDatetime, IonRefresher, IonRefresherContent, IonLabel, IonSpinner, IonFab, IonInput } from '@ionic/vue';

  import { Share } from '@capacitor/share';

  import { App } from '@capacitor/app';
  import { Network } from '@capacitor/network';

  import displayToast from '@/functions/utils/displayToast.js';
  import subjectColor from '@/functions/utils/subjectColor.js';
  import timetableEdit from '@/functions/utils/timetableEdit.js';
  
  import { calendarOutline, calendarSharp, todayOutline, todaySharp, notifications } from 'ionicons/icons';

  import { LocalNotifications } from '@capacitor/local-notifications';

  import { Swiper, SwiperSlide } from 'swiper/vue';
  import 'swiper/css';

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
        IonInput
    },
    setup() {
        return { 
            calendarOutline,
            calendarSharp,
            todayOutline,
            todaySharp,
            presentingElement: null,
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
            // get new date from rnInput
            let newDate = new Date(this.$refs.rnInput.$el.value);

            // update rn
            this.$rn = newDate;

            // emit event
            document.dispatchEvent(new CustomEvent('rnChanged', { detail: newDate }));
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
            this.$refs.swiper.$el.swiper.slideTo(1, 0);

            this.timetable.error = "STILL_LOADING";
            this.yesterday.error = "STILL_LOADING";
            this.tomorrow.error = "STILL_LOADING";
        },
        async getTimetables(force) {
            // get timetable for rn
            GetTimetable(this.$rn, force).then((timetable) => {
                if(timetable.error) {
                    if(timetable.error == "ERR_BAD_REQUEST") {
                        this.timetable.loading = true;
                    }
                    else {
                        this.timetable = [];
                        this.timetable.error = timetable.error;
                    }
                }
                else {
                    this.timetable = this.editTimetable(timetable, this.$rn);
                    this.loadedrnButtonString = this.createDateString(this.$rn);
                    this.timetable.loading = false;
                }
            });

            // get timetable for yesterday
            let yesterdayRN = new Date(this.$rn) - 86400000;
            GetTimetable(yesterdayRN, force).then((timetable) => {
                if(timetable.error) {
                    this.yesterday = [];
                    this.yesterday.error = timetable.error;

                    if(timetable.error == "ERR_BAD_REQUEST") {
                        this.yesterday.loading = true;
                    }
                }
                else {
                    this.yesterday = this.editTimetable(timetable, yesterdayRN);
                    this.yesterday.loading = false;
                }
            });

            // get timetable for tomorrow
            let tomorrowRN = new Date(this.$rn);
            tomorrowRN.setDate(tomorrowRN.getDate() + 1);
            GetTimetable(tomorrowRN, force).then((timetable) => {
                if(timetable.error) {
                    this.tomorrow = [];
                    this.tomorrow.error = timetable.error;
                }
                else {
                    this.tomorrow = this.editTimetable(timetable, tomorrowRN);
                    this.tomorrow.loading = false;

                    if(timetable.error == "ERR_BAD_REQUEST") {
                        this.tomorrow.loading = true;
                    }
                }
            });

            // set connection status
            this.connected = await Network.getStatus()
            this.connected = this.connected.connected;
        },
        handleRefresh(event) {
            // get new timetable data
            this.getTimetables(true);

            // stop refresh when this.timetable is updated
            this.$watch('timetable', () => {
                if(this.timetable.error != "STILL_LOADING" && this.timetable.error != "ERR_BAD_REQUEST") {
                    setTimeout(() => {
                        event.target.complete();
                    }, 200);
                }
            });
        },
        async shareCours(cours) {
            let sharedCourse = {
                name: cours.data.subject,
                teachers: cours.data.teachers.join(', ') || "Aucun professeur",
                rooms: cours.data.rooms.join(', ') || "Aucune salle",
                start: cours.time.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                end: cours.time.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                status: cours.status.status,
                color: cours.course.color
            }

            // get first name of user
            let firstName = JSON.parse(localStorage.getItem("userData")).student.name;
            firstName = firstName.split(" ")[firstName.split(" ").length - 1];

            let urlElems = "";
            urlElems += firstName + ","; // first name
            urlElems += sharedCourse.name + ",";
            urlElems += sharedCourse.teachers + ",";
            urlElems += sharedCourse.rooms + ",";
            urlElems += sharedCourse.start + ",";
            urlElems += sharedCourse.end + ",";
            urlElems += sharedCourse.color + ",";
            urlElems += sharedCourse.status;

            // base64 encode urlElems
            let url = "https://getpapillon.xyz/course?c=" + btoa(urlElems);

            console.log(url);

            // share url
            await Share.share({
                url: url,
                dialogTitle: "Partager votre cours de " + cours.data.subject
            });
        },
        async openCoursModal(cours) {
            // calculate length
            let len = cours.time.end - cours.time.start;
            len = (len / 60000) + " min";

            // put len in hours if it's longer than 60 minutes
            if(len.split(' ')[0] > 59) {
                let hours = parseInt(len.split(' ')[0] / 60);
                let minutes = parseInt(len.split(' ')[0] % 60);

                // add leading 0 if minutes is less than 10
                if(minutes < 10) {
                    minutes = "0" + minutes;
                }

                len = `${hours} h ${minutes} min`;
            }

            let status = cours.status.status;
            let hasStatus = status != undefined;

            if (cours.status.isOuting) {
                status = "Vous êtes en sortie"
                hasStatus = true;
            } else if (cours.status.isTest) {
                status = "Vous avez un contrôle"
                hasStatus = true;
            } else if(status == undefined) {
                status = "Le cours se déroule normalement";
            }

            let notifEnabled = false;

            // check if notification is enabled
            await LocalNotifications.getPending().then((res) => {
                let notifs = res.notifications;

                let time = new Date(cours.time.start);
                time.setMinutes(time.getMinutes() - 5);

                // check if time = schedule.at
                notifs.forEach((notif) => {
                    let notifTime = new Date(notif.schedule.at);

                    if(notifTime.getTime() == time.getTime()) {
                        notifEnabled = true;
                    }
                });
            });

            // set selectedCourse
            this.selectedCourse = {
                name: cours.data.subject,
                teachers: cours.data.teachers.join(', ') || "Aucun professeur",
                rooms: cours.data.rooms.join(', ') || "Aucune salle",
                start: cours.time.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                end: cours.time.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                memo: cours.data.memo,
                hasMemo: cours.data.hasMemo,
                linkVirtualClassroom: cours.data.linkVirtual,
                length: len,
                status: status,
                hasStatus: hasStatus,
                isCancelled: cours.status.isCancelled,
                custom: cours.status.isCustom,
                id: cours.course.id,
                originalCourse: cours,
                notificationEnabled: notifEnabled
            }

            // open cours modal
            this.$refs.coursModal.$el.present(cours);
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
            this.$refs.newCoursModal.$el.dismiss();

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
        async setNotif(course) {
            try {
                let subject = course.data.subject;
                let room = course.data.rooms[0] || "salle inconnue";
                let teacher = course.data.teachers[0];

                let time = new Date(course.time.start);
                time.setMinutes(time.getMinutes() - 5);

                // check if time is in the future
                if(time.getTime() < new Date().getTime()) {
                    displayToast.presentToastFull(
                        'Impossible de vous notifier pour ' + subject,
                        'Le cours a déjà commencé ou est terminé.',
                        'danger',
                        notifications
                    );
                }
                else {
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
                    
                    // notify user
                    this.selectedCourse.notificationEnabled = true;

                    displayToast.presentToastFull(
                        'Notifications activées pour ' + subject,
                        'Vous receverez une notification 5 minutes avant le début du cours',
                        'light',
                        notifications
                    );
                }
            } catch (error) {
                displayToast.presentError("Une erreur est survenue lors de l'activation des notifications", "danger", error);
            }
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

                        console.log('notif cancelled');

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
        }
    },
    data() {
        return {
            rnButtonString: this.createDateString(this.$rn),
            loadedrnButtonString: this.createDateString(this.$rn),
            rnCalendarString: this.$rn.toISOString().split('T')[0],
            timetable: [],
            yesterday: [],
            tomorrow: [],
            connected: false,
            shouldResetSwiper: false,
            days: ['yesterday', 'timetable', 'tomorrow'],
            selectedCourse: {
                name: '',
                teacher: '',
                room: '',
                start: '',
                end: '',
                length: '',
                status: '',
                notificationEnabled: false,
            },
            newCoursModalOpen: false,
            rnPickerModalOpen: false,
        }
    },
    mounted() {
        // sets presentingElement
        this.presentingElement = this.$refs.page.$el;

        // on rnChanged, update rnButtonString
        document.addEventListener('rnChanged', (e) => {
            this.rnButtonString = this.createDateString(e.detail);
        });

        // get timetable data
        this.getTimetables();

        // on rnChanged, get new timetable data
        document.addEventListener('rnChanged', () => {
            this.getTimetables();
        });

        // on token changed, get new timetable data
        document.addEventListener('tokenUpdated', () => {
            this.getTimetables();
        });

        // detect swiper slide change
        let swiper = this.$refs.swiper.$el.swiper;

        swiper.on('slideChangeTransitionEnd', () => {
            setTimeout(() => {
                // get new rn
                // check if swiper is on yesterday
                if(swiper.activeIndex == 0) {
                    let newRn = new Date(this.$rn);
                    newRn.setDate(newRn.getDate() - 1);

                    this.$rn = newRn;
                    this.rnCalendarString = this.$rn.toISOString().split('T')[0];

                    // reset swiper
                    this.resetSwiper()

                    // emit event
                    document.dispatchEvent(new CustomEvent('rnChanged', { detail: this.$rn }));
                }

                // check if swiper is on tomorrow
                if(swiper.activeIndex == 2) {
                    // add 1 day to rn
                    let newRn = new Date(this.$rn);
                    newRn.setDate(newRn.getDate() + 1);

                    this.$rn = newRn;
                    this.rnCalendarString = this.$rn.toISOString().split('T')[0];

                    // reset swiper
                    this.resetSwiper()

                    // emit event
                    document.dispatchEvent(new CustomEvent('rnChanged', { detail: this.$rn }));
                }
            }, 0);
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
    <ion-page ref="page">
      <IonHeader class="AppHeader" collapse="fade" translucent>
        <IonToolbar>

          <ion-buttons slot="start">
            <ion-menu-button color="dark" mode="md"></ion-menu-button>
          </ion-buttons>

          <ion-title mode="md">Ma journée</ion-title>

          <ion-buttons slot="end">
            <ion-button mode="md" id="rnPickerModalButton" color="dark" @click="changernPickerModalOpen(true)">
              <span class="material-symbols-outlined mdls" slot="start">calendar_month</span>

              <p>{{ rnButtonString }}</p>
            </ion-button>
          </ion-buttons>

        </IonToolbar>
      </IonHeader>
      
      <ion-content :fullscreen="true">
        <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
            <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <IonFab slot="fixed" vertical="bottom" horizontal="end" class="newCoursBtnFab">
            <ion-button @click="setNewCoursModalOpen(true)" size="large" shape="round" class="newCoursBtn" mode="md">
                <span class="material-symbols-outlined mdls" slot="icon-only">add</span>
            </ion-button>
        </IonFab>

        

        <div id="noTouchZone"></div>
      
        <swiper :initialSlide="1" ref="swiper" :speed="300" :spaceBetween="10" :preventClicks="true" :effect="'fade'">
            <swiper-slide v-for="(day, i) in days" :key="i">
                <IonList>
                    <CoursElement v-for="cours in $data[`${day}`]" :key="cours.id"
                        :subject="cours.data.subject"
                        :teachers="cours.data.teachers.join(', ') || 'Pas de professeur'"
                        :rooms="cours.data.rooms.join(', ') || 'Pas de salle'"
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
                        @open="openCoursModal(cours)"
                    />

                    <div class="NoCours" v-if="$data[`${day}`].length == 0 && !$data[`${day}`].error && !$data[`${day}`].loading">
                        <span class="material-symbols-outlined mdls">upcoming</span>
                        <h2>Pas de cours enregistrés pour cette journée</h2>
                        <p>Réessayez un autre jour dans le calendrier ou balayez l'écran.</p>

                        <ion-button fill="clear" @click="changernPickerModalOpen(true)" class="changeDayButton">Ouvrir le calendrier</ion-button>
                    </div>

                    <div class="NoCours" v-if="$data[`${day}`].length == 0 && $data[`${day}`].error == 'ERR_NETWORK' && !$data[`${day}`].loading && !connected">
                        <span class="material-symbols-outlined mdls">wifi_off</span>
                        <h2>Pas de connexion à Internet</h2>
                        <p>Vous pouvez uniquement consulter les journées consultées à l'avance lorsque vous êtes hors-ligne.</p>
                    </div>

                    <div class="NoCours" v-if="$data[`${day}`].length == 0 && $data[`${day}`].error == 'ERR_NETWORK' && !$data[`${day}`].loading && connected">
                        <span class="material-symbols-outlined mdls">crisis_alert</span>
                        <h2>Serveurs indisponibles</h2>
                        <p>Vous pouvez uniquement consulter les journées consultées à l'avance. Nos serveurs seront bientôt de nouveaux disponibles.</p>
                    </div>

                    <div class="NoCours" v-if="$data[`${day}`].length == 0 && $data[`${day}`].loading">
                        <IonSpinner></IonSpinner>
                        <br/>
                        <h2>Téléchargement des prochains cours...</h2>
                        <p>Veuillez patienter pendant qu'on récupère vos cours depuis nos serveurs...</p>
                    </div>
                </IonList>
            </swiper-slide>
        </swiper>

        <IonModal ref="newCoursModal" class="newCoursModal" :is-open="newCoursModalOpen" :presenting-element="presentingElement">
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
                        <ion-input type="text" name="CourseTitle" ref="newCoursNameRef" placeholder="Nom du cours"></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-input type="text" name="Place" ref="newCoursRoomRef" placeholder="Lieu"></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-input type="text" name="Person" ref="newCoursTeacherRef" placeholder="Professeur"></ion-input>
                    </ion-item>
                </ion-list>

                <ion-list inset>
                    <ion-item class="input">
                        <ion-label>Heure de début</ion-label>
                        <div class="timeInput" slot="end">
                            <ion-input ref="newCoursStartRef" class="timeInInput" name="Start" type="time" value="12:30"></ion-input>
                        </div>
                    </ion-item>

                    <ion-item class="input">
                        <ion-label>Heure de fin</ion-label>
                        <div class="timeInput" slot="end">
                            <ion-input class="timeInInput" name="End" ref="newCoursEndRef" type="time" value="13:30"></ion-input>
                        </div>
                    </ion-item>
                </ion-list>
            </ion-content>
        </IonModal>


        <IonModal :is-open="rnPickerModalOpen" ref="rnPickerModal" class="datetimeModal" @didDismiss="changernPickerModalOpen(false)" :keep-contents-mounted="true" :initial-breakpoint="0.5" :breakpoints="[0, 0.5]">
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
                @ionChange="rnInputChanged()"
            >
            </IonDatetime>
          </ion-content>
        </IonModal>

        <IonModal ref="coursModal" class="coursModal" :keep-contents-mounted="true" :initial-breakpoint="0.6" :breakpoints="[0, 0.6, 0.9]" :handle="true" :canDismiss="true">
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
                            <p>Salle de cours</p>
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
                            <p>Temps de cours</p>
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
                        <ion-label>
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
    .swiper-slide {
        min-height: calc(86vh - 56px);
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

    .ios .newCoursBtnFab {
        bottom: 32px;
        right: 18px;
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

    @media screen and (prefers-color-scheme: dark) {
        .ios .newCoursModal ion-list.list-inset {
            background : var(--ion-color-step-100) !important;
        }

        .ios .newCoursModal ion-list.list-inset > * {
            --background : var(--ion-color-step-100) !important;
        }

        .ios .newCoursModal .timeInput {
            background: var(--ion-color-step-150) !important;
        }
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
</style>