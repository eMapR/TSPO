// core/dataLoader.js
window.TSPO = window.TSPO || {};

TSPO.DataLoader = (function () {
    const state = {
        evenTab: [],
        displayTab: [],
        res: [],
        res_len: 0,
        plotInfo: [],
        db_path: null,
        readyFlags: {
            events: false,
            display: false,
            polygons: false
        }
    };

    function checkReady() {
        if (state.readyFlags.events && state.readyFlags.display && state.readyFlags.polygons) {
            appendPlots();
            $('#loader').hide();
        }
    }

    function load(callback) {
        if (!state.db_path) {
            console.error("Database path not set in state.db_path");
            return;
        }

        // Load event table
        $.ajax({
            type: "POST",
            url: "./php/get_event_table.php",
            data: { path: state.db_path },
            dataType: "json",
            success: function (rows) {
                state.evenTab = rows;
                state.readyFlags.events = true;
                checkReady();
                if (callback) callback(state);
            },
            error: function (xhr, status, error) {
                console.error("Error loading event table:", error);
            }
        });

        // Load display table
        $.ajax({
            type: "POST",
            url: "./php/get_display_table.php",
            data: { path: state.db_path },
            dataType: "json",
            success: function (rows) {
                state.displayTab = rows;
                state.readyFlags.display = true;
                checkReady();
                if (callback) callback(state);
            },
            error: function (xhr, status, error) {
                console.error("Error loading display table:", error);
            }
        });

        // Load polygon table
        $.ajax({
            type: "POST",
            url: "./php/get_polygon_table.php",
            data: { path: state.db_path },
            dataType: "json",
            success: function (rows) {
                state.res = rows;
                state.res_len = rows.length;
                state.plotInfo = rows.map(r => r.plotid || r[1]); // Adjust as needed
                state.readyFlags.polygons = true;
                checkReady();
                if (callback) callback(state);
            },
            error: function (xhr, status, error) {
                console.error("Error loading polygon table:", error);
            }
        });
    }

    return {
        load: load,
        state: state
    };
})();
