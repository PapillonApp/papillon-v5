<template>
  <ion-page>
    <ion-nav :root="component" ref="page"></ion-nav>
  </ion-page>
</template>
  
<script lang="ts">
    import { IonNav, IonPage } from '@ionic/vue';
    import HomeworksView from './HomeworkView.vue';
  
    export default {
      components: { IonNav, IonPage },
      data() {
        return {
          component: HomeworksView,
        };
      }
    };
</script>

<style scoped>
    
</style>