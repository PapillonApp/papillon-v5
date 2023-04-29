<template>
    <ion-page>
        <ion-nav :root="component" ref="page"></ion-nav>
    </ion-page>
</template>
  
<script lang="ts">
    import { IonNav, IonPage } from '@ionic/vue';
    import TimetableView from './TimetableView.vue';
  
    export default {
      components: { IonNav, IonPage },
      data() {
        return {
          component: TimetableView,
        };
      }
    };
</script>

<style scoped>
    
</style>