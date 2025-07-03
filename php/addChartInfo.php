<?php
function log_to_file($message) {
    $log_file = __DIR__ . '/addChartInfo.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND);
}

function debug($message) {
    log_to_file($message);
    error_log("Debug: $message");
}

debug("addChartInfo.php hit");

$isTest = (php_sapi_name() == 'cli' && in_array('test=true', $argv));

if ($isTest) {
    debug("Running in test mode with hardcoded values");

    $path = __DIR__ . '/data/nelson/db/noah.db';  // Adjust path as needed
    $raw = '["2","Jul 02 2025 18:36:20","unknown","grass","sdf","sdf","71.238.105.26","0:0:8"]';
} elseif (isset($_POST['path']) && isset($_POST['holds'])) {
    $path = $_POST['path'];
    $raw = $_POST['holds'];
} else {
    echo "Missing parameters.\n";
    exit;
}

debug("Raw JSON: $raw");

try {
    $array = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON decode error: " . json_last_error_msg());
    }

    debug("Decoded array: " . print_r($array, true));

    if (!file_exists($path)) {
        echo "Database not found.\n";
        debug("Database not found: $path");
        exit;
    }

    $db = new PDO("sqlite:" . $path);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    debug("Database connected");

    $fieldsStmt = $db->query("PRAGMA table_info(eventTable)");
    $fields = $fieldsStmt->fetchAll(PDO::FETCH_ASSOC);
    $fieldNames = array_map(fn($f) => $f['name'], $fields);
    debug("eventTable fields: " . implode(", ", $fieldNames));

    if (count($fieldNames) != count($array)) {
        throw new Exception("Mismatch: " . count($fieldNames) . " fields vs " . count($array) . " values");
    }

    $placeholders = implode(',', array_fill(0, count($fieldNames), '?'));
    $stmt = $db->prepare("INSERT INTO eventTable (" . implode(',', $fieldNames) . ") VALUES ($placeholders)");

    $db->beginTransaction();
    $stmt->execute($array);
    $db->commit();

    debug("Insert success");
    echo "Success\n";
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    debug("Error: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
}
?>
