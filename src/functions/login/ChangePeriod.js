import { app } from '@/main.ts'

// get token
function changePeriod(name) {
    switch(localStorage.loginService) {
        case "pronote":    
            return changePronotePeriod(name);
		case "ecoledirecte":
            return;
    }
    
}

// pronote : get token
function changePronotePeriod(name) {
    // gather vars
    const API = app.config.globalProperties.$api;
    const token = localStorage.getItem('token');

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                    
    var urlencoded = new URLSearchParams();
    urlencoded.append("token", token);
    urlencoded.append("periodName", name);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    // get token from API
    return fetch(API + "/changePeriod", requestOptions)
    .then(response => response.json())
}

// export
export default changePeriod;