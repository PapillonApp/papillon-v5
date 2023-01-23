<template>
    <ion-page>
        <ion-nav ref="nav" :root="component"></ion-nav>
    </ion-page>
</template>
  
<script lang="ts">
    import { defineComponent } from 'vue';
    import { IonPage, IonContent, IonNav } from '@ionic/vue';
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
            // make nav globally available
            (window as any).nav = this.$refs.nav;
        },
    });
</script>