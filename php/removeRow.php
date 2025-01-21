<?php

if (isset($_POST['path']) && isset($_POST['rmr'])) {
    $variable_to_share = $_POST['path'];
    $raw_post_string = $_POST['rmr'];
    $ip = $_SERVER['REMOTE_ADDR'];

    // Validate inputs
    if (!is_string($variable_to_share) || !file_exists($variable_to_share)) {
        die("Invalid path.");
    }
    if (!is_string($raw_post_string) || !json_decode($raw_post_string, true)) {
        die("Invalid JSON data.");
    }
    if (!filter_var($ip, FILTER_VALIDATE_IP)) {
        die("Invalid IP address.");
    }

    $array = json_decode($raw_post_string, true);

    if (!isset($array[0]) || !isset($array[1])) {
        die("Invalid array data.");
    }

    try {
        // Connect to the database
        $db = new PDO('sqlite:' . $variable_to_share);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Prepare and execute the query
        $stm = $db->prepare("DELETE FROM eventTable WHERE plotId = :plotid AND User_IP = :userid");
        $stm->bindValue(':plotid', $array[0]);
        $stm->bindValue(':userid', $array[1]);

        if ($stm->execute()) {
            echo "Operation successful.";
        } else {
            error_log("Database error: " . json_encode($stm->errorInfo()));
            echo "An error occurred.";
        }
    } catch (Exception $e) {
        error_log("Database connection failed: " . $e->getMessage());
        echo "Failed to connect to the database.";
    }
} else {
    echo "Invalid request.";
}

?>
