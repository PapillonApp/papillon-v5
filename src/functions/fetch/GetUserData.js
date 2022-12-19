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
function getPronoteUser() {
    // gather vars
    const API = app.config.globalProperties.$api;

    // get token
    const token = localStorage.getItem('token');

    // construct url
    let URL = `${API}/user?token=${token}`;

    // get user from API
    return axios.get(URL)
        .then((response) => {
            // get user
            let user = response.data;

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
        }
    }

    // return student
    return student;
}

// export
export default getUser;