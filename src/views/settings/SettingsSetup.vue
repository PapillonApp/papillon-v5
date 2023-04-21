<template>
    <ion-nav :root="component" ref="page"></ion-nav>
</template>
  
<script lang="ts">
  console.log("loginsetup used")
    import { IonNav } from '@ionic/vue';
    import SettingsView from './SettingsView.vue';
  
    export default {
      components: { IonNav },
      data() {
        return {
          component: SettingsView,
        };
      }
    };
</script>

<style scoped>
    
</style>