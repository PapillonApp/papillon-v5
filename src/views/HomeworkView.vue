<script>
import { defineComponent } from 'vue';
import { IonButtons, IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonList, IonModal, IonItem, IonDatetime, IonRefresher, IonRefresherContent, IonLabel } from '@ionic/vue';

import { calendarOutline, calendarSharp, todayOutline, todaySharp } from 'ionicons/icons';

import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

import GetHomeworks from "@/functions/fetch/GetHomeworks.js";

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
        IonModal,
        IonDatetime,
        Swiper,
        SwiperSlide,
        IonRefresher,
        IonRefresherContent,
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
        openRnModal() {
            this.$refs.rnPickerModal.$el.present();
        },
        editTimetable(timetable) {
            // set timetable to edit
            return timetable;
        },
        getTimetables() {
            // get timetable for rn
            GetHomeworks(this.$rn).then((homeworks) => {
                this.timetable = homeworks;
                this.loadedrnButtonString = this.createDateString(this.$rn);

                if(this.shouldResetSwiper) {
                    this.$refs.swiper.$el.swiper.slideTo(1, 0);
                    this.shouldResetSwiper = false;
                }
            });

            // get timetable for yesterday
            let yesterdayRN = new Date(this.$rn) - 86400000;
            GetHomeworks(yesterdayRN).then((homeworks) => {
                this.yesterday = homeworks;
            });

            // get timetable for tomorrow
            let tomorrowRN = new Date(this.$rn);
            tomorrowRN.setDate(tomorrowRN.getDate() + 1);
            GetHomeworks(tomorrowRN).then((homeworks) => {
                this.tomorrow = homeworks;
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

                <ion-title mode="md">Travail à faire</ion-title>

                <ion-buttons slot="end">
                    <ion-button mode="md" color="dark" id="rnPickerModalButton" @click="openRnModal">
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
                    <ion-title size="large">Travail à faire</ion-title>
                </IonToolbar>
            </IonHeader>

            <div id="noTouchZone"></div>

            <swiper :initialSlide="1" ref="swiper">
                <swiper-slide class="swiper-slide">
                    <ion-list>
                        <ion-item v-for="homework in yesterday" :key="homework.id">
                            <ion-label class="ion-text-wrap">
                                <p>{{ homework.homework.subject }}</p>
                                <h2>{{ homework.homework.content }}</h2>
                            </ion-label>
                        </ion-item>

                        <div class="NoCours" v-if="yesterday.length == 0">
                            <span class="material-symbols-outlined mdls">auto_stories</span>
                            <h2>Pas de devoirs à faire pour cette journée</h2>
                            <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>

                            <ion-button fill="clear" @click="openRnModal" class="changeDayButton">Ouvrir le calendrier</ion-button>
                        </div>
                    </ion-list>
                </swiper-slide>
                <swiper-slide>
                    <ion-list>
                        <ion-item v-for="homework in timetable" :key="homework.id">
                            <ion-label class="ion-text-wrap">
                                <p>{{ homework.homework.subject }}</p>
                                <h2>{{ homework.homework.content }}</h2>
                            </ion-label>
                        </ion-item>

                        <div class="NoCours" v-if="timetable.length == 0">
                            <span class="material-symbols-outlined mdls">auto_stories</span>
                            <h2>Pas de devoirs à faire pour cette journée</h2>
                            <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>

                            <ion-button fill="clear" @click="openRnModal" class="changeDayButton">Ouvrir le calendrier</ion-button>
                        </div>
                    </ion-list>
                </swiper-slide>
                <swiper-slide>
                    <ion-list>
                        <ion-item v-for="homework in tomorrow" :key="homework.id">
                            <ion-label class="ion-text-wrap">
                                <p>{{ homework.homework.subject }}</p>
                                <h2>{{ homework.homework.content }}</h2>
                            </ion-label>
                        </ion-item>

                        <div class="NoCours" v-if="tomorrow.length == 0">
                            <span class="material-symbols-outlined mdls">auto_stories</span>
                            <h2>Pas de devoirs à faire pour cette journée</h2>
                            <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>

                            <ion-button fill="clear" @click="openRnModal" class="changeDayButton">Ouvrir le calendrier</ion-button>
                        </div>
                    </ion-list>
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
