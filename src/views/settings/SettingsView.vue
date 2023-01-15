<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonButtons, IonButton, IonList, IonListHeader, IonLabel, IonItem, IonToggle, actionSheetController, IonAvatar, IonNavLink } from '@ionic/vue';
    
    import { calendarOutline } from 'ionicons/icons';

    import ThemeView from './ThemeView.vue';

    import { version } from '/package'
    import { Capacitor } from '@capacitor/core';

    import displayToast from '@/functions/utils/displayToast.js';
    import GetToken from '@/functions/login/GetToken.js';
    import getContributors from '@/functions/fetch/GetContributors';

    import { trash, refresh, checkmark, alertCircle } from 'ionicons/icons';

    import { FilePicker } from '@capawesome/capacitor-file-picker';

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
            IonToggle,
            IonAvatar,
            IonNavLink,
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
            getServerStatus() {
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
            tweakGrades20Change() {
                let tweakGrades20 = this.$refs.tweakGrades20;
                let tweakGrades20Checked = tweakGrades20.$el.checked;

                localStorage.setItem('tweakGrades20', tweakGrades20Checked);

                document.dispatchEvent(new CustomEvent('gradeSettingsUpdated'));
                displayToast.presentToastFull(
                    'Paramètres des notes enregistrées',
                    'Les paramètres des notes ont été enregistrées avec succès.',
                    'light',
                    checkmark
                );
            },
            changeTick(option) {
                let el = this.$refs[option];
                let elChecked = el.$el.checked;

                localStorage.setItem(option, elChecked);

                document.dispatchEvent(new CustomEvent('settingsUpdated'));
                displayToast.presentToastFull(
                    'Paramètres enregistrés',
                    'Les paramètres ont été enregistrées avec succès.',
                    'light',
                    checkmark
                );
            },
            async tweakChangeAvatar() {
                try {
                    const result = await FilePicker.pickImages({
                        multiple: false,
                        readData: true
                    });

                    let base64Data = result.files[0].data;

                    let base64URL = 'data:image/jpeg;base64,' + base64Data;

                    // resize image to 200px width using canvas
                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext('2d');
                    let img = new Image();
                    img.src = base64URL;

                    img.onload = function () {
                        canvas.width = 128;
                        canvas.height = 128 * img.height / img.width;

                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        let newImage = canvas.toDataURL('image/jpeg');

                        localStorage.setItem('customAvatar', newImage);
                        document.dispatchEvent(new CustomEvent('userDataUpdated'));

                        displayToast.presentToastFull(
                            'Photo de profil modifiée',
                            'La photo de profil a été modifiée avec succès.',
                            'success',
                            checkmark
                        );
                    }
                }
                catch (error) {
                    console.error(error);
                    displayToast.presentToastFull(
                        'Erreur lors du changement de photo de profil',
                        error,
                        'danger',
                        alertCircle
                    );
                }
            },
            tweakDeleteAvatar() {
                localStorage.removeItem('customAvatar');
                document.dispatchEvent(new CustomEvent('userDataUpdated'));

                displayToast.presentToastFull(
                    'Photo de profil supprimée',
                    'La photo de profil a été supprimée avec succès.',
                    'light',
                    trash
                );
            },
            openURL(url) {
                // open url in new tab
                window.open(url, '_blank');
            },
            getContributorsList(){
                getContributors(5).then((contributors) => {
                    this.contributors = contributors;
                });
            },
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

            this.getServerStatus();

            // Get localStorage size
            this.localStorageSize = this.getLocalStorageSize() + ' kb';

            // displayToast.presentToastTest();

            // get tweakGrades20 ref
            let tweakGrades20 = this.$refs.tweakGrades20;
            tweakGrades20.$el.checked = localStorage.getItem('tweakGrades20') == 'true';
            this.getContributorsList();

            // get viescolaireEnabled ref
            let viescolaireEnabled = this.$refs.viescolaireEnabled;
            viescolaireEnabled.$el.checked = localStorage.getItem('viescolaireEnabled') == 'true';

            // get homepageEnabled ref
            let homepageEnabled = this.$refs.homepageEnabled;
            homepageEnabled.$el.checked = localStorage.getItem('homepageEnabled') == 'true';
        }
    });
</script>

<template>
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
            <IonListHeader>
                <IonLabel>
                    <p>Mon compte</p>
                </IonLabel>
            </IonListHeader>

            <IonItem>
                <IonAvatar slot="start">
                    <img :src="userAvatar" />
                </IonAvatar>
                <IonLabel>
                    <p>Utilisateur connecté</p>
                    <h2>{{ userName }}</h2>
                    <p>{{ userClass }} - {{ userSchool }}</p>
                </IonLabel>
            </IonItem>
        </IonList>


        <IonList :inset="true" lines="inset">
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

        <IonList :inset="true" lines="inset">
            <IonListHeader>
                <IonLabel>
                    <p>Tweaks</p>
                </IonLabel>
            </IonListHeader>

            <IonItem>
                <span class="material-symbols-outlined mdls" slot="start">nest_thermostat_zirconium_eu</span>
                <IonLabel>
                    <h2>Remettre les notes sur 20</h2>
                    <p>Uniformise le barème de toutes les notes</p>
                </IonLabel>
                <IonToggle slot="end" ref="tweakGrades20" @ionChange="changeTick('tweakGrades20')"></IonToggle>
            </IonItem>

            <IonItem>
                <span class="material-symbols-outlined mdls" slot="start">gavel</span>
                <IonLabel>
                    <h2>Activer l'onglet vie scolaire</h2>
                    <p>(Expérimental) Active l'onglet de vie scolaire</p>
                </IonLabel>
                <IonToggle slot="end" ref="viescolaireEnabled" @ionChange="changeTick('viescolaireEnabled')"></IonToggle>
            </IonItem>

            <IonItem>
                <span class="material-symbols-outlined mdls" slot="start">home</span>
                <IonLabel>
                    <h2>Activer la page d'accueil</h2>
                    <p>(Expérimental) Active la page d'accueil</p>
                </IonLabel>
                <IonToggle slot="end" ref="homepageEnabled" @ionChange="changeTick('homepageEnabled')"></IonToggle>
            </IonItem>
        </IonList>

        <IonList :inset="true" lines="inset">
            <IonListHeader>
                <IonLabel>
                    <p>Personnalisation</p>
                </IonLabel>
            </IonListHeader>

            <ion-nav-link router-direction="forward" :component="ThemeView">
                <IonItem button>
                    <span class="material-symbols-outlined mdls" slot="start">palette</span>
                    <IonLabel>
                        <h2>Personnaliser Papillon</h2>
                        <p>Ouvrir le menu de customisation de l'app</p>
                    </IonLabel>
                </IonItem>
            </ion-nav-link>

            <IonItem button @click="tweakChangeAvatar()">
                <span class="material-symbols-outlined mdls" slot="start">person_pin</span>
                <IonLabel>
                    <h2>Changer de photo de profil</h2>
                    <p>Utiliser une photo différente dans l'application</p>
                </IonLabel>
            </IonItem>

            <IonItem button @click="tweakDeleteAvatar()">
                <span class="material-symbols-outlined mdls" slot="start">delete</span>
                <IonLabel>
                    <h2>Supprimer la photo de profil personnalisée</h2>
                </IonLabel>
            </IonItem>
        </IonList>
        
        <IonList :inset="true" lines="inset">
            <IonListHeader>
                <IonLabel>
                    <p>A propos de l'app</p>
                </IonLabel>
            </IonListHeader>

            <IonItem button @click="openURL('https://discord.gg/DMx3TDyz2U')">
                <span class="material-symbols-outlined mdls" slot="start">support</span>
                <IonLabel>
                    <p>Discord</p>
                    <h2>Rejoindre le serveur Discord</h2>
                </IonLabel>
            </IonItem>

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

        <br /> <br /> 
      </ion-content>
</template>
  
<style scoped>
    .avatar {
        width: 45px;
        height: 45px;
        border-radius: 50%;
    }
</style>
