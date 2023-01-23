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
            async tweakChangeAvatar() {
                try {
                    const result = await FilePicker.pickImages({
                        multiple: false,
                        readData: true
                    });

                    let base64Data = result.files[0].data;

                    let base64URL = 'data:image/jpeg;base64,' + base64Data;

                    // resize image to 200px width using canvas
                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext('2d');
                    let img = new Image();
                    img.src = base64URL;

                    img.onload = function () {
                        canvas.width = 128;
                        canvas.height = 128 * img.height / img.width;

                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        let newImage = canvas.toDataURL('image/jpeg');

                        localStorage.setItem('customAvatar', newImage);
                        document.dispatchEvent(new CustomEvent('userDataUpdated'));

                        displayToast.presentNativeToast(
                            'Photo de profil modifiée.'
                        );
                    }
                }
                catch (error) {
                    console.error(error);
                    displayToast.presentNativeToast(
                        'Erreur lors du changement de photo de profil.'
                    );
                }
            },
            tweakDeleteAvatar() {
                localStorage.removeItem('customAvatar');
                document.dispatchEvent(new CustomEvent('userDataUpdated'));

                displayToast.presentNativeToast(
                    'Photo de profil supprimée.'
                );
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
                <IonItem>
                    <span class="material-symbols-outlined mdls" slot="start">nest_thermostat_zirconium_eu</span>
                    <IonLabel>
                        <h2>Remettre les notes sur 20</h2>
                        <p>Uniformise le barème de toutes les notes</p>
                    </IonLabel>
                    <IonToggle slot="end" ref="tweakGrades20" @ionChange="changeTick('tweakGrades20')"></IonToggle>
                </IonItem>

                <IonItem>
                    <span class="material-symbols-outlined mdls" slot="start">toggle_off</span>
                    <IonLabel>
                        <h5>Onglet notes</h5>
                        <h2>Activer la séléction de période</h2>
                        <p>(Expérimental) Permet de changer de trimestre/semestre</p>
                    </IonLabel>
                    <IonToggle slot="end" ref="changePeriodSelection" @ionChange="changeTick('changePeriodSelection')"></IonToggle>
                </IonItem>

                <IonItem>
                    <span class="material-symbols-outlined mdls" slot="start">gavel</span>
                    <IonLabel>
                        <h2>Activer l'onglet vie scolaire</h2>
                        <p>(Expérimental) Active l'onglet de vie scolaire</p>
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