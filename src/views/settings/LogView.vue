<script>
	import {
		defineComponent
	} from 'vue';

	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonListHeader,
		IonItem,
		IonButtons,
		IonButton,
		IonLabel,
		IonContent,
		IonPage,
		IonTitle,
		IonCardContent,
		IonCard
	} from '@ionic/vue';

	import PapillonBackButton from '@/components/PapillonBackButton.vue';


	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			PapillonBackButton,
			IonButtons,
			IonButton,
			IonLabel,
			IonItem,
			IonList,
			IonContent,
			IonTitle,
			IonPage,
		},
		data() {
			return {
				logs: [],
			}
		},
		methods: {
			clear() {
				localStorage.removeItem("logs");
				this.logs = [];
			},
			getTypeColor(type) {
				switch (type) {
					case "error":
						return "danger";
					case "log":
						return "primary";
					case "warn":
						return "warning";
				}
			}


		},
		mounted() {
			this.logs = JSON.parse(localStorage.getItem("logs"));
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

				<ion-title mode="md">Logs</ion-title>

				<ion-buttons slot="end">
					<IonButton @click="clear()">Effacer les logs</IonButton>
				</ion-buttons>

			</IonToolbar>


		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-list>
				<ion-item v-for="log in logs" :key="log.id">
					<ion-label :color="getTypeColor(log.type)">
						<h2>{{ log.message }}</h2>
						<p>{{ log.date }}</p>
					</ion-label>
				</ion-item>
			</ion-list>

		</ion-content>
	</ion-page>
</template>

<style scoped>
	.md .paddingFixMd {
		padding-left: 15px;
	}
</style>