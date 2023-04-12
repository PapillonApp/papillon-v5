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
		IonSkeletonText
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
			IonSkeletonText,
			IonList,
			IonItem,
			IonLabel,
		},
		props: {
			urlNews: {
				type: String,
				required: true,
			}
		},
		data() {
			return {
				openedNews: []
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
			// if urlNews prop is set
			if(this.urlNews) {
				let encoded = this.urlNews;

				// decode url
				let decoded = decodeURIComponent(encoded);

				// parse json
				let parsed = JSON.parse(decoded);

				// open urlNews
				this.openedNews = parsed;
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

				<ion-title mode="md" v-if="openedNews">{{ openedNews.title }}</ion-title>
				<ion-title mode="md" v-else><ion-skeleton-text style="width: 200px;"></ion-skeleton-text></ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<div v-if="openedNews">

				<IonList>
					<IonItem>
						<IonLabel>
							<h1 class="newsTitle">{{ openedNews.title }}</h1>
							<p>{{ openedNews.author }} - {{ openedNews.dateString }}</p>
						</IonLabel>
					</IonItem>
				</IonList>

				<IonList v-if="openedNews.isSurvey" inset>
					<IonItem color="danger">
						<span class="material-symbols-outlined mdls" slot="start">contact_support</span>
						<IonLabel class="ion-text-wrap">
							<h2>Cette news contient un sondage.</h2>
							<p>Papillon ne permet pas de répondre aux sondages.</p>
						</IonLabel>
					</IonItem>
				</IonList>

				<div class="content" v-html="openedNews.htmlContent"></div>

				<div v-if="openedNews.attachments">
					<IonList inset v-if="openedNews.attachments.length !== 0">
						<IonItem v-for="attachment in openedNews.attachments" :key="attachment.id" @click="openLink(attachment.url)">
							<span v-if="attachment.type == 1" class="material-symbols-outlined mdls" slot="start">description</span>
							<span v-else-if="attachment.type == 0" class="material-symbols-outlined mdls" slot="start">link</span>
							<IonLabel>
								<h2>{{ attachment.name }}</h2>
								<p>{{ attachment.url }}</p>
							</IonLabel>
						</IonItem>
					</IonList>
				</div>

			</div>
		</ion-content>
</template>

<style scoped>
	.newsTitle {
		font-weight: 500 !important;
	}

	.content {
		margin: 10px 20px;
	}
</style>
