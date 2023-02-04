<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonButtons, IonList, IonListHeader, IonLabel, IonItem, actionSheetController, IonNavLink, IonChip } from '@ionic/vue';

    import { Browser } from '@capacitor/browser';

    import ThemeView from './ThemeView.vue';
    import OptionsView from './OptionsView.vue';
    import UserView from './UserView.vue';
    import AdvancedView from './AdvancedView.vue';

    import { version, canal } from '/package'
    import { Capacitor } from '@capacitor/core';

    import getContributors from '@/functions/fetch/GetContributors';

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
            IonChip
        },
        setup() {
            return { 
                appVersion: version,
                appCanal: canal,
                appPlatform: Capacitor.getPlatform(),
                localStorageSize: '',
            }
        },
        data() {
            return {
                contributors: [],
                userAvatar: '',
                ThemeView: ThemeView,
                OptionsView: OptionsView,
                UserView: UserView,
                AdvancedView: AdvancedView,
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
            },
            logoutFunc() {
                // empty all local storage
                localStorage.clear();
                // go to login page
                location.href = '/login';
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
            async openURL(url) {
                await Browser.open({
                    url: url
                });
            },
            getContributorsList(){
                getContributors(5).then((contributors) => {
                    this.contributors = contributors;
                });
            },
            getUserData() {
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
            }
        },
        mounted() {
            // Get user data
            this.getUserData();

            document.addEventListener('userDataUpdated', () => {
                this.getUserData();
            });

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
            <ion-nav-link router-direction="forward" :component="UserView">
                <IonItem button>
                    <img :src="userAvatar" slot="start" class="avatar" />
                    <IonLabel>
                        <p>Utilisateur connecté</p>
                        <h2>{{ userName }}</h2>
                        <p>{{ userClass }} - {{ userSchool }}</p>
                    </IonLabel>
                </IonItem>
            </ion-nav-link>
        </IonList>

        <IonList :inset="true" lines="none">
            <ion-nav-link router-direction="forward" :component="OptionsView">
                <IonItem button>
                    <span class="material-symbols-outlined mdls" slot="start">tune</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Options de Papillon</h2>
                        <p>Modifier le comportement de Papillon</p>
                    </IonLabel>
                </IonItem>
            </ion-nav-link>
            <ion-nav-link router-direction="forward" :component="ThemeView">
                <IonItem button>
                    <span class="material-symbols-outlined mdls" slot="start">palette</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Personnaliser Papillon</h2>
                        <p>Ouvrir le menu de customisation de l'app</p>
                    </IonLabel>
                </IonItem>
            </ion-nav-link>
        </IonList>

        <IonList :inset="true" lines="none">
            <IonItem button @click="logout()">
                <span class="material-symbols-outlined mdls" slot="start">logout</span>
                <IonLabel class="ion-text-wrap">
                    <h2>Se déconnecter de Papillon</h2>
                    <p>Supprime toutes les données de connexion de l'application</p>  
                </IonLabel>
            </IonItem>
            <ion-nav-link router-direction="forward" :component="AdvancedView">
                <IonItem button>
                    <span class="material-symbols-outlined mdls" slot="start">monitor_heart</span>
                    <IonLabel>
                        <h2>Options avancées</h2>
                        <p>Permettent de manipuler Papillon en détail</p>
                    </IonLabel>
                </IonItem>
            </ion-nav-link>
        </IonList>

        <IonList :inset="true" lines="inset">
            <IonListHeader>
                <IonLabel>
                    <p>Contributeurs les plus actifs</p>
                </IonLabel>
            </IonListHeader>

            <IonItem v-for="(contributor, i) in contributors" :key="i" button @click="openURL(contributor.html_url)">
            <img :src="contributor.avatar_url" slot="start" class="avatar" />
            <IonLabel>
                <h2>{{ contributor.login }}</h2>
                <p>{{ contributor.contributions }} contributions à Papillon</p>
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

                <IonChip v-if="appCanal == 'dev'" slot="end" color="danger">
                    Développement
                </IonChip>
                <IonChip v-if="appCanal == 'beta'" slot="end" color="warning">
                    Accès anticipé
                </IonChip>
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
</style>
