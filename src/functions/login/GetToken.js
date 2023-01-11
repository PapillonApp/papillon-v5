import { app } from '@/main.ts'
import displayToast from '@/functions/utils/displayToast.js';

let waitingForToken = false;

// get token
function getToken() {
    return getPronoteLogin();
}

// pronote : get token
function getPronoteLogin() {
    if(!waitingForToken) {
        // gather vars
        const API = app.config.globalProperties.$api;
        let loginData = JSON.parse(localStorage.getItem('loginData'));

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

        // get token from API
        fetch(API + "/generatetoken", requestOptions)
        .then(response => response.json())
        .then(result => {
            if(result.token) {
                // save token
                localStorage.setItem('token', result.token);

                // empty localstorage cache
                localStorage.setItem('UserCache', JSON.stringify([]));
                localStorage.setItem('TimetableCache', JSON.stringify([]));

                // broadcast event to document
                document.dispatchEvent(new CustomEvent('tokenUpdated'));

                // set waitingForToken to false
                waitingForToken = false;
            }
            else {
                if(result == "missingpassword" || result == "missingusername" || result.error.includes("probably wrong login information")) {
                    displayToast.presentToast("Merci de vous reconnecter.", "danger")
                } else if(result.error == "Your IP address is suspended.") {
                    displayToast.presentError("Une erreur s'est produite", "danger", "L'adresse IP de nos serveurs est suspendue pour votre établissement. S'il vous plaît réessayez dans quelques heures.")
                }
                else {
                    displayToast.presentError("Une erreur s'est produite.", "danger", result.error)
                }
                // redirect to login page
                console.log(result);
            }
        });
    }
}

// export
export default getToken;