<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonList, IonItem, IonLabel, IonCheckbox, IonListHeader, IonButton, IonSpinner } from '@ionic/vue';

    import { informationCircle } from 'ionicons/icons';

    import { Capacitor } from '@capacitor/core';

    import displayToast from '@/functions/utils/displayToast.js';
    import hapticsController from '@/functions/utils/hapticsController.js';

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
            CoursElement,
            IonItem,
            IonLabel,
            IonCheckbox,
            IonSpinner
        },
        data() {
            return { 
                timetable: [],
                firstName: '',
                homeworks: [],
                blockChangeDone: false,
                editMode: false
            }
        },
        methods: {
            goto(url) {
                this.$router.push(url);
            },
            editTimetable(timetable) {
                // add sameTime property to courses that are at the same time
                for(let i = 0; i < timetable.length; i++) {
                    let lesson = timetable[i];
                    let lessonStart = new Date(lesson.time.start);
                    let lessonEnd = new Date(lesson.time.end);

                    for(let j = 0; j < timetable.length; j++) {
                        let lesson2 = timetable[j];
                        let lesson2Start = new Date(lesson2.time.start);
                        let lesson2End = new Date(lesson2.time.end);

                        if (lessonStart <= lesson2Start && lessonEnd >= lesson2End && lesson.course.num != lesson2.course.num) {
                            if (lesson.course.num > lesson2.course.num) {
                                timetable[j].course.sameTime = true;
                            }
                            else {
                                timetable[i].course.sameTime = true;
                            }
                        }
                    }
                }

                // remove all lessons before this.$rn (cours.time.start)
                let lessons = [];
                for(let i = 0; i < timetable.length; i++) {
                    let lesson = timetable[i];
                    let lessonStart = new Date(lesson.time.start);

                    if (lessonStart >= this.$rn) {
                        lessons.push(lesson);
                    }
                }

                // if lessons is empty but not timetable
                if (lessons.length == 0 && timetable.length != 0) {
                    // add 3 last lessons
                    lessons = timetable.slice(-4);
                }
                
                return lessons;
            },
            getTimetable() {
                this.timetable.loading = true;
                GetTimetable(this.$rn, false).then((timetable) => {
                    if(timetable.error) {
                        this.timetable = [];
                        this.timetable.error = timetable.error;

                        if(timetable.error == "ERR_BAD_REQUEST") {
                            this.timetable.error = null;
                        }
                    }
                    else {
                        this.timetable = this.editTimetable(timetable);
                        console.log(this.timetable)

                        this.timetable.loading = false;
                    }
                });
            },
            getHomeworks() {
                // get date for this.$rn + 1 day
                let tomorrow = new Date(this.$rn);
                tomorrow.setDate(tomorrow.getDate() + 0);

                this.homeworks.loading = true;
                GetHomeworks(tomorrow, false).then((homeworks) => {
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
            changeDone(hw) {
                if(!this.blockChangeDone) {
                    displayToast.presentToastFull(
                        "Allez dans la page devoirs pour marquer un devoir comme fait",
                        `Vous ne pouvez pas changer l'état d'un devoir depuis l'écran d'accueil.`,
                        "warning",
                        informationCircle
                    )

                    let checkboxID = `checkbox_${hw.data.id}`;
                    let checkbox = document.getElementById(checkboxID);

                    if (checkbox) {
                        setTimeout(() => {
                            this.blockChangeDone = true;
                            setTimeout(() => {
                                this.blockChangeDone = false;
                            }, 100);

                            checkbox.checked = !checkbox.checked;
                        }, 300);
                    }
                }
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
        <IonHeader collapse="condense">
            <IonToolbar>
                <ion-title v-if="firstName" size="large">Bonjour, {{ firstName }} 👋</ion-title>
                <ion-title v-else size="large">Bonjour 👋</ion-title>
            </IonToolbar>
        </IonHeader>

        <div id="components" ref="components">
            <ion-list id="comp-tt" ref="comp-tt">
                <ion-list-header>
                    <ion-label>Prochains cours</ion-label>
                    <ion-button @click="goto('timetable')">Voir tout</ion-button>
                </ion-list-header>

                <CoursElement v-for="cours in timetable" :key="cours.id"
                    :subject="cours.data.subject"
                    :teachers="cours.data.teachers.join(', ') || 'Pas de professeur'"
                    :rooms="cours.data.rooms.join(', ') || 'Pas de salle'"
                    :memo="cours.data.hasMemo"
                    :start="cours.time.start.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
                    :end="cours.time.end.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
                    :color="cours.course.color"
                    :sameTime="cours.course.sameTime"
                    :status="cours.status.status"
                    :isCancelled="cours.status.isCancelled"
                    :isDetention="cours.status.isDetention"
                    :isExempted="cours.status.isExempted"
                    :isOuting="cours.status.isOuting"
                    :isTest="cours.status.isTest"
                />

                <ion-item v-if="timetable.error" lines="none">
                    <ion-label>
                        <h2>Erreur</h2>
                        <p>{{ timetable.error }}</p>
                    </ion-label>
                </ion-item>

                <ion-item v-if="timetable == []" lines="none">
                    <ion-label>
                        <h2>Aucun cours</h2>
                        <p>Vous n'avez aucun cours aujourd'hui.</p>
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
                    <ion-button @click="goto('homeworks')">Voir tout</ion-button>
                </ion-list-header>

                <ion-item v-for="homework in homeworks" :key="homework.id" button>
                    <div slot="start">
                        <ion-checkbox :id="`checkbox_${homework.data.id}`" :checked="homework.data.done" @ionChange="changeDone(homework)"></ion-checkbox>
                    </div>
                    <ion-label :style="`--courseColor: ${homework.data.color};`">
                        <p><span class="courseColor"></span>  {{ homework.homework.subject }}</p>
                        <h2>{{ homework.homework.content }}</h2>
                    </ion-label>
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

</style>
