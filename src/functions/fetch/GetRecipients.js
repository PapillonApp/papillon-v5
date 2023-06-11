// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
function getRecipients(forceReload) {
	switch(localStorage.loginService) {
        case "pronote":
            // return pronote recipients
			return getPronoteRecipients(forceReload);
		case "ecoledirecte":
            return;
    }

}

async function getPronoteRecipients(forceReload) {
	// gather vars
	const API = app.config.globalProperties.$api;

	// get token
	const token = localStorage.getItem('token');

	// construct url
	const URL = `${API}/recipients?token=${token}`;

	// check if cached
    let recipientsCache = localStorage.getItem('RecipientsCache');

    if(recipientsCache != null && !forceReload) {
        // grade is cached, check if it's up to date
        recipientsCache = JSON.parse(recipientsCache);

        const today = new Date();
        const cacheDate = new Date(recipientsCache.date);

        if(today.toDateString() == cacheDate.toDateString()) {
            // grade is up to date, return it
            return new Promise((resolve) => {
                resolve(constructPronoteRecipients(recipientsCache.Recipients));
            });
        }
    }

	let Recipients = {};
	return axios.get(URL)
		.then((response) => {
			Recipients = response.data;

			// save Recipients to localstorage cache with today's date
            const today = new Date();
            const recipientsCache = {
                date: today,
                Recipients: response.data
            }

            localStorage.setItem('RecipientsCache', JSON.stringify(recipientsCache));

			Recipients = constructPronoteRecipients(Recipients);
			
			return Recipients;
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

// pronote : construct Recipients
function constructPronoteRecipients(Recipients) {
	return Recipients
}

export default getRecipients;