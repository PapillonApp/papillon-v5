<template>
    <ion-page>
        <ion-nav :root="component"></ion-nav>
    </ion-page>
</template>
  
<script lang="ts">
    import { IonPage, IonContent, IonNav } from '@ionic/vue';
    import SettingsView from './SettingsView.vue';
  
    export default {
        components: {
            IonNav,
            IonPage,
        },
        data() {
            return {
                component: SettingsView,
            };
        },
    };
</script>