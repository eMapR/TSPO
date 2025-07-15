from osgeo import gdal
from glob import glob
import os
import subprocess
import sys
from multiprocessing import Pool

class TileProcessor:

    def __init__(self, img_path, start_year, end_year, min_zoom, max_zoom, epsg):
        self.img_path = img_path
        self.dir_path = os.path.dirname(img_path)
        self.start_year = int(start_year)
        self.end_year = int(end_year)
        self.min_zoom = min_zoom
        self.max_zoom = max_zoom
        self.file_name = os.path.basename(self.img_path)
        self.name = os.path.splitext(self.file_name)[0]
        self.epsg = epsg

    def mosaic_files(self, files, bands, vrt_file):
        # Corrected: use -separate and direct file input (no input_file_list)
        input_file = files[0]
        bands_option = ' '.join(['-b ' + str(b) for b in bands])
        cmd = f'gdalbuildvrt -q -separate {bands_option} {vrt_file} {input_file}'
        print("Running:", cmd)  # For debugging
        subprocess.call(cmd, shell=True)

    def process(self, cmd):
        print("Executing:", cmd)
        subprocess.call(cmd, shell=True)

    def make_tiles(self, fn, folder, zoom1, zoom2, epsg):
        cmd = f'gdal2tiles.py --processes 10 -s {epsg} -q -z {zoom1}-{zoom2} {fn} {folder}'
        return cmd

    def get_band_list(self, fn):
        src = gdal.Open(fn, gdal.GA_ReadOnly)
        return [list(range(i, i + 3)) for i in range(1, src.RasterCount, 3)]

    def make_dir(self, folder):
        if not os.path.exists(folder):
            os.makedirs(folder)

    def process_years(self):
        matched_files = glob(self.img_path + "*.tif")

        if not matched_files:
            print("No TIFF files found in the specified directory.")
            return

        for source_file in matched_files:
            source_name = os.path.splitext(os.path.basename(source_file))[0]
            bands_list = self.get_band_list(source_file)

            # Automatically derive years from bands if needed
            num_years = len(bands_list)
            years = range(self.start_year, self.start_year + num_years)

            cmd_list = []

            for year, bands in zip(years, bands_list):
                this_dir = os.path.join(self.dir_path, 'tms', source_name, str(year))
                this_vrt = os.path.join(this_dir, 'rgbIMG.vrt')
                self.make_dir(this_dir)

                self.mosaic_files([source_file], bands, this_vrt)
                cmd_list.append(self.make_tiles(this_vrt, this_dir, self.min_zoom, self.max_zoom, self.epsg))

            with Pool(1) as p:
                p.map(self.process, cmd_list)
def main():
    if len(sys.argv) != 7:
        print("Usage: script.py <rasterPath> <start_year> <end_year> <zoom_min> <zoom_max> <epsg>")
        sys.exit(1)

    img_path, start_year, end_year, zoom1, zoom2, epsg = sys.argv[1:7]
    processor = TileProcessor(img_path, start_year, end_year, zoom1, zoom2, epsg)
    processor.process_years()

if __name__ == '__main__':
    main()
