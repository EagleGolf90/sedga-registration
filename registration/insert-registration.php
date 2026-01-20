<?php
/**
 * Insert Registration Data
 * This file handles inserting golf tournament registration data into the database
 * Customize the database connection and table structure as needed
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for JSON response
header('Content-Type: application/json');

include '../includes/config.php';

try {
    // Create connection using mysqli
    $conn = new mysqli($db_host, $db_username, $db_password, $db_name);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(400);
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
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON data received.'
        ]);
        exit;
    }
    
    include '../includes/functions-inc.php';
    $generator = new RegistrationHandler();

    // Prepare variables from form data
    $secureId = $generator->generateSecureID();
    $registrationId = '';

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
    
    // Validate reCAPTCHA
    if (empty($recaptchaToken)) {
        $errors[] = "reCAPTCHA verification is required.";
    } else {
        // Verify reCAPTCHA token with Google
        $recaptchaSecretKey = '6LcO9vErAAAAACrXaBNfrSQmeR8A3sw62g1rzxr-'; // Replace with your secret key
        $verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        
        $postData = http_build_query([
            'secret' => $recaptchaSecretKey,
            'response' => $recaptchaToken
        ]);
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-type: application/x-www-form-urlencoded',
                'content' => $postData
            ]
        ]);
        
        $response = @file_get_contents($verifyUrl, false, $context);
        $responseData = json_decode($response, true);
        
        // Check if verification was successful
        if (!$responseData || !isset($responseData['success']) || !$responseData['success']) {
            $errors[] = "reCAPTCHA verification failed. Please try again.";
        } elseif (isset($responseData['score']) && $responseData['score'] < 0.5) {
            // If using reCAPTCHA v3, check score (0.0 is most likely a bot, 1.0 is most likely human)
            $errors[] = "Your request could not be verified. Please try again.";
        }
    }
    
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Validation errors',
            'errors' => $errors
        ]);
        exit;
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email format.'
        ]);
        exit;
    }
    
    // Start transaction
    $conn->begin_transaction();

    try {
        // Insert into registrations table
        // CUSTOMIZE TABLE NAME AND COLUMNS BASED ON YOUR DATABASE SCHEMA
        $sql = "INSERT INTO registrations (
                    secure_id, registration_id, first_name, last_name, email, phone_type, phone,
                    address, city, state, zip_code, country,
                    age, gender, hole_18_average, org_id, sedga_officer, sedga_hall_of_fame, ghin_number,
                    emergency_name, emergency_relationship, emergency_email, emergency_phone_type, emergency_phone,
                    send_payment, send_username, receive_payment, receive_username,
                    total_amount, remote_addr, http_user_agent, registration_date, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), '')";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        // Bind parameters
        $stmt->bind_param(
            "sssiisssssiiiiiissiiiiii",
            $secureId, $registrationId, $firstName, $lastName, $email, $phoneType, $phone,
            $address, $city, $state, $zipCode, $country,
            $age, $gender, $hole18Average, $org_id, $sedgaOfficer, $sedgaHallOfFame, $ghinNumber,
            $emergencyName, $emergencyRelationship, $emergencyEmail, $emergencyPhoneType, $emergencyPhone,
            $sendPayment, $sendUsername, $receivePayment, $receiveUsername,
            $cartTotal, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT']
        );
        
        // Execute statement
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        // Get the last inserted registration ID
        $registrationId = $conn->insert_id;
        $stmt->close();
        
        // Insert cart items if any
        if (!empty($cartData)) {
            $cartSql = "INSERT INTO registration_items (registration_id, item_name, item_type, item_price, quantity, is_discount) VALUES (?, ?, ?, ?, ?, ?)";
            $cartStmt = $conn->prepare($cartSql);
            
            if (!$cartStmt) {
                throw new Exception("Cart prepare failed: " . $conn->error);
            }
            
            foreach ($cartData as $item) {
                $itemName = isset($item['name']) ? $item['name'] : '';
                $itemType = isset($item['type']) ? $item['type'] : '';
                $itemPrice = isset($item['price']) ? (float)$item['price'] : 0.00;
                $itemQuantity = isset($item['quantity']) ? (int)$item['quantity'] : 1;
                $isDiscount = isset($item['isDiscount']) ? (int)$item['isDiscount'] : 0;
                
                $cartStmt->bind_param("issdii", $registrationId, $itemName, $itemType, $itemPrice, $itemQuantity, $isDiscount);
                
                if (!$cartStmt->execute()) {
                    throw new Exception("Cart insert failed: " . $cartStmt->error);
                }
            }
            
            $cartStmt->close();
        }
        
        // Commit transaction
        $conn->commit();
        
        // Success response
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Registration saved successfully.',
            'registrationId' => $registrationId
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error saving registration: ' . $e->getMessage()
        ]);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
