// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
function getUser() {
    // as only pronote is supported for now, we can just return the pronote user
    return getPronoteUser();
}

// pronote : get user
async function getPronoteUser() {
    // gather vars
    const API = app.config.globalProperties.$api;

    // get token
    const token = localStorage.getItem('token');

    // construct url
    let URL = `${API}/user?token=${token}`;

    // check if user is in cache
    let cache = JSON.parse(localStorage.getItem('UserCache')) || [];
    if (cache.user) {
        // get user
        let user = JSON.parse(cache.user);

        // return user in promise
        return new Promise((resolve, reject) => {
            resolve(constructPronoteUser(user));
        });
    }
    else {
        // get user from API
        return axios.get(URL)
            .then((response) => {
                if (response == "notfound" || response == "expired") {
                    // get new token
                    GetToken();
                }

                // get user
                let user = response.data;

                // save in cache
                let cache = JSON.parse(localStorage.getItem('UserCache')) || [];
                cache = {
                    user: JSON.stringify(response.data)
                };    

                // cache avatar
                let avatar = response.data.profile_picture;

                // download avatar
                let url = `https://cors.api.pronote.plus/` + avatar;
                axios.get(url, { responseType: 'blob' })
                    .then((response) => {
                        // get blob
                        let blob = response.data;

                        // create reader
                        let reader = new FileReader();
                        reader.readAsDataURL(blob);

                        // read blob
                        reader.onloadend = function () {
                            // get base64
                            let base64 = reader.result;

                            // save in cache
                            let avatarURL = `${base64}`;

                            // save in cache
                            localStorage.setItem('vatarCache', avatarURL);
                        }
                    });

                localStorage.setItem('UserCache', JSON.stringify(cache));

                // return user
                return constructPronoteUser(user);
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
            });
    }
}

// pronote : construct user
function constructPronoteUser(user) {
    // construct student
    let student = {
        student: {
            name: user.name,
            avatar: user.profile_picture,
            contact: {
                phone: user.phone,
                email: ""
            }
        },
        class: {
            name: user.class,
            school: user.establishment
        },
        periods: user.periods
    }

    // return student
    return student;
}

// export
export default getUser;