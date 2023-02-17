<script>
    import { defineComponent } from 'vue';
    import { IonButton } from '@ionic/vue';

    export default defineComponent({
        name: 'PapillonBackButton',
        components: {
            IonButton,
        },
        methods: {
            pop() {
                window.nav.$el.pop()
            },
        },
    });
</script>

<template>
    <ion-button shape="round" color="dark" mode="md" @click="pop" class="back_button">
        <span class="material-symbols-outlined mdls" slot="start">arrow_back</span>
    </ion-button>
</template>

<style scoped>
    .back_button {
        height: 48px !important;
    }

    .back_button::part(native) {
        padding-left: 12px;
        padding-right: 8px;
    }
</style>