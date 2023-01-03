import { toastController, alertController } from '@ionic/vue';
import { Dialog } from '@capacitor/dialog';

async function presentToast(msg, color) {
	const toast = await toastController.create({
		message: msg,
		duration: 2000,
		position: "bottom",
		color: color
	});

	await toast.present();
}


async function presentError(msg, color, error) {
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

export default { presentToast, presentError };