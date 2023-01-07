<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage } from '@ionic/vue';

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
        },
        data() {
            return { 

            }
        },
        methods: {

        },
        mounted() {

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

          <ion-title mode="md">Vue d'ensemble</ion-title>
        </IonToolbar>
      </IonHeader>
      
      <ion-content :fullscreen="true">
        <IonHeader collapse="condense">
            <IonToolbar>
                <ion-title size="large">Vue d'ensemble</ion-title>
            </IonToolbar>
        </IonHeader>

		

      </ion-content>
    </ion-page>
</template>
  
<style scoped>

</style>
