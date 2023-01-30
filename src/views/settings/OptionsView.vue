<script>
	import {
		defineComponent
	} from 'vue';
	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonListHeader,
		IonItem,
		IonLabel,
        IonToggle,
        IonButtons,
        IonTitle,
        IonContent,
	} from '@ionic/vue';

	import displayToast from '@/functions/utils/displayToast.js';
    import PapillonBackButton from '@/components/PapillonBackButton.vue';

    import { trash, refresh, checkmark, alertCircle } from 'ionicons/icons';

    import { FilePicker } from '@capawesome/capacitor-file-picker';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
            IonButtons,
            PapillonBackButton,
            IonList,
            IonItem,
            IonLabel,
            IonToggle,
            IonTitle,
            IonContent,
            IonListHeader,
		},
		data() {
			return {
                
			}
		},
		methods: {
            changeTick(option) {
                let el = this.$refs[option];
                let elChecked = el.$el.checked;

                localStorage.setItem(option, elChecked);

                document.dispatchEvent(new CustomEvent('settingsUpdated'));
            },
            tweakProgressBar() {
                let tweakProgressBar = this.$refs.tweakProgressBar;
                let tweakProgressBarChecked = tweakProgressBar.$el.checked;

                localStorage.setItem('tweakProgressBar', tweakProgressBarChecked);

                document.dispatchEvent(new CustomEvent('settingsUpdated'));
            },
            tweakProgressBarShowPast() {
                let tweakProgressBarShowPast = this.$refs.tweakProgressBarShowPast;
                let tweakProgressBarShowPastChecked = tweakProgressBarShowPast.$el.checked;

                localStorage.setItem('tweakProgressBarShowPast', tweakProgressBarShowPastChecked);

                document.dispatchEvent(new CustomEvent('settingsUpdated'));
            },
            changeGroupSubjects() {
                this.changeTick('groupSubjects');
                if (localStorage.getItem('groupSubjects') == 'true') {
                    displayToast.presentNativeToast(
                        'Les matières sont désormais regroupées'
                    );
                } else {
                    localStorage.removeItem('excludedGroupSubjects');
                    displayToast.presentNativeToast(
                        'Les matières sont désormais séparées'
                    );
                }
            },
		},
		mounted() {
            // get tweakGrades20 ref
            let tweakGrades20 = this.$refs.tweakGrades20;
            tweakGrades20.$el.checked = localStorage.getItem('tweakGrades20') == 'true';

            // get viescolaireEnabled ref
            let viescolaireEnabled = this.$refs.viescolaireEnabled;
            viescolaireEnabled.$el.checked = localStorage.getItem('viescolaireEnabled') == 'true';

            // get changePeriodSelection ref
            let changePeriodSelection = this.$refs.changePeriodSelection;
            changePeriodSelection.$el.checked = localStorage.getItem('changePeriodSelection') == 'true';

            // get tweakProgressBar ref
            let tweakProgressBar = this.$refs.tweakProgressBar;
            tweakProgressBar.$el.checked = localStorage.getItem('tweakProgressBar') == 'true';

            // get tweakProgressBarShowPast ref
            let tweakProgressBarShowPast = this.$refs.tweakProgressBarShowPast;
            tweakProgressBarShowPast.$el.checked = localStorage.getItem('tweakProgressBarShowPast') != 'false'; // default true



            // get joinSubjects ref
            let joinSubjects = this.$refs.joinSubjects;
            joinSubjects.$el.checked = localStorage.getItem('joinSubjects') == 'true';
            // get groupSubjects ref
            let groupSubjects = this.$refs.groupSubjects;
            groupSubjects.$el.checked = localStorage.getItem('groupSubjects') == 'true';
        }
	});
</script>

<template>
		<IonHeader class="AppHeader" collapse="fade" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<PapillonBackButton></PapillonBackButton>
				</ion-buttons>

				<ion-title mode="md">Options</ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
            <IonList :inset="true" lines="inset">
                <ion-list-header>
                    <ion-label>
                        Tweaks
                        <p>Ces options permettent de modifier le comportement de certaines fonctionnalités.</p>
                    </ion-label>
                </ion-list-header>

                <IonItem>
                    <span class="material-symbols-outlined mdls" slot="start">nest_thermostat_zirconium_eu</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Remettre les notes sur 20</h2>
                        <p>Uniformise le barème de toutes les notes</p>
                    </IonLabel>
                    <IonToggle slot="end" ref="tweakGrades20" @ionChange="changeTick('tweakGrades20')"></IonToggle>
                </IonItem>

                <IonItem>
                    <span class="material-symbols-outlined mdls" slot="start">join_inner</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Joindre les matières identiques</h2>
                        <p>Permet de joindre les matières identiques entre-elle</p>
                    </IonLabel>
                    <IonToggle slot="end" ref="groupSubjects" @ionChange="changeGroupSubjects('groupSubjects')"></IonToggle>
                </IonItem>
            </IonList>

            <IonList :inset="true" lines="inset">
                <ion-list-header>
                    <ion-label>
                        Expérimental
                        <p>Ces options risquent de ne pas fonctionner correctement.</p>
                    </ion-label>
                </ion-list-header>

                <IonItem>
                    <span class="material-symbols-outlined mdls" slot="start">toggle_off</span>
                    <IonLabel class="ion-text-wrap">
                        <h5>Onglet notes</h5>
                        <h2>Activer la séléction de période</h2>
                        <p>Permet de changer de trimestre/semestre</p>
                    </IonLabel>
                    <IonToggle slot="end" ref="changePeriodSelection" @ionChange="changeTick('changePeriodSelection')"></IonToggle>
                </IonItem>

                <IonItem>
                    <span class="material-symbols-outlined mdls" slot="start">gavel</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Activer l'onglet vie scolaire</h2>
                        <p>Active l'onglet de vie scolaire</p>
                    </IonLabel>
                    <IonToggle slot="end" ref="viescolaireEnabled" @ionChange="changeTick('viescolaireEnabled')"></IonToggle>
                </IonItem>
            </IonList>

            <IonList :inset="true" lines="inset">
                <IonItem button @click="tweakChangeAvatar()">
                    <span class="material-symbols-outlined mdls" slot="start">person_pin</span>
                    <IonLabel>
                        <h2>Changer de photo de profil</h2>
                        <p>Utiliser une photo différente dans l'application</p>
                    </IonLabel>
                </IonItem>

                <IonItem button @click="tweakDeleteAvatar()">
                    <span class="material-symbols-outlined mdls" slot="start">delete</span>
                    <IonLabel>
                        <h2>Supprimer la photo de profil personnalisée</h2>
                    </IonLabel>
                </IonItem>
            </IonList>
		</ion-content>
</template>

<style scoped>
	.md .paddingFixMd {
        padding-left: 15px;
    }
</style>