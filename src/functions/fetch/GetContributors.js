// modules
import axios from 'axios';

const github_api_url = "https://api.github.com/repos/PapillonApp/papillon"
// main function
async function getContributors(limit = 100) {
    return new Promise((resolve, reject) => {
        
        // check if limit is a number
        if (typeof limit !== 'number') {
            reject('Limit must be a number');
        }

        // check if limit is higher than 0
        if (limit < 1) {
            reject('Limit must be higher than 0');
        }

        axios.get(github_api_url + "/contributors")
        .then((response) => {
            // return limit 
            resolve(response.data.slice(0, limit));
        })
        .catch((error) => {
            reject('Problem with fetching contributors (' + error + ')');
        })
    })
}

// export
export default getContributors;