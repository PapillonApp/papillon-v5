<template>
    <ion-page>
        <ion-nav :root="component" ref="page"></ion-nav>
    </ion-page>
</template>
  
<script lang="ts">
    import { IonNav, IonPage } from '@ionic/vue';
    import SettingsView from './SettingsView.vue';
  
    export default {
      components: { IonNav, IonPage },
      data() {
        return {
          component: SettingsView,
        };
      }
    };
</script>

<style scoped>
    
</style>