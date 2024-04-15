//init some global variables 
var roi;
var maxNatLevel;
var listNum = [];
//var zoomFiles = [];

// ??? this function is not called in the scritp 
function sortZoomNumber(a, b) {
    return b - a;
}


// this function gets the centroid of a polygon - applies the coordinates to a label - something with NAIP but its not NAIP --- > arcgis...
function get_centroid(){

	var regex = /[\d|.|\+]+/g;
	// placed is a global var from ts_script
	var str = placed.match(regex)
	var num = str.map(Number) 
	let x = num.filter((element, index) => {
  		return index % 2 === 0;
	})
	let y = num.filter((element, index) => {
  		return index % 2 === 1;
	})

	var xmax = Math.max.apply(Math, x);
	var xmin = Math.min.apply(Math, x);
	var ymax = Math.max.apply(Math, y);
	var ymin = Math.min.apply(Math, y);

	xcenter = Math.round(-1*((xmax + xmin)/2)*100000)/100000;
	ycenter = Math.round(((ymax + ymin)/2)*100000)/100000;

	centroid = [ycenter, xcenter]

        $("#coordins").val(xcenter.toString()+", "+ycenter.toString())


        //$("#NAIP").attr("onclick", "window.open(naip))
	console.log(centroid)
        return centroid
}


//nction copyLatLng() {

	

        // make lat lng string 
        //var copyText = $("#coordins").val();


        /* Copy the text inside the text field */
        //      navigator.clipboard.writeText(copyText);
        /* Alert the copied text */
        //window.prompt("Copy to clipboard: Ctrl+C, Enter", copyText);
//}


function mapstuff() {

    var cat = 0;
    get_centroid()

    mapNumber =  JSON.parse(res[0][3]).length-1
    console.log(mapNumber)
    beginYear = JSON.parse(res[0][3])[0]['image_year']
    console.log(beginYear)

    $('#mapid').remove();

    heig= $("#svg").height()

    widh= $("#formsDiv").width()-8

    $('#formsDiv').append('<div id="mapid" style="width:'+widh+'px; height:'+heig+'px;"></div>')

    // current imagery map
    var airImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {maxZoom: 18});

    var opMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 });

    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 18});

    if (highRes === "NICFI"){

        var nicfi_1 = L.tileLayer(tilePath +"/nicfi/2017/{z}/{x}/{y}.png", {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:16});
        var nicfi_2 = L.tileLayer(tilePath +"/nicfi/2018/{z}/{x}/{y}.png", {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:16});
        var nicfi_3 = L.tileLayer(tilePath +"/nicfi/2019/{z}/{x}/{y}.png", {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:16});
        var nicfi_4 = L.tileLayer(tilePath +"/nicfi/2020/{z}/{x}/{y}.png", {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:16});
        var nicfi_5 = L.tileLayer(tilePath +"/nicfi/2021/{z}/{x}/{y}.png", {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:16});
        var nicfi_6 = L.tileLayer(tilePath +"/nicfi/2022/{z}/{x}/{y}.png", {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:16});
        var nicfi_7 = L.tileLayer(tilePath +"/nicfi/2023/{z}/{x}/{y}.png", {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:16});
        var nicfi_8 = L.tileLayer(tilePath +"/nicfi/2024/{z}/{x}/{y}.png", {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:16});
        var nicfi_9 = L.tileLayer(tilePath +"/nicfi/2025/{z}/{x}/{y}.png", {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:16});

        var basemaps = {"NICFI 2015-11->2016-05":nicfi_1, "NICFI 2016-05>2016-10":nicfi_2,"NICFI 2016-11->2017-05":nicfi_3,"NICFI 2017-05->2017-11":nicfi_4,"NICFI 2018-06->2018-10":nicfi_5, "NICFI 2018-11->2019-05":nicfi_6, "NICFI 2019-06->2019-11": nicfi_7, "NICFI 2019-11->2020-05":nicfi_8, "NICFI 2020-05->2020-11":nicfi_9, "Street":opMap, "Topo": topo, "Satellite":airImagery};

    }else if (highRes === "NAIP"){

        var basemaps = {"Street":opMap, "Topo": topo, "aerial": airImagery};

    }else{

        var basemaps = {"Street":opMap, "Topo": topo, "aerial": airImagery};

    }

    var myStyle = {"color": "white", "weight": 2, "opacity": 1, "fillOpacity" : 0};

    for (let i = cat; i <= (mapNumber+1); i++) {   ////36 > 35
        let roiName = "roi" + i + " = L.geoJSON("+placed+",{style: myStyle});";
        eval(roiName);

    }

    // tile file paths
    for(let z = cat; z <= mapNumber; z++){
        let imagelayer0 = "rgbTC_" + z + "= L.tileLayer('"+ tilePath +"/rgbTC/" + Number(beginYear + z) + "/{z}/{x}/{y}.png', {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:14});"; //removed  ,maxZoom: 17, maxNativeZoom: "+listNum[0]+"});";
        let imagelayer1 = "rgb432_" + z + "= L.tileLayer('"+ tilePath +"/rgb432/" + Number(beginYear + z) + "/{z}/{x}/{y}.png', {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:14});";
        let imagelayer2 = "rgb543_" + z + "= L.tileLayer('"+ tilePath +"/rgb543/" + Number(beginYear + z) + "/{z}/{x}/{y}.png', {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:14});";
        let imagelayer3 = "rgb654_" + z + "= L.tileLayer('"+ tilePath +"/rgb654/" + Number(beginYear + z) + "/{z}/{x}/{y}.png', {tms: true, opacity: 1, attribution: '',maxZoom: 18, maxNativeZoom:14});";
        eval(imagelayer0);
        eval(imagelayer1);
        eval(imagelayer2);
        eval(imagelayer3);
    }

    // cross hair
    var crosshairIcon = L.icon({
        iconUrl: './images/crosshair.png',
        iconSize:     [20, 20], // size of the icon
        iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
    });

    var center = [47.14, -121.6];
    for(let hair = cat; hair <= (mapNumber+1); hair++){
        let manyCrossHairs = "crosshair" + hair + "= new L.marker(center, {icon: crosshairIcon, clickable:false});";
        eval(manyCrossHairs);
    }


   for (let q = cat; q <= mapNumber; q++) {
        let maps = "map" + q + " = L.map('map" + q + "', {"
            + "layers: [rgbTC_"+q+", rgb432_"+q+", rgb543_"+q+", rgb654_"+q+", roi"+q+",crosshair"+q+"],"
            + "center: center,"
            + "zoom: 5,"
            + "maxZoom: 18,"
            + "zoomControl: false,"
            + "attributionControl: false"
            + "});";
        eval(maps);
    }

    var focustime = $("#ImpliedYOD").text().slice(-4)

    // current imagery map
    var currentimagermap = "var map"+Number(mapNumber+1)+" = L.map('mapid',{"+     
           "layers: [airImagery, roi"+Number(mapNumber+1)+",crosshair"+Number(mapNumber+1)+"],"+ 
           "attributionControl: false"+
           "}).setView([47.505, -128.09], 13);"+
           "var overlays = {"+
           "'ROI': roi"+Number(mapNumber+1)+".setStyle({color: '#ff0000'}),"+
           "'crosshair': crosshair" + Number(mapNumber+1)+""+
           "};"+

           "L.control.layers(basemaps, overlays,{collapsed:true}).addTo(map"+Number(mapNumber+1)+");"+

           "map"+Number(mapNumber+1)+".on('move', function(e) {crosshair"+Number(mapNumber+1)+".setLatLng(map"+Number(mapNumber+1)+".getCenter());$('#img_coors').empty();$('#img_coors').text('Latitude: '+map"+Number(mapNumber+1)+".getCenter().lat.toFixed(4) + ' Longitude: ' + map"+Number(mapNumber+1)+".getCenter().lng.toFixed(4))});"

    eval(currentimagermap)

    // Move the crosshair to the center of the map when the user pans
    for(let air = cat; air <= mapNumber; air++){
        let rossHairs = "map"+air+".on('move', function(e) {crosshair"+air+".setLatLng(map"+air+".getCenter());});";
        eval(rossHairs);
    }

    for (let w = cat; w <= mapNumber+1; w++) {
        for (let u = cat; u <= mapNumber+1; u++) {
            let mapsync = "map" + w + ".sync(map" + u + ");";
            eval(mapsync);
        }
    }

    var bound = roi2.getBounds();
    //map2.fitBounds(bound,{padding: [50,50]})
    map2.fitBounds(bound,{maxZoom: 14}) // sets staring zoom level

}




