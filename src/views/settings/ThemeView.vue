<script>
	import {
		defineComponent
	} from 'vue';
	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonListHeader,
		IonItem,
		IonButtons,
		IonButton,
		IonLabel,
		IonRadioGroup,
		IonRadio,
		IonToggle,
		IonBackButton
	} from '@ionic/vue';

	import PapillonBackButton from '@/components/PapillonBackButton.vue';
	import hapticsController from '@/functions/utils/hapticsController.js';

	import CoursesColorView from '@/views/settings/CoursesColorView.vue';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonButtons,
			IonButton,
			IonLabel,
			IonItem,
			IonList,
			IonRadioGroup,
			IonRadio,
			IonBackButton,
			IonToggle
		},
		setup() {
			return {
				CoursesColorView: CoursesColorView,
				availableColors: [
					{ 
						name: "Vert",
						color: {
							hex: "#29947A",
							rgb: "41, 148, 122",
						}
					},
					{
						name: "Ciel",
						color: {
							hex: "#29ABE0",
							rgb: "41, 171, 224",
						}
					},
					{
						name: "Bleu",
						color: {
							hex: "#007AFF",
							rgb: "0, 122, 255",
						}
					},
					{
						name: "Indigo",
						color: {
							hex: "#4F5BD5",
							rgb: "79, 91, 213",
						}
					},
					{
						name: "Orange",
						color: {
							hex: "#E78113",
							rgb: "231, 129, 19",
						}
					},
					{
						name: 'Saumon',
						color: {
							hex: '#DC688A',
							rgb: '220, 104, 138',
						}
					},
					{
						name: 'Violet',
						color: {
							hex: '#9266CC',
							rgb: '146, 102, 204',
						}
					},
					{
						name: 'Rouge',
						color: {
							hex: '#C53333',
							rgb: '197, 51, 51',
						}
					},
					{
						name: 'Marron',
						color: {
							hex: '#A67C52',
							rgb: '166, 124, 82',
						}
					},
					{
						name: 'Moutarde',
						color: {
							hex: '#D4B52A',
							rgb: '212, 181, 42',
						}
					},
					{
						name: 'Vert citron',
						color: {
							hex: '#A6C52A',
							rgb: '166, 197, 42',
						}
					},
					{
						name: 'Gris',
						color: {
							hex: '#8C8C8C',
							rgb: '140, 140, 140',
						}
					},
					{
						name: 'Turquoise',
						color: {
							hex: '#13C5C5',
							rgb: '19, 197, 197',
						}
					},
				],
			}
		},
		data() {
			let defaultColor = this.availableColors[0];

			if(localStorage.getItem('customizations')) {
				const customizations = JSON.parse(localStorage.getItem('customizations'));

				if(customizations.color) {
					defaultColor = customizations.color;
				}
			}


			return {
				customThemeModeList: localStorage.getItem('customThemeMode') == 'true',
				currentTheme: localStorage.getItem('themeMode'),
				currentColor: defaultColor,
				currentColorName: defaultColor.name,
			}
		},
		methods: {
			pop() {
				return false;
			},
			changeTick(option) {
				hapticsController.impact({
					style: 'light'
				});

				const el = this.$refs[option];
				const elChecked = el.$el.checked;

				localStorage.setItem(option, elChecked);

				document.dispatchEvent(new CustomEvent('settingsUpdated'));
				
				if(option == "customThemeMode") {
					this.customThemeModeList = elChecked;
				}

				if (option == "useScolColors") {
					localStorage.removeItem('SubjectColors');
				} else if (option == "customThemeMode" && elChecked == false) {
					localStorage.removeItem('themeMode');
				}
			},
			reset() {
				// remove the customizations from local storage
				localStorage.removeItem('customizations');

				// reset the css variables
				document.body.style = '';

				// reset the select
				this.currentColor = this.availableColors[0];
			},
			colorChange() {
				hapticsController.impact({
					style: 'light'
				});
				
				const colorHex = this.$refs.colorSelect.$el.value;

				const color = this.availableColors.find((color) => color.color.hex == colorHex);

				this.currentColorName = color.name;

				document.body.style.setProperty('--ion-color-primary', color.color.hex);
				document.body.style.setProperty('--ion-color-primary-rgb', color.color.rgb);

				// save it in local storage
				const customizations = JSON.parse(localStorage.getItem('customizations')) || {};

				customizations.color = color;

				localStorage.setItem('customizations', JSON.stringify(customizations));
			},
			changeThemeMode() {
				const themeModeValue = this.$refs.themeMode.$el.value;

				localStorage.setItem('themeMode', themeModeValue);

				this.checkThemeMode();
				document.dispatchEvent(new CustomEvent('settingsUpdated'));
			},
			tweakProgressBar() {
				const tweakProgressBar = this.$refs.tweakProgressBar;
				const tweakProgressBarChecked = tweakProgressBar.$el.checked;

				localStorage.setItem('tweakProgressBar', tweakProgressBarChecked);

				document.dispatchEvent(new CustomEvent('settingsUpdated'));
			},
			tweakProgressBarShowPast() {
				const tweakProgressBarShowPast = this.$refs.tweakProgressBarShowPast;
				const tweakProgressBarShowPastChecked = tweakProgressBarShowPast.$el.checked;

				localStorage.setItem('tweakProgressBarShowPast', tweakProgressBarShowPastChecked);

				document.dispatchEvent(new CustomEvent('settingsUpdated'));
			},
			checkThemeMode() {
				const themeMode = this.$refs.themeMode;
				const customThemeMode = this.$refs.customThemeMode;
				console.log(customThemeMode.$el.checked);

				if (localStorage.getItem('customThemeMode') == 'true') {
					let enableTheme = null;
					if (localStorage.getItem('themeMode') != null) {
						enableTheme = localStorage.getItem('themeMode') == 'dark' ? 'dark' : 'light';
					} else {
						enableTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
					}

					customThemeMode.$el.checked = true;
					themeMode.$el.value = enableTheme;
				} else {
					this.customThemeModeList = false;
					customThemeMode.$el.checked = false;
				}
			},
			checkColor() {
				const colorSelect = this.$refs.colorSelect;
				const colorHex = getComputedStyle(document.body).getPropertyValue('--ion-color-primary');

				for (let i = 0; i < this.availableColors.length; i++) {
					const elt = this.availableColors[i];
					if (elt.color.hex == colorHex) {
						colorSelect.$el.value = elt.name;
					}
				}
			}
		},
		mounted() {		
			// get useScolColors ref
			const useScolColors = this.$refs.useScolColors;
			useScolColors.$el.checked = localStorage.getItem('useScolColors') == 'true';

			// get tweakProgressBar ref
			const tweakProgressBar = this.$refs.tweakProgressBar;
			tweakProgressBar.$el.checked = localStorage.getItem('tweakProgressBar') == 'true';

			// get tweakProgressBarShowPast ref
			const tweakProgressBarShowPast = this.$refs.tweakProgressBarShowPast;
			tweakProgressBarShowPast.$el.checked = localStorage.getItem('tweakProgressBarShowPast') != 'false'; // default true

			// check if custom theme mode is enabled
			this.checkThemeMode();
			this.checkColor();

			// check if there are customizations
			if(localStorage.getItem('customizations')) {
				const customizations = JSON.parse(localStorage.getItem('customizations'));

				if(customizations.color) {
					this.currentColor = customizations.color;
				}
			}
		}
	});
</script>

<template>
		<IonHeader class="AppHeader" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<IonBackButton class="only-ios" text="Paramètres" @click="pop"></IonBackButton>
					<IonBackButton class="only-md" @click="pop"></IonBackButton>
				</ion-buttons>

				<ion-title>Apparence</ion-title>

				<ion-buttons slot="end">
					<IonButton @click="reset()">Réinitialiser</IonButton>
				</ion-buttons>

			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">
			<ion-header collapse="condense">
				<ion-toolbar>
					<ion-title size="large">Apparence</ion-title>
				</ion-toolbar>
			</ion-header>

			<IonLabel class="listGroupTitle">
				<p>Sélection du thème</p>
			</IonLabel>

			<IonList class="listGroup" lines="inset">
				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">contrast</span>
					<IonLabel class="ion-text-wrap">
						<h2>Choisir le thème manuellement</h2>
					</IonLabel>
					<IonToggle slot="end" ref="customThemeMode" @ionChange="changeTick('customThemeMode')"></IonToggle>
				</IonItem>

				<ion-radio-group v-if="customThemeModeList" :value="currentTheme" ref="themeMode" @ionChange="changeThemeMode">
					<ion-item :key="0">
						<span class="material-symbols-outlined mdls" slot="start">dark_mode</span>
						<ion-label>Mode sombre</ion-label>
						<ion-radio slot="end" value="dark"></ion-radio>
					</ion-item>

					<ion-item :key="1">
						<span class="material-symbols-outlined mdls" slot="start">light_mode</span>
						<ion-label>Mode clair</ion-label>
						<ion-radio slot="end" value="light"></ion-radio>
					</ion-item>
				</ion-radio-group>
			</IonList>

			<IonLabel class="listGroupTitle">
				<p>Couleur d'accuentuation</p>
			</IonLabel>

			<IonList class="listGroup" lines="none" v-if="availableColors">
				<ion-radio-group mode="md" :allow-empty-selection="false" :value="currentColor.color.hex" ref="colorSelect" @ionChange="colorChange" id="colorSelect">
					<ion-item :key="i" v-for="(color, i) in availableColors">
						<div class="preRadio">
							<ion-radio mode="md" class="radioColorPreview" :style="`--color: ${color.color.hex};`" :value="color.color.hex"></ion-radio>
						</div>
					</ion-item>
				</ion-radio-group>
				<ion-item color="primary" class="preview">
					<span class="material-symbols-outlined mdls" slot="start">palette</span>
					<ion-label class="ion-text-wrap">
						<h2>Aperçu du {{ currentColorName.toLowerCase() }}</h2>
						<p>Ceci est une prévisualisation de la couleur que vous venez d'appliquer.</p>
					</ion-label>
				</ion-item>
			</IonList>

			<IonLabel class="listGroupTitle">
				<p>Matières</p>
			</IonLabel>

			<IonList class="listGroup" lines="inset">
				<ion-nav-link router-direction="forward" :component="CoursesColorView">
					<IonItem button>
						<span class="material-symbols-outlined mdls" slot="start">palette</span>
						<IonLabel class="ion-text-wrap">
							<h2>Couleur des matières</h2>
							<p>Personnalisez la couleur de chaque matière</p>
						</IonLabel>
					</IonItem>
				</ion-nav-link>
			</IonList>

			<IonLabel class="listGroupTitle">
				<p>Paramètres du thème</p>
			</IonLabel>

			<IonList class="listGroup" lines="inset">
				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">invert_colors</span>
					<IonLabel class="ion-text-wrap">
						<h2>Utiliser les couleurs de l'établissement</h2>
						<p>Permet d'utiliser les couleurs de votre service scolaire pour identifier les matières.</p>
					</IonLabel>
					<IonToggle slot="end" ref="useScolColors" @ionChange="changeTick('useScolColors')"></IonToggle>
				</IonItem>

				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">timelapse</span>
					<IonLabel class="ion-text-wrap">
						<h2>Activer l'animation de la progression d'un cours</h2>
						<p>(Expérimental) Indiquer la progression d'un cours en cours avec une animation</p>
					</IonLabel>
					<IonToggle slot="end" ref="tweakProgressBar" @ionChange="changeTick('tweakProgressBar')"></IonToggle>
				</IonItem>

				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">fast_rewind</span>
					<IonLabel class="ion-text-wrap">
						<h2>Montrer la progression des cours passés</h2>
						<p>(Expérimental) Indiquer les cours passés avec un style différent</p>
					</IonLabel>
					<IonToggle slot="end" ref="tweakProgressBarShowPast" @ionChange="changeTick('tweakProgressBarShowPast')"></IonToggle>
				</IonItem>
			</IonList>

		</ion-content>
</template>

<style scoped>
	.md .paddingFixMd {
		padding-left: 15px;
	}

	.colorPreview {
		width: 18px;
		height: 18px;
		border-radius: 300px;

		background: var(--color);
		position: relative;
	}

	.colorPreview:before {
		content: '';
		position: absolute;
		--offset: 4px;
		top: calc(0px - var(--offset));
		left: calc(0px - var(--offset));
		width: calc(100% + var(--offset));
		height: calc(100% + var(--offset));
		border-radius: 300px;
		border: calc(var(--offset) / 2) solid var(--color);
	}

	ion-item .mdls {
		width: auto;
		padding: 7px;
		background-color: #00000012;
		border-radius: 300px;

		margin-right: 20px;
	}

	.dark ion-item .mdls {
		background-color: #ffffff22;
	}

	#colorSelect {
		padding-top: 5px;
		display: grid;

		grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));

		/* center */
		justify-items: space-between;

		width: calc(100% - 15px * 2);
		margin: 5px 15px;

		margin-top: 0px;
	}

	#colorSelect ion-item {
		width: 48px;
		--inner-padding-end: 0;
	}

	.preRadio {
		width: 100%;
		height: 100%;

		display: flex;
		justify-content: center;
		align-items: center;

		flex-direction: column;
	}

	#colorSelect ion-item::part(native) {
		--background: transparent;
		border-radius: 300px;

		padding: 0;
	}

	.preview * {
		--ion-text-color: #ffffff !important;
		color : #ffffff !important;
	}
</style>