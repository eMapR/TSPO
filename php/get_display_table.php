<?php

include 'db_path.php';
//$db = new SQLite3('../TSPdatabase0.db');
$db = new SQLite3($variable_to_share);

$display_table = $db->query("select * from displayTable");
while ($row = $display_table->fetchArray()) {
    $outstring .= json_encode($row);
   echo json_encode($row);
}


?>
