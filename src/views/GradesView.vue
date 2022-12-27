<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonButtons, IonButton, IonList, IonListHeader, IonLabel, IonItem, toastController, IonCard } from '@ionic/vue';
    
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
            IonCard
        },
        data() {
            return { 
                grades: []
            }
        },
        methods: {
            getRandomColor() {
                var color = '#';
                for (var i = 0; i < 6; i++) {
                    color += Math.floor(Math.random() * 10);
                }
                return color;
            }
        },
        mounted() {
            GetGrades().then((data) => {
                this.grades = data.marks;

                console.log(this.grades);
            });
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

          <ion-title mode="md">Notes</ion-title>
        </IonToolbar>
      </IonHeader>
      
      <ion-content :fullscreen="true">
        <IonHeader collapse="condense">
            <IonToolbar>
                <ion-title size="large">Notes</ion-title>
            </IonToolbar>
        </IonHeader>

        <div id="noTouchZone"></div>

        <ion-card class="subject" v-for="(subject, index) in grades" v-bind:key="index">
            <div class="subject-name" :style="`background: ${getRandomColor()};`">
                <h3>{{subject.name}}</h3>
                <p class="avg">{{subject.average}}<small>/20</small></p>
            </div>

            <div class="grades">
                
                <ion-card class="grade" v-for="(mark, i) in subject.marks" v-bind:key="i">
                    <div class="myGrade">
                        <p class="name">Pas d'intitulé</p>
                        <p class="coef">Coeff. : {{mark.grade.coefficient}}</p>

                        <p class="grd" v-if="!mark.info.abs">{{mark.grade.value.toFixed(2)}}<small>/{{mark.grade.out_of}}</small></p>
                        
                        <!-- si absent -->
                        <p class="grd" v-if="mark.info.abs">Abs.<small>/{{mark.grade.out_of}}</small></p>
                    </div>
                    <div class="averages">
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
                </ion-card>

            </div>
        </ion-card>

      </ion-content>
    </ion-page>
</template>
  
<style scoped>
    .subject-name {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background: var(--ion-color-step-50);
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
        background: var(--ion-color-step-50);
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        min-width: fit-content;
        max-width: fit-content;
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
</style>
