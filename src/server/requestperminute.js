module.exports = (data) => {

	const rate = {
		"day": 1440,
		"hour": 60,
		"minute": 1,
		"second": 0.016
	}

	let minMaxData = [];

	data.forEach((d) => {
		let subResult = 0;
		for(let key in d){
			subResult = subResult + d[key] * rate[key];
		}
		minMaxData.push(subResult.toFixed(0));
	});

	return minMaxData[1] - minMaxData[0];
}
