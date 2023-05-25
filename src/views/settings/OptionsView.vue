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
		alertController,
		IonBackButton
	} from '@ionic/vue';

	import displayToast from '@/functions/utils/displayToast.js';
	import hapticsController from '@/functions/utils/hapticsController.js';
	import PapillonBackButton from '@/components/PapillonBackButton.vue';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonButtons,
			IonBackButton,
			IonList,
			IonItem,
			IonLabel,
			IonToggle,
			IonTitle,
			IonContent
		},
		data() {
			return {

			}
		},
		methods: {
			pop() {
				return false;
			},
			tickClick() {
				hapticsController.impact({
					style: 'light'
				});
			},
			changeTick(option) {
				this.tickClick();

				let el = this.$refs[option];
				let elChecked = el.$el.checked;

				localStorage.setItem(option, elChecked);

				document.dispatchEvent(new CustomEvent('settingsUpdated'));
			},
			changeGroupSubjects() {
				this.changeTick('groupSubjects');
				if (localStorage.getItem('groupSubjects') == 'true') {
					displayToast.presentNativeToast(
						'Les matières sont désormais regroupées'
					);
				} else {
					localStorage.removeItem('excludedGroupSubjects');
					displayToast.presentNativeToast(
						'Les matières sont désormais séparées'
					);
				}
			},
			async disabledDaysChanges() {
				try {
					window.nav.value.$el.pop()
					const disabledDays = JSON.parse(localStorage.getItem('disabledDays')) || [];

					const alert = await alertController.create({
						header: 'Sélectionnez les jours désactivés',
						buttons: ['OK'],
						inputs: [
							{
								label: 'Lundi',
								type: 'checkbox',
								value: 1,
								checked: disabledDays.includes(1),
							},
							{
								label: 'Mardi',
								type: 'checkbox',
								value: 2,
								checked: disabledDays.includes(2),
							},
							{
								label: 'Mercredi',
								type: 'checkbox',
								value: 3,
								checked: disabledDays.includes(3),
							},
							{
								label: 'Jeudi',
								type: 'checkbox',
								value: 4,
								checked: disabledDays.includes(4),
							},
							{
								label: 'Vendredi',
								type: 'checkbox',
								value: 5,
								checked: disabledDays.includes(5),
							},
							{
								label: 'Samedi',
								type: 'checkbox',
								value: 6,
								checked: disabledDays.includes(6),
							},
							{
								label: 'Dimanche',
								type: 'checkbox',
								value: 0,
								checked: disabledDays.includes(0),
							},
						],
					});

					await alert.present();
					const data = await alert.onDidDismiss();

					localStorage.setItem('disabledDays', JSON.stringify(data.data.values));
				} catch (error) {
					console.error("[Change days disabled]: " + error);
					displayToast.presentNativeToast(
						'Une erreur est survenue'
					);
				}
			}
		},
		mounted() {
			// get tweakGrades20 ref
			let tweakGrades20 = this.$refs.tweakGrades20;
			tweakGrades20.$el.checked = localStorage.getItem('tweakGrades20') == 'true';

			// get viescolaireEnabled ref
			let viescolaireEnabled = this.$refs.viescolaireEnabled;
			viescolaireEnabled.$el.checked = localStorage.getItem('viescolaireEnabled') == 'true';

			// get groupSubjects ref
			let groupSubjects = this.$refs.groupSubjects;
			groupSubjects.$el.checked = localStorage.getItem('groupSubjects') == 'true';

			// get disableHolidays ref
			let disableHolidays = this.$refs.disableHolidays;
			disableHolidays.$el.checked = localStorage.getItem('disableHolidays') == 'true';

			// get disableConfetti ref
			let disableConfetti = this.$refs.disableConfetti;
			disableConfetti.$el.checked = localStorage.getItem('disableConfetti') == 'true';

			// get disableShowGroup ref
			let disableShowGroup = this.$refs.disableShowGroup;
			disableShowGroup.$el.checked = localStorage.getItem('disableShowGroup') == 'true';
		}
	});
</script>

<template>
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>
				<ion-buttons slot="start">
					<IonBackButton class="only-ios" text="Paramètres" @click="pop"></IonBackButton>
					<IonBackButton class="only-md" @click="pop"></IonBackButton>
				</ion-buttons>

				<ion-title>Options</ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-header collapse="condense">
				<ion-toolbar>
					<ion-title size="large">Options de Papillon</ion-title>
				</ion-toolbar>
			</ion-header>

			<IonLabel class="listGroupTitle">
				<p>Onlget Notes</p>
			</IonLabel>

			<IonList class="listGroup" lines="inset">
				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">nest_thermostat_zirconium_eu</span>
					<IonLabel class="ion-text-wrap">
						<h2>Remettre les notes sur 20</h2>
						<p>Uniformise le barème de toutes les notes</p>
					</IonLabel>
					<IonToggle slot="end" ref="tweakGrades20" @ionChange="changeTick('tweakGrades20')"></IonToggle>
				</IonItem>

				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">join_inner</span>
					<IonLabel class="ion-text-wrap">
						<h2>Joindre les matières identiques</h2>
						<p>Permet de joindre les matières identiques entre-elles</p>
					</IonLabel>
					<IonToggle slot="end" ref="groupSubjects" @ionChange="changeGroupSubjects('groupSubjects')"></IonToggle>
				</IonItem>
			</IonList>

			<IonLabel class="listGroupTitle">
				<p>Onglets & calendrier</p>
			</IonLabel>

			<IonList class="listGroup" lines="inset">
				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">holiday_village</span>
					<IonLabel class="ion-text-wrap">
						<h2>Vacances désactivées</h2>
						<p>Désactiver les vacances et jours fériés du calendrier</p>
					</IonLabel>
					<IonToggle slot="end" ref="disableHolidays" @ionChange="changeTick('disableHolidays')"></IonToggle>
				</IonItem>

				<IonItem button @click="disabledDaysChanges()">
					<span class="material-symbols-outlined mdls" slot="start">event_busy</span>
					<IonLabel class="ion-text-wrap">
						<h2>Contraintes journalières du calendrier</h2>
						<p>Désactiver certains jours de la semaine du calendrier</p>
					</IonLabel>
				</IonItem>

				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">gavel</span>
					<IonLabel class="ion-text-wrap">
						<h2>Activer l'onglet vie scolaire</h2>
						<p>Active l'onglet de vie scolaire</p>
					</IonLabel>
					<IonToggle slot="end" ref="viescolaireEnabled" @ionChange="changeTick('viescolaireEnabled')"></IonToggle>
				</IonItem>
			</IonList>

			<IonLabel class="listGroupTitle">
				<p>Emploi du temps</p>
			</IonLabel>

			<IonList class="listGroup" lines="inset">
				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">groups</span>
					<IonLabel class="ion-text-wrap">
						<h2>Afficher le groupe pour les cours</h2>
						<p>Autorise le groupe d'un cours à s'afficher dans l'emploi du temps</p>
					</IonLabel>
					<IonToggle slot="end" ref="disableShowGroup" @ionChange="changeTick('disableShowGroup')"></IonToggle>
				</IonItem>
			</IonList>

			<IonLabel class="listGroupTitle">
				<p>Page d'accueil</p>
			</IonLabel>

			<IonList class="listGroup" lines="inset">
				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">celebration</span>
					<IonLabel class="ion-text-wrap">
						<h2>Ne pas faire apparaître de confettis</h2>
						<p>Retirer les confettis lorsqu'un devoir est coché sur l'accueil</p>
					</IonLabel>
					<IonToggle slot="end" ref="disableConfetti" @ionChange="changeTick('disableConfetti')"></IonToggle>
				</IonItem>
			</IonList>
		</ion-content>
</template>

<style scoped>
	.md .paddingFixMd {
		padding-left: 15px;
	}

	ion-item .mdls[slot=start] {
		width: auto;
		padding: 7px;
		background-color: #00000012;
		border-radius: 300px;

		margin-right: 20px;
	}

	.dark ion-item .mdls[slot=start] {
		background-color: #ffffff22;
	}
</style>
