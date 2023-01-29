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
		IonLabel,
        IonToggle,
        IonButtons,
        IonTitle,
        IonContent,
        IonNavLink,
	} from '@ionic/vue';

    import LogView from './LogView.vue';

	import displayToast from '@/functions/utils/displayToast.js';
    import GetToken from '@/functions/login/GetToken.js';
    import PapillonBackButton from '@/components/PapillonBackButton.vue';

    import { trash, refresh, checkmark, alertCircle } from 'ionicons/icons';

    import { FilePicker } from '@capawesome/capacitor-file-picker';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
            IonButtons,
            PapillonBackButton,
            IonList,
            IonItem,
            IonLabel,
            IonTitle,
            IonContent,
            IonNavLink,
		},
		data() {
			return {
                LogView: LogView,
			}
		},
		methods: {
            resetColors() {
                localStorage.removeItem('SubjectColors');

                // show toast
                setTimeout(() => {
                    displayToast.presentNativeToast(
                        'Couleurs des matières réinitialisées'
                    );
                    
                    setTimeout(() => {
                        this.localStorageSize = this.getLocalStorageSize() + ' kb';
                    }, 1000);
                }, 100);
            },
            emptyCache() {
                // empty cache
                localStorage.removeItem('UserCache');
                localStorage.removeItem('TimetableCache');
                localStorage.removeItem('NewsCache');
                localStorage.removeItem('GradeCache');
                localStorage.removeItem('HomeworkCache');
                localStorage.removeItem('AbsencesCache');
                localStorage.removeItem('PunishmentsCache');
                localStorage.removeItem('DelaysCache');
                localStorage.removeItem('MenuCache');
                localStorage.removeItem('ConversationsCache');
                localStorage.removeItem('SubjectColors');

                // show toast
                setTimeout(() => {
                    displayToast.presentNativeToast(
                        'Cache des données vidé'
                    );
                    
                    setTimeout(() => {
                        this.localStorageSize = this.getLocalStorageSize() + ' kb';
                    }, 1000);
                }, 100);
            },
            refreshToken() {
                GetToken();
                displayToast.presentNativeToast(
                    'Nouvelles clés de connexion demandées'
                );

                // wait for tokenUpdated event
                document.addEventListener('tokenUpdated', () => {
                    displayToast.presentNativeToast(
                        'Clés de connexion régénérées'
                    );
                });
            },
            clearLogs() {
				localStorage.removeItem("logs");
				this.logs = [];

                displayToast.presentNativeToast(
                    'Logs effacés'
                );
			},
		},
		mounted() {
            return false;
        }
	});
</script>

<template>
		<IonHeader class="AppHeader" collapse="fade" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<PapillonBackButton></PapillonBackButton>
				</ion-buttons>

				<ion-title mode="md">Options avancées</ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
            <IonList :inset="true" lines="inset">
                <IonItem button @click="emptyCache()">
                    <span class="material-symbols-outlined mdls" slot="start">auto_delete</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Vider le cache des données</h2>
                        <p>Réinitialise les données pré-téléchargées hors ligne</p>  
                    </IonLabel>
                </IonItem>

                <IonItem button @click="resetColors()">
                    <span class="material-symbols-outlined mdls" slot="start">format_color_fill</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Réattribuer les couleurs de matières</h2>
                        <p>Réinitialise les couleurs des matières pour en obtenir de nouvelles</p>  
                    </IonLabel>
                </IonItem>

                <IonItem button @click="refreshToken()">
                    <span class="material-symbols-outlined mdls" slot="start">key</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Régénérer les clés de connexion (avancé)</h2>
                        <p>Permet de demander une nouvelle autorisation à votre établissement</p>  
                    </IonLabel>
                </IonItem>

                <IonItem button @click="clearLogs()">
                    <span class="material-symbols-outlined mdls" slot="start">delete_sweep</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Effacer les logs</h2>
                        <p>Supprime les logs de l'application</p>  
                    </IonLabel>
                </IonItem>

                <ion-nav-link router-direction="forward" :component="LogView">
                    <IonItem button>
                        <span class="material-symbols-outlined mdls" slot="start">developer_mode</span>
                        <IonLabel>
                            <h2>Voir les logs</h2>
                            <p>Consulter les logs de l'application</p>
                        </IonLabel>
                    </IonItem>
                </ion-nav-link>
            </IonList>
		</ion-content>
</template>

<style scoped>
	.md .paddingFixMd {
        padding-left: 15px;
    }
</style>