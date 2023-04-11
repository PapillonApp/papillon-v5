// modules
import axios from 'axios';
// vars
import {app} from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';
import {ApiUrl, ApiVersion, Kdecole} from "kdecole-api";
import displayToast from "@/functions/utils/displayToast";

const FastAverageColor = require('fast-average-color').FastAverageColor;
const fac = new FastAverageColor();

// vars
import getEDPeriods from '@/functions/fetch/getEDPeriods.js';

// main function
function getUser(force) {
    switch (localStorage.loginService) {
        case "pronote":
            return getPronoteUser(force);
        case "ecoledirecte":
            return getEDUser(force);
        case 'skolengo':
            return getSkolengoUser(force);
    }
}

const defaultAvatar = "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAjOSURBVHgB7Z1NaFRXFMdPPpw0ZkInFlrjQkeoERQ0QeqqaSa4KkSaQl2kFJxudFPQgvuM+4oRuqkbIwgu7CLWQEtL29F0U4skChUyFowu/CjUTM1XOySx5z+8l76Z93Xfm/dxJ3N/MGTy5iaZnP+959xz7n13iBQKhULRqDSRxCwuLvaur6/3tra2Hnz16lWKL/XyI2V4GCniwe3mmpqa8HxmbW3tbnNz81wymZwhSZFKgIWFhQwbLMMGHGBD6sYOAggzw797ggW9KZMgsQsAo7e0tHzABspScAZ3hAWe47+X58eFuMWIRQC4k5WVleP8dJifZyheMDLG2tvbL1MMRCoADL+8vHyan56iiHq7KBgV/MhFLURkAnBAPc3/4ChJZvhqohYidAE0Hz8qgavxhCbEIAsxRyHSTCEBd8O9foz968/1ZnzA7znNM6aH3IFyFCKhjAAOsGn+B2D4NG0CwhwNgY8A7vVZ7jnTm8X4QBsN04hjFDCBCrC0tJTjnnKJJA+0Pknx/3Y+aJcUmAvi3jHOb/A4NQA8IsY4gfucAiAQARrJ+AbGOzo6PqUaqVmABjW+Ts0i1BQDMM1sYOODLMe9S1QDvgXQAu4pUmRrCcy+XJBWVjhPig044cz6KV94FgBJFubEtDmnmrVQZBH6vCZrnl0QMlxSxrciBdvMz897so0nAeD3N1OGGzSwzZYtW0a9/IywC9Jcz0NSuMJ2Guzs7MyLtBUeAZrrUQigrXsIISQACmzK9YjDAmREC3dCLoiXER8qATxTLJVKu7u6uopOjVrJBVl6/0LpH5p8cJfuPHtMsy+e09PFv8vXOxNtdGj7Lsrs7KGhPQdJIlKJRAKJ6lmnRq4jQIbef+fpI8r9cmPD6HbsSL5Oo/1Hy4JIgusocIwBMvR+9PqT311xNT54wm1OfnuFJv+4R5KQamtrc6yVOQoQd63nyWKRe/6k6Xp3MlV2OXjgeTW5qRtUYDclAzwlHXZ63dYFYV8mCzBNMXL02pcVPX8HG3u0f8jkYu48Yxc1Nclt/x/paPPV+5+QDDjlBbYjIO7eD79fbXwY1Mq/68Y2jgaIgocMYOul3WtOAmQoRm5U+XH0/G4OsnYgAOe4jZH8owLJgLbv1RJLAeB+4g6+RneC3i8ys0Ebo0iYskpCChvUrF6wFIDLqgMUM08M7qdn21vCP7fX0HaxtEKyYGdTOxfkGLmjBslWvWO3O7DZpnEvScTsiz+F2yJj1kkm2kkWOKZa2tQkAPw/SbDgYnQlhRfP2LD/uv4M8gaj39/hELRjIKXZtgKTADxnTZMEHNq+s+L7s5xcuXFxeqri+8yuHpIMU7HKJADPWaWoaKGwZvT9+cezbOBbtu3P/fp9RQlCdOYUJRyITSPAVA2Fr+IYQHHTmXiNTvS9x4b9YePaxZmpspGH3j6wkXRhuoqcobpWNLTngGPeEAfanZ4VWJWjpVlwH9l3mGb/el7RszE9hRBOYPSc6O0n2bCa3DRbNEqTROS4vDyy7x3h9iP7D1Pu3SGSEfYups5tKsYtLS3Nk4TbTlDXQZC1q+/A35/o65fO71dR7Ojo6DJesBIg/gDgAKajmJbqmfLebW+yr++qm2SNBaiwed0JUO9UCxDaTXoKMZQAMWM1DUUdWJogXOBpKHZBFMo7IYpl32+s9wCUHJA3dGvJF77veUO8ghohpsV5qxiA7YdpigkYFwspNznzxYxHpAZkBUSAGAM798pUkpjjGLDbeMFKAKwDR14NxRLkxZlb5Z7u1+h2YIaUYSGQQR/qjm+aihNaksnkoPGalQC45SZLEYDefvX323T1/m0ho8PNJPkBg+K5DtzSIv+uatdkBUYGsuSYNnFN8Aj40HjBqhZUjKIW5LbZCgZGRRQ9FitiPdu2u8719RwBowhuzCppg1jY6oJyxhdHjnlabQsA09lEphHw8uXLLFdEa7rxzI38o1k689PXlq/pGa2IwUVAoW7ywT3bDNpup0VIDPMIuG68YBIg7P1AWDTB7jVjz0dvRw0HxbewMtpyEY/L2dW75vC3vzn2WSSZNHuWvuoTuiw3ZoVZD0Ld/ur93za+R09HL4yqlAAhzvx4rWLnHGICSt8hY6oDActEjEdAaOeoGV0Bet+5Ix9FWsdBEIbvr1zseUBhg0MDra7bCZCnkCgYFtir9/FEBURAfqBj3IMUFjix0fK61cXV1dWbFAE9XMmUAZHpa63guEyr65YCaBtJw+8WjYPt4bG2d8iwGxpnvxX4AUVG8o8LkQx/KyLetpi3e8FWgLW1tevstwIXAH5fD8QFrcgWN5iJhQkOiLV7zbYcDTcURjAe2S++vhsVH4f4njD7cTqd1209YIICBkUx3McVcQnAEvR8TElRpAuRMacXHW/Sw7kHiUQC5Wl1NoQ/TOXnahxHAO7uw7nKpPAFu5+cWxvX21TVKPCNa+8HrmvCGAWs5FlSeEKk9wPh01KWl5fr8gjimBDq/UB4VwTnBWoUCFIqlQZF2woLoOUFKiC7k2O3PSfa2NOZcVpAxmJNmhRWCLseHU8bsxCQteGlCnVVcHwsenE9Op53xmF48R8L5NzkzQTnS55cz8bPkQ+4tjGOP0gKndzWrVsvkA9qOju6wc+NLoOJCRvft0dQh3fXRs2Hd9csAFDH1/snkO3pHBOyDZYjBGJ8ENj9AfCDDRKYc0EZHwTigozUywe2eQXz/JaWltNBf8Bb4AIAzpjTnDHjpN00bQ7mkGT5mee7EcotSnijSMk3g0tCbGPj94Vh/PLvp5Cp19GAmynY5eAzJUPdpBa6ADratnfEhjRJDHw9Rq7fzNYrkQmgI6sQMLzmbi64nfccJJELoKMJgaMxYz2dS/tk7YnV1dXLURpeJzYBdLQbQiBEhiIaFZqbQfY+EbaPdyN2AYxox2UO8MgYXl9f77U6XcQPMDh/mcFOPzZ8Pm6jG5FKgGq00YEbuOCmyoLgOB0cfFQtjubDYWjd2EUWEVsC7zptDVQoFAqFIi7+A6Vb8DK1vqhIAAAAAElFTkSuQmCC";

async function getSkolengoUser(force) {
    const token = localStorage.getItem('token');
    const ent = localStorage.getItem('ent');

    // check if user is in cache
    let cache = JSON.parse(localStorage.getItem('UserCache')) || [];
    if (cache.user && !force) {
        let user = JSON.parse(cache.user);
        return new Promise((resolve) => {
            resolve(constructSkolengoUser(user));
        });
    } else {
        const etudiant = new Kdecole(token, ApiVersion[ent], 0, 'https://cors.api.getpapillon.xyz/' + ApiUrl[ent])
        return etudiant.getInfoUtilisateur().then(infoUser => {
            localStorage.setItem('avatarCache', 'data:image/png;base64,' + defaultAvatar);
            const user = constructSkolengoUser(infoUser)
            localStorage.setItem('UserCache', JSON.stringify(user))
            document.dispatchEvent(new CustomEvent('avatarLoaded'));
            return user
        }).catch(error => {
            displayToast.presentError("Impossible de joindre le serveur.", "danger", error)
            console.error('Unable to join server - ' + error);
        });
    }
}

function constructSkolengoUser(user) {
    // construct student
    return {
        student: {
            name: user.nom,
            avatar: '',
            ine: '',
            contact: {
                phone: '',
                email: ''
            }
        },
        class: {
            name: '',
            school: ''
        },
        periods: [] //user.periods
    }

}

// pronote : get user
async function getPronoteUser(force) {
    // gather vars
    const API = app.config.globalProperties.$api;

    // get token
    const token = localStorage.getItem('token');

    // construct url
    let URL = `${API}/user?token=${token}`;

    // check if user is in cache
    let cache = JSON.parse(localStorage.getItem('UserCache')) || [];
    if (cache.user && !force) {
        // get user
        let user = JSON.parse(cache.user);

        // return user in promise
        return new Promise((resolve) => {
            resolve(constructPronoteUser(user));
        });
    } else {
        // get user from API
        return axios.get(URL)
            .then((response) => {
                // get user
                let user = response.data;

                // cache avatar
                let avatar = user.profile_picture;

                // if avatar is null or undefined, set default avatar
                if (avatar == null || avatar == undefined) {
                    let avatarBase64 = defaultAvatar

                    // save in cache
                    localStorage.setItem('avatarCache', 'data:image/png;base64,' + avatarBase64);
                    localStorage.setItem('UserCache', JSON.stringify(response.data));
                    return constructPronoteUser(user);
                }
                // download avatar
                let url = `https://cors.api.getpapillon.xyz/` + avatar;
                axios.get(url, {responseType: 'blob'})
                    .then((response) => {
                        // get blob
                        let blob = response.data;

                        // create reader
                        let reader = new FileReader();
                        reader.readAsDataURL(blob);

                        // read blob
                        reader.onloadend = async function () {
                            // get base64
                            let base64 = reader.result;

                            // save in cache
                            let avatarURL = `${base64}`;

                            // get average color
                            fac.getColorAsync(avatarURL)
                                .then(color => {
                                    localStorage.setItem('averageColor', JSON.stringify(color));

                                    document.dispatchEvent(new CustomEvent('averageColorUpdated'));
                                })
                                .catch(e => {
                                    console.error(e);
                                });

                            // save in cache
                            localStorage.setItem('avatarCache', avatarURL);
                        }
                    });

                localStorage.setItem('UserCache', JSON.stringify(response.data));

                // return user
                return constructPronoteUser(user);
            })
            .catch((error) => {
                if (error.response) {
                    // check if "notfound" or "expired"
                    if (error.response.data == "notfound") {
                        // get new token
                        GetToken();
                    } else if (error.response.data == "expired") {
                        // get new token
                        GetToken();
                    } else {
                        console.error(error);
                        return new Promise((reject) => {
                            reject({
                                error: error.response.data
                            });
                        });
                    }
                }
            });
    }
}

// pronote : construct user
function constructPronoteUser(user) {
    // construct student
    // return student
    return {
        student: {
            name: user.name,
            avatar: user.profile_picture,
            ine: user.ine,
            contact: {
                phone: user.phone,
                email: user.email
            }
        },
        class: {
            name: user.class,
            school: user.establishment
        },
        periods: user.periods
    };
}


// ecoledirecte : get user
async function getEDUser(force) {
    // gather vars
    const EDAPI = "https://api.ecoledirecte.com/v3"//app.config.globalProperties.$api;

    // get token
    const token = localStorage.getItem('token');

    // construct url
    let URL = `${EDAPI}/login.awp`;

    // check if user is in cache
    let cache = JSON.parse(localStorage.getItem('UserCache')) || [];
    if (cache && !force) {
        // get user
        // return user in promise
        return new Promise((resolve) => {

            cache.profile.photo = undefined;
            if(cache.profile.photo == null || cache.profile.photo == undefined) {
                let avatarBase64 = defaultAvatar
                
                localStorage.setItem('avatarCache', 'data:image/png;base64,' + avatarBase64);
            }
            
            resolve(constructEDUser(cache));
        });
    } else {
        // get user from API
        return axios.get(URL)
            .then(async(response) => {
                if (response == "notfound" || response == "expired") {
                    // get new token
                    GetToken();
                }

                // get user
                let user = response.data.accounts[0];

                // cache avatar
                let avatar = user.profile.photo;

                // if avatar is null or undefined, set default avatar
                if (avatar == null || avatar == undefined) {
                    let avatarBase64 = defaultAvatar

                    // save in cache
                    localStorage.setItem('avatarCache', 'data:image/png;base64,' + avatarBase64);
                    localStorage.setItem('UserCache', JSON.stringify(response.data.accounts[0]));
                    return constructEDUser(user);
                }
                // download avatar
                /*let url = `https://cors.api.getpapillon.xyz/` + avatar;
                axios.get(url, { responseType: 'blob' })
                    .then((response) => {
                        // get blob
                        let blob = response.data;

                        // create reader
                        let reader = new FileReader();
                        reader.readAsDataURL(blob);

                        // read blob
                        reader.onloadend = async function () {
                            // get base64
                            let base64 = reader.result;

                            // save in cache
                            let avatarURL = `${base64}`;

                            // get average color
                            fac.getColorAsync(avatarURL)
                                .then(color => {
                                    localStorage.setItem('averageColor', JSON.stringify(color));

                                    document.dispatchEvent(new CustomEvent('averageColorUpdated'));
                                })
                                .catch(e => {
                                    console.log(e);
                                });

                            // save in cache
                            localStorage.setItem('avatarCache', avatarURL);
                        }
                    });*/
                //FETCH PERIODS
                await getEDPeriods().then(periods => {
                    user.periods = periods;
                    response.data.accounts[0].periods = periods;
                })

                localStorage.setItem('UserCache', JSON.stringify(response.data.accounts[0]));

                

                // return user
                return constructEDUser(user);
            })
            .catch((error) => {
                if (error.response) {
                    // check if "notfound" or "expired"
                    if (error.response.data.code == 525) {
                        // get new token
                        GetToken();
                    }
                }
            });
    }
}

// ecoledirecte : construct user
function constructEDUser(user) {
    // construct student
    // return student
    return {
        student: {
            name: user.nom + " " + user.prenom,
            avatar: user.profile.photo,
            ine: user.profile.rneEtablissement,
            contact: {
                phone: user.profile.telPortable,
                email: user.email
            }
        },
        class: {
            name: user.profile.classe.code,
            school: user.nomEtablissement
        },
        periods: user.periods
    }
}


// export
export default getUser;
