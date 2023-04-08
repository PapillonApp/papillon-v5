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
		IonToggle
	} from '@ionic/vue';

	import PapillonBackButton from '@/components/PapillonBackButton.vue';
	import hapticsController from '@/functions/utils/hapticsController.js';

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
			IonListHeader,
			IonRadioGroup,
			IonRadio,
			PapillonBackButton,
			IonToggle
		},
		setup() {
			return {
				availableFonts: [
					{ name: "Golos Text (Par défaut)", font: "Golos Text" },
					{ name: "Hind", font: "Hind" },
					{ name: "Asap", font: "Asap" },
					{ name: "Merriweather", font: "Merriweather" },
					{ name: "Sofia Sans", font: "Sofia Sans" },
					{ name: "OpenDyslexic (Expérimental)", font: "OpenDyslexic" },
					{ name: "Système", font: "system-ui" },
				],
				availableColors: [
					{ 
						name: "Vert (Par défaut)",
						color: {
							hex: "#29947A",
							rgb: "41, 148, 122",
						}
					},
					{
						name: "Bleu",
						color: {
							hex: "#29ABE0",
							rgb: "41, 171, 224",
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
					}
				],
			}
		},
		data() {
			let defaultFont = this.availableFonts[0].font;
			let defaultColor = this.availableColors[0];

			if(localStorage.getItem('customizations')) {
				let customizations = JSON.parse(localStorage.getItem('customizations'));

				if(customizations.font) {
					defaultFont = customizations.font;
				}

				if(customizations.color) {
					defaultColor = customizations.color;
				}
			}


			return {
				customThemeModeList: localStorage.getItem('customThemeMode') == 'true',
				currentTheme: localStorage.getItem('themeMode'),
				currentFont: defaultFont,
				currentColor: defaultColor,
			}
		},
		methods: {
			changeTick(option) {
				hapticsController.impact({
					style: 'light'
				});

				let el = this.$refs[option];
				let elChecked = el.$el.checked;

				localStorage.setItem(option, elChecked);

				document.dispatchEvent(new CustomEvent('settingsUpdated'));
				
				this.customThemeModeList = elChecked;

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

				// reset the font select
				this.currentFont = this.availableFonts[0].font;
				this.currentColor = this.availableColors[0];
			},
			fontChange() {
				hapticsController.impact({
					style: 'light'
				});

				let font = this.$refs.fontSelect.$el.value;
				this.currentFont = font;

				document.body.style.setProperty('--papillon-font', '"' + font + '"');

				// save it in local storage
				let customizations = JSON.parse(localStorage.getItem('customizations')) || {};

				customizations.font = font;

				localStorage.setItem('customizations', JSON.stringify(customizations));
			},
			colorChange() {
				hapticsController.impact({
					style: 'light'
				});
				
				let colorHex = this.$refs.colorSelect.$el.value;

				let color = this.availableColors.find((color) => color.color.hex == colorHex);

				document.body.style.setProperty('--ion-color-primary', color.color.hex);
				document.body.style.setProperty('--ion-color-primary-rgb', color.color.rgb);

				// save it in local storage
				let customizations = JSON.parse(localStorage.getItem('customizations')) || {};

				customizations.color = color;

				localStorage.setItem('customizations', JSON.stringify(customizations));
			},
			changeThemeMode() {
				let themeModeValue = this.$refs.themeMode.$el.value;

				localStorage.setItem('themeMode', themeModeValue);

				this.checkThemeMode();
				document.dispatchEvent(new CustomEvent('settingsUpdated'));
			},
			tweakProgressBar() {
				let tweakProgressBar = this.$refs.tweakProgressBar;
				let tweakProgressBarChecked = tweakProgressBar.$el.checked;

				localStorage.setItem('tweakProgressBar', tweakProgressBarChecked);

				document.dispatchEvent(new CustomEvent('settingsUpdated'));
			},
			tweakProgressBarShowPast() {
				let tweakProgressBarShowPast = this.$refs.tweakProgressBarShowPast;
				let tweakProgressBarShowPastChecked = tweakProgressBarShowPast.$el.checked;

				localStorage.setItem('tweakProgressBarShowPast', tweakProgressBarShowPastChecked);

				document.dispatchEvent(new CustomEvent('settingsUpdated'));
			},
			checkThemeMode() {
				let themeMode = this.$refs.themeMode;
				let customThemeMode = this.$refs.customThemeMode;
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
				let colorSelect = this.$refs.colorSelect;
				let colorHex = getComputedStyle(document.body).getPropertyValue('--ion-color-primary');

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
			let useScolColors = this.$refs.useScolColors;
			useScolColors.$el.checked = localStorage.getItem('useScolColors') == 'true';

			// fontSelect
			// get --papillon-font from css
			this.currentFont = getComputedStyle(document.body).getPropertyValue('--papillon-font').replace(/"/g, ''); 

			// get tweakProgressBar ref
			let tweakProgressBar = this.$refs.tweakProgressBar;
			tweakProgressBar.$el.checked = localStorage.getItem('tweakProgressBar') == 'true';

			// get tweakProgressBarShowPast ref
			let tweakProgressBarShowPast = this.$refs.tweakProgressBarShowPast;
			tweakProgressBarShowPast.$el.checked = localStorage.getItem('tweakProgressBarShowPast') != 'false'; // default true

			// get fillToolbar ref
			let fillToolbar = this.$refs.fillToolbar;
			fillToolbar.$el.checked = localStorage.getItem('fillToolbar') == 'true';

			// check if custom theme mode is enabled
			this.checkThemeMode();
			this.checkColor();

			// check if there are customizations
			if(localStorage.getItem('customizations')) {
				let customizations = JSON.parse(localStorage.getItem('customizations'));

				if(customizations.font) {
					this.currentFont = customizations.font;
					
					this.$refs.fontSelect.$el.value = customizations.font;
				}

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
					<PapillonBackButton></PapillonBackButton>
				</ion-buttons>

				<ion-title mode="md">Apparence de Papillon</ion-title>

				<ion-buttons slot="end">
					<IonButton @click="reset()">Réinitialiser</IonButton>
				</ion-buttons>

			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">

			<IonList :inset="true" lines="inset">
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

			<IonList :inset="true" lines="none" v-if="availableColors">
				<ion-list-header>
					<ion-label><p>Couleur d'accentuation</p></ion-label>
				</ion-list-header>
				<ion-radio-group mode="md" :allow-empty-selection="false" :value="currentColor.color.hex" ref="colorSelect" @ionChange="colorChange" id="colorSelect">
					<ion-item :key="i" v-for="(color, i) in availableColors">
						<div class="preRadio">
							<ion-radio mode="md" class="radioColorPreview" :style="`--color: ${color.color.hex};`" :value="color.color.hex"></ion-radio>
						</div>
					</ion-item>
				</ion-radio-group>
			</IonList>

			<IonList :inset="true" lines="inset">
				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">home</span>
					<IonLabel class="ion-text-wrap">
						<h2>Utiliser la couleur sur la page d'accueil</h2>
						<p>Votre couleur d'accentuation s'applique sur l'accueil.</p>
					</IonLabel>
					<IonToggle slot="end" ref="fillToolbar" @ionChange="changeTick('fillToolbar')"></IonToggle>
				</IonItem>
			</IonList>

			<IonList :inset="true" lines="inset" v-if="availableFonts">
				<ion-list-header>
					<ion-label><p>Police d'écriture</p></ion-label>
				</ion-list-header>
				<ion-radio-group :allow-empty-selection="false" :value="currentFont" ref="fontSelect" @ionChange="fontChange">
					<ion-item :key="i" v-for="(font, i) in availableFonts">
						<ion-label :style="`font-family: '${font.font}';`">{{ font.name }}</ion-label>
						<ion-radio slot="end" :value="font.font"></ion-radio>
					</ion-item>
				</ion-radio-group>
			</IonList>

			<IonList :inset="true" lines="inset">
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
		display: flex;
		justify-content: space-between;

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
	}

	#colorSelect ion-item::part(native) {
		--background: transparent;
		border-radius: 300px;

		padding: 0;
	}
</style>