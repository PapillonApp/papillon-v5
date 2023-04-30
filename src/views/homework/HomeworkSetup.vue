<template>
    <ion-nav :root="component" ref="page"></ion-nav>
</template>
  
<script lang="ts">
    import { IonNav } from '@ionic/vue';
    import HomeworksView from './HomeworkView.vue';
  
    export default {
      components: { IonNav },
      data() {
        return {
          component: HomeworksView,
        };
      }
    };
</script>

<style scoped>
    
</style>