<script lang="ts">
  import { IonApp, IonContent, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonNote, IonRouterOutlet, IonHeader, IonToolbar, IonSplitPane, toastController, IonTabs, IonTabBar, IonTabButton } from '@ionic/vue';

  import { defineComponent, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import { globeOutline } from 'ionicons/icons';

  const GetUser = require('./functions/fetch/GetUserData');
  const displayToast = require('./functions/utils/displayToast.js');

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
        IonTabs,
        IonTabBar,
        IonTabButton,
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
                title: 'Cours',
                url: '/timetable',
                icon: "calendar_month"
            },
            {
                title: 'Devoirs',
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
                title: 'Réglages',
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
    }
  });
</script>

<template>
  <ion-app>
    <ion-tabs>
        <!-- https://ionicframework.com/docs/vue/navigation#working-with-tabs -->
        <ion-router-outlet id="main-content" v-slot="{ Component }" animated="true">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </ion-router-outlet>

        <ion-tab-bar slot="bottom">

            <ion-tab-button :tab="`${p.url}`" :href="`${p.url}`" v-for="(p, i) in appPages" :key="i">
                <span class="material-symbols-outlined mdls">{{ p.icon }}</span>
                <ion-label>{{ p.title }}</ion-label>
            </ion-tab-button>

        </ion-tab-bar>
    </ion-tabs>
  </ion-app>
</template>

<style scoped>
    .ios ion-tab-bar {
        height: 56px !important;
    }

    .md ion-tab-bar {
        height: 64px !important;
    }
</style>
