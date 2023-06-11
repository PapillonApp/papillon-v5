<template>
    <ion-page>
      <ion-nav :root="component" ref="page"></ion-nav>
    </ion-page>
  </template>
    
  <script lang="ts">
      import { IonNav, IonPage } from '@ionic/vue';
      import SchoollifeView from './SchoollifeView.vue';
    
      export default {
        components: { IonNav, IonPage },
        data() {
          return {
            component: SchoollifeView,
          };
        }
      };
  </script>
  
  <style scoped>
      
  </style>