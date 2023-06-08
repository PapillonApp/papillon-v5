// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
function getPunishments(forceReload) {
	switch(localStorage.loginService) {
        case "pronote":    
			// return pronote punishements
			return getPronotePunishments(forceReload);
		case "ecoledirecte":
            return;
    }
}

async function getPronotePunishments(forceReload) {
	// gather vars
	const API = app.config.globalProperties.$api;

	// get token
	const token = localStorage.getItem('token');

	// construct url
	const URL = `${API}/punishments?token=${token}`;

	const cache = localStorage.getItem('PunishmentsCache');
	if (cache != null && !forceReload) {
		const punishments = JSON.parse(cache).punishments;

		return new Promise((resolve) => {
			resolve(constructPronotePunishments(punishments));
		});
	}
	else {
		return axios.get(URL)
		.then((response) => {
			let punishments = response.data;

			punishments = constructPronotePunishments(punishments);
			
			const today = new Date();
			const cacheElement = {
				date: today,
				punishments: response.data
			};
			localStorage.setItem('PunishmentsCache', JSON.stringify(cacheElement));

			return punishments;
		})
		.catch((error) => {
			if (error.response) {
				// check if "notfound" or "expired"
				if (error.response.data == "notfound") {
					// get new token
					GetToken();
				}
				else if (error.response.data == "expired") {
					// get new token
					GetToken();
				}
			}

			if(error.code) {
				return new Promise((reject) => {
					reject({
						error: error.code
					});
				});
			}
		});
	}
}

// pronote : construct punishments
function constructPronotePunishments(punishments) {
	const punish = []

	punishments.forEach((punishment) => {
		const newPunishment = {
			data: {
				id: punishment.id,
				reasons: punishment.reason,
				nature: punishment.nature,
				givenBy: punishment.giver
			},
			date: {
				givenDate: new Date(punishment.date),
				schedules: punishment.schedule,
				duration: punishment.duration
			},
			homeworks: punishment.homework,
			status: {
				isSchedulable: punishment.schedulable,
				isExclusion: punishment.exclusion,
				isDuringLesson: punishment.durring_lesson,
			}
		}
		
		punish.push(newPunishment)
	})

	punish.sort((a, b) => {
		return b.date.givenDate - a.date.givenDate;
	})

	return punish
}

export default getPunishments;