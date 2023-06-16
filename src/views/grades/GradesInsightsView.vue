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
        IonBackButton,
        IonRange
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
            Line,
            IonRange
		},
		data() {
            let backTitle = 'Retour';

			// get current route
			const currentRoute = this.$router.currentRoute.value;

			if(currentRoute.name == "Grades") {
				backTitle = 'Notes';
			}

            // get --ion-color-primary-rgb
            const primaryColor = getComputedStyle(document.body).getPropertyValue('--ion-color-primary-rgb');

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
                scale: 5,
                backTitle: backTitle,
                grades: [],
                chartData: data,
                chartOptions: options
			}
		},
		methods: {
            getWeekNumber(date) {
                // return week number of date
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() + 4 - (d.getDay() || 7));
                const yearStart = new Date(d.getFullYear(), 0, 1);
                const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
                return weekNo;
            },
			getAverage(grades, classAvg) {
				const allGrades = {};

				for (let i = 0; i < grades.length; i++) {
					if(grades[i].info.significant === false && grades[i].info.significantZero === false) continue;

					let val = parseFloat(grades[i].grade.value);

					if(classAvg) val = parseFloat(grades[i].grade.average);

					const out_of = parseInt(grades[i].grade.out_of);

					const out20 = (val / out_of) * 20;

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
                const labels = [];
                const values = [];

                const indexes = [];

                let lastAverage = 0;
                let i = 0;
                let max = this.scale;

                console.log(this.scale);

                // get average of 15 last days
                while(i < max) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);

                    const average = this.getAverage(this.grades.filter((grade) => {
                        const gradeDate = new Date(grade.info.date);

                        return gradeDate.getTime() <= date.getTime();
                    }), false).toFixed(2);

                    // if lastAverage is the same as average, skip this day
                    if(lastAverage == average) {
                        max += 1;
                    }
                    else {
                        indexes.push(i);
                        lastAverage = average;

                        const dayStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

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
            },
            changeScale($event) {
                const scale = $event.target.value;

                this.scale = (this.grades.length - 10) - Math.round(scale);

                this.getAverageEvolution();
            }
		},
		mounted() {
            // fetch grades
            GetGrades().then((data) => {
				data.marks.forEach((subject) => {
					subject.marks.forEach((mark) => {
						this.grades.push(mark);

                        this.scale = Math.round((this.grades.length - 10) / 2);
                        this.getAverageEvolution();
					});
				});
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
                <IonItem color="primary" id="DevInsightsBanner">
                    <span class="material-symbols-outlined mdls" slot="start">query_stats</span>
                    <IonLabel class="ion-text-wrap">
                        <h2>Insights est une fonctionnalité expérimentale</h2>
                        <p>Les données affichées peuvent être erronées et des bugs peuvent survenir.</p>
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

                <IonItem>
                    <div class="zoom" slot="end">
                        <span class="material-symbols-outlined mdls">zoom_out</span>

                        <IonRange class="range" @ionChange="changeScale($event)" :min="0" :max="this.grades.length - 12" :value="Math.round((this.grades.length - 10) / 2)"></IonRange>

                        <span class="material-symbols-outlined mdls">zoom_in</span>
                    </div>
                </IonItem>
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

    .range {
        height: 10px;
    }

    .zoom {
        margin-top: -15px;

        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 60%;

        background: var(--ion-color-step-50);
        border-radius: 50px;

        padding: 3px 10px;
    }

    #DevInsightsBanner * {
        color: #fff;
    }
</style>
