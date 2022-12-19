<script>
  import { defineComponent } from 'vue';
  import { IonButtons, IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonList, IonModal, IonItem, IonDatetime } from '@ionic/vue';
  
  import { calendarOutline, calendarSharp, todayOutline, todaySharp } from 'ionicons/icons';

  import { Swiper, SwiperSlide } from 'swiper/vue';
  import 'swiper/css';

  import CoursElement from '@/components/timetable/CoursElement.vue';

  import GetTimetable from '@/functions/fetch/GetTimetable.js';

  export default defineComponent({
    name: 'FolderPage',
    components: {
        IonButtons,
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
        IonIcon,
        IonItem,
        Swiper,
        SwiperSlide,
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
        getTimetables() {
            // get timetable for rn
            GetTimetable(this.$rn).then((timetable) => {
                this.timetable = timetable;
                this.loadedrnButtonString = this.createDateString(this.$rn);

                if(this.shouldResetSwiper) {
                    this.$refs.swiper.$el.swiper.slideTo(1, 0);
                    this.shouldResetSwiper = false;
                }
            });

            // get timetable for yesterday
            let yesterdayRN = new Date(this.$rn) - 86400000;
            GetTimetable(yesterdayRN).then((timetable) => {
                this.yesterday = timetable;
            });

            // get timetable for tomorrow
            let tomorrowRN = new Date(this.$rn);
            tomorrowRN.setDate(tomorrowRN.getDate() + 1);
            GetTimetable(tomorrowRN).then((timetable) => {
                this.tomorrow = timetable;
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
            shouldResetSwiper: false,
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
        console.log(swiper);

        swiper.on('touchEnd', () => {
            setTimeout(() => {
                // get new rn
                // check if swiper is on yesterday
                if(swiper.activeIndex == 0) {
                    this.$rn = new Date(this.$rn) - 86400000;

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
      <ion-header>
        <ion-toolbar>

          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>

          <ion-title>Ma journée</ion-title>

          <ion-buttons slot="end">
            <ion-button id="rnPickerModalButton">
              <ion-icon slot="start" :icon="calendarOutline" :ios="calendarOutline" :md="calendarSharp"></ion-icon>
              {{ rnButtonString }}
            </ion-button>
          </ion-buttons>

        </ion-toolbar>
      </ion-header>
      
      <ion-content :fullscreen="true">
        <ion-header collapse="condense">
          <ion-toolbar>
            <ion-title size="large">Emploi du temps</ion-title>
          </ion-toolbar>
        </ion-header>
      
        <swiper initialSlide="1" ref="swiper">
            <swiper-slide>
                <IonList>
                    <CoursElement v-for="cours in yesterday" :key="cours.id"
                        :subject="cours.data.subject"
                        :teacher="cours.data.teacher"
                        :room="cours.data.room"
                        :start="cours.time.start.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
                        :end="cours.time.end.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
                    />

                    <IonItem v-if="yesterday.length == 0">
                        <IonIcon slot="start" :icon="todayOutline" :ios="todayOutline" :md="todaySharp"></IonIcon>
                        <ion-label>
                            <h2>Pas de cours pour cette journée</h2>
                            <p>Réesayez un autre jour</p>
                        </ion-label>
                    </IonItem>
                </IonList>
            </swiper-slide>
            <swiper-slide>
                <IonList>
                    <CoursElement v-for="cours in timetable" :key="cours.id"
                        :subject="cours.data.subject"
                        :teacher="cours.data.teacher"
                        :room="cours.data.room"
                        :start="cours.time.start.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
                        :end="cours.time.end.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
                    />

                    <IonItem v-if="timetable.length == 0">
                        <IonIcon slot="start" :icon="todayOutline" :ios="todayOutline" :md="todaySharp"></IonIcon>
                        <ion-label>
                            <h2>Pas de cours pour cette journée</h2>
                            <p>Réesayez un autre jour</p>
                        </ion-label>
                    </IonItem>
                </IonList>
            </swiper-slide>
            <swiper-slide>
                <IonList>
                    <CoursElement v-for="cours in tomorrow" :key="cours.id"
                        :subject="cours.data.subject"
                        :teacher="cours.data.teacher"
                        :room="cours.data.room"
                        :start="cours.time.start.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
                        :end="cours.time.end.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
                    />

                    <IonItem v-if="tomorrow.length == 0">
                        <IonIcon slot="start" :icon="todayOutline" :ios="todayOutline" :md="todaySharp"></IonIcon>
                        <ion-label>
                            <h2>Pas de cours pour cette journée</h2>
                            <p>Réesayez un autre jour</p>
                        </ion-label>
                    </IonItem>
                </IonList>
            </swiper-slide>
        </swiper>

        <IonModal ref="rnPickerModal" trigger="rnPickerModalButton" class="datetimeModal" :keep-contents-mounted="true" :initial-breakpoint="0.55" :breakpoints="[0, 0.55, 1]">
          <ion-header>
            <ion-toolbar>
              <ion-title>Sélection de la date</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="confirmRnInput()">Terminé</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
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
      </ion-content>
    </ion-page>
</template>
  
<style scoped>
    /* show rnInput picker but hide it */
    #rnInput {
        -webkit-appearance: none;
        font-weight: 400;
        font-size: 16px;
        color: var(--ion-color-primary);
        background: rgba(var(--ion-color-primary-rgb), 0.1);
        border: none;
        border-radius: 7px;
        text-align: center;
        padding: 5px 10px !important;

        margin-right: 5px;

        /* fit content */
        width: auto;
    }

    /* hide calendar icon */
    #rnInput::-webkit-calendar-picker-indicator {
        display: none;
    }
</style>
