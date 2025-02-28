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
        IonButton,
		IonTitle,
		IonContent,
        IonBackButton
	} from '@ionic/vue';

    import { Browser } from '@capacitor/browser';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonButtons,
            IonButton,
			IonBackButton,
			IonTitle,
			IonContent,
			IonList,
			IonItem,
			IonLabel,
		},
        props: {
            urlHw: {
                type: String,
                required: true,
            }
        },
		data() {
            let backTitle = 'Retour';

			// get current route
			const currentRoute = this.$router.currentRoute.value;

			if(currentRoute.name == "Homework") {
				backTitle = 'Devoirs';
			}

			return {
                backTitle: backTitle,
                openedHw: [],
                openedData: [],
                openedHomework: [],
                openedFiles: [],
                custom: false,
                deleted: false,
			}
		},
		methods: {
			async openLink(url) {
                await Browser.open({
                    url: url,
					presentationStyle: 'popover',
                });
            },
            async deleteHW() {
                const customHomeworks = JSON.parse(localStorage.customHomeworks);

                // find homework
                const homework = customHomeworks.find((homework) => {
                    return homework.homework.data.id == this.openedData.id;
                });

                // remove homework
                customHomeworks.splice(customHomeworks.indexOf(homework), 1);

                // save customHomeworks
                localStorage.customHomeworks = JSON.stringify(customHomeworks);

                this.deleted = true;
            }
		},
		mounted() {
            // if urlHw prop is set
            if(this.urlHw) {
                const encoded = this.urlHw;

                // decode url
                const decoded = decodeURIComponent(encoded);

                // parse json
                const parsed = JSON.parse(decoded);
                // open urlHw
                this.openedHw = parsed;
                this.openedData = parsed.data;
                this.openedHomework = parsed.homework;
                this.openedFiles = parsed.files;

                // if parsed.data.id starts with "custom"
                if(typeof parsed.data.id !== "number") {
                    if(parsed.data.id.startsWith("custom")) {
                        this.custom = true;
                    }
                }
            }

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

                <ion-title v-if="openedHomework && custom">Devoir personnalisé</ion-title>
                <ion-title v-else>Travail à faire <span v-if="openedHomework">en {{ openedHomework.subject }}</span></ion-title>

                <ion-buttons slot="end">
					<ion-button v-if="custom" color="danger" @click="deleteHW($event)">
                        <span slot="start" class="material-symbols-outlined mdls">delete</span>
                        Suppr.
                    </ion-button>
				</ion-buttons>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
            <IonList inset v-if="deleted">
                <IonItem color="danger">
                    <span class="material-symbols-outlined mdls" slot="start">delete</span>

                    <IonLabel>
                        <h2>Ce devoir à été supprimé</h2>
                        <p>Vous consultez une archive de ce devoir.</p>
                    </IonLabel>
                </IonItem>
            </IonList>

            <div v-if="openedHw">
                <div class="content" v-html="openedHomework.content"></div>
            </div>

            <IonLabel class="listGroupTitle" v-if="openedFiles.length !== 0">
				<p>Documents attachés</p>
			</IonLabel>

            <IonList v-if="openedFiles.length !== 0" class="listGroup">
                <IonItem v-for="attachment in openedFiles" :key="attachment.id" @click="openLink(attachment.url)">
                    <span v-if="attachment.type == 1" class="material-symbols-outlined mdls" slot="start">description</span>
                    <span v-else-if="attachment.type == 0" class="material-symbols-outlined mdls" slot="start">link</span>

                    <IonLabel>
                        <h2>{{ attachment.name }}</h2>
                        <p>{{ attachment.url }}</p>
                    </IonLabel>
                </IonItem>
            </IonList>
		</ion-content>
</template>

<style scoped>
    .hwTitle {
        font-weight: 500 !important;
    }

	.content {
        margin: 10px 20px;

        font-size: 16px;
        line-height: 20px;
        
        margin-top: 15px;
        
        -webkit-user-select: text;
        user-select: text;
    }
</style>
