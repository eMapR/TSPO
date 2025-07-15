import json
import re
import sqlite3
from sqlite3 import Error
from sys import platform
from collections import OrderedDict
#import Tkinter,tkFileDialog
#import tkMessageBox
import os
import glob
import sys
import itertools
import random



#===========================================================================
def is_file_real(file_path):
    
    if os.path.exists(file_path):
        print("This path is real: ", file_path)
    else:
        print("!!! CHECK PATH !!! : ",file_path)

#============================================================================
# opens the json file from GEE to be read only.
def openJson(jsonPath):
    with open(jsonPath, 'r+') as f:
        data = json.load(f)
    return (data)
#=============================================================================
# reads in the config text file into a string line by line..
def get_txt(txt):
    a=''
    with open (txt,'r') as f:
        for line in f:
            line = line.strip()
            a+=line
    dataMap = eval(a)    
    return (dataMap)
#=============================================================================   
def create_connection(db_file):
    """ create a database connection to the SQLite database
    specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    try:
        conn = sqlite3.connect(db_file)
        return conn
    
    except Error as e:
        print(e)

    return None
#=============================================================================
def create_table(conn, create_table_sql):
    """ create a table from the create_table_sql statement
    :param conn: Connection object
    :param create_table_sql: a CREATE TABLE statement
    :return:
    """
    #print(create_table_sql)
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
    except Error as e:
        print(e)
#=============================================================================
def input_values_table(conn, main):
    """ Create a new project into the projects table
    :param conn:
    :param project
    :return: project id
    """
    #print(main)
    cur = conn.cursor()
    #print(cur)
    cur.execute(main)
    return cur.lastrowid
#=============================================================================
def sql_input_list(yam):

    # gets text string in the form of a dictionary
    dataMap = get_txt(yam)
    
    # gets the keys and values as lists from the yaml dictionary
    tablenames =  list(dataMap.keys())
    fieldnames = list(dataMap.values())
    # since the display table has nest key/values they need to be removed and added later. 
    for q in fieldnames:
        
        if type(q) == dict:
            indexOut = fieldnames.index(q)            # get index of dic from list of lists and dic
            fieldnames.remove(q)                      # removes the dic from the list
            tablenames.append(tablenames[indexOut])   # add the tablename to the end of the list 
            del tablenames[indexOut]                  # removes the same name from its pervious postion
            
    # blank list txt dictionary values 
    templ = []
    addtext = []
    dropdown = []
    dropdownstrings = []
    # loops through the display table to get dropdown names and values. Remember they were removed above.
    for i in dataMap.keys():
        if i =='displayTable':
            for key,val in dataMap[i].items(): # keys will be field names (state, change, etc) the values will be dropdown values (fire, flood, etc)
                dropdown.append(key)
                #item_to_remove = 'Prop'
                #if item_to_remove in val:
                #    val.remove(item_to_remove)
                dropdownstrings.append(str(val).strip('[]'))	
    fieldnames.append(dropdown)
    
    # loops through config file dictionary and adds sql data type to column name
    for p in fieldnames:
        for q in p:
            add = q + ' text'
            templ.append(add)
        addtext.append(templ)
        templ = []
    
    # changes lists of lists of stringS into lists of lists of a string 
    fieldNamesWithText = [','.join(x) for x in addtext]

    # list of lists of column names
    fieldNames = [','.join(x) for x in fieldnames]
   
   
    return tablenames, fieldNamesWithText, fieldNames, tuple(dropdownstrings)
#=============================================================================
def findEndYear(data):
    #print(data['features'][1]['properties'])
    timeFrame = []
    for key, value in data['features'][0]['properties'].items():
        #print(key,value)
        try:
            dataYears = int(key[0:4])
            timeFrame.append(dataYears)
        except ValueError:
            continue
    Endyear = max(timeFrame)
    return Endyear
#=============================================================================

# makes a list of lists of yearly spectral observation for each polygon (needs to be called into a loop
# for each year) one loop for year 1985 will give spectral values for each polygon for that year.
def observation_value_list(data,year):
	year = str(year)
	templist = []
	templist2 = []
	counter = 1 
	for values in data['features']:
		for key, value in sorted(values['properties'].items()):
			if year in key:
				templist.append(value)

			if len(templist) == 6: # 6 is for the number of bands 
			
				templist.append(year)
				#templist.append(values['id'])
				try:
					templist.append(str(values['properties']['uniqID']))
					#templist.append(str(values['properties']['name']))
				except KeyError:
					templist.append(0)
				try:
					templist.append(values['properties']['yod'])
				except (KeyError, IndexError):
					templist.append('unknown')

				try:
					templist.append(values['properties']['numberInStratum'])
				except (KeyError, IndexError):
					templist.append('nannan')

				try:
					templist.append(values['properties']['stratumID'])
				except (KeyError, IndexError):
					templist.append('nannan')

				templist2.append(templist)
				templist = []
		counter += 1
	return templist2

#==========================================================================================
def observation_value_dict(startYear, end, data, yam):

    """  here we rearange our input GEE json file. So, we start by looping a loop. the first
    loop (outter loop) iterates over our time series (1985 to 2017). the loop varible is used 
    in a function that returns a list of lists that are our yearly spectral infromation for each
    polygon. So, in start of the first loop we have a list of lists of spectral infromation for
    all polygons for 1985. In the next loop (inner loop) we iterate over the number of polygons
    in the json file. In this loop we are rearanging the spectral information to a structure 
    TimeSync and the tables want .  """

    lastYear = findEndYear(data)
    #print("lastYear",lastYear)

    sql_list = sql_input_list(yam)
    fieldnames = sql_list[2]
    
    mainlist = []
    obserlist = []

    dictionary_template = {
        'b1': None,
        'b2': None,
        'b3': None,
        'b4': None,
        'b5': None,
        'b7': None,
        'cloud_cover': 0,
        'image_julday': '217',
        'image_year': None,
        'plotid': None,
        'project_id': 1100,
        'selected': 'null',
        'sensor': 'LT5',
        'spectral_scaler': 10000,
        'target_day': None,
        'tcb': 0,
        'tcg': 0,
        'tcw': 0,
        'tsa': 999999,
        'url': 'another.png',
        'yod': None,
        'numberInStratum': None,
        'stratumID': None,
        #'agent': None,
        #'count': None,
        #'label': None,
        #'opt': None
    }


    while startYear <= lastYear:  #  loops to the number of years 33
        templistB = observation_value_list(data,startYear)# list of lists of spectral
       
        #information for all polygons for one year pre loop. 
        for i in range(end): # loops to the number of features 
            observation_data = dictionary_template.copy()
            #print(templistB[i][7])
            #print(i)
            observation_data['b1'] = templistB[i][0]
            observation_data['b2'] = templistB[i][1]
            observation_data['b3'] = templistB[i][2]
            observation_data['b4'] = templistB[i][3]
            observation_data['b5'] = templistB[i][4]
            observation_data['b7'] = templistB[i][5]

            observation_data['image_year'] = int(templistB[i][6])
            observation_data['plotid'] = templistB[i][7]
            observation_data['target_day'] = templistB[i][8]
            observation_data['yod'] = templistB[i][8]
            observation_data['numberInStratum'] = templistB[i][9]
            observation_data['stratumID'] = templistB[i][10]

            mainlist.append(observation_data)           
        startYear += 1


    # add logic here to asign users to plots 
    # List of interpreters
    interpreters = ['user1','user2','user3']

    # Generate all unique pairs
    pairs = list(itertools.combinations(interpreters, 2))*8
    print(pairs)
        
    polyTab = []
    evenTab =[]
    obserTab = []
    



    user_counter = 0
    for i in  range(end):
        """ make return tuple lists here for each table. maybe combine the function above
       	with this one to to make a master list of values for each table. """
        #-----------------------------------------------------------------
        try:
            coordinates = str(data['features'][i]['geometry']['coordinates'])
            featureType = str(data['features'][i]['geometry']['type'])
            geometry = "{'type':'"+featureType+"', 'coordinates':"+coordinates+"}"
            # project is a big tuple of the rearanged data
            #print(i)
            print("here")
            print(pairs[0][0])
            print(templistB[i])
            project = (
                templistB[i][7],    #f"{i:05}",  #displayed plot id 
                templistB[i][7],    # hidden plot id tracker
                "0",                # reevalutation 
                pairs[user_counter][0],                # user 1
                pairs[user_counter][1],                # user 2
                geometry,           # geometry 
                json.dumps(mainlist[i::end]) #json
            )
            polyTab.append(project)

            if user_counter == 20:
                user_counter = 0
            else:
                user_counter+=1

        except KeyError:
            continue
    polygonData = str(polyTab).strip('[]')

    return polygonData, 'obserData', templistB
#==========================================================================================

def main():

    if len(sys.argv) != 3:
        print("Usage: python script.py <projectDataHeadDir> <projectName>")
        sys.exit(1)

    #plot = "park"
    dataHead = sys.argv[1]
    plot = sys.argv[2]
    yam = f"{dataHead}01_config.txt"
    jsonPath = f"{dataHead}json/{plot}.geojson"
    database = f"{dataHead}db/"
    database_name = f"{plot}.db"

    is_file_real(yam)
    is_file_real(jsonPath)
    is_file_real(database)   

    data = openJson(jsonPath)

    # lists of table names, column names, and column names with datatypes 
    sql_list = sql_input_list(yam)
    print(sql_list)
    tablenames = sql_list[0]
    fieldNamesWithText = sql_list[1]
    fieldNames = sql_list[2]
    dropdownstrings = str(sql_list[3]).replace("'", "")
#-------------------
    yearKey = sorted(data['features'][0]['properties'])[0][-2:]

    listOfYears = []

    for band in data['features'][0]['properties']:
        #print(band)
        if yearKey in band:
            listOfYears.append(band)
    listOfYears.sort() 
    startYear = int(listOfYears[0][:4]) 
    endYear= int(listOfYears[-1][:4])
    end = len(data['features'])
#-------------------

    obser_val_dict = observation_value_dict(startYear, end, data, yam) 

    polygonData = obser_val_dict[0]
    templistB = obser_val_dict[2]
    
    polygonTable=polygonData
    eventTable = ""
    displayTable = dropdownstrings
    # alot of stuff going on here, making sql commands, tables, and inputing values into tables
    conn = create_connection(database+database_name)
    defaultFeilds = 'id int PRIMARY KEY'
    for i, v  in zip(tablenames, fieldNamesWithText):
        print(i)
        print(v)
        print("--")
        create_table_sql = "CREATE TABLE IF NOT EXISTS  "+i+" ("+defaultFeilds+", "+v+");"
        if conn is not None:
            # creates table
            create_table(conn, create_table_sql)
        else:
            print("Error1! cannot create the database connection.")
    for i, e in zip(tablenames, fieldNames):
        print(i)
        print(e)
        print(type((eval(i))))
        if len(eval(i)) >= 2:
            
            main = 'INSERT INTO '+i+ '('+e+')  VALUES'+eval(i)+'; '
                
            if conn is not None:
                with conn:
                    # inputs values into a table
                    print(main[0]) 
                    input_values_table(conn, main)
            else:
                print("Error2! cannot create the database connection.")
        else:
            print ('else')
           
        #finds the number of columns
        lengt = (len(e.split(',')))
        tup = ()
        for t in range(lengt):
            tup = tup + ('no data',) 
            
        main = 'INSERT INTO '+i+ '('+e+')  VALUES'+str(tup)+'; '
        #print (main)
        if conn is not None:
            with conn:
                # inputs values into a table
                input_values_table(conn, main)
        else:
            print("Error3! cannot create the database connection.")
    print('done')
if __name__ == '__main__':
    main()
