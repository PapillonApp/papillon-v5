<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonList, IonItem, IonLabel, IonListHeader, IonButton, IonSpinner, IonRefresher, IonChip, IonRippleEffect, IonItemGroup, IonItemDivider, IonButtons, IonRefresherContent } from '@ionic/vue';

    import { informationCircle } from 'ionicons/icons';

    import { Capacitor } from '@capacitor/core';

    import displayToast from '@/functions/utils/displayToast.js';
    import hapticsController from '@/functions/utils/hapticsController.js';
    import timetableEdit from '@/functions/utils/timetableEdit.js';

    import GetToken from '@/functions/login/GetToken.js';
    import GetNews from '@/functions/fetch/GetNews.js';

    // timetable
    import CoursElement from '@/components/timetable/CoursElement.vue';
    import GetTimetable from '@/functions/fetch/GetTimetable.js';

    // homeworks
    import GetHomeworks from "@/functions/fetch/GetHomeworks.js";

    export default defineComponent({
        name: 'FolderPage',
        components: {
            IonHeader,
            IonContent,
            IonToolbar,
            IonTitle,
            IonMenuButton,
            IonButtons,
            IonPage,
            IonList,
            IonListHeader,
            IonButton,
            IonItem,
            IonLabel,
            IonSpinner,
            IonRefresher,
            IonChip,
            IonRippleEffect,
            IonItemGroup,
            IonRefresherContent,
        },
        data() {
            return { 
                timetable: [],
                nextCoursTime: "",
                updateTime: null,
                firstName: '',
                homeworks: [],
                blockChangeDone: false,
                editMode: false,
                noCoursesEmoji: this.randomEmoji(),
                noCoursesMsg: this.randomMsg(),
                noCourses: false
            }
        },
        methods: {
            goto(url) {
                this.$router.push(url);
            },
            randomEmoji() {
                let list = ["😊", "😎", "😴", "👌", "🌞", "📚", "💪", "💤", "😉", "🥱"]
                return list[Math.floor(Math.random() * list.length)];
            },
            randomMsg() {
                let list = [
                    "Temps calme",
                    "Pas de cours, on révise ?",
                    "C'est la sieste ? (ou pas)",
                    "Je suis sûr qu'il te reste des devoirs...",
                    "Il n'y a jamais vraiment rien à faire !",
                    "Il est temps de commencer ce joli DM !",
                    "Il fait beau dehors ?",
                    "Ca tombe bien, ce livre ne se finira pas tout seul !",
                    "Flûte, le cours de maths est fini",
                    "Après l'effort, le réconfort ;)",
                    "Alors, ça se la coule douce ?",
                    "Prenons de l'avance sur la semaine prochaine !",
                    "Il est temps de reprendre la lecture !"
                ]
                return list[Math.floor(Math.random() * list.length)];
            },
            editTimetable(timetable) {
                timetable = timetableEdit(timetable);

                // get next lesson (cours.time.start)
                let now = new Date();
                let lessons = []
                lessons = timetable.filter((lesson) => {
                    let lessonStart = new Date(lesson.time.start);
                    let lessonEnd = new Date(lesson.time.end);

                    // get minutes before next lesson
                    let mins = Math.floor((lessonStart - now) / 1000 / 60);
                    let gap = -((Math.floor((lessonEnd - lessonStart) / 1000 / 60))/2);

                    if (lessons.length != 0) {
                        return false;
                    }

                    // if less than 60 mins
                    if (mins < 60 && mins > 0) {
                        this.nextCoursTime = `dans ${mins} minutes`;
                    }
                    else if (mins <= 0) {
                        this.nextCoursTime = "Cours commencé";

                        if (lessonEnd <= now) {
                            return false;
                        }
                    } 
                    else {
                        let hours = Math.floor(mins / 60);
                        mins = mins % 60;

                        this.nextCoursTime = `dans ${hours} heures et ${mins} minutes`;
                    }

                    if (lesson.status.isCancelled || mins < gap) {
                        return false;
                    }

                    lessons.push(lesson)
                    return true;
                });

                // if lessons is empty but not timetable, get last lesson
                if (lessons.length == 0 && timetable.length > 0) {
                    for (let i = timetable.length - 1; i >= 0; i--) {
                        let lesson = timetable[i];

                        if (lesson.status.isCancelled) {
                            continue;
                        }

                        this.nextCoursTime = "Cours terminé";
                        lessons.push(lesson);
                        break;
                    }
                }

                if (lessons.length == 0 && timetable.length == 0) {
                    this.noCourses = true;
                }
                
                return lessons;
            },
            getTimetable(force) {
                this.timetable.loading = true;
                GetTimetable(this.$rn, force).then((timetable) => {
                    if(timetable.error) {
                        this.timetable = [];
                        this.timetable.error = timetable.error;

                        if(timetable.error == "ERR_BAD_REQUEST") {
                            this.timetable.error = null;
                        }
                    }
                    else {
                        this.timetable = this.editTimetable(timetable);
                        
                        this.updateTime = setInterval(() => {
                            this.timetable = this.editTimetable(timetable);
                        }, 1000);

                        this.timetable.loading = false;
                    }
                });
            },
            getHomeworks(force) {
                // get date for this.$rn + 1 day
                let today = new Date(this.$rn);
                let dateTo = new Date(this.$rn);
                dateTo.setDate(dateTo.getDate() + 7);

                this.homeworks.loading = true;
                GetHomeworks(today, dateTo, force).then((homeworks) => {
                    if(homeworks.error) {
                        this.homeworks = [];
                        this.homeworks.error = homeworks.error;

                        if(homeworks.error == "ERR_BAD_REQUEST") {
                            this.homeworks.error = null;
                        }
                    }
                    else {
                        this.homeworks.loading = false;

                        let homeworkDays = [];

                        // sort homeworks by day
                        for (let i = 0; i < homeworks.length; i++) {
                            let homework = homeworks[i];
                            let date = new Date(homework.data.date);

                            homeworks[i].data.timeLeft = Math.floor((date - today) / 1000 / 60 / 60 / 24);

                            let day = homeworkDays.find((day) => {
                                return day.date == date.toDateString();
                            });

                            if (!day) {
                                day = {
                                    date: date.toDateString(),
                                    homeworks: []
                                }
                                homeworkDays.push(day);
                            }

                            day.homeworks.push(homework);
                        }

                        // sort homeworkDays by date
                        homeworkDays.sort((a, b) => {
                            return new Date(a.date) - new Date(b.date);
                        });

                        this.homeworks = homeworkDays;
                    }
                })
                .catch((err) => {
                    this.homeworks = [];
                });
            },
            reorder() {
                let order = ["comp-hw", "comp-tt"]

                let components = document.getElementById("components");
                if (components) {
                    for (let i = 0; i < order.length; i++) {
                        let comp = document.getElementById(order[i]);
                        if (comp) {
                            components.appendChild(comp);
                        }
                    }
                }
            },
            handleRefresh(event) {
                this.getTimetable(true);
                this.getHomeworks(true);

                this.noCoursesMsg = this.randomMsg();
                this.noCoursesEmoji = this.randomEmoji();

                setTimeout(() => {
                    event.detail.complete();
                }, 1000);
            }
        },
        mounted() {
            if(localStorage.getItem('userData')) {
                // get first name
                let name = JSON.parse(localStorage.getItem('userData')).student.name;
                // get last word of name
                this.firstName = name.split(' ').pop();
            }

            // get data
            this.getTimetable();

            document.addEventListener('tokenUpdated', (e) => {
                this.getTimetable();
                this.getHomeworks();
            });

            this.getHomeworks();

            // reorder divs in #components
            // this.reorder();
        }
    });
</script>

<template>
    <ion-page ref="page">
      <IonHeader class="AppHeader">
        <IonToolbar>

          <ion-buttons slot="start">
            <ion-menu-button color="dark" mode="md"></ion-menu-button>
          </ion-buttons>

          <ion-title mode="md">Vue d'ensemble</ion-title>
        </IonToolbar>
      </IonHeader>
      
      <ion-content :fullscreen="true">

        <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
            <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <div id="components" ref="components">
            <ion-list id="comp-tt" class="nextCourse" ref="comp-tt">
                <ion-item class="nextCours" v-for="cours in timetable" :key="cours.id" lines="none" @click="goto('timetable')" :style="`--courseColor: ${cours.course.color};`">
                    <ion-ripple-effect></ion-ripple-effect>
                    <div slot="start">
                        <IonChip>{{ cours.time.start.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</IonChip>
                    </div>
                    <ion-label :style="`--courseColor: ${cours.course.color};`">
                        <h2><span class="courseColor"></span> {{ cours.data.subject }}</h2>
                        <h3>{{ nextCoursTime }}</h3>
                        <p>salle {{ cours.data.rooms.join(', ') || 'Pas de salle' }} - avec {{ cours.data.teachers.join(', ') || 'Pas de professeur' }}</p>
                        <p v-if="cours.status.status">{{ cours.status.status }}</p>
                    </ion-label>
                    
                    <!-- <div slot="error" class="progress"><div class="step" style="width: {{ nextCoursProgress }};"></div></div> -->
                </ion-item>

                <ion-item v-if="timetable.error" lines="none">
                    <ion-label>
                        <h2>Erreur</h2>
                        <p>{{ timetable.error }}</p>
                    </ion-label>
                </ion-item>

                <ion-item v-if="noCourses" style="margin-top: 12px;" class="nextCours" lines="none" @click="goto('timetable')">
                    <ion-ripple-effect></ion-ripple-effect>
                    <div slot="start" class="emoji">
                        {{ noCoursesEmoji }}
                    </div>
                    <ion-label>
                        <h2>Aucun cours</h2>
                        <p>{{ noCoursesMsg }}</p>
                    </ion-label>
                </ion-item>

                <ion-item v-if="timetable.loading" lines="none">
                    <IonSpinner slot="start"></IonSpinner>
                    <ion-label>
                        <h2>Chargement...</h2>
                        <p>Chargement des cours...</p>
                    </ion-label>
                </ion-item>
            </ion-list>

            <ion-list id="comp-hw" ref="comp-hw" lines="none" inset="true">
                <ion-list-header>
                    <ion-label>
                        <h2 style="font-size: 20px;">Travail à faire</h2>
                    </ion-label>
                    <ion-button @click="goto('homework')">Voir tout</ion-button>
                </ion-list-header>

                <ion-item-group class="hw_group" v-for="(day, i) in homeworks" :key="i">
                    <div class="homepage_divider">
                        <p>{{ new Date(day.date).toLocaleString('fr-FR', { weekday: 'long' }) }}</p>
                        <div class="divider"></div>
                    </div>
                    <ion-item v-for="homework in day.homeworks" :key="homework.id">
                        <ion-label :style="`--courseColor: ${homework.data.color};`">
                            <p><span class="courseColor"></span>  {{ homework.homework.subject }}</p>
                            <h2>{{ homework.homework.content }}</h2>
                        </ion-label>
                        
                        <ion-chip slot="end" v-if="homework.data.done" color="success">
                            <span class="material-symbols-outlined mdls">check_circle</span>
                            Fait
                        </ion-chip>
                        <ion-chip slot="end" v-else color="medium">
                            <span class="material-symbols-outlined mdls">schedule</span>
                            <p v-if="homework.data.timeLeft > 0">{{homework.data.timeLeft}} jour(s)</p>
                            <p v-else>Demain</p>
                        </ion-chip>
                    </ion-item>
                </ion-item-group>

                <ion-item v-if="homeworks.error" lines="none">
                    <ion-label>
                        <h2>Erreur</h2>
                        <p>{{ homeworks.error }}</p>
                    </ion-label>
                </ion-item>

                <ion-item v-if="homeworks.length == 0" lines="none">
                    <ion-label>
                        <h2>Aucun devoir</h2>
                        <p>Vous n'avez aucun devoir à faire aujourd'hui.</p>
                    </ion-label>
                </ion-item>

                <ion-item v-if="homeworks.loading" lines="none">
                    <IonSpinner slot="start"></IonSpinner>
                    <ion-label>
                        <h2>Chargement...</h2>
                        <p>Chargement des devoirs...</p>
                    </ion-label>
                </ion-item>
            </ion-list>
        </div>

      </ion-content>
    </ion-page>
</template>
  
<style scoped>
    .iconDisplay {
        display: flex;
        align-items: center;

        opacity: 0.8;

        width: fit-content;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 3px;
    }

    .emoji {
        font-size: 1.5em;
        margin-right: 10px;
    }

    .nextCourse ion-chip {
        padding: 6px 9px !important;
        height: fit-content;
        font-weight: 600;
        font-size: 16px;
        font-family: var(--papillon-font);
    }

    /* Temporary */
    .nextCours::part(native) {
        /* border-bottom: 3px solid var(--courseColor); */
        /* pas convaincu -> peut etre mis sur le progress */
    }

    /* Faire une barre de chargement en fonction du temps restant en cours */
    /* .nextCours .progress {
        position: relative;
        background-color: var(--ion-inset-background);
        height: 3px;
        border-radius: 3px;
        width: 100%;
        bottom: 0;
        left: 0;
        border-radius: 0 0 3px 3px;
    }

    .nextCours .progress .step {
        background-color: var(--courseColor);
        height: 3px;
        width: 33%;
        border-radius: 3px;
        border-radius: 0 0 0 3px;
    } */

    .ios .nextCours {
        padding: 5px 16px;
        margin-top: 14px;
    }

    .ios .nextCours::part(native) {
        background: var(--ion-inset-background);
        border-radius: 12px;
        padding: 5px 15px;
    }

    .md .nextCours {
        padding: 5px 16px;
        margin-top: 5px;
    }

    .md .nextCours::part(native) {
        background: var(--ion-inset-background);
        border-radius: 8px;
        padding: 3px 10px;
    }

    .courseColor {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--courseColor);
        display: inline-block;
        margin-right: 5px;
    }

    .homepage_divider {
        display: flex;
        align-items: center;
        margin: 10px 18px;
    }

    .md .homepage_divider {
        margin: 10px 16px;
    }

    .ios .homepage_divider {
        width: 100%;
    }

    .homepage_divider p {
        margin: 0;
        font-size: 1em;
        font-weight: 500;
        font-family: var(--papillon-font);
        opacity: 0.5;
    }

    .homepage_divider .divider {
        flex: 1;
        height: 1px;
        background-color: var(--ion-color-step-150);
        margin-left: 10px;
    }

    .hw_group {
        padding-bottom: 10px;
    }

    .hw_group ion-item {
        --border-width: 0;
    }

    .hw_group ion-chip {
        padding-left: 10px !important;
    }

    .hw_group ion-chip span {
        margin-right: 5px;
    }
</style>
