<?php

//$db = new SQLite3('../TSPdatabase0.db');

//if (isset($_POST['path'])) {
//    $variable_to_share = $_POST['path'];
//    $db = new SQLite3($variable_to_share);

//    $event_table = $db->query("select * from eventTable");
//    while ($row = $event_table->fetchArray()) {
//         echo json_encode($row);
//    }
//}

if (isset($_POST['path'])) {
    $variable_to_share = $_POST['path'];

    if (file_exists($variable_to_share)) {
        $db = new SQLite3($variable_to_share);

        $event_table = $db->query("select * from eventTable");
        $rows = [];
        while ($row = $event_table->fetchArray(SQLITE3_ASSOC)) {
            $rows[] = $row;
        }
        echo json_encode($rows);

    } else {
        echo "Database does not exist.";
    }
}
?>
