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
        },
        data() {
            return { 

            }
        },
        methods: {

        },
        mounted() {
			// on rnChanged, update rnButtonString
			document.addEventListener('rnChanged', (e) => {
				this.rnButtonString = this.createDateString(e.detail);
			});

			// get timetable data
			this.getTimetables();

			// on rnChanged, get new timetable data
			document.addEventListener('rnChanged', (e) => {
				this.getTimetables();
			});

			// on token changed, get new timetable data
			document.addEventListener('tokenUpdated', (e) => {
				this.getTimetables();
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