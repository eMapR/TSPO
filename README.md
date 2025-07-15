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

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   bashCopyEdittspo_expo/  ├── db/          # SQLite databases (created from polygons)  ├── json/        # GeoJSON vector data exported from GEE  ├── tms/         # Tile Mapping Service (TMS) output from Landsat/NAIP imagery  ├── 00_config.json  ├── index.html   # Main TS+ web interface  ├── js/          # Client-side JavaScript scripts  ├── php/         # Backend logic (session, DB I/O)  └── ...   `

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

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`bashCopyEditpython 01_geojsonToDB.py`  

See the [**Database Setup Guide**](#) for detailed instructions.

#### 🌐 TMS (Tile Mapping Service) Creation

Generate web tiles for Landsat or high-resolution imagery:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`bashCopyEditpython genTMS.py`      

Example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   bashCopyEditpython genTMS.py ./tms/ 1995 2024 9 16 "EPSG:4326"   `

See the [**TMS Setup Guide**](#) for details.

✅ Next Steps
------------

Once data and tiles are ready, launch the application by opening index.html in a browser, or configure it to run on a local server with PHP support.

For advanced configuration, attribution logic, and developer notes, see the docs/ folder or explore the [**Application Usage Guide**](#).
