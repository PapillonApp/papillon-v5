<template>
    <ion-nav :root="component" ref="page"></ion-nav>
</template>
  
<script lang="ts">
    import { IonNav } from '@ionic/vue';
    import LoginWelcome from './LoginWelcome.vue';
  
    export default {
      components: { IonNav },
      data() {
        return {
          component: LoginWelcome,
        };
      }
    };
</script>

<style scoped>
    
</style>