<?php


// get user IP Address
$ip = $_SERVER['REMOTE_ADDR'];

//gets chart info from web page
$raw_post_string = file_get_contents('php://input');

// decodes info from web pages
//$array = json_decode($raw_post_string, true);

echo json_encode($ip);

?>
