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
		IonTitle,
		IonContent,
		IonSkeletonText,
		IonChip,
		IonBackButton
	} from '@ionic/vue';

	import PapillonBackButton from '@/components/PapillonBackButton.vue';

	import GetGrades from '@/functions/fetch/GetGrades.js';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonButtons,
			IonBackButton,
			IonTitle,
			IonContent,
			IonSkeletonText,
			IonList,
			IonItem,
			IonLabel,
			IonChip
		},
		props: {
			markID: {
				type: String,
				required: true,
			}
		},
		data() {
			let backTitle = 'Retour';

			// get current route
			let currentRoute = this.$router.currentRoute.value;

			if(currentRoute.name == "Grades") {
				backTitle = 'Notes';
			}

			return {
				backTitle: backTitle,
				grades: [],
				currentGrade: null,
				diffAvg: 0,
				diffClassAvg: 0,
				diffSubjectAvg: 0
			}
		},
		methods: {
			findGrade(id) {
				GetGrades().then((data) => {
					data.marks.forEach((subject) => {
						subject.marks.forEach((mark) => {
							this.grades.push(mark);
						});
					});

					this.grades.forEach((grade) => {
						if(grade.id === id) {
							this.currentGrade = grade;

							this.getAverageInfluence();
							this.getAverageClassInfluence();
							this.getAverageSubjectInfluence();
						}
					});
				});
			},
			getAverage(grades, classAvg) {
				let allGrades = {};

				for (let i = 0; i < grades.length; i++) {
					if(grades[i].info.significant === false && grades[i].info.significantZero === false) continue;

					let val = parseFloat(grades[i].grade.value);

					if(classAvg) val = parseFloat(grades[i].grade.average);

					let out_of = parseInt(grades[i].grade.out_of);

					let out20 = (val / out_of) * 20;

					// create key if not exists
					if(!allGrades[grades[i].info.subject]) {
						allGrades[grades[i].info.subject] = {};

						allGrades[grades[i].info.subject].grades = 0;
						allGrades[grades[i].info.subject].count = 0;
					}

					allGrades[grades[i].info.subject].grades += out20 * grades[i].grade.coefficient;
					allGrades[grades[i].info.subject].count += grades[i].grade.coefficient;
				}

				// calculate average of each subject
				for (const subject in allGrades) {
					allGrades[subject].average = allGrades[subject].grades / allGrades[subject].count;
				}

				// calculate average of all subjects
				let total = 0;
				let count = 0;

				for (const subject in allGrades) {
					total += allGrades[subject].average;
					count++;
				}

				return total / count;
			},
			getSimpleAverage(grades) {
				let allGrades = {
					grades: 0,
					count: 0
				};

				for (let i = 0; i < grades.length; i++) {
					if(grades[i].info.significant === false && grades[i].info.significantZero === false) continue;

					let val = parseFloat(grades[i].grade.value);

					let out_of = parseInt(grades[i].grade.out_of);

					let out20 = (val / out_of) * 20;

					allGrades.grades += out20 * grades[i].grade.coefficient;
					allGrades.count += grades[i].grade.coefficient;
				}

				return allGrades.grades / allGrades.count;
			},
			getAverageInfluence() {
				// get current average
				let currentAverage = this.getAverage(this.grades, false);

				// get average without current mark
				let newGrades = this.grades.filter((grade) => {
					return grade.id !== this.currentGrade.id;
				});

				let newAverage = this.getAverage(newGrades, false);

				// get difference
				let difference = currentAverage - newAverage;

				this.diffAvg = difference;
			},
			getAverageClassInfluence() {
				// get current average
				let currentAverage = this.getAverage(this.grades, true);

				// get average without current mark
				let newGrades = this.grades.filter((grade) => {
					return grade.id !== this.currentGrade.id;
				});

				let newAverage = this.getAverage(newGrades, true);

				// get difference
				let difference = currentAverage - newAverage;

				this.diffClassAvg = difference;
			},
			getAverageSubjectInfluence() {
				let subjectGrades = this.grades.filter((grade) => {
					return grade.info.subject === this.currentGrade.info.subject;
				});

				// get current average
				let currentAverage = this.getSimpleAverage(subjectGrades, false);

				// get average without current mark
				let newGrades = subjectGrades.filter((grade) => {
					return grade.id !== this.currentGrade.id;
				});

				let newAverage = this.getSimpleAverage(newGrades, false);

				// get difference
				let difference = currentAverage - newAverage;

				this.diffSubjectAvg = difference;
			}
		},
		mounted() {
			this.findGrade(this.markID);

			return false;
		}
	});
</script>

<template>
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<IonBackButton class="only-ios" :text="backTitle" @click="pop"></IonBackButton>
					<IonBackButton class="only-md" @click="pop"></IonBackButton>
				</ion-buttons>

				<ion-title v-if="currentGrade">{{ currentGrade.info.description }}</ion-title>
				<ion-title v-else><ion-skeleton-text style="width: 200px;"></ion-skeleton-text></ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<div v-if="currentGrade">
				<IonList inset>
					<IonItem class="avgs">
						<IonLabel>
							<p>Note</p>
							
							<h1 v-if="currentGrade.info.significant">{{ currentGrade.grade.value }}<small>/{{ currentGrade.grade.out_of }}</small></h1>
							<h1 v-else>{{ currentGrade.info.significantReason }}<small>/{{ currentGrade.grade.out_of }}</small></h1>
						</IonLabel>

						<IonLabel>
							<p>Coef.</p>
							<h2>{{ currentGrade.grade.coefficient }}</h2>
						</IonLabel>

						<IonLabel v-if="currentGrade.info.optional || currentGrade.info.bonus || currentGrade.info.outOf20">
							<ion-chip color="success" v-if="currentGrade.info.bonus">Bonus</ion-chip>
							<ion-chip color="warning" v-if="currentGrade.info.optional">Optionnel</ion-chip>
							<ion-chip color="primary" v-if="currentGrade.info.outOf20">Ramenée à 20</ion-chip>
						</IonLabel>
					</IonItem>
				</IonList>

				<IonList inset>
					<IonItem class="avgs" v-if="!isNaN(currentGrade.grade.min)">
						<IonLabel>
							<p>Note -</p>
							<h2>{{ parseFloat(currentGrade.grade.min).toFixed(2) }}<small>/{{ currentGrade.grade.out_of }}</small></h2>
						</IonLabel>
						<IonLabel>
							<p>Classe</p>
							<h2>{{ parseFloat(currentGrade.grade.average).toFixed(2) }}<small>/{{ currentGrade.grade.out_of }}</small></h2>
						</IonLabel>
						<IonLabel>
							<p>Note +</p>
							<h2>{{ parseFloat(currentGrade.grade.max).toFixed(2) }}<small>/{{ currentGrade.grade.out_of }}</small></h2>
						</IonLabel>
					</IonItem>
					<IonItem class="avgs" v-if="isNaN(currentGrade.grade.min)">
						<h2><small>Les moyennes ne sont pas disponibles pour cette note</small></h2>
					</IonItem>
				</IonList>

				<IonList inset>
					<IonItem>
						<IonLabel><p>Matière</p></IonLabel>
						<IonLabel slot="end">{{ currentGrade.info.subject }}</IonLabel>
					</IonItem>
					<IonItem>
						<IonLabel><p>Évaluation</p></IonLabel>
						<IonLabel slot="end">{{ currentGrade.info.description }}</IonLabel>
					</IonItem>
					<IonItem>
						<IonLabel><p>Rendu le</p></IonLabel>
						<IonLabel slot="end">{{ new Date(currentGrade.info.date).toLocaleString('fr-FR', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}) }}</IonLabel>
					</IonItem>
				</IonList>

				<IonList inset>
					<IonItem>
						<IonLabel><p>Influence sur la moyenne</p></IonLabel>

						<IonLabel v-if="diffAvg > 0 && !isNaN(currentGrade.grade.min)" class="posMoyAdd" slot="end"><h2>+{{ diffAvg.toFixed(2) }} pts</h2></IonLabel>
						<IonLabel v-else class="negMoyAdd" slot="end"><h2>{{ isNaN(currentGrade.grade.min) ? "Moyenne indisponible" : diffAvg.toFixed(2) + " pts" }} </h2></IonLabel>
					</IonItem>
					<IonItem v-if="!isNaN(diffSubjectAvg)">
						<IonLabel><p>Influence sur la matière</p></IonLabel>
						<IonLabel slot="end"><span v-if="diffSubjectAvg > 0">+</span>{{ isNaN(currentGrade.grade.min) ? "Moyenne indisponible" : diffSubjectAvg.toFixed(2) + " pts" }}</IonLabel>
					</IonItem>
				</IonList>

				<IonList inset>
					<IonItem>
						<IonLabel><p>Influence sur la classe</p></IonLabel>
						<IonLabel slot="end"><span v-if="diffClassAvg > 0">+</span>{{ isNaN(currentGrade.grade.min) ? "Moyenne indisponible" : diffClassAvg.toFixed(2) + " pts" }}</IonLabel>
					</IonItem>
				</IonList>
			</div>
		</ion-content>
</template>

<style scoped>
	h1, h2, h3 {
		font-weight: 600 !important;
	}

	h1 small {
		font-weight: 400 !important;
	}

	.avgs::part(native) {
		display: flex;
		justify-content: space-between;
		text-align: center;
	}

	.posMoyAdd {
		color: var(--ion-color-success);
	}

	.negMoyAdd {
		color: var(--ion-color-danger);
	}
</style>