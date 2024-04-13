<?php
//include 'db_path.php';

if (isset($_POST['path']) && isset($_POST['holds'])) {
	$variable_to_share = $_POST['path'];
	$raw_post_string = $_POST['holds'];


	function debug_to_console($data) {
	    $output = $data;
	    error_log("Debug Objects: " . $output);
	}

	try {
	    // Get user IP Address and request time
	    $ip = $_SERVER['REMOTE_ADDR'];
	    //$time = $_SERVER['REQUEST_TIME'];

	    // Get chart info from web page
	    //$raw_post_string = file_get_contents('php://input');

	    // Decode info from web pages
	    $array = json_decode($raw_post_string, true);

	    // Make a connection to the database
	    $db = new PDO('sqlite:'.$variable_to_share);
	    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	    echo "db connected";

	    var_dump($array);
	    
	    // Get the number of rows in the event table to add an id number based on row number
	    $nRows = $db->query("SELECT COUNT(*) FROM eventTable")->fetchColumn() + 1;
	    $array[0]=rand(1, 1000000);

	    // Get the field names of the eventTable
	    $fieldsStmt = $db->query("PRAGMA table_info(eventTable)");
	    $fields = $fieldsStmt->fetchAll(PDO::FETCH_ASSOC);
	    $fieldNames = array_map(function ($field) {
	        return $field['name'];
	    }, $fields);

	    // Create a dynamic database input string
	    $fieldPlaceholders = implode(',', array_fill(0, count($fieldNames), '?'));

	    $stm = $db->prepare("INSERT INTO eventTable(" . implode(',', $fieldNames) . ") VALUES (" . $fieldPlaceholders . ")");

	    // Bind values
	    $data = [];
	    foreach ($array as $value) {
	        // Assuming that the order of numeric keys in $array corresponds to the order of fields
	        $data[] = $value;
	    }

	    $stm->execute($data);

	    // Check if the execution was successful
	    if ($stm->rowCount() > 0) {
	        // It worked
	        var_dump("It worked!");
	    } else {
	        // It didn't
	        var_dump("It did not work!");
	    }
	} catch (PDOException $e) {
	    echo "Error: " . $e->getMessage();
}
}
?>

