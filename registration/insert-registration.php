<?php
/**
 * Insert Registration Data
 * This file handles inserting golf tournament registration data into the database
 * Customize the database connection and table structure as needed
 */

// Enable error reporting for debugging but don't display errors
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set custom error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    return true;
});

// Set shutdown function to catch fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_COMPILE_ERROR)) {
        $buffered = ob_get_clean();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Fatal PHP error: ' . $error['message'] . ' in ' . $error['file'] . ' on line ' . $error['line'],
            'debug' => $buffered
        ]);
    }
});

// Start output buffering to prevent accidental output before JSON response
ob_start();

// Set headers for JSON response
header('Content-Type: application/json');

// include 'verify-recaptcha.php';

try {
    include '../preload.php';
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load preload.php: ' . $e->getMessage()
    ]);
    exit;
}

try {
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(400);
        ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request method. POST required.'
        ]);
        exit;
    }
    
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON data received.'
        ]);
        exit;
    }

    try {
        $sqlTable = new SQLTable();
    } catch (Exception $e) {
        ob_clean();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to initialize database: ' . $e->getMessage()
        ]);
        exit;
    }

    try {
        $rows = $sqlTable->load('generateRegistration', array(BUS_UNIT));
    } catch (Exception $e) {
        ob_clean();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to load registration data: ' . $e->getMessage()
        ]);
        exit;
    }

    $id = 1;
    foreach ($rows as $row) {
        $id += $row['UniqueID'];
    }

    try {
        $ret = $sqlTable->execute('updateRegistration', array(BUS_UNIT, $id));
    } catch (Exception $e) {
        ob_clean();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update registration ID: ' . $e->getMessage()
        ]);
        exit;
    }

    try {
        include '../includes/generator.php';
        include '../includes/functions-inc.php';
    } catch (Exception $e) {
        ob_clean();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to load functions: ' . $e->getMessage()
        ]);
        exit;
    }

    try {
        $generator = new RegistrationGenerator($sqlTable);
    } catch (Exception $e) {
        ob_clean();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to initialize generator: ' . $e->getMessage()
        ]);
        exit;
    }

    // Prepare variables from form data
    $secureId = $generator->generateSecureID();
    $registrationId = $id;

    // Personal Information
    $firstName = isset($data['firstName']) ? ucfirst(strtolower(trim($data['firstName']))) : '';
    $lastName = isset($data['lastName']) ? ucfirst(strtolower(trim($data['lastName']))) : '';
    $email = isset($data['email']) ? trim($data['email']) : '';
    $phoneType = isset($data['phoneType']) ? (int)$data['phoneType'] : 0;
    $phone = isset($data['phone']) ? trim($data['phone']) : '';
    $address = isset($data['address']) ? trim($data['address']) : '';
    $city = isset($data['city']) ? trim($data['city']) : '';
    $state = isset($data['state']) ? trim($data['state']) : '';
    $zipCode = isset($data['zipCode']) ? trim($data['zipCode']) : '';
    $country = isset($data['country']) ? trim($data['country']) : '';
    
    // Golf Information
    $age = isset($data['age']) ? (int)$data['age'] : 0;
    $gender = isset($data['gender']) ? (int)$data['gender'] : 0;
    $hole18Average = isset($data['hole18Average']) ? (int)$data['hole18Average'] : 0;
    $org_id = isset($data['org_id']) ? (int)$data['org_id'] : 0;
    $sedgaOfficer = isset($data['sedgaOfficer']) && $data['sedgaOfficer'] ? 1 : 0;
    $sedgaHallOfFame = isset($data['sedgaHallOfFame']) && $data['sedgaHallOfFame'] ? 1 : 0;
    $ghinNumber = isset($data['ghinNumber']) ? trim($data['ghinNumber']) : '';
    
    // Emergency Contact
    $emergencyName = isset($data['emergencyName']) ? trim($data['emergencyName']) : '';
    $emergencyRelationship = isset($data['emergencyRelationship']) ? (int)$data['emergencyRelationship'] : 0;
    $emergencyEmail = isset($data['emergencyEmail']) ? trim($data['emergencyEmail']) : '';
    $emergencyPhoneType = isset($data['emergencyPhoneType']) ? (int)$data['emergencyPhoneType'] : 0;
    $emergencyPhone = isset($data['emergencyPhone']) ? trim($data['emergencyPhone']) : '';
    
    // Payment Information
    $sendPayment = isset($data['sendPayment']) ? (int)$data['sendPayment'] : 0;
    $sendUsername = isset($data['sendUsername']) ? trim($data['sendUsername']) : '';
    $receivePayment = isset($data['receivePayment']) ? (int)$data['receivePayment'] : 0;
    $receiveUsername = isset($data['receiveUsername']) ? trim($data['receiveUsername']) : '';
    
    // Cart/Events
    $cartData = isset($data['cart']) ? $data['cart'] : [];
    $cartTotal = isset($data['cartTotal']) ? (float)$data['cartTotal'] : 0.00;
    
    // reCAPTCHA Token
    $recaptchaToken = isset($data['recaptchaToken']) ? trim($data['recaptchaToken']) : '';
    
    // Validate required fields
    $requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    $errors = [];
    foreach ($requiredFields as $field) {
        if (empty($$field)) {
            $errors[] = ucfirst($field) . " is required.";
        }
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email format.'
        ]);
        exit;
    }
    
    // Start transaction
    // $conn->begin_transaction();

    try {
        // Insert into registrations table
        // Bind parameters
        $parm = array(
            $secureId, $registrationId, $firstName, $lastName, $email, $phoneType, $phone,
            $address, $city, $state, $zipCode, $country,
            $age, $gender, $hole18Average, $org_id, $sedgaOfficer, $sedgaHallOfFame, $ghinNumber,
            $emergencyName, $emergencyRelationship, $emergencyEmail, $emergencyPhoneType, $emergencyPhone,
            $sendPayment, $sendUsername, $receivePayment, $receiveUsername,
            $cartTotal, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT']
        );

        // // Execute statement
        $ret = $sqlTable->execute('insertRegistration', $parm);
        
        if ($ret != 1) {
            throw new Exception("Failed to insert registration: Return code " . $ret);
        }
        
        // Insert cart items if any
        if (!empty($cartData)) {
            foreach ($cartData as $item) {
                $itemName = isset($item['name']) ? $item['name'] : '';
                $itemPrice = isset($item['price']) ? (float)$item['price'] : 0.00;
                $itemQuantity = isset($item['quantity']) ? (int)$item['quantity'] : 1;
                
                $parm = array($registrationId, $itemName, $itemPrice, $itemQuantity);
                $ret = $sqlTable->execute('insertRegistrationItems', $parm);
                
                if ($ret != 1) {
                    throw new Exception("Cart insert failed: " . $cartStmt->error);
                }
            }
        }
        
        // Commit transaction
        // $conn->commit();
        
        // Success response
        http_response_code(201);
        ob_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Registration saved successfully.',
            'registrationId' => $registrationId
        ]);
        exit;
        
    } catch (Exception $e) {
        // Rollback transaction on error
        // $conn->rollback();
        
        http_response_code(500);
        ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Error saving registration: ' . $e->getMessage()
        ]);
    }
    exit;
    
    // $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
    exit;
}
?>
