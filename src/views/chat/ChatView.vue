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
		IonNavLink,
		IonFab,
		IonButton,
		IonModal,
		IonButtons,
		IonTitle,
		IonRadio,
		IonRadioGroup,
		IonInput,
		IonTextarea,
		IonRefresher,
		IonRefresherContent,
		IonPage
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
			IonRadio,
			IonRadioGroup,
			IonInput,
			IonTextarea,
			IonRefresher,
			IonRefresherContent,
			IonPage
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
			setnewConvModalOpen(status) {
				this.newConvModalOpen = status;
			},
			startNewChat() {
				this.checkedRecipients = [];
				this.newConvModalOpen = true;
			},
			startConversation() {
				let subject = this.$refs.newChatSubject.$el.value;
				let content = this.$refs.newChatMsg.$el.value;
				let recipient = JSON.parse(this.checkedRecipient);

				// find recipient with id
				let recipients = [recipient.id];

				const API = this.$api;
				const token = localStorage.getItem('token');

				var myHeaders = new Headers();
				myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
								
				var urlencoded = new URLSearchParams();
				urlencoded.append("token", token);
				urlencoded.append("content", content);
				urlencoded.append("recipientsId", JSON.stringify(recipients));
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
						console.log(result);

						if(result == "ok") {
							displayToast.presentToastFull(
								"Conversation créée",
								"La conversation avec " + recipient.name + " a bien été créée.",
								"success",
								checkmark
							);
							this.newConvModalOpen = false;
							this.handleRefresh();
						} else {
							displayToast.presentToastFull(
								"Impossible de créer la conversation",
								"Une erreur est survenue lors de la création de la conversation.",
								"danger",
								alertCircle
							);
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
			}
		},
		mounted() {
            GetConversations().then((res) => {
				this.conversations = res;
            })

			GetRecipients().then((res) => {
				this.recipients = res;
			})

			// watch checkedRecipient
			this.$watch('checkedRecipient', () => {
				console.log(this.checkedRecipient);
			});

			document.addEventListener('tokenUpdated', (e) => {
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

			<IonFab slot="fixed" vertical="bottom" horizontal="end" class="newCoursBtnFab">
				<ion-button @click="startNewChat()" size="large" shape="round" class="newCoursBtn" mode="md">
					<span class="material-symbols-outlined mdls" slot="icon-only">add</span>
				</ion-button>
			</IonFab>

			<div class="NoCours" v-if="this.conversations.length == 0">
				<span class="material-symbols-outlined mdls">forum</span>
				<h2>Aucune conversation n'a été trouvée.</h2>
				<p>Essayez d'envoyer un message à quelqu'un dans votre établissement.</p>
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

			<IonModal class="newChatModal" :is-open="newConvModalOpen">
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

					<IonList>
						<ion-radio-group v-model="checkedRecipient">
							<IonItem v-for="(person, i) in recipients" :key="i">
								<span class="material-symbols-outlined mdls" slot="start" v-if="person.type == 'teacher'">face</span>
								<span class="material-symbols-outlined mdls" slot="start" v-else>person</span>

								<ion-label>
									<h2>{{ person.name }}</h2>
									<p>{{ person.functions.join(", ") }}</p>
								</ion-label>

								<ion-radio slot="end" :value="JSON.stringify(person)"></ion-radio>
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