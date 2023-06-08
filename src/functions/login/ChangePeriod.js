import { app } from '@/main.ts'

// get token
function changePeriod(name) {
    switch(localStorage.loginService) {
        case "pronote":    
            return changePronotePeriod(name);
		case "ecoledirecte":
            return changeEDPeriod(name)
    }
    
}

// pronote : get token
function changePronotePeriod(name) {
    // gather vars
    const API = app.config.globalProperties.$api;
    const token = localStorage.getItem('token');

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                    
    const urlencoded = new URLSearchParams();
    urlencoded.append("token", token);
    urlencoded.append("periodName", name);

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    // get token from API
    return fetch(API + "/changePeriod", requestOptions)
    .then(response => response.json())
}


function changeEDPeriod(name) {
    return new Promise((resolve) => {
        resolve({ "status": "ok", "period": name })
    });
}

// export
export default changePeriod;