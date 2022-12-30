// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
async function getNews() {
    // as only pronote is supported for now, we can just return the pronote timetable
    
    // return pronote timetable
    return getPronoteNews();
}

// pronote : get timetable
function getPronoteNews() {
    // gather vars
    const API = app.config.globalProperties.$api;

    // get token
    const token = localStorage.getItem('token');

    // construct url (date is a TEST date)
    let URL = `${API}/news?token=${token}`;

    // check if timetable is cached
    let newsCache = localStorage.getItem('newsCache');

    if(newsCache != null) {
        // timetable is cached, check if it's up to date
        newsCache = JSON.parse(newsCache);

        let today = new Date();
        let cacheDate = new Date(newsCache.date);

        if(today.toDateString() == cacheDate.toDateString()) {
            // timetable is up to date, return it
            return new Promise((resolve, reject) => {
                resolve(constructPronoteNews(newsCache.news));
            });
        }
    }

    // send request
    return axios.get(URL)
        .then((response) => {
            if(response.data == 'expired') {
                // token expired, get new token
                GetToken();
            }

            // save timetable to localstorage cache with today's date
            let today = new Date();
            let newsCache = {
                date: today,
                news: response.data
            }

            localStorage.setItem('newsCache', JSON.stringify(newsCache));

            // construct timetable and return it as a promise
            return new Promise((resolve, reject) => {
                resolve(constructPronoteNews(response.data));
            });
        })
        .catch((error) => {
            if(error.response.data == 'expired') {
                // token expired, get new token
                GetToken();
            }

            // error, return error
            return new Promise((resolve, reject) => {
                reject(error);
            });
        });
}

// pronote : construct timetable
function constructPronoteNews(news) {
    let newsArray = [];

    // for each news in news
    for(let i = 0; i < news.length; i++) {
        // get news
        let newsItem = news[i];

        // if no title, set it to "Sans titre"
        if(newsItem.title == null) {
            newsItem.title = "Sans titre";
        }

        let newsReturn = {
            title: newsItem.title,
            content: newsItem.content,
            htmlContent: newsItem.html_content[0].texte.V,
            date: newsItem.date,
            dateString: new Date(newsItem.date).toLocaleDateString( 'fr-FR', { weekday: 'long', month: 'long', day: 'numeric' }) + " à " + new Date(newsItem.date).toLocaleTimeString( 'fr-FR', { hour: '2-digit', minute: '2-digit' }),
            category: newsItem.category,
            author: newsItem.author
        }

        newsArray.push(newsReturn);
    }

    // sort news by date
    newsArray.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    return newsArray;
}

// export
export default getPronoteNews