<script>
  import { defineComponent } from 'vue';
  import { IonButtons, IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonList, IonModal, IonItem, IonDatetime, IonRefresher, IonRefresherContent, IonLabel, IonSpinner, IonFab, IonFabButton } from '@ionic/vue';

  const displayToast = require('@/functions/utils/displayToast.js');
  import subjectColor from '@/functions/utils/subjectColor.js'
  
  import { calendarOutline, calendarSharp, todayOutline, todaySharp, add } from 'ionicons/icons';

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

            // return string like "1 jan."
            return `${dateObject.getDate()} ${dateObject.toLocaleString('default', { month: 'short' })}`;
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
            this.$refs.rnPickerModal.$el.dismiss();
        },
        openRnPicker() {
            this.$refs.rnPickerModal.$el.present();
        },
        editTimetable(timetable, date) {
            // add sameTime property to courses that are at the same time
            for(let i = 0; i < timetable.length; i++) {
                let lesson = timetable[i];
                let lessonStart = new Date(lesson.time.start);
                let lessonEnd = new Date(lesson.time.end);

                for(let j = 0; j < timetable.length; j++) {
                    // check if lesson is at the same time as lesson2
                    let lesson2 = timetable[j];
                    let lesson2Start = new Date(lesson2.time.start);
                    let lesson2End = new Date(lesson2.time.end);

                    if (lessonStart <= lesson2Start && lessonEnd >= lesson2End && lesson.course.num != lesson2.course.num) {
                        if (lesson.course.num > lesson2.course.num) {
                            timetable[j].course.sameTime = true;
                        }
                        else {
                            timetable[i].course.sameTime = true;
                        }
                    }

                    // check if lesson2 starts at least 1 hour after lesson ends
                    if (lessonEnd < lesson2Start && lessonEnd.getHours() + 1 == lesson2Start.getHours()) {
                        
                        timetable[i].course.distance = true;
                    }
                }

            }

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
                    customCourse.course.course.color = subjectColor.getSubjectColor(customCourse.course.data.subject, subjectColor.getRandomColor());
                    timetable.push(customCourse.course);
                }
            });

            // for each lesson, add course.length property
            for(let i = 0; i < timetable.length; i++) {
                let lesson = timetable[i];
                let lessonStart = new Date(lesson.time.start);
                let lessonEnd = new Date(lesson.time.end);

                let length = lessonEnd - lessonStart;
                length = length / 1000 / 60 / 60;

                timetable[i].course.lengthCours = length;
            }

            // order timetable by time
            timetable.sort((a, b) => {
                let aStart = new Date(a.time.start);
                let bStart = new Date(b.time.start);

                return aStart - bStart;
            });
            
            return timetable;
        },
        getTimetables(force) {
            // reset swiper and show loading spinner
            if(this.shouldResetSwiper) {
                this.$refs.swiper.$el.swiper.slideTo(1, 0);
                this.shouldResetSwiper = false;

                this.timetable.error = "STILL_LOADING";
                this.yesterday.error = "STILL_LOADING";
                this.tomorrow.error = "STILL_LOADING";
            }

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
        openCoursModal(cours) {
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

            // set status if it's undefined
            if(status == undefined) {
                status = "Le cours se déroule normalement";
            }

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
                id: cours.course.id
            }

            // open cours modal
            this.$refs.coursModal.$el.present(cours);
        },
        addNewCours() {
            let st = new Date();
            let en = new Date();

            // this.$refs.newCoursStart.value returns HH:mm
            st.setHours(this.$refs.newCoursStart.value.split(':')[0]);
            st.setMinutes(this.$refs.newCoursStart.value.split(':')[1]);

            // this.$refs.newCoursEnd.value returns HH:mm
            en.setHours(this.$refs.newCoursEnd.value.split(':')[0]);
            en.setMinutes(this.$refs.newCoursEnd.value.split(':')[1]);

            // create new cours
            let newCourse = {
                course: {
                    id: Math.floor(Math.random() * 10000000),
                    color: "#0066ff",
                    num: Math.floor(Math.random() * 10000000),
                },
                data: {
                    subject: this.$refs.newCoursName.value,
                    teachers: [this.$refs.newCoursTeacher.value],
                    rooms: [this.$refs.newCoursRoom.value],
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
    },
    data() {
        return {
            rnButtonString: this.createDateString(this.$rn),
            loadedrnButtonString: this.createDateString(this.$rn),
            rnCalendarString: this.$rn.toISOString().split('T')[0],
            timetable: [],
            yesterday: [],
            tomorrow: [],
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
            },
            newCoursModalOpen: false,
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
        document.addEventListener('rnChanged', (e) => {
            this.getTimetables();
        });

        // on token changed, get new timetable data
        document.addEventListener('tokenUpdated', (e) => {
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

                    // emit event
                    document.dispatchEvent(new CustomEvent('rnChanged', { detail: this.$rn }));

                    // reset swiper
                    this.shouldResetSwiper = true;
                }

                // check if swiper is on tomorrow
                if(swiper.activeIndex == 2) {
                    // add 1 day to rn
                    let newRn = new Date(this.$rn);
                    newRn.setDate(newRn.getDate() + 1);

                    this.$rn = newRn;
                    this.rnCalendarString = this.$rn.toISOString().split('T')[0];

                    // emit event
                    document.dispatchEvent(new CustomEvent('rnChanged', { detail: this.$rn }));

                    // reset swiper
                    this.shouldResetSwiper = true;
                }
            }, 100);
        });
    }
  });
</script>

<template>
    <ion-page ref="page">
      <IonHeader class="AppHeader" translucent>
        <IonToolbar>

          <ion-buttons slot="start">
            <ion-menu-button color="dark" mode="md"></ion-menu-button>
          </ion-buttons>

          <ion-title mode="md">Ma journée</ion-title>

          <ion-buttons slot="end">
            <ion-button mode="md" id="rnPickerModalButton" color="dark" @click="openRnPicker()">
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
            <ion-button @click="newCoursModalOpen = true" size="large" shape="round" class="newCoursBtn" mode="md">
                <span class="material-symbols-outlined mdls" slot="icon-only">add</span>
            </ion-button>
        </IonFab>

        <IonHeader collapse="condense">
            <IonToolbar>
                <ion-title size="large">Ma journée</ion-title>
            </IonToolbar>
        </IonHeader>

        <div id="noTouchZone"></div>
      
        <!-- faudrait un moyen de retirer cette répétition -->
        <swiper :initialSlide="1" ref="swiper" :speed="300" :spaceBetween="10" :preventClicks="true" :effect="'fade'">
            <swiper-slide v-for="(day, i) in days" :key="i">
                <IonList>
                    <CoursElement v-for="cours in $data[`${day}`]" :key="cours.id"
                        :subject="cours.data.subject"
                        :teachers="cours.data.teachers.join(', ') || 'Pas de professeur'"
                        :rooms="cours.data.rooms.join(', ') || 'Pas de salle'"
                        :memo="cours.data.hasMemo"
                        :start="cours.time.start.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
                        :end="cours.time.end.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
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

                    <div v-if="!$data[`${day}`].loading"><div v-if="!$data[`${day}`].error"><div class="NoCours" v-if="$data[`${day}`].length == 0">
                        <span class="material-symbols-outlined mdls">upcoming</span>
                        <h2>Pas de cours enregistrés pour cette journée</h2>
                        <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>

                        <ion-button fill="clear" @click="openRnPicker" class="changeDayButton">Ouvrir le calendrier</ion-button>
                    </div></div></div>

                    <div v-if="$data[`${day}`].error == 'ERR_NETWORK'" class="Error"><div class="NoCours" v-if="$data[`${day}`].length == 0">
                        <span class="material-symbols-outlined mdls">wifi_off</span>
                        <h2>Pas de connexion à Internet</h2>
                        <p>Vous pouvez uniquement consulter les journées consultées à l'avance lorsque vous êtes hors-ligne.</p>
                    </div></div>

                    <div v-if="$data[`${day}`].loading" class="Error"><div class="NoCours" v-if="$data[`${day}`].length == 0">
                        <IonSpinner></IonSpinner>
                        <br/>
                        <h2>Téléchargement des prochains cours...</h2>
                        <p>Veuillez patienter pendant qu'on récupère vos cours depuis nos serveurs...</p>
                    </div></div>
                </IonList>
            </swiper-slide>
        </swiper>

        <IonModal ref="newCoursModal" class="newCoursModal" :is-open="newCoursModalOpen">
            <IonHeader>
                <IonToolbar>
                    <ion-buttons slot="start">
                        <ion-button @click="newCoursModalOpen = false">Annuler</ion-button>
                    </ion-buttons>
                    <ion-title>Ajouter un cours</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="addNewCours()" color="primary">Ajouter</ion-button>
                    </ion-buttons>
                </IonToolbar>
            </IonHeader>
            <ion-content class="ion-padding">

                <ion-list mode="md">

                    <ion-item class="input">
                        <span slot="start" class="material-symbols-outlined mdls">drive_file_rename_outline</span>
                        <ion-label position="floating">Nom du cours</ion-label>
                        <ion-input ref="newCoursName" placeholder="Réunion"></ion-input>
                    </ion-item>

                    <ion-item class="input">
                        <span slot="start" class="material-symbols-outlined mdls">face</span>
                        <ion-label position="floating">Professeur</ion-label>
                        <ion-input ref="newCoursTeacher" placeholder="CPE"></ion-input>
                    </ion-item>

                    <ion-item class="input">
                        <span slot="start" class="material-symbols-outlined mdls">location_on</span>
                        <ion-label position="floating">Lieu</ion-label>
                        <ion-input ref="newCoursRoom" placeholder="A210"></ion-input>
                    </ion-item>

                    <ion-item class="input">
                        <span slot="start" class="material-symbols-outlined mdls">schedule</span>
                        <ion-label position="floating">Heure de début</ion-label>
                        <ion-input ref="newCoursStart" type="time" placeholder="12:30"></ion-input>
                    </ion-item>

                    <ion-item class="input">
                        <span slot="start" class="material-symbols-outlined mdls">hourglass_empty</span>
                        <ion-label position="floating">Heure de fin</ion-label>
                        <ion-input ref="newCoursEnd" type="time" placeholder="13:30"></ion-input>
                    </ion-item>

                </ion-list>

                <ion-button mode="md" @click="addNewCours()" expand="block">Ajouter</ion-button>

            </ion-content>
        </IonModal>


        <IonModal ref="rnPickerModal" class="datetimeModal" :keep-contents-mounted="true" :initial-breakpoint="0.55" :breakpoints="[0, 0.55, 1]">
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
                    </ion-item>

                    <ion-item class="info-item">
                        <span class="material-symbols-outlined mdls" slot="start">pending_actions</span>
                        <ion-label>
                            <p>Temps de cours</p>
                            <h2>{{selectedCourse.length}}</h2>
                        </ion-label>
                    </ion-item>

                    <ion-item class="info-item" v-if="selectedCourse.isCancelled" style="color: var(--ion-color-danger);">
                        <span class="material-symbols-outlined mdls" slot="start">emergency_home</span>
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
                    </ion-item>

                    <ion-item button v-if="selectedCourse.custom" @click="deleteCustomCourse(selectedCourse.id)">
                        <span class="material-symbols-outlined mdls" slot="start" color="danger">delete</span>
                        <ion-label color="danger">
                            <h2>Supprimer le cours personnalisé</h2>
                        </ion-label>
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

    .input span {
        margin-top: 15px;
    }
</style>
