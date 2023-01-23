<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonButtons, IonButton, IonList, IonListHeader, IonLabel, IonItem, IonToggle, actionSheetController, IonAvatar, IonNavLink } from '@ionic/vue';
    
    import { calendarOutline } from 'ionicons/icons';

    import ThemeView from './ThemeView.vue';
    import LogView from './LogView.vue';
    import OptionsView from './OptionsView.vue';

    import PapillonLogo from '@/components/icons/PapillonLogo.vue';

    import { version } from '/package'
    import { Capacitor } from '@capacitor/core';

    import displayToast from '@/functions/utils/displayToast.js';
    import GetToken from '@/functions/login/GetToken.js';
    import getContributors from '@/functions/fetch/GetContributors';

    import { trash, refresh, checkmark, alertCircle } from 'ionicons/icons';

    import axios from 'axios';

    export default defineComponent({
        name: 'FolderPage',
        components: {
            IonHeader,
            IonContent,
            IonToolbar,
            IonTitle,
            IonMenuButton,
            IonButtons,
            IonList,
            IonListHeader,
            IonLabel,
            IonItem,
            IonNavLink,
            IonPage,
        },
        setup() {
            return { 
                appVersion: version,
                appPlatform: Capacitor.getPlatform(),
                localStorageSize: '',
            }
        },
        data() {
            return {
                contributors: [],
                userAvatar: '',
                ThemeView: ThemeView,
                LogView: LogView,
                OptionsView: OptionsView,
            }
        },
        methods: {
            async logout() {
                const actionSheet = await actionSheetController.create({
                    header: 'Êtes-vous sûr de vouloir vous déconnecter ?',
                    subHeader: 'Vous perdrez vos paramètres et vos données seront supprimées de votre appareil.',
                    buttons: [
                        {
                            text: 'Se déconnecter',
                            role: 'destructive',
                            data: {
                                action: 'delete',
                            },
                            handler: () => {
                                this.logoutFunc();
                            },
                        },
                        {
                            text: 'Annuler',
                            role: 'cancel',
                            data: {
                                action: 'cancel',
                            },
                        },
                    ],
                });

                await actionSheet.present();

                const res = await actionSheet.onDidDismiss();
                let result = JSON.stringify(res, null, 2);

                console.log(result);
            },
            logoutFunc() {
                // empty all local storage
                localStorage.clear();
                // go to login page
                location.href = '/login';
            },
            emptyCache() {
                // empty cache
                localStorage.removeItem('UserCache');
                localStorage.removeItem('TimetableCache');
                localStorage.removeItem('NewsCache');
                localStorage.removeItem('GradeCache');
                localStorage.removeItem('HomeworkCache');
                localStorage.removeItem('AbsencesCache');
                localStorage.removeItem('PunishmentsCache');
                localStorage.removeItem('MenuCache');
                localStorage.removeItem('SubjectColors');

                // show toast
                setTimeout(() => {
                    displayToast.presentToastFull(
                        'Cache des données vidé',
                        'Les informations pré-téléchargées ont été supprimées',
                        'light',
                        trash
                    );
                    
                    setTimeout(() => {
                        this.localStorageSize = this.getLocalStorageSize() + ' kb';
                    }, 1000);
                }, 100);
            },
            refreshToken() {
                GetToken();

                // show toast
                displayToast.presentToastFull(
                    'Demande de nouvelle clé envoyée...', 
                    'Veuillez patienter quelques secondes.',
                    'light',
                    refresh
                );

                // wait for event tokenUpdated once token is updated
                document.addEventListener('tokenUpdated', () => {
                    displayToast.presentToastFull(
                        'Nouvelle clé de connexion reçue !',
                        'Vos données s\'actualisent en arrière-plan...',
                        'success',
                        checkmark
                    );
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
            },
            getApiVersion() {
                const API = this.$api;

                let cacheApiVersion = localStorage.getItem('apiVersion');

                fetch(API + "/infos")
                    .then(response => response.json())
                    .then(result => {
                        let apiVer = result.version;
                        localStorage.setItem('apiVersion', apiVer);
                        this.apiVersion = apiVer;
                    });

                this.apiVersion = cacheApiVersion ?? 'Inconnue';
            },
            resetColors() {
                localStorage.removeItem('SubjectColors');

                // show toast
                setTimeout(() => {
                    displayToast.presentToastFull(
                        'Couleurs des matières réinitialisées',
                        'Les couleurs des matières ont été réinitialisées avec succès.',
                        'light',
                        checkmark
                    );
                    
                    setTimeout(() => {
                        this.localStorageSize = this.getLocalStorageSize() + ' kb';
                    }, 1000);
                }, 100);
            },
            openURL(url) {
                // open url in new tab
                window.open(url, '_blank');
            },
            getContributorsList(){
                getContributors(5).then((contributors) => {
                    this.contributors = contributors;
                });
            }
        },
        mounted() {
            // Get user data
            let userData = JSON.parse(localStorage.getItem('userData'));

            if (userData) {
                this.userName = userData.student.name;
                this.userClass = userData.class.name;
                this.userSchool = userData.class.school;
                this.userAvatar = userData.student.avatar;

                // check if user has custom avatar
                if (localStorage.getItem('customAvatar')) {
                    this.userAvatar = localStorage.getItem('customAvatar');
                }
                else if(localStorage.getItem('avatarCache')) {
                    this.userAvatar = localStorage.getItem('avatarCache');
                }
            }

            this.getApiVersion();
            this.getContributorsList();

            // Get localStorage size
            this.localStorageSize = this.getLocalStorageSize() + ' kb';
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

          <ion-title mode="md">Paramètres</ion-title>
        </IonToolbar>
      </IonHeader>
      
      <ion-content :fullscreen="true">
        <IonList :inset="true" lines="inset">
            <IonItem>
                <img :src="userAvatar" slot="start" class="avatar" />
                <IonLabel>
                    <p>Utilisateur connecté</p>
                    <h2>{{ userName }}</h2>
                    <p>{{ userClass }} - {{ userSchool }}</p>
                </IonLabel>
            </IonItem>
        </IonList>

        <IonList :inset="true" lines="none">
            <ion-nav-link router-direction="forward" :component="OptionsView">
                <IonItem button>
                    <span class="material-symbols-outlined mdls" slot="start">tune</span>
                    <IonLabel>
                        <h2>Options de Papillon</h2>
                        <p>Modifier le comportement de Papillon</p>
                    </IonLabel>
                </IonItem>
            </ion-nav-link>
            <ion-nav-link router-direction="forward" :component="ThemeView">
                <IonItem button>
                    <span class="material-symbols-outlined mdls" slot="start">palette</span>
                    <IonLabel>
                        <h2>Personnaliser Papillon</h2>
                        <p>Ouvrir le menu de customisation de l'app</p>
                    </IonLabel>
                </IonItem>
            </ion-nav-link>
        </IonList>

        <IonList :inset="true" lines="none">
            <IonItem button @click="logout()">
                <span class="material-symbols-outlined mdls" slot="start">logout</span>
                <IonLabel>
                    <h2>Se déconnecter de Papillon</h2>
                    <p>Supprime toutes les données de connexion de l'application</p>  
                </IonLabel>
            </IonItem>

            <IonItem button @click="emptyCache()">
                <span class="material-symbols-outlined mdls" slot="start">auto_delete</span>
                <IonLabel>
                    <h2>Vider le cache des données</h2>
                    <p>Réinitialise les données pré-téléchargées hors ligne</p>  
                </IonLabel>
            </IonItem>

            <IonItem button @click="resetColors()">
                <span class="material-symbols-outlined mdls" slot="start">format_color_fill</span>
                <IonLabel>
                    <h2>Réattribuer les couleurs de matières</h2>
                    <p>Réinitialise les couleurs des matières pour en obtenir de nouvelles</p>  
                </IonLabel>
            </IonItem>

            <IonItem button @click="refreshToken()">
                <span class="material-symbols-outlined mdls" slot="start">key</span>
                <IonLabel>
                    <h2>Regénerer les clés de connexion (avancé)</h2>
                    <p>Permet de demander une nouvelle autorisation à votre établissement</p>  
                </IonLabel>
            </IonItem>
            <ion-nav-link router-direction="forward" :component="LogView">
                <IonItem button>
                    <span class="material-symbols-outlined mdls" slot="start">developer_mode</span>
                    <IonLabel>
                        <h2>Voir les logs</h2>
                        <p>Consulter les logs de l'application</p>
                    </IonLabel>
                </IonItem>
            </ion-nav-link>
        </IonList>

        <IonList :inset="true" lines="inset">
            <IonListHeader>
                <IonLabel>
                    <p>Meilleurs contributeurs</p>
                </IonLabel>
            </IonListHeader>

            <IonItem v-for="(contributor, i) in contributors" :key="i" button @click="openURL(contributor.html_url)">
            <img :src="contributor.avatar_url" slot="start" class="avatar" />
            <IonLabel>
                <h2>{{ contributor.login }}</h2>
                <p>{{ contributor.contributions }} contributions</p>
            </IonLabel>
            </IonItem>
        </IonList>

        <IonList :inset="true" lines="inset">
            <IonItem button @click="openURL('https://discord.gg/DMx3TDyz2U')">
                <span class="material-symbols-outlined mdls" slot="start">support</span>
                <IonLabel>
                    <p>Discord</p>
                    <h2>Rejoindre le serveur Discord</h2>
                </IonLabel>
            </IonItem>
            <IonItem button @click="openURL('https://github.com/PapillonApp/papillon-v5/')">
                <span class="material-symbols-outlined mdls" slot="start">data_object</span>
                <IonLabel>
                    <p>GitHub</p>
                    <h2>Contribuer au projet Papillon</h2>
                </IonLabel>
            </IonItem>
        </IonList>

        <IonList :inset="true" lines="inset">
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
    .avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        object-fit: cover;
    }

    ion-label * {
        /* add word wrap */
        word-wrap: break-word;
        overflow: auto;
        white-space: pre-wrap;
    }
</style>
