// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
function getConversations(forceReload) {
	switch(localStorage.loginService) {
        case "pronote":    
            // return pronote conversations
			return getPronoteConversations(forceReload);
		case "ecoledirecte":
            return;
    }
}

async function getPronoteConversations(forceReload) {
	// gather vars
	const API = app.config.globalProperties.$api;

	// get token
	const token = localStorage.getItem('token');

	// construct url
	const URL = `${API}/discussions?token=${token}`;

	// check if cached
    let convCache = localStorage.getItem('ConversationsCache');

    if(convCache != null && !forceReload) {
        // grade is cached, check if it's up to date
        convCache = JSON.parse(convCache);

        const today = new Date();
        const cacheDate = new Date(convCache.date);

        if(today.toDateString() == cacheDate.toDateString()) {
            // grade is up to date, return it
            return new Promise((resolve) => {
                resolve(constructPronoteConversations(convCache.conversations));
            });
        }
    }

	let Conversations = {};
	return axios.get(URL)
		.then((response) => {
			Conversations = response.data;

			// save conversations to localstorage cache with today's date
            const today = new Date();
            const convCache = {
                date: today,
                conversations: response.data
            }

            localStorage.setItem('ConversationsCache', JSON.stringify(convCache));

			Conversations = constructPronoteConversations(Conversations);
			
			return Conversations;
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

// pronote : construct Conversations
function constructPronoteConversations(Conversations) {
	return Conversations
}

export default getConversations;