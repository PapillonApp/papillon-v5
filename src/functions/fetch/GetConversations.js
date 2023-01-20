// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
function getConversations(forceReload) {
    // as only pronote is supported for now, we can just return the pronote Conversations

    return getPronoteConversations(forceReload);
}

async function getPronoteConversations(forceReload) {
	// gather vars
	const API = app.config.globalProperties.$api;

	// get token
	const token = localStorage.getItem('token');

	// construct url
	let URL = `${API}/discussions?token=${token}`;

	let Conversations = {};
	return axios.get(URL)
		.then((response) => {
            console.log(response.data);

			Conversations = response.data;
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
				return new Promise((resolve, reject) => {
					reject({
						error: error.code
					});
				});
			}
		});
}

// pronote : construct Conversations
function constructPronoteConversations(Conversations) {
	let abs = []

	return abs
}

export default getPronoteConversations;