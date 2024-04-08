<?php

include 'db_path.php';
//$db = new SQLite3('../TSPdatabase0.db');
$db = new SQLite3($variable_to_share);

$event_table = $db->query("select * from eventTable");
while ($row = $event_table->fetchArray()) {
    echo json_encode($row);
}

?>
