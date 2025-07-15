#https://docs.google.com/document/d/1WHB4dLyNp7HPP0HzTNYDuahF72p4uu0iXMqxSVk8x1U/edit?usp=sharing
import time
import ee
import sys
import os
import subprocess
from ltgee import LandTrendr, LandsatComposite, LtCollection
from datetime import date
import json
from multiprocessing import Pool

projectDir = sys.argv[1]
# Load configuration
with open(projectDir+'/00_config.json', 'r') as f:
    CONFIG = json.load(f)

ee.Authenticate()
ee.Initialize(project=CONFIG['project'])

startYear = CONFIG['startYear']
endYear = CONFIG['endYear']
startDay = CONFIG['startDay']
startMonth = CONFIG['startMonth']
endDay = CONFIG['endDay']
endMonth = CONFIG['endMonth']
featureCol = CONFIG['featureCollection']
aoiBuffer = CONFIG['aoiBuffer']
buffer_featrue = CONFIG['bufferFeature']
print(CONFIG)
###########################
# read in landtrendr.py module
##########################
def export_featurecollection_to_drive(feature_collection, filename, folder='GeoExports', description='Exported FeatureCollection'):
    """
    Export an Earth Engine FeatureCollection as a GeoJSON file to Google Drive.

    Parameters:
        feature_collection (ee.FeatureCollection): The FeatureCollection to export.
        filename (str): The name of the exported file (without the extension).
        folder (str): The folder in Google Drive where the file will be saved. Default is 'GeoExports'.
        description (str): A human-readable name for the export task.

    Returns:
        ee.batch.Task: The export task.
    """
    task = ee.batch.Export.table.toDrive(
        collection=feature_collection,
        description=description,
        folder=folder,
        fileNamePrefix=filename,
        fileFormat='GeoJSON'
    )
    task.start()
    print(f"Export task started with ID: {task.id}")
    return task

def export_image_to_assets(image, filename, region, scale, description='Exported Image', pyramiding_policy='MEAN', max_pixels=1e13):
    """
    Export an Earth Engine image to Assets.

    Parameters:
        image (ee.Image): The image to export.
        asset_id (str): The full path to the asset location where the image will be saved.
        region (list): A GeoJSON-like list defining the export region in WGS84 coordinates.
        scale (float): The scale in meters for the export.
        description (str): A human-readable name for the export task.
        pyramiding_policy (str): Pyramiding policy to use for the export. Default is 'MEAN'.
        max_pixels (float): The maximum number of pixels to allow in the export. Default is 1e13.

    Returns:
        ee.batch.Task: The export task.
    """
    task = ee.batch.Export.image.toDrive(
        image=image,
        description=description,
        folder=CONFIG['exportFolder'],  # Name of the folder in Google Drive
        fileNamePrefix=filename,  # File name prefix
        scale=30,  # Spatial resolution in meters
        maxPixels=1e13  # Maximum number of pixels allowed
    )
    task.start()
    print(f"Export task started with ID: {task.id}")
    return task

def process_image(image_id, feature_collection_id, crs, output_path):

    def adjust_grid(feature):
        return ee.Feature(feature.geometry().intersection(feature_collection_id,1))


    # Load the image.
    image = image_id

    # Load the feature collection and filter.
    tiles = ee.FeatureCollection(feature_collection_id).geometry().coveringGrid(crs,6500)
    # Map the function over the feature collection
    #tiles = ee.FeatureCollection(tiles.map(adjust_grid))
    numberOfFeatures = tiles.size().getInfo()
    print(numberOfFeatures)
    # Define download parameters
    params = {
        'scale': 30,
        'crs': crs,
        'format': 'GeoTIFF'
    }

    # Function to clip the image by each feature
    def clip_image(f):
        return image.clip(f)

    # Map over the tiles to clip the image
    clipped_images = tiles.map(clip_image)
    imageList = ee.ImageCollection(clipped_images).toList(numberOfFeatures)


    # Create a tuple list for each image to be processed
    args_list = [(i, imageList, params, output_path) for i in range(numberOfFeatures)]

    # Use multiprocessing.Pool to download images in parallel
    with Pool(25) as pool:
        pool.map(download_image, args_list)


def process_band_name(e):
    sp = ee.String(e).split('_')
    yr = ee.Number.parse(sp.get(0)).add(startYear)
    return ee.String(ee.Number(yr).format()).cat("_").cat(sp.get(1))



def generate_year_list(start_year, end_year, index):
    year_list = []
    for year in range(start_year, end_year + 1):
        year_list.append(f"{index}_ftv_{year}")
    return year_list

def set_uniqID(e):
    newValue = ee.Number(e.get('uniqID')).multiply(100000000).int()
    return e.set('uniqID', newValue)
    #return e

def sr_visualize654(img):
    img = getLC08bands(img)
    visualization = img.visualize(bands=['B6', 'B5', 'B4'],
                                  min=[100, 151, 0],
                                  max=[4500, 4951, 2500],
                                  gamma=[1, 1, 1])
    return visualization.set(setVisMetadata(img))

def sr_visualize543(img):
    img = getLC08bands(img)
    visualization = img.visualize(bands=['B5', 'B4', 'B3'],
                                  min=[151, 0, 50],
                                  max=[4951, 2500, 2500],
                                  gamma=[1, 1, 1])
    return visualization.set(setVisMetadata(img))

def sr_visualize432(img):
    img = getLC08bands(img)
    visualization = img.visualize(bands=['B4', 'B3', 'B2'],
                                  min=[0, 50, 50],
                                  max=[2500, 2500, 2500],
                                  gamma=[1, 1, 1])
    return visualization.set(setVisMetadata(img))

def sr_visualizeTC(img):
    visualization = img.visualize(bands=['TCB', 'TCG', 'TCW'],
                                  min=[604, -49, -2245],
                                  max=[5592, 3147, 843],
                                  gamma=[1, 1, 1])
    return visualization.set(setVisMetadata(img))

def setVisMetadata(img):
    return {
	'composite_year': img.get('composite_year'),
        'filler': img.get('filler'),
        'harmonized_to': img.get('harmonized_to'),
        'topo_correction': img.get('topo_correction'),
        'system:index': img.get('system:index'),
        'system:time_start': img.get('system:time_start'),
        # Uncomment the following line if needed
        # 'system:annotations': ['test', 10, 10]
    }

def tc_transform(img):
    orig_img = img
    img = getLC08bands(img)
    b = ee.Image(img).select(["B2", "B3", "B4", "B5", "B6", "B7"])
    brt_coeffs = ee.Image.constant([0.2043, 0.4158, 0.5524, 0.5741, 0.3124, 0.2303])
    grn_coeffs = ee.Image.constant([-0.1603, -0.2819, -0.4934, 0.7940, -0.0002, -0.1446])
    wet_coeffs = ee.Image.constant([0.0315, 0.2021, 0.3102, 0.1594, -0.6806, -0.6109])
    
    sum_reducer = ee.Reducer.sum()
    brightness = b.multiply(brt_coeffs).reduce(sum_reducer)
    greenness = b.multiply(grn_coeffs).reduce(sum_reducer)
    wetness = b.multiply(wet_coeffs).reduce(sum_reducer)
    angle = greenness.divide(brightness).atan().multiply(ee.Number(180).divide(ee.Number(3.141592653589793))).multiply(100)
    
    tc = brightness.addBands(greenness).addBands(wetness).addBands(angle).select([0, 1, 2, 3], ['TCB', 'TCG', 'TCW', 'TCA'])
    
    return orig_img.addBands(tc)

def getLC08bands(img):
    return ee.Image(ee.Algorithms.If(
        ee.Algorithms.IsEqual(img.get('band_names'), ee.String('LC08')),
        img.select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7']),
        img.select(['B1', 'B2', 'B3', 'B4', 'B5', 'B7'], ['B2', 'B3', 'B4', 'B5', 'B6', 'B7'])
    ))


def main(startYear):
    outdir = ""
    featureValues = [0,1,2,3,4,5,6,7,8,9]
    #featureCol = "projects/ee-msime-ensemble-inputs/assets/ensembleInterpPoints_1000Per6Stratum_Laos"
    featureCol = CONFIG['featureCollection']
    featureKey = 'name'
    
    endYear = CONFIG['endYear']
    aoiBuffer = CONFIG['aoiBuffer']
    buffer_featrue = CONFIG['bufferFeature']

    if buffer_featrue:
        # Assuming featureValues and other required variables are defined earlier in the script
        aoi = ee.FeatureCollection(featureCol) \
            .geometry() \
            .buffer(aoiBuffer)
    else:
        # Assuming featureValues and other required variables are defined earlier in the script
        aoi = ee.FeatureCollection(featureCol) \
            .geometry() \
            .bounds() \
            .buffer(aoiBuffer)

    composite_params = {
        "start_date": date(startYear, startMonth,startDay),
        "end_date": date(endYear, endMonth,endDay),
        "area_of_interest": aoi, # this is geometry this could be an issuse
        "mask_labels": CONFIG['maskLabels'],
        "debug": True
    }
    print(composite_params)
    lt_collection_params = {
        "sr_collection": LandsatComposite(**composite_params),
        # "sr_collection": composite_params, # - you may also just pass in your own collection or the params directly. Note: in the former, some methods in the class may not work.
        "index": 'NBR', # not used 
        "ftv_list": ['TCB', 'TCG', 'TCW', 'NBR'], # not used 
    }
    lt_params = { # not used 
        "lt_collection": LtCollection(**lt_collection_params),
        # "lt_collection": lt_collection_params, # - you may also just pass in your own collection or the params directly. Note: in the former, some methods in the class may not work.
        "run_params": {
            "maxSegments": 6,
            "spikeThreshold": 0.9,
            "vertexCountOvershoot":  3,
            "preventOneYearRecovery":  True,
            "recoveryThreshold":  0.25,
            "pvalThreshold":  .05,
            "bestModelProportion":  0.75,
            "minObservationsNeeded": 6,
        }
    }

    lt = LandTrendr(**lt_params)
    lt.area_of_interest = aoi.bounds()
    lt = LandTrendr(**lt_params)
    annualSR = lt.lt_collection.sr_collection
    ann = annualSR.toBands()
    bandnames = ann.bandNames()
    name_slice = bandnames.map(process_band_name)

    summary = annualSR.toBands().unmask(-9999).rename(name_slice) \
        .reduceRegions(
            collection=featureCol,
            reducer=ee.Reducer.mean(),
            scale=30,
            crs="EPSG:3857",
            tileScale=4
    ).randomColumn("uniqID")

    summary = summary.map(set_uniqID)

    rgbTC = annualSR.map(tc_transform).map(sr_visualizeTC).toBands().clip(aoi).unmask()
    rgb654 = annualSR.map(sr_visualize654).toBands().clip(aoi).unmask()
    rgb543 = annualSR.map(sr_visualize543).toBands().clip(aoi).unmask()
    rgb432 = annualSR.map(sr_visualize432).toBands().clip(aoi).unmask()

    # Call the function
    task = export_image_to_assets(
        image=rgbTC,
        filename= "rgbTC",
        region=aoi,
        scale=30,
        description="rgbTC",
        pyramiding_policy='MEAN'
    )

    # Call the function
    task = export_image_to_assets(
        image=rgb654,
        filename= "rgb654",
        region=aoi,
        scale=30,
        description="rgb654",
        pyramiding_policy='MEAN'
    )
    # Call the function
    task = export_image_to_assets(
        image=rgb543,
        filename= "rgb543",
        region=aoi,
        scale=30,
        description="rgb543",
        pyramiding_policy='MEAN'
    )
    # Call the function
    task = export_image_to_assets(
        image=rgb432,
        filename= "rgb432",
        region=aoi,
        scale=30,
        description="rgb432",
        pyramiding_policy='MEAN'
    )

    task = export_featurecollection_to_drive(summary, filename=CONFIG['geoExport'], folder=CONFIG['exportFolder'])

main(CONFIG['startYear'])
