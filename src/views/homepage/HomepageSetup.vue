<template>
    <ion-page>
        <ion-nav @ionNavDidChange="navDidChange" @ionNavWillChange="navWillChange" :root="component" ref="page"></ion-nav>
    </ion-page>
</template>
  
<script lang="ts">
    import { IonNav, IonPage } from '@ionic/vue';
    import HomepageView from './HomepageView.vue';

    //import { StatusBar, Style } from '@capacitor/status-bar';

    //let inner = true;
  
    export default {
      components: { IonNav, IonPage },
      data() {
        return {
          component: HomepageView,
          changeTimeout: null as any
        };
      },
      methods: {
        navWillChange() {
          return false;
        },
        navDidChange() {
          return false;
        }
      },
      mounted() {
        return false;
      }
    };
</script>

<style scoped>
    
</style>