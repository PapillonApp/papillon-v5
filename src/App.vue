<script lang="ts">
  import { IonApp, IonContent, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonNote, IonRouterOutlet, IonHeader, IonToolbar, IonSplitPane, toastController } from '@ionic/vue';
  import { defineComponent, ref } from 'vue';
  import { useRoute } from 'vue-router';

  const GetUser = require('./functions/fetch/GetUserData');

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
        const labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
        
        const path = window.location.pathname.split('folder/')[1];
        if (path !== undefined) {
            selectedIndex.value = appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
        }
        
        const route = useRoute();
        
        return { 
            selectedIndex,
            appPages, 
            labels,
            isSelected: (url: string) => url === route.path ? 'selected' : ''
        }
    },
    methods: {
        async presentToast(msg: string) {
            const toast = await toastController.create({
                message: msg,
                duration: 2000,
                position: "bottom"
            });

            await toast.present();
        },
        getUserData() {
            // get user data
            GetUser.default().then((data: UserData) => {
                this.userData = data;
                this.avatar = data.student.avatar;

                // set userData in localStorage
                localStorage.userData = JSON.stringify(data);
            });
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

        // check if online
        window.addEventListener('online', () => {
            this.presentToast("Vous êtes maintenant reconnecté à Internet");
        });

        // check if offline
        window.addEventListener('offline', () => {
            this.presentToast("Vous êtes plus connecté à Internet");
        });

        if(!window.navigator.onLine) {
            this.presentToast("Vous êtes hors connexion.");
        }

        // if avatarCache is set, make it the avatar
        if(localStorage.getItem('avatarCache')) {
            this.avatar = localStorage.getItem('avatarCache') as string;
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
            <div class="userItem" :style="`background-image: url('${userData.student.avatar}');`">
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
            <ion-menu-toggle auto-hide="false" v-for="(p, i) in appPages" :key="i">
              <ion-item mode="md" @click="selectedIndex = i" router-direction="root" :router-link="p.url" lines="none" detail="false" class="hydrated" :class="{ selected: selectedIndex === i }">
                <span class="material-symbols-outlined mdls" slot="start">{{ p.icon }}</span>
                <ion-label>{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content" v-slot="{ Component }">
        <keep-alive>
            <component :is="Component" />
        </keep-alive>
    </ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<style scoped>
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
        font-size: 14px;
        color: #888;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        color: #ffffff99;
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

    ion-menu.md ion-content {
    --padding-start: 8px;
    --padding-end: 8px;
    --padding-top: 8px;
    --padding-bottom: 20px;
    }

    ion-menu.md ion-list {
    padding: 0px 0;
    }

    ion-menu.md ion-note {
    margin-bottom: 30px;
    }

    ion-menu.md ion-list-header,
    ion-menu.md ion-note {
    padding-left: 10px;
    }

    ion-menu.md ion-list#inbox-list ion-list-header {
    font-size: 22px;
    font-weight: 600;

    min-height: 20px;
    }

    ion-menu.ios ion-list#inbox-list ion-list-header {
    margin-top: 50px;
    }

    ion-menu.md ion-list#labels-list ion-list-header {
    font-size: 16px;

    margin-bottom: 18px;

    color: #757575;

    min-height: 26px;
    }

    ion-item *:not(span) {
        font-family: 'Papillon', sans-serif !important;
    }

    ion-menu.md ion-item {
    --padding-start: 10px;
    --padding-end: 10px;
    border-radius: 4px;
    }

    ion-menu.md ion-item.selected {
    --background: rgba(var(--ion-color-primary-rgb), 0.14);
    }

    ion-menu.md ion-item.selected ion-icon {
    color: var(--ion-color-primary);
    }

    ion-menu.md ion-item ion-icon {
    color: var(--color);
    }

    ion-menu.md ion-item ion-label {
    font-weight: 500;
    }

    ion-menu.ios ion-content {
    --padding-bottom: 20px;
    }

    ion-menu.ios ion-list {
    padding: 8px 0 0 0;
    }

    ion-menu.ios ion-note {
    line-height: 24px;
    margin-bottom: 20px;
    }

    ion-menu.ios ion-item {
    --padding-start: 16px;
    --padding-end: 16px;
    --min-height: 50px;
    }

    ion-menu.ios ion-item.selected ion-icon {
    color: var(--ion-color-primary);
    }

    ion-menu.ios ion-item ion-icon {
    font-size: 24px;
    color: #73849a;
    }

    ion-menu.ios ion-list#labels-list ion-list-header {
    margin-bottom: 8px;
    }

    ion-menu.ios ion-list-header,
    ion-menu.ios ion-note {
    padding-left: 16px;
    padding-right: 16px;
    }

    ion-menu.ios ion-note {
    margin-bottom: 8px;
    }

    ion-note {
    display: inline-block;
    font-size: 16px;

    color: var(--ion-color-medium-shade);
    }

    ion-item.selected {
        --color: var(--ion-color-primary);
    }

    ion-item.selected:hover {
        background: rgba(var(--ion-color-primary-rgb), 0.1);
        cursor: pointer;
    }

    ion-menu-toggle ion-item:not(.selected) {
        --color: var(--ion-color-medium-shade);
    }

    ion-menu-toggle ion-item:not(.selected):hover {
        opacity: 0.75;
        cursor: pointer;
    }
</style>
