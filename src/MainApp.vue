<template>
    <ion-page>
        <!-- main navigation (contains router and menu) -->
        <ion-nav ref="nav" :root="component" :swipeGesture="true"></ion-nav>
    </ion-page>
</template>
  
<script lang="ts">
    import { defineComponent } from 'vue';
    import { IonPage, IonNav } from '@ionic/vue';
    import App from './App.vue';
  
    export default defineComponent({
        components: {
            IonNav,
            IonPage,
        },
        data() {
            return {
                component: App,
            };
        },
        mounted() {
            // make nav globally available to other components
            (window as any).nav = this.$refs.nav;
        },
    });
</script>