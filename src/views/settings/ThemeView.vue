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
		IonChip,
        IonBackButton,
        IonButtons,
        IonButton,
        IonLabel,
        IonSelect,
        IonSelectOption,
	} from '@ionic/vue';

	const displayToast = require('@/functions/utils/displayToast.js');

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
            IonBackButton,
            IonButtons,
            IonButton,
            IonLabel,
            IonItem,
            IonList,
            IonListHeader,
            IonSelect,
            IonSelectOption,
		},
		setup() {
			return {
                availableFonts: ["Hind", "Asap", "Roboto Slab", "system-ui"]
			}
		},
		methods: {
            hexToRgb(hex) {
                let r = 0, g = 0, b = 0;
                // 3 digits
                if (hex.length == 4) {
                    r = "0x" + hex[1] + hex[1];
                    g = "0x" + hex[2] + hex[2];
                    b = "0x" + hex[3] + hex[3];
                // 6 digits
                } else if (hex.length == 7) {
                    r = "0x" + hex[1] + hex[2];
                    g = "0x" + hex[3] + hex[4];
                    b = "0x" + hex[5] + hex[6];
                }
                return +r + "," + +g + "," + +b;
            },
            reset() {
                // remove the customizations from local storage
                localStorage.removeItem('customizations');

                // reset the css variables
                document.body.style = '';

                // get --ion-color-primary from css
                let mainColor = getComputedStyle(document.body).getPropertyValue('--ion-color-primary');
                // apply it to the input
                this.$refs.mainColorInput.value = mainColor;

                // reset the font select
                this.$refs.fontSelect.value = this.availableFonts[0];
            },
            fontChange() {
                let font = this.$refs.fontSelect.$el.value;
                document.body.style.setProperty('--papillon-font', '"' + font + '"');

                // save it in local storage
                let customizations = JSON.parse(localStorage.getItem('customizations')) || {};

                customizations.font = font;

                localStorage.setItem('customizations', JSON.stringify(customizations));
            }
		},
		data() {
			return {
				
			}
		},
		mounted() {
            // mainColorInput
            // get --ion-color-primary from css
            let mainColor = getComputedStyle(document.body).getPropertyValue('--ion-color-primary');
            // apply it to the input
            this.$refs.mainColorInput.value = mainColor;

            // when the input value change
            this.$refs.mainColorInput.addEventListener('change', (e) => {
                // get the new value
                let newColor = e.target.value;
                console.log(newColor);
                // apply it to the css variable
                document.body.style.setProperty('--ion-color-primary', newColor);
                document.body.style.setProperty('--ion-color-primary-rgb', this.hexToRgb(newColor));
                document.body.style.setProperty('--ion-color-primary-shade', newColor);
                document.body.style.setProperty('--ion-color-primary-tint', newColor);
                // save it in local storage
                let customizations = JSON.parse(localStorage.getItem('customizations')) || {};

                customizations.mainColor = {
                    hex: newColor,
                    rgb: this.hexToRgb(newColor)
                }

                localStorage.setItem('customizations', JSON.stringify(customizations));
            });

            // fontSelect
            // get --papillon-font from css
            let font = getComputedStyle(document.body).getPropertyValue('--papillon-font');
            // apply it to the input
            this.$refs.fontSelect.$el.value = font.replace(/"/g, '');
		}
	});
</script>

<template>
		<IonHeader class="AppHeader" collapse="fade" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<IonBackButton mode="md" default-href="settings"></IonBackButton>
				</ion-buttons>

				<ion-title mode="md">Personnaliser Papillon</ion-title>

                <ion-buttons slot="end">
					<IonButton @click="reset()">Réinitialiser</IonButton>
				</ion-buttons>

			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">

			<IonList :inset="true" lines="inset">
                <IonListHeader>
                    <IonLabel>
                        <p>Couleurs</p>
                    </IonLabel>
                </IonListHeader>

                <IonItem>
                    <IonLabel>
                        <h2>Couleur principale</h2>
                        <p>Couleur dominante de l'application</p>
                    </IonLabel>
                    <input type="color" ref="mainColorInput" class="colorInput" slot="end"/>
                </IonItem>
            </IonList>

            <IonList :inset="true" lines="inset">
                <IonListHeader>
                    <IonLabel>
                        <p>Polices</p>
                    </IonLabel>
                </IonListHeader>

                <IonItem>
                    <IonLabel class="paddingFixMd">
                        <h2>Police principale</h2>
                        <p>Police utilisée dans les titres et autres..</p>
                    </IonLabel>
                    <ion-select placeholder="Police" slot="end" @ionChange="fontChange" ref="fontSelect" okText="Sélectionner" cancelText="Annuler">
                        <ion-select-option :key="i" v-for="(font, i) in availableFonts" :value="font">{{ font }}</ion-select-option>
                    </ion-select>
                </IonItem>
            </IonList>

		</ion-content>
</template>

<style scoped>
	.md .paddingFixMd {
        padding-left: 15px;
    }
</style>