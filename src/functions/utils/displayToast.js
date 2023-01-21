import { toastController, alertController } from '@ionic/vue';
import { Dialog } from '@capacitor/dialog';

import hapticsController from './hapticsController';

async function presentToast(msg, color) {
	const toast = await toastController.create({
		message: msg,
		duration: 2000,
		position: "bottom",
		color: color
	});

	await toast.present();
}

async function presentToastIcon(msg, color, icon) {
	const toast = await toastController.create({
		message: msg,
		duration: 2000,
		position: "bottom",
		color: color,
		icon: icon
	});

	await toast.present();
}

async function presentToastFull(header, msg, color, icon) {
	// vibration
	if(color == "danger") {
		hapticsController.notification("error");
	}
	else if(color == "success") {
		hapticsController.notification("success");
	}
	else if(color == "warning") {
		hapticsController.notification("warning");
	}

	const toast = await toastController.create({
		header: header,
		message: msg,
		duration: 2000,
		position: "bottom",
		color: color,
		icon: icon
	});

	await toast.present();
}

async function presentError(msg, color, error) {
	// vibration
	if(color == "danger") {
		hapticsController.notification("error");
	}
	
	const toast = await toastController.create({
		message: msg,
		duration: 2000,
		position: "bottom",
		color: color,
		buttons: [{
			text: "Plus d'infos",
			role: 'info',
			handler: () => { 
				if(error == "[object Object]" || error == "undefined" || error == null) {
					error = "Impossible d'obtenir plus d'infos."
				}

				alertDialogError(error)
			}
		},]
	});

	await toast.present();
}


async function alertDialogError(err) {
	const alert = await alertController.create({
		header: "Détails de l'erreur",
		subHeader: "Une erreur s'est produite",
		message: err,
		buttons: ['OK'],
	});

	await alert.present();
}

async function presentToastTest() {
	const toast = await toastController.create({
		message: "Ceci est un test",
		duration: 200000,
		position: "bottom",
		color: "light"
	});

	await toast.present();
}

export default {
	presentToastFull,
	presentToast,
	presentError,
	presentToastIcon,
	presentToastTest
};