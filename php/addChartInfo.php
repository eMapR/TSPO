<?php
//include 'db_path.php';
if (isset($_POST['path']) && isset($_POST['holds'])) {
    $variable_to_share = $_POST['path'];
    $raw_post_string = $_POST['holds'];

    function debug_to_console($data) {
        $output = is_array($data) ? json_encode($data) : $data;
        error_log("Debug: " . $output);
    }

    try {
        // Get user IP Address
        $ip = $_SERVER['REMOTE_ADDR'];

        // Decode info from web page
        $array = json_decode($raw_post_string, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('JSON decode error: ' . json_last_error_msg());
        }

        // Check if the database file exists
        if (file_exists($variable_to_share)) {
            // Make a connection to the database
            $db = new PDO('sqlite:' . $variable_to_share);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            debug_to_console("Database connected");

            // Debug the received array
            debug_to_console($array);

            // Begin transaction
            $db->beginTransaction();

            // Get the number of rows in the event table to add an id number based on row number
            $nRows = $db->query("SELECT COUNT(*) FROM eventTable")->fetchColumn() + 1;
            $array[0] = rand(1, 1000000);

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
                // Commit transaction
                $db->commit();
                debug_to_console("Data insertion succeeded!");
            } else {
                // Rollback transaction
                $db->rollBack();
                debug_to_console("Data insertion failed!");
            }
        } else {
            echo "Database does not exist.";
        }
    } catch (PDOException $e) {
        if (isset($db) && $db->inTransaction()) {
            $db->rollBack();
        }
        debug_to_console("PDO Error: " . $e->getMessage());
        echo "Error: " . $e->getMessage();
    } catch (Exception $e) {
        if (isset($db) && $db->inTransaction()) {
            $db->rollBack();
        }
        debug_to_console("General Error: " . $e->getMessage());
        echo "Error: " . $e->getMessage();
    }
}
?>
