<script>
	import {
		defineComponent
	} from 'vue';
	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonItem,
		IonLabel,
        IonButtons,
        IonTitle,
        IonContent,
	} from '@ionic/vue';

	import displayToast from '@/functions/utils/displayToast.js';
    import PapillonBackButton from '@/components/PapillonBackButton.vue';

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
            IonTitle,
            IonContent,
		},
		data() {
			return {
                
			}
		},
		methods: {
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
            return false;
        }
	});
</script>

<template>
		<IonHeader class="AppHeader" collapse="fade" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<PapillonBackButton></PapillonBackButton>
				</ion-buttons>

				<ion-title mode="md">Personnaliser mon profil</ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
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
                        <p>Utiliser la photo de profil par défaut</p>
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