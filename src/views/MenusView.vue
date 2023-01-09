<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage } from '@ionic/vue';

    import { Capacitor } from '@capacitor/core';

	import { Swiper, SwiperSlide } from 'swiper/vue';
	import 'swiper/css';

    import GetToken from '@/functions/login/GetToken.js';
    import GetMenus from '@/functions/fetch/GetMenus.js';

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
			IonRefresher,
			IonRefresherContent,
			IonSpinner,
        },
        data() {
            return { 
				rnButtonString: this.createDateString(this.$rn),
				loadedrnButtonString: this.createDateString(this.$rn),
				rnCalendarString: this.$rn.toISOString().split('T')[0],
				menu: [],
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
				document.dispatchEvent(new CustomEvent('rnChanged', { detail: newDate }));
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

				// stop refresh when this.menu is updated
				this.$watch('menu', () => {
					setTimeout(() => {
						event.target.complete();
					}, 200);
				});
			},
			getMenus(force) {
				// reset swiper and show loading spinner
				if(this.shouldResetSwiper) {
					this.$refs.swiper.$el.swiper.slideTo(1, 0);
					this.shouldResetSwiper = false;

					this.menu = [];
					this.yesterday = [];
					this.tomorrow = [];

					this.menu.loading = true;
					this.yesterday.loading = true;
					this.tomorrow.loading = true;

					this.menu.error = "STILL_LOADING";
					this.yesterday.error = "STILL_LOADING";
					this.tomorrow.error = "STILL_LOADING";
				}

				// get menus for rn
				GetMenus(this.$rn, force).then((menu) => {
					this.menu = menu
					this.loadedrnButtonString = this.createDateString(this.$rn);
					this.menu.loading = false;

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
					if(swiper.activeIndex == 0) {
						let newRn = new Date(this.$rn);
						newRn.setDate(newRn.getDate() - 1);

						this.$rn = newRn;
						this.rnCalendarString = this.$rn.toISOString().split('T')[0];

						// emit event
						document.dispatchEvent(new CustomEvent('rnChanged', { detail: this.$rn }));

						// reset swiper
						this.shouldResetSwiper = true;
					}

					// check if swiper is on tomorrow
					if(swiper.activeIndex == 2) {
						// add 1 day to rn
						let newRn = new Date(this.$rn);
						newRn.setDate(newRn.getDate() + 1);

						this.$rn = newRn;
						this.rnCalendarString = this.$rn.toISOString().split('T')[0];

						// emit event
						document.dispatchEvent(new CustomEvent('rnChanged', { detail: this.$rn }));

						// reset swiper
						this.shouldResetSwiper = true;
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

		

      </ion-content>
    </ion-page>
</template>
  
<style scoped>

</style>