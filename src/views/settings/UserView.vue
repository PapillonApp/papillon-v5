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

    const FastAverageColor = require('fast-average-color').FastAverageColor;
    const fac = new FastAverageColor();

    import { FilePicker } from '@capawesome/capacitor-file-picker';

    import { Dialog } from '@capacitor/dialog';

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

                        fac.getColorAsync(newImage)
                            .then(color => {
                                localStorage.setItem('averageColorCustom', JSON.stringify(color));
                                
                                document.dispatchEvent(new CustomEvent('averageColorUpdated'));
                            })
                            .catch(e => {
                                console.log(e);
                            });

                        displayToast.presentNativeToast(
                            'Photo de profil modifiée.'
                        );
                    }
                }
                catch (error) {
                    console.error("[Change Avatar]: " + error);
                    displayToast.presentNativeToast(
                        'Erreur lors du changement de photo de profil.'
                    );
                }
            },
            tweakDeleteAvatar() {
                localStorage.removeItem('customAvatar');
                localStorage.removeItem('averageColorCustom');
                document.dispatchEvent(new CustomEvent('userDataUpdated'));

                displayToast.presentNativeToast(
                    'Photo de profil supprimée.'
                );
            },
            tweakChangeName() {
                // get current name
                let currentName = JSON.parse(localStorage.getItem("userData")).student.name;
                
                // if custom name is set, use it
                if (localStorage.getItem("customName")) {
                    currentName = localStorage.getItem("customName");
                }

                // ask for new name
                Dialog.prompt({
                    title: 'Changer de nom',
                    message: 'Entrez votre nouveau nom',
                    inputPlaceholder: currentName,
                    okButtonTitle: 'Valider',
                    cancelButtonTitle: 'Annuler'
                }).then(result => {
                    if (result.value) {
                        localStorage.setItem('customName', result.value);
                        document.dispatchEvent(new CustomEvent('userDataUpdated'));

                        displayToast.presentNativeToast(
                            'Nom modifié pour ' + result.value + '.'
                        );
                    }
                });
            },
            tweakDeleteName() {
                localStorage.removeItem('customName');
                document.dispatchEvent(new CustomEvent('userDataUpdated'));

                displayToast.presentNativeToast(
                    'Nom supprimé.'
                );
            }
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

            <IonList inset>
                <IonItem button @click="tweakChangeName()">
                    <span class="material-symbols-outlined mdls" slot="start">drive_file_rename_outline</span>
                    <IonLabel>
                        <h2>Changer de nom</h2>
                        <p>Utiliser un nom différent dans l'application</p>
                    </IonLabel>
                </IonItem>
                <IonItem button @click="tweakDeleteName()">
                    <span class="material-symbols-outlined mdls" slot="start">delete</span>
                    <IonLabel>
                        <h2>Réinitialiser le nom utilisé</h2>
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