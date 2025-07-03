//////////////////////////////////////////////////////////////////////////////////////////////////
//	
//
//
//
//
//////////////////////////////////////////////////////////////////////////////////////////////////

//////////DEFINE GLOBAL VARIABLES/////////////////////////////////////////////////////////
//var specIndex = "NBR"; //default index to display - set again when a plot is clicked on
var rgbColor = [];
var allDataRGBcolor = [];
var data = { "Values": [] };
var allData = { "Values": [] }; 
var n_chips = 0;
var lastIndex = 0;
var origData = [];
var projectList = [];
var lat;
var long

// asign are user by ip address.
var userID;
$.post("./php/get_id.php",function(message, status) {userID = message.slice(1,-1)});
//$.post("./php/get_id.php",function(message, status) {userID = message.slice(1,-1)});
const timeout = window.setTimeout(waiter,4000)
function waiter(){console.log(userID)}
//console.log(userID)
var plotID = "";
var selectedCircles = [];
var lineDate = [];
var vertInfo = [];
var selectThese = [];
var lineData = [];
var chipstripwindow = null;//keep track of whether the chipstrip window is open or not so it is not opened in multiple new window on each chip click
var highLightColor = "#32CD32";
var activeRedSpecIndex = "TCB" //"TCB"; //default index to display - set again when a plot is clicked on
var activeGreenSpecIndex = "TCG" //"TCG"; //default index to display - set again when a plot is clicked on
var activeBlueSpecIndex = "TCW" //"TCW"; //default index to display - set again when a plot is clicked on
var ylabel = "";
var yearList = [];

var sessionInfo = {
	"userID": userID,
	"projectID": "",
	"projectCode": "",
	"tsa": "999999",
	"plotID": "",
	"isDirty": false,
	"plotSize": 1
}


var chipInfo = {
	useThisChip: [],
	canvasIDs: [],
	imgIDs: [],
	sxOrig: [],

	syOrig: [],
	sWidthOrig: [],
	sxZoom: [],
	syZoom: [],
	sWidthZoom: [],
	chipsInStrip: [],
	year: [],
	julday: [],
	src: [],
	sensor: []
};

var chipDisplayProps = {
	box: 1,
	boxZoom: 1,
	chipSize: 195,
	halfChipSize: 97.5,
	offset: 30,
	canvasHeight: 195, //212,
	zoomLevel: 20,
	plotColor: "#FFFFFF"
};

var minZoom = 0;
var maxZoom = 40;
var stopZoom = 40;
var sAdj = [0];
var lwAdj = [chipDisplayProps.box];
var zoomIn = 0;

var cat = 0;

var timeLapseIndex = 0;
var playTL;
var flickerTL;

var windowH = $(window).height();
var windowW = $(window).width();

var placed = {}



function getTimeDifference(time1, time2) {
    const date1 = new Date(time1);
    const date2 = new Date(time2);

    // Calculate the difference in milliseconds
    const differenceMs = Math.abs(date2 - date1);

    // Convert the difference to hours, minutes, and seconds
    const hours = Math.floor(differenceMs / (1000 * 60 * 60));
    const minutes = Math.floor((differenceMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((differenceMs % (1000 * 60)) / 1000);

    // Format the time difference as 'hour:min:sec'
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return formattedTime;
}

//setup the domains - for spectral plotting
//var date = new Date();
//defaultDomain.year.max = date.getFullYear() + 1; //add one since the data displayed is a decimal if final year is 2016, point might be 2016.56 - need to include up to 2016.99999
var currentDomain = $.extend(true, {}, defaultDomain); //make a copy of the default domain that can be altered
currentDomain["dirty"] = 0; //need to add this since it is not in the default domain
currentDomain["hasCustomizedXY"] = 0;

function getData(sessionInfo, specIndex, activeRedSpecIndex, activeGreenSpecIndex, activeBlueSpecIndex, ylabel) {

	let returnedData = null;
	let geometree = null;

	for (let i = 0; i < TSPO.DataLoader.state.res.length; i++) {
	    const row = TSPO.DataLoader.state.res[i];

	    if (sessionInfo.plotID.toString() == row['plotid']) {
	        console.log(1);
	        returnedData = eval(row['json']);  // Only if you're sure this is safe
	        console.log(returnedData);
	        geometree = row['geo'];

	        // Extract YOD (year of detection) from JSON string
	        const yodMatch = row['json'].match(/"yod":\s*(\d{4})/);
	        const yodi = yodMatch ? yodMatch[1] : "N/A";

	        // Set UI elements
	        $('#selectedAgent').text(row['agent'] || "Unknown");
	        $('#selectedYOD').text(yodi);
	        break;
	    }
	}
	console.log("Checking res[i]['plotid']: ", TSPO.DataLoader.state.res[i]?.plotid, "against sessionInfo.plotID: ", sessionInfo.plotID);
	console.log("res[i] structure: ", TSPO.DataLoader.state.res[i]);

	if (!returnedData || !geometree) {
		console.error("Plot ID not found or invalid data");
		return;
	}

	// Proceed using returnedData and geometree safely
	$("#ImpliedYOD").text("Focus Year: " + returnedData[0].target_day);
	$("#ImpliedYOD2").text("Focus Year: " + returnedData[0].target_day);
	$("#ImpliedYOD3").text("Focus Year: " + returnedData[0].target_day);

	// set globals
	placed = geometree;
	origData = returnedData;
	n_chips = origData.length;
	lastIndex = n_chips - 1;
	data = { "Values": [] };
	allData = { "Values": [] };
	chipInfo = {
		useThisChip: [],
		canvasIDs: [],
		imgIDs: [],
		sxOrig: [],
		syOrig: [],
		sWidthOrig: [],
		sxZoom: [],
		syZoom: [],
		sWidthZoom: [],
		chipsInStrip: [],
		year: [],
		julday: [],
		src: [],
		sensor: []
	};
	yearList = [];

	for (let i = 0; i < n_chips; i++) {
		data.Values.push(parseSpectralData(origData, i));
		yearList.push(origData[i].image_year);
		const days = ('000' + origData[i].image_julday).slice(-3);
		origData[i].url_tcb = '???';
	}

	// set domain
	var maxXdomain = d3.max(yearList) + 1;
	var minXdomain = d3.min(yearList) - 1;
	defaultDomain.year.max = currentDomain.year.max = maxXdomain;
	defaultDomain.year.min = currentDomain.year.min = minXdomain;

	data = calcIndices(data);
	rgbColor = scaledRGB(data, activeRedSpecIndex, activeGreenSpecIndex, activeBlueSpecIndex, stretch, 2, n_chips);
	data = calcDecDate(data);

	if (!currentDomain.hasCustomizedXY) updateStretch();

	allData = $.extend(true, {}, data);

	loadVertex(sessionInfo);
}


//function to load and append plots when a project is clicked on
function appendPlots(sessionInfo) {

	$("#pplotList").empty();

        plotheight = $("#svg").height()
        $("#plotList").attr("style","height:"+plotheight+"px")

	TSPO.DataLoader.state.plotInfo.sort((a,b) => a.length - b.length);
	var examp = 0 

	for (var ck = 0; ck < TSPO.DataLoader.state.plotInfo.length; ck++) {

		if(examp == 1){

			$("#plotList").append('<li id="plot'+ck.toString()+'" style="display:none"><small><span class="glyphicon glyphicon-none" style="margin-right:5px"></span></small>Exp: ' + TSPO.DataLoader.state.plotInfo[ck] + '</li>');

			$("#plotList li").show()

		}else if (examp == 2){

			$("#plotList").append('<li style="display:none"><small><span class="glyphicon glyphicon-none" style="margin-right:5px"></span></small>' + TSPO.DataLoader.state.plotInfo[ck] + '</li>');

			$("#plotList li").show()

		}else{

			$("#plotList").append('<li style="display:none"><small><span class="glyphicon glyphicon-none" style="margin-right:5px"></span></small>' + TSPO.DataLoader.state.plotInfo[ck] + '</li>');

			$("#plotList li").show()

		}

	}

	var templist = []

	for (var chk = 0; chk < Object.values(TSPO.DataLoader.state.evenTab).length; chk++) {
		console.log(TSPO.DataLoader.state.evenTab[chk]['User_IP'], userID)
		if(TSPO.DataLoader.state.evenTab[chk]['User_IP'] == userID){ 
			templist.push(TSPO.DataLoader.state.evenTab[chk]['plotId'])
		}
	}

	var listItems = $("#plotList li");
	listItems.each(function(index){
		let temp = $(this).text()

		if(templist.includes(temp)) {

	              	$(this).find('span').removeClass('glyphicon glyphicon-none').addClass('glyphicon glyphicon-ok')

		}

	})


}

$("body").on("click", "#plotList li", function (e) {
	if (e.originalEvent.detail > 1) { return; } //no double clicks, it populates the vertInfo structure twice

	var formerPlotID = sessionInfo.plotID  //====== changed peter 3/4 chasing plotID

	clearThePlotDisplay(sessionInfo, vertInfo); //remove all plot elements in prep for new plot

	//get and set the sessionInfo.plotID
	var index = $("#plotList li").index($(this));

	if($(this).text().includes("Exp: ")){

		sessionInfo.plotID = $(this).text().split(" ")[1]

	}else{

		sessionInfo.plotID = $(this).text()

	}

	$("#plotList li").removeClass("selected");

	$(this).addClass("founded selected");

	vertInfo = [] //plotFormInfo[index];

	specIndex = $("#indexList li.active").attr('id');

	ylabel = $("#" + specIndex).text() //check to see if this one needs to be passed to the getData function
	getData(sessionInfo, specIndex, activeRedSpecIndex, activeGreenSpecIndex, activeBlueSpecIndex, ylabel);

        removeRow();

	insertRow();

	accord();

        var ul = document.getElementById("LayerSetList");
        var items = ul.getElementsByTagName("li");
        for (var i = 0; i < items.length; ++i) {
                if(items[i].matches(".active")){
                        $(items[i]).click()
                }
        }


        panelHeight = $(window).height()-$("#topSection").height()-50

	//console.log(panelHeight)
        $("#lowerCol").attr("style","height:"+panelHeight+"px")

        $("#containerDiv").attr("style","height:"+panelHeight+"px")

        plotheight = $("#svg").css("height")

        $("#plotList").attr("style","height:"+plotheight)

        plotheight = $("#svg").height()+40

        $("#plotList").attr("style","height:"+plotheight+"px")

	//nam = "#img"+$("#ImpliedYOD").text().slice(-4)

	//pos = $("#chip-gallery").scrollLeft() + $(nam).position().left-400

	//$("#chip-gallery").animate({scrollLeft: pos})

});

//function to clear all plot elements in preparation for a new plot display - gets called when a new plot is selected or a new project is selected
function clearThePlotDisplay(sessionInfo, vertInfo) {

	$("#chip-gallery, #img-gallery, #svg").empty(); //reset

	$(".segment, .vertex").remove(); //empty the current vertex and segment forms

	$("#commentInput").val("")

	$("#isExampleCheckbox").prop("checked", false)

	timeLapseIndex = 0; //reset

	selectedCircles = []; //reset

	lineData = []; //reset

	selectThese = []; //reset

	vertInfo = [];

}


function generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function propBox(i,spot){

    const htmlString = `<div id="PropBox">`+
            `<div style="display:flex">`+
                `<p style="font-size:25px"><b>+</b></p>`+
                `<button onclick="changeColor('red')">clear cut</button>`+
                `<button onclick="changeColor('green')">fire</button>`+
                `<button onclick="changeColor('blue')">partial harvest</button>`+
                `<button onclick="changeColor('black')">insect and disease</button>`+
            `</div>`+
            `<div style="display:flex">`+
                `<canvas id="canvas" style="height:100px"></canvas>`+
                `<button onclick="resetColors()">Reset</button>`+
            `</div>`+
            `<div style="display:flex">`+
                `<p style="font-size:25px"><b>-</b></p>`+
                `<button onclick="popColor('red')">clear cut</button>`+
                `<button onclick="popColor('green')">fire</button>`+
                `<button onclick="popColor('blue')">partial harveset</button>`+
                `<button onclick="popColor('black')">insect and disease</button>`+
            `</div>`+
            `<p id="num"></p>`+
        `</div>`;
    const elem = document.getElementById(spot);
    elem.insertAdjacentHTML('beforeend', htmlString);

}

function demoKnob(i,spot) {
	// Create knob element, 300 x 300 px in size.
        const knob = pureknob.createKnob(200, 100);

        // Set properties.
        knob.setProperty('angleStart', -0.75 * Math.PI);
        knob.setProperty('angleEnd', 0.75 * Math.PI);
        knob.setProperty('colorFG', '#FFA500');
        knob.setProperty('trackWidth', 0.4);
        knob.setProperty('valMin', 0);
        knob.setProperty('valMax', 100);

        knob.setProperty('label', "Was there forest loss?")
        // Set initial value.
        knob.setValue(0);

        const listener = function(knob, value) {
                eval(`ediSpot${i} = value`);
                $(`#selected${i}`).text(value);
        };

        knob.addListener(listener);

        // Create element node.
        const node = knob.node();
        // Add it to the DOM.
        const elem = document.getElementById(spot);
        	elem.appendChild(node);
        }


function loadVertex(info) {

	vertices = [];  

	if (vertices.length > 0 && vertices[0].plotid != sessionInfo.plotID) {

		return;

	}

	vertInfo = [];

	vertices.forEach(function (v) {

		vertInfo.push({

			year: v.image_year,

			julday: v.image_julday,

			index: yearList.indexOf(v.image_year),//idx,

			landUse: {

				primary: {

					landUse: v.dominant_landuse,

					notes: parseNote(v.dominant_landuse_notes, 'landuse')

				},

				secondary: {

					landUse: v.secondary_landuse,

					notes: parseNote(v.secondary_landuse_notes, 'landuse')

				}

			},

			landCover: {

				landCover: v.dominant_landcover,

				other: parseNote(v.dominant_landcover_notes, 'landcover')

			},

			changeProcess: {

				changeProcess: v.change_process,

				notes: parseNote(v.change_process_notes, 'process')

			}

		});

	});

	//check to see if vert info has been filled in for this plot
	selectThese = [];

	if (vertInfo.length != 0) {
		for (var i = 0; i < vertInfo.length; i++) {
			selectThese.push(vertInfo[i].index); //reset global
		}
	} else {
		selectThese = [0, lastIndex]
		for (var i = 0; i < selectThese.length; i++) {
			vertInfo.push({
				year: origData[selectThese[i]].image_year, julday: origData[selectThese[i]].image_julday, index: selectThese[i], landUse: {
					primary: { landUse: "", notes: { wetland: false, mining: false, rowCrop: false, orchardTreeFarm: false, vineyardsOtherWoody: false } },
					secondary: { landUse: "", notes: { wetland: false, mining: false, rowCrop: false, orchardTreeFarm: false, vineyardsOtherWoody: false } }
				}, landCover: { landCover: "", other: { trees: false, shrubs: false, grassForbHerb: false, impervious: false, naturalBarren: false, snowIce: false, water: false } }, changeProcess: { changeProcess: "", notes: { natural: false, prescribed: false, sitePrepFire: false, airphotoOnly: false, clearcut: false, thinning: false, flooding: false, reserviorLakeFlux: false, wetlandDrainage: false } }
			})
		}
	}

	plotInt(); //draw the points
	makeChipInfo("json", origData)
	appendSrcImg(); //append the src imgs
	appendChips("annual", selectThese); //append the chip div/canvas/img set

}


//////////////DEFINE FUNCTION TO INITIALLY POPULATE CHIPINFO OBJECT/////////////////////////////////////
function makeChipInfo(selection, origData) {
	for (var i = 0; i < n_chips; i++) {
		if (selection == "random") {
			//randomly select a chip from a strip to display - not needed once we have json file to tell us
			var useThisChip = Math.floor((Math.random() * thisManyChips));
		} else if (selection == "ordered") {
			var useThisChip = i;
		} else if (selection == "json") {
			var useThisChip = 0;
			var year = origData[i].image_year
			var julday = origData[i].image_julday
			var src = {
				chipSetBGW: origData[i].url_tcb,
				chipSet743: origData[i].url_743,
				chipSet432: origData[i].url_432
			}
			//var src = origData[i].url
			var sensor = origData[i].sensor
		}

		chipInfo.chipsInStrip[i] = 1 //thisManyChips;
		chipInfo.useThisChip[i] = useThisChip;
		chipInfo.year[i] = year;
		chipInfo.julday[i] = julday;
		chipInfo.src[i] = src;
		chipInfo.sensor[i] = sensor;
		chipInfo.imgIDs[i] = ("img" + i);
	}
	updateChipInfo();
}




///////////DEFINE THE FUNCTION TO ADD THE CANVAS AND IMAGE FOR EACH CHIP ON-THE-FLY////////////
function appendSrcImg() {
	for (var i = 0; i < n_chips; i++) {
		chipInfo.imgIDs[i] = ("img" + i);
		var thisChipSet = $("#chipSetList .active").attr("id");
		var appendThisImg = '<img class="chipImgSrc" id="' + chipInfo.imgIDs[i] + '"src="' + chipInfo.src[i][thisChipSet] + '">';
		$("#img-gallery").append(appendThisImg);
	}
}

//this function is handling the appending of the main chips and the remote chips, though it might be better to separate them
function appendChips(window, selected, color) {
	heigh= $("#svg").css("height")

	// creates image chip divs that hold the sync maps 
	for (var i = cat; i < n_chips; i++) { // <<<<<<<<<<<<<<<<< changed to grab a subset of observation image chips
		chipInfo.canvasIDs[i] = ("chip" + i);
		var appendThisCanvas = '<div id="' + chipInfo.canvasIDs[i] + '" class="chipHolder">' +
				       		"<div id='imgYear"+origData[i].image_year+"'>"+
							"<p id='img"+origData[i].image_year+"'>" + origData[i].image_year + "</p>"+
							//"<div class=\'map\' id=\'map" + i + "\'></div>"+
							"<div class=\'map\' id=\'map" + i + "\'  style=\'height:"+heigh+"; width:"+heigh+"\' ></div>"+
						"</div>" +
						'<div class="chipDate">&nbsp;</div>' + 
					'</div>';
		$("#chip-gallery").append(appendThisCanvas);
	}

	// add the tool tips
	if ($("#toolTipsCheck").hasClass("glyphicon glyphicon-ok")) {
		$("canvas.chipImg.annual").prop("title", "This is an annual image chip. It represents the 255 x 255 pixel image subset centered on the plot. There is one image per year and the center pixel outlined in white corresponds to a spectral point in the pixel time series. The correspondence between this image chip and its mathcing point in the spectral point time series is marked by shared green highlighting on hover. Holding the shift key while mouse wheeling on an image chip will change the scale. Double clicking on an image chip will toggle a vertex on and off. Image chips that are outlined in red represent vertices.")
		$("span.expandChipYear").prop("title", "This is intra-annual image chip window icon. Clicking it will open a new window and/or load all image chips for the year. In the intra-annual image chip window, all chips have a corresponding intra-annual spectral point in the time series plot. Hovering over any of the image chips while the Show Points (show intra-annual points) toggle is active (thumbs up), the corresponding point will be highlighted in blue. This will help you make a decision about which point is best suited to represent the year. Clicking on any of the image chips will set that chip as the new data for the year. The data will immediately change in the main chip gallery and in the spectral time series plot.")
		$(".chipDate").prop("title", "This is the year and day of the image chip and corresponding point in the spectral time series plot. The day is defined by day-of-year. In the Help button dropdown menu there is a conversion calendar that links day-of-year to month-day to help interpret when the image was recorded.")
	}

	// applies and creates leaflet maps that are append to the image chip divs 
	mapstuff();

}

// sets the different image layers opacity when a layer is selected from the image chip dropdown
$("#LayerSetList").on('click', function () {

	// if tassel cap layer is selected change the opacity of the all other layers to 0 
	if (edityod === 'rgbTC') {

		for (var w = cat; w <= mapNumber; w++) {
			let rgb6 = "rgb654_" + w + ".setOpacity(0)";
			eval(rgb6)
		}
		for (var ww = cat; ww <= mapNumber; ww++) {
			let rgb5 = "rgb543_" + ww + ".setOpacity(0)";
			eval(rgb5)
		}
		for (var www = cat; www <= mapNumber; www++) {
			let rgb4 = "rgb432_" + www + ".setOpacity(0)";
			eval(rgb4)
		}
		for (var wwww = cat; wwww <= mapNumber; wwww++) {
			let rgbT = "rgbTC_" + wwww + ".setOpacity(1)";
			eval(rgbT)
		}
	// if 654 layer is selected change the opacity of the all other layers to 0 
	} else if (edityod === 'rgb654') {

		for (var h = cat; h <= mapNumber; h++) {
			let rgbT = "rgbTC_" + h + ".setOpacity(0)";
			eval(rgbT)
		}
		for (var hh = cat; hh <= mapNumber; hh++) {
			let rgb5 = "rgb543_" + hh + ".setOpacity(0)";
			eval(rgb5)
		}
		for (var hhh = cat; hhh <= mapNumber; hhh++) {
			let rgb4 = "rgb432_" + hhh + ".setOpacity(0)";
			eval(rgb4)
		}
		for (var hhhh = cat; hhhh <= mapNumber; hhhh++) {
			let rgb6 = "rgb654_" + hhhh + ".setOpacity(1)";
			eval(rgb6)
		}
	// if 543 layer is selected change the opacity of the all other layers to 0 
	} else if (edityod === 'rgb543') {

		for (var b = cat; b <= mapNumber; b++) {
			let rgb6 = "rgb654_" + b + ".setOpacity(0)";
			eval(rgb6)
		}
		for (var bb = cat; bb <= mapNumber; bb++) {
			let rgbT = "rgbTC_" + bb + ".setOpacity(0)";
			eval(rgbT)
		}
		for (var bbb = cat; bbb <= mapNumber; bbb++) {
			let rgb4 = "rgb432_" + bbb + ".setOpacity(0)";
			eval(rgb4)
		}		
		for (var bbbb = cat; bbbb <= mapNumber; bbbb++) {
			let rgb5 = "rgb543_" + bbbb + ".setOpacity(1)";
			eval(rgb5)
		}
	// if 432 layer is selected change the opacity of the all other layers to 0 
	} else if (edityod === 'rgb432') {

		for (var g = cat; g <= mapNumber; g++) {
			let rgb6 = "rgb654_" + g + ".setOpacity(0)";
			eval(rgb6)
		}
		for (var gg = cat; gg <= mapNumber; gg++) {
			let rgbT = "rgbTC_" + gg + ".setOpacity(0)";
			eval(rgbT)
		}
		for (var ggg = cat; ggg <= mapNumber; ggg++) {
			let rgb5 = "rgb543_" + ggg + ".setOpacity(0)";
			eval(rgb5)
		}
		for (var gggg = cat; gggg <= mapNumber; gggg++) {
			let rgb4 = "rgb432_" + gggg + ".setOpacity(1)";
			eval(rgb4)
		}
	}

})

//--------------------------------------------------------------------------------------------------------
////////////////DEFINE FUNCTION TO UPDATE THE CHIPINFO OBJECT WHEN A NEW CHIP SIZE IS SELECTED////////////
function updateChipInfo() {
	for (var i = cat; i < n_chips; i++) {
		//define/store some other info needed for zooming
		chipInfo.sxOrig[i] = chipDisplayProps.offset;	//0 chipInfo.offset set/push the original source x offset to the sxOrig array
		chipInfo.syOrig[i] = (255 * chipInfo.useThisChip[i]) + chipDisplayProps.offset; // +chipInfo.offset   set/push the original source y offset to the syOrig array
		chipInfo.sWidthOrig[i] = chipDisplayProps.chipSize; //255  set/push the original source x width to the sWidthOrig array
		chipInfo.sxZoom[i] = chipInfo.sxOrig[i];
		chipInfo.syZoom[i] = chipInfo.syOrig[i];
		chipInfo.sWidthZoom[i] = chipInfo.sWidthOrig[i];
	}

	var starter = chipDisplayProps.halfChipSize,
		lwstarter = chipDisplayProps.box;

	for (var i = 1; i < maxZoom + 1; i++) {
		starter *= 0.9
		sAdj[i] = (chipDisplayProps.halfChipSize - starter);
		lwstarter /= 0.9;
		lwAdj[i] = lwstarter;
	}
}


// getting text to display the selected layer in dropdown button TODO: need to make so this value is reset when a new plot is selected 
//--------------------------------------------------------------------------------------------------------
var edityod = 'rgbTC';
$(".LayerSetList li").click(function (e) {
	edityod = $(this).attr("id");
	$('#selectedYOD').text($(this).text());
})

//
//--------------------------------------------------------------------------------------------------------
var editObser;
$(".obser li").click(function (e) {
	editObser = $(this).attr("id");
	$('#selectedObser').text($(this).text());
})

//
//--------------------------------------------------------------------------------------------------------
var ediTable;
$(".table li").click(function (e) {
	ediTable = $(this).attr("id");
	$('#selectedTable').text($(this).text());
})


function containsValueAtKey(list, key, value) {
    return list.some(function(obj) {
        return obj[key] === value;
    });
}
//--------------------------------------------------------------------------------------------------------
// HERE 
function insertRow() {
    // Get the display tab config and extract valid button keys and their value definitions
    const displayTab = TSPO.DataLoader.state.displayTab;
    const displayTabKeys = Object.keys(displayTab[0]);
    const displayBtnNames = displayTabKeys.filter(key => key.length > 2);
    const displayValueNames = displayBtnNames.map(key => displayTab[0][key]).filter(Boolean);

    // Get attribution table and plot/session info
    const evenTab = TSPO.DataLoader.state.evenTab;
    const res = TSPO.DataLoader.state.res;
    const plotId = sessionInfo.plotID;
    const userIP = userID;

    // Determine which attributes are common between display config and event table
    const intersection = Object.keys(evenTab[0]).filter(k => displayBtnNames.includes(k));
    const indxList = intersection.map(key => displayBtnNames.indexOf(key));
    const valueArr = indxList.map(n => displayValueNames[n]);

    // Placeholder for selected attribution values
    const ediSpots = Array(valueArr.length).fill("");

    // Clear and set up container for the attribution UI
    $('#listOne').empty().append('<div class="btn-group"><p id="edTile"></p></div>');

    // Add buttons and populate with existing values if available for current plot/user
    for (let i = 0; i < intersection.length; i++) {
        const fieldName = intersection[i];
        // Add a button group for this attribute
        const btnHtml = `
            <div class="btn-group dropdown">
                <button class="btn btn-default dropdown-toggle specPlotBtn" style="border-radius: 5px;">
                    <div><strong>${fieldName}</strong>|<br><span id="selected${i}"></span></div>
                </button>
                <ul id="spot${i}" class="dropdown-content"></ul>
            </div>`;
        $('#listOne').append(btnHtml);

        // If this plot already has a saved attribution from this user, show it
        for (let row of evenTab) {
            if (row.plotId == plotId && row.User_IP == userIP) {
                const val = row[fieldName];
                $(`#selected${i}`).text(val);
                ediSpots[i] = val;
            }
        }
    }

    // Populate each dropdown/selector depending on the value type (text, dial, propbox, or options)
    for (let i = 0; i < valueArr.length; i++) {
        if (valueArr[i].includes('comment')) {
            $(`#spot${i}`).append(`<form id="usrform${i}"></form><textarea rows="4" cols="30" name="${intersection[i]}1" form="usrform" style="width:100%"></textarea>`);
        } else if (valueArr[i].includes('Dial')) {
            demoKnob(i, `spot${i}`);
        } else if (valueArr[i].includes('Prop')) {
            const parent = document.getElementById(`spot${i}`);
            new PropBox(parent, valueArr[i]);
        } else {
            const list = valueArr[i].split(', ');
            list.forEach(val => $(`#spot${i}`).append(`<li id="${val}">${val}</li>`));
        }
    }

    // Add the Save button
    $('#listOne').append('<button type="button" id="save">Save</button>');

    // Handle user clicking on list items or editing textareas
    for (let i = 0; i < valueArr.length; i++) {
        $(`#spot${i} li`).click(function () {
            const val = $(this).attr("id");
            if (val) {
                ediSpots[i] = val;
                $(`#selected${i}`).text(val);
            }
        });

        // Update selected value when user clicks an option
        $(`#spot${i}`).mouseout(function (e) {
            if (e.currentTarget.id === `spot${i}` && e.target.localName === "textarea") {
                ediSpots[i] = $(`#spot${i} textarea`).val();
                $(`#selected${i}`).text("text submitted");
            }
        });
    }

    // Capture a timestamp for when the interaction started
    time1 = Date();
    timeStamp1 = time1.slice(4, 24);

	$("#save").click(function () {
	    const match = TSPO.DataLoader.state.res.find(d => d.plotid === sessionInfo.plotID);
	    if (!match) {
	        alert("Plot not found. Cannot save.");
	        return;
	    }

	    const time2 = Date();
	    const timeStamp2 = time2.slice(4, 24);
	    const timeDifference = getTimeDifference(time1, time2);

	    const lis_col = ["0", "1", "2", "3"];
	    const lis_val = [sessionInfo.plotID, sessionInfo.plotID, timeStamp2, origData[0].target_day.toString()];

	    $(".dropdown div").each(function () {
	        const attr = $(this).text().split('|');
	        if (attr.includes('text submitted')) {
	            const dividx = $(this).children("span").attr("id").slice(-1);
	            const dirty = $("#spot" + dividx).children('textarea').val();
	            const clean = DOMPurify.sanitize(dirty);
	            lis_val.push(clean);
	        } else if (attr.length > 1) {
	            lis_val.push(attr[1]);
	        }
	    });

	    lis_val.push(userID);
	    //lis_val.push(timeDifference);

	    //if (TSPO.DataLoader.state.evenTab?.[0]?.tracker !== undefined) {
	    //    lis_val.push(match.tracker);
	    //    lis_val.push(match.reEval);
	    //}

	    // Check for missing values
	    for (let i = 0; i < lis_val.length; i++) {
	        if (lis_val[i] === '' && i < 10) {
	            alert("Hello, make sure you completed each attribute option.");
	            return;
	        }
	    }

	    this.disabled = true;

	    const existing = TSPO.DataLoader.state.evenTab.find(d =>
	        d.plotId === sessionInfo.plotID && d.User_IP === userID
	    );

	    if (existing) {
	        const confirmed = confirm('There is already an event for this time series. Override it?');
	        if (!confirmed) return;

	        const remover = JSON.stringify([sessionInfo.plotID, userID]);
	        $.post("./php/removeRow.php", { path: db_path, rmr: remover }, function (msg, status) {
	            console.log("Row removed:", msg, status);
	        });
	    }

	    const holder = JSON.stringify(lis_val);
	    console.log(holder)

		const firstRow = TSPO.DataLoader.state.evenTab[0];
		const numColumns = Object.keys(firstRow).length;
		console.log("Type of numColumns:", typeof numColumns);
		console.log("Type of holder.length:", typeof lis_val.length);
		console.log("Strict equality check:", numColumns === lis_val.length);
		console.log("Loose equality check:", numColumns == lis_val.length);
		if (numColumns === lis_val.length) {
		    console.log("numbers");
		    console.log(numColumns);
		} else {
		    console.log("diff length");
		    console.log(numColumns);
		    console.log(lis_val.length);
		}

	    $.post("./php/addChartInfo.php", { path: db_path, holds: holder })
	        .done(function () {
	            // Reload polygon data
			$.post("./php/get_polygon_table.php", { path: db_path }, null, 'json')
			    .done(function(data) {
			        console.log("Raw polygon data returned:", data);
			        TSPO.DataLoader.state.res = data;
			        TSPO.DataLoader.state.res_len = data.length;
			    })
			    .fail(function(jqXHR, textStatus, errorThrown) {
			        console.error("Error in get_polygon_table.php request:", textStatus, errorThrown);
			    });

	            // Reload event data

			$.post("./php/get_event_table.php", { path: db_path }, null, 'json')
			    .done(function(data) {
			        TSPO.DataLoader.state.evenTab = data;
			        if (containsValueAtKey(data, 'plotId', lis_val[1])) {
			            $('.selected span').removeClass('glyphicon-none').addClass('glyphicon glyphicon-ok');
			        }
			    })
			    .fail(function(jqXHR, textStatus, errorThrown) {
			        console.error("Error in get_event_table.php request:", textStatus, errorThrown);
			    });

	        })
	        .fail(function (jqXHR, textStatus, errorThrown) {
	            console.error("Error saving chart info:", textStatus, errorThrown);
	        });

	    $('.selected span').removeClass('glyphicon-none').addClass('glyphicon glyphicon-ok');

	    globalStretch();
	    $("#checkListSection").css("height", $("#chipGallerySection").height());
	});

    globalStretch();
    $("#checkListSection").css("height", $("#chipGallerySection").height());
}




//--------------------------------------------------------------------------------------------------------
function removeRow(input) {
	//$('#popUp').children().remove();
	$('#listOne').children().remove();
}

//--------------------------------------------------------------------------------------------------------
// accordion stuff
function accord() {
	var acc = document.getElementsByClassName("accordion");
	var panel = document.getElementsByClassName('panel');

	for (var i = 0; i < acc.length; i++) {
		acc[i].onclick = function () {
			var setClasses = !this.classList.contains('active');
			setClass(acc, 'active', 'remove');
			setClass(panel, 'show', 'remove');

			if (setClasses) {
				this.classList.toggle("active");
				this.nextElementSibling.classList.toggle("show");
			}

		}
		// add a condistion if cusur is something dont close when clicked 
		$('.panel').on('click', function (e) {
			if (e.target.nodeName !== 'TEXTAREA'){
				$('.accordion').removeClass('active')
				$(this).removeClass('show')
			}else if (e.target.nodeName === 'TEXTAREA'){
				console.log('textarea')
			}
		})

	}
}



//--------------------------------------------------------------------------------------------------------
function setClass(els, className, fnName) {
	for (var i = 0; i < els.length; i++) {
		els[i].classList[fnName](className);
	}
}


//--------------------------------------------------------------------------------------------------------
$('#searchBtn').click(function(){
	var searchString = $('#searchText').val()
        if (searchString.length >= 3) {
        	$('#plotList li').each(function(e){
                	$(this).removeClass('found');
                })  
                $('#plotList li').each(function(e){
                	if ($('#plotList li.found').first()[0] !== undefined) {
                        	if ($('#plotList li.found').first()[0].outerText.includes(searchString)){
                                	console.log('same')
                                }else{
                                        $(this).removeClass('found');
                                }
                        }
                        if (this.outerText.includes(searchString)){
                                $(this).addClass('found');
                                $('#plotList').animate({ scrollTop: $(this).offset().top - $('#plotList').offset().top + $('#plotList').scrollTop()} ,'fast');
                                return false
                        }
                })
	}else{
        	alert('Your search need to be three or more characters long.')
        }
        $('#plotList li.found').animate({ scrollTop: $('#plotList li.found').offset().top - $('#plotList').offset().top + $('#plotList').scrollTop()});
});
