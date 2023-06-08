<script>
import { defineComponent } from 'vue';
import { IonHeader, IonContent, IonList, IonToolbar, IonTitle, IonButtons, IonLabel, IonItem, IonBackButton, IonItemOption, IonItemOptions, IonItemSliding, IonChip} from '@ionic/vue';
import hapticsController from '@/functions/utils/hapticsController.js';

export default defineComponent({
    name: 'FolderPage',
    components: {
        IonHeader,
        IonToolbar,
        IonButtons,
        IonBackButton,
        IonItem,
        IonLabel,
        IonTitle,
        IonContent,
        IonList,
        IonItemOption,
        IonItemOptions,
        IonItemSliding,
        IonChip
    },
    methods: {
        pop() {
            return false;
        },
        refreshColors() {
            this.SubjectColors = localStorage.getItem('SubjectColors') ? JSON.parse(localStorage.getItem('SubjectColors')) : [];
        },
        deleteSubject(subject) {
            const subjectColors = JSON.parse(localStorage.getItem('SubjectColors'));
            delete subjectColors[subject];
            localStorage.setItem('SubjectColors', JSON.stringify(subjectColors));
            
            hapticsController.impact('LIGHT');
            this.refreshColors();
        },
        inputColor(e, subject) {
            const newColor = e.target.value;
            const subjectColors = JSON.parse(localStorage.getItem('SubjectColors'));

            subjectColors[subject] = newColor;
            localStorage.setItem('SubjectColors', JSON.stringify(subjectColors));

            hapticsController.impact('LIGHT');
            this.refreshColors();
        },
        contrastCheck(hex) {
            const r = parseInt(hex.substr(1, 2), 16);
            const g = parseInt(hex.substr(3, 2), 16);
            const b = parseInt(hex.substr(5, 2), 16);
            const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

            return (yiq >= 180) ? 'black' : 'white';
        }
    },
    data() {
        return {
            SubjectColors: localStorage.getItem('SubjectColors') ? JSON.parse(localStorage.getItem('SubjectColors')) : [],
        }
    },
    mounted() {
        return false;
    }
});
</script>

<template>
    <IonHeader class="AppHeader" translucent >
        <IonToolbar>
            <ion-buttons slot="start">
                <IonBackButton class="only-ios" text="Apparence" @click="pop"></IonBackButton>
                <IonBackButton class="only-md" @click="pop"></IonBackButton>
            </ion-buttons>

            <ion-title>Matières</ion-title>
        </IonToolbar>
    </IonHeader>
    <ion-content :fullscreen="true">
        <ion-header collapse="condense">
			<ion-toolbar>
				<ion-title size="large">Couleur des matières</ion-title>
			</ion-toolbar>
		</ion-header>

        <IonList v-for="(color, index) in SubjectColors" :key="index" inset="true" lines="none">
            <ion-item-sliding>
                <IonItem button detail="false">
                    <IonLabel>
                        <h2>{{ index }}</h2>
                        <p>{{ color }}</p>
                    </IonLabel>

                    <div slot="end" class="picker">
                        <ion-chip class="small" color="warning" v-if="contrastCheck(color) == 'black'">
                            <span class="material-symbols-outlined mdls" >error</span>
                            Contraste faible
                        </ion-chip>

                        <input type="color" :value="color" @input="inputColor($event, index)"/>
                    </div>
                </IonItem>

                <ion-item-options side="end">
                    <ion-item-option @click="deleteSubject(index)" color="danger">Supprimer</ion-item-option>
                </ion-item-options>
            </ion-item-sliding>
        </IonList>
    </ion-content>
</template>

<style scoped>
    .picker {
        display: flex;
        gap: 10px;
        align-items: center;
    }
</style>