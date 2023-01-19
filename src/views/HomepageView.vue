<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonList, IonItem, IonLabel, IonListHeader, IonButton, IonSpinner, IonRefresher, IonChip, IonRippleEffect } from '@ionic/vue';

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
            IonPage,
            IonList,
            IonListHeader,
            IonButton,
            IonItem,
            IonLabel,
            IonSpinner,
            IonRefresher,
            IonChip,
            IonRippleEffect
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
                    "C'est la sieste (ou pas)",
                    "Je suis sûr qu'il reste des devoirs",
                    "Il n'y a jamais vraiment rien à faire",
                    "Il est temps de commencer ce joli DM",
                    "Il fait beau dehors ?",
                    "Ca tombe bien, ce livre ne se finira pas tout seul !",
                    "Flûte, le cours de maths est fini",
                    "Après l'effort le réconfort",
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
                let lessons = timetable.filter((lesson) => {
                    let lessonStart = new Date(lesson.time.start);
                    let lessonEnd = new Date(lesson.time.end);

                    // get minutes before next lesson
                    let mins = Math.floor((lessonStart - now) / 1000 / 60);
                    let gap = -((Math.floor((lessonEnd - lessonStart) / 1000 / 60))/2);

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
                let tomorrow = new Date(this.$rn);
                tomorrow.setDate(tomorrow.getDate() + 0);

                this.homeworks.loading = true;
                GetHomeworks(tomorrow, force).then((homeworks) => {
                    if(homeworks.error) {
                        this.homeworks = [];
                        this.homeworks.error = homeworks.error;

                        if(homeworks.error == "ERR_BAD_REQUEST") {
                            this.homeworks.error = null;
                        }
                    }
                    else {
                        this.homeworks = homeworks;
                        console.log(this.homeworks)
                        this.homeworks.loading = false;
                    }
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
                <ion-item style="margin-top: 12px;" class="nextCours" v-for="cours in timetable" :key="cours.id" lines="none" @click="goto('timetable')">
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
                </ion-item>

                <ion-item v-if="timetable.error" lines="none">
                    <ion-label>
                        <h2>Erreur</h2>
                        <p>{{ timetable.error }}</p>
                    </ion-label>
                </ion-item>

                <ion-item v-if="!noCourses" style="margin-top: 12px;" class="nextCours" lines="none" @click="goto('timetable')">
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

            <ion-list id="comp-hw" ref="comp-hw">
                <ion-list-header>
                    <ion-label>Travail à faire</ion-label>
                    <ion-button @click="goto('homework')">Voir tout</ion-button>
                </ion-list-header>

                <ion-item v-for="homework in homeworks" :key="homework.id">
                    <ion-label :style="`--courseColor: ${homework.data.color};`">
                        <p><span class="courseColor"></span>  {{ homework.homework.subject }}</p>
                        <h2>{{ homework.homework.content }}</h2>
                    </ion-label>
                    <ion-chip slot="end" v-if="!homework.data.done" color="danger">
						<span class="material-symbols-outlined mdls">close</span>
						Non fait
					</ion-chip>
					<ion-chip slot="end" v-else color="success">
						<span class="material-symbols-outlined mdls">check</span>
						Fait
					</ion-chip>
                </ion-item>

                <ion-item v-if="homeworks.error" lines="none">
                    <ion-label>
                        <h2>Erreur</h2>
                        <p>{{ homeworks.error }}</p>
                    </ion-label>
                </ion-item>

                <ion-item v-if="homeworks == []" lines="none">
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

    .ios .nextCours {
        padding: 5px 18px;
    }

    .ios .nextCours::part(native) {
        background: var(--ion-color-step-50);
        border-radius: 12px;
        padding: 5px 15px;
    }

    .md .nextCours {
        padding: 5px 12px;
    }

    .md .nextCours::part(native) {
        border-radius: 8px;
        padding: 3px 10px;
        border: 1px solid var(--ion-color-step-150);
    }

    .courseColor {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--courseColor);
        display: inline-block;
        margin-right: 5px;
    }
</style>
