// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
function getAbsences(forceReload) {
    // as only pronote is supported for now, we can just return the pronote absences

    return getPronoteAbsences(forceReload);
}

async function getPronoteAbsences(forceReload) {
	// gather vars
	const API = app.config.globalProperties.$api;

	// get token
	const token = localStorage.getItem('token');

	// construct url
	let URL = `${API}/infos?token=${token}`;

	let absences = {};
	let cache = localStorage.getItem('AbsencesCache');
	if (cache != null && !forceReload) {
		absences = JSON.parse(cache).absences;

		return new Promise((resolve, reject) => {
			resolve(constructPronoteAbsences(absences));
		});
	}
	else {
		return axios.get(URL)
		.then((response) => {
			absences = response.data;

			// FIXME : NEED TO BE DELETED AFTER DESIGN MADE
			absences = [
				{
					"id": "1DB8FEAD2862E",
					"from": "2022-11-22 10:00",
					"to": "2022-11-22 12:30",
					"justified": true,
					"hours": "2h30",
					"reasons": [
						"RDV MEDICAL EXTERIEUR"
					]
				},
				{
					"id": "10E95E4D2866F",
					"from": "2023-04-03 10:00",
					"to": "2023-04-03 17:30",
					"justified": false,
					"hours": "5h30",
					"reasons": [
						"RDV MEDICAL EXTERIEUR"
					]
				},
				{
					"id": "165B7E4D2863B",
					"from": "2023-05-05 09:00",
					"to": "2023-05-05 11:00",
					"justified": true,
					"hours": "2h00",
					"reasons": [
						"RDV MEDICAL EXTERIEUR"
					]
				}
			]


			absences = constructPronoteAbsences(absences);
			
            let today = new Date();
			let cacheElement = {
				date: today,
				absences: response.data
			};
			localStorage.setItem('AbsencesCache', JSON.stringify(cacheElement));

			return absences;
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

// pronote : construct absences
function constructPronoteAbsences(absences) {
	let abs = []

	absences.forEach((absence) => {
		let newAbsence = {
			data: {
				id: absence.id,
				isJustified: absence.justified,
				reasons: absence.reasons,
				hours: absence.hours
			},
			date: {
				from: new Date(absence.from),
				to: new Date(absence.to),
			}
		}
		
		abs.push(newAbsence)
	})

	abs.sort((a, b) => {
		return a.date.from - b.date.from;
	})

	return abs
}

export default getPronoteAbsences;