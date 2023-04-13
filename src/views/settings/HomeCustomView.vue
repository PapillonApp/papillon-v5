<script>
import { defineComponent } from 'vue';
import { IonHeader, IonContent, IonToggle, IonToolbar, IonTitle, IonMenuButton, IonPage, IonButtons, IonList, IonListHeader, IonLabel, IonItem, actionSheetController, IonNavLink, IonChip, IonSkeletonText, IonAvatar } from '@ionic/vue';
import PapillonBackButton from '@/components/PapillonBackButton.vue';
import hapticsController from '@/functions/utils/hapticsController.js';

export default defineComponent({
    name: 'FolderPage',
    components: {
        IonHeader,
        IonToolbar,
        IonButtons,
        PapillonBackButton,
        IonToggle,
        IonItem,
        IonLabel,
        IonTitle,
        IonContent
    },
    methods: {
        tickClick() {
            hapticsController.impact({
                style: 'light'
            });
        },
        changeTick(option) {
            this.tickClick();

            let el = this.$refs[option];
            let elChecked = el.$el.checked;

            localStorage.setItem(option, elChecked);

            document.dispatchEvent(new CustomEvent('settingsUpdated'));
        },
    },
    mounted() {
        let displayNextCourse = this.$refs.displayNextCourse;
        displayNextCourse.$el.checked = localStorage.getItem('displayNextCourse') == 'true';
    }
});
</script>

<template>
    <IonHeader class="AppHeader" translucent>
        <IonToolbar>
            <ion-buttons slot="start">
                <PapillonBackButton></PapillonBackButton>
            </ion-buttons>

            <ion-title mode="md">Personnalisation de l'écran d'accueil</ion-title>
        </IonToolbar>
    </IonHeader>
    <ion-content :fullscreen="true">
        <IonList :inset="true" lines="none">
            <IonItem>
                <span class="material-symbols-outlined mdls" slot="start">book-outline</span>
                <IonLabel class="ion-text-wrap">
                    <h2>Afficher le prochain cours</h2>
                    <p>Affiche le prochain cours en haut de l'écran d'accueil</p>
                </IonLabel>
                <IonToggle slot="end" ref="displayNextCourse" @ionChange="changeTick('displayNextCourse')"></IonToggle>
            </IonItem>
        </IonList>
    </ion-content>
</template>