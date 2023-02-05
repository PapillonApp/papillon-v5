<script>
	import { defineComponent } from 'vue';
	import {
		IonHeader,
		IonContent,
		IonToolbar,
		IonTitle,
		IonMenuButton,
		IonPage,
		IonButtons,
		IonList,
		IonListHeader,
		IonLabel,
		IonItem,
		IonCard,
		IonSkeletonText,
		IonSegment,
		IonSegmentButton,
		IonModal,
		IonSearchbar,
		IonSpinner
	} from '@ionic/vue';

	import displayToast from '@/functions/utils/displayToast.js';

	import GetGrades from '@/functions/fetch/GetGrades.js';
	import ChangePeriod from '@/functions/login/ChangePeriod.js';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonContent,
			IonToolbar,
			IonTitle,
			IonMenuButton,
			IonPage,
			IonButtons,
			IonCard,
			IonItem,
			IonLabel,
			IonList,
			IonModal,
			IonListHeader,
			IonSkeletonText,
			IonSegment,
			IonSegmentButton,
			IonSearchbar,
			IonSpinner
		},
		data() {
			return {
				grades: [],
				fullGrades: [],
				averages: [],
				classAverages: [],
				isLoading: false,
				periods: [],
				current_period: [],
				base_period: [],
				segChangeTimeout: false,
				changePeriodSelection: localStorage.getItem('changePeriodSelection') == "true" ? true : false,
				selectedMark: {
					subject: "",
					average: 0,
					class_average: 0,
					max_average: 0,
					min_average: 0,
					out_of: 0,
				},
				selectedGrade: [],
				selectedGradeSet: false,
				out_of_20: localStorage.getItem('tweakGrades20') == "true" ? true : false,
			}
		},
		methods: {
			getRandomColor() {
				var color = '#';
				for (var i = 0; i < 6; i++) {
					color += Math.floor(Math.random() * 10);
				}
				return color;
			},
			LightenColor(color, percent) {
				var num = parseInt(color, 16),
					amt = Math.round(2.55 * percent),
					R = (num >> 16) + amt,
					B = (num >> 8 & 0x00FF) + amt,
					G = (num & 0x0000FF) + amt;

				return (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) *
					0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
			},
			darkenHexColor(col) {
				return '#' + this.LightenColor(col.split("#")[1], -40);
			},
			getPeriods() {
				let allPeriods = JSON.parse(localStorage.getItem('userData')).periods;

				// find period with actual = true
				let actualPeriod = allPeriods.find(period => period.actual == true);

				if (localStorage.getItem('currentPeriod')) {
					actualPeriod = JSON.parse(localStorage.getItem('currentPeriod'));
				}

				this.current_period = actualPeriod;
				this.base_period = actualPeriod;

				// if first period contains "Trimestre", add all trimesters
				if (actualPeriod.name.includes("Trimestre")) {
					for (let i = 0; i < allPeriods.length; i++) {
						if (allPeriods[i].name.includes("Trimestre")) {
							this.periods.push(allPeriods[i]);
						}
					}
				}

				// if first period contains "Semestre", add all semesters
				if (actualPeriod.name.includes("Semestre")) {
					for (let i = 0; i < allPeriods.length; i++) {
						if (allPeriods[i].name.includes("Semestre")) {
							this.periods.push(allPeriods[i]);
						}
					}
				}
			},
			segChange() {
				if (!this.segChangeTimeout) {
					let newSegment = this.$refs.segment.$el.value;

					// get corresponding period name from id
					let newPeriod = this.periods.find(period => period.id == newSegment);

					// save in localstorage
					localStorage.setItem('currentPeriod', JSON.stringify(newPeriod));

					// change current period
					ChangePeriod(newPeriod.name).then(() => {
							this.getGradesRefresh(true);
							this.current_period = newPeriod;
						})
						.catch(() => {
							this.$refs.segment.$el.value = this.base_period.id;
						});
				}
			},
			openAverageModal(subject) {
				this.selectedMark = {
					subject: subject.name,
					average: subject.average,
					class_average: subject.class.average,
					max_average: subject.class.max,
					min_average: subject.class.min,
					out_of: 20,
					grouped: subject.grouped,
				}

				this.$refs.averageModal.$el.present(subject);
			},
			editMarks(grades) {
				let out_of_20 = this.out_of_20;

				grades.forEach(subject => {
					subject.marks.forEach(mark => {
						// if out of 20 make it out of 20
						if (out_of_20) {
							mark.grade.updated_value = parseFloat(mark.grade.value) / parseFloat(
								mark.grade.out_of) * 20;

							mark.grade.updated_value = mark.grade.updated_value.toFixed(2);
							mark.grade.updated_out_of = 20;
						}
					});
				});

				return grades;
			},
			setExcludedJoinSubject(subjectName) {
				let excludedGroupSubjects = localStorage.getItem('excludedGroupSubjects');

				excludedGroupSubjects = JSON.parse(excludedGroupSubjects) || [];
				excludedGroupSubjects.push(subjectName);

				localStorage.setItem('excludedGroupSubjects', JSON.stringify(excludedGroupSubjects));
				this.getGradesRefresh();
				this.$refs.averageModal.$el.dismiss();

				displayToast.presentToast("Cette matière ne sera désormais plus regroupé.", "warning");
			},
			getGradesRefresh(fromSegChange) {
				if (fromSegChange) {
					this.segChangeTimeout = true;
					this.isLoading = true;
				}

				GetGrades(true).then((data) => {
					if (fromSegChange) {
						this.segChangeTimeout = false;

						this.isLoading = false;
					}

					this.grades = this.editMarks(data.marks);
					this.fullGrades = this.editMarks(data.marks);

					this.averages = data.averages;
					this.isLoading = false;

					this.classAverages = data.averages.class;
				})
			},
			handleRefresh(event) {
				// get new Grades data
				this.getGradesRefresh()

				// stop refresh when this.grades is updated
				this.$watch('grades', () => {
					setTimeout(() => {
						event.target.complete();
					}, 200);
				});
			},
			searchGrades() {
				let search1 = this.$refs.searchBarIos.$el.value;
				let search2 = this.$refs.searchBarMd.$el.value;


				if (search1 == "" && search2 == "") {
					this.grades = this.fullGrades;
				} else {
					let search = search1 == "" ? search2 : search1;
					this.grades = this.fullGrades.filter(subject => {
						return subject.name.toLowerCase().includes(search.toLowerCase());
					});
				}
			},
			openGradeModal(mark) {
				this.selectedGrade = mark;

				this.selectedGradeSet = true;
				this.$refs.gradeModal.$el.present();

				console.log(this.selectedGrade);
			},
		},
		mounted() {
			this.isLoading = true;

			GetGrades().then((data) => {
				this.grades = this.editMarks(data.marks);
				this.fullGrades = this.editMarks(data.marks);

				this.averages = data.averages;
				this.isLoading = false;

				this.classAverages = data.averages.class;
			});

			this.getPeriods();

			document.addEventListener('tokenUpdated', () => {
				GetGrades().then((data) => {
					this.grades = this.editMarks(data.marks);
					this.fullGrades = this.editMarks(data.marks);
					this.averages = data.averages;
					this.isLoading = false;

					this.classAverages = data.averages.class;
				});
			});

			document.addEventListener('settingsUpdated', () => {
				GetGrades().then((data) => {
					this.out_of_20 = localStorage.getItem('tweakGrades20') == "true" ? true :
					false;
					this.grades = this.editMarks(data.marks);
					this.fullGrades = this.editMarks(data.marks);
					this.averages = data.averages;
					this.isLoading = false;

					this.classAverages = data.averages.class;
				});

				this.changePeriodSelection = localStorage.getItem('changePeriodSelection') == "true" ?
					true : false;
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

				<ion-title mode="md">Notes</ion-title>

				<ion-spinner slot="end" v-if="isLoading"></ion-spinner>
			</IonToolbar>
			<IonToolbar class="only-md">
				<IonSearchbar ref="searchBarMd" placeholder="Chercher une matière..." @ionChange="searchGrades()">
				</IonSearchbar>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>

			<IonHeader collapse="condense">
				<IonToolbar>
					<ion-title size="large">Notes</ion-title>
				</IonToolbar>
				<IonToolbar>
					<IonSearchbar ref="searchBarIos" placeholder="Chercher une matière..." @ionChange="searchGrades()">
					</IonSearchbar>
				</IonToolbar>
			</IonHeader>

			<div id="noTouchZone"></div>

			<ion-segment v-if="periods.length > 0 && changePeriodSelection" id="segment" :value="current_period.id"
				ref="segment" @ionChange="segChange()">
				<ion-segment-button v-for="(period, i) in periods" :key="i" :value="period.id" :id="period.id">
					<ion-label>{{period.name}}</ion-label>
				</ion-segment-button>
			</ion-segment>

			<div v-if="isLoading">
				<ion-card class="subject" v-for="i in 6" v-bind:key="i">
					<div class="subject-name" style="padding: 15px 15px">
						<ion-skeleton-text :animated="true" style="width: 50%;"></ion-skeleton-text>
						<ion-skeleton-text class="avg" :animated="true" style="width: 20%;"></ion-skeleton-text>
					</div>
					<div class="grades">
						<ion-card class="grade" v-for="i in 3" v-bind:key="i">
							<div class="myGrade" style="width: 135px;">
								<ion-skeleton-text :animated="true" style="width: 50%;"></ion-skeleton-text>
								<br />
								<ion-skeleton-text :animated="true" style="width: 40%;"></ion-skeleton-text>
							</div>
							<div class="grades">
								<ion-skeleton-text class="average" :animated="true"></ion-skeleton-text>

								<ion-skeleton-text class="average" :animated="true"></ion-skeleton-text>

								<ion-skeleton-text class="average" :animated="true"></ion-skeleton-text>
							</div>
						</ion-card>
					</div>
				</ion-card>
			</div>

			<ion-card class="subject" v-for="(subject, index) in grades" v-bind:key="index"
				:style="`--backgroundTheme: ${ subject.color };`">
				<div class="subject-name" @click="openAverageModal(subject)">
					<h3>
						{{subject.name}}
						<span class="material-symbols-outlined mdls" v-if="subject.grouped">join_inner</span>
					</h3>
					<p class="avg" v-if="subject.significant">{{subject.average.toFixed(2)}}<small>/20</small></p>
					<p class="avg" v-if="!subject.significant">{{subject.significantReason}}<small>/20</small></p>
				</div>

				<div class="grades">

					<ion-card class="grade" v-for="(mark, i) in subject.marks" v-bind:key="i" @click="openGradeModal(mark)">
						<div class="myGrade">
							<p class="name">{{ mark.info.description }}</p>
							<p class="coef">Coeff. : {{mark.grade.coefficient}}</p>

							<p class="grd main" v-if="mark.info.significant && !mark.grade.updated_value">
								{{mark.grade.value}}<small>/{{mark.grade.out_of}}</small></p>
							<p class="grd main" v-else-if="mark.grade.updated_value && mark.info.significant">
								{{mark.grade.updated_value}}<small>/{{mark.grade.updated_out_of}}</small></p>
							<p class="coef" v-if="mark.grade.updated_value && mark.info.significant">
								{{mark.grade.value}}<small>/{{mark.grade.out_of}}</small></p>

							<!-- si absent -->
							<p class="grd main" v-if="!mark.info.significant">
								{{ mark.info.significantReason }}<small>/{{mark.grade.out_of}}</small></p>
							<p class="coef" v-if="mark.grade.original_value && !mark.info.significant"><br /></p>
						</div>
						<div class="averages" v-if="mark.info.significantAverage">
							<div class="average">
								<p class="grd">{{mark.grade.min}}<small>/{{mark.grade.out_of}}</small></p>
								<p>Min.</p>
							</div>

							<div class="average class">
								<p class="grd">{{mark.grade.average}}<small>/{{mark.grade.out_of}}</small></p>
								<p>Classe</p>
							</div>

							<div class="average">
								<p class="grd">{{mark.grade.max}}<small>/{{mark.grade.out_of}}</small></p>
								<p>Max.</p>
							</div>
						</div>

						<div class="averages" v-if="!mark.info.significantAverage">
							<div class="average unique">
								<p class="grd">{{ mark.info.significantReason }}</p>
								<p>Classe</p>
							</div>
						</div>

					</ion-card>

				</div>
			</ion-card>

			<div v-if="!isLoading">
				<div class="NoCours" v-if="this.grades.length == 0">
					<span class="material-symbols-outlined mdls">insights</span>
					<h2>Pas de notes ajoutées pour cette période</h2>
					<p>Réesayez avec une autre période à l'aide du sélecteur.</p>
				</div>
			</div>

			<IonList v-if="this.grades.length != 0">
				<IonListHeader>
					<IonLabel>
						<h2>Moyennes</h2>
					</IonLabel>
				</IonListHeader>

				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">person</span>
					<IonLabel>
						<p>Moyenne générale</p>
						<h2>{{ averages.average.toFixed(2) }}<small>/20</small></h2>
					</IonLabel>
				</IonItem>
				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">groups</span>
					<IonLabel>
						<p>Moyenne de classe</p>
						<h2>{{ classAverages.average.toFixed(2) }}<small>/20</small></h2>
					</IonLabel>
				</IonItem>
				<div style="display:flex">
					<IonItem>
						<span class="material-symbols-outlined mdls" slot="start">swap_vert</span>
						<IonLabel>
							<p>Meilleure moyenne</p>
							<h2>{{ classAverages.max.toFixed(2) }}<small>/20</small></h2>
						</IonLabel>
					</IonItem>
					<IonItem>
						<IonLabel>
							<p>Moins bonne moyenne</p>
							<h2>{{ classAverages.min.toFixed(2) }}<small>/20</small></h2>
						</IonLabel>
					</IonItem>
				</div>
			</IonList>

			<br /> <br />

			<IonModal ref="gradeModal" :keep-contents-mounted="true" :initial-breakpoint="0.5"
				:breakpoints="[0, 0.5, 0.9]" :handle="true" :canDismiss="true">
				<IonHeader>
					<IonToolbar class="markToolbar">
						<ion-label v-if="selectedGradeSet">
							<h2>Note en {{ selectedGrade.info.subject }}</h2>
							<p>{{ new Date(selectedGrade.info.date).toLocaleString('fr-FR', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}) }}</p>
						</ion-label>
					</IonToolbar>
				</IonHeader>
				<ion-content>
					<ion-list v-if="selectedGradeSet">
						<ion-item>
							<span class="material-symbols-outlined mdls" slot="start">face</span>
							<ion-label>
								<p>Note de l'élève</p>
								<h2>{{ parseFloat(selectedGrade.grade.value).toFixed(2) }}<small>/{{ selectedGrade.grade.out_of }}</small></h2>
							</ion-label>

							<ion-item slot="end" lines="none">
								<span class="material-symbols-outlined mdls" slot="start">percent</span>
								<ion-label>
									<p>Coefficient</p>
									<h2>{{selectedGrade.grade.coefficient}}</h2>
								</ion-label>
							</ion-item>
						</ion-item>
						<ion-item>
							<span class="material-symbols-outlined mdls" slot="start">groups</span>
							<ion-label>
								<p>Note de la classe</p>
								<h2>{{ parseFloat(selectedGrade.grade.average).toFixed(2) }}<small>/{{ selectedGrade.grade.out_of }}</small></h2>
							</ion-label>
						</ion-item>
						<ion-item>
							<span class="material-symbols-outlined mdls" slot="start">person</span>
							<ion-label>
								<p>Note la plus basse</p>
								<h2>{{ parseFloat(selectedGrade.grade.min).toFixed(2) }}<small>/{{ selectedGrade.grade.out_of }}</small></h2>
							</ion-label>
						</ion-item>
						<ion-item>
							<span class="material-symbols-outlined mdls" slot="start">person</span>
							<ion-label>
								<p>Note la plus haute</p>
								<h2>{{ parseFloat(selectedGrade.grade.max).toFixed(2) }}<small>/{{ selectedGrade.grade.out_of }}</small></h2>
							</ion-label>
						</ion-item>
					</ion-list>
				</ion-content>
			</IonModal>

			<IonModal ref="averageModal" :keep-contents-mounted="true" :initial-breakpoint="0.5"
				:breakpoints="[0, 0.5, 0.9]" :handle="true" :canDismiss="true">
				<IonHeader>
					<IonToolbar>
						<ion-title>{{ selectedMark.subject }}</ion-title>
					</IonToolbar>
				</IonHeader>
				<ion-content>
					<ion-list>
						<ion-item>
							<span class="material-symbols-outlined mdls" slot="start">face</span>
							<ion-label>
								<p>Ma moyenne</p>
								<h2>{{ selectedMark.average }}<small>/20</small></h2>
							</ion-label>
						</ion-item>

						<ion-item>
							<span class="material-symbols-outlined mdls" slot="start">school</span>
							<ion-label>
								<p>Moyenne de classe</p>
								<h2>{{ selectedMark.class_average }}<small>/20</small></h2>
							</ion-label>
						</ion-item>

						<ion-item>
							<span class="material-symbols-outlined mdls" slot="start">person_remove</span>
							<ion-label>
								<p>Moyenne la plus basse</p>
								<h2>{{ selectedMark.min_average }}<small>/20</small></h2>
							</ion-label>
						</ion-item>

						<ion-item>
							<span class="material-symbols-outlined mdls" slot="start">person_add</span>
							<ion-label>
								<p>Moyenne la haute</p>
								<h2>{{ selectedMark.max_average }}<small>/20</small></h2>
							</ion-label>
						</ion-item>

						<ion-item v-if="selectedMark.grouped">
							<span class="material-symbols-outlined mdls" slot="start">join</span>
							<ion-label class="ion-text-wrap">
								<p>Combinaison</p>
								<h3>Cette matière est un regroupement de plusieurs matière.</h3>
							</ion-label>

							<ion-button class="itemBtn" fill="clear" slot="end"
								@click="setExcludedJoinSubject(selectedMark.subject)">
								<span class="material-symbols-outlined mdls" slot="start">visibility_off</span>
								Ne pas regrouper
							</ion-button>
						</ion-item>
					</ion-list>
				</ion-content>
			</IonModal>

		</ion-content>
	</ion-page>
</template>

<style scoped>
	.subject-name {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 15px;
		background: linear-gradient(90deg, #00000055 0%, #00000055 100%), var(--backgroundTheme);
	}

	.subject-name * {
		margin: 0;
		padding: 0;
		color: #fff;
	}

	.subject-name h3 {
		font-size: 1rem;
		font-weight: 500;
	}

	.subject-name h3 span {
		margin-left: 5px;
		font-size: 0.8rem;
		font-weight: 400;
		vertical-align: middle;
		opacity: 60%;
	}

	.subject-name p {
		font-size: 1rem;
		font-weight: 400;
	}

	.subject-name p small {
		font-size: 0.8rem;
		font-weight: 400;
		opacity: 50%;
	}

	.grades * {
		margin: 0;
		padding: 0;
	}

	.grades {
		padding: 15px 15px;
		display: flex;
		gap: 15px;
		overflow-y: scroll;
	}

	.grade {
		width: 100%;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		min-width: fit-content;
		max-width: fit-content;
		isolation: isolate;
		overflow: hidden;
	}

	@media screen and (prefers-color-scheme: dark) {
		.grade {
			background: var(--ion-color-step-50);
		}
	}

	.myGrade {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		border-bottom: 1px solid var(--ion-color-step-100);
		padding: 10px 10px;
	}

	.myGrade p.grd {
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--ion-text-color);
		margin-top: 5px;
		font-family: var(--papillon-font) !important;
	}

	.myGrade p.name {
		font-size: 1rem;
		font-weight: 500;
		color: var(--ion-text-color);
		width: 130px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.myGrade p.coef {
		font-size: 0.8rem;
		font-weight: 400;
		opacity: 50%;
	}

	.myGrade .grd small {
		font-size: 1rem;
		font-weight: 400;
		opacity: 50%;
	}

	.averages {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 10px;
		gap: 10px;
	}

	.average {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
	}

	.average p.grd {
		font-size: 1rem;
		font-weight: 500;
		color: var(--ion-text-color);
		font-family: var(--papillon-font) !important;
	}

	.average p.grd small {
		font-size: 0.8rem;
		font-weight: 400;
		opacity: 50%;
	}

	.average p:not(.grd) {
		font-size: 0.8rem;
		font-weight: 400;
		opacity: 50%;
	}

	.average.unique {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
	}

	.ios .grade {
		border: 1px solid var(--ion-color-step-50);
		border-radius: 8px;
	}

	.ios .myGrade {
		border: none;
		background: linear-gradient(90deg, #00000055 0%, #00000055 100%), var(--backgroundTheme);
	}

	.ios .myGrade * {
		color: #fff !important;
	}

	.ios #segment {
		width: calc(100vw - 24px);
		margin: 0 12px;
	}

	.md .grade {
		border: 1px solid var(--ion-color-step-150);
		--background: none;
		box-shadow: none;
		border-radius: 8px;
	}

	ion-spinner {
		margin-right: 20px;
	}

	.markToolbar {
		margin: 0 !important;
	}

	.markToolbar ion-label * {
		text-align: center;
		margin: 0;
	}

	.markToolbar h2 {
		margin-top: 7px !important;
	}

	.markToolbar p {
		margin-bottom: 2px !important;
	}
</style>