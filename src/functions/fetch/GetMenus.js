// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
async function getMenus(date, forceReload) {
    // as only pronote is supported for now, we can just return the pronote menu

    // return pronote menus
    return getPronoteMenus(date, forceReload);
}

// pronote : get homework
function getPronoteMenus(date, forceReload) {
    // gather vars
    const API = app.config.globalProperties.$api;
    const dayRequest = new Date(date);

    // get token
    const token = localStorage.getItem('token');

    // get date as YYYY-MM-DD
    const dayString = dayRequest.toISOString().split('T')[0];

    // construct url
    let URL = `${API}/menu?dateFrom=${dayString}&dateTo=${dayString}&token=${token}`;

    // check if menu is cached
    let cacheSearch = JSON.parse(localStorage.getItem('MenuCache')) || [];
    cacheSearch = cacheSearch.filter((element) => {
        return element.date == dayString && element.token == token;
    });
    if (cacheSearch != null && !forceReload) {
        // return cached menu in promise
        return new Promise((resolve, reject) => {
            let menu = cacheSearch.menu;
            resolve(constructPronoteMenu(menu));
        });
    }
    else {
        // get menu from API
        return axios.get(URL)
            .then((response) => {
                // construct menus
                let menus = constructPronoteMenu(response.data);

                // cache response
                let cache = JSON.parse(localStorage.getItem('MenuCache')) || [];
                let cacheElement = {
                    date: dayString,
                    token: token,
                    menu: menus,
                };
                cache.push(cacheElement);
                localStorage.setItem('MenuCache', JSON.stringify(cache));

                // return menus
                return menus;
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

// pronote : construct menu
function constructPronoteMenu(mns) {
    // declaring vars
    let menuArray = [];

    // for each course in menu
    mns.forEach((menu) => {
        // construct menu
        let newMenu = {
            data: {
                id: menu.id,
                date: menu.date,
                name: menu.name,
            },
			type: {
				isLunch: menu.type.is_lunch,
				isDinner: menu.type.is_dinner,
			},
            menus: {
                firstMeal: menu.first_meal,
				dessert: menu.dessert,
                cheese: menu.cheese,
				otherMeal: menu.other_meal,
				sideMeal: menu.side_meal,
				mainMeal: menu.main_meal,
            },
        };

        // push menu to menus
        menuArray.push(newMenu);
    });

    // return menus
    return menuArray;
}

// export
export default getPronoteMenus;