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
		IonSkeletonText,
		IonBackButton
	} from '@ionic/vue';

	import { Browser } from '@capacitor/browser';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonButtons,
			IonBackButton,
			IonTitle,
			IonContent,
			IonSkeletonText,
			IonList,
			IonItem,
			IonLabel
		},
		props: {
			urlNews: {
				type: String,
				required: true,
			}
		},
		data() {
			let backTitle = 'Retour';

			// get current route
			const currentRoute = this.$router.currentRoute.value;

			if(currentRoute.name == "News") {
				backTitle = 'Actualités';
			}

			return {
				backTitle: backTitle,
				openedNews: [],
				shortName: '',
			}
		},
		methods: {
			async openLink(url) {
				await Browser.open({
					url: url,
					presentationStyle: 'popover',
				});
			},
			getLettersFromName(name) {
				// if first letter is M, remove first word
				if (name[0] == 'M') {
					name = name.split(' ').slice(1).join(' ');
				}

				const shortName = name.match(/\b(\w)/g).join('');

				// if shortName > 2, return first 2 letters
				if (shortName.length > 2) {
					return shortName.slice(0, 2);
				}

				return shortName;
			}
		},
		mounted() {
			// if urlNews prop is set
			if(this.urlNews) {
				const encoded = this.urlNews;

				// decode url
				const decoded = decodeURIComponent(encoded);

				// parse json
				const parsed = JSON.parse(decoded);

				// open urlNews
				this.openedNews = parsed;

				// get short name
				this.shortName = this.getLettersFromName(this.openedNews.author);
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

				<ion-title v-if="openedNews">{{ openedNews.title }}</ion-title>
				<ion-title v-else><ion-skeleton-text style="width: 200px;"></ion-skeleton-text></ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<div v-if="openedNews">
				<ion-header collapse="condense">
					<ion-toolbar>
						<h1 class="mainTitle">{{ openedNews.title }}</h1>
					</ion-toolbar>
					<ion-toolbar>
						<IonItem>
							<div class="avatar" slot="start">
								{{ shortName }}
							</div>
							<IonLabel>
								<h2>{{ openedNews.author }}</h2>
								<p>{{ openedNews.dateString }}</p>
							</IonLabel>
						</IonItem>
					</ion-toolbar>
				</ion-header>

				<IonList class="only-md">
					<IonItem>
						<div class="avatar" slot="start">
							{{ shortName }}
						</div>
						<IonLabel>
							<h2>{{ openedNews.author }}</h2>
							<p>{{ openedNews.dateString }}</p>
						</IonLabel>
					</IonItem>
				</IonList>

				<IonList v-if="openedNews.isSurvey" inset>
					<IonItem color="danger">
						<span class="material-symbols-outlined mdls" slot="start">contact_support</span>
						<IonLabel class="ion-text-wrap">
							<h2>Cette news contient un sondage</h2>
							<p>Papillon ne permet pas de répondre aux sondages.</p>
						</IonLabel>
					</IonItem>
				</IonList>

				<div class="content" v-html="openedNews.htmlContent"></div>

				<div v-if="openedNews.attachments">
					<IonLabel class="listGroupTitle" v-if="openedNews.attachments.length !== 0">
						<p>Documents attachés</p>
					</IonLabel>

					<IonList v-if="openedNews.attachments.length !== 0" class="listGroup">
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
	.mainTitle {
		margin-top: 0px;
		margin: auto 16px !important;
	}

	.content {
		margin: 10px 20px;
	}

	.avatar {
		width: 38px;
		height: 38px;

		display: flex;
		justify-content: center;
		align-items: center;

		background: linear-gradient(180deg, #b4b4b4 0%,#7e7e7e 100%);
		border-radius: 50%;

		color: #fff;

		font-weight: 500;
		font-size: 1.05rem;

		padding-bottom: 1px;
	}

	.md .avatar {
		background: rgba(var(--ion-color-primary-rgb), 0.2);
		color: var(--ion-color-primary);
		margin-right: 15px;
	}
</style>
