<script>
import {defineComponent} from 'vue';
import {IonItem, IonLabel, IonList, IonAvatar, IonNavLink, IonListHeader, IonBackButton} from '@ionic/vue';

import {
    logoDiscord,
    logoGithub,
    bugOutline,
    bugSharp,
    informationCircleOutline,
    informationCircleSharp,
    globeOutline,
    globeSharp
} from 'ionicons/icons';

import {version} from '/package'
import {Capacitor} from '@capacitor/core';

import SkolengoLoginForm from './LoginForm.vue'

import {StatusBar, Style} from '@capacitor/status-bar';
import {ApiName, ApiUrl, ApiVersion} from "kdecole-api";

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
    computed: {
        ApiName() {
            return ApiName
        },
        ApiVersion() {
            return ApiVersion
        },
        ApiUrl() {
            return ApiUrl
        }
    },
    methods: {
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
        goOldStatusBar() {
            if (Capacitor.getPlatform() === 'android') {
                StatusBar.setStyle({style: Style.Dark});
                StatusBar.setBackgroundColor({color: "#12D4A6"});
            }
        }
    },
    data() {
        return {
            SkolengoLoginForm: SkolengoLoginForm,
            appVersion: version,
            appPlatform: Capacitor.getPlatform(),
        }
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
            <ion-title>Séléctionnez votre instance Skolengo</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
        <ion-list>
            <ion-list-header>
                <ion-label>
                    <p>Instances Skolengo disponibles</p>
                </ion-label>
            </ion-list-header>
            <ion-nav-link v-for="ent in Object.keys(ApiUrl).filter(x => Object.keys(ApiVersion).includes(x))" :key="ent"
                          router-direction="forward" :component="SkolengoLoginForm" :componentProps="{ent}">
                <ion-item button detail="true">
                    <ion-avatar slot="start">
                        <img alt="Logo" :src="'/assets/welcome/skolengo/' + ent + '.png'"/>
                    </ion-avatar>
                    <ion-label>
                        <h2>{{ ApiName[ent] }}</h2>
                        <p>Utilisez vos identifiants {{ ApiName[ent] }} pour vous connecter</p>
                    </ion-label>
                </ion-item>
            </ion-nav-link>
        </ion-list>
    </ion-content>
</template>

<style scoped>
.ios .icon {
    opacity: 50%;
}
</style>
