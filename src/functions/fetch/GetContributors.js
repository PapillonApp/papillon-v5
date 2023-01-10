// modules
import axios from 'axios';

const github_api_url = "https://api.github.com/repos/PapillonApp/papillon-v4"
// main function
async function getContributors(limit = 100) {
    return new Promise((resolve, reject) => {
        axios.get(github_api_url + "/contributors")
        .then((response) => {
            // return limit 
            resolve(response.data.slice(0, limit));
        })
        .catch((error) => {
            reject(error);
        })
    })
}

// export
export default getContributors;