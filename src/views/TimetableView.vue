<script>
  import { defineComponent } from 'vue';
  import { IonButtons, IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonList, IonModal, IonDatetime } from '@ionic/vue';
  
  import { calendarOutline, calendarSharp } from 'ionicons/icons';

  import CoursElement from '@/components/timetable/CoursElement.vue';

  import GetTimetable from '@/functions/fetch/GetTimetable.js';

  export default defineComponent({
    name: 'FolderPage',
    components: {
        IonButtons,
        IonContent,
        IonHeader,
        IonMenuButton,
        IonPage,
        IonTitle,
        IonToolbar,
        IonList,
        IonModal,
        CoursElement,
        IonDatetime
    },
    setup() {
        return { 
            calendarOutline,
            calendarSharp,
            presentingElement: null,
        }
    },
    methods: {
        createDateString(date) {
            let dateObject = new Date(date);

            // return string like "1 jan."
            return `${dateObject.getDate()} ${dateObject.toLocaleString('default', { month: 'short' })}`;
        },
        rnInputChanged() {
            // get new date from rnInput
            let newDate = new Date(this.$refs.rnInput.$el.value);

            // update rn
            this.$rn = newDate;

            // emit event
            document.dispatchEvent(new CustomEvent('rnChanged', { detail: newDate }));
        },
        confirmRnInput() {
            this.$refs.rnPickerModal.$el.dismiss();
        }
    },
    data() {
        return {
            rnButtonString: this.createDateString(this.$rn),
            rnCalendarString: this.$rn.toISOString().split('T')[0],
            timetable: []
        }
    },
    mounted() {
        // sets presentingElement
        this.presentingElement = this.$refs.page.$el;

        // on rnChanged, update rnButtonString
        document.addEventListener('rnChanged', (e) => {
            this.rnButtonString = this.createDateString(e.detail);
        });

        // get timetable data
        GetTimetable(this.$rn).then((timetable) => {
            this.timetable = timetable;
        });
    }
  });
</script>

<template>
    <ion-page ref="page">
      <ion-header>
        <ion-toolbar>

          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>

          <ion-title>Ma journée</ion-title>

          <ion-buttons slot="end">
            <ion-button id="rnPickerModalButton">
              <ion-icon slot="start" :icon="calendarOutline" :ios="calendarOutline" :md="calendarSharp"></ion-icon>
              {{ rnButtonString }}
            </ion-button>
          </ion-buttons>

        </ion-toolbar>
      </ion-header>
      
      <ion-content :fullscreen="true">
        <ion-header collapse="condense">
          <ion-toolbar>
            <ion-title size="large">Emploi du temps</ion-title>
          </ion-toolbar>
        </ion-header>
      
        <IonList>

          <CoursElement v-for="cours in timetable" :key="cours.id"
            :subject="cours.data.subject"
            :teacher="cours.data.teacher"
            :room="cours.data.room"
            :start="cours.time.start.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
            :end="cours.time.end.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })"
          />

        </IonList>

        <IonModal ref="rnPickerModal" trigger="rnPickerModalButton" class="datetimeModal" :keep-contents-mounted="true" :initial-breakpoint="0.55" :breakpoints="[0, 0.55, 1]">
          <ion-header>
            <ion-toolbar>
              <ion-title>Sélection de la date</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="confirmRnInput()">Terminé</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content>
          <IonDatetime 
            presentation="date"
            ref="rnInput"
            size="cover"
            :value="rnCalendarString"
            :firstDayOfWeek="1"
            @ionChange="rnInputChanged()"
          >
          </IonDatetime>
          </ion-content>
        </IonModal>
      </ion-content>
    </ion-page>
</template>
  
<style scoped>
    /* show rnInput picker but hide it */
    #rnInput {
        -webkit-appearance: none;
        font-weight: 400;
        font-size: 16px;
        color: var(--ion-color-primary);
        background: rgba(var(--ion-color-primary-rgb), 0.1);
        border: none;
        border-radius: 7px;
        text-align: center;
        padding: 5px 10px !important;

        margin-right: 5px;

        /* fit content */
        width: auto;
    }

    /* hide calendar icon */
    #rnInput::-webkit-calendar-picker-indicator {
        display: none;
    }
</style>
