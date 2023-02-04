// Necessary imports for Vue
import { createApp } from 'vue'
// Define MainApp.vue as the main component
import MainApp from './MainApp.vue'
import router from './router';

import VueLazyload from "vue-lazyload";

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/fixes.css';
import './theme/fonts.css';
import './theme/theme.css';

// TypeScript custom components
require('@/functions/app.ts');

export const app = createApp(MainApp)
	.use(IonicVue)
	.use(VueLazyload)
	.use(router);
	
router.isReady().then(() => {
	app.mount('#app');
});

// Global vars in Vue
app.config.globalProperties.$rn = new Date;
if (localStorage.getItem('customApiUrl') == null) {
	app.config.globalProperties.$api = "https://api.getpapillon.xyz";
} else {
	app.config.globalProperties.$api = localStorage.getItem('customApiUrl');
}