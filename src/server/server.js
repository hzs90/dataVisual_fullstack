const fs  = require("fs");
const app = require("http").createServer();
const io = module.exports.io = require('socket.io')(app);

const PORT = process.env.PORT || 3231;

const reqPerMin = require("./requestperminute.js");

const dataTemplate = {
    "host": "n/a",
    "datetime": {
      "day": "n/a",
      "hour": "n/a",
      "minute": "n/a",
      "second": "n/a"
    },
    "request": {
      "method": "n/a",
      "url": "n/a",
      "protocol": "n/a",
      "protocol_version": "n/a"
    },
    "response_code": "n/a",
    "document_size": "n/a"
};

let httpMethods = {
	"notDefined": 0
};

let httpAnswerCodes = {
	"notDefined": 0
};

fs.readFile("datalog/epa-http.txt", function(err, f){

		let resultArray = [];
		let requestData = [];
		let filteredData = 0;

    let dataLogArray = f.toString().split('\n');
		dataLogArray.splice(-1,1) //remove last array (empty) element
		dataLogArray.forEach((dataset, dataIdx) => {

			let result = {};
			let subArray = [];
			let tempArray = dataset.split(" ");

			tempArray[1] = tempArray[1].split(":"); //convert datetime to array
			tempArray[4] = tempArray[4].split("/"); //convert protocol to array

			let arrIdx = 0;

			while(arrIdx !== tempArray.length){
				if(Array.isArray(tempArray[arrIdx])){
					tempArray[arrIdx].forEach((e) => {
						subArray.push(e);
					})
					arrIdx++;
				} else {
					subArray.push(tempArray[arrIdx]);
					arrIdx++;
				}
			}

			subArray.forEach((data, idx) => {
				subArray[idx] = data.replace(/[^a-zA-Z0-9./]/g, ''); //clean uncommon chars
			})

			let idx = 0;
			const addData = (subKey) => {
				if(dataTemplate[subKey] === "n/a"){
					result[subKey] = subArray[idx];
					idx++;
				} else {
					result[subKey] = {};
					for(let key in dataTemplate[subKey]){
						result[subKey][key] = subArray[idx];
						idx++;
					}
				}
			}

			for(let key in dataTemplate){
				addData(key);
			}

			resultArray.push(result);

			if(dataIdx === 0 || dataIdx === dataLogArray.length - 1){
				requestData.push(result.datetime);
			}

			if(httpMethods[result.request.method]){
				httpMethods[result.request.method]++;
			} else if (result.request.method.length > 4){
				httpMethods.notDefined++;
			} else {
				httpMethods[result.request.method] = 1;
			}

			let actualAnswer = subArray[subArray.length - 2];
			let actualSize = subArray[subArray.length - 1];

			if(httpAnswerCodes[actualAnswer]){
				httpAnswerCodes[actualAnswer]++;
			} else if (!parseInt(actualAnswer) || actualAnswer === undefined){
				httpAnswerCodes.notDefined++;
			} else {
				httpAnswerCodes[actualAnswer] = 1;
			}

			if(actualSize < 1000 && actualAnswer === "200"){
				filteredData++;
			}
		});


		const dataToClient = {
			"requests": reqPerMin(requestData),
			filteredData,
			httpAnswerCodes,
			httpMethods
		}

		io.on('connection', () => {
			io.emit("data", dataToClient);
		});

		app.listen(PORT, () => {
			console.log("Connected to port: " + PORT)
		})
});
