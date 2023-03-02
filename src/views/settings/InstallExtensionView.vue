<script>
	import { defineComponent } from 'vue';
	import { Capacitor } from '@capacitor/core';
	import { Device } from '@capacitor/device';
	import { Share } from '@capacitor/share';
	import displayToast from '@/functions/utils/displayToast.js';

	import { version, canal } from '/package'

	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonItem,
		IonButtons,
		IonLabel,
		IonContent,
		IonPage,
		IonTitle,
        IonInput,
        IonButton,

	} from '@ionic/vue';

	import PapillonBackButton from '@/components/PapillonBackButton.vue';
    import { app } from '@/main';
    import { addOutline } from 'ionicons/icons';


	export default defineComponent({
		name: 'InstallExtension',
		components: {
			IonHeader,
			IonToolbar,
			PapillonBackButton,
			IonButtons,
			IonLabel,
			IonItem,
			IonList,
			IonContent,
			IonTitle,
			IonPage,
            IonInput,
            IonButton,
		
		},
        data() {
            return {
                extensions: [],
                localRepo: app.config.globalProperties.$localRepo,
                url: "",
				warningCounter: 10,
				warningInterval : null
            }
        },
        mounted() {
            console.log(this.localRepo)
            this.extensions = this.localRepo.getExtensions()
        },

        methods: {
            installExtensionFromUrl(url) {
                console.log("installExtensionFromUrl")
                this.localRepo.installExtension(url)
                // return back 
                this.$router.back()
            },
			urlChanged() {
				this.warningCounter = 10
				if (this.warningInterval) {
					clearInterval(this.warningInterval)
				}
				this.warningInterval = setInterval(() => {
					this.warningCounter--
					if (this.warningCounter <= 0) {
						clearInterval(this.warningInterval)
					}
				}, 1000)
			}
        }

	});
</script>

<template>
	<ion-page ref="page">
		<IonHeader class="AppHeader" collapse="fade" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<PapillonBackButton></PapillonBackButton>
				</ion-buttons>

				<ion-title mode="md">Ajouter une extension</ion-title>

			

			</IonToolbar>


		</IonHeader>

		<ion-content :fullscreen="true">
            <ion-list class="addExtension">
                <ion-item mode="md" fill="solid" class="input">
                    <ion-label position="floating">URL de l'extension</ion-label>
                    <ion-input v-model="url" @ionChange="urlChanged"></ion-input>
                </ion-item>
				<ion-text color="danger">
					<p>ATTENTION ! installer une extension depuis une URL non fiable peut être dangereux. Papillon ne peut être tenu responsable des extensions installées. <span v-if="url.length>0 && warningCounter>0"><br><b>Veuillez confirmer votre choix en cliquant sur le bouton "Installer" dans <b>{{warningCounter}}</b> secondes.</b></span></p>
				</ion-text>
				<ion-button mode="md" expand="block" @click="installExtensionFromUrl(url)" :disabled="url == '' || warningCounter > 0">Installer</ion-button>
            </ion-list>
		</ion-content>
	</ion-page>
</template>

<style scoped>
	.md .paddingFixMd {
		padding-left: 15px;
	}

	.addExtension {
		margin: 10px 20px;
	}

	.addExtension input::part(native) {
		--border-top-left-radius: 8px;
		--border-top-right-radius: 8px;
	}

	.addExtension ion-button {
		--border-radius: 8px;
		margin-top: 10px;
	}
</style>