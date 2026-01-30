<?php
/**
 * Results Page - Displays all POST data for testing purposes
 * This page displays all submitted form data from the registration form
 */

// Get POST data
$postData = $_POST;

?>
<!-- <!DOCTYPE html> -->
<!-- <html lang="en"> -->
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Results - Test Data Display</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            background-color: #f8f9fa;
            padding: 20px;
        }
        .results-container {
            max-width: 1000px;
            margin: 0 auto;
        }
        .header-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header-section h1 {
            margin-bottom: 10px;
            font-weight: bold;
        }
        .data-card {
            background: white;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .card-header-custom {
            background-color: #667eea;
            color: white;
            padding: 15px 20px;
            font-weight: bold;
            font-size: 16px;
        }
        .card-body-custom {
            padding: 20px;
        }
        .data-row {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 20px;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
            align-items: start;
        }
        .data-row:last-child {
            border-bottom: none;
        }
        .data-label {
            font-weight: 600;
            color: #495057;
            word-break: break-word;
        }
        .data-value {
            color: #212529;
            word-break: break-word;
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            background-color: #f8f9fa;
            padding: 8px 12px;
            border-radius: 4px;
            border-left: 3px solid #667eea;
        }
        .empty-message {
            text-align: center;
            color: #6c757d;
            padding: 40px 20px;
            font-style: italic;
        }
        .no-data {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .summary-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .summary-box {
            background: #f8f9fa;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .summary-label {
            font-size: 12px;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
        }
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        .button-group a,
        .button-group button {
            flex: 1;
            min-width: 150px;
        }
    </style>
</head>
<body>
    <div class="results-container">
        <!-- Header Section -->
        <div class="header-section">
            <h1>
                <i class="fas fa-check-circle me-2"></i>Registration Results
            </h1>
            <p class="mb-0">Test Data Display - All Submitted Form Information</p>
        </div>

        <!-- Summary Section -->
        <?php if (!empty($postData)): ?>
            <div class="summary-section">
                <div class="summary-box">
                    <div class="summary-label">Total Fields</div>
                    <div class="summary-value"><?php echo count($postData); ?></div>
                </div>
                <div class="summary-box">
                    <div class="summary-label">Timestamp</div>
                    <div class="summary-value"><?php echo date('H:i:s'); ?></div>
                </div>
                <div class="summary-box">
                    <div class="summary-label">Data Status</div>
                    <div class="summary-value">
                        <i class="fas fa-check-circle" style="color: #28a745;"></i>
                    </div>
                </div>
            </div>
        <?php endif; ?>

        <!-- Main Data Display -->
        <?php if (empty($postData)): ?>
            <div class="no-data">
                <i class="fas fa-info-circle me-2"></i>
                <strong>No POST Data Received</strong>
                <p class="mb-0">This page is designed to display form submission data. Please submit the registration form to see results here.</p>
            </div>
        <?php else: ?>
            <!-- Personal Information -->
            <?php
            $personalFields = ['firstName', 'lastName', 'email', 'phoneType', 'phone', 'address', 'city', 'state', 'zipCode', 'country', 'gender', 'dateOfBirth'];
            $hasPersonalData = false;
            foreach ($personalFields as $field) {
                if (isset($postData[$field])) {
                    $hasPersonalData = true;
                    break;
                }
            }
            ?>
            <?php if ($hasPersonalData): ?>
            <div class="data-card">
                <div class="card-header-custom">
                    <i class="fas fa-user me-2"></i>Personal Information
                </div>
                <div class="card-body-custom">
                    <?php foreach ($personalFields as $field): ?>
                        <?php if (isset($postData[$field])): ?>
                            <div class="data-row">
                                <div class="data-label"><?php echo ucwords(str_replace(['Id', 'Type', 'Code'], ['ID', 'Type', 'Code'], preg_replace('/([A-Z])/', ' $1', $field))); ?></div>
                                <div class="data-value"><?php echo htmlspecialchars($postData[$field]); ?></div>
                            </div>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Golf Information -->
            <?php
            $golfFields = ['handicap', 'ghinNumber', 'handicapIndex'];
            $hasGolfData = false;
            foreach ($golfFields as $field) {
                if (isset($postData[$field])) {
                    $hasGolfData = true;
                    break;
                }
            }
            ?>
            <?php if ($hasGolfData): ?>
            <div class="data-card">
                <div class="card-header-custom">
                    <i class="fas fa-golf-ball me-2"></i>Golf Information
                </div>
                <div class="card-body-custom">
                    <?php foreach ($golfFields as $field): ?>
                        <?php if (isset($postData[$field])): ?>
                            <div class="data-row">
                                <div class="data-label"><?php echo ucwords(str_replace(['Id', 'Index', 'Number'], ['ID', 'Index', 'Number'], preg_replace('/([A-Z])/', ' $1', $field))); ?></div>
                                <div class="data-value"><?php echo htmlspecialchars($postData[$field]); ?></div>
                            </div>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Emergency Contact -->
            <?php
            $emergencyFields = ['emergencyFirstName', 'emergencyLastName', 'emergencyRelationship', 'emergencyPhoneType', 'emergencyPhone'];
            $hasEmergencyData = false;
            foreach ($emergencyFields as $field) {
                if (isset($postData[$field])) {
                    $hasEmergencyData = true;
                    break;
                }
            }
            ?>
            <?php if ($hasEmergencyData): ?>
            <div class="data-card">
                <div class="card-header-custom">
                    <i class="fas fa-exclamation-triangle me-2"></i>Emergency Contact
                </div>
                <div class="card-body-custom">
                    <?php foreach ($emergencyFields as $field): ?>
                        <?php if (isset($postData[$field])): ?>
                            <div class="data-row">
                                <div class="data-label"><?php echo ucwords(str_replace(['Id', 'Type', 'Name', 'Phone'], ['ID', 'Type', 'Name', 'Phone'], preg_replace('/([A-Z])/', ' $1', str_replace('emergency', '', $field)))); ?></div>
                                <div class="data-value"><?php echo htmlspecialchars($postData[$field]); ?></div>
                            </div>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Payment Information -->
            <?php
            $paymentFields = ['paymentType', 'cardNumber', 'cardHolderName', 'expiryDate', 'cvv'];
            $hasPaymentData = false;
            foreach ($paymentFields as $field) {
                if (isset($postData[$field])) {
                    $hasPaymentData = true;
                    break;
                }
            }
            ?>
            <?php if ($hasPaymentData): ?>
            <div class="data-card">
                <div class="card-header-custom">
                    <i class="fas fa-credit-card me-2"></i>Payment Information
                </div>
                <div class="card-body-custom">
                    <?php foreach ($paymentFields as $field): ?>
                        <?php if (isset($postData[$field])): ?>
                            <div class="data-row">
                                <div class="data-label"><?php echo ucwords(str_replace(['Number', 'Name', 'Type'], ['Number', 'Name', 'Type'], preg_replace('/([A-Z])/', ' $1', $field))); ?></div>
                                <div class="data-value"><?php echo htmlspecialchars($postData[$field]); ?></div>
                            </div>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Cart/Services -->
            <?php
            if (isset($postData['cart'])):
                $cartItems = is_array($postData['cart']) ? $postData['cart'] : [$postData['cart']];
                if (!empty($cartItems)):
            ?>
            <div class="data-card">
                <div class="card-header-custom">
                    <i class="fas fa-shopping-cart me-2"></i>Selected Services
                </div>
                <div class="card-body-custom">
                    <div style="overflow-x: auto;">
                        <table class="table table-sm table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Service</th>
                                    <th>Price</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($cartItems as $item): ?>
                                    <?php 
                                    if (is_array($item)) {
                                        $service = htmlspecialchars($item['service'] ?? '');
                                        $price = htmlspecialchars($item['price'] ?? '');
                                        $type = htmlspecialchars($item['type'] ?? '');
                                    } else {
                                        $service = htmlspecialchars($item);
                                        $price = '';
                                        $type = '';
                                    }
                                    ?>
                                    <tr>
                                        <td><?php echo $service; ?></td>
                                        <td><?php echo $price; ?></td>
                                        <td><?php echo $type; ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <?php 
                endif;
            endif;
            ?>

            <!-- Additional/All Fields -->
            <?php
            $knownFields = array_merge($personalFields, $golfFields, $emergencyFields, $paymentFields, ['cart']);
            $additionalFields = array_diff_key($postData, array_flip($knownFields));
            if (!empty($additionalFields)):
            ?>
            <div class="data-card">
                <div class="card-header-custom">
                    <i class="fas fa-folder-open me-2"></i>Additional Fields
                </div>
                <div class="card-body-custom">
                    <?php foreach ($additionalFields as $key => $value): ?>
                        <div class="data-row">
                            <div class="data-label"><?php echo htmlspecialchars($key); ?></div>
                            <div class="data-value">
                                <?php 
                                if (is_array($value)) {
                                    echo htmlspecialchars(json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                                } else {
                                    echo htmlspecialchars($value);
                                }
                                ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Raw POST Data for Reference -->
            <div class="data-card">
                <div class="card-header-custom">
                    <i class="fas fa-code me-2"></i>Raw POST Data (JSON)
                </div>
                <div class="card-body-custom">
                    <pre style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 3px solid #667eea; margin: 0; overflow-x: auto;"><?php echo htmlspecialchars(json_encode($postData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)); ?></pre>
                </div>
            </div>

        <?php endif; ?>

        <!-- Action Buttons -->
        <div class="button-group">
            <a href="../index.html" class="btn btn-primary">
                <i class="fas fa-home me-2"></i>Back to Home
            </a>
            <button type="button" class="btn btn-secondary" onclick="window.print()">
                <i class="fas fa-print me-2"></i>Print Results
            </button>
            <button type="button" class="btn btn-info" onclick="location.reload()">
                <i class="fas fa-sync-alt me-2"></i>Refresh
            </button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
