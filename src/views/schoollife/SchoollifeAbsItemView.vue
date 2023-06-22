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
        //IonButton,
		IonTitle,
		IonContent,
        IonBackButton,
		IonSpinner
	} from '@ionic/vue';

	import { alertCircle } from 'ionicons/icons'

    import displayToast from '@/functions/utils/displayToast.js';
	import getTimetable from '@/functions/fetch/GetTimetable.js'
	import * as moment from "moment";

    export default defineComponent({
        name: "FolderPage",
        components: {
			IonHeader,
			IonToolbar,
			IonButtons,
            //IonButton,
			IonBackButton,
			IonTitle,
			IonContent,
			IonList,
			IonItem,
			IonLabel,
			IonSpinner
		},
        props: {
            evenement1: {
                type: String,
                required: true,
            }
        },
		data() {
            let backTitle = 'Retour';

			// get current route
			let currentRoute = this.$router.currentRoute.value;

			if(currentRoute.name == "Schoollife") {
				backTitle = 'Vie scolaire';
			}

			return {
                backTitle: backTitle,
				evenement: null,
				moment: moment,
				dureeSuperieurUnJour: null,
				errorGetEDT: false,
				loadingEDT: true,
				alertCircle,
				coursManques: []
			}
		},
		methods: {
			between(x, min, max) {
				return x >= min && x <= max;
			}
		},
		async mounted() {
			// décodage de l'évènement
			let encoded = this.evenement1;

			let decoded = decodeURIComponent(encoded);

			let parsed = JSON.parse(decoded);

			this.evenement = parsed;

			// récupération de l'edt pour l'affichage des cours manqués
			let timetable = await getTimetable(moment(this.evenement.date.from).format("YYYY-MM-DD"))
			.catch(err => {
				this.errorGetEDT = true
				this.loadingEDT = false
				displayToast.presentToastFull("Impossible de récupérer l'emploi du temps", "Une erreur est survenue lors de la requête. Veuillez réessayer ultérieurement.", "danger", alertCircle, true, err)
			})
			if(typeof timetable !== "object") return;
			console.log(timetable)
			timetable.forEach(cour => {
				let courStart = moment(cour.time.start).valueOf()
				let courEnd = moment(cour.time.end).valueOf()
				if(this.between(courStart, moment(this.evenement.date.from).valueOf(), moment(this.evenement.date.to).valueOf())) {
					if(courStart === moment(this.evenement.date.to).valueOf()) return;
					if(this.between(courEnd, moment(this.evenement.date.from).valueOf(), moment(this.evenement.date.to).valueOf() - 1)) {
						this.coursManques.push({
							absInfo: {
								coursManque: false,
								manque: moment(this.evenement.date.to).valueOf() - courStart
							},
							...cour
						})
					}
					else {
						this.coursManques.push({
							absInfo: {
								coursManque: true
							},
							...cour
						})
					}
				}
			})
			console.log(this.coursManques)
			this.loadingEDT = false
			// vérification de la durée de l'absence pour l'affichage des infos
			moment(this.evenement.date.to).format("D") > moment(this.evenement.date.from).format("D") ? this.dureeSuperieurUnJour = true : this.dureeSuperieurUnJour = false
		}
    })
</script>

<template>
	<IonHeader class="AppHeader" translucent>
		<IonToolbar>
			<ion-buttons slot="start">
				<IonBackButton class="only-ios" :text="backTitle" @click="pop"></IonBackButton>
				<IonBackButton class="only-md" @click="pop"></IonBackButton>
			</ion-buttons>

			<ion-title v-if="this.evenement">{{ this.evenement.data.type }} du {{ moment(this.evenement.date.from).format("dddd D MMMM") }}</ion-title>
		</IonToolbar>
	</IonHeader>

	<ion-content :fullscreen="true" v-if="this.evenement">
		<div v-if="dureeSuperieurUnJour">
			<IonList inset>
				<IonItem>
					<IonLabel><p>Début de l'absence</p></IonLabel>
					<IonLabel slot="end">{{ moment(this.evenement.date.from).format("dddd D MMMM YYYY") }}</IonLabel>
				</IonItem>
				<IonItem>
					<IonLabel><p>Heure de début</p></IonLabel>
					<IonLabel slot="end">{{ new Date (this.evenement.date.from).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'}).split(' ')[1] }}</IonLabel>
				</IonItem>
				<IonItem>
					<IonLabel><p>Fin de l'absence</p></IonLabel>
					<IonLabel slot="end">{{ moment(this.evenement.date.to).format("dddd D MMMM YYYY") }}</IonLabel>
				</IonItem>
				<IonItem>
					<IonLabel><p>Heure de fin</p></IonLabel>
					<IonLabel slot="end">{{ new Date (this.evenement.date.to).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'}).split(' ')[1] }}</IonLabel>
				</IonItem>
				<IonItem>
					<IonLabel><p>Temps manqué</p></IonLabel>
					<IonLabel slot="end">{{ this.evenement.data.hours }}</IonLabel>
				</IonItem>
			</IonList>
		</div>
		<div v-else>
			<IonList inset>
				<IonItem>
					<IonLabel><p>Date de l'absence</p></IonLabel>
					<IonLabel slot="end">{{ moment(this.evenement.date.from).format("dddd D MMMM YYYY") }}</IonLabel>
				</IonItem>
				<IonItem>
					<IonLabel><p>Heure de début - fin</p></IonLabel>
					<IonLabel slot="end">{{ new Date (this.evenement.date.from).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'}).split(' ')[1] }} - {{ new Date (this.evenement.date.to).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'}).split(' ')[1] }}</IonLabel>
				</IonItem>
				<IonItem>
					<IonLabel><p>Temps manqué</p></IonLabel>
					<IonLabel slot="end">{{ this.evenement.data.hours }}</IonLabel>
				</IonItem>
			</IonList>
		</div>
		<IonList inset>
			<IonItem>
				<IonLabel><p>Motif</p></IonLabel>
				<IonLabel slot="end">{{  this.evenement.data.reasons[0] }}</IonLabel>
			</IonItem>
			<IonItem>
				<IonLabel><p>Justifié ?</p></IonLabel>
				<IonLabel slot="end" v-if="this.evenement.data.isJustified" color="success" class="aligne"><span class="material-symbols-outlined mdls">check</span> Oui</IonLabel>
				<IonLabel slot="end" v-else color="danger" class="aligne"><span class="material-symbols-outlined mdls">error</span> Non</IonLabel>
			</IonItem>
		</IonList>
		<IonList inset>
			<IonItem>
				<h4>Cours manqués</h4>
			</IonItem>
			<div class="warnMessage globalMessage" v-if="dureeSuperieurUnJour">
				<span class="material-symbols-outlined mdls icon">warning</span>
				<div class="messageText">
					<h2>Impossible d'afficher les cours manqués pour le moment</h2>
					<p class="description">Faute de méthode d'affichage de cours manqués sur plusieurs jours, les cours manqués pour les absences supérieures à 1 jour ne sont pas affichés.</p>
				</div>
			</div>
			<div class="globalMessage" v-if="loadingEDT && !dureeSuperieurUnJour">
				<ion-spinner class="icon"></ion-spinner>
				<div class="messageText">
					<h2>Chargement de l'emploi du temps...</h2>
				<p class="description">Pour afficher les cours manqués, nous devons charger votre emploi du temps. Cela ne devrait pas prendre trop de temps.</p>
				</div>
			</div>
			<div class="errorMessage globalMessage" v-if="errorGetEDT">
				<span class="material-symbols-outlined mdls icon">error</span>
				<div class="messageText">
					<h2>Impossible de charger l'emploi du temps</h2>
					<p class="description">Une erreur s'est produite pendant la récupération de votre emploi du temps. Veuillez réessayer ultérieurement.</p>
				</div>
			</div>
			<div v-if="!this.loadingEDT && !this.errorGetEDT">
				<IonItem button v-for="(cour, index) in this.coursManques" :key="index" :virtualIndex="index">
					<IonLabel class="ion-text-wrap">
						<h2><span class="courseColor" :style="`background: ${cour.course.color};`"></span> {{ cour.data.subject }} - de {{ new Date (cour.time.start).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'}).split(' ')[1] }} à {{ new Date (cour.time.end).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'}).split(' ')[1] }}</h2>
						<p v-if="cour.absInfo.courManque">Le cours entier a été manqué.</p>
						<p v-else>{{ new Date (cour.absInfo.manque).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'}).split(' ')[1] }} - {{ cour.absInfo.manque }} </p>
					</IonLabel>
				</IonItem>
			</div>
		</IonList>
	</ion-content>
</template>
<style scoped>
	.aligne {
		display: flex;
		align-items: center;
	}

	.warnMessage {
		background: var(--ion-color-warning) !important;
	}

	.errorMessage {
		background: var(--ion-color-danger) !important;
	}

	.globalMessage {
		background: transparent;
		margin: 20px;
		border-radius: 10px;

		display: flex;
		flex-direction: row;
		align-items: center;

		padding: 20px;
		gap: 20px;

		color: #fff;
	}

	.globalMessage * {
		margin: 0;
	}

	.globalMessage .icon {
		height: 44px;
		width: 44px;
		font-size: 30px;
		overflow: visible !important;

		color: #fff;
		opacity: 1 !important;
	}

	.globalMessage .messageText {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.globalMessage .messageText h2 {
		font-size: 18px;
	}

	.globalMessage .messageText .description {
		font-size: 15px;
		opacity: 0.7;
	}
	.courseColor {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	display: inline-block;
	margin-right: 5px;
}
</style>