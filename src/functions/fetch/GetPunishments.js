// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
function getPunishments(forceReload) {
    // as only pronote is supported for now, we can just return the pronote punishments

    return getPronotePunishements(forceReload);
}

async function getPronotePunishements(forceReload) {
	// gather vars
	const API = app.config.globalProperties.$api;

	// get token
	const token = localStorage.getItem('token');

	// construct url
	let URL = `${API}/punishments?token=${token}`;

	let cache = JSON.parse(localStorage.getItem('PunishmentsCache')) || [];
	if (cache.length > 1 && !forceReload) {
		let punishments = JSON.parse(cache.punishments);

		return new Promise((resolve, reject) => {
			resolve(constructPronotePunishments(punishments));
		});
	}
	else {
		return axios.get(URL)
		.then((response) => {
			let punishments = response.data;

			punishments = constructPronotePunishments(punishments);

			// cache response
			let cache = JSON.parse(localStorage.getItem('PunishmentsCache')) || [];
			let cacheElement = {
				token: token,
				punishments: JSON.stringify(response.data)
			};
			cache.push(cacheElement);
			localStorage.setItem('PunishmentsCache', JSON.stringify(cache));

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
				return new Promise((resolve, reject) => {
					resolve({
						error: error.code
					});
				});
			}
		});
	}
}

// pronote : construct punishments
function constructPronotePunishments(punishments) {
	let punish = []

	punishments.forEach((punishment) => {
		let newPunishment = {
			data: {
				id: punishment.id,
				reasons: punishment.reason,
				nature: punishment.nature,
				givenBy: punishment.giver
			},
			date: {
				givenDate: new Date(punishment.date),
				schedule: punishment.schedule,
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
		return a.date.givenDate - b.date.givenDate;
	})

	return punish
}

export default getPronotePunishements;