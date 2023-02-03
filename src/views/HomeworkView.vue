<script>
import { defineComponent } from 'vue';
import { IonButtons, IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonModal, IonDatetime, IonRefresher, IonRefresherContent, IonSpinner, IonChip, IonCheckbox } from '@ionic/vue';

import { calendarOutline, calendarSharp, todayOutline, todaySharp, alertCircle, checkmark } from 'ionicons/icons';

import displayToast from '@/functions/utils/displayToast.js';
import hapticsController from '@/functions/utils/hapticsController.js';

import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

import GetHomeworks from "@/functions/fetch/GetHomeworks.js";
import GetToken from "@/functions/login/GetToken.js";

import { Browser } from '@capacitor/browser';
import { Network } from '@capacitor/network';

import axios from 'axios';

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
        IonSpinner,
        IonChip,
        IonCheckbox
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
        openRnModal() {
            this.$refs.rnPickerModal.$el.present();
        },
        editHomeworks(homeworks) {
            // set homeworks to edit
            return homeworks;
        },
        async getHomeworks(force) {
            if(this.shouldResetSwiper) {
                this.$refs.swiper.$el.swiper.slideTo(1, 0);
                this.shouldResetSwiper = false;

                this.homeworks = [];
                this.yesterday = [];
                this.tomorrow = [];

                this.homeworks.loading = true;
                this.yesterday.loading = true;
                this.tomorrow.loading = true;

                this.homeworks.error = "STILL_LOADING";
                this.yesterday.error = "STILL_LOADING";
                this.tomorrow.error = "STILL_LOADING";
            }

            // get homeworks for rn
            GetHomeworks(this.$rn, this.$rn, force).then((homeworks) => {
                if (homeworks.error) {
                    this.homeworks = [];
                    this.homeworks.error = homeworks.error;
                } else {

                    this.homeworks = homeworks;

                    this.loadedrnButtonString = this.createDateString(this.$rn);
                    this.homeworks.loading = false;

                    this.dontRetryCheck = true;

                    setTimeout(() => {
                        this.dontRetryCheck = false;
                    }, 200);
                }
            });

            // get homeworks for yesterday
            let yesterdayRN = new Date(this.$rn) - 86400000;
            GetHomeworks(yesterdayRN, yesterdayRN, force).then((homeworks) => {
                this.yesterday = homeworks;
                this.yesterday.loading = false;
            });

            // get homeworks for tomorrow
            let tomorrowRN = new Date(this.$rn);
            tomorrowRN.setDate(tomorrowRN.getDate() + 1);
            GetHomeworks(tomorrowRN, tomorrowRN, force).then((homeworks) => {
                this.tomorrow = homeworks;
                this.tomorrow.loading = false;
            });

            
            this.connected = await Network.getStatus()
            this.connected = this.connected.connected;
        },
        handleRefresh(event) {
            // get new homeworks data
            this.getHomeworks(true);

            // stop refresh when this.homeworks is updated
            this.$watch('homeworks', () => {
                setTimeout(() => {
                    event.target.complete();
                }, 200);
            });
        },
        openHomework(hw) {
            this.openedHw = hw;
            this.$refs.hwModal.$el.present();
        },
        closeHomework() {
            this.$refs.hwModal.$el.dismiss();
        },
        async openLink(url) {
            await Browser.open({
                url: url
            });
        },
        changernPickerModalOpen(state) {
            this.rnPickerModalOpen = state;
        },
        changeDone(hw) {
            // microinteractions
            hapticsController.notification('success');

            // send request
            if(!this.dontRetryCheck) {
                let homeworkID = hw.data.id;

                const API = this.$api;
                let token = localStorage.getItem('token');

                let dayRequest = new Date(this.$rn);
                let dayString = dayRequest.toISOString().split('T')[0];

                let URL = `${API}/homework/changeState`;

                // post request with token, homeworkId, dateFrom and dateTo
                axios.post(URL, {
                    token: token,
                    homeworkId: homeworkID,
                    dateFrom: dayString,
                    dateTo: dayString
                }).then(() => {
                    let checkboxID = `checkbox_${hw.data.id}`;
                    let checkbox = document.getElementById(checkboxID);

                    if(checkbox.checked) {
                        displayToast.presentToastFull(
                            "Devoir marqué comme fait",
                            `Votre devoir de ${hw.homework.subject} a été marqué comme fait.`,
                            "success",
                            checkmark
                        )
                    }
                    else {
                        displayToast.presentToastFull(
                            "Devoir marqué comme non fait",
                            `Votre devoir de ${hw.homework.subject} a été marqué comme non fait.`,
                            "success",
                            checkmark
                        )
                    }

                    // reset homework cache
                    localStorage.removeItem('HomeworkCache');

                    // reload homeworks
                    this.getHomeworks();
                })
                .catch((error) => {
                    let response = error.response.data;

                    // untick checkbox
                    let checkboxID = `checkbox_${hw.data.id}`;
                    let checkbox = document.getElementById(checkboxID);

                    setTimeout(() => {
                        this.dontRetryCheck = true;
                        checkbox.checked = !checkbox.checked;

                        setTimeout(() => {
                            this.dontRetryCheck = false;
                        }, 100);
                    }, 200);

                    if(response == "expired" || response == "notfound") {
                        displayToast.presentToastFull(
                            "Impossible de marquer ce devoir comme fait",
                            "Le token à expiré",
                            "danger",
                            alertCircle,
                        )

                        GetToken();
                    }
                    else if(response.status == "not found") {
                        displayToast.presentToastFull(
                            "Impossible de marquer ce devoir comme fait",
                            "Nous n'avons pas pu trouver ce devoir sur nos serveurs.",
                            "danger",
                            alertCircle,
                            true,
                            response.error
                        )
                    }
                    else if(response.status == "error") {
                        displayToast.presentToastFull(
                            "Impossible de marquer ce devoir comme fait",
                            "Une erreur est survenue lors de la requête.",
                            "danger",
                            alertCircle,
                            true,
                            response.error
                        )
                    }
                    else {
                        displayToast.presentToastFull(
                            "Impossible de marquer ce devoir comme fait",
                            "Erreur inconnue",
                            "danger",
                            alertCircle,
                            true,
                            error
                        )
                    }
                });
            }
        }
    },
    data() {
        return {
            connected: false,
            rnButtonString: this.createDateString(this.$rn),
            loadedrnButtonString: this.createDateString(this.$rn),
            rnCalendarString: this.$rn.toISOString().split('T')[0],
            homeworks: [],
            yesterday: [],
            tomorrow: [],
            shouldResetSwiper: false,
            openedHw: [],
            dontRetryCheck: false,
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

        // get homeworks data
        this.getHomeworks();

        // on rnChanged, get new homeworks data
        document.addEventListener('rnChanged', () => {
            this.getHomeworks();
        });

        // on token changed, get new homeworks data
        document.addEventListener('tokenUpdated', () => {
            this.getHomeworks();
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
        <IonHeader class="AppHeader" collapse="fade" translucent>
            <IonToolbar>

                <ion-buttons slot="start">
                    <ion-menu-button color="dark" mode="md"></ion-menu-button>
                </ion-buttons>

                <ion-title mode="md">Travail à faire</ion-title>

                <ion-buttons slot="end">
                    <ion-button mode="md" color="dark" id="rnPickerModalButton" @click="changernPickerModalOpen(true)">
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

            <div id="noTouchZone"></div>

            <swiper :initialSlide="1" ref="swiper">
                <swiper-slide class="swiper-slide">
                    <ion-list>
                        <ion-item v-for="homework in yesterday" :key="homework.id" button>
                            <div slot="start">
                                <ion-checkbox :id="`checkbox_${homework.data.id}`" :checked="homework.data.done" @ionChange="changeDone(homework)"></ion-checkbox>
                            </div>
                            <ion-label :style="`--courseColor: ${homework.data.color};`">
                                <div @click="openHomework(homework)">
                                    <p><span class="courseColor"></span>  {{ homework.homework.subject }}</p>
                                    <h2>{{ homework.homework.content }}</h2>
                                </div>

                                <div class="innerChips" v-if="homework.files.length !== 0">
                                    <ion-chip v-for="(attachment, i) in homework.files" :key="i" color="dark" :outline="true" @click="openLink(attachment.url)">
                                        <span v-if="attachment.type == 1" class="material-symbols-outlined mdls">description</span>

                                        <span v-if="attachment.type == 0" class="material-symbols-outlined mdls">link</span>

                                        <p>{{attachment.name}}</p>
                                    </ion-chip>
                                </div>
                            </ion-label>
                        </ion-item>

                        <div v-if="yesterday.loading" class="Error"><div class="NoCours" v-if="yesterday.length == 0">
                            <IonSpinner></IonSpinner>
                            <br/>
                            <h2>Téléchargement des prochains devoirs...</h2>
                            <p>Veuillez patienter pendant qu'on récupère vos devoirs depuis nos serveurs...</p>
                        </div></div>

                        <div v-if="!yesterday.loading"><div class="NoCours" v-if="yesterday.length == 0">
                            <span class="material-symbols-outlined mdls">auto_stories</span>
                            <h2>Pas de devoirs à faire pour cette journée</h2>
                            <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>

                            <ion-button fill="clear" @click="changernPickerModalOpen(true)" class="changeDayButton">Ouvrir le calendrier</ion-button>
                        </div></div>
                    </ion-list>
                </swiper-slide>
                <swiper-slide>
                    <ion-list>
                        <ion-item v-for="homework in homeworks" :key="homework.id" button>
                            <div slot="start">
                                <ion-checkbox :id="`checkbox_${homework.data.id}`" :checked="homework.data.done" @ionChange="changeDone(homework)"></ion-checkbox>
                            </div>
                            <ion-label :style="`--courseColor: ${homework.data.color};`">
                                <div @click="openHomework(homework)">
                                    <p><span class="courseColor"></span>  {{ homework.homework.subject }}</p>
                                    <h2>{{ homework.homework.content }}</h2>
                                </div>

                                <div class="innerChips" v-if="homework.files.length !== 0">
                                    <ion-chip v-for="(attachment, i) in homework.files" :key="i" color="dark" :outline="true" @click="openLink(attachment.url)">
                                        <span v-if="attachment.type == 1" class="material-symbols-outlined mdls">description</span>

                                        <span v-if="attachment.type == 0" class="material-symbols-outlined mdls">link</span>

                                        <p>{{attachment.name}}</p>
                                    </ion-chip>
                                </div>
                            </ion-label>
                        </ion-item>

                        <div v-if="homeworks.loading && !homeworks.error" class="Error">
                            <div class="NoCours" v-if="homeworks.length == 0">
                                <IonSpinner></IonSpinner>
                                <br/>
                                <h2>Téléchargement des prochains devoirs...</h2>
                                <p>Veuillez patienter pendant qu'on récupère vos devoirs depuis nos serveurs...</p>
                            </div>
                        </div>

                        <div class="NoCours" v-if="homeworks.error == 'ERR_NETWORK' && homeworks.length == 0 && !connected">
                            <span class="material-symbols-outlined mdls">wifi_off</span>
							<h2>Aucune connexion internet</h2>
							<p>Les devoirs ne peuvent pas être chargés sans connection internet, réessayer plus tard...</p>
                        </div>

                        <div class="NoCours" v-if="homeworks.error == 'ERR_NETWORK' && homeworks.length == 0 && connected">
                            <span class="material-symbols-outlined mdls">crisis_alert</span>
							<h2>Serveurs indisponibles</h2>
							<p>Les devoirs ne peuvent pas être chargés, nos serveurs seront bientôt de nouveaux disponibles...</p>
                        </div>

                        <div class="NoCours" v-if="!homeworks.loading && !homeworks.error && homeworks.length == 0">
                            <span class="material-symbols-outlined mdls">auto_stories</span>
                            <h2>Pas de devoirs à faire pour cette journée</h2>
                            <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>
                            <ion-button fill="clear" @click="changernPickerModalOpen(true)" class="changeDayButton">Ouvrir le calendrier</ion-button>
                        </div>
                    </ion-list>
                </swiper-slide>
                <swiper-slide>
                    <ion-list>
                        <ion-item v-for="homework in tomorrow" :key="homework.id" button>
                            <div slot="start">
                                <ion-checkbox :id="`checkbox_${homework.data.id}`" :checked="homework.data.done" @ionChange="changeDone(homework)"></ion-checkbox>
                            </div>
                            <ion-label :style="`--courseColor: ${homework.data.color};`">
                                <div @click="openHomework(homework)">
                                    <p><span class="courseColor"></span>  {{ homework.homework.subject }}</p>
                                    <h2>{{ homework.homework.content }}</h2>
                                </div>

                                <div class="innerChips" v-if="homework.files.length !== 0">
                                    <ion-chip v-for="(attachment, i) in homework.files" :key="i" color="dark" :outline="true" @click="openLink(attachment.url)">
                                        <span v-if="attachment.type == 1" class="material-symbols-outlined mdls">description</span>

                                        <span v-if="attachment.type == 0" class="material-symbols-outlined mdls">link</span>

                                        <p>{{attachment.name}}</p>
                                    </ion-chip>
                                </div>
                            </ion-label>
                        </ion-item>

                        <div v-if="tomorrow.loading" class="Error"><div class="NoCours" v-if="tomorrow.length == 0">
                            <IonSpinner></IonSpinner>
                            <br/>
                            <h2>Téléchargement des prochains devoirs...</h2>
                            <p>Veuillez patienter pendant qu'on récupère vos devoirs depuis nos serveurs...</p>
                        </div></div>

                        <div v-if="!tomorrow.loading"><div class="NoCours" v-if="tomorrow.length == 0">
                            <span class="material-symbols-outlined mdls">auto_stories</span>
                            <h2>Pas de devoirs à faire pour cette journée</h2>
                            <p>Réesayez un autre jour dans le calendrier ou balayez l'écran.</p>

                            <ion-button fill="clear" @click="changernPickerModalOpen(true)" class="changeDayButton">Ouvrir le calendrier</ion-button>
                        </div></div>
                    </ion-list>
                </swiper-slide>
            </swiper>

            <IonModal ref="rnPickerModal" @didDismiss="changernPickerModalOpen(false)" :is-open="rnPickerModalOpen" class="datetimeModal" :keep-contents-mounted="true" :initial-breakpoint="0.55" :breakpoints="[0, 0.55, 1]">
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

            <IonModal :presenting-element="presentingElement" :canDismiss="true" ref="hwModal">
                <IonHeader translucent>
                    <IonToolbar>
                        <IonTitle>Travail en {{ openedHw.homework.subject }}</IonTitle>
                        <IonButtons slot="end">
                            <IonButton @click="closeHomework()">Fermer</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent class="ionPadding hwModalContent">
                    <div class="contentText">
                        {{ openedHw.homework.content }}
                    </div>

                    <div class="chips" v-if="openedHw.files.length !== 0">
                        <ion-chip v-for="(attachment, i) in openedHw.files" :key="i" @click="openLink(attachment.url)" color="dark" :outline="true">
                            <span v-if="attachment.type == 1" class="material-symbols-outlined mdls">description</span>

                            <span v-if="attachment.type == 0" class="material-symbols-outlined mdls">link</span>

                            <p>{{attachment.name}}</p>
                        </ion-chip>
                    </div>
                </IonContent>
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

    .contentText {
        padding: 15px;
    }

    .hwModalContent .chips {
        margin-left: 10px !important;

        display: flex;
        flex-wrap: wrap;
    }

    ion-chip {
        margin-right: 5px;
        margin-bottom: 5px;
    }

    ion-chip span {
        opacity: 50%;
        margin-right: 8px;
    }

    ion-chip p {
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    #noTouchZone {
        width: 20px;
    }

    .innerChips {
        overflow-y: scroll;
    }

    .innerChips ion-chip p {
        max-width: 50px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .courseColor {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--courseColor);
        display: inline-block;
        margin-right: 5px;
    }
</style>
