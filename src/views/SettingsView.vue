<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonButtons, IonButton, IonList, IonListHeader, IonLabel, IonItem, toastController } from '@ionic/vue';
    
    import { calendarOutline } from 'ionicons/icons';

    import {version} from '/package'
    import { Capacitor } from '@capacitor/core';

    import GetToken from '@/functions/login/GetToken.js';

    export default defineComponent({
        name: 'FolderPage',
        components: {
            IonHeader,
            IonContent,
            IonToolbar,
            IonTitle,
            IonMenuButton,
            IonPage,
            IonButtons,
            IonList,
            IonListHeader,
            IonLabel,
            IonItem
        },
        setup() {
            return { 
                appVersion: version,
                apiVersion: '3.0.0',
                appPlatform: Capacitor.getPlatform(),
                localStorageSize: '',
                userName: ''
            }
        },
        methods: {
            async presentToast(msg, color) {
                const toast = await toastController.create({
                    message: msg,
                    duration: 2000,
                    position: "bottom",
                    color: color
                });

                await toast.present();
            },
            logout() {
                // empty all local storage
                localStorage.clear();
                // go to login page
                location.href = '/login';
            },
            emptyCache() {
                // empty cache
                localStorage.removeItem('UserCache');
                localStorage.removeItem('TimetableCache');

                // show toast
                setTimeout(() => {
                    this.presentToast('Cache des données vidé', 'light');
                    
                    setTimeout(() => {
                        this.localStorageSize = this.getLocalStorageSize() + ' kb';
                    }, 1000);
                }, 100);
            },
            refreshToken() {
                GetToken();

                // show toast
                this.presentToast('Demande de nouvelle clé envoyée...', 'light');

                // wait for event tokenUpdated once token is updated
                document.addEventListener('tokenUpdated', () => {
                    this.presentToast('Nouvelle clé de connexion reçue !', 'light');
                });
            },
            getLocalStorageSize() {
                // get localStorage size in kb
                let localStorageSize = 0;
                for (let i = 0; i < localStorage.length; i++) {
                    localStorageSize += localStorage.getItem(localStorage.key(i)).length;
                }

                // convert to kb
                localStorageSize = localStorageSize / 1024;

                // round to 2 decimals
                localStorageSize = Math.round(localStorageSize * 100) / 100;

                // return size
                return localStorageSize;
            }
        },
        mounted() {
            // Get user data
            let userData = JSON.parse(localStorage.getItem('userData'));

            if (userData) {
                this.userName = userData.student.name;
            }

            // Get localStorage size
            this.localStorageSize = this.getLocalStorageSize() + ' kb';
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

          <ion-title mode="md">Paramètres</ion-title>
        </IonToolbar>
      </IonHeader>
      
      <ion-content :fullscreen="true">
        <IonHeader collapse="condense">
            <IonToolbar>
                <ion-title size="large">Paramètres</ion-title>
            </IonToolbar>
        </IonHeader>

        <IonList>
            <IonListHeader>
                <IonLabel>
                    <p>Mon compte</p>
                </IonLabel>
            </IonListHeader>

            <IonItem>
                <span class="material-symbols-outlined mdls" slot="start">account_circle</span>
                <IonLabel>
                    <p>Utilisateur connecté</p>
                    <h2>{{ userName }}</h2>
                </IonLabel>
            </IonItem>
        </IonList>


        <IonList>
            <IonListHeader>
                <IonLabel>
                    <p>Options</p>
                </IonLabel>
            </IonListHeader>

            <IonItem button @click="logout()">
                <span class="material-symbols-outlined mdls" slot="start">logout</span>
                <IonLabel>
                    <h2>Se déconnecter de Papillon</h2>
                    <p>Supprime toutes les données de connexion de l'application</p>  
                </IonLabel>
            </IonItem>

            <IonItem button @click="emptyCache()">
                <span class="material-symbols-outlined mdls" slot="start">autorenew</span>
                <IonLabel>
                    <h2>Vider le cache des données</h2>
                    <p>Réinitialise les données pré-téléchargées hors ligne</p>  
                </IonLabel>
            </IonItem>

            <IonItem button @click="refreshToken()">
                <span class="material-symbols-outlined mdls" slot="start">key</span>
                <IonLabel>
                    <h2>Regénerer les clés de connexion (avancé)</h2>
                    <p>Permet de demander une nouvelle autorisation à votre établissement</p>  
                </IonLabel>
            </IonItem>
        </IonList>

        <IonList>
            <IonListHeader>
                <IonLabel>
                    <p>A propos de l'app</p>
                </IonLabel>
            </IonListHeader>

            <IonItem>
                <span class="material-symbols-outlined mdls" slot="start">security_update_good</span>
                <IonLabel>
                    <p>Version de l'app</p>
                    <h2>papillon {{ appVersion }}-{{ appPlatform }}</h2>
                </IonLabel>
            </IonItem>

            <IonItem>
                <span class="material-symbols-outlined mdls" slot="start">webhook</span>
                <IonLabel>
                    <p>Version de l'API</p>
                    <h2>{{ apiVersion }}</h2>
                </IonLabel>
            </IonItem>

            <IonItem>
                <span class="material-symbols-outlined mdls" slot="start">storage</span>
                <IonLabel>
                    <p>Taille du cache</p>
                    <h2>{{ localStorageSize }}</h2>
                </IonLabel>
            </IonItem>
        </IonList>
      </ion-content>
    </ion-page>
</template>
  
<style scoped>
    
</style>
