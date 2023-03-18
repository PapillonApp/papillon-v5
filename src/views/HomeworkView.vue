<script>
import { defineComponent } from 'vue';
import { IonButtons, IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonModal, IonDatetime, IonRefresher, IonRefresherContent, IonSpinner, IonChip, IonCheckbox, IonRippleEffect } from '@ionic/vue';

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
        IonCheckbox,
        IonRippleEffect
    },
    props() {
        return {
            hw : {
                type: String,
                required: false
            }
        }
    },
    setup() {
        return {            
            minDate: require('@/functions/utils/datetimePicker.js').minCalendarDate(),
            maxDate: require('@/functions/utils/datetimePicker.js').maxCalendarDate(),
            isDateAvailable: require('@/functions/utils/datetimePicker.js').isDateAvailable,
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
            // for each homework
            for (let i = 0; i < homeworks.length; i++) {
                // set homework to edit
                let homework = homeworks[i];

                // remove <br/> tags from homework.homework.content
                homeworks[i].homework.shortContent = homework.homework.shortContent.replace(/[<]br[^>]*[>]/gi,"");
            }

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

                    this.homeworks = this.editHomeworks(homeworks);

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
                this.yesterday = this.editHomeworks(homeworks);
                this.yesterday.loading = false;
            });

            // get homeworks for tomorrow
            let tomorrowRN = new Date(this.$rn);
            tomorrowRN.setDate(tomorrowRN.getDate() + 1);
            GetHomeworks(tomorrowRN, tomorrowRN, force).then((homeworks) => {
                this.tomorrow = this.editHomeworks(homeworks);
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
                if(this.homeworks.error != "STILL_LOADING" && this.homeworks.error != "ERR_BAD_REQUEST") {
                    setTimeout(() => {
                        event.target.complete();
                    }, 200);
                }
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
                url: url,
				toolbarColor: '#1e1e1e',
				presentationStyle: 'popover',
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
            days: ['yesterday', 'homeworks', 'tomorrow'],
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

        // force token update if connected to internet
        if(this.connected) {
            this.getHomeworks(true);
        }

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

        // if hw prop is set
        if(this.$route.params.hw) {
            let encoded = this.$route.params.hw;

            // decode url
            let decoded = decodeURIComponent(encoded);

            // parse json
            let parsed = JSON.parse(decoded);

            // open hw
            setTimeout(() => {
                this.openHomework(parsed);
            }, 200);
        }
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

            <swiper :initialSlide="1" ref="swiper" :speed="300" :spaceBetween="10" :preventClicks="true" :effect="'fade'">
                <swiper-slide v-for="(day, i) in days" :key="i">
                    <IonList class="hwList">
                        <div class="homeworkElement" v-for="homework in $data[`${day}`]" :key="homework.id">
                            <ion-ripple-effect></ion-ripple-effect>
                            <div class="hwCheckbox">
                                <ion-checkbox :id="`checkbox_${homework.data.id}`" :checked="homework.data.done" @ionChange="changeDone(homework)"></ion-checkbox>
                            </div>
                            <div class="hwData" :style="`--courseColor: ${homework.data.color};`">
                                <div @click="openHomework(homework)">
                                    <p class="hwSubject"><span class="courseColor"></span>  {{ homework.homework.subject }}</p>
                                    <p class="hwContent">{{ homework.homework.shortContent }}</p>
                                </div>

                                <div class="innerChips" v-if="homework.files.length !== 0">
                                    <ion-chip v-for="(attachment, i) in homework.files" :key="i" color="dark" :outline="true" @click="openLink(attachment.url)">
                                        <span v-if="attachment.type == 1" class="material-symbols-outlined mdls">description</span>

                                        <span v-if="attachment.type == 0" class="material-symbols-outlined mdls">link</span>

                                        <p>{{attachment.name}}</p>
                                    </ion-chip>
                                </div>
                            </div>
                        </div>

                        <div class="NoCours" v-if="$data[`${day}`].error == 'ERR_NETWORK' && $data[`${day}`].length == 0 && !connected">
                            <span class="material-symbols-outlined mdls">wifi_off</span>
							<h2>Aucune connexion internet</h2>
							<p>Les devoirs ne peuvent pas être chargés sans connection internet, réessayer plus tard...</p>
                        </div>

                        <div class="NoCours" v-if="$data[`${day}`].error == 'ERR_NETWORK' && $data[`${day}`].length == 0 && connected">
                            <span class="material-symbols-outlined mdls">crisis_alert</span>
							<h2>Serveurs indisponibles</h2>
							<p>Les devoirs ne peuvent pas être chargés, nos serveurs seront bientôt de nouveaux disponibles...</p>
                        </div>

                        <div class="NoCours" v-if="!$data[`${day}`].loading && !$data[`${day}`].error && $data[`${day}`].length == 0">
                            <h1>🤟</h1>
                            <h2>Vous n'avez pas de devoirs pour cette journée</h2>
                            <p>Essayez de consulter un autre jour dans le calendrier ou balayez l'écran.</p>
                            <ion-button mode="md" fill="clear" @click="changernPickerModalOpen(true)" class="changeDayButton">Ouvrir le calendrier</ion-button>
                        </div>

                        <div v-if="$data[`${day}`].loading && !$data[`${day}`].error && $data[`${day}`].length == 0" class="NoCours">
                            <IonSpinner></IonSpinner>
                            <br/>
                            <h2>Téléchargement des prochains devoirs...</h2>
                            <p>Veuillez patienter pendant qu'on récupère vos devoirs depuis nos serveurs...</p>
                        </div>
                    </IonList>
                </swiper-slide>
            </swiper>

            <IonModal ref="rnPickerModal" @didDismiss="changernPickerModalOpen(false)" :is-open="rnPickerModalOpen" class="datetimeModal" :keep-contents-mounted="true" :initial-breakpoint="0.55" :breakpoints="[0, 0.55]">
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
                    <div class="contentText" v-html="openedHw.homework.content"></div>

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
        line-height: 20px !important;
    }

    .hwModalContent .chips {
        margin-left: 10px !important;

        display: flex;
        flex-wrap: wrap;
    }

    ion-chip {
        margin-right: 5px;
        margin-bottom: 5px;
        max-width: 80%;
    }

    ion-chip span {
        opacity: 50%;
        margin-right: 8px;
        min-width: 24px;
    }

    ion-chip p {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    #noTouchZone {
        width: 20px;
    }

    .hwData {
        width: calc(100% - 26px - 20px);
    }

    .innerChips {
        overflow-y: hidden;
        display: flex;

        width: 100%;
        gap: 10px;
    }

    .innerChips ion-chip p {
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

    .hwList {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 10px;
    }

    .homeworkElement {
        background: var(--ion-plain-background-color);
        margin: 0px 16px;
        box-shadow: var(--ion-box-shadow);
        border-radius: 8px;
        display: flex;
        padding: 15px 20px;
        gap: 20px;
    }

    .homeworkElement * {
        margin: 0;
    }

    .hwCheckbox {
        padding-top: 5px;
    }

    .hwSubject {
        font-weight: 500;
        font-family: var(--papillon-font);
        font-size: 18px;
        margin-bottom: 8px;
    }

    .hwSubject .courseColor {
        margin-right: 5px;
        transform: translateY(-1px);
    }

    .hwContent {
        font-size: 16px;
        word-break: break-word !important;
    }

    .innerChips {
        margin-top: 10px;
    }
</style>
