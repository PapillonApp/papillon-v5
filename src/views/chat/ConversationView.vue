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
        IonBackButton,
        IonButtons,
        IonButton,
        IonLabel,
        IonSelect,
        IonSelectOption,
        IonFooter,
        IonRefresher,
		IonRefresherContent,
        IonSkeletonText,
	} from '@ionic/vue';

    import GetConversations from '@/functions/fetch/GetConversations.js';
    const displayToast = require('@/functions/utils/displayToast.js');

    import ChatView from './ChatView.vue';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
            IonBackButton,
            IonFooter,
            IonRefresher,
            IonRefresherContent,
            IonSkeletonText,
		},
        props: {
            conversation: {
                type: Object,
                required: true,
            }
        },
		data() {
			return {
                messages: [],
                refreshInterval: null,
                conversationID: this.conversation.id,
                ChatView: ChatView,
			}
		},
		methods: {
            handleRefresh(event) {
                GetConversations(true).then((res) => {
                    if(event) {
                        event.detail.complete();
                    }

					// filter conversation res with this.conversationID
                    let conversation = res.filter((conv) => {
                        return conv.id === this.conversationID;
                    });

                    this.messages = conversation[0].messages;
                    this.messages.sort((a, b) => {
                        return new Date(a.date) - new Date(b.date);
                    });
				})
            },
            inputKeyPress(event) {
                if (event.key === 'Enter') {
                    this.sendMessage(event.target.value);
                    event.target.value = '';
                }
            },
            sendMessage(message) {
                const API = this.$api;
				const token = localStorage.getItem('token');

				var myHeaders = new Headers();
				myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
								
				var urlencoded = new URLSearchParams();
				urlencoded.append("token", token);
				urlencoded.append("content", message);
				urlencoded.append("discussionId", this.conversationID);

				var requestOptions = {
					method: 'POST',
					headers: myHeaders,
					body: urlencoded,
					redirect: 'follow'
				};

				fetch(API + "/discussion/reply", requestOptions)
					.then(response => response.json())
					.then(result => {
						console.log(result);

                        if (result === 'ok') {
                            this.handleRefresh();
                        } else {
                            return false;
                        }
                    })
            },
		},
		mounted() {
            this.conversationID = this.conversation.id;

            this.messages = this.conversation.messages;
            this.messages.sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });

            document.addEventListener('tokenUpdated', (e) => {
                this.handleRefresh();
            });
		}
	});
</script>

<template>
	<IonHeader class="AppHeader" translucent>
		<IonToolbar>

			<ion-buttons slot="start">
				

                <IonNavLink :component="ChatView" router-direction="back">
                    <IonBackButton mode="md" href="/conversations"></IonBackButton>
                </IonNavLink>
            </ion-buttons>

            <ion-title mode="md" v-if="!conversation.subject">
                <ion-skeleton-text :animated="true" style="width: 80%;"></ion-skeleton-text>
            </ion-title>
			<ion-title v-else mode="md">{{ conversation.subject }}</ion-title>

		</IonToolbar>
	</IonHeader>

    <ion-content :fullscreen="true">
        <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
			<ion-refresher-content></ion-refresher-content>
		</ion-refresher>

        <div class="chatUI">

            <div v-for="(mess, i) in messages" :key="i">
                <div class="message" v-if="mess.author !== 'Moi'">
                    <p class="author">{{mess.author}}</p>
                    <div class="bubble">{{mess.content}}</div>
                </div>
                <div class="message me" v-else>
                    <p class="author">{{mess.author}}</p>
                    <div class="bubble">{{mess.content}}</div>
                </div>
            </div>

        </div>
        <ion-footer class="chatbox">
            <ion-toolbar>
                <input @keydown="inputKeyPress" type="text" class="chatbox_input" placeholder="Écrire quelque chose..." />
            </ion-toolbar>
        </ion-footer>
	</ion-content>
</template>

<style scoped>
    /* chatbox */
    .chatbox {
        position: fixed;
        bottom: 0;
    }

    .md .chatbox {
        border-top: 1px solid #e0e0e0;
    }

    @media screen and (prefers-color-scheme: dark) {
        .md .chatbox {
            border-top: 1px solid #363636;
        }
    }

    .chatbox_input {
        width: calc(100% - 12px * 2);

        background-color: var(--ion-background-color);
        border: 1px solid var(--ion-color-step-100);

        border-radius: 50px;
        padding: 12px 20px;

        margin: 5px 12px;
    }

    .md .chatbox_input {
        border: none;
        background-color: var(--ion-color-step-50);
    }

    .chatbox_input:focus {
        outline: none;
    }

    /* chatUI */
    .chatUI {
        height: calc(100% - (72px + env(safe-area-inset-bottom)));
        width: 100%;
        padding: 0px 16px;
        overflow-y: scroll;
    }

    .message {
        display: flex;
        flex-direction: column;
        margin: 5px 0;
    }

    .message .author {
        font-size: 12px;
        color: var(--ion-color-step-400);
        margin-bottom: 5px;
    }

    .message .bubble {
        background-color: var(--ion-color-step-50);
        border-radius: 10px;
        padding: 10px 15px;
        max-width: 80%;
        width: fit-content;
        font-family: var(--papillon-font), sans-serif;
    }

    .message.me {
        align-items: flex-end;
    }

    .message.me .bubble {
        border: 1px solid var(--ion-color-step-100);
        background-color: transparent !important;
    }
</style>