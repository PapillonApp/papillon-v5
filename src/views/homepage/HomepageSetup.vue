<template>
    <ion-page>
        <ion-nav @ionNavDidChange="navDidChange" @ionNavWillChange="navWillChange" :root="component" ref="page"></ion-nav>
    </ion-page>
</template>
  
<script lang="ts">
    import { IonNav, IonPage } from '@ionic/vue';
    import HomepageView from './HomepageView.vue';

    import { StatusBar, Style } from '@capacitor/status-bar';
  
    export default {
      components: { IonNav, IonPage },
      data() {
        return {
          component: HomepageView,
          inner: true,
          changeTimeout: null as any
        };
      },
      methods: {
        invertStatus() {
            this.inner = !this.inner;

            if(this.inner) {
                StatusBar.setStyle({ style: Style.Default })
            }
            else {
                StatusBar.setStyle({ style: Style.Dark })
            }
        },
        navWillChange() {
            return false;
        },
        navDidChange() {
            this.invertStatus();
        }
      },
      mounted() {
        StatusBar.setStyle({ style: Style.Dark })
      }
    };
</script>

<style scoped>
    
</style>