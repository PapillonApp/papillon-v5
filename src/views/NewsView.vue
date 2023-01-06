<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonButtons, IonButton, IonList, IonListHeader, IonLabel, IonItem, IonModal, IonCard } from '@ionic/vue';
    
    import { calendarOutline } from 'ionicons/icons';

    import {version} from '/package'
    import { Capacitor } from '@capacitor/core';

    import GetToken from '@/functions/login/GetToken.js';
    import GetNews from '@/functions/fetch/GetNews.js';

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
            IonButton,
            IonItem,
            IonLabel,
            IonModal,
            IonList
        },
        data() {
            return { 
                news: [],
                openedNews: [],
                presentingElement: null,
            }
        },
        methods: {
            openNews(news) {
                this.openedNews = news;
                
                // open modal with ref
                this.$refs.modal.$el.present();
            },
            closeNews() {
                this.$refs.modal.$el.dismiss();
            },
            getNewsRefresh() {
                GetNews().then((data) => {
                    this.news = data;
                })
            },
            handleRefresh(event) {
                // get new News data
                this.getNewsRefresh()

                // stop refresh when this.news is updated
                this.$watch('news', () => {
                    setTimeout(() => {
                        event.target.complete();
                    }, 200);
                });
            },
        },
        mounted() {
            this.presentingElement = this.$refs.page.$el;

            GetNews().then((data) => {
                this.news = data;
            });

            return false;
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

          <ion-title mode="md">Actualités</ion-title>
        </IonToolbar>
      </IonHeader>
      
      <ion-content :fullscreen="true">
        <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
            <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <IonHeader collapse="condense">
            <IonToolbar>
                <ion-title size="large">Actualités</ion-title>
            </IonToolbar>
        </IonHeader>

        <IonList>
            <IonItem button v-for="(news, i) in news" v-bind:key="i" @click="openNews(news)">
                <span class="material-symbols-outlined mdls" slot="start">feed</span>
                    <IonLabel>
                        <h2>{{ news.title }}</h2>
                        <p>{{ news.author }} - {{ news.category }}</p>
                        <small>{{ news.dateString }}</small>
                    </IonLabel>
            </IonItem>
        </IonList>

        <IonModal :presenting-element="presentingElement" :canDismiss="true" ref="modal">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{{ openedNews.title }}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton @click="closeNews()">Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent class="newsModalContent ion-padding">
                <h1>{{ openedNews.title }}</h1>
                <small>de {{ openedNews.author }} - {{ openedNews.dateString }}</small>
                <hr />
                <div class="newsModalContentContent" v-html="openedNews.htmlContent"></div>
            </IonContent>
        </IonModal>
      </ion-content>
    </ion-page>
</template>
  
<style scoped>
    .newsModalContent * {
        margin: 0;
    }

    .newsModalContent hr {
        margin: 15px 0px;
        background: #000;
        opacity: 25%;
    }

    @media screen and (prefers-color-scheme: dark) {
        .newsModalContent hr {
            background: #fff !important;
        }
    }

    .newsModalContent h1 {
        font-size: 1.5em;
        font-weight: 300 !important;
    }

    .newsModalContent small {
        font-size: 0.8em;
        font-weight: 500;
        opacity: 0.5;
    }

    .newsModalContentContent {
        zoom: 1.2;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
</style>
