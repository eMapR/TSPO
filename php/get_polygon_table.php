<?php
if (isset($_POST['path'])) {
    $variable_to_share = $_POST['path'];

    if (file_exists($variable_to_share)) {
        $db = new SQLite3($variable_to_share);

        $polygon_table = $db->query("SELECT * FROM polygonTable");
        $rows = [];

        while ($row = $polygon_table->fetchArray(SQLITE3_ASSOC)) {
            // Fix 'geo' field: convert single quotes to double quotes for valid JSON
            if (isset($row['geo']) && is_string($row['geo'])) {
                $row['geo'] = str_replace("'", '"', $row['geo']);
            }

            // Fix 'json' field similarly if needed
            if (isset($row['json']) && is_string($row['json'])) {
                $row['json'] = str_replace("'", '"', $row['json']);
            }

            $rows[] = $row;
        }

        header('Content-Type: application/json');
        echo json_encode($rows);
    } else {
        echo json_encode(["error" => "Database does not exist."]);
    }
} else {
    echo json_encode(["error" => "No path provided."]);
}
?>
