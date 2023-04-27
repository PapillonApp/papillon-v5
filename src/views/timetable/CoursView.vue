<script>
	import {
		defineComponent
	} from 'vue';
	import {
		IonHeader,
		IonToolbar,
		IonAvatar,
		IonList,
		IonItem,
		IonLabel,
		IonButtons,
		IonTitle,
		IonContent,
		IonSkeletonText,
		IonBackButton,
        IonToggle
	} from '@ionic/vue';

	import { Browser } from '@capacitor/browser';

    import { Share } from '@capacitor/share';

    import { LocalNotifications } from '@capacitor/local-notifications';

	import PapillonBackButton from '@/components/PapillonBackButton.vue';

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
            IonToggle
		},
		props: {
			urlCours: {
				type: String,
				required: true,
			}
		},
		data() {
			let backTitle = 'Retour';

			// get current route
			let currentRoute = this.$router.currentRoute.value;

			if(currentRoute.name == "Trimetable") {
				backTitle = 'Emp. du temps';
			}

			return {
				backTitle: backTitle,
				openedCours: [],
                openCours_course: [],
                openCours_data: [],
                openCours_status: [],
                openCours_time: [],
                teachers: "",
                rooms: "",
                notificationEnabled: false,
			}
		},
		methods: {
			async openLink(url) {
				await Browser.open({
					url: url,
					presentationStyle: 'popover',
				});
			},
            getStringToAsciiArray(string) {
                let charCodeArr = [];
                for(let i = 0; i < string.length; i++){
                    let code = string.charCodeAt(i);
                    charCodeArr.push(code);
                }

                return charCodeArr;
            },
            async shareCours() {
                let sharedCourse = {
                    name: this.openedCours.data.subject,
                    teachers: this.openedCours.data.teachers.join(', ') || "Aucun professeur",
                    rooms: this.openedCours.data.rooms.join(', ') || "Aucune salle",
                    start: new Date(this.openedCours.time.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    end: new Date(this.openedCours.time.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    status: this.openedCours.status.status,
                    color: this.openedCours.course.color,
                    memo: this.openedCours.data.memo || "none"
                }

                // get first name of user
                let firstName = JSON.parse(localStorage.getItem("userData")).student.name;
                firstName = firstName.split(" ")[firstName.split(" ").length - 1];

                // if custom name is set, use it instead
                if(localStorage.getItem("customName")) {
                    firstName = localStorage.getItem("customName").split(" ")[localStorage.getItem("customName").split(" ").length - 1];
                }

                // Set customizable data to ascii
                firstName = this.getStringToAsciiArray(firstName).join('-');
                sharedCourse.name = this.getStringToAsciiArray(sharedCourse.name).join('-');
                sharedCourse.teachers = this.getStringToAsciiArray(sharedCourse.teachers).join('-');
                sharedCourse.rooms = this.getStringToAsciiArray(sharedCourse.rooms).join('-');
                if (sharedCourse.status != null) {
                    sharedCourse.status = this.getStringToAsciiArray(sharedCourse.status).join('-');
                } else {
                    sharedCourse.status = this.getStringToAsciiArray("null").join('-');
                }

                let urlElems = "";
                urlElems += firstName + "$"; // first name
                urlElems += sharedCourse.name + "$";
                urlElems += sharedCourse.teachers + "$";
                urlElems += sharedCourse.rooms + "$";
                urlElems += sharedCourse.start + "$";
                urlElems += sharedCourse.end + "$";
                urlElems += sharedCourse.color + "$";
                urlElems += sharedCourse.status + "$";
                urlElems += sharedCourse.memo;

                // base64 encode urlElems
                let url = "https://getpapillon.xyz/course?c=" + btoa(urlElems);

                // share url
                await Share.share({
                    url: url,
                    dialogTitle: "Partager votre cours de " + this.openedCours.data.subject
                });
            },
            async setNotif() {
                let course = this.openedCours;

                try {
                    let subject = course.data.subject;
                    let room = course.data.rooms[0] || "salle inconnue";
                    let teacher = course.data.teachers[0];

                    let time = new Date(course.time.start);
                    time.setMinutes(time.getMinutes() - 5);

                    // check if time is in the future
                    if(time.getTime() < new Date().getTime()) {
                        return false;
                    }
                    else {
                        // Check permission
                        const permission = await LocalNotifications.checkPermissions();
                        if (permission != 'granted') {
                            try {
                                await LocalNotifications.requestPermissions();
                            } catch (error) {
                                return;
                            }
                        }

                        await LocalNotifications.schedule({
                            notifications: [
                                {
                                    title: `${subject} - Ça commence bientôt !`,
                                    body: `Vous êtes en ${room} avec ${teacher}. Le cours commence dans 5 minutes.`,
                                    id: 1,
                                    schedule: { at: time },
                                    sound: "tone.ogg",
                                    attachments: null,
                                    actionTypeId: "",
                                    extra: null
                                }
                            ]
                        });
                        
                        // notify user
                        this.notificationEnabled = true;
                    }
                } catch (error) {
                    console.error(error);
                }
            },
            async unsetNotif() {
                let course = this.openedCours;

                // find notification
                await LocalNotifications.getPending().then((res) => {
                    let notifs = res.notifications;

                    let time = new Date(course.time.start);
                    time.setMinutes(time.getMinutes() - 5);

                    // check if time = schedule.at
                    notifs.forEach(async (notif) => {
                        let notifTime = new Date(notif.schedule.at);

                        if(notifTime.getTime() == time.getTime()) {
                            await LocalNotifications.cancel({ notifications: [notif] });

                            // notify user
                            this.notificationEnabled = false;
                        }
                    });
                });
            },
            changeNotif(event) {
                if(event.target.checked) {
                    this.setNotif();
                }
                else {
                    this.unsetNotif();
                }
            }
		},
		async mounted() {
			// if urlNews prop is set
			if(this.urlCours) {
				let encoded = this.urlCours;

				// decode url
				let decoded = decodeURIComponent(encoded);

				// parse json
				let parsed = JSON.parse(decoded);

				// open urlNews
				this.openedCours = parsed;

                this.openCours_course = parsed.course;
                this.openCours_data = parsed.data;
                this.openCours_status = parsed.status;
                this.openCours_time = parsed.time;

                this.teachers = parsed.data.teachers.join(', ');
                this.rooms = parsed.data.rooms.join(', ');

                // check notifs

                await LocalNotifications.getPending().then((res) => {
                    let notifs = res.notifications;

                    console.log(notifs);

                    let time = new Date(this.openCours_time.start);
                    time.setMinutes(time.getMinutes() - 5);

                    // check if time = schedule.at
                    notifs.forEach((notif) => {
                        let notifTime = new Date(notif.schedule.at);

                        if(notifTime.getTime() == time.getTime()) {
                            this.notificationEnabled = true;
                            this.$refs.toggle.$el.checked = true;
                        }
                    });
                });
			}

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

				<ion-title v-if="openedCours">{{ openCours_data.subject }}</ion-title>
				<ion-title v-else><ion-skeleton-text style="width: 200px;"></ion-skeleton-text></ion-title>

                <ion-buttons slot="end">
                    <ion-button class="itemBtn" @click="shareCours()">
                        Partager
                    </ion-button>
                </ion-buttons>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<div v-if="openedCours">

                <IonLabel class="listGroupTitle">
                    <p>Détails du cours</p>
                </IonLabel>

                <IonList class="listGroup">     
                    <ion-item class="info-item">
						<span class="material-symbols-outlined mdls" slot="start">history_edu</span>
						<ion-label>
							<p>Nom de la matière</p>
							<h2>{{openCours_data.subject}}</h2>
						</ion-label>
					</ion-item>
                    <ion-item class="info-item">
						<span class="material-symbols-outlined mdls" slot="start">face</span>
						<ion-label>
							<p>Professeurs</p>
							<h2>{{teachers}}</h2>
						</ion-label>
					</ion-item>
                    <ion-item class="info-item">
						<span class="material-symbols-outlined mdls" slot="start">meeting_room</span>
						<ion-label>
							<p>Salle</p>
							<h2>{{rooms}}</h2>
						</ion-label>
					</ion-item>
                </IonList>

                <IonLabel class="listGroupTitle">
                    <p>Horaires</p>
                </IonLabel>

                <IonList class="listGroup">
                    <ion-item class="info-item">
						<span class="material-symbols-outlined mdls" slot="start">schedule</span>
						<ion-label>
							<p>Heure de début</p>
							<h2>{{ new Date(openCours_time.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</h2>
						</ion-label>
					</ion-item>
                    <ion-item class="info-item">
						<span class="material-symbols-outlined mdls" slot="start">schedule</span>
						<ion-label>
							<p>Heure de fin</p>
							<h2>{{ new Date(openCours_time.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</h2>
						</ion-label>
					</ion-item>
                </IonList>

                <IonLabel class="listGroupTitle" v-if="openCours_status.status">
                    <p>Statut du cours</p>
                </IonLabel>

                <IonList class="listGroup" v-if="openCours_status.status">
                    <ion-item class="info-item">
						<span class="material-symbols-outlined mdls" slot="start">schedule</span>
						<ion-label>
							<p>Statut du cours</p>
							<h2>{{ openCours_status.status }}</h2>
						</ion-label>
					</ion-item>
                </IonList>

                <IonLabel class="listGroupTitle">
                    <p>Actions</p>
                </IonLabel>

                <IonList class="listGroup">
                    <ion-item>
                        <span class="material-symbols-outlined mdls" slot="start">notifications</span>
                        <ion-label class="ion-text-wrap">
                            <h2>Activer les notifications</h2>
                            <p>Vous allez recevoir une notification 5 minutes avant le début du cours.</p>
                        </ion-label>

                        <ion-toggle @ionChange="changeNotif($event)" slot="end" :value="notificationEnabled" ref="toggle"></ion-toggle>
                    </ion-item>
                </IonList>

			</div>
		</ion-content>
</template>

<style scoped>
</style>
