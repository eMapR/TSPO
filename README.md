Time Sync Plus (TS+)
====================

**Time Sync Plus (TS+)** is a web-based application for visualizing and attributing vector data using satellite imagery and spectral time series. It is designed to support image interpretation workflows used in monitoring landscape change detection, and quality assurance.

Features
-----------

*   Interactive plot-based interpretation of Landsat time series
    
*   Side-by-side comparison with high-resolution NAIP imagery
    
*   Custom attribution using dropdowns, sliders (Dial), proportional inputs (Prop), and comment fields
    
*   Local or remote storage and retrieval of plot-level attribution using SQLite
    
*   User session tracking based on IP address and user name
    
*   Support for re-evaluation workflows (QA/QC and training)
    

Technologies Used
--------------------

*   **Frontend**: HTML, CSS (Bootstrap), JavaScript (jQuery, D3, Leaflet)
    
*   **Backend**: PHP
    
*   **Database**: SQLite
    
*   **Data Processing**: Python (with GDAL and Earth Engine API)
    

Project Structure
--------------------

TSPO/  
├── data/          # SQLite databases (created from polygons)  
├── db/          # SQLite databases (created from polygons)  
├── json/        # GeoJSON vector data exported from GEE  
├── tms/         # Tile Mapping Service (TMS) output from Landsat/NAIP imagery  
├── index.html   # Main TS+ web interface  
├── js/          # Client-side JavaScript scripts  
├── php/         # Backend logic (session, DB I/O)  
└── ...   `

Application Setup
--------------------

### 1\. Sample Project

Use the tspo\_expo/ folder as a template for your own project. It includes subfolders for data, a sample config file, and placeholder imagery.

### 2\. Getting Data from Google Earth Engine (GEE)

#### Step-by-step Guide

Use the [**GEE Download Guide**](https://docs.google.com/document/d/1WHB4dLyNp7HPP0HzTNYDuahF72p4uu0iXMqxSVk8x1U/edit?usp=sharing) to:

*   Export vector plots (GeoJSON)
    
*   Export multi-band annual Landsat composites (RGB654, RGB543, RGB432, RGBTC)
    

In the GEE download guide above, you'll get instructions to set up: 

*   Earth Engine API 
    
*   ltgee package
    
*   A working Python environment (conda create -n tspo\_env python=3.10)
    

### 3\. Processing Data

#### Database Creation

Generate a local SQLite database using your GeoJSON and a config.json file.

python 01_geojsonToDB.py <path/to/project_directory> <project_name>

See the [**Database Setup Guide**](https://docs.google.com/document/d/1683P2U8Tjl44f7DtZCGS2aevfe6RxPncGUj4Dvv_5bk/edit?usp=sharing) for detailed instructions.

#### TMS (Tile Mapping Service) Creation

Generate web tiles for Landsat or high-resolution imagery:

python genTMS.py <rasterPath> <start_year> <end_year> <zoom_min> <zoom_max> <epsg>

Example:

python genTMS.py /full/path/to/data/tspo_expo/tms/ 1995 2024 9 16 "EPSG:4326"

See the [**TMS Setup Guide**](https://docs.google.com/document/d/1So7F4NMLxInFoV7QiWdKFt7wowkbC6uPCpWl6Og-OLo/edit?usp=sharing) for details.

 Next Steps
------------

Once data and tiles are ready, launch the application by opening index.html in a browser, or configure it to run on a local server with PHP support.

For advanced configuration, attribution logic, and developer notes, see the docs/ folder or explore the [**Application Usage Guide**](https://docs.google.com/document/d/1-R2A7ExPWgqbcEtv_K0S2JDQxJecmK7ruWzZ7Bcswwk/edit?usp=sharing).
