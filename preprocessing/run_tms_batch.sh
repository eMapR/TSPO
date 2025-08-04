#!/bin/bash

# Base path
BASE_DIR="/vol/v1/TSPO/data/peder"

# Constant parameters
START_YEAR=1990
END_YEAR=2024
MONTH=9
DAY=16
EPSG="EPSG:4326"

# List of asset folders
FOLDERS=(
  tspo_peder_assets_103600 tspo_peder_assets_125800 tspo_peder_assets_148000 tspo_peder_assets_177600 tspo_peder_assets_201600 tspo_peder_assets_48100 tspo_peder_assets_74000
  tspo_peder_assets_107300 tspo_peder_assets_129500 tspo_peder_assets_151700 tspo_peder_assets_18500  tspo_peder_assets_203500 tspo_peder_assets_51800 tspo_peder_assets_77700
  tspo_peder_assets_11100  tspo_peder_assets_133200 tspo_peder_assets_155400 tspo_peder_assets_185000 tspo_peder_assets_22200  tspo_peder_assets_59200 tspo_peder_assets_81400
  tspo_peder_assets_114000 tspo_peder_assets_136900 tspo_peder_assets_159100 tspo_peder_assets_188700 tspo_peder_assets_25900  tspo_peder_assets_62900 tspo_peder_assets_85100
  tspo_peder_assets_114700 tspo_peder_assets_140600 tspo_peder_assets_162800 tspo_peder_assets_192400 tspo_peder_assets_33300  tspo_peder_assets_66600 tspo_peder_assets_88800
  tspo_peder_assets_118400 tspo_peder_assets_144300 tspo_peder_assets_170200 tspo_peder_assets_196100 tspo_peder_assets_3700   tspo_peder_assets_70300 tspo_peder_assets_96200
  tspo_peder_assets_122100 tspo_peder_assets_14800  tspo_peder_assets_173900 tspo_peder_assets_199800 tspo_peder_assets_37000  tspo_peder_assets_7400  tspo_peder_assets_99900
)
# Loop and run the Python script
for folder in "${FOLDERS[@]}"; do
  FULL_PATH="${BASE_DIR}/${folder}/"
  
  echo "Running: python 02_generate_TMS.py \"$FULL_PATH\" $START_YEAR $END_YEAR $MONTH $DAY \"$EPSG\" ."
  
  # Run it directly (no eval)
  python 02_generate_TMS.py "$FULL_PATH" "$START_YEAR" "$END_YEAR" "$MONTH" "$DAY" "$EPSG"
done
