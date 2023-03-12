import { app } from '@/main.ts'
import displayToast from '@/functions/utils/displayToast.js';

import axios from 'axios';


import { checkmark, refresh } from 'ionicons/icons';

let waitingForToken = false;

// get token
function getToken() {
    switch(localStorage.loginService) {
        case "pronote":
            return getPronoteLogin();
        case "ecoledirecte":
            return getEDLogin();
    }
}

// pronote : get token
function getPronoteLogin() {
    if(!waitingForToken) {
        // gather vars
        const API = app.config.globalProperties.$api;
        let loginData = null;
        try { 
            loginData = JSON.parse(atob(localStorage.getItem('loginData')));
        } catch(e) {
            displayToast.presentError("Merci de vous reconnecter.", "danger", `Une erreur s'est produite lors de la récupération des données de connexion. Merci de vous reconnecter. (${e})`)
            console.error(`[Connect to Pronote API] Error while parsing loginData: ${e}`);
            return;
        }

        // get username and password
        let username = loginData.username;
        let password = loginData.password;
        let cas = loginData.cas;
        let url = loginData.url;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                    
        var urlencoded = new URLSearchParams();
        urlencoded.append("url", url);
        urlencoded.append("ent", cas);
        urlencoded.append("username", username);
        urlencoded.append("password", password);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        waitingForToken = true;

        displayToast.presentToastSmall(
            "Reconnexion en cours...",
            "light",
            refresh
        )

        document.dispatchEvent(new CustomEvent('connectionState', { detail: 'connecting' }));

        // get token from API
        return fetch(API + "/generatetoken", requestOptions)
        .then(response => response.json())
        .then(result => {
            if(result.token) {
                // save token
                localStorage.setItem('token', result.token);

                // empty localstorage cache
                localStorage.setItem('UserCache', JSON.stringify({}));
                localStorage.setItem('TimetableCache', JSON.stringify([]));

                // broadcast event to document
                document.dispatchEvent(new CustomEvent('tokenUpdated'));
                document.dispatchEvent(new CustomEvent('connectionState', { detail: 'connected' }));

                // set waitingForToken to false
                waitingForToken = false;

                // display toast
                displayToast.presentToastSmall(
                    "Vous êtes à nouveau connecté.",
                    "success",
                    checkmark
                );

                return result.token;
            } else {
                if(result.error == "Missing password" || result.error == "Missing username" || result.error.includes("probably wrong login information") || result.error.includes("probably bad username/password")) {
                    displayToast.presentToast("Merci de vous reconnecter.", "danger")
                } else if(result.error == "Your IP address is suspended.") {
                    displayToast.presentError("Une erreur s'est produite", "danger", "L'adresse IP de nos serveurs est suspendue pour votre établissement. S'il vous plaît réessayez dans quelques heures.")
                }
                else {
                    displayToast.presentError("Une erreur s'est produite.", "danger", result.error)
                }
                // redirect to login page
                console.error('[Get Token]: Return to login page - ' + result);

                document.dispatchEvent(new CustomEvent('connectionState', { detail: 'disconnected' }));
            }
        })
        .catch(error => {
            displayToast.presentError("Impossible de joindre le serveur.", "danger", error)
            console.error('[Get Token]: Unable to join server - ' + error);
        });
    }
}


//ecoledirecte : get token

function getEDLogin() {
    if(!waitingForToken) {
        // gather vars
        const EDAPI = "https://api.ecoledirecte.com/v3"//app.config.globalProperties.$api;


        let loginData = null;
        try { 
            loginData = JSON.parse(atob(localStorage.getItem('loginData')));
        } catch(e) {
            displayToast.presentError("Merci de vous reconnecter.", "danger", `Une erreur s'est produite lors de la récupération des données de connexion. Merci de vous reconnecter. (${e})`)
            console.error(`[Connect to EcoleDirecte API] Error while parsing loginData: ${e}`);
            return;
        }

        // get username and password
        let username = loginData.username;
        let password = loginData.password;

        var requestOptions = {
            headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json, text/plain, */*", "X-Token": "", "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"},            
        };
        let body = `data={
            "uuid": "",
            "identifiant": "${username}",
            "motdepasse": "${password}",
            "isReLogin": false
        }`

        waitingForToken = true;

        displayToast.presentToastSmall(
            "Reconnexion en cours...",
            "light",
            refresh
        )

        // get token from API
        return axios.post(EDAPI + "/login.awp", body, requestOptions)
        .then(result => {
            if(result.code === 200) {
                // save token
                localStorage.setItem('token', result.token);

                // empty localstorage cache
                localStorage.setItem('UserCache', JSON.stringify(result.data.accounts[0]));
                localStorage.setItem('TimetableCache', JSON.stringify([]));

                // broadcast event to document
                document.dispatchEvent(new CustomEvent('tokenUpdated'));

                // set waitingForToken to false
                waitingForToken = false;

                // display toast
                displayToast.presentToastSmall(
                    "Vous êtes à nouveau connecté.",
                    "success",
                    checkmark
                );

                return result.token;
            } else {
                if(result.code === 505) {
                    displayToast.presentToast("Merci de vous reconnecter.", "danger")
                }/* else if(result.error == "Your IP address is suspended.") {
                    displayToast.presentError("Une erreur s'est produite", "danger", "L'adresse IP de nos serveurs est suspendue pour votre établissement. S'il vous plaît réessayez dans quelques heures.")
                }*/
                else {
                    displayToast.presentError("Une erreur s'est produite.", "danger", result.error)
                }
                // redirect to login page
                console.error('[Get Token]: Return to login page - ' + result);
            }
        })
        .catch(error => {
            displayToast.presentError("Impossible de joindre le serveur.", "danger", error)
            console.error('[Get Token]: Unable to join server - ' + error);
        });
    }
}

// export
export default getToken;