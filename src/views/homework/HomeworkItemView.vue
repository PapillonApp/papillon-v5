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
		IonContent
	} from '@ionic/vue';

    import { Browser } from '@capacitor/browser';

	import PapillonBackButton from '@/components/PapillonBackButton.vue';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonButtons,
			PapillonBackButton,
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
			return {
                openedHw: [],
                openedData: [],
                openedHomework: [],
                openedFiles: [],
			}
		},
		methods: {
			async openLink(url) {
                await Browser.open({
                    url: url,
					presentationStyle: 'popover',
                });
            },
		},
		mounted() {
            // if urlHw prop is set
            if(this.urlHw) {
                let encoded = this.urlHw;

                // decode url
                let decoded = decodeURIComponent(encoded);

                // parse json
                let parsed = JSON.parse(decoded);

                // open urlHw
                this.openedHw = parsed;
                this.openedData = parsed.data;
                this.openedHomework = parsed.homework;
                this.openedFiles = parsed.files;
            }

            return false;
        }
	});
</script>

<template>
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<PapillonBackButton></PapillonBackButton>
				</ion-buttons>

                <ion-title mode="md">Travail à faire <span v-if="openedHomework">en {{ openedHomework.subject }}</span></ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
            <div v-if="openedHw">
                <div class="content" v-html="openedHomework.content"></div>
            </div>

            <IonList inset v-if="openedFiles.length !== 0">
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
    }
</style>
