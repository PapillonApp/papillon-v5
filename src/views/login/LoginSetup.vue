<template>
    <ion-nav :root="component" ref="page"></ion-nav>
</template>
  
<script lang="ts">
    import { IonNav } from '@ionic/vue';
    import LoginView from './LoginView.vue';
  
    export default {
      components: { IonNav },
      data() {
        return {
          component: LoginView,
        };
      }
    };
</script>

<style scoped>
    
</style>