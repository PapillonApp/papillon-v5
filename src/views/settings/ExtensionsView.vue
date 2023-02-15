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
		IonItemSliding,
		IonItemOption,
		IonItemOptions,
		IonButtons,
		IonButton,
		IonLabel,
		IonContent,
		IonPage,
		IonTitle,
		IonRefresher,
		IonRefresherContent,
	} from '@ionic/vue';

	import PapillonBackButton from '@/components/PapillonBackButton.vue';
    import { app } from '@/main';
    import { addOutline } from 'ionicons/icons';


	export default defineComponent({
		name: 'ExtensionsView',
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
			IonRefresher,
			IonRefresherContent,
		},
        data() {
            return {
                extensions: [],
                localRepo: app.config.globalProperties.$localRepo
            }
        },
        mounted() {
            console.log(this.localRepo)
            this.extensions = this.localRepo.getExtensions()
        },

        methods: {
            handleRefresh(event) {
                this.extensions = this.localRepo.getExtensions()
                setTimeout(() => {
                    event.detail.complete();
                }, 1000);
            },
            installExtension() {
                this.$router.push({ name: 'InstallExtension' })
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

				<ion-title mode="md">Mes Extensions</ion-title>

			

			</IonToolbar>


		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>
		
            <ion-list>
                <ion-item v-for="extension in extensions" :key="extension.id">
                    <ion-label>
                        <h2>{{ extension.name }}</h2>
                        <p>{{ extension.description }}</p>
                    </ion-label>

                    <ion-button
                    color="danger"
                    fill="outline"
                    slot="end" 
                    @click="localRepo.uninstallExtension(extension.rootUrl)">Supprimer</ion-button>

                </ion-item>
            </ion-list>

            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button @click="installExtension()">
                    <span class="material-symbols-outlined">add</span>
                </ion-fab-button>
            </ion-fab>

		</ion-content>
	</ion-page>
</template>

<style scoped>
	.md .paddingFixMd {
		padding-left: 15px;
	}
</style>