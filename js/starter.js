// Set up TSPO global state from URL parameters
TSPO.DataLoader.state.db_path = db_path;
TSPO.DataLoader.state.tilePath = tilePath;
TSPO.DataLoader.state.highRes = highRes;

// Load data and render plots when ready
TSPO.DataLoader.load(function (state) {
    //appendPlots();           // render plot list
    $('#loader').hide();     // hide spinner
});
