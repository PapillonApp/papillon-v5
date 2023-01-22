<script>
    import { defineComponent } from 'vue';
    import { IonItem, IonLabel, IonList, IonAvatar, IonIcon, IonNavLink, IonListHeader, IonModal, IonButton, IonChip } from '@ionic/vue';
    
    import { logoDiscord, logoGithub, bugOutline, bugSharp, informationCircleOutline, informationCircleSharp, globeOutline, globeSharp } from 'ionicons/icons';

    import {version} from '/package'
    import { Capacitor } from '@capacitor/core';

    import { Swiper, SwiperSlide } from 'swiper/vue';
    import 'swiper/css';

    import SchoolSelection from './pronote/SchoolSelection.vue';

    export default defineComponent({
        name: 'FolderPage',
        components: {
            IonItem,
            IonLabel,
            IonList,
            IonAvatar,
            IonIcon,
            IonNavLink,
            IonListHeader,
            IonModal,
            Swiper,
            SwiperSlide,
            IonButton,
            IonChip
        },
        setup() {
            return { 
                logoDiscord,
                logoGithub,
                bugOutline,
                bugSharp,
                informationCircleOutline,
                informationCircleSharp,
                globeOutline,
                globeSharp,
            }
        },
        methods: {
            login() {
                const API = this.$api;
                let loginData = JSON.parse(localStorage.loginData);

                let username = loginData.username;
                let password = loginData.password;
                let url = loginData.url;
                let cas = loginData.cas;

                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                        
                var urlencoded = new URLSearchParams();
                urlencoded.append("url", url);
                urlencoded.append("ent", cas);
                urlencoded.append("username", username);
                urlencoded.append("password", password);

                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: urlencoded,
                    redirect: 'follow'
                };

                fetch(API + "/generatetoken", requestOptions)
                    .then(response => response.json())
                    .then(result => {
                    if(result !== "notfound" && result !== "expired") {
                        localStorage.token = result.token;
                        localStorage.loggedIn = true;

                        // go to home page
                        location.href = "/";
                    }
                    else {
                        localStorage.loggedIn = false;
                        localStorage.loginData = [];

                        // go to login page
                        location.href = "/login";
                    }
                    });
            },
            setOpen(isOpen) {
                setTimeout(() => {
                    this.isOpen = isOpen;
                }, 200);
            },
            nextSlide() {
                setTimeout(() => {
                    this.$refs.swiper.$el.swiper.slideNext();
                }, 200);
            },
            getServerStatus() {
                const API = this.$api;

                fetch(API + "/infos")
                    .then(response => response.json())
                    .then(result => {
                        this.status = result.status;
                    })
                    .catch(error => {
                        this.status = "error";
                    });
            },
        },
        data() {
            return {
                SchoolSelection: SchoolSelection,
                appVersion: version,
                appPlatform: Capacitor.getPlatform(),
                isOpen: true,
                status: "",
            }
        },
        mounted() {
            if(localStorage.loginData !== undefined && localStorage.loginData !== []) {
                // this.login();
            }

            this.getServerStatus();

            if(localStorage.seenWelcome === "true") {
                this.isOpen = false;
            }

            // add seen to localstorage
            localStorage.seenWelcome = true;
            
        }
    });
</script>

<template>
      <ion-header>
        <ion-toolbar>
          <ion-title>Bienvenue sur Papillon 👋</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-content :fullscreen="true">
        <ion-list>
            <ion-list-header>
                <ion-label>
                    Sélectionnez un service scolaire
                </ion-label>
            </ion-list-header>

            <ion-nav-link router-direction="forward" :component="SchoolSelection">
                <ion-item detail="true" button>
                    <ion-avatar slot="start">
                        <img alt="Logo" src="/assets/welcome/pronote_logo.png" />
                    </ion-avatar>
                    <ion-label>
                        <h2>Pronote</h2>
                        <p>Utilisez Pronote et votre ENT pour vous connecter</p>
                    </ion-label>
                </ion-item>
            </ion-nav-link>

            <ion-item button detail="true" disabled>
                <ion-avatar slot="start">
                    <img alt="Logo" src="/assets/welcome/ecoledirecte_logo.png" />
                </ion-avatar>
                <ion-label>
                    <h2>EcoleDirecte</h2>
                    <p>Utilisez vos identifiants EcoleDirecte pour vous connecter</p>
                </ion-label>
            </ion-item>

            <ion-item button detail="true" disabled>
                <ion-avatar slot="start">
                    <img alt="Logo" src="/assets/welcome/apschool_logo.png" />
                </ion-avatar>
                <ion-label>
                    <h2>APSchool</h2>
                    <p>Utilisez vos identifiants APSchool pour vous connecter</p>
                </ion-label>
            </ion-item>
        </ion-list>

        <ion-list>
            <ion-list-header>
                <ion-label>
                    <p>Alternativement, vous pouvez aussi</p>
                </ion-label>
            </ion-list-header>

            <ion-item button href="https://discord.gg/DMx3TDyz2U">
                <ion-icon slot="start" :icon="logoDiscord"></ion-icon>
                <ion-label>
                    <h2>Rejoindre la communauté</h2>
                    <p>Discutez avec d'autres personnes intéressées par le projet</p>
                </ion-label>
            </ion-item>

            <ion-item button href="https://github.com/PapillonApp/Papillon">
                <ion-icon slot="start" :icon="logoGithub"></ion-icon>
                <ion-label>
                    <h2>Contribuer au projet Papillon</h2>
                    <p>Ajoutez de vos idées et de votre temps au projet</p>
                </ion-label>
            </ion-item>
        </ion-list>

        <ion-list>
            <ion-list-header>
                <ion-label>
                    <p>Plus d'options et d'informations</p>
                </ion-label>
            </ion-list-header>

            <ion-item button href="https://github.com/PapillonApp/Papillon/issues">
                <ion-icon class="icon" slot="start" :ios="bugOutline" :md="bugSharp"></ion-icon>
                <ion-label>
                    <h2>Signaler un bug ou une erreur</h2>
                    <p>Reportez votre problème sur GitHub</p>
                </ion-label>
            </ion-item>

            <ion-item>
                <ion-icon class="icon" slot="start" :ios="globeOutline" :md="globeSharp"></ion-icon>
                <ion-label>
                    <h2>Statut du serveur</h2>
                    <p v-if='status == ""'>Obtention du statut...</p>
                    <p v-if='status == "ok"'>Le serveur est en ligne.</p>
                    <p v-if='status == "error"'>Impossible de contacter le serveur</p>
                </ion-label>

                <ion-chip color="success" v-if='status == "ok"'>En ligne</ion-chip>
                <ion-chip color="warning" v-if='status == "error"'>Indisponible</ion-chip>
            </ion-item>

            <ion-item button href="https://getpapillon.xyz/privacy.pdf">
                <ion-icon class="icon" slot="start" :ios="informationCircleOutline" :md="informationCircleSharp"></ion-icon>
                <ion-label>
                    <h2>Mentions légales</h2>
                    <p>(C) 2023 logi12 - version {{appVersion}}-{{appPlatform}}</p>
                </ion-label>
            </ion-item>
        </ion-list>

        <ion-modal :is-open="isOpen" :initial-breakpoint="0.65" :breakpoints="[0, 0.65]">
            <ion-content>
                <swiper class="welcomeSwiper" ref="swiper">
                    <swiper-slide class="welcomeSlide">
                        <img src="/assets/new/welcome.png" class="illustration"/>
                        <div class="description">
                            <h1>Bienvenue sur Papillon 👋</h1>
                            <p>
                                Papillon vous permet de consulter vos notes, devoirs, emploi du temps, et bien plus encore.
                            </p>
                            <small>
                                Tout ce dont vous avez besoin est un compte Pronote ou EcoleDirecte (prochainement).
                            </small>
                        </div>

                        <IonButton expand="block" mode="md" class="btn continueButton" @click="setOpen(false)">Commencer</IonButton>

                        <p class="version">version {{appVersion}}-{{appPlatform}}</p>
                    </swiper-slide>
                </swiper>
            </ion-content>
        </ion-modal>
      </ion-content>
</template>
  
<style scoped>
    .ios .icon {
        opacity: 50%;
    }

    .welcomeSwiper {
        height: 100%;
    }

    .welcomeSlide {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }

    .welcomeSlide * {
        text-align: center;
        margin: 0;
    }

    .welcomeSlide .illustration {
        width: 100%;
        max-height: 25%;
        object-fit: contain;
        margin-top: 20px;
    }

    .welcomeSlide .description {
        margin-top: 15px;
        width: 100%;
        padding: 0 24px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
    }

    .welcomeSlide .description h1 {
        font-size: 27.5px;
        line-height: 28px;
        font-weight: 600 !important;
        font-family: var(--papillon-font);
        color: var(--ion-color-primary);
        margin-bottom: 10px;
        text-align: left;
    }

    .welcomeSlide .description p {
        font-size: 17px;
        line-height: 20px;
        font-weight: 400 !important;
        text-align: left;
        margin-bottom: 10px;
    }

    .welcomeSlide .description small {
        font-size: 15px;
        line-height: 16px;
        font-weight: 400 !important;
        color: var(--ion-color-medium);
        text-align: left;
        margin-bottom: 10px;
    }

    .welcomeSlide .btn {
        width: calc(100% - 24px * 2);
        margin-top: 10px;
    }

    .welcomeSlide .continueButton {
        margin-top: 20px;
    }

    .welcomeSlide .version {
        text-align: center;
        font-size: 13px;
        line-height: 12px;
        font-weight: 400 !important;
        color: var(--ion-color-medium);
        margin-top: 2vh;
        opacity: 0.5;
    }

    ion-avatar {
        --border-radius: 0;
        height: 42px;
        width: 42px;
    }
</style>
