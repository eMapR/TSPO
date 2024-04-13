<?php
//include 'db_path.php';

if (isset($_POST['path']) && isset($_POST['rmr'])) {
   $variable_to_share = $_POST['path'];
   $raw_post_string = $_POST['rmr'];
   // get user IP address
   $ip = $_SERVER['REMOTE_ADDR'];

   //gets chart info from web page
   //$raw_post_string = file_get_contents('php://input');

   // decodes info from web pages
   $array = json_decode($raw_post_string, true);

   // makes a connection to the database
   $db = new PDO('sqlite:'.$variable_to_share);

    if ($db != null)
        echo " db connected ";
    else
        echo " db did not connect ";

    // makes a variable that is the length of the array that is the webpage info.
    var_dump($array[0]);

    // creates an database input string
    $stm = $db->prepare("delete from eventTable where plotId=:plotid and User_IP=:userid");

    $stm->bindValue(':plotid',$array[0]);
    $stm->bindValue(':userid',$array[1]);
}
// executes database input string with above varaibles
if ($stm->execute()) { 
	// it worked
	var_dump("It worked!");
} else {
	// it didn't
	var_dump("It did not worked!");
	var_dump($stm->errorInfo());
}

//$stm->close();
?>
