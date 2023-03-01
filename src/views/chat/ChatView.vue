<script>
	import {
		defineComponent
	} from 'vue';
	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonItem,
		IonNavLink,
		IonFab,
		IonButton,
		IonModal,
		IonButtons,
		IonTitle,    
		IonCheckbox,
		IonRadioGroup,
		IonInput,
		IonTextarea,
		IonRefresher,
		IonRefresherContent,
		IonPage,
		IonSpinner
	} from '@ionic/vue';

	import displayToast from '@/functions/utils/displayToast.js';

	import GetConversations from '@/functions/fetch/GetConversations.js';
	import GetRecipients from '@/functions/fetch/GetRecipients.js';

	import ConversationView from './ConversationView.vue';

	import { checkmark, alertCircle } from 'ionicons/icons';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonList,
			IonItem,
			IonNavLink,
			IonFab,
			IonButton,
			IonButtons,
			IonTitle,
			IonModal,    
			IonCheckbox,
			IonRadioGroup,
			IonInput,
			IonTextarea,
			IonRefresher,
			IonRefresherContent,
			IonPage,
			IonSpinner
		},
		setup() {
			return {

			}
		},
		methods: {
			handleRefresh(event) {
				GetConversations(true).then((res) => {
					this.conversations = res;
				})

				if(event) {
					this.$watch('conversations', () => {
						setTimeout(() => {
							event.target.complete();
						}, 200);
					});
				}
			},
			refreshRecipients() {
				GetRecipients(true).then((res) => {
					this.recipients = res;
				})
			},
			setnewConvModalOpen(status) {
				this.newConvModalOpen = status;
			},
			startNewChat() {
				this.checkedRecipients = [];
				this.refreshRecipients();
				this.newConvModalOpen = true;
			},
			selectRecipient(id) {
				if(this.checkedRecipients.includes(id)) {
					this.checkedRecipients.splice(this.checkedRecipients.indexOf(id), 1);
				} else {
					this.checkedRecipients.push(id);
				}
			},
			startConversation() {
				let subject = this.$refs.newChatSubject.$el.value;
				let content = this.$refs.newChatMsg.$el.value;
				let recipientsId = this.checkedRecipients;

				const API = this.$api;
				const token = localStorage.getItem('token');

				var myHeaders = new Headers();
				myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
								
				var urlencoded = new URLSearchParams();
				urlencoded.append("token", token);
				urlencoded.append("content", content);
				urlencoded.append("recipientsId", JSON.stringify(recipientsId));
				urlencoded.append("subject", subject);

				var requestOptions = {
					method: 'POST',
					headers: myHeaders,
					body: urlencoded,
					redirect: 'follow'
				};

				fetch(API + "/discussion/create", requestOptions)
					.then(response => response.json())
					.then(result => {
						if(result.status == "ok") {
							displayToast.presentToastFull(
								"Conversation créée",
								"La conversation a bien été créée.",
								"success",
								checkmark
							);
							this.newConvModalOpen = false;
							this.handleRefresh();
						} else {
							if (result.error != undefined) {
								displayToast.presentToastFull(
									"Impossible de créer la conversation",
									"Une erreur est survenue lors de la création de la conversation.",
									"danger",
									alertCircle,
									true,
									result.error
								);
								return;
							} else if (result.errors != undefined) {
								displayToast.presentToastFull(
									"Impossible de créer la conversation",
									"Veuillez remplir tous les champs pour créer la conversation.",
									"danger",
									alertCircle
								);
								return;
							} else {
								displayToast.presentToastFull(
									"Impossible de créer la conversation",
									"Une erreur est survenue lors de la création de la conversation.",
									"danger",
									alertCircle,
									true,
									result
								);
								return;
							}
						}
					})
			}
		},
		data() {
			return {
				conversations: [],
				recipients: [],
				ConversationView: ConversationView,
				newConvModalOpen: false,
				checkedRecipient: [],
				isLoading: false,
				presentingElement: null,
			}
		},
		mounted() {
			this.presentingElement = this.$refs.page.$el;
			this.isLoading = true;

			GetConversations().then((res) => {
				this.conversations = res;

				this.isLoading = false;
			})

			GetRecipients().then((res) => {
				this.recipients = res;
			})

			document.addEventListener('tokenUpdated', () => {
				GetConversations().then((res) => {
					this.conversations = res;
				})

				GetRecipients().then((res) => {
					this.recipients = res;
				})
			});
		}
	});
</script>

<template>
	<ion-page ref="page">
		<IonHeader class="AppHeader" translucent collapse="fade">
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

			<IonFab slot="fixed" vertical="bottom" horizontal="end" class="newCoursBtnFab">
				<ion-button @click="startNewChat()" size="large" shape="round" class="newCoursBtn" mode="md">
					<span class="material-symbols-outlined mdls" slot="icon-only">add</span>
				</ion-button>
			</IonFab>

			<div class="NoCours" v-if="this.conversations.length == 0 && !isLoading">
				<span class="material-symbols-outlined mdls">forum</span>
				<h2>Aucune conversation n'a été trouvée.</h2>
				<p>Essayez d'envoyer un message à quelqu'un dans votre établissement.</p>
			</div>

			<div class="NoCours" v-if="this.conversations.length == 0 && isLoading">
				<IonSpinner></IonSpinner>
				<br/>
				<h2>Téléchargement des conversations...</h2>
				<p>Veuillez patienter pendant qu'on récupère les conversations depuis nos serveurs...</p>
			</div>

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

			<IonModal :presenting-element="presentingElement" class="newChatModal" :is-open="newConvModalOpen">
				<IonHeader translucent>
					<IonToolbar>
						<IonButtons slot="start">
							<IonButton @click="setnewConvModalOpen(false)">Annuler</IonButton>
						</IonButtons>
						<IonTitle>Nouvelle conversation</IonTitle>
						<IonButtons slot="end">
							<IonButton color="primary" @click="startConversation()">Créer</IonButton>
						</IonButtons>
					</IonToolbar>
				</IonHeader>
				<ion-content>
					<IonList inset>
						<IonItem>
							<IonInput ref="newChatSubject" placeholder="Sujet"></IonInput>
						</IonItem>
						<IonItem>
							<IonTextarea ref="newChatMsg" placeholder="Contenu du 1er message"></IonTextarea>
						</IonItem>
					</IonList>

					<IonList style="padding-bottom: 100px;">
						<ion-radio-group>
							<IonItem v-for="(person, i) in recipients" :key="i">
								<span class="material-symbols-outlined mdls" slot="start" v-if="person.type == 'teacher'">face</span>
								<span class="material-symbols-outlined mdls" slot="start" v-else>person</span>

								<ion-label>
									<h2>{{ person.name }}</h2>
									<p>{{ person.functions.join(", ") }}</p>
								</ion-label>

								<ion-checkbox slot="end" @click="selectRecipient(person.id)"></ion-checkbox>
							</IonItem>
						</ion-radio-group>
					</IonList>
				</ion-content>
			</IonModal>

		</ion-content>
	</ion-page>
</template>

<style scoped>
	ion-chip span {
		margin-right: 5px;
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