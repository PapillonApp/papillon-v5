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
        editTimetable(timetable) {
            // Check if there's 2 lessons starting at the same time
            for (let i = 0; i < timetable.length; i++) {
                if(timetable[i+1] !== undefined) {
                    let first = timetable[i].time.start.toISOString();
                    let second = timetable[i+1].time.start.toISOString();

                    if(first == second) {
                        timetable[i+1].course.sameTime = true;
                    }
                }
            }
            
            return timetable;
        },
        getTimetables() {
            // get timetable for rn
            GetTimetable(this.$rn).then((timetable) => {
                this.timetable = this.editTimetable(timetable);
                this.loadedrnButtonString = this.createDateString(this.$rn);

                if(this.shouldResetSwiper) {
                    this.$refs.swiper.$el.swiper.slideTo(1, 0);
                    this.shouldResetSwiper = false;
                }
            });

            // get timetable for yesterday
            let yesterdayRN = new Date(this.$rn) - 86400000;
            GetTimetable(yesterdayRN).then((timetable) => {
                this.yesterday = this.editTimetable(timetable);
            });

            // get timetable for tomorrow
            let tomorrowRN = new Date(this.$rn);
            tomorrowRN.setDate(tomorrowRN.getDate() + 1);
            GetTimetable(tomorrowRN).then((timetable) => {
                this.tomorrow = this.editTimetable(timetable);
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
      <ion-header class="AppHeader">
        <ion-toolbar>

          <ion-buttons slot="start">
            <ion-menu-button color="dark" mode="md"></ion-menu-button>
          </ion-buttons>

          <ion-title mode="md">Ma journée</ion-title>

          <ion-buttons slot="end">
            <ion-button color="dark" mode="md" id="rnPickerModalButton">
              <span class="material-symbols-outlined mdls" slot="start">calendar_month</span>

              {{ rnButtonString }}
            </ion-button>
          </ion-buttons>

        </ion-toolbar>
      </ion-header>
      
      <ion-content :fullscreen="true">
        <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
            <ion-refresher-content></ion-refresher-content>
          </ion-refresher>

        <ion-header collapse="condense">
            <ion-toolbar>
                <ion-title size="large">Ma journée</ion-title>
            </ion-toolbar>
        </ion-header>
      
        <swiper initialSlide="1" ref="swiper">
            <swiper-slide class="swiper-slide">
                <IonList>
                    <CoursElement v-for="cours in yesterday" :key="cours.id"
                        :subject="cours.data.subject"
                        :teacher="cours.data.teacher"
                        :room="cours.data.room"
                        :start="cours.time.start.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
                        :end="cours.time.end.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
                        :color="cours.course.color"
                        :sameTime="cours.course.sameTime"
                        :status="cours.status.status"
                        :isCancelled="cours.status.isCancelled"
                    />

                    <div class="NoCours" v-if="yesterday.length == 0">
                        <span class="material-symbols-outlined mdls">upcoming</span>
                        <h2>Pas de cours enregistrés pour cette journée</h2>
                        <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>
                    </div>
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
                        :color="cours.course.color"
                        :sameTime="cours.course.sameTime"
                        :status="cours.status.status"
                        :isCancelled="cours.status.isCancelled"
                    />

                    <div class="NoCours" v-if="timetable.length == 0">
                        <span class="material-symbols-outlined mdls">upcoming</span>
                        <h2>Pas de cours enregistrés pour cette journée</h2>
                        <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>
                    </div>
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
                        :color="cours.course.color"
                        :sameTime="cours.course.sameTime"
                        :status="cours.status.status"
                        :isCancelled="cours.status.isCancelled"
                    />

                    <div class="NoCours" v-if="tomorrow.length == 0">
                        <span class="material-symbols-outlined mdls">upcoming</span>
                        <h2>Pas de cours enregistrés pour cette journée</h2>
                        <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>
                    </div>
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
    .swiper-slide {
        /* min-height: 70vh; */
    }

    .NoCours {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 20px 50px;
    }

    .NoCours * {
        margin: 0;
        padding: 0;
        text-align: center;
    }

    .NoCours .mdls {
        font-size: 36px;
        margin-bottom: 14px;
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 36;
    }

    .NoCours h2 {
        font-size: 24px;
        line-height: 24px;
        font-weight: 600;
    }

    .NoCours p {
        font-size: 16px;
        line-height: 16px;
        font-weight: 400;
        margin-top: 10px;
        opacity: 50%;
    }
</style>
