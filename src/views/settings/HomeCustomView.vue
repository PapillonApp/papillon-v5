<script>
import { defineComponent } from 'vue';
import { IonHeader, IonContent, IonList, IonToggle, IonToolbar, IonTitle, IonButtons, IonLabel, IonItem, IonBackButton} from '@ionic/vue';
import hapticsController from '@/functions/utils/hapticsController.js';

export default defineComponent({
    name: 'FolderPage',
    components: {
        IonHeader,
        IonToolbar,
        IonButtons,
        IonBackButton,
        IonToggle,
        IonItem,
        IonLabel,
        IonTitle,
        IonContent,
        IonList
    },
    methods: {
        pop() {
            return false;
        },
        tickClick() {
            hapticsController.impact({
                style: 'light'
            });
        },
        changeTick(option) {
            this.tickClick();

            const el = this.$refs[option][0].$el;
            const elChecked = el.checked;
            localStorage.setItem(this.toggles[option.split('toggle')[1]].name, elChecked);

            document.dispatchEvent(new CustomEvent('settingsUpdated'));
        },
        checkToggles() {
            let i = 0;
            this.toggles.forEach(toggle => {
                const toggleRef = this.$refs['toggle' + i][0].$el;
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
                },
                {
                    name: 'displayHomeworks',
                    label: 'Afficher le travail à faire',
                    description: 'Affiche les prochains devoirs à rendre',
                    icon: 'work'
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
    <IonHeader class="AppHeader" translucent >
        <IonToolbar>
            <ion-buttons slot="start">
                <IonBackButton class="only-ios" text="Paramètres" @click="pop"></IonBackButton>
                <IonBackButton class="only-md" @click="pop"></IonBackButton>
            </ion-buttons>

            <ion-title>Écran d'accueil</ion-title>
        </IonToolbar>
    </IonHeader>
    <ion-content :fullscreen="true">
        <ion-header collapse="condense">
			<ion-toolbar>
				<ion-title size="large">Écran d'accueil</ion-title>
			</ion-toolbar>
		</ion-header>

        <IonLabel class="listGroupTitle">
			<p>Sélectionnez les élements</p>
		</IonLabel>

        <IonList class="listGroup">
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

<style scoped>
	ion-item .mdls[slot=start] {
		width: auto;
		padding: 7px;
		background-color: #00000012;
		border-radius: 300px;

		margin-right: 20px;
	}

	.dark ion-item .mdls[slot=start] {
		background-color: #ffffff22;
	}
</style>