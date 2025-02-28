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
        IonBackButton
	} from '@ionic/vue';

	import displayToast from '@/functions/utils/displayToast.js';

    import { checkmarkOutline, informationOutline, closeOutline } from 'ionicons/icons';

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
            IonBackButton,
            IonList,
            IonItem,
            IonLabel,
            IonTitle,
            IonContent,
		},
		data() {
            let backTitle = 'Retour';

			// get current route
			const currentRoute = this.$router.currentRoute.value;

			if(currentRoute.name == "Settings") {
				backTitle = 'Paramètres';
			}
            else if(currentRoute.name == "Home") {
				backTitle = 'Vue d\'ensemble';
			}

			return {
                backTitle: backTitle,
			}
		},
		methods: {
            pop() {
                return false;
            },
            async tweakChangeAvatar() {
                try {
                    const result = await FilePicker.pickImages({
                        multiple: false,
                        readData: true
                    });

                    const base64Data = result.files[0].data;

                    const base64URL = 'data:image/jpeg;base64,' + base64Data;

                    // resize image to 200px width using canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.src = base64URL;

                    img.onload = function () {
                        canvas.width = 128;
                        canvas.height = 128 * img.height / img.width;

                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        const newImage = canvas.toDataURL('image/jpeg');

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

                            displayToast.presentToastSmall("Photo de profil modifiée", "success", checkmarkOutline)
                    }
                }
                catch (error) {
                    console.error("[Change Avatar]: " + error);
                    displayToast.presentToastFull('Erreur lors du changement de photo de profil.', "Veuillez réessayer.", "danger", closeOutline, true, String(error));
                }
            },
            tweakDeleteAvatar() {
                if(!localStorage.getItem('customAvatar')) return displayToast.presentToastSmall("Photo de profil non définie", "tertiary", informationOutline)
                localStorage.removeItem('customAvatar');
                localStorage.removeItem('averageColorCustom');
                document.dispatchEvent(new CustomEvent('userDataUpdated'));

                displayToast.presentToastSmall("Photo de profil supprimée", "success", checkmarkOutline)
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

                        displayToast.presentToastSmall("Nom modifié", "success", checkmarkOutline)
                    }
                    else {
                        displayToast.presentToastSmall("Annulé", "tertiary", informationOutline)
                    }
                });
            },
            tweakDeleteName() {
                if(!localStorage.getItem('customName')) return displayToast.presentToastSmall("Aucun nom défini", "tertiary", informationOutline)
                localStorage.removeItem('customName');
                document.dispatchEvent(new CustomEvent('userDataUpdated'));

                displayToast.presentToastSmall("Nom supprimé", "success", checkmarkOutline)
            }
		},
		mounted() {
            return false;
        }
	});
</script>

<template>
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>

                <ion-buttons slot="start">
                    <IonBackButton class="only-ios" :text="backTitle" @click="pop"></IonBackButton>
                    <IonBackButton class="only-md" @click="pop"></IonBackButton>
                </ion-buttons>

				<ion-title>Profil</ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
            <ion-header collapse="condense">
				<ion-toolbar>
					<ion-title size="large">Profil</ion-title>
				</ion-toolbar>
			</ion-header>

            <IonLabel class="listGroupTitle">
				<p>Photo de profil</p>
			</IonLabel>

            <IonList class="listGroup" lines="inset">
                <IonItem button @click="tweakChangeAvatar()">
                    <span class="material-symbols-outlined mdls" slot="start">person_pin</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Changer de photo de profil</h2>
                        <p>Utiliser une photo différente dans l'application</p>
                    </IonLabel>
                </IonItem>

                <IonItem button @click="tweakDeleteAvatar()">
                    <span class="material-symbols-outlined mdls" slot="start">delete</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Supprimer la photo de profil personnalisée</h2>
                        <p>Utiliser la photo de profil par défaut</p>
                    </IonLabel>
                </IonItem>
            </IonList>
            
            <IonLabel class="listGroupTitle">
				<p>Nom utilisé</p>
			</IonLabel>

            <IonList class="listGroup" lines="inset">
                <IonItem button @click="tweakChangeName()">
                    <span class="material-symbols-outlined mdls" slot="start">drive_file_rename_outline</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Changer de nom</h2>
                        <p>Utiliser un nom différent dans l'application</p>
                    </IonLabel>
                </IonItem>
                <IonItem button @click="tweakDeleteName()">
                    <span class="material-symbols-outlined mdls" slot="start">delete</span>
                    <IonLabel class="ion-text-wrap">
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