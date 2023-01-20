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

	let cache = localStorage.getItem('PunishmentsCache');
	if (cache != null && !forceReload) {
		let punishments = JSON.parse(cache).punishments;

		return new Promise((resolve, reject) => {
			resolve(constructPronotePunishments(punishments));
		});
	}
	else {
		return axios.get(URL)
		.then((response) => {
			let punishments = response.data;

			// FIXME : NEED TO BE DELETED AFTER DESIGN MADE
			punishments = [{
				"id": "1213D7D9D00D332", 
				"schedulable": true, 
				"schedule": [{
					"id": "117A9D33CB510C2", 
					"start": "2022-09-07 13:30", 
					"duration": 3600.0
				}], 
				"date": "2022-09-01 09:00", 
				"given_by": "M. PROFESSEUR M.", 
				"exclusion": false, 
				"during_lesson": false, 
				"homework": {
					"text": "Exercices 1 à 18 p283-284", 
					"documents": [

					]
				},
				"reason": {
					"text": ["Violence verbale"], 
					"circumstances": "Insultes suite à une réprimande", 
					"documents": [

					]
				}, 
				"nature": "Retenue", 
				"duration": 3600.0
			},
			{
				"id": "1213D7D9D00D445", 
				"schedulable": false, 
				"schedule": [

				], 
				"date": "2022-12-15 10:00", 
				"given_by": "M. PROFESSEUR M.", 
				"exclusion": true, 
				"during_lesson": false, 
				"homework": {
					"text": "", 
					"documents": [

					]
				},
				"reason": {
					"text": ["Fausse alarme"], 
					"circumstances": "Insultes suite à une réprimande", 
					"documents": [

					]
				}, 
				"nature": "Devoir supplémentaire", // "Exclusion" 
				"duration": 3600.0
			}]

			punishments = constructPronotePunishments(punishments);
			
			let today = new Date();
			let cacheElement = {
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
				return new Promise((resolve, reject) => {
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
		return a.date.givenDate - b.date.givenDate;
	})

	return punish
}

export default getPronotePunishements;