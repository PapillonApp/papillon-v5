<script lang="ts">
    import { IonApp, IonContent, IonButton, IonButtons, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonRouterOutlet, IonHeader, IonToolbar, IonSplitPane, toastController, IonSkeletonText, alertController, IonModal, IonThumbnail } from '@ionic/vue';

    import Values from 'values.js'

    import { Browser } from '@capacitor/browser';

    const { BackgroundFetch } = require("@transistorsoft/capacitor-background-fetch");

    import { Capacitor } from '@capacitor/core';

    const { version, canal } = require('/package')

    import { defineComponent, ref } from 'vue';
    import { useRoute } from 'vue-router';

    const subjectColor = require('@/functions/utils/subjectColor.js');

    const { changelog } = require('/src/update') 

    import { globeOutline } from 'ionicons/icons';
    import { AndroidShortcuts } from 'capacitor-android-shortcuts';

    import { createAnimation } from '@ionic/vue';

    const GetUser = require('./functions/fetch/GetUserData');
    const GetRecap = require('./functions/fetch/GetRecap');
    const GetToken = require('./functions/login/GetToken');

    import { LocalNotifications } from '@capacitor/local-notifications';

    import { SplashScreen } from '@capacitor/splash-screen';

    // defines the user data return interface
    interface UserData {
                student: {
                    name: string,
                    avatar: string,
                    ine: string,
                    contact: {
                        email: string,
                        phone: string
                    }
                },
                class: {
                    name: string,
                    school: string
                }
            }

    export default defineComponent({
    name: 'App',
    components: {
        IonApp, 
        IonContent, 
        IonItem, 
        IonLabel, 
        IonList, 
        IonMenu, 
        IonMenuToggle,
        IonRouterOutlet, 
        IonSplitPane,
        IonHeader,
        IonToolbar,
        IonSkeletonText,
        IonModal,
        IonThumbnail,
        IonButtons,
        IonButton
    },
    data() {
        return {
            loggedIn: localStorage.loggedIn,
            dataLoading: true,
            connectedToServer: 'pause',
            userData: {
                student: {
                    name: '',
                    avatar: '',
                    ine: '',
                    contact: {
                        email: '',
                        phone: ''
                    }
                },
                class: {
                    name: '',
                    school: ''
                }
            },
            avatar: '',
            presentingElement: undefined as any,
        }
    },
    setup() {
        const selectedIndex = ref(0);
        // defines the tabs shown in the menu
        const appPages = [
            {
                title: 'Accueil',
                url: '/home',
                icon: "home",
            },
            {
                title: 'Emploi du temps',
                url: '/timetable',
                icon: "calendar_month"
            },
            {
                title: 'Travail à faire',
                url: '/homework',
                icon: "auto_stories",
            },
            {
                title: 'Notes',
                url: '/grades',
                icon: "insights",
            },
            {
                title: 'Vie scolaire',
                url: '/schoollife',
                icon: "gavel",
            },
            {
                title: 'Actualités',
                url: '/news',
                icon: "newspaper",
            },
            {
                title: 'Conversations',
                url: '/conversations',
                icon: "forum",
            },
            {
                title: 'Paramètres',
                url: '/settings',
                icon: "settings",
            },
        ];
        
        // hides some tabs when they are not anabled
        if(localStorage.getItem('viescolaireEnabled') !== 'true') {
            // remove school life tab
            appPages.splice(4, 1);
        }
        
        // weird ionic stuff
        const path = window.location.pathname.split('folder/')[1];
        if (path !== undefined) {
            selectedIndex.value = appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
        }
        
        const route = useRoute();
        
        return { 
            selectedIndex,
            appCanal: canal,
            appVersion: version,
            appUpdates: changelog,
            appPages,
            labels : [],
            isSelected: (url: string) => url === route.path ? 'selected' : ''
        }
    },
    methods: {
        async openURL(url: string) {
			await Browser.open({
					url: url,
					toolbarColor: '#1e1e1e',
					presentationStyle: 'popover',
			});
		},
        checkAndroidShortcuts() {
            AndroidShortcuts.isDynamicSupported().then((result) => {
                if (result) {
                    AndroidShortcuts.addListener('shortcut', (response: any) => {
                        switch (response.data) {
                            case "timetable":
                                this.$router.push('/timetable');
                                break;
                            case "homework":
                                this.$router.push('/homework');
                                break;
                            case "grades":
                                this.$router.push('/grades');
                                break;
                            default:
                                break;
                        }
                    });
                }
            })
        },
        async notify(title: string, body: string) {
            LocalNotifications.schedule({
                notifications: [
                    {
                        title: title,
                        body: body,
                        id: this.randomID(),
                        schedule: { at: new Date(Date.now() + 1000) },
                    }
                ]
            });
        },
        randomID() {
            return Math.floor(Math.random() * 100000 + 1000);
        },
        async backgroundFetchEvent(taskId: any) {
            GetToken.default().then(async (token: any) => {
                if(token) {
                    GetRecap.default().then(async (recap: any) => {
                        if(recap) {
                            // grades
                            const lastGrades = JSON.parse(localStorage.getItem('lastGrades') || '[]');
                            const recapGrades = recap.grades.last;

                            if(lastGrades.length === 0) {
                                localStorage.setItem('lastGrades', JSON.stringify(recapGrades));
                            }
                            else if (JSON.stringify(lastGrades[0]) == JSON.stringify(recapGrades[0])) {
                                // get last grade
                                let lastGrade = recapGrades[0];
                                let description = lastGrade.info.description

                                // get grade as 20
                                let gradeAs20 = Math.round((lastGrade.grade.value / lastGrade.grade.out_of) * 20);

                                const reactions = {
                                    0: 'Bon... 💀',
                                    5: 'Aïe aïe aïe... 😤',
                                    10: 'Peut-être une prochaine fois... 🫡',
                                    12: 'Bien joué 👍',
                                    14: 'Sympa ! 👌',
                                    17: 'Bravo ! 🤩',
                                    18: 'Félicitations ! 👏',
                                    20: 'Champagne ! 🍾'
                                }

                                let reaction = '';

                                // get reaction if gradeAs20 is over a certain value
                                for (const [key, value] of Object.entries(reactions)) {
                                    if(gradeAs20 >= parseInt(key)) {
                                        reaction = value;
                                    }
                                }

                                if(description.trim() === '') {
                                    description = 'votre nouvelle note.';
                                }
                                else {
                                    description = '"' + description + '".';
                                }

                                this.notify(
                                    'Nouvelle note en ' + lastGrade.info.subject,
                                    'Vous avez eu ' + lastGrade.grade.value + '/' + lastGrade.grade.out_of + ' sur ' + description + ' ' + reaction
                                );

                                localStorage.setItem('lastGrades', JSON.stringify(recapGrades));
                            }
                        }
                        await BackgroundFetch.finish(taskId);
                    });
                }
            });
        },
        async configureBackgroundFetch() {
            await BackgroundFetch.configure({minimumFetchInterval: 15}, async (taskId: any) => {
                console.log('[js] BackgroundFetch event received: ', taskId);
                
                try {
                    this.backgroundFetchEvent(taskId);
                } catch (e) {
                    console.log(e);
                    await BackgroundFetch.finish(taskId);
                }
            }, (error: any) => {
                console.log('[js] RNBackgroundFetch failed to start');
            });
        },
        checkIosShortcuts() {
            return false;
        },
        RGBToHSL(r: number, g: number, b: number) {
            r /= 255;
            g /= 255;
            b /= 255;
            const l = Math.max(r, g, b);
            const s = l - Math.min(r, g, b);
            const h = s
                ? l === r
                ? (g - b) / s
                : l === g
                ? 2 + (b - r) / s
                : 4 + (r - g) / s
                : 0;
            return [
                60 * h < 0 ? 60 * h + 360 : 60 * h,
                100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
                (100 * (2 * l - s)) / 2,
            ];
        },
        async presentToast(header: string, msg: string, color: string, icon: any) {
            const toast = await toastController.create({
                header: header,
                duration: 2000,
                position: "top",
                color: color,
                icon: icon,
                cssClass: "toast-small",
            });

            await toast.present();
        },
        getUserData() {
            // get user data
            this.dataLoading = true;
            GetUser.default().then((data: UserData) => {
                this.userData = data;
                this.dataLoading = false;
                if(!localStorage.getItem('avatarCache')) {
                    this.avatar = data.student.avatar;
                }

                // check if user has custom name
                if (localStorage.getItem('customName')) {
                    this.userData.student.name = localStorage.getItem('customName') as string;
                }

                // set userData in localStorage
                localStorage.userData = JSON.stringify(data);
            });
        },
        changePage(url : string) {
            // close menu
            const menu = document.querySelector('ion-menu');
            setTimeout(() => {
                menu?.toggle();
            }, 100);
        },
        async askNotifPerms() {
            await LocalNotifications.requestPermissions();
        },
        async TestNotif() {
            const toast = await toastController.create({
                header: "Bonjour, c'est une notification de test !",
                message: "Exemple de notification",
                duration: 200000,
                position: "top",
                color: "light",
            });

            await toast.present();
        },
        transition (baseEl: any, opts: any) {
            const enteringAnimation = createAnimation()
                .addElement(opts.enteringEl)
                .fromTo('opacity', 0, 1)
                .duration(100);
            
            const leavingAnimation = createAnimation()
                .addElement(opts.leavingEl)
                .fromTo('opacity', 1, 0)
                .duration(100);
            
            const animation = createAnimation()
                .addAnimation(enteringAnimation)
                .addAnimation(leavingAnimation);

            return animation;
        },
        async displayDevMsg() {
			const alert = await alertController.create({
				header: 'Version de développement',
				message: 'Papillon fonctionne actuellement en mode développement. <br/><br/> Certaines fonctionnalités ne sont pas encore terminées et risquent de ne pas fonctionner correctement.',
				mode: 'md',
				buttons: ['Je comprends']
			});

			await alert.present();
		},
        showChangelog() {
            // update version
            localStorage.setItem('version', this.appVersion);

            // show changelog
            let refs = this.$refs as any;
            refs.changelogModal.$el.present();
        },
        hideChangelog() {
            let refs = this.$refs as any;
            refs.changelogModal.$el.dismiss();
        },
    },
    mounted() {
        // hide splash screen when dom is loaded
        this.$nextTick(function () {
            setTimeout(() => {
                SplashScreen.hide();
            }, 50);
        })

        // shortcuts
        if(Capacitor.getPlatform() === 'android') {
            this.checkAndroidShortcuts();
        }
        else if(Capacitor.getPlatform() === 'ios') {
            this.checkIosShortcuts();
            this.configureBackgroundFetch();
        }

        // user data if logged in
        if(localStorage.loggedIn) {
            this.getUserData();
        }

        let lastRefesh = new Date();

        document.addEventListener('connectionState', (e: any) => {
            let state = e.detail;
            this.connectedToServer = state;

            lastRefesh = new Date();
        });

        // check if lastRefesh is older than 5 minutes
        setInterval(() => {
            let now = new Date();
            let diff = now.getTime() - lastRefesh.getTime();
            let minutes = Math.floor((diff/1000)/60);

            if(minutes >= 5) {
                this.connectedToServer = "paused";
            }
        }, 1000);

        document.addEventListener('tokenUpdated', () => {
            this.getUserData();
        });

        // if avatarCache is set, make it the avatar
        if(localStorage.getItem('customAvatar')) {
            this.avatar = localStorage.getItem('customAvatar') as string;
        }
        else if(localStorage.getItem('avatarCache')) {
            this.avatar = localStorage.getItem('avatarCache') as string;
        }

        document.addEventListener('userDataUpdated', () => {
            if(localStorage.getItem('customAvatar')) {
                this.avatar = localStorage.getItem('customAvatar') as string;
            }
            else if(localStorage.getItem('avatarCache')) {
                this.avatar = localStorage.getItem('avatarCache') as string;
            }

            // check if user has custom name
            if (localStorage.getItem('customName')) {
                this.userData.student.name = localStorage.getItem('customName') as string;
            }
            else {
                this.getUserData();
            }
        });

        // check internet connection
        window.addEventListener('online', () => {
            this.presentToast('Vous êtes de nouveau connecté.','Certaines informations nécessiteront peut-être un rafraîchissement.', 'success', globeOutline)
            document.dispatchEvent(new CustomEvent('connectionState', { detail: 'paused' }));
        });

        window.addEventListener('offline', () => {
            this.presentToast('Vous n\'êtes plus connecté à Internet.', 'Vous n\'aurez accès qu\'aux informations déjà téléchargées.', 'danger', globeOutline)
            document.dispatchEvent(new CustomEvent('connectionState', { detail: 'disconnected' }));
        });

        // check if online
        if(!navigator.onLine) {
            this.presentToast('Vous n\'êtes pas connecté à Internet.', 'Vous n\'aurez accès qu\'aux informations déjà téléchargées.', 'danger', globeOutline)
            document.dispatchEvent(new CustomEvent('connectionState', { detail: 'disconnected' }));
        }

        this.askNotifPerms();

        // on settingsUpdated event, setup the app
        document.addEventListener('settingsUpdated', () => {
            // if viescolaireEnabled is set to false, remove school life tab
            if(localStorage.getItem('viescolaireEnabled') !== 'true') {
                // remove school life tab
                this.appPages.splice(3, 1);
            }
            else {
                // add school life tab
                this.appPages.splice(3, 0, {
                    title: 'Vie scolaire',
                    url: '/schoollife',
                    icon: "gavel",
                });
            }
        });

        // apply customizations
        if(localStorage.getItem('customizations')) {
            let customizations = JSON.parse(localStorage.getItem('customizations') as string);

            if(customizations.font) {
                document.body.style.setProperty('--papillon-font', customizations.font);
            }

            if(customizations.color) {
                document.body.style.setProperty('--ion-color-primary', customizations.color.color.hex);
                document.body.style.setProperty('--ion-color-primary-rgb', customizations.color.color.rgb);
            }
        }
        
        // check current version in local storage
        if(localStorage.getItem('version')) {
            if(localStorage.getItem('version') !== this.appVersion) {
                // this.showChangelog();
            }
        }
        else if(!this.loggedIn) {
            // do nothing
        }
        else {
            // this.showChangelog();
        }

        document.addEventListener('showChangelog', () => {
            this.showChangelog();
        })
    }
  });
</script>

<template>
  <ion-app>
    <div id="debug_banner" v-if="appCanal == 'dev'" @click="displayDevMsg">
        DEVBUILD
    </div>

    <ion-split-pane content-id="main-content">
      <ion-menu type="overlay" content-id="main-content" class="menu" v-if="loggedIn" :swipeGesture="true">
        <ion-header collapse="fade">
            <div class="userItem" :style="`background-image: url('${avatar}');`">
                <div class="userItem_content">
                    <div class="avatar" v-if="dataLoading">
                        <ion-skeleton-text :animated="true" style="width: 100%;height: 100%;border-radius: 50%;"></ion-skeleton-text>
                    </div>
                    <img v-else class="avatar" :src="avatar" ref="avatar"/>

                    <div class="userData" v-if="dataLoading">
                        <h3><ion-skeleton-text :animated="true" style="width: 40%;margin-bottom: 5px;height: 18px;"></ion-skeleton-text></h3>
                        <p><ion-skeleton-text :animated="true" style="width: 80%;"></ion-skeleton-text></p>
                    </div>
                    <div class="userData" v-else>
                        <h3>{{userData.student.name}}</h3>
                        <p v-if="userData.class.school.trim() != ''">{{userData.class.name}} — {{userData.class.school}}</p>
                    </div>
                </div>
            </div>
        </ion-header>
        <ion-content mode="md" class="menuContent">
          <ion-list id="inbox-list"> 
            <router-link @click="changePage(p.url)" class="navLink" :to="`${p.url}`" v-for="(p, i) in appPages" :key="i">
                <ion-item button mode="md" lines="none" :detail="false" @click="selectedIndex = i" :class="{ selected: selectedIndex === i }">
                    <span class="material-symbols-outlined mdls" slot="start">{{ p.icon }}</span>
                    <ion-label>{{ p.title }}</ion-label>
                </ion-item>
            </router-link>
          </ion-list>

          <ion-list id="bottomActionsList"> 
            <ion-item @click="openURL('https://docs.getpapillon.xyz')" button mode="md" lines="none" :detail="false">
                <span class="material-symbols-outlined mdls" slot="start">support</span>
                <ion-label>Aide de Papillon</ion-label>
            </ion-item>
            <ion-item button mode="md" lines="none" :detail="false">
                <span class="material-symbols-outlined mdls" slot="start">dns</span>
                <ion-label>Serveur</ion-label>

                <ion-chip slot="end" color="success" v-if="connectedToServer == 'connected'">
                    <ion-label>Connecté</ion-label>
                </ion-chip>
                <ion-chip slot="end" color="warning" v-else-if="connectedToServer == 'connecting'">
                    <ion-label>Reconnexion</ion-label>
                </ion-chip>
                <ion-chip slot="end" color="danger" v-else-if="connectedToServer == 'disconnected'">
                    <ion-label>Déconnecté</ion-label>
                </ion-chip>
                <ion-chip slot="end" color="medium" v-else>
                    <ion-label>En pause</ion-label>
                </ion-chip>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-menu>
      <ion-router-outlet ref="outlet" :animated="true" :animation="transition" id="main-content" v-slot="{ Component }">
        <keep-alive>
            <component :is="Component" />
        </keep-alive>
    </ion-router-outlet>
    </ion-split-pane>

    <ion-modal ref="changelogModal">
        <ion-header>
            <ion-toolbar>
                <ion-title>Notes de mise à jour</ion-title>
                <ion-buttons slot="end">
                    <ion-button :strong="true" @click="hideChangelog">Terminé</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="update">
            <div class="update_inner">
                <div id="update-header">
                    <h1>Quoi de neuf dans Papillon ?</h1>
                    <p>Voici les dernières nouveautés de Papillon.</p>
                </div>

                <ion-list inset>
                    <ion-item v-for="(feature, i) in appUpdates.features" :key="i">
                        <span class="material-symbols-outlined mdls" slot="start">{{feature.icon}}</span>
                        <ion-label class="ion-text-wrap">
                            <h2>{{ feature.name }}</h2>
                            <p>{{ feature.description }}</p>
                        </ion-label>
                    </ion-item>
                </ion-list>

                <ion-button mode="md" @click="hideChangelog" fill="solid" class="endButton">Accéder à Papillon</ion-button>
                <p class="warning">Cet écran n'apparaîtera pas au redémarrage de Papillon. Il restera accessible dans les paramètres.</p>
            </div>
        </ion-content>
    </ion-modal>
  </ion-app>
</template>

<style scoped>
    ion-menu::part(container) {
        border-radius: 0px 20px 20px 0px;
    }

    @media screen and (min-width: 992px) {
        ion-menu::part(container) {
            border-radius: 0px 0px 0px 0px;
        }
    }

    ion-menu ion-list {
        background: none;
    }

    .navLink {
        text-decoration: none;
    }

    .userItem {
        display: flex;
        padding: 0px;
        align-items: center;

        background-size: cover;
        background-position: center;

        min-height: 120px;
    }

    .ios .userItem {
        width: 100%;
    }

    .userItem * {
        margin: 0;
        padding: 0;
    }

    .userItem_content {
        width: 100%;

        display: flex;
        padding: 10px 12px;
        gap: 12px;
        align-items: center;

        background-color: #00000080;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(20px);

        padding-top: calc(env(safe-area-inset-top) + 10px) !important;
    }

    .userItem .avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        object-fit: cover;
    }

    .userData {
        width: calc(100% - 12px - 42px);
    }

    .userData p {
        text-transform: uppercase;
    }

    .userItem h3 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 1px;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }


    .userItem p {
        font-size: 15px;
        color: #888;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: 3px;
    }

    .ios .userItem p {
        font-size: 16px;
        margin-top: 0;
        font-family: var(--papillon-font);
    }

    .userItem_content {
        flex-direction: column;
        align-items: flex-start;
        padding: 16px 16px;
        color: #fff;
    }

    .userItem h3 {
        font-size: 20px;
    }

    .userItem p {
        color: #ffffffc2;
    }

    .userData {
        width: calc(100%);
    }

    ion-menu ion-content {
    --background: var(--ion-item-background, var(--ion-background-color, #fff));
    }

    ion-menu ion-content {
    --padding-start: 8px;
    --padding-end: 8px;
    --padding-top: 8px;
    --padding-bottom: 20px;
    }

    ion-menu ion-list {
    padding: 0px 0;
    }

    ion-menu ion-note {
    margin-bottom: 30px;
    }

    ion-menu ion-list-header,
    ion-menu ion-note {
    padding-left: 10px;
    }

    ion-menu ion-list#inbox-list ion-list-header {
    font-size: 22px;
    font-weight: 600;

    min-height: 20px;
    }

    ion-menu ion-list#labels-list ion-list-header {
    font-size: 16px;

    margin-bottom: 18px;

    color: #757575;

    min-height: 26px;
    }

    ion-item *:not(span) {
        font-family: var(--papillon-font), sans-serif !important;
    }

    ion-menu ion-item {
        --padding-start: 15px;
        --padding-end: 10px;
        border-radius: 300px;
        isolation: isolate;
    }

    ion-menu ion-item ion-chip {
        margin: 0;
        margin-right: -10px;
        margin-left: 5px;
    }

    ion-menu ion-item {
        color: var(--ion-color-step-500);
        margin-bottom: 2px;
        --background: transparent;
    }

    ion-menu .router-link-active ion-item {
        --background: rgba(var(--ion-color-primary-rgb), 0.14);
        color: var(--ion-color-primary-rgb);
    }

    ion-menu ion-item .mdls {
        margin-right: calc(var(--padding-start) + 2px);
    }

    ion-menu .router-link-active ion-item ion-icon {
    color: var(--ion-color-primary);
    }

    ion-menu.md ion-item ion-icon {
    color: var(--color);
    }

    ion-menu ion-item ion-label {
    font-weight: 500;
    }

    ion-note {
    display: inline-block;
    font-size: 16px;

    color: var(--ion-color-medium-shade);
    }

    .router-link-active ion-item {
        --color: var(--ion-color-primary);
    }

    .router-link-active ion-item:hover {
        background: rgba(var(--ion-color-primary-rgb), 0.1);
        cursor: pointer;
    }

    a:not(.router-link-active) ion-menu-toggle ion-item {
        --color: var(--ion-color-medium-shade);
    }

    a:not(.router-link-active) ion-menu-toggle ion-item:hover {
        opacity: 0.75;
        cursor: pointer;
    }

    .fade-enter-active, .fade-leave-active {
        transition-property: opacity;
        transition-duration: .25s;
    }

    .fade-enter-active {
        transition-delay: .25s;
    }

    .fade-enter, .fade-leave-active {
        opacity: 0
    }

    /* updates */
    #update-header {
        margin: 40px 25px;

        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        color: #000;
        border-radius: 10px;

        margin-bottom: 30px;
    }

    .dark #update-header {
        color: #fff !important;
    }

    #update-header * {
        margin: 0;
        padding: 0;
        text-align: center;
    }

    #update-header .updateIcon {
        margin-bottom: 15px !important;

        height: 62px;
    }

    #update-header h1 {
        font-size: 28px;
        letter-spacing: -0.2px;
        margin-bottom: 5px;
        color: var(--ion-color-primary);
    }

    #update-header p {
        font-size: 16px;
        opacity: 0.5;
    }

    .update .warning {
        margin: 0px 40px;
        font-size: 13px;
        opacity: 0.5;
        text-align: center;
        margin-top: 10px;
    }

    .update::part(scroll) {
        padding-bottom: calc(env(safe-area-inset-bottom) + 100px) !important;
    }

    .endButton {
        width: calc(100% - 40px);
        margin: 0px 20px;

        --border-radius: 8px;
    }

    .update ion-list {
        margin-bottom: 30px;
    }

    .menuContent {
        overflow: hidden !important;
    }

    #bottomActionsList {
        width: 100%;
        background: var(--ion-background-color);

        position: fixed;
        padding-bottom: calc(env(safe-area-inset-bottom) + 20px);
        padding-top: 10px;

        bottom: 0;
        left: 0;

        padding-left: 10px;
        padding-right: 10px;
    }
</style>
