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
		IonChip
	} from '@ionic/vue';

	const displayToast = require('@/functions/utils/displayToast.js');

    import GetConversations from '@/functions/fetch/GetConversations.js';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
		},
		setup() {
			return {

			}
		},
		methods: {

		},
		data() {
			return {
				
			}
		},
		mounted() {
            GetConversations().then((res) => {
                console.log(res);
            })

			return false;
		}
	});
</script>

<template>
	<ion-page ref="page">
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<ion-menu-button color="dark" mode="md"></ion-menu-button>
				</ion-buttons>

				<ion-title mode="md">Conversations</ion-title>

			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-refresher slot="fixed">
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>

			<IonHeader collapse="condense">
				<IonToolbar>
					<ion-title size="large">Conversations</ion-title>
				</IonToolbar>
			</IonHeader>

		</ion-content>

	</ion-page>
</template>

<style scoped>
	ion-chip span {
		margin-right: 5px;
	}
</style>