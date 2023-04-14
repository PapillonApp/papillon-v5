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

            let el = this.$refs[option][0].$el;
            let elChecked = el.checked;
            localStorage.setItem(this.toggles[option.split('toggle')[1]].name, elChecked);

            document.dispatchEvent(new CustomEvent('settingsUpdated'));
        },
        checkToggles() {
            let i = 0;
            this.toggles.forEach(toggle => {
                console.log(this.$refs['toggle' + i])
                let toggleRef = this.$refs['toggle' + i][0].$el;
                toggleRef.checked = localStorage.getItem(toggle.name) == 'true';
                i++;
            })
        }
    },
    data() {
        return {
            toggles: [
                {
                    name: 'displayNextCourse',
                    label: 'Afficher le prochain cours',
                    description: 'Affiche le prochain cours en haut de l\'écran d\'accueil',
                    icon: 'book'
                },
                {
                    name: 'displayNews',
                    label: 'Afficher les actus',
                    description: 'Affiche les actualités sur l\'écran d\'accueil',
                    icon: 'feed'
                },
                {
                    name: 'displayLastGrades',
                    label: 'Afficher les dernières notes',
                    description: 'Affiche les dernières notes sur l\'écran d\'accueil',
                    icon: 'star'
                },
                {
                    name: 'displayAvatar',
                    label: 'Afficher votre photo de profil',
                    description: 'Affiche votre avatar Pronote en haut de l\'écran d\'accueil',
                    icon: 'person'
                },
                {
                    name: 'displayFirstName',
                    label: 'Afficher votre nom de famille',
                    description: 'Choisissez d\'afficher ou non votre nom de famille sur l\'écran d\'accueil',
                    icon: 'badge'
                }
            ]
        };
    },
    mounted() {
        this.checkToggles();
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
            <IonItem v-for="(toggle, index) in toggles" :key="toggle.name">
                <span class="material-symbols-outlined mdls" slot="start">{{toggle.icon}}</span>
                <IonLabel class="ion-text-wrap">
                    <h2>{{toggle.label}}</h2>
                    <p>{{toggle.description}}</p>
                </IonLabel>
                
                <IonToggle slot="end" :ref="'toggle' + index" @ionChange="changeTick('toggle' + index)"></IonToggle>
            </IonItem>
        </IonList>
    </ion-content>
</template>