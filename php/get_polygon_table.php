<?php
//include 'db_path.php';
//$db = new SQLite3('../TSPdatabase0.db');


if (isset($_POST['path'])) {
    $variable_to_share = $_POST['path'];
    $db = new SQLite3($variable_to_share);

    $polygon_table = $db->query("select * from polygonTable");
    while ($row = $polygon_table->fetchArray()) {
        echo json_encode($row);
    }
}
?>
