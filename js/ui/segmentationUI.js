//##########################################################
// JDB added 2019-03-20    \/ \/ \/ \/
//##########################################################

//##########################################################
// highlight corresponding clip/circle year when hovering on either
$(document).on({
    mouseenter: function(){
        var nodeType = $(this).prop('nodeName');
        if(nodeType == "circle"){
            var thisCircle = $(this);
            var thisIndex = $("circle.data").index(thisCircle)
            //var thisChipHolder = $(".chipHolder.annual").eq(thisIndex)
            var thisChipHolder = $(".chipHolder").eq(thisIndex)
	    //console.log(thisIndex)
       } else {
            var thisChipHolder = $(this); //store since it gets called multiple times
            //var thisIndex = $(".chipHolder.annual").index(thisChipHolder) //get the index of the hovered .chipHolder.annual
            var thisIndex = $(".chipHolder").index(thisChipHolder) //get the index of the hovered .chipHolder.annual
            var thisCircle = $("circle.data").eq(thisIndex) //figure out what circle.data to highlight based on index of the hovered .chipHolder.annual
	    //console.log(thisIndex)
	    //console.log(thisChipHolder)
        }
        circleBorderColor = thisCircle.css("stroke"); //need to record the stroke so we know if the circle is selected or not - if selected there will be a stroke, if not stroke will be none
        circleBorderWidth = thisCircle.css("stroke-width"); //need to record the stroke width because it could be 2 or 5 depending on whether highlighting is turn on in the trajectory form
        thisCircle.css({"stroke":highLightColor,"stroke-width":5}).attr("id","hover"); //set the stroke and stroke-width of the circle
        thisChipHolder.addClass("hover"); //add hover class to the .chipHolder.annual so we know which one to turn off on mouseleave - TODO: could just record the index instead of mess with DOM
        borderColor = thisChipHolder.css("borderTopColor"); //record the chipHolder border color so we can return it on mouseleave
        thisChipHolder.css({"borderTopColor":highLightColor,"borderRightColor":highLightColor,"borderBottomColor":highLightColor,"borderLeftColor":highLightColor,}); //ser the highlight border colors
    },
    mouseleave: function(){
        $("#hover").css({"stroke":circleBorderColor,"stroke-width":circleBorderWidth}).removeAttr("id");
        $(".hover").css({"borderTopColor":borderColor,"borderRightColor":borderColor,"borderBottomColor":borderColor,"borderLeftColor":borderColor,}).removeClass("hover");
    }
},".chipHolder, circle.data")
//},".chipHolder.annual, circle.data")
//##########################################################







//##########################################################
//define function to update the circle selection
function changeSelectedClass(seriesIndex){
    console.log(seriesIndex)
    var thisCircle = $("circle.data").eq(seriesIndex);
    var thisChipHolder = $(".chipHolder").eq(seriesIndex); //thisCanvas
    var status = thisCircle.attr("class");
    if(status == "data unselected"){ //add a vertex
        thisCircle.attr("class","data selected");
        thisChipHolder.addClass("selected");
        //updateSegmentForm(seriesIndex-29,"add")
    } else { //remove a vertex
        thisCircle.attr("class","data unselected");
        thisCircle.css("stroke","none");
        thisChipHolder.removeClass("selected");
        thisChipHolder.css("border-color","white");
        //updateSegmentForm(seriesIndex+18,"remove")
    }
    changePlotLine(); //update the plotline
    //updateSegmentForm(); //update the segment forms

    setSelectedColor();
    circleBorderColor = thisCircle.css("stroke");
    //circleBorderWidth = thisCircle.css("stroke-width");
    thisCircle.css({"stroke":highLightColor,"stroke-width":5}).attr("id","hover")
    thisChipHolder.addClass("hover")
    borderColor = thisChipHolder.css("borderTopColor");
    thisChipHolder.css({"borderTopColor":highLightColor,"borderRightColor":highLightColor,"borderBottomColor":highLightColor,"borderLeftColor":highLightColor,});
}

//make the trajectory svg circles selectable - add vertices
//$(document).on("dblclick", "circle.data, .chipHolder.annual", function(e){ //need to use this style event binding for elements that don't exisit yet - these lines will run before the "circle" elements are created, alternatively could use the commented lines in the above jquery section
$(document).on("dblclick", "circle.data, .chipHolder", function(e){ //need to use this style event binding for elements that don't exisit yet - these lines will run before the "circle" elements are created, alternatively could use the commented lines in the above jquery section
    sessionInfo.isDirty = true;
    if($("tr").hasClass("active") === false){
        e.preventDefault(); //make sure that default browser behaviour is prevented
        var nodeType = $(this).prop('nodeName');
        if(nodeType === "circle"){
            var seriesIndex = $("circle.data").index(this);
        } else{
            var seriesIndex = $(".chipHolder").index(this);
        }
        //if(seriesIndex != 0 &&  seriesIndex != lastIndex){changeSelectedClass(seriesIndex);}
        changeSelectedClass(seriesIndex);
    }
});

function autoSelect(eventYear){
	// get focus year value 
	// change focus year value to index postion
	// add hover class to chip and hover id to circle
	// run changeSelectedClass with postion index

}

function fillInForm(){
    var len = selectThese.length;
    $('.segment, .vertex').remove();

    //fill in segment form
    for(var i=0;i<len-1;i++){
        var yearStart = vertInfo[i].year
        var yearEnd = vertInfo[i+1].year
        $("#segmentsFormTbl").append('<tr class="segment"><td class="highlightIt"><span class="glyphicon glyphicon-search"></span></td><td>'+yearStart+'</td><td>'+yearEnd+'</td><td class="changeProcessInput formDrop"></td></tr>');
        $(".changeProcessInput").eq(i).text(vertInfo[i+1].changeProcess.changeProcess)
    }
    //fill in vertex form
    for(i=0; i < len; i++){
        yearStart = vertInfo[i].year;
        $("#verticesFormTbl").append('<tr class="vertex"><td class="highlightIt"><span class="glyphicon glyphicon-search"></span></td><td>'+yearStart+'</td><td class="landUseInput formDrop lulc"></td><td class="landCoverInput formDrop lulc"></td></tr>');
        $(".landUseInput").eq(i).text(vertInfo[i].landUse.primary.landUse)
        $(".landCoverInput").eq(i).text(vertInfo[i].landCover.landCover)
    }
}

//function to sync the segments form to the selected vertices
function updateSegmentForm(seriesIndex, addRemove){
    if(addRemove == "add"){
        //figure out where to insert the new vertInfo object - compare the index of the selected year against those already selected and recorded in the vertInfo array
        for(var i=0;i<vertInfo.length;i++){
            if(vertInfo[i].index > seriesIndex){break} //where it breaks out is the index (i) to splice the new vertInfo object
        }

        //make a vertInfo object to splice into the vertInfo array
        var spliceVertInfo = {
            year:data.Values[seriesIndex].Year, //fill in for the selected point
            julday:data.Values[seriesIndex].doy,
            index:seriesIndex, //fill in for the selected point
            landUse:{
                primary:{
                    landUse:"",
                    notes:{
                        wetland:false,
                        mining:false,
                        rowCrop:false,
                        orchardTreeFarm:false,
                        vineyardsOtherWoody:false
                    }
                },
                secondary:{
                    landUse:"",
                    notes:{
                        wetland:false,
                        mining:false,
                        rowCrop:false,
                        orchardTreeFarm:false,
                        vineyardsOtherWoody:false
                    }
                }
            },
            landCover:{
                landCover:"",
                other:{
                    trees:false,
                    shrubs:false,
                    grassForbHerb:false,
                    impervious:false,
                    naturalBarren:false,
                    snowIce:false,
                    water:false
                }
            },
            changeProcess:{
                changeProcess:"",
                notes:{
                    natural:false,
                    prescribed:false,
                    sitePrepFire:false,
                    airphotoOnly:false,
                    clearcut:false,
                    thinning:false,
                    flooding:false,
                    reserviorLakeFlux:false,
                    wetlandDrainage:false
                }
            }
        }

        vertInfo.splice(i,0,spliceVertInfo) //splice the new vertInfo object into the vertInfo array at the location found above (i)
        selectThese.splice(i,0,seriesIndex) //insert the seriesIndex in the "selectThese" array so that highlighting and form filling reflects the change


    } else if(addRemove == "remove"){ //remove a vertex
        var thisVertIndex = selectThese.indexOf(seriesIndex); //get the vertexInfo array index of the selected point
        vertInfo.splice(thisVertIndex, 1); //remove the vertInfo object at the index found one line above
        selectThese.splice(thisVertIndex,1); //remove the series index from the selectThese array at the index found one line above
    }

    $(".segment").remove(); //empty the current segment form
    $(".vertex").remove(); //empty the current vertex form
    //fillInForm(); //append new forms and fill them in from the altered vertInfo array
}
//##########################################################


//##########################################################
// JDB added 2019-03-20    ^ ^ ^
//##########################################################
