// modules
import axios from 'axios';

// vars
import GetToken from '@/functions/login/GetToken.js';
import * as moment from "moment";
moment.locale("fr")

//main function

async function getEDSchoollife(forceReload) {
	// gather vars
	const EDAPI = "https://api.ecoledirecte.com/v3"//app.config.globalProperties.$api;

    // get token
    const token = localStorage.getItem('token');

    const userID = JSON.parse(localStorage.UserCache).id;

    // construct url
    const URL = `${EDAPI}/eleves/${userID}/viescolaire.awp?verbe=get`;

	let schoollife = {};
	const cache = localStorage.getItem('EDSchoollifeCache');
	if (cache != null && !forceReload) {
		schoollife = JSON.parse(cache).edschoollife;

		return new Promise((resolve) => {
			resolve(constructEDSchoollife(schoollife));
		});
	}
	else {

        const requestOptions = {
            headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Token": token },            
        };
        const body = `data={}`

		return axios.post(URL, body, requestOptions)
		.then((response) => {
            if (response.data.code != 200) {
                if (response.data.code === 525) {
                    // get new token
                    GetToken();
                } else if(response.data.code === 520) {
                    GetToken();
                }
                else {
                    return new Promise((reject) => {
                        reject({
                            error: response.data.code
                        });
                    });
                }
            }



			schoollife = response.data.data;
			schoollife = constructEDSchoollife(schoollife);
			
            const today = new Date();
			const cacheElement = {
				date: today,
				edschoollife: response.data.data
			};
			localStorage.setItem('EDSchoollifeCache', JSON.stringify(cacheElement));

			return schoollife;
		})
		.catch((error) => {
			if (error.response) {
                if (error.response.data.code == 525) {
                    // get new token
                    GetToken();
                }
            }

			if(error.code) {
				return new Promise((reject) => {
					reject({
						error: error.code
					});
				});
			}
		});
	}
}

// pronote : construct delays
function constructEDSchoollife(schoollife) {
	const schlife = {
        "absences": [],
        "delays": [],
        "punishments": [],
        "encouragements": [],
    }
    let mois = {
        "janvier": "01",
        "février": "02",
        "mars": "03",
        "avril": "04",
        "mai": "05",
        "juin": "06",
        "juillet": "07",
        "août": "08",
        "septembre": "09",
        "octobre": 10,
        "novembre": 11,
        "décembre": 12
    }
	schoollife.absencesRetards.forEach((absDelays) => {
        if(absDelays.typeElement == "Retard") {
            let splitDate = absDelays.displayDate.split(" ")
            let fromDate
            let fromHours
            let toDate
            let toHours
            if(absDelays.displayDate.includes("le")) {
                fromDate = `${splitDate[4]}-${mois[splitDate[3]]}-${splitDate[2]}`
                fromHours = `${splitDate[6]}`
                toDate = fromDate
                toHours = `${splitDate[8]}`
            }
            else {
                fromDate = `${mois[splitDate[3]]}/${splitDate[2]}/${splitDate[4]}`
                fromHours = `${splitDate[6]}`
                toDate = `${mois[splitDate[11]]}/${splitDate[12]}/${splitDate[13]}`
                toHours = `${splitDate[15]}`
            }
            let newDelays = {
                data: {
                    id: absDelays.id,
                    isJustified: absDelays.justifie,
                    justification: absDelays.commentaire || "Aucun commentaire",
                    reasons: [ absDelays.motif ],
                    type: "Retard"
                },
                date: {
                    date: fromDate + " " + fromHours,
                    duration: absDelays.libelle,
                    to: toDate + " " + toHours
                }
            }
            schlife.delays.push(newDelays)
        }
		
        if(absDelays.typeElement == "Absence") {
            let splitDate = absDelays.displayDate.split(" ")
            let fromDate
            let fromHours
            let toDate
            let toHours
            if(absDelays.displayDate.includes("le")) {
                fromDate = `${splitDate[4]}-${mois[splitDate[3]]}-${splitDate[2]}`
                fromHours = `${splitDate[6]}`
                toDate = fromDate
                toHours = `${splitDate[8]}`
            }
            else {
                fromDate = `${mois[splitDate[3]]}/${splitDate[2]}/${splitDate[4]}`
                fromHours = `${splitDate[6]}`
                toDate = `${mois[splitDate[11]]}/${splitDate[12]}/${splitDate[13]}`
                toHours = `${splitDate[15]}`
            }
            let newAbsence = {
                data: {
                    id: absDelays.id,
                    isJustified: absDelays.justifie,
                    reasons: [ absDelays.motif ],
                    hours: absDelays.libelle,
                    type: "Absence"
                },
                date: {
                    from: fromDate + " " + fromHours,
                    to: toDate + " " + toHours,
                }
            }
            schlife.absences.push(newAbsence)
        }
        
	})



    schoollife.sanctionsEncouragements.forEach((sctEncour) => {

        if(sctEncour.typeElement == "Punition") {
            const newPunishment = {
                data: {
                    id: sctEncour.id,
                    reasons: { text: [ sctEncour.libelle || "Aucun motif fournit" ], circumstances: sctEncour.commentaire || sctEncour.motif || "Aucune circonstance" },
                    nature: sctEncour.libelle,
                    givenBy: sctEncour.par
                },
                date: {
                    givenDate: new Date(sctEncour.date),
                    schedules: sctEncour.schedule,
                    duration: sctEncour.duration
                },
                homeworks: {
                    text: sctEncour.motif
                },
                status: {
                    isSchedulable: sctEncour.schedulable || false,
                    isExclusion: sctEncour.exclusion || false,
                    isDuringLesson: sctEncour.durring_lesson || false,
                }
            }
            schlife.punishments.push(newPunishment)
        }

        if(sctEncour.typeElement == "Encouragement") {
            const newsctEncour = {
                data: {
                    id: sctEncour.id,
                    isJustified: sctEncour.justifie,
                    justification: sctEncour.motif,
                    reasons: sctEncour.commentaire,
                },
                date: {
                    date: new Date(sctEncour.date),
                    duration: null// delay.duration,
                }
            }
            
            schlife.encouragements.push(newsctEncour)
        }

	})




	schlife.absences.sort((a, b) => {
		return b.date.from - a.date.from;
	})
    schlife.delays.sort((a, b) => {
		return b.date.from - a.date.from;
	})
    schlife.punishments.sort((a, b) => {
		return b.date.from - a.date.from;
	})
    schlife.encouragements.sort((a, b) => {
		return b.date.from - a.date.from;
	})
	return schlife
}

export default getEDSchoollife;