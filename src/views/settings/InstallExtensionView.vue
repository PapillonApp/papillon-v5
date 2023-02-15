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
                url: ""
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
                    <ion-input v-model="url"></ion-input>
                </ion-item>

				<ion-button mode="md" expand="block" @click="installExtensionFromUrl(url)">Installer</ion-button>
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