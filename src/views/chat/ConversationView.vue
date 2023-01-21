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
	} from '@ionic/vue';

	const displayToast = require('@/functions/utils/displayToast.js');

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
            IonBackButton,
		},
        props: {
            conversation: {
                type: Object,
                required: true,
            }
        },
		setup() {
			return {
                messages: [],
			}
		},
		methods: {
            
		},
		data() {
			return {
				
			}
		},
		mounted() {
            this.messages = this.conversation.messages;
            this.messages.reverse();

            console.log(this.messages);

            return false;
		}
	});
</script>

<template>
	<IonHeader class="AppHeader" collapse="fade" translucent>
		<IonToolbar>

			<ion-buttons slot="start">
				<IonBackButton mode="md"></IonBackButton>
			</ion-buttons>

			<ion-title mode="md">{{ conversation.subject }}</ion-title>

		</IonToolbar>
	</IonHeader>

    <ion-content :fullscreen="true">
        <div class="chatUI">

            <div v-for="(mess, i) in conversation.messages" :key="i">
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
        <div class="chatbox">
            <input type="text" placeholder="Écrire quelque chose..." />
        </div>
	</ion-content>
</template>

<style scoped>
    /* chatbox */
    .chatbox {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 12px 12px;
        border-top: 1px solid var(--ion-color-step-100);
        padding-bottom: 32px;
        background: var(--ion-background-color);
    }

    .chatbox input {
        width: 100%;
        background-color: var(--ion-color-step-50);
        border: 1px solid var(--ion-color-step-100);
        border-radius: 50px;
        padding: 12px 20px;
    }

    .chatbox input:focus {
        outline: none;
    }

    /* chatUI */
    .chatUI {
        height: 100% - 87px;
        width: 100%;
        padding: 0px 16px;
        padding-bottom: 120px;
    }

    .message {
        display: flex;
        flex-direction: column;
        margin: 10px 0;
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