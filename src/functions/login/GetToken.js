import { app } from '@/main.ts'
import displayToast from '@/functions/utils/displayToast.js';

import axios from 'axios';
import getEDPhoto from "@/functions/fetch/getEDPhoto";
import getEDPeriods from '@/functions/fetch/getEDPeriods.js';


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
    return new Promise((resolve, reject) => {
        if(!waitingForToken) {
            // gather vars
            const API = app.config.globalProperties.$api;
            let loginData = null;
            try { 
                loginData = JSON.parse(atob(localStorage.getItem('loginData')));
            } catch(e) {
                displayToast.presentError("Merci de vous reconnecter.", "danger", `Une erreur s'est produite lors de la récupération des données de connexion. Merci de vous reconnecter. (${e})`)
                console.error(`[Connect to Pronote API] Error while parsing loginData: ${e}`);
                reject(e)
                return;
            }
    
            // get username and password
            const username = loginData.username;
            const password = loginData.password;
            const cas = loginData.cas;
            const url = loginData.url;
    
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                        
            const urlencoded = new URLSearchParams();
            urlencoded.append("url", url);
            urlencoded.append("ent", cas);
            urlencoded.append("username", username);
            urlencoded.append("password", password);
    
            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow'
            };
    
            waitingForToken = true;
    
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
    
                    resolve(result.token)
                } else {
                    if(result.error == "Missing password" || result.error == "Missing username" || result.error.includes("probably wrong login information") || result.error.includes("probably bad username/password")) {
                        displayToast.presentToast("Merci de vous reconnecter.", "danger")
                    } else if(result.error == "Your IP address is suspended.") {
                        displayToast.presentError("Une erreur s'est produite", "danger", "L'adresse IP de nos serveurs est suspendue pour votre établissement. S'il vous plaît réessayez dans quelques heures.")
                    }
                    else {
                        displayToast.presentError("Une erreur s'est produite.", "danger", result.error)
                    }
                    reject(result.error)
                    // redirect to login page
                    console.error('[Get Token]: Return to login page - ' + result);
    
                    document.dispatchEvent(new CustomEvent('connectionState', { detail: 'disconnected' }));
                    waitingForToken = false;
                }
            })
            .catch(error => {
                displayToast.presentError("Impossible de joindre le serveur.", "danger", "" + error + "")
                console.error('[Get Token]: Unable to join server - ' + error);
                document.dispatchEvent(new CustomEvent('connectionState', { detail: 'disconnected' }));
                waitingForToken = false;
                reject("" + error + "")
            });
        }
    })
}


//ecoledirecte : get token
function getEDLogin() {
    return new Promise((resolve, reject) => {
        document.dispatchEvent(new CustomEvent('connectionState', { detail: 'connecting' }));
        if(!waitingForToken) {
            // gather vars
            const EDAPI = "https://api.ecoledirecte.com/v3"//app.config.globalProperties.$api;
    
    
            let loginData = null;
            try { 
                loginData = JSON.parse(atob(localStorage.getItem('loginData')));
            } catch(e) {
                displayToast.presentError("Une erreur interne est survenue", "danger", `Une erreur s'est produite lors de la récupération des données de connexion. Merci de vous reconnecter. (${e})`)
                console.error(`[Connect to EcoleDirecte API] Error while parsing loginData: ${e}`);
                reject(e)
                document.dispatchEvent(new CustomEvent('connectionState', { detail: 'disconnected' }));
                return;
            }
    
            // get username and password
            const username = loginData.username;
            const password = loginData.password;
    
            const requestOptions = {
                headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Token": ""},            
            };
    
            // encodeURIComponent because Ecoledirect needs urlencode on any field !
            const body = `data={
                "uuid": "",
                "identifiant": "${encodeURIComponent(username)}",
                "motdepasse": "${encodeURIComponent(password)}",
                "isReLogin": false
            }`
    
            waitingForToken = true;
    
            // get token from API
            return axios.post(EDAPI + "/login.awp", body, requestOptions)
            .then(async result => {
                if(result.data.code === 200) {
                    // save token
                    localStorage.setItem('token', result.data.token);
    
                    // set base64 avatar
                    result.data.data.accounts[0].profile.photo = await getEDPhoto(result.data.data.accounts[0])

                    // empty localstorage cache
                    localStorage.setItem('TimetableCache', JSON.stringify([]));

                    // get periods
                    await getEDPeriods(result.data.data.accounts[0].id, result.data.token).then(periods => {
                        result.data.data.accounts[0].periods = periods;
                    })
                    localStorage.setItem('UserCache', JSON.stringify(result.data.data.accounts[0]));
                    // broadcast event to document
                    document.dispatchEvent(new CustomEvent('tokenUpdated'));

                    // set waitingForToken to false
                    waitingForToken = false;
                    document.dispatchEvent(new CustomEvent('connectionState', { detail: 'connected' }));
                    resolve(result.data.token);
                } else {
                    reject(result.code + ", " + result.message)
                    if(result.data.code === 505) {
                        displayToast.presentToast("Échec de la reconnexion", "danger", "Vos identifiants semblent invalides. Pour les mettre à jour, déconnectez-vous puis reconnectez-vous de papillon.\n" + result.data.message)
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
                console.error(error)
                console.error('[Get Token]: Unable to join server - ' + error);
                document.dispatchEvent(new CustomEvent('connectionState', { detail: 'disconnected' }));
                reject(`[${error.code}] ${error.name}: ${error.message}`)
            });
        }
    })
}

// export
export default getToken;