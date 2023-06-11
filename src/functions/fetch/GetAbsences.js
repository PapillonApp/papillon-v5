// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
function getAbsences(forceReload) {
	switch(localStorage.loginService) {
        case "pronote":    
            // return pronote absences
			return getPronoteAbsences(forceReload);
		case "ecoledirecte":
            return;
    }
}

async function getPronoteAbsences(forceReload) {
	// gather vars
	const API = app.config.globalProperties.$api;

	// get token
	const token = localStorage.getItem('token');

	// construct url
	const URL = `${API}/absences?token=${token}`;

	let absences = {};
	const cache = localStorage.getItem('AbsencesCache');
	if (cache != null && !forceReload) {
		absences = JSON.parse(cache).absences;

		return new Promise((resolve) => {
			resolve(constructPronoteAbsences(absences));
		});
	}
	else {
		return axios.get(URL)
		.then((response) => {
			absences = response.data;


			absences = constructPronoteAbsences(absences);
			
            const today = new Date();
			const cacheElement = {
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
				return new Promise((reject) => {
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
	const abs = []

	absences.forEach((absence) => {
		const newAbsence = {
			data: {
				id: absence.id,
				isJustified: absence.justified,
				reasons: absence.reasons,
				hours: absence.hours,
				type: "Absence"
			},
			date: {
				from: new Date(absence.from),
				to: new Date(absence.to),
			}
		}
		
		abs.push(newAbsence)
	})

	abs.sort((a, b) => {
		return b.date.from - a.date.from;
	})

	return abs
}

export default getAbsences;