<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonButtons, IonButton, IonList, IonListHeader, IonLabel, IonItem, toastController, IonCard, IonSkeletonText, IonSegment, IonSegmentButton, IonModal, IonSearchbar } from '@ionic/vue';
    
    import { calendarOutline } from 'ionicons/icons';

    import {version} from '/package'
    import { Capacitor } from '@capacitor/core';

    import GetToken from '@/functions/login/GetToken.js';
    import GetGrades from '@/functions/fetch/GetGrades.js';

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
            IonSearchbar
        },
        data() {
            return { 
                grades: [],
                fullGrades: [],
                averages: [],
                classAverages: [],
                isLoading: false,
                periods: [],
                selectedMark: {
                    subject: "",
                    average: 0,
                    class_average: 0,
                    max_average: 0,
                    min_average: 0,
                    out_of: 0,
                },
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
                var num = parseInt(color,16),
                    amt = Math.round(2.55 * percent),
                    R = (num >> 16) + amt,
                    B = (num >> 8 & 0x00FF) + amt,
                    G = (num & 0x0000FF) + amt;

                    return (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
            },
            darkenHexColor(col) {
                return '#' + this.LightenColor(col.split("#")[1], -40);
            },
            getPeriods() {
                let allPeriods = JSON.parse(localStorage.getItem('userData')).periods;

                // if first period contains "Trimestre", add all trimesters
                if (allPeriods[0].name.includes("Trimestre")) {
                    for (let i = 0; i < allPeriods.length; i++) {
                        if (allPeriods[i].name.includes("Trimestre")) {
                            this.periods.push(allPeriods[i]);
                        }
                    }
                }

                // if first period contains "Semestre", add all semesters
                if (allPeriods[0].name.includes("Semestre")) {
                    for (let i = 0; i < allPeriods.length; i++) {
                        if (allPeriods[i].name.includes("Semestre")) {
                            this.periods.push(allPeriods[i]);
                        }
                    }
                }

                // for each period, if actual is True, set status to "default"
                for (let i = 0; i < this.periods.length; i++) {
                    this.periods[i].status = this.periods[i].id;

                    if (this.periods[i].actual) {
                        this.$refs.segment.$el.value = this.periods[i].id;
                    }
                }

                console.log(this.periods);
            },
            segChange() {
                let newSegment = this.$refs.segment.$el.value;

                // get corresponding period name from id
                let newPeriod = this.periods.find(period => period.id == newSegment);
                console.log(newPeriod);
            },
            openAverageModal(subject) {

                this.selectedMark = {
                    subject: subject.name,
                    average: subject.average,
                    class_average: subject.class.average,
                    max_average: subject.class.max,
                    min_average: subject.class.min,
                    out_of: 20,
                }

                this.$refs.averageModal.$el.present(subject);
            },
            editMarks(grades) {
                let out_of_20 = this.out_of_20;

                grades.forEach(subject => {
                    subject.marks.forEach(mark => {
                        // if out of 20 make it out of 20
                        if (out_of_20) {                            
                            mark.grade.updated_value = parseFloat(mark.grade.value) / parseFloat(mark.grade.out_of) * 20;

                            mark.grade.updated_value = mark.grade.updated_value.toFixed(2);
                            mark.grade.updated_out_of = 20;
                        }
                    });
                });

                return grades;
            },
            getGradesRefresh() {
                GetGrades(true).then((data) => {
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
                let search = this.$refs.searchBar.$el.value;

                if (search == "") {
                    this.grades = this.fullGrades;
                } else {
                    this.grades = this.fullGrades.filter(subject => {
                        return subject.name.toLowerCase().includes(search.toLowerCase());
                    });
                }
            }
        },
        mounted() {
            this.isLoading = true;

            GetGrades().then((data) => {
                this.grades = this.editMarks(data.marks);
                this.fullGrades = this.editMarks(data.marks);

                this.averages = data.averages;
                this.isLoading = false;

                this.classAverages = data.averages.class;

                
                console.log(this.grades)
            });

            this.getPeriods();

            document.addEventListener('tokenUpdated', (ev) => {
                GetGrades().then((data) => {
                    this.grades = this.editMarks(data.marks);
                    this.fullGrades = this.editMarks(data.marks);
                    this.averages = data.averages;
                    this.isLoading = false;

                    this.classAverages = data.averages.class;
                });
            });

            document.addEventListener('settingsUpdated', (ev) => {
                GetGrades().then((data) => {
                    this.out_of_20 = localStorage.getItem('tweakGrades20') == "true" ? true : false;
                    this.grades = this.editMarks(data.marks);
                    this.fullGrades = this.editMarks(data.marks);
                    this.averages = data.averages;
                    this.isLoading = false;

                    this.classAverages = data.averages.class;
                });
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
                <IonSearchbar ref="searchBar" placeholder="Chercher une matière..." @ionChange="searchGrades()"></IonSearchbar>
            </IonToolbar>
        </IonHeader>

        <div id="noTouchZone"></div>

        <ion-segment style="display: none;" id="segment" value="default" ref="segment" @ionChange="segChange()">
            <ion-segment-button v-for="(period, i) in periods" :key="i" :value="period.status" :id="period.id">
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
                    <ion-card class="grade" v-for="i in 3" v-bind:key="i" >
                        <div class="myGrade" style="width: 135px;">
                            <ion-skeleton-text :animated="true" style="width: 50%;"></ion-skeleton-text>
                            <br/>
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
        
        <ion-card class="subject" v-for="(subject, index) in grades" v-bind:key="index" :style="`--backgroundTheme: ${ subject.color };`">
            <div class="subject-name" @click="openAverageModal(subject)">
                <h3>{{subject.name}}</h3>
                <p class="avg" v-if="subject.significant">{{subject.average}}<small>/20</small></p>
                <p class="avg" v-if="!subject.significant">{{subject.significantReason}}<small>/20</small></p>
            </div>

            <div class="grades">
                
                <ion-card class="grade" v-for="(mark, i) in subject.marks" v-bind:key="i">
                    <div class="myGrade">
                        <p class="name">{{ mark.info.description }}</p>
                        <p class="coef">Coeff. : {{mark.grade.coefficient}}</p>

                        <p class="grd" v-if="mark.info.significant && !mark.grade.updated_value">{{mark.grade.value}}<small>/{{mark.grade.out_of}}</small></p>
                        <p class="grd" v-else-if="mark.grade.updated_value && mark.info.significant">{{mark.grade.updated_value}}/{{mark.grade.updated_out_of}}</p>
                        <p class="coef" v-if="mark.grade.updated_value && mark.info.significant">{{mark.grade.value}}<small>/{{mark.grade.out_of}}</small></p>
                        
                        <!-- si absent -->
                        <p class="grd" v-if="!mark.info.significant">{{ mark.info.significantReason }}<small>/{{mark.grade.out_of}}</small></p>
                        <p class="coef" v-if="mark.grade.original_value && !mark.info.significant"><br/></p>
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
                    <h2>{{ averages.average }}<small>/20</small></h2>
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

        <IonModal ref="averageModal" :keep-contents-mounted="true" :initial-breakpoint="0.5" :breakpoints="[0, 0.5, 0.9]" :handle="true" :canDismiss="true">
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
                            <h3>{{ selectedMark.average }}/20</h3>
                        </ion-label>
                    </ion-item>

                    <ion-item>
                        <span class="material-symbols-outlined mdls" slot="start">school</span>
                        <ion-label>
                            <p>Moyenne de la classe</p>
                            <h3>{{ selectedMark.class_average }}/20</h3>
                        </ion-label>
                    </ion-item>

                    <ion-item>
                        <span class="material-symbols-outlined mdls" slot="start">person_remove</span>
                        <ion-label>
                            <p>La moyenne basse</p>
                            <h3>{{ selectedMark.min_average }}/20</h3>
                        </ion-label>
                    </ion-item>

                    <ion-item>
                        <span class="material-symbols-outlined mdls" slot="start">person_add</span>
                        <ion-label>
                            <p>La moyenne haute</p>
                            <h3>{{ selectedMark.max_average }}/20</h3>
                        </ion-label>
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
</style>
