//define function to update the zoom behaviors


function zoomUpdate() {
    xyzoom = d3.behavior.zoom()
        .scaleExtent([1, 1])
        .y(yscale)
        .x(xscale)
        .on("zoom", zoomDraw);

    xzoom = d3.behavior.zoom()
        .x(xscale)
        .on("zoom", zoomDraw);
    yzoom = d3.behavior.zoom()
        .y(yscale)
        .on("zoom", zoomDraw);

    xybox.call(xyzoom).on("dblclick.zoom", null); //svg.
    xbox.call(xzoom).on("dblclick.zoom", null); //svg.
    ybox.call(yzoom).on("dblclick.zoom", null);	//svg.

    currentDomain[specIndex].min = xscale.domain()[0];
    currentDomain[specIndex].max = xscale.domain()[1];
    currentDomain[specIndex].min = yscale.domain()[0];
    currentDomain[specIndex].max = yscale.domain()[1];
    currentDomain.year.min = xscale.domain()[0];
    currentDomain.year.max = xscale.domain()[1];
    currentDomain.dirty = 1;
    /* YANG 2016.08.06
    Yang: 2016.08.31: warren want to change it back to always local stretch */
    currentDomain.hasCustomizedXY = 0;
    /**/
}

//define function to redraw the points and update the zoom behavior is invoked
function zoomDraw() {

    svg.select('.y.axis').call(yaxis);
    svg.selectAll("circle")
        .attr("cx", function (d) {
            return xscale(d.decDate);
        })
        .attr("cy", function (d) {
            return yscale(d[specIndex]);
        });
    //svg.selectAll("circle.data")
    //	.attr("cx", function(d){return xscale(d.decDate);})
    //	.attr("cy", function(d){return yscale(d[specIndex]);});
    //svg.selectAll("circle.allData")
    //	.attr("cx", function(d){return xscale(d.decDate);})
    //	.attr("cy", function(d){return yscale(d[specIndex]);});

    //draw the x axis - draw this afte the points so that their ticks marks don't draw over it
    svg.select('.x.axis').call(xaxis);


    svg.selectAll("#plotLine").attr("d", lineFunction(lineData));
    svg.selectAll(".vline")
        .attr("x1", function (d) {
            return xscale(d)
        }) //d.Year
        .attr("x2", function (d) {
            return xscale(d)
        }) //d.Year
    zoomUpdate();
};


var circleinfo;
//define function to initialize the spectral trajectory
var plotDrawn = 0; //global variable needed for the window resize
function plotInt() {
    plotDrawn = 1
    //get the range of the x values
    var showPoints = $("#allPointsDisplayThumb").hasClass("glyphicon-thumbs-down");
    if (showPoints == false) {
        var pointDisplay = "visible";
        var opacity = 1;
    } else {
        var pointDisplay = "hidden"
        var opacity = 1;
    }

    var w = $("#plot").width()

    //var yearmin = d3.min(data.Values, function(d) {return d.Year;});
    //var	yearmax = d3.max(data.Values, function(d) {return d.Year;});

    //var date = new Date();
    //var yearmin = 1982;
    //var yearmax = date.getFullYear()


    //adjust the ranges so there is some buffer

    //currentDomain.year.min = yearmin; //needs to be a global variable - for resetting the plot to defualt domain
    //currentDomain.year.max = yearmax+1; //needs to be a global variable - for resetting the plot to defualt domain
    //xmin = yearmin;
    //xmax = yearmax+1;


    //make an array of ticks and lables
    //var year //i think this is an abandoned line
    var xLabels = [];
    //for(var i=0;i<=yearmax-yearmin;i+=2){xLabels.push(yearmin+i+0.49)}
    for (var i = 0; i < defaultDomain.year.max - defaultDomain.year.min; i += 2) {
        xLabels.push(defaultDomain.year.min + i + 0.49)
    }

    //make an array of vertcal line x positions
    var xGrid = [];
    for (var i = defaultDomain.year.min; i <= defaultDomain.year.max; i++) {
        xGrid.push(i)
    }
    //for(var i=0;i<=currentDomain.year.max-currentDomain.year.min;i++){xGrid.push(currentDomain.year.min+i)}

    //define the width of the svg plot area
    //var w = 740,//
    var h = w/4;
    $("#svg").attr("height",h.toString()+"px")

    //define the plot margins
    var pt = 10, //plot top
        pr = 15, //plot right 15
        pl = 65, //plot left 65
        pb = 28; //plot bottom 37

    //define the x scale
    xscale = d3.scale.linear() //NEEDS TO BE A GLOBAL VARIABLE - IS USED HERE AND IN THE UPDATE FUNCTION
        .domain([currentDomain.year.min, currentDomain.year.max])
        .range([pl, w - pr]);

    //define the y scale
    yscale = d3.scale.linear() //NEEDS TO BE A GLOBAL VARIABLE - IS USED HERE AND IN THE UPDATE FUNCTION
        .domain([currentDomain[specIndex].min, currentDomain[specIndex].max]) //domain is a global variable defined in an outside .js file - specIndex is also global variable
        .range([h - pb, pt]);

    //define the x axis
    xaxis = d3.svg.axis()
        .scale(xscale)
        .orient("bottom")
        .tickValues(xLabels)
        .tickFormat(d3.format(".4r"))
        .outerTickSize(0);
    //.tickFormat(d3.format("d"));


    //define the x axis
    yaxis = d3.svg.axis() //NEEDS TO BE A GLOBAL VARIABLE - IS USED HERE AND IN THE UPDATE FUNCTION
        .tickSize((-w + pr + pl), 0)
        .scale(yscale)
        .orient("left");

    //define the zoom behavior
    xyzoom = d3.behavior.zoom()
        .scaleExtent([1, 1])
        .y(yscale)
        .x(xscale)
        .on("zoom", zoomDraw); //zoomed

    xzoom = d3.behavior.zoom()
        .x(xscale)
        .on("zoom", zoomDraw);
    yzoom = d3.behavior.zoom()
        .y(yscale)
        .on("zoom", zoomDraw);

    //retrieve the svg reference
    svg = d3.select("#svg");

    //make the default line data
    // lineData = [ //needs to be local variable
    // 	{"x":yearmin ,"y":data.Values[0][specIndex]},
    // 	{"x":yearmax ,"y":data.Values[len-1][specIndex]}
    // ];

    //make the line function to convert the xy object to svg path syntax////////=================================================
    lineFunction = d3.svg.line() //global because it gets used when selecting new points
        .x(function (d) {
            return xscale(d.x);
        })
        .y(function (d) {
            return yscale(d.y);
        })
        .interpolate("linear");

    //append an xy box
    xybox = svg.append("rect")
        .attr("class", "zoom xy box")
        .attr("id", "xybox")
        .attr("x", pl) //70
        .attr("y", pt) //10
        .attr("width", w - pl - pr)
        .attr("height", h - pt - pb)
        .style("visibility", "hidden")
        .attr("pointer-events", "all")
        .call(xyzoom)
        .on("dblclick.zoom", null)


    var vline = svg.selectAll(".vline")
        .data(xGrid) //.data(data.Values)
        .enter()
        .append("line")
        .attr("x1", function (d) {
            return xscale(d)
        }) //d.Year
        .attr("x2", function (d) {
            return xscale(d)
        }) //d.Year
        .attr("y1", function (d) {
            return -20000
        })
        .attr("y2", function (d) {
            return 20000
        })
        .attr("class", "vline")


    //.selectAll("text")
    //.attr("y", -10)
    //.attr("x", 12)
    //.attr("transform", "rotate(90)")

    //draw the y axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + pl + ",0)")
        .call(yaxis);

    //append all the points
    allCircles = svg.selectAll(".allData")
        .data(allData.Values)
        .enter()
        .append("circle")
        //.style("fill-opacity",0.25) //0.25
        .attr("visibility", pointDisplay) //"hidden"
        .style("fill", function (d, i) {
            return allDataRGBcolor[i];
        })
        .attr("cx", function (d) {
            return xscale(d.decDate);
        }) //d.decDate
        .attr("cy", function (d) {
            return yscale(d[specIndex]);
        })
        .attr("r", 3)
        .attr("class", "allData");

    //append the representative points
    var rad = w * 0.0085;
    circles = svg.selectAll(".data")
        .data(data.Values)
        .enter()
        .append("circle")
        .style("fill-opacity", opacity)
        .style("fill", function (d, i) {
            return rgbColor[i];
        })
        .attr("cx", function (d) {
            return xscale(d.decDate);
        })
        .attr("cy", function (d) {
            return yscale(d[specIndex]);
        })
        .attr("r", rad)
        .attr("class", "data unselected");

    //draw the x axis - draw this afte the points so that their ticks marks don't draw over it
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (h - pb) + ")")
        .call(xaxis)

    //add label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (h - pb) / -2)
        .attr("y", 15)
        .style("text-anchor", "middle")
        .text(ylabel) //"TC Wetness"
        .attr("id", "specPlotIndex");

    //define clip path so that circles don't go outside the axes
    svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 70)
        .attr("y", 10)
        .attr("width", w - pr - pl)
        .attr("height", h - pb - pt);

    //append an x box
    xbox = svg.append("rect")
        .attr("class", "zoom x box")
        .attr("id", "xbox")
        .attr("x", pl)
        .attr("y", h - pb)
        .attr("width", w - pl - pr)
        .attr("height", pb)
        .style("visibility", "hidden")
        .attr("pointer-events", "all")
        .call(xzoom)
        .on("dblclick.zoom", null)

    //append a y box
    ybox = svg.append("rect")
        .attr("class", "zoom y box")
        .attr("id", "ybox")
        .attr("y", pt)
        .attr("width", pl)
        .attr("height", h - pt - pb)
        .style("visibility", "hidden")
        .attr("pointer-events", "all")
        .call(yzoom)
        .on("dblclick.zoom", null)

    //append title for tooltips
    if ($("#toolTipsCheck").hasClass("glyphicon glyphicon-ok")) {
        d3.selectAll("circle.data").append("svg:title").text("This is an annual spectral time series point. It is the spectral return for the pixel at the plot center for the day selected to represent this year in the annual time series. Hovering over it will activate a green highlight outline that corresponds to the green highlight outline of the matched image chip in the chip gallery. The highlighting feature makes it easy to know which point belongs to which image chip. Doubling clicking the point will toggle it as a vertex. The first and last points cannot be toggled.")
        d3.selectAll("circle.allData").append("svg:title").text("This is an intra-annual spectral time series point. It is the spectral return for the pixel at the plot center for one of all days selected to represent a year in the annual time series. It will be highlighted blue when hovering over an image chip in the intra-annual chip window as a correspondence marking feature. These points are helpful for determining the intra-annual variability of plots and can help make a more informed decision about whether to place a vertex or change the default annual point/image chip.")
        d3.selectAll("#xbox").append("svg:title").text("This is the x-axis. Click and hold to drag the scale to the left or right and mouse wheel to zoom in and out.")
        d3.selectAll("#ybox").append("svg:title").text("This is the y-axis. Click and hold to drag the scale up or down and mouse wheel to zoom in and out.")
    } else {
        d3.selectAll("circle.data").append("svg:title").text("")
        d3.selectAll("circle.allData").append("svg:title").text("")
        d3.selectAll("#xbox").append("svg:title").text("")
        d3.selectAll("#ybox").append("svg:title").text("")
    }

    //default the first and last circles to class "selected"===========================///
    var dataCircles = $("circle.data");
    for (var i = 0; i < selectThese.length; i++) {
        //dataCircles.eq([7]).attr("class", "data selected");
        //lineData.push({"x":data.Values[7].decDate ,"y":10}) // changed from below to this peter 3/1 ******************************
        //lineData.push({"x":data.Values[selectThese[i]].decDate ,"y":data.Values[selectThese[i]].decDate}) //.Year

    }


    //add the default line
    var lineGraph = svg.append("path") //local because it will get overwritten
        .attr("d", lineFunction(lineData))
        //.style("stroke", $("#selectedColor").prop("value"))
        .attr("id", "plotLine");

    //Define the svg text element for the DOY tooltip
    var doyTxt = svg.append("text")
        .attr("id", "doyTxt")
        .attr("text-anchor", "middle")
        .style("opacity", 0);

    $.event.special.rightclick = {
        bindType: "contextmenu",
        delegateType: "contextmenu"
    };


    //show doy on hover
    allCircles.on("mouseover", function (d) {
        doyTxt.text(d.circl)
            .attr("x", xscale(d.decDate))
            .attr("y", yscale(d[specIndex]) - 10)
            .style("opacity", 1);
    })
        .on("mouseout", function (d) {
            doyTxt.style("opacity", 0);

        });


    //show doy on hover
    circles.on("mouseover", function (d) {
        doyTxt.text(d.Year)
            .attr("x", xscale(d.decDate))
            .attr("y", yscale(d[specIndex]) - 20)
            .style("opacity", 1);
    })


        .on("mouseout", function (d) {
            doyTxt.style("opacity", 0);
        });




    //add the path to the circles to activate the clipping
    circles.attr("clip-path", "url(#clip)");
    allCircles.attr("clip-path", "url(#clip)");
    lineGraph.attr("clip-path", "url(#clip)");
    vline.attr("clip-path", "url(#clip)");


    //dataCircles.eq(0).attr("class","data selected");
    //dataCircles.eq(len-1).attr("class","data selected");

    //fill in the global selectedCircles variable for the first time
    var selectedCirclesTemp = $("circle.data.selected");
    for (var i = 0; i < selectedCirclesTemp.length; i++) {
        selectedCircles.push(dataCircles.index(selectedCirclesTemp[i]));
    }
    setSelectedColor(); //set the selected color of the line and the circles
    //updateSegmentForm();

    //if the line and vertices are set to "no show" then make them transparent
    if ($("#lineDisplayThumb").attr("class") === "glyphicon glyphicon-thumbs-down") {
        $("circle.selected").css("stroke-opacity", "0");
        $("circle.highlight").css("stroke-opacity", "0");
        $("#plotLine").css("stroke-opacity", "0");
    }


}


//define function to update the D3 scatterplot when new selection are made
function plotUpdate(data, specIndex, rgbColor, currentDomain) {

    
    //reset the y domain based on new spectral index
    yscale.domain([currentDomain[specIndex].min, currentDomain[specIndex].max]); //yscale was defined in the plotInt function

    //update the zoom since the y axis domain has changed
    zoomUpdate()

    //update the circles with new data
    svg.selectAll("circle.allData") //svg was defined in the plotInt function
        .data(allData.Values)
        .transition()
        .duration(500)
        //.attr("cx", function(d){return xscale(d.decDate);})
        .attr("cy", function (d) {
            return yscale(d[specIndex]);
        })
        .style("fill", function (d, i) {
            return allDataRGBcolor[i]
        })

    svg.selectAll("circle.data") //svg was defined in the plotInt function
        .data(data.Values)
        .transition()
        .duration(500)
        //.attr("cx", function(d){return xscale(d.decDate);})
        .attr("cy", function (d) {
            return yscale(d[specIndex]);
        })
        .style("fill", function (d, i) {
            return rgbColor[i]
        })

    //make a new line======================================================
    for (var i = 0; i < selectedCircles.length; i++) {
        var thisone = selectedCircles[i];
        lineData[i] = ({"x": data.Values[thisone].decDate, "y": data.Values[thisone][specIndex]}); //.push
    }

    //update the line
    svg.selectAll("#plotLine") //local because it will get overwritten
        .transition()
        .duration(500)
        .attr("d", lineFunction(lineData));

    //update y axis
    svg.select(".y.axis") //svg was defined in the plotInt function
        .transition()
        .duration(500)
        .call(yaxis);
}

function updatePlotRGB() {
    svg.selectAll("circle.data") //svg was defined in the plotInt function
        .transition()
        .duration(500)
        .style("fill", function (d, i) {
            return rgbColor[i]
        })

    svg.selectAll("circle.allData") //svg was defined in the plotInt function
        .transition()
        .duration(500)
        .style("fill", function (d, i) {
            return allDataRGBcolor[i]
        })
}

function changePlotPoint() {
    svg.selectAll("circle.data") //svg was defined in the plotInt function
        .data(data.Values) //data value changed so need to rebind the data
        .transition()
        .duration(500)
        .attr("cx", function (d) {
            return xscale(d.decDate);
        })
        .attr("cy", function (d) {
            return yscale(d[specIndex]);
        })
        .style("fill", function (d, i) {
            return rgbColor[i]
        })

    //make a new line in case the point is also a vertex
    lineData = [];
    for (var i = 0; i < selectedCircles.length; i++) {
        var thisone = selectedCircles[i];
        lineData.push({"x": data.Values[thisone].decDate, "y": data.Values[thisone][specIndex]})
        //lineData[i] = ({"x":data.Values[thisone].decDate, "y":data.Values[thisone][specIndex]}); //.push
    }
    //update the line
    svg.selectAll("#plotLine")
        .transition()
        .duration(500)
        .attr("d", lineFunction(lineData));
}


// //define function to add and remove line segments     ///// all marked out Peter 3/1---------------------------------------------------------
function changePlotLine() {
    var selectedCirclesTemp = $("circle.selected");
    lineData = []; //reset lineData
    selectedCircles = []; //reset selectedCircles
    for (var i = 0; i < selectedCirclesTemp.length; i++) {
        var thisone = $("circle.data").index(selectedCirclesTemp[i]);
        selectedCircles.push(thisone);
        lineData.push({"x": data.Values[thisone].decDate, "y": data.Values[thisone][specIndex]});  //  changed to below peter 3/1
        //lineData.push({"x":data.Values[7].decDate, "y":10});
    }

    $("#plotLine").remove(); //remove the line

    lineGraph = svg.append("path") //redraw the line
        .attr("d", lineFunction(lineData))
        .attr("id", "plotLine")
        .attr("clip-path", "url(#clip)");

    //updateSegmentForm();
}


function globalStretch() {
    svg.call(xzoom
        .x(xscale.domain([defaultDomain.year.min, defaultDomain.year.max])) //xmin and xmax are global variables that are set in the "plotInt" function
        .y(yscale.domain([defaultDomain[specIndex].min, defaultDomain[specIndex].max])) //domain is javascript object that comes from an outside file
        .event);
    svg.call(yzoom
        .x(xscale.domain([defaultDomain.year.min, defaultDomain.year.max])) //xmin and xmax are global variables that are set in the "plotInt" function
        .y(yscale.domain([defaultDomain[specIndex].min, defaultDomain[specIndex].max])) //domain is javascript object that comes from an outside file
        .event);
}


function localStretch() {
    var localMin = d3.min(data.Values, function (d) {
        return d[specIndex];
    }); //get the local min
    var localMax = d3.max(data.Values, function (d) {
        return d[specIndex];
    }); //get the local max
    var buffer = (localMax - localMin) * 0.1; //calulate a buffer to add to the min and max so that the point is not cut off
    localMin -= buffer; //adjust the min by the buffer
    localMax += buffer; //adjust the max by the buffer

    currentDomain[specIndex].min = localMin; //set the currentDomain min for the specIndex
    currentDomain[specIndex].max = localMax; //set the currentDomain max for the specIndex

    svg.call(xzoom
        .x(xscale.domain([defaultDomain.year.min, defaultDomain.year.max])) //xmin and xmax are global variables that are set in the "plotInt" function
        .y(yscale.domain([currentDomain[specIndex].min, currentDomain[specIndex].max])) //domain is javascript object that comes from an outside file
        .event);
    svg.call(yzoom
        .x(xscale.domain([defaultDomain.year.min, defaultDomain.year.max])) //xmin and xmax are global variables that are set in the "plotInt" function
        .y(yscale.domain([currentDomain[specIndex].min, currentDomain[specIndex].max])) //domain is javascript object that comes from an outside file
        .event);
}
