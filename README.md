Time Sync Plus (TS+)
====================

**Time Sync Plus (TS+)** is a web-based application for attributing land cover change using satellite imagery and spectral time series. It is designed to support image interpretation workflows used in forest disturbance monitoring, landscape change detection, and quality assurance.

🚀 Features
-----------

*   Interactive plot-based interpretation of Landsat time series
    
*   Side-by-side comparison with high-resolution NAIP imagery
    
*   Custom attribution using dropdowns, sliders (Dial), proportional inputs (Prop), and comment fields
    
*   Local storage and retrieval of plot-level attribution using SQLite
    
*   User session tracking based on IP address
    
*   Support for re-evaluation workflows (QA/QC and training)
    

🧰 Technologies Used
--------------------

*   **Frontend**: HTML, CSS (Bootstrap), JavaScript (jQuery, D3, Leaflet)
    
*   **Backend**: PHP
    
*   **Database**: SQLite
    
*   **Data Processing**: Python (with GDAL and Earth Engine API)
    

📁 Project Structure
--------------------

tspo_expo/  
├── db/          # SQLite databases (created from polygons)  
├── json/        # GeoJSON vector data exported from GEE  
├── tms/         # Tile Mapping Service (TMS) output from Landsat/NAIP imagery  
├── index.html   # Main TS+ web interface  
├── js/          # Client-side JavaScript scripts  
├── php/         # Backend logic (session, DB I/O)  
└── ...   `

📦 Application Setup
--------------------

### 1\. Sample Project

Use the tspo\_expo/ folder as a template for your own project. It includes subfolders for data, a sample config file, and placeholder imagery.

### 2\. Getting Data from Google Earth Engine (GEE)

#### 📜 Step-by-step Guide

Use the [**GEE Download Guide**](#) to:

*   Export vector plots (GeoJSON)
    
*   Export multi-band annual Landsat composites (RGB654, RGB543, RGB432, RGBTC)
    

You’ll need:

*   Earth Engine API installed
    
*   ltgee package
    
*   A working Python environment (conda create -n tspo\_env python=3.10)
    

### 3\. Processing Data

#### 🗂️ Database Creation

Generate a local SQLite database using your GeoJSON and a config.json file.

python 01_geojsonToDB.py <path/to/project_directory> <project_name>

See the [**Database Setup Guide**](#) for detailed instructions.

#### 🌐 TMS (Tile Mapping Service) Creation

Generate web tiles for Landsat or high-resolution imagery:

python genTMS.py <rasterPath> <start_year> <end_year> <zoom_min> <zoom_max> <epsg>

Example:

python genTMS.py /full/path/to/data/tspo_expo/tms/ 1995 2024 9 16 "EPSG:4326"

See the [**TMS Setup Guide**](#) for details.

✅ Next Steps
------------

Once data and tiles are ready, launch the application by opening index.html in a browser, or configure it to run on a local server with PHP support.

For advanced configuration, attribution logic, and developer notes, see the docs/ folder or explore the [**Application Usage Guide**](#).
