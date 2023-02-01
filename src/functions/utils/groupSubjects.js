function generateRandomId() {
	return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function groupSubjects(subjectData, dataArray) {
	let subject = []
	let subjectName = '';
	let subjectId = '';
	let grouped = false;
	let excluded = false;

	if (localStorage.getItem('groupSubjects') != 'true') {
		subject = dataArray.find(subject => subject.id == subjectData.id);
		subjectName = subjectData.name;
		subjectId = subjectData.id;
	} else {
		if (localStorage.getItem('excludedGroupSubjects') != null) {
			let excludedGroupSubjects = JSON.parse(localStorage.getItem('excludedGroupSubjects'));
			for (let i = 0; i < excludedGroupSubjects.length; i++) {
				if (subjectData.name.split(' > ')[0] == excludedGroupSubjects[i]) {
					excluded = true;
					break;
				} else {
					excluded = false;
				}
			}
		}

		if (excluded) {
			subject = dataArray.find(subject => subject.id == subjectData.id);
			subjectName = subjectData.name;
			subjectId = subjectData.id;
		} else {
			subject = dataArray.find(subject => subject.name == subjectData.name.split(' > ')[0]);
			subjectName = subjectData.name.split(' > ')[0];
			subjectId = subjectData.id;

			if (subjectData.name.split(' > ').length > 1) {
				grouped = true;
				subjectId = generateRandomId();
			}
		}
	}

	return {
		subject: subject, 
		subjectName: subjectName, 
		subjectId: subjectId, 
		grouped: grouped
	}
}

export default groupSubjects;