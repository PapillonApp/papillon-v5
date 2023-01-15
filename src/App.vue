<script lang="ts">
  import { IonApp, IonContent, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonNote, IonRouterOutlet, IonHeader, IonToolbar, IonSplitPane, toastController } from '@ionic/vue';

  import { defineComponent, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import { globeOutline } from 'ionicons/icons';

  const GetUser = require('./functions/fetch/GetUserData');
  const displayToast = require('./functions/utils/displayToast.js');

  import { LocalNotifications } from '@capacitor/local-notifications';

  import { SplashScreen } from '@capacitor/splash-screen';

  interface UserData {
                student: {
                    name: string,
                    avatar: string,
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
    },
    data() {
        return {
            loggedIn: localStorage.loggedIn,
            userData: {
                student: {
                    name: '',
                    avatar: '',
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
        }
    },
    setup() {
        const selectedIndex = ref(0);
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
                url: '/school-life',
                icon: "gavel",
            },
            {
                title: 'Actualités',
                url: '/news',
                icon: "newspaper",
            },
            {
                title: 'Paramètres',
                url: '/settings',
                icon: "settings",
            },
        ];
        
        // disable some tabs
        if(localStorage.getItem('viescolaireEnabled') !== 'true') {
            // remove school life tab
            appPages.splice(4, 1);
        }

        if(localStorage.getItem('homepageEnabled') !== 'true') {
            // remove home tab
            appPages.splice(0, 1);
        }
        
        const path = window.location.pathname.split('folder/')[1];
        if (path !== undefined) {
            selectedIndex.value = appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
        }
        
        const route = useRoute();
        
        return { 
            selectedIndex,
            appPages,
            labels : [],
            isSelected: (url: string) => url === route.path ? 'selected' : ''
        }
    },
    methods: {
        async presentToast(header: string, msg: string, color: string, icon: any) {
            const toast = await toastController.create({
                header: header,
                message: msg,
                duration: 2000,
                position: "bottom",
                color: color,
                icon: icon
            });

            await toast.present();
        },
        getUserData() {
            // get user data
            GetUser.default().then((data: UserData) => {
                this.userData = data;
                if(!localStorage.getItem('avatarCache')) {
                    this.avatar = data.student.avatar;
                }

                // set userData in localStorage
                localStorage.userData = JSON.stringify(data);
            });
        },
        async askNotifPerms() {
            await LocalNotifications.requestPermissions();
        }
    },
    mounted() {
        // hide splash screen when dom is loaded
        this.$nextTick(function () {
            setTimeout(() => {
                SplashScreen.hide();
            }, 300);
        })

        // user data if logged in
        if(localStorage.loggedIn) {
            this.getUserData();
        }

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
        });

        // check internet connection
        window.addEventListener('online', () => {
            this.presentToast('Vous êtes de nouveau connecté à Internet.', 'Certaines informations nécéssiteront peut-être un rafraîchissement.', 'success', globeOutline)
        });

        window.addEventListener('offline', () => {
            this.presentToast('Vous n\'êtes plus connecté à Internet.', 'Vous n\'aurez accès qu\'aux informations déjà téléchargées.', 'danger', globeOutline)
        });

        // check if online
        if(!navigator.onLine) {
            this.presentToast('Vous n\'êtes pas connecté à Internet.', 'Vous n\'aurez accès qu\'aux informations déjà téléchargées.', 'danger', globeOutline)
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
                    url: '/school-life',
                    icon: "gavel",
                });
            }
        });

        // apply customizations
        if(localStorage.getItem('customizations')) {
            let customizations = JSON.parse(localStorage.getItem('customizations') as string);

            if(customizations.mainColor) {
                document.body.style.setProperty('--ion-color-primary', customizations.mainColor.hex);
                document.body.style.setProperty('--ion-color-primary-rgb', customizations.mainColor.rgb);
                document.body.style.setProperty('--ion-color-primary-shade', customizations.mainColor.hex);
                document.body.style.setProperty('--ion-color-primary-tint', customizations.mainColor.hex);
            }

            if(customizations.font) {
                document.body.style.setProperty('--papillon-font', customizations.font);
            }
        }
    }
  });
</script>

<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay" class="menu" v-if="loggedIn">
        <ion-header>
          <ion-toolbar>
            <div class="userItem" :style="`background-image: url('${avatar}');`">
                <div class="userItem_content">
                    <img class="avatar" :src="avatar" ref="avatar"/>
                    <div class="userData">
                        <h3>{{userData.student.name}}</h3>
                        <p v-if="userData.class.school.trim() != ''">{{userData.class.name}} • {{userData.class.school}}</p>
                    </div>
                </div>
            </div>
          </ion-toolbar>
        </ion-header>
        <ion-content mode="md">
          <ion-list id="inbox-list"> 
            <router-link class="navLink" :to="`${p.url}`" v-for="(p, i) in appPages" :key="i">
                <ion-item button mode="md" lines="none" :detail="false" @click="selectedIndex = i" :class="{ selected: selectedIndex === i }">
                    <span class="material-symbols-outlined mdls" slot="start">{{ p.icon }}</span>
                    <ion-label>{{ p.title }}</ion-label>
                </ion-item>
            </router-link>
          </ion-list>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content" v-slot="{ Component }" animated="false">
        <keep-alive>
            <component :is="Component" />
        </keep-alive>
    </ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<style scoped>
    .navLink {
        text-decoration: none;
    }


    .userItem {
        display: flex;
        padding: 0px;
        align-items: center;

        background-size: cover;
        background-position: center;
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
        -webkit-backdrop-filter: blur(10px);
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

    .ios .userItem h3 {
        font-size: 18px;
        margin-bottom: 0;
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
        font-size: 15px;
        margin-top: 0;
        font-family: var(--papillon-font);
    }


    .md .userItem_content {
        flex-direction: column;
        align-items: flex-start;
        padding: 16px 16px;
        color: #fff;
    }

    .md .userItem h3 {
        font-size: 20px;
    }

    .md .userItem p {
        color: #ffffffc2;
    }

    .md .userData {
        width: calc(100%);
    }

    .ios .userItem {
        background-image: none !important;
    }

    .ios .userItem_content {
        background-color: #ffffff00;
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
        border-radius: 6px;
        isolation: isolate;
    }

    ion-menu ion-item {
        color: var(--ion-color-step-500);
        margin-bottom: 2px;
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
</style>
