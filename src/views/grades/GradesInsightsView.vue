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
        IonBackButton
	} from '@ionic/vue';

    import { Line } from 'vue-chartjs'
    
    import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement} from 'chart.js'
    ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)

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
			IonList,
			IonItem,
			IonLabel,
            Line
		},
		data() {
            let backTitle = 'Retour';

			// get current route
			let currentRoute = this.$router.currentRoute.value;

			if(currentRoute.name == "Grades") {
				backTitle = 'Notes';
			}

            // get --ion-color-primary-rgb
            let primaryColor = getComputedStyle(document.body).getPropertyValue('--ion-color-primary-rgb');

            // grades data
            const data = {
                labels: ['0'],
                datasets: [
                    {
                        label: 'Moyenne générale',
                        data: [10],
                        backgroundColor: 'rgb('+primaryColor+')',
                        borderColor: 'rgb('+primaryColor+')',
                        tension: 0.5,
                        pointRadius: 0,
                        pointHoverRadius: 8,
                        pointHitRadius: 25,
                    },
                ]
            };

            // grades options
            const options = {
                scales: {
                    x: {
                        ticks: {
                            font: {
                                size: 13,
                                family: 'system-ui, sans-serif',
                            },
                        }
                    },
                    y: {
                        ticks: {
                            font: {
                                size: 13,
                                weight: 500,
                                family: 'system-ui, sans-serif',
                            },
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        cornerRadius: 8,
                        titleFont: {
                            size: 14,
                            weight: 600,
                            family: 'system-ui, sans-serif',
                        },
                        bodyFont: {
                            size: 13,
                            weight: 400,
                            family: 'system-ui, sans-serif',
                        },
                    }
                },
            };

			return {
                backTitle: backTitle,
                grades: [],
                chartData: data,
                chartOptions: options
			}
		},
		methods: {
            getWeekNumber(date) {
                // return week number of date
                let d = new Date(date);
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() + 4 - (d.getDay() || 7));
                let yearStart = new Date(d.getFullYear(), 0, 1);
                let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
                return weekNo;
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
            getAverageEvolution() {
                // get average of all grades
                let labels = [];
                let values = [];

                let indexes = [];

                let lastAverage = 0;
                let i = 0;
                let max = 15;

                // get average of 15 last days
                while(i < max) {
                    let date = new Date();
                    date.setDate(date.getDate() - i);

                    let average = this.getAverage(this.grades.filter((grade) => {
                        let gradeDate = new Date(grade.info.date);

                        return gradeDate.getTime() <= date.getTime();
                    }), false).toFixed(2);

                    // if lastAverage is the same as average, skip this day
                    if(lastAverage == average) {
                        max += 1;
                    }
                    else {
                        indexes.push(i);
                        lastAverage = average;

                        let dayStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

                        labels.push(dayStr);
                        values.push(average);
                    }

                    i++;
                }
                
                // invert arrays
                labels.reverse();
                values.reverse();

                this.$refs.chart.chart.data.labels = labels;
                this.$refs.chart.chart.data.datasets[0].data = values;

                this.$refs.chart.chart.update();
            }
		},
		mounted() {
            // fetch grades
            GetGrades().then((data) => {
				data.marks.forEach((subject) => {
					subject.marks.forEach((mark) => {
						this.grades.push(mark);
					});
				});

                this.getAverageEvolution();
            });

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

                <ion-title>Insights</ion-title>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
            <IonList inset>
                <IonItem color="primary">
                    <span class="material-symbols-outlined mdls" slot="start">query_stats</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Insights est une fonctionnalité expérimentale</h2>
                        <p>Les données affichées peuvent être erronées et des bugs peuvent survenir</p>
                    </IonLabel>
                </IonItem>
            </IonList>

            <IonList inset class="chartList" lines="none">
                <IonItem>
                    <IonLabel>
                        <h2>Évolution de la moyenne générale</h2>
                        <p>sur les notes les plus récentes</p>
                    </IonLabel>
                </IonItem>
                <Line class="chartCanvas" ref="chart" id="my-chart-id" :data="chartData" :options="chartOptions" />
            </IonList>
		</ion-content>
</template>

<style scoped>
    .chartList ion-label * {
        text-align: center;
    }

    .chartList {
        padding-top: 5px;
    }

    .chartList .chartCanvas {
        margin: 5px;
        margin-top: 0px;
    }
</style>