	// path to tile mapping service
        var tilePath = "../data/tms_12";
        //var zoomTileMac = tilePath +"/tms/rgbTC/1995/";

	// data holders - init vars to hold the database information like polygon coordinates, display button optons, and storage for user inputs
        var res;
        var res_len;
        var evenTab ;
        var displayTab;
        var plotInfo = [];


	// This function get the event table database, data that has been labeled by a user, and stores it in memory.
	$.post( "./php/get_event_table.php", function(data) {
		data1 = "[" +data+ "]";
		data2 = data1.replace(/}{/g,"},{")
		evenTab = JSON.parse(data2);
	})


	// This function get the display table database, data that holds the label names, and stores it in memory.
	$.post( "./php/get_display_table.php", function(data) {
		data1 = "[" +data+ "]";
		data2 = data1.replace(/}{/g,"},{")
		displayTab = JSON.parse(data2);
	})

	// Here we get the polygon data from the database
	// process the data from the database into a readable format for the program. Then get the number of objects
	// in the data and append the each objects plot id to an array. Lastly, add the plots (objects) to the DOM 
	// with appendPlots().
	$.post( "./php/get_polygon_table.php", function(data) {

		// formating data
		data1 = "[" +data+ "]";
		data2 = data1.replace(/}{/g,"},{")
		res = JSON.parse(data2);

		// add Object's plot ids to array plotInfo
		res_len = Object.keys(res).length;
		for (i = 0; i < res_len; i++) {
		       plotInfo.push(res[i][1])
		}

		// adds plots to DOM
		
                const timeout = window.setTimeout(waiter,5000)
                function waiter(){appendPlots();$('#loader').hide();}



	})

	function openPopup() {
		// Define the URL of the popup content
		var popupURL = 'popup.html';

		// Open a new window with the specified URL
		var popupWindow = window.open(popupURL, 'PopupWindow', 'width=400,height=300');

		// Optionally, you can manipulate the content of the popup window
		if (popupWindow) {
			popupWindow.document.title = 'Popup Window';
			// You can access and modify the contents of the popup window's document here.
		} else {
			alert('Please enable pop-ups for this website to view the popup.');
		}
	}

