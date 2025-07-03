<?php
if (isset($_POST['path'])) {
    $variable_to_share = $_POST['path'];

    if (file_exists($variable_to_share)) {
        $db = new SQLite3($variable_to_share);

        $display_table = $db->query("SELECT * FROM displayTable");
        $rows = [];
        while ($row = $display_table->fetchArray(SQLITE3_ASSOC)) {
            $rows[] = $row;
        }

        // ✅ Send JSON response
        echo json_encode($rows);

    } else {
        // Optional: return an empty array instead of a string
        echo json_encode([]);
    }
}
?>
