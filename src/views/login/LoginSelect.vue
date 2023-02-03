<script>
    import { defineComponent } from 'vue';
    import { IonItem, IonLabel, IonList, IonAvatar, IonNavLink, IonListHeader, IonBackButton } from '@ionic/vue';
    
    import { logoDiscord, logoGithub, bugOutline, bugSharp, informationCircleOutline, informationCircleSharp, globeOutline, globeSharp } from 'ionicons/icons';

    import { version } from '/package'
    import { Capacitor } from '@capacitor/core';

    import SchoolSelection from './pronote/SchoolSelection.vue';

    export default defineComponent({
        name: 'FolderPage',
        components: {
            IonItem,
            IonLabel,
            IonList,
            IonAvatar,
            IonNavLink,
            IonListHeader,
            IonBackButton
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
        },
        data() {
            return {
                SchoolSelection: SchoolSelection,
                appVersion: version,
                appPlatform: Capacitor.getPlatform(),
            }
        },
        mounted() {
            return;
        }
    });
</script>

<template>
      <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button class="only-ios" text="Retour"></ion-back-button>
                <ion-back-button class="only-md"></ion-back-button>
            </ion-buttons>
            <ion-title>Séléctionnez votre service scolaire</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-content :fullscreen="true">
        <ion-list>
            <ion-list-header>
                <ion-label>
                    <p>Services disponibles</p>
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
      </ion-content>
</template>
  
<style scoped>
    .ios .icon {
        opacity: 50%;
    }
</style>
