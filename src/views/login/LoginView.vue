<script>
    import { defineComponent } from 'vue';
    import { IonItem, IonLabel, IonList, IonAvatar, IonIcon, IonNavLink, IonListHeader, IonModal, IonButton } from '@ionic/vue';
    
    import { logoDiscord, logoGithub, bugOutline, bugSharp, informationCircleOutline, informationCircleSharp } from 'ionicons/icons';

    import {version} from '/package'
    import { Capacitor } from '@capacitor/core';

    import { Swiper, SwiperSlide } from 'swiper/vue';
    import 'swiper/css';

    import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';

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
            IonButton
        },
        setup() {
            return { 
                logoDiscord,
                logoGithub,
                bugOutline,
                bugSharp,
                informationCircleOutline,
                informationCircleSharp
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
        },
        data() {
            return {
                SchoolSelection: SchoolSelection,
                appVersion: version,
                appPlatform: Capacitor.getPlatform(),
                isOpen: true
            }
        },
        mounted() {
            if(localStorage.loginData !== undefined && localStorage.loginData !== []) {
                // this.login();
            }
        }
    });
</script>

<template>
      <ion-header>
        <ion-toolbar>
          <ion-title>Bienvenue dans Papillon</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-content :fullscreen="true">
        <ion-header collapse="condense">
            <ion-toolbar>
              <ion-title size="large">Bienvenue dans Papillon</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-list>
            <ion-list-header>
                <ion-label>
                    <p>Sélectionnez un service scolaire pour commencer</p>
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
                    <p>Plus d'options</p>
                </ion-label>
            </ion-list-header>

            <ion-item button href="https://github.com/PapillonApp/Papillon/issues">
                <ion-icon class="icon" slot="start" :ios="bugOutline" :md="bugSharp"></ion-icon>
                <ion-label>
                    <h2>Signaler un bug ou une erreur</h2>
                    <p>Reportez votre problème sur GitHub</p>
                </ion-label>
            </ion-item>

            <ion-item button href="https://pronote.plus/assets/terms_privacy_23112022_rev0.pdf">
                <ion-icon class="icon" slot="start" :ios="informationCircleOutline" :md="informationCircleSharp"></ion-icon>
                <ion-label>
                    <h2>Mentions légales</h2>
                    <p>(C) 2022 PapillonApp - version {{appVersion}}-{{appPlatform}}</p>
                </ion-label>
            </ion-item>
        </ion-list>

        <ion-modal :is-open="isOpen">
            <ion-content>
                <swiper class="welcomeSwiper" ref="swiper">
                    <swiper-slide class="welcomeSlide">
                        <div class="illustration services"></div>
                        <h3>Papillon vous permet de vous connecter facilement à votre service scolaire favori.</h3>
                        <p>Avec Papillon, profitez de vos cours et de vos données scolaires dans une interface améliorée. Le support d'EcoleDirecte est prévu ultérieurement.</p>

                        <ion-button expand="block" fill="clear" @click="nextSlide()" class="slideButton">
                            Continuer
                        </ion-button>
                    </swiper-slide>
                    <swiper-slide class="welcomeSlide">
                        <div class="illustration interface"></div>
                        <h3>L'interface à été revue et continuellement améliorée pour une expérience optimale.</h3>
                        <p>Papillon s'adapte à vos besoins et à vos envies grâce à une interface famillière et agréable, pour un climat de travail confortable.</p>

                        <ion-button expand="block" fill="clear" @click="nextSlide()" class="slideButton">
                            Continuer
                        </ion-button>
                    </swiper-slide>
                    <swiper-slide class="welcomeSlide">
                        <div class="illustration data"></div>
                        <h3>Avec Papillon, vous êtes le maître de vos données.</h3>
                        <p>Vos données ne sont pas conservées et sont éffacées aussitôt renvoyées par nos serveurs. Papillon est open-source et développé par la communauté.</p>

                        <ion-button expand="block" fill="solid" @click="setOpen(false)" class="slideButton">
                            Commencer
                        </ion-button>
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

    .illustration {
        width: 100vw;
        height: 100vw;
        
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;

        margin-top: 0vh;
    }

    .welcomeSlide h3 {
        font-size: 1.5em;
        font-weight: 500;
        margin: 0.5em 1.5em;
    }

    .welcomeSlide p {
        font-size: 1em;
        font-weight: 400;
        margin: 0 1.5em;
        opacity: 50%;
    }

    .slideButton {
        margin-top: 20px;
        width: 50%;
    }

    .services {
        background-image: url('assets/services_dark.png');
    }
    
    @media screen and (prefers-color-scheme: light) {
        .services {
            background-image: url('assets/services_light.png');
        }
    }

    .interface {
        background-image: url('assets/interface_dark.png');
    }

    @media screen and (prefers-color-scheme: light) {
        .interface {
            background-image: url('assets/interface_light.png');
        }
    }

    .data {
        background-image: url('assets/data_dark.png');
    }

    @media screen and (prefers-color-scheme: light) {
        .data {
            background-image: url('assets/data_light.png');
        }
    }
</style>
