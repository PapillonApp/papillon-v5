// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
function getDelays(forceReload) {
    // as only pronote is supported for now, we can just return the pronote delays

    return getPronoteDelays(forceReload);
}

async function getPronoteDelays(forceReload) {
	// gather vars
	const API = app.config.globalProperties.$api;

	// get token
	const token = localStorage.getItem('token');

	// construct url
	let URL = `${API}/infos?token=${token}`;

	let delays = {};
	let cache = localStorage.getItem('DelaysCache');
	if (cache != null && !forceReload) {
		delays = JSON.parse(cache).delays;

		return new Promise((resolve, reject) => {
			resolve(constructPronoteDelays(delays));
		});
	}
	else {
		return axios.get(URL)
		.then((response) => {
			delays = response.data;

			// FIXME : NEED TO BE DELETED AFTER DESIGN MADE
			delays = [
				{
					"id": "1DB8FEAD2862E",
					"date": "2022-11-22 10:00",
					"justified": true,
					"duration": 5,
					"justification": "RDV MEDICAL EXTERIEUR",
					"reasons": [
						"RDV MEDICAL EXTERIEUR"
					]
				},
				{
					"id": "10E95E4D2866F",
					"date": "2023-04-03 10:00",
					"justified": false,
					"duration": 15,
					"justification": "RDV MEDICAL EXTERIEUR",
					"reasons": [
						"RDV MEDICAL EXTERIEUR"
					]
				},
				{
					"id": "165B7E4D2863B",
					"date": "2023-05-05 09:00",
					"justified": true,
					"duration": 1,
					"justification": "RDV MEDICAL EXTERIEUR",
					"reasons": [
						"RDV MEDICAL EXTERIEUR"
					]
				}
			]

			delays = constructPronoteDelays(delays);
			
            let today = new Date();
			let cacheElement = {
				date: today,
				delays: response.data
			};
			localStorage.setItem('DelaysCache', JSON.stringify(cacheElement));

			return delays;
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

// pronote : construct delays
function constructPronoteDelays(delays) {
	let dly = []

	delays.forEach((delay) => {
		let newDelay = {
			data: {
				id: delay.id,
				isJustified: delay.justified,
				justification: delay.justification,
				reasons: delay.reasons,
			},
			date: {
				date: new Date(delay.date),
				duration: delay.duration,
			}
		}
		
		dly.push(newDelay)
	})

	dly.sort((a, b) => {
		return a.date.from - b.date.from;
	})

	return dly
}

export default getPronoteDelays;