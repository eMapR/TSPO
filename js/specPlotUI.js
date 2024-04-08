//update the plot when buttons are clicked
$(document).ready(function(){
	$(".specPlot li").click(function() { //This will attach the function to all the input elements
		//figure out which dropdown was selected and change its active status
		var thisLi = $(this);
		var thisListID = thisLi.closest("ul").attr('id'),
			thisSpecIndexID = thisLi.attr('id'),
			newactive = "#"+thisListID+" #"+thisSpecIndexID,
			activesearch = "#"+thisListID+" .active",
			activeid = $(activesearch).attr('id'),
			oldactive = "#"+thisListID+" #"+activeid;

		$(oldactive).removeClass('active');
		$(newactive).addClass('active');

		if(thisLi.parent().hasClass("rgb")){
			if(thisListID === "redList"){$("#btnRed div").replaceWith('<div><strong>R</strong><small>GB</small><br><small>'+$("#"+thisSpecIndexID).text()+'</small><span class="caret specPlot"></span></div>')}
			else if(thisListID === "greenList"){$("#btnGreen div").replaceWith('<div><small>R</small><strong>G</strong><small>B</small><br><small>'+$("#"+thisSpecIndexID).text()+'</small><span class="caret specPlot"></span></div>')}
			else if(thisListID === "blueList"){$("#btnBlue div").replaceWith('<div><small>RG</small><strong>B</strong><br><small>'+$("#"+thisSpecIndexID).text()+'</small><span class="caret specPlot"></span></div>')};

			//these could be global, they are retrieved again when a chip is replaced.
			activeRedSpecIndex = $("#redList li.active").attr('id')
			activeGreenSpecIndex = $("#greenList li.active").attr('id')
			activeBlueSpecIndex = $("#blueList li.active").attr('id')

			rgbColor = scaledRGB(data, activeRedSpecIndex, activeGreenSpecIndex, activeBlueSpecIndex, stretch, 2, n_chips);
			allDataRGBcolor = scaledRGB(allData, activeRedSpecIndex, activeGreenSpecIndex, activeBlueSpecIndex, stretch, 2, allData.Values.length);
			updatePlotRGB();
		} else if(thisLi.parent().hasClass("indexList")){
			$("#btnIndex div").replaceWith('<div><strong>Index:</strong><br><small>'+$("#"+thisSpecIndexID).text()+'</small><span class="caret specPlot"></span></div>');
			specIndex = $("#indexList li.active").attr('id')

			// localStretch();
			plotUpdate(data, specIndex, rgbColor, currentDomain);
			$("#specPlotIndex").text($("#"+specIndex).text());
		} else if(thisLi.parent().hasClass("chipSetList")){
			var setText = $("#"+thisSpecIndexID).text()

			switch(setText){
				case "TM TC":
					activeRedSpecIndex = "TCB";
					activeGreenSpecIndex = "TCG";
					activeBlueSpecIndex = "TCW";
				break;
				case "SWIR2,NIR,Red":
					activeRedSpecIndex = "B7";
					activeGreenSpecIndex = "B4";
					activeBlueSpecIndex = "B3";
				break;
				case "NIR,Red,Green":
					activeRedSpecIndex = "B4";
					activeGreenSpecIndex = "B3";
					activeBlueSpecIndex = "B2";
				break;
			}

			rgbColor = scaledRGB(data, activeRedSpecIndex, activeGreenSpecIndex, activeBlueSpecIndex, stretch, 2, n_chips);
			allDataRGBcolor = scaledRGB(allData, activeRedSpecIndex, activeGreenSpecIndex, activeBlueSpecIndex, stretch, 2, allData.Values.length);
			updatePlotRGB();

			$("#btnChipSet div").replaceWith('<div><strong>Chip Set:</strong><br><small>'+setText+'</small><span class="caret specPlot"></span></div>');
			$("#chip-gallery, #img-gallery").empty(); //reset
			appendSrcImg(); //append the src imgs
			appendChips("annual",selectThese); //append the chip div/canvas/img set
			drawAllChips("annual");

			var message = {
				"action":"change_chip_set",
				"thisChipSet":$("#chipSetList .active").attr("id"),
                "dbpath": currentDB,
                'chipRoot': chipRoot
			};

			if ((chipstripwindow != null) || (chipstripwindow.closed == false)){      //if the window is open then send message to change the chip set
				chipstripwindow.postMessage(JSON.stringify(message),"*");
			}
		}
	});
});


//mechanism to display the selected points and line in the trajectory plot
$("#btnLine").click(function(){

	if ($("#lineDisplayThumb").attr("class") == "glyphicon glyphicon-thumbs-up"){
                eval("roi1.options.style.opacity=1") 
                for (var wwww = cat; wwww <= mapNumber; wwww++) {
                        var cmd1 = "roi"+wwww+".setStyle({opacity:0})"
                 	eval(cmd1)
                 }

		$("#lineDisplayThumb").removeClass("glyphicon glyphicon-thumbs-up")
			.addClass("glyphicon glyphicon-thumbs-down");
		$("circle.selected").css("stroke-opacity","0");
		$("circle.highlight").css("stroke-opacity","0");
		$("#plotLine").css("stroke-opacity","0");
	} else{
                eval("roi1.options.style.opacity=0") 
                for (var wwww = cat; wwww <= mapNumber; wwww++) {
                        var cmd1 = "roi"+wwww+".setStyle({opacity:1})"
                 	eval(cmd1)
                 }


		$("#lineDisplayThumb").removeClass("glyphicon glyphicon-thumbs-down")
			.addClass("glyphicon glyphicon-thumbs-up");
		$("circle.selected").css("stroke-opacity","1");
		$("circle.highlight").css("stroke-opacity","1");
		$("#plotLine").css("stroke-opacity","1");
	}
});

//mechanism to display all points trajectory plot
$("#btnPoints").click(function(){
	if ($("#allPointsDisplayThumb").attr("class") == "glyphicon glyphicon-thumbs-up"){
		$("#allPointsDisplayThumb").removeClass("glyphicon glyphicon-thumbs-up")
			.addClass("glyphicon glyphicon-thumbs-down");
		$("circle.allData").attr("visibility","hidden");
		$("circle.data").css("fill-opacity","1");
	} else{
		$("#allPointsDisplayThumb").removeClass("glyphicon glyphicon-thumbs-down")
			.addClass("glyphicon glyphicon-thumbs-up");
		$("circle.allData").attr("visibility","visible");
		$("circle.data").css("fill-opacity","0.5");
	}
});



$("#highlightColor").change(function(){
	setHighlightColor();
});

$("#selectedColor").change(function(){
	setSelectedColor()
});

$("#plotColor").change(function(){
	chipDisplayProps.plotColor = $("#plotColor").prop("value")
	drawAllChips("annual")
});

//mechanism to reset the plot zoom
$("#btnResetGlobal").click(function(){
	globalStretch();
});

$("#btnResetLocal").click(function(){
	localStretch();
});

function setHighlightColor(){
	//var color = $("#highlightColor").prop("value");
	highLightColor = $("#highlightColor").prop("value");
	$("circle.highlight").css({"stroke":highLightColor,"stroke-width":5});
	$(".chipHolder.highlight").css("border-color",highLightColor);
	$("tr.active").css("background-color",highLightColor);
}

function setSelectedColor(){
	var color = $("#selectedColor").prop("value");
	$("circle.selected").css("stroke",color);
	$("#plotLine").css("stroke",color);
	$(".chipHolder.selected").css("border-color",color);
}
