// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';
import groupSubjects from '@/functions/utils/groupSubjects.js';

// main function
function getSkills(forceReload) {
	// as only pronote is supported for now, we can just return the pronote skills

	return getPronoteDelays(forceReload);
}

async function getPronoteSkills(forceReload) {
	// gather vars
	const API = app.config.globalProperties.$api;

	// get token
	const token = localStorage.getItem('token');

	// construct url
	let URL = `${API}/evaluations?token=${token}`;

	// check if cached
	let skillsCache = localStorage.getItem('SkillsCache');

	if(skillsCache != null && !forceReload) {
		// skill is cached, check if it's up to date
		skillsCache = JSON.parse(skillsCache);

		let today = new Date();
		let cacheDate = new Date(skillsCache.date);

		if(today.toDateString() == cacheDate.toDateString()) {
			// skill is up to date, return it
			return new Promise((resolve, reject) => {
				resolve(constructPronoteSkills(skillsCache.skills));
			});
		}
	}

	let skills = {};
	return axios.get(URL).then((response) => {
		skills = response.data;

		// save Skills to localstorage cache with today's date
		let today = new Date();
		let skillsCache = {
			date: today,
			skills: response.data
		}

		localStorage.setItem('SkillsCache', JSON.stringify(skillsCache));

		skills = constructPronoteSkills(skills);
		
		return Skills;
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

		if(error.code) {
			return new Promise((resolve, reject) => {
				reject({
					error: error.code
				});
			});
		}
	});
}

function constructPronoteSkills(skills) {
	let skillsArray = [];

	skills.forEach((skill) => {
		// check if subject exists
		let { subject, subjectName, subjectId, grouped } = groupSubjects(skill.subject, skillsArray);

		if(subject == undefined) {
			// subject doesn't exist, create it
			subject = {
				name: subjectName,
				id: subjectId,
				grouped: grouped,
				skills: []
			}

			skillsArray.push(subject);
		}

		// add skill to subject
		let newSkill = {
			info: {
				subject: subjectName,
				teacher : skill.teacher,
				date: skill.date,
				name: skill.description || "Pas d'intitulé",
				description: skill.description || "Pas de description",
				skill : {
					id: skill.id,
					palier: skill.palier,
					coefficient: skill.coefficient,
				}
			},
			acquisitions: [...skill.acquisitions]
		}

		subject.skills.push(newSkill);
	});

	skillsArray.forEach((subject) => {
		subject.skills.sort((a, b) => {
			return new Date(b.info.date) - new Date(a.info.date);
		});
	});

	skillsArray.sort((a, b) => {
		return a.name.localeCompare(b.name);
	});

	return skillsArray;
}