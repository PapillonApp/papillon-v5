<script>
  import { defineComponent } from 'vue';
  import { IonButtons, IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonList, IonModal, IonItem, IonDatetime, IonRefresher, IonRefresherContent, IonLabel, IonSpinner } from '@ionic/vue';
  
  import { calendarOutline, calendarSharp, todayOutline, todaySharp } from 'ionicons/icons';

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
        IonSpinner
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
        editTimetable(timetable) {
            // Check if there's 2 lessons starting at the same time
            for (let i = 0; i < timetable.length; i++) {
                if(timetable[i+1] !== undefined) {
                    let first = timetable[i].time.start.toISOString();
                    let second = timetable[i+1].time.start.toISOString();

                    if(first == second) {
                        timetable[i].course.sameTime = true;
                    }
                }
            }
            
            return timetable;
        },
        getTimetables() {
            // get timetable for rn
            GetTimetable(this.$rn).then((timetable) => {
                if(timetable.error) {
                    this.timetable = [];
                    this.timetable.error = timetable.error;
                }
                else {
                    this.timetable = this.editTimetable(timetable);
                    this.loadedrnButtonString = this.createDateString(this.$rn);
                }

                if(this.shouldResetSwiper) {
                    this.$refs.swiper.$el.swiper.slideTo(1, 0);
                    this.shouldResetSwiper = false;
                }
            });

            // get timetable for yesterday
            let yesterdayRN = new Date(this.$rn) - 86400000;
            GetTimetable(yesterdayRN).then((timetable) => {
                if(timetable.error) {
                    this.yesterday = [];
                    this.yesterday.error = timetable.error;
                }
                else {
                    this.yesterday = this.editTimetable(timetable);
                }
            });

            // get timetable for tomorrow
            let tomorrowRN = new Date(this.$rn);
            tomorrowRN.setDate(tomorrowRN.getDate() + 1);
            GetTimetable(tomorrowRN).then((timetable) => {
                if(timetable.error) {
                    this.tomorrow = [];
                    this.tomorrow.error = timetable.error;
                }
                else {
                    this.tomorrow = this.editTimetable(timetable);
                }
            });
        },
        handleRefresh(event) {
            // get new timetable data
            this.getTimetables();

            // stop refresh when this.timetable is updated
            this.$watch('timetable', () => {
                setTimeout(() => {
                    event.target.complete();
                }, 200);
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
                teachers: cours.data.teachers.join(', ') ?? "Aucun professeur",
                rooms: cours.data.rooms.join(', ') ?? "Aucune salle",
                start: cours.time.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                memo: cours.data.memo,
                hasMemo: cours.data.hasMemo,
                linkVirtualClassroom: cours.data.linkVirtual,
                length: len,
                status: status,
                hasStatus: hasStatus,
                isCancelled: cours.status.isCancelled
            }

            // open cours modal
            this.$refs.coursModal.$el.present(cours);
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
            shouldResetSwiper: false,
            selectedCourse: {
                name: '',
                teacher: '',
                room: '',
                start: '',
                length: '',
                status: '',
            }
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

        swiper.on('touchEnd', () => {
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
            }, 200);
        });
    }
  });
</script>

<template>
    <ion-page ref="page">
      <IonHeader class="AppHeader">
        <IonToolbar>

          <ion-buttons slot="start">
            <ion-menu-button color="dark" mode="md"></ion-menu-button>
          </ion-buttons>

          <ion-title mode="md">Ma journée</ion-title>

          <ion-buttons slot="end">
            <ion-button mode="md" color="dark" id="rnPickerModalButton">
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

        <IonHeader collapse="condense">
            <IonToolbar>
                <ion-title size="large">Ma journée</ion-title>
            </IonToolbar>
        </IonHeader>

        <div id="noTouchZone"></div>
      
        <!-- faudrait un moyen de retirer cette répétition -->
        <swiper :initialSlide="1" ref="swiper">
            <swiper-slide class="swiper-slide">
                <IonList>
                    <CoursElement v-for="cours in yesterday" :key="cours.id"
                        :subject="cours.data.subject"
                        :teachers="cours.data.teachers.join(', ')"
                        :rooms="cours.data.rooms.join(', ')"
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
                        @open="openCoursModal(cours)"
                    />

                    <div v-if="!yesterday.error"><div class="NoCours" v-if="yesterday.length == 0">
                        <span class="material-symbols-outlined mdls">upcoming</span>
                        <h2>Pas de cours enregistrés pour cette journée</h2>
                        <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>

                        <ion-button fill="clear" @click="openRnPicker" class="changeDayButton">Ouvrir le calendrier</ion-button>
                    </div></div>

                    <div v-if="yesterday.error == 'ERR_NETWORK'" class="Error"><div class="NoCours" v-if="yesterday.length == 0">
                        <span class="material-symbols-outlined mdls">wifi_off</span>
                        <h2>Pas de connexion à Internet</h2>
                        <p>Vous pouvez uniquement consulter les journées consultées à l'avance lorsque vous êtes hors-ligne.</p>
                    </div></div>

                    <div v-if="yesterday.error == 'ERR_BAD_REQUEST'" class="Error"><div class="NoCours" v-if="timetable.length == 0">
                        <IonSpinner></IonSpinner>
                        <br/>
                        <h2>Téléchargement des prochains cours...</h2>
                        <p>Veuillez patienter pendant qu'on récupère vos cours depuis nos serveurs...</p>
                    </div></div>
                </IonList>
            </swiper-slide>
            <swiper-slide>
                <IonList>
                    <CoursElement v-for="cours in timetable" :key="cours.id"
                        :subject="cours.data.subject"
                        :teachers="cours.data.teachers.join(', ')"
                        :rooms="cours.data.rooms.join(', ')"
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
                        @open="openCoursModal(cours)"
                    />

                    <div v-if="!timetable.error"><div class="NoCours" v-if="timetable.length == 0">
                        <span class="material-symbols-outlined mdls">upcoming</span>
                        <h2>Pas de cours enregistrés pour cette journée</h2>
                        <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>

                        <ion-button fill="clear" @click="openRnPicker" class="changeDayButton">Ouvrir le calendrier</ion-button>
                    </div></div>

                    <div v-if="timetable.error == 'ERR_NETWORK'" class="Error"><div class="NoCours" v-if="timetable.length == 0">
                        <span class="material-symbols-outlined mdls">wifi_off</span>
                        <h2>Pas de connexion à Internet</h2>
                        <p>Vous pouvez uniquement consulter les journées consultées à l'avance lorsque vous êtes hors-ligne.</p>
                    </div></div>

                    <div v-if="timetable.error == 'ERR_BAD_REQUEST'" class="Error"><div class="NoCours" v-if="timetable.length == 0">
                        <IonSpinner></IonSpinner>
                        <br/>
                        <h2>Téléchargement des prochains cours...</h2>
                        <p>Veuillez patienter pendant qu'on récupère vos cours depuis nos serveurs...</p>
                    </div></div>
                </IonList>
            </swiper-slide>
            <swiper-slide>
                <IonList>
                    <CoursElement v-for="cours in tomorrow" :key="cours.id"
                        :subject="cours.data.subject"
                        :teachers="cours.data.teachers.join(', ')"
                        :rooms="cours.data.rooms.join(', ')"
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
                        @open="openCoursModal(cours)"
                    />

                    <div v-if="!tomorrow.error"><div class="NoCours" v-if="tomorrow.length == 0">
                        <span class="material-symbols-outlined mdls">upcoming</span>
                        <h2>Pas de cours enregistrés pour cette journée</h2>
                        <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>

                        <ion-button fill="clear" @click="openRnPicker" class="changeDayButton">Ouvrir le calendrier</ion-button>
                    </div></div>

                    <div v-if="tomorrow.error == 'ERR_NETWORK'" class="Error"><div class="NoCours" v-if="tomorrow.length == 0">
                        <span class="material-symbols-outlined mdls">wifi_off</span>
                        <h2>Pas de connexion à Internet</h2>
                        <p>Vous pouvez uniquement consulter les journées consultées à l'avance lorsque vous êtes hors-ligne.</p>
                    </div></div>

                    <div v-if="tomorrow.error == 'ERR_BAD_REQUEST'" class="Error"><div class="NoCours" v-if="timetable.length == 0">
                        <IonSpinner></IonSpinner>
                        <br/>
                        <h2>Téléchargement des prochains cours...</h2>
                        <p>Veuillez patienter pendant qu'on récupère vos cours depuis nos serveurs...</p>
                    </div></div>
                </IonList>
            </swiper-slide>
        </swiper>


        <IonModal ref="rnPickerModal" trigger="rnPickerModalButton" class="datetimeModal" :keep-contents-mounted="true" :initial-breakpoint="0.55" :breakpoints="[0, 0.55, 1]">
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

        <IonModal ref="coursModal" :keep-contents-mounted="true" :initial-breakpoint="0.6" :breakpoints="[0, 0.6, 0.9]" :handle="true" :canDismiss="true">
            <IonHeader>
              <IonToolbar>
                <ion-title>{{selectedCourse.name}}</ion-title>
              </IonToolbar>
            </IonHeader>
            <ion-content>
                <ion-list>
                    <ion-item>
                        <span class="material-symbols-outlined mdls" slot="start">history_edu</span>
                        <ion-label>
                            <p>Nom de la matière</p>
                            <h3>{{selectedCourse.name}}</h3>
                        </ion-label>
                    </ion-item>

                    <ion-item>
                        <span class="material-symbols-outlined mdls" slot="start">face</span>
                        <ion-label>
                            <p>Professeur</p>
                            <h3>{{selectedCourse.teachers}}</h3>
                        </ion-label>
                    </ion-item>

                    <ion-item>
                        <span class="material-symbols-outlined mdls" slot="start">meeting_room</span>
                        <ion-label>
                            <p>Salle de cours</p>
                            <h3>{{selectedCourse.rooms}}</h3>
                        </ion-label>
                    </ion-item>

                    <ion-item v-if="selectedCourse.hasMemo">
                        <span class="material-symbols-outlined mdls" slot="start">description</span>
                        <ion-label>
                            <p>Mémo</p>
                            <h3>{{selectedCourse.memo}}</h3>
                        </ion-label>
                    </ion-item>

                    <ion-item>
                        <span class="material-symbols-outlined mdls" slot="start">schedule</span>
                        <ion-label>
                            <p>Heure de début</p>
                            <h3>{{selectedCourse.start}}</h3>
                        </ion-label>
                    </ion-item>

                    <ion-item>
                        <span class="material-symbols-outlined mdls" slot="start">pending_actions</span>
                        <ion-label>
                            <p>Temps de cours</p>
                            <h3>{{selectedCourse.length}}</h3>
                        </ion-label>
                    </ion-item>

                    <ion-item v-if="selectedCourse.isCancelled" style="color: var(--ion-color-danger);">
                        <span class="material-symbols-outlined mdls" slot="start">error</span>
                        <ion-label>
                            <p>Statut</p>
                            <h3>{{selectedCourse.status}}</h3>
                        </ion-label>
                    </ion-item>

                    <ion-item v-else-if="selectedCourse.hasStatus" style="color: var(--ion-color-warning);">
                        <span class="material-symbols-outlined mdls" slot="start">info</span>
                        <ion-label>
                            <p>Statut</p>
                            <h3>{{selectedCourse.status}}</h3>
                        </ion-label>
                    </ion-item>

                    <ion-item v-else>
                        <span class="material-symbols-outlined mdls" slot="start">info</span>
                        <ion-label>
                            <p>Statut</p>
                            <h3>{{selectedCourse.status}}</h3>
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
</style>
