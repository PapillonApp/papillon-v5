<script>
	import {
		defineComponent
	} from 'vue';
	import {
		IonHeader,
		IonContent,
		IonToolbar,
		IonTitle,
		IonMenuButton,
		IonPage,
		IonDatetime,
		IonModal,
	} from '@ionic/vue';

	import {
		Capacitor
	} from '@capacitor/core';

	import {
		Swiper,
		SwiperSlide
	} from 'swiper/vue';
	import 'swiper/css';

	import GetToken from '@/functions/login/GetToken.js';
	import GetMenus from '@/functions/fetch/GetMenus.js';

	import MenuElement from '@/components/menu/MenuElement.vue';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonContent,
			IonToolbar,
			IonTitle,
			IonMenuButton,
			IonPage,
			IonDatetime,
			Swiper,
			SwiperSlide,
			IonModal,
			// IonRefresher,
			// IonRefresherContent,
			// IonSpinner,
		},
		data() {
			return {
				rnButtonString: this.createDateString(this.$rn),
				loadedrnButtonString: this.createDateString(this.$rn),
				rnCalendarString: this.$rn.toISOString().split('T')[0],
				today: [],
				yesterday: [],
				tomorrow: [],
				shouldResetSwiper: false,
				dontRetryCheck: false,
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
				document.dispatchEvent(new CustomEvent('rnChanged', {
					detail: newDate
				}));
			},
			confirmRnInput() {
				this.$refs.rnPickerModal.$el.dismiss();
			},
			openRnModal() {
				this.$refs.rnPickerModal.$el.present();
			},
			handleRefresh(event) {
				// get new menu data
				this.getMenus(true);

				// stop refresh when this.today is updated
				this.$watch('menu', () => {
					setTimeout(() => {
						event.target.complete();
					}, 200);
				});
			},
			getMenus(force) {
				// reset swiper and show loading spinner
				if (this.shouldResetSwiper) {
					this.$refs.swiper.$el.swiper.slideTo(1, 0);
					this.shouldResetSwiper = false;

					this.today = [];
					this.yesterday = [];
					this.tomorrow = [];

					this.today.loading = true;
					this.yesterday.loading = true;
					this.tomorrow.loading = true;

					this.today.error = "STILL_LOADING";
					this.yesterday.error = "STILL_LOADING";
					this.tomorrow.error = "STILL_LOADING";
				}

				// get menus for rn
				GetMenus(this.$rn, force).then((menu) => {
					this.today = menu
					this.loadedrnButtonString = this.createDateString(this.$rn);
					this.today.loading = false;

					this.dontRetryCheck = true;

					setTimeout(() => {
						this.dontRetryCheck = false;
					}, 200);
				});

				// get menu for yesterday
				let yesterdayRN = new Date(this.$rn) - 86400000;
				GetMenus(yesterdayRN, force).then((menu) => {
					this.yesterday = menu
					this.yesterday.loading = false
				});

				// get menu for tomorrow
				let tomorrowRN = new Date(this.$rn);
				tomorrowRN.setDate(tomorrowRN.getDate() + 1);
				GetMenus(tomorrowRN, force).then((menu) => {
					this.tomorrow = menu
					this.tomorrow.loading = false
				});
			},
		},
		mounted() {
			// on rnChanged, update rnButtonString
			document.addEventListener('rnChanged', (e) => {
				this.rnButtonString = this.createDateString(e.detail);
			});

			// get timetable data
			this.getMenus();

			// on rnChanged, get new timetable data
			document.addEventListener('rnChanged', (e) => {
				this.getMenus();
			});

			// on token changed, get new timetable data
			document.addEventListener('tokenUpdated', (e) => {
				this.getMenus();
			});

			// detect swiper slide change
			let swiper = this.$refs.swiper.$el.swiper;

			swiper.on('touchEnd', () => {
				setTimeout(() => {
					// get new rn
					// check if swiper is on yesterday
					if (swiper.activeIndex == 0) {
						let newRn = new Date(this.$rn);
						newRn.setDate(newRn.getDate() - 1);

						this.$rn = newRn;
						this.rnCalendarString = this.$rn.toISOString().split('T')[0];

						// emit event
						document.dispatchEvent(new CustomEvent('rnChanged', {
							detail: this.$rn
						}));

						// reset swiper
						this.shouldResetSwiper = true;
					}

					// check if swiper is on tomorrow
					if (swiper.activeIndex == 2) {
						// add 1 day to rn
						let newRn = new Date(this.$rn);
						newRn.setDate(newRn.getDate() + 1);

						this.$rn = newRn;
						this.rnCalendarString = this.$rn.toISOString().split('T')[0];

						// emit event
						document.dispatchEvent(new CustomEvent('rnChanged', {
							detail: this.$rn
						}));

						// reset swiper
						this.shouldResetSwiper = true;

						// detect swiper slide change
						let swiper = this.$refs.swiper.$el.swiper;
					}
				}, 200);
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

				<ion-title mode="md">Menus</ion-title>

				<ion-buttons slot="end">
					<ion-button mode="md" color="dark" id="rnPickerModalButton" @click="openRnModal">
						<span class="material-symbols-outlined mdls" slot="start">calendar_month</span>

						<p>{{ rnButtonString }}</p>
					</ion-button>
				</ion-buttons>
			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>

			<IonHeader collapse="condense">
				<IonToolbar>
					<ion-title size="large">Menus</ion-title>
				</IonToolbar>
			</IonHeader>

			<swiper :initialSlide="1" ref="swiper">
				<swiper-slide>
					<MenuElement v-for="menu in yesterday"
						:isLunch="menu.type.isLunch"
						:isDiner="menu.type.isDinner"
						:key="menu.data.id"
						:name="menu.data.name"
						:menus="menu.menus"
					/>

					<div v-if="!yesterday.error"><div class="NoCours" v-if="yesterday.length == 0">
                        <span class="material-symbols-outlined mdls">upcoming</span>
                        <h2>Pas de menu enregistrés pour cette journée</h2>
                        <p>Réessayez un autre jour dans le calendrier ou balayez l'écran.</p>

                        <ion-button fill="clear" @click="openRnModal" class="changeDayButton">Ouvrir le calendrier</ion-button>
                    </div></div>

                    <div v-if="yesterday.error == 'ERR_NETWORK'" class="Error"><div class="NoCours" v-if="yesterday.length == 0">
                        <span class="material-symbols-outlined mdls">wifi_off</span>
                        <h2>Pas de connexion à Internet</h2>
                        <p>Vous pouvez uniquement consulter les journées consultées à l'avance lorsque vous êtes hors-ligne.</p>
                    </div></div>

                    <div v-if="yesterday.loading" class="Error"><div class="NoCours" v-if="yesterday.length == 0">
                        <IonSpinner></IonSpinner>
                        <br/>
                        <h2>Téléchargement des prochains menus...</h2>
                        <p>Veuillez patienter pendant qu'on récupère les menus depuis nos serveurs...</p>
                    </div></div>
				</swiper-slide>

				<swiper-slide>
					<MenuElement v-for="menu in today"
						:isLunch="menu.type.isLunch"
						:isDiner="menu.type.isDinner"
						:key="menu.data.id"
						:name="menu.data.name"
						:menus="menu.menus"
					/>

					<div v-if="!today.error"><div class="NoCours" v-if="today.length == 0">
                        <span class="material-symbols-outlined mdls">upcoming</span>
                        <h2>Pas de menu enregistrés pour cette journée</h2>
                        <p>Réessayez un autre jour dans le calendrier ou balayez l'écran.</p>

                        <ion-button fill="clear" @click="openRnModal" class="changeDayButton">Ouvrir le calendrier</ion-button>
                    </div></div>

                    <div v-if="today.error == 'ERR_NETWORK'" class="Error"><div class="NoCours" v-if="today.length == 0">
                        <span class="material-symbols-outlined mdls">wifi_off</span>
                        <h2>Pas de connexion à Internet</h2>
                        <p>Vous pouvez uniquement consulter les journées consultées à l'avance lorsque vous êtes hors-ligne.</p>
                    </div></div>

                    <div v-if="today.loading" class="Error"><div class="NoCours" v-if="today.length == 0">
                        <IonSpinner></IonSpinner>
                        <br/>
                        <h2>Téléchargement des prochains menus...</h2>
                        <p>Veuillez patienter pendant qu'on récupère les menus depuis nos serveurs...</p>
                    </div></div>
				</swiper-slide>

				<swiper-slide>
					<MenuElement v-for="menu in tomorrow"
						:isLunch="menu.type.isLunch"
						:isDiner="menu.type.isDinner"
						:key="menu.data.id"
						:name="menu.data.name"
						:menus="menu.menus"
					/>

					<div v-if="!tomorrow.error"><div class="NoCours" v-if="tomorrow.length == 0">
                        <span class="material-symbols-outlined mdls">upcoming</span>
                        <h2>Pas de menu enregistrés pour cette journée</h2>
                        <p>Réessayez un autre jour dans le calendrier ou balayez l'écran.</p>

                        <ion-button fill="clear" @click="openRnModal" class="changeDayButton">Ouvrir le calendrier</ion-button>
                    </div></div>

                    <div v-if="tomorrow.error == 'ERR_NETWORK'" class="Error"><div class="NoCours" v-if="tomorrow.length == 0">
                        <span class="material-symbols-outlined mdls">wifi_off</span>
                        <h2>Pas de connexion à Internet</h2>
                        <p>Vous pouvez uniquement consulter les journées consultées à l'avance lorsque vous êtes hors-ligne.</p>
                    </div></div>

                    <div v-if="tomorrow.loading" class="Error"><div class="NoCours" v-if="tomorrow.length == 0">
                        <IonSpinner></IonSpinner>
                        <br/>
                        <h2>Téléchargement des prochains menus...</h2>
                        <p>Veuillez patienter pendant qu'on récupère les menus depuis nos serveurs...</p>
                    </div></div>
				</swiper-slide>
			</swiper>


			<IonModal ref="rnPickerModal" trigger="rnPickerModalButton" class="datetimeModal"
				:keep-contents-mounted="true" :initial-breakpoint="0.55" :breakpoints="[0, 0.55, 1]">
				<IonHeader>
					<IonToolbar>
						<ion-title>Sélection de la date</ion-title>
						<ion-buttons slot="end">
							<ion-button @click="confirmRnInput()">Terminé</ion-button>
						</ion-buttons>
					</IonToolbar>
				</IonHeader>
				<ion-content>
					<IonDatetime presentation="date" ref="rnInput" size="cover" :value="rnCalendarString"
						:firstDayOfWeek="1" @ionChange="rnInputChanged()">
					</IonDatetime>
				</ion-content>
			</IonModal>

		</ion-content>
	</ion-page>
</template>

<style scoped>

</style>