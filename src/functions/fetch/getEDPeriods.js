// modules
import axios from 'axios';

// vars
import GetToken from '@/functions/login/GetToken.js';


//main function

async function getEDPeriods(userid, token) {
	const EDAPI = "https://api.ecoledirecte.com/v3"
	console.log("Getting grades from ecoledirecte")

    console.log(`[${userid}] : ${token.length}`)
    // construct url (date is a TEST date)
	let URL = `${EDAPI}/eleves/${userid}/notes.awp?verbe=get`;

	var requestOptions = {
		headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Token": token },            
	};
	let body = `data={}`

	// send request
	return axios.post(URL, body, requestOptions).then((response) => {
		if (response.data.code != 200) {
			if (response.data.code === 525) {
				// get new token
				GetToken();
			} else if(response.data.code === 520) {
				GetToken();
			}
			else {
				return new Promise((reject) => {
					reject({
						error: response.data.code
					});
				});
			}
		}
		let periodes = response.data.data.periodes;

        let periods = [];
		periodes.forEach(prd => {
			let period = {
				start: prd.dateDebut,
				end: prd.dateFin,
				name: prd.periode,
				id: prd.idPeriode,
				actual: !prd.cloture
			}
			periods.push(period)
		})

		localStorage.setItem('periodsCache', JSON.stringify(periods));

		// construct grades and return it as a promise
		return new Promise((resolve) => {
			resolve(periods);
		});
	})
}

export default getEDPeriods;