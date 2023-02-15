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
		IonFab,
		IonLabel,
		IonContent,
		IonPage,
		IonTitle,
		IonRefresher,
		IonRefresherContent,
		modalController,
	} from '@ionic/vue';

	import PapillonBackButton from '@/components/PapillonBackButton.vue';
    import { app } from '@/main';
    import { addOutline } from 'ionicons/icons';

	import InstallExtensionView from './InstallExtensionView.vue';

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
			IonFab,
			IonButton,
		},
        data() {
            return {
                extensions: [],
                localRepo: app.config.globalProperties.$localRepo,
				InstallExtensionView: InstallExtensionView,
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

				<ion-title mode="md">Extensions</ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>
		
            <ion-list>
                <ion-item v-for="extension in extensions" :key="extension.id">
					<span class="material-symbols-outlined mdls" slot="start">{{ extension.icon }}</span>
                    <ion-label>
                        <h2>{{ extension.name }}</h2>
                        <p>{{ extension.description }}</p>
                    </ion-label>

                    <ion-button color="danger" fill="clear" slot="end" 
                    @click="localRepo.uninstallExtension(extension.rootUrl)">
						<span class="material-symbols-outlined mdls" slot="icon-only">delete</span>
					</ion-button>
                </ion-item>

				<ion-item v-if="extensions.length == 0">
					<span class="material-symbols-outlined mdls" slot="start">info</span>
					<ion-label>
						<h2>Aucune extension installée</h2>
						<p>Installez des extensions pour ajouter des fonctionnalités à Papillon</p>
					</ion-label>
				</ion-item>
            </ion-list>

            <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="newCoursBtnFab">
				<ion-nav-link router-direction="forward" :component="InstallExtensionView">
					<ion-button size="large" shape="round" class="newCoursBtn" mode="md">
						<span class="material-symbols-outlined mdls" slot="icon-only">add</span>
					</ion-button>
				</ion-nav-link>
            </ion-fab>

		</ion-content>
	</ion-page>
</template>

<style scoped>
	.md .paddingFixMd {
		padding-left: 15px;
	}

	.ios .newCoursBtnFab {
        bottom: 32px;
        right: 18px;
    }

    .newCoursBtn {
        width: 56px;
        height: 56px;
    }
</style>