function parseSpectralData(origData,i){
	var vertInfoSpec = {
		"Year":origData[i].image_year,
		"doy":origData[i].image_julday,
		"B1":parseInt(origData[i].b1)/10000,
		"B2":parseInt(origData[i].b2)/10000,
		"B3":parseInt(origData[i].b3)/10000,
		"B4":parseInt(origData[i].b4)/10000,
		"B5":parseInt(origData[i].b5)/10000,
		"B7":parseInt(origData[i].b7)/10000
	}
	return vertInfoSpec
}

//define function to calculate spectral indices from the raw band data
function calcIndices(data){
	//define and initialize variables
	var n_obj = data.Values.length, //this is already calc
		b1 = 0,
		b2 = 0,
		b3 = 0,
		b4 = 0,
		b5 = 0,
		b7 = 0,
		bcoef = [0.2043, 0.4158, 0.5524, 0.5741, 0.3124, 0.2303],
		gcoef = [-0.1603, -0.2819, -0.4934, 0.7940, -0.0002, -0.1446],
		wcoef = [0.0315, 0.2021, 0.3102, 0.1594,-0.6806, -0.6109],
		i = 0;

	//calculate indices and include them in the json object
	for(i;i<n_obj;i++){
		//pull out the values by band from json object so we don't have to deal with the long json text to
		//call a value when calculating indices

		b1 = data.Values[i].B1;
		b2 = data.Values[i].B2;
		b3 = data.Values[i].B3;
		b4 = data.Values[i].B4;
		b5 = data.Values[i].B5;
		b7 = data.Values[i].B7;

		//calculate indices
		data.Values[i]["TCB"]=(b1*bcoef[0])+(b2*bcoef[1])+(b3*bcoef[2])+(b4*bcoef[3])+(b5*bcoef[4])+(b7*bcoef[5]);
		data.Values[i]["TCG"]=(b1*gcoef[0])+(b2*gcoef[1])+(b3*gcoef[2])+(b4*gcoef[3])+(b5*gcoef[4])+(b7*gcoef[5]);
		data.Values[i]["TCW"]=(b1*wcoef[0])+(b2*wcoef[1])+(b3*wcoef[2])+(b4*wcoef[3])+(b5*wcoef[4])+(b7*wcoef[5]);
		data.Values[i]["TCA"]=Math.atan(data.Values[i].TCG/data.Values[i].TCB) * (180/Math.PI); // * 100;
		data.Values[i]["NBR"]=(b4-b7)/(b4+b7);
		data.Values[i]["NDVI"]=(b4-b3)/(b4+b3);
	}
	return data
}

//define function to return scaled color arrays as RGB color
function scaledRGB(data, RspecIndex, GspecIndex, BspecIndex, stretch, n_stdev, len){
	var colorR = calcColor(data, RspecIndex, stretch, n_stdev, len);
	var	colorG = calcColor(data, GspecIndex, stretch, n_stdev, len);
	var	colorB = calcColor(data, BspecIndex, stretch, n_stdev, len);
	var	color = [];
	for(var i=0;i<len;i++){color[i] = d3.rgb(colorR[i],colorG[i],colorB[i]);}
	return color;
}

//define function to calculate stretched 8-bit color array by spectral index
function calcColor(data, specIndex, stretch, n_stdev, len) {
	var dataC = $.extend(true, {}, data); //make a copy the data so the original is not altered by the min/max setting
	var	color = []; //make a empty array to hold the color weight for each data point
	console.log(dataC)
	for(var i=0;i<len;i++){ //loop through all the data points
		if(dataC.Values[i][specIndex] < stretch[specIndex].min) dataC.Values[i][specIndex] = stretch[specIndex].min; //if the point value is less than the min strech value, then set to min - in-function data copy only!
		if(dataC.Values[i][specIndex] > stretch[specIndex].max) dataC.Values[i][specIndex] = stretch[specIndex].max; //if the point value is greater than the max strech value, then set to max  - infunction data copy only!
		color[i] = ((dataC.Values[i][specIndex] - stretch[specIndex].min) / (stretch[specIndex].max - stretch[specIndex].min)) * 256; //set the 8-bit color weight for each point
	}
	return color; //return the color weights
}


//define function to determine if leap year
function leapYear(year){
	return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

// calculate a decimal date
function calcDecDate(trajData){
	for(var i=0;i<trajData.Values.length;i++){
		var thisYear = trajData.Values[i].Year;
		if(leapYear(thisYear)){
			var n_days = 367
		} else{
			var n_days = 366
		}
		var decDate = thisYear + (trajData.Values[i].doy/n_days);
		trajData.Values[i]["decDate"] = decDate
	}
	return trajData
}


/* YANG 2016.
Yang: 2016.08.31: warren want to change it back to always local stretch */				
function updateStretch() {
	var specs = ['B1','B2','B3','B4','B5','B7','TCB','TCG','TCW','TCA','NDVI','NBR'];
	specs.map(function(specIndex) {
		var localMin = d3.min(data.Values, function(d) {return d[specIndex];}); //get the local min
		var localMax = d3.max(data.Values, function(d) {return d[specIndex];}); //get the local max
		var buffer = (localMax - localMin) * 0.1; //calulate a buffer to add to the min and max so that the point is not cut off
		localMin -= buffer; //adjust the min by the buffer
		localMax += buffer; //adjust the max by the buffer

		currentDomain[specIndex].min = localMin; //set the currentDomain min for the specIndex
		currentDomain[specIndex].max = localMax; //set the currentDomain max for the specIndex
	});
}
