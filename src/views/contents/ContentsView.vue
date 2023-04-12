<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonButtons, IonList, IonLabel, IonItem, IonSpinner, IonSearchbar, IonNavLink } from '@ionic/vue';
    
    import { Browser } from '@capacitor/browser';

    import GetContents from '@/functions/fetch/GetContents.js';

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
            IonItem,
            IonLabel,
            IonList,
            IonSpinner,
            IonSearchbar,
        },
        data() {
            return { 
                content: [],
                fullContent: [],
                presentingElement: null,
                isLoading: false,
            }
        },
        methods: {
            async openLink(url) {
                await Browser.open({
                    url: url,
					toolbarColor: '#1e1e1e',
					presentationStyle: 'popover',
                });
            },
            searchContent() {
                return false;
            },
            handleRefresh(event) {
                // stop refresh when this.news is updated
                this.$watch('content', () => {
                    setTimeout(() => {
                        event.target.complete();
                    }, 200);
                });
            },
        },
        mounted() {
            this.presentingElement = this.$refs.page.$el;
            this.isLoading = true;

            GetContents();
        }
    });
</script>

<template>
    <ion-page ref="page">
      <IonHeader class="AppHeader" translucent>
        <IonToolbar>

          <ion-buttons slot="start">
            <ion-menu-button color="dark" mode="md"></ion-menu-button>
          </ion-buttons>

          <ion-title mode="md">Contenu des cours</ion-title>
        </IonToolbar>
        <IonToolbar>
            <ion-searchbar ref="searchBar" placeholder="Rechercher un cours..." @ionInput="searchContent()"></ion-searchbar>
        </IonToolbar>
      </IonHeader>
      
      <ion-content :fullscreen="true">
        <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
            <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <IonList>
            <IonItem>
                <IonSpinner></IonSpinner>
                <IonLabel>En cours de développement</IonLabel>
            </IonItem>
        </IonList>
      </ion-content>
    </ion-page>
</template>
  
<style scoped>
    
</style>
