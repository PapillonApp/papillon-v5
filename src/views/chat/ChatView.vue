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
		IonChip,
		IonLabel,
		IonNavLink
	} from '@ionic/vue';

	const displayToast = require('@/functions/utils/displayToast.js');

    import GetConversations from '@/functions/fetch/GetConversations.js';
	import ConversationView from './ConversationView.vue';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonList,
			IonItem,
			IonNavLink
		},
		setup() {
			return {

			}
		},
		methods: {
			handleRefresh(event) {
				GetConversations().then((res) => {
					this.conversations = res;
					console.log(res);
				})

				this.$watch('conversations', () => {
                    setTimeout(() => {
                        event.target.complete();
                    }, 200);
                });
			}
		},
		data() {
			return {
				conversations: [],
				ConversationView: ConversationView,
			}
		},
		mounted() {
            GetConversations().then((res) => {
				this.conversations = res;
                console.log(res);
            })

			return false;
		}
	});
</script>

<template>
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<ion-menu-button color="dark" mode="md"></ion-menu-button>
				</ion-buttons>

				<ion-title mode="md">Conversations</ion-title>

			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>

			<IonHeader collapse="condense">
				<IonToolbar>
					<ion-title size="large">Conversations</ion-title>
				</IonToolbar>
			</IonHeader>

			<IonList>
				<IonNavLink v-for="(chat, i) in conversations" :key="i" router-direction="forward" :component="ConversationView" :componentProps="{conversation: chat}">		
						<IonItem button>
							<span class="material-symbols-outlined mdls" slot="start">forum</span>
							<ion-label>
								<h2>{{ chat.subject }}</h2>
								<p>{{ chat.messages[chat.messages.length - 1].content }}</p>
								<small>{{ chat.creator }}</small>
							</ion-label>
						</IonItem>
				</IonNavLink>
			</IonList>

			<br /><br /><br /><br /><br />

		</ion-content>
</template>

<style scoped>
	ion-chip span {
		margin-right: 5px;
	}
</style>