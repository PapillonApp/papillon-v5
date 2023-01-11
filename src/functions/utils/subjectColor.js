/* 
make an array of colors from
background: #00934F;
background: #12957D;
background: #1978AD;
background: #7937CE;
background: #931BB1;
background: #AA611E;
background: #AD125D;
background: #BE381A;
background: #C12C2C;
*/

const baseColors = [ '#00934F', '#12957D', '#1978AD', '#7937CE', '#931BB1', '#AA611E', '#AD125D', '#BE381A', '#C12C2C', "#BB7B1B", '#AA831E' ];

function hexToRgb(hex) {
	console.log(hex);

	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});
	
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function distance(a, b) {
	return Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2));
}

function nearestColor(colorHex){
	console.log(colorHex);
	var lowest = Number.POSITIVE_INFINITY;
	var tmp;
	let index = 0;

	baseColors.forEach( (el, i) => {
		tmp = distance(hexToRgb(colorHex), hexToRgb(el))
		if (tmp < lowest) {
			lowest = tmp;
			index = i;
		}
	})

	return baseColors[index];
}

function getRandomColor() {
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += Math.floor(Math.random() * 10);
	}
	return color;
}

function lightenColor(color, percent) {
	var num = parseInt(color,16),
		amt = Math.round(2.55 * percent),
		R = (num >> 16) + amt,
		B = (num >> 8 & 0x00FF) + amt,
		G = (num & 0x0000FF) + amt;
		return (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
}

function darkenHexColor(col) {
	return '#' + lightenColor(col, -20);
}

function setSubjectColor(subjectName, color, force=false) {
	let subjectColors = JSON.parse(localStorage.getItem('SubjectColors')) || {};

	if (!color.includes('#')) {
		color = '#' + color;
	}

	color = nearestColor(color);

	if (subjectColors[subjectName] && !force) {
		return subjectColors[subjectName];
	}

	if (subjectColors[subjectName] == color) {
		return subjectColors[subjectName];
	}

	subjectColors[subjectName] = color;

	localStorage.setItem('SubjectColors', JSON.stringify(subjectColors));

	return color;
}

function getSubjectColor(subjectName, color) {
	let subjectColors = JSON.parse(localStorage.getItem('SubjectColors')) || {};

	if (subjectName.includes('>')) {
		subjectName = subjectName.split(' > ')[0];
	} else if (subjectName.includes('&')) {
		true // do nothing
	} else if (subjectName.split(' ').length > 1) {
		subjectName = subjectName.split(' ')[0];
	} 

	if (subjectColors[subjectName]) {
		return subjectColors[subjectName];
	}

	return setSubjectColor(subjectName, color);
}

export default { setSubjectColor, getSubjectColor, getRandomColor, lightenColor, darkenHexColor, nearestColor };