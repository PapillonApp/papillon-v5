<script>
	import {
		defineComponent
	} from 'vue';
	import {
		IonHeader,
		IonToolbar,
        IonRefresher,
		IonRefresherContent,
        IonSkeletonText,
	} from '@ionic/vue';

    import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';
    import { Clipboard } from '@capacitor/clipboard';

    import GetConversations from '@/functions/fetch/GetConversations.js';

    import ChatView from './ChatView.vue';
    import PapillonBackButton from '@/components/PapillonBackButton.vue';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
            IonRefresher,
            IonRefresherContent,
            IonSkeletonText,
            PapillonBackButton
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
            async openMessage() {
                let msg = event.target.innerText;

                // if msg is an url, stop here
                if (msg.match(/^(https?:\/\/[^\s]+)/g)) {
                    return false;
                }

                // remove multiple spaces
                msg = msg.replace(/\s\s+/g, ' ');

                let shortMsg = msg.substring(0, 150);
                if (msg.length > 150) {
                    shortMsg += '...';
                }

                const result = await ActionSheet.showActions({
                    title: 'Actions du message',
                    message: shortMsg,
                    options: [
                        {
                            title: 'Copier le texte',
                        },
                        {
                            title: 'Annuler',
                            style: ActionSheetButtonStyle.Cancel,
                        },
                    ],
                });

                if (result.index === 0) {
                    Clipboard.write({
                        string: msg,
                    });
                }
            },
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

            // for each message
            this.messages.forEach((mess) => {
                // parse urls
                let urlRegex = /(https?:\/\/[^\s]+)/g;
                // check if there's already a <a> tag
                if(mess.content.match(/<a/g)) {
                    mess.content = mess.content.replace(/<a/g, '<a target="_blank"');
                } else {
                    mess.content = mess.content.replace(urlRegex, '<a target="_blank" @click.stop class="inherit" href="$1">$1</a>');
                }

                // parse line breaks
                mess.content = mess.content.replace(/\n/g, '<br/>');
            });

            document.addEventListener('tokenUpdated', () => {
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
                    <PapillonBackButton></PapillonBackButton>
                </IonNavLink>
            </ion-buttons>

            <ion-title mode="md" v-if="!conversation.subject">
                <ion-skeleton-text :animated="true" style="width: 80%;"></ion-skeleton-text>
            </ion-title>
			<ion-title v-else mode="md">{{ conversation.subject }}</ion-title>

		</IonToolbar>
	</IonHeader>

    <ion-content class="content showScroll" :fullscreen="true">
        <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
			<ion-refresher-content></ion-refresher-content>
		</ion-refresher>

        <div class="chatUI">

            <div v-for="(mess, i) in messages" :key="i">
                <div @click="openMessage($event)" class="message theirs" v-if="mess.author !== 'Moi'">
                    <p class="author">{{mess.author}}</p>
                    <div class="bubble" v-html="mess.content"></div>
                </div>
                <div @click="openMessage($event)" class="message me" v-else>
                    <p class="author">{{mess.author}}</p>
                    <div class="bubble" v-html="mess.content"></div>
                </div>
            </div>

        </div>
        <div class="chatbox">
            <input @keydown="inputKeyPress" type="text" class="chatbox_input" placeholder="Non disponible pour le moment" disabled />
        </div>
	</ion-content>
</template>

<style scoped>
    .content::part(scroll) {
        margin-bottom: calc(0px - env(safe-area-inset-bottom));
        overflow: hidden;
    }

    /* chatbox */
    .chatbox {
        position: sticky;
        bottom: 0px;

        height: calc(70px + var(--ion-safe-area-bottom));
        display: flex;
        align-items: center;
        justify-content: center;
        
        background-color: var(--ion-background-color);
        border-top: 1px solid var(--ion-color-step-100);

        padding-bottom: var(--ion-safe-area-bottom);
    }

    .md .chatbox {
        border-top: 1px solid #e0e0e0;
    }

    .dark .md .chatbox {
        border-top: 1px solid #363636;
    }

    .chatbox_input {
        width: calc(100% - 12px * 2);

        border: none;
        background-color: var(--ion-color-step-100);

        border-radius: 50px;
        padding: 12px 20px;
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
        height: calc(100% - 60px - var(--ion-safe-area-bottom));
        width: 100%;
        padding: 0px 16px;
        overflow-y: scroll;
        padding-bottom: 20px;
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

    .message.me {
        align-items: flex-end;
    }

    .message .bubble {
        --gradient: 
            linear-gradient(to bottom, rgba(var(--ion-color-primary-rgb), 0.8) 0%, rgba(var(--ion-color-primary-rgb), 1) 90%), #fff;
        
        background: var(--ion-color-step-100);

        border-radius: 15px;

        padding: 8px 12px;
        max-width: 80%;
        width: fit-content;

        position: relative;
    }
    

    .message.me .bubble {
        color: #fff;
        background: var(--gradient);
        background-attachment: fixed;
    }

    .message.me .bubble:before {
        content: "";
        position: absolute;
        z-index: 0;
        bottom: 0;
        right: -8px;
        height: 20px;
        width: 20px;
        background: rgba(var(--ion-color-primary-rgb), 1);
        background-attachment: fixed;
        border-bottom-left-radius: 15px;
    }

    .message.me .bubble:after {
        content: "";
        position: absolute;
        z-index: 1;
        bottom: 0;
        right: -10px;
        width: 10px;
        height: 20px;
        background: var(--ion-background-color);
        border-bottom-left-radius: 10px;
    }

    .message.theirs .bubble:before {
        content: "";
        position: absolute;
        z-index: 0;
        bottom: 0;
        left: -7px;
        height: 20px;
        width: 20px;
        background: var(--ion-color-step-100);
        border-bottom-right-radius: 15px;
    }   

    .message.theirs .bubble:after {
        content: "";
        position: absolute;
        z-index: 1;
        bottom: 0;
        left: -10px;
        width: 10px;
        height: 20px;
        background: white;
        border-bottom-right-radius: 10px;
    }

    .message.me .bubble a {
        color: #fff !important;
    }
</style>