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
	let URL = `${API}/absences?token=${token}`;

	let cache = JSON.parse(localStorage.getItem('AbsencesCache')) || [];
	if (cache.length > 1 && !forceReload) {
		let absences = JSON.parse(cache.absences);

		return new Promise((resolve, reject) => {
			resolve(constructPronoteAbsences(absences));
		});
	}
	else {
		return axios.get(URL)
		.then((response) => {
			let absences = response.data;

			absences = constructPronoteAbsences(absences);

			// cache response
			let cache = JSON.parse(localStorage.getItem('AbsencesCache')) || [];
			let cacheElement = {
				token: token,
				absences: JSON.stringify(response.data)
			};
			cache.push(cacheElement);
			localStorage.setItem('AbsencesCache', JSON.stringify(cache));

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
					resolve({
						error: error.code
					});
				});
			}
		});
	}
}

// pronote : construct absences
function constructPronoteAbsences(absences) {
	let absences = []

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
	})
}