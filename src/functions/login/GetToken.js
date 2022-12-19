import { app } from '@/main.ts'

// get token
function getToken() {
    return getPronoteLogin();
}

// pronote : get token
function getPronoteLogin() {
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

    // get token from API
    fetch(API + "/generatetoken", requestOptions)
    .then(response => response.json())
    .then(result => {
        if(result.token) {
            // save token
            localStorage.setItem('token', result.token);

            // broadcast event to document
            document.dispatchEvent(new CustomEvent('tokenUpdated'));
        }
        else {
            // redirect to login page
            console.log(result);
        }
    });
}

// export
export default getToken;