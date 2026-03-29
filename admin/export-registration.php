<?php
/**
 * Secretary Registration CSV Export
 * Provides filters and CSV download for registration records.
 */

require_once '../includes/config.php';

function html_escape($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function normalize_status($value) {
    return strtoupper(trim((string)$value));
}

function status_label($status) {
    if ($status === 'P') {
        return 'Pending';
    }
    if ($status === 'R') {
        return 'Registered';
    }
    if ($status === 'W') {
        return 'Withdraw';
    }
    return 'All';
}

function yes_no_label($value) {
    return ((int)$value === 1) ? 'Yes' : 'No';
}

function clean_date_input($value) {
    $value = trim((string)$value);
    if ($value === '') {
        return '';
    }

    $dt = DateTime::createFromFormat('Y-m-d', $value);
    if ($dt && $dt->format('Y-m-d') === $value) {
        return $value;
    }

    return '';
}

$allowedStatuses = ['ALL', 'P', 'R', 'W'];
$errors = [];

$statusFilter = normalize_status($_GET['status'] ?? 'ALL');
if (!in_array($statusFilter, $allowedStatuses, true)) {
    $statusFilter = 'ALL';
}

$startDate = clean_date_input($_GET['start_date'] ?? '');
$endDate = clean_date_input($_GET['end_date'] ?? '');
$shouldDownload = isset($_GET['download']) && (string)$_GET['download'] === '1';

if ($startDate !== '' && $endDate !== '' && $startDate > $endDate) {
    $errors[] = 'Start date must be before or equal to end date.';
}

$mysqli = new mysqli($db_host, $db_username, $db_password, $db_name);
if ($mysqli->connect_error) {
    $errors[] = 'Database connection failed.';
}

if (empty($errors)) {
    $mysqli->set_charset('utf8mb4');
}

if ($shouldDownload && empty($errors)) {
  $sql = 'SELECT r.registration_id,
                 r.registration_status,
                 r.first_name,
                 r.last_name,
                 r.email,
                 ph.LongName as phone_type,
                 r.phone,
                 r.address,
                 r.city,
                 r.state,
                 r.zip_code,
                 r.country,
                 r.age,
                 g.LongName as gender,
                 r.hole_18_average,
                 c.LongName as org_id,
                 r.sedga_hall_of_fame,
                 r.sedga_officer,
                 r.ghin_number,
                 r.emergency_name,
                 re.LongName as emergency_relationship,
                 r.emergency_email,
                 em.LongName as emergency_phone_type,
                 r.emergency_phone,
                 sp.LongName as send_payment,
                 r.send_username,
                 rp.LongName as receive_payment,
                 r.receive_username,
                 r.total_amount,
                 r.registration_date,
                 r.last_updated,
                 ex.Open,
                 ex.Seniors,
                 ex.Awards_Luncheon,
                 ex.Skins_Tuesday,
                 ex.Skins_Wednesday,
                 ex.Skins_Thursday,
                 ex.Super_Seniors_3,
                 ex.Super_Seniors_2,
                 ex.Handicap,
                 ex.SEDGA_Officer,
                 ex.Awards_Discount,
                 ex.Members_due,
                 ex.Women
            FROM registrations r
                      LEFT JOIN vw_clubs c ON c.FieldValue = r.org_id
                      LEFT JOIN vw_phonetypes ph ON ph.FieldValue = r.phone_type
                      LEFT JOIN vw_genders g ON g.FieldValue = r.gender
                      LEFT JOIN vw_phonetypes em ON em.FieldValue = r.emergency_phone_type
                      LEFT JOIN vw_relationships re ON re.FieldValue = r.emergency_relationship
                      LEFT JOIN vw_send_payments sp ON sp.FieldValue = r.send_payment
                      LEFT JOIN vw_receive_payments rp ON rp.FieldValue = r.receive_payment
                      LEFT JOIN vw_export_registrations ex ON ex.registration_id = r.registration_id';

    $whereParts = [];
    $params = [];
    $types = '';

    if ($statusFilter !== 'ALL') {
        $whereParts[] = 'r.registration_status = ?';
        $types .= 's';
        $params[] = $statusFilter;
    }

    if ($startDate !== '') {
        $whereParts[] = 'DATE(r.registration_date) >= ?';
        $types .= 's';
        $params[] = $startDate;
    }

    if ($endDate !== '') {
        $whereParts[] = 'DATE(r.registration_date) <= ?';
        $types .= 's';
        $params[] = $endDate;
    }

    if (!empty($whereParts)) {
        $sql .= ' WHERE ' . implode(' AND ', $whereParts);
    }

    $sql .= ' GROUP BY r.registration_id ORDER BY r.registration_id DESC';

    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        $errors[] = 'Failed to prepare export query.';
    } else {
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        if (!$stmt->execute()) {
            $errors[] = 'Failed to run export query.';
        } else {
            $result = $stmt->get_result();

            $fileDate = date('Ymd');
            $fileName = 'registrations_export_' . $fileDate . '.csv';

            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename=' . $fileName);
            header('Pragma: no-cache');
            header('Expires: 0');

            $output = fopen('php://output', 'w');

            fputcsv($output, [
                'Registration ID',
                'Status',
                'First Name',
                'Last Name',
                'Email',
                'Phone Type',
                'Phone',
                'Address',
                'City',
                'State',
                'Zip Code',
                'Country',
                'Age',
                'Gender',
                '18-Hole Average',
                'Organization ID',
                'SEDGA Officer',
                'SEDGA Hall of Fame',
                'GHIN Number',
                'Emergency Name',
                'Emergency Relationship',
                'Emergency Email',
                'Emergency Phone Type',
                'Emergency Phone',
                'Send Payment Type',
                'Send Username',
                'Receive Payment Type',
                'Receive Username',
                'Total Amount',
                'Registration Date',
                'Last Updated',
                'Open',
                'Seniors',
                'Super Seniors 3-Day',
                'Super Seniors 2-Day',
                'Women',
                'Awards Luncheon',
                'Skins Tuesday',
                'Skins Wednesday',
                'Skins Thursday',
                'Handicap',
                'SEDGA Officer',
                'Awards Discount',
                'Members Due'
            ]);

            while ($row = $result->fetch_assoc()) {
                fputcsv($output, [
                    $row['registration_id'] ?? '',
                    $row['registration_status'] ?? '',
                    $row['first_name'] ?? '',
                    $row['last_name'] ?? '',
                    $row['email'] ?? '',
                    $row['phone_type'] ?? '',
                    $row['phone'] ?? '',
                    $row['address'] ?? '',
                    $row['city'] ?? '',
                    $row['state'] ?? '',
                    $row['zip_code'] ?? '',
                    $row['country'] ?? '',
                    $row['age'] ?? '',
                    $row['gender'] ?? '',
                    $row['hole_18_average'] ?? '',
                    $row['org_id'] ?? '',
                    yes_no_label($row['sedga_officer'] ?? 0),
                    yes_no_label($row['sedga_hall_of_fame'] ?? 0),
                    $row['ghin_number'] ?? '',
                    $row['emergency_name'] ?? '',
                    $row['emergency_relationship'] ?? '',
                    $row['emergency_email'] ?? '',
                    $row['emergency_phone_type'] ?? '',
                    $row['emergency_phone'] ?? '',
                    $row['send_payment'] ?? '',
                    $row['send_username'] ?? '',
                    $row['receive_payment'] ?? '',
                    $row['receive_username'] ?? '',
                    $row['total_amount'] ?? '',
                    $row['registration_date'] ?? '',
                    $row['last_updated'] ?? '',
                    $row['Open'] ?? '',
                    $row['Seniors'] ?? '',
                    $row['Super_Seniors_3'] ?? '',
                    $row['Super_Seniors_2'] ?? '',
                    $row['Women'] ?? '',
                    $row['Awards_Luncheon'] ?? '',
                    $row['Skins_Tuesday'] ?? '',
                    $row['Skins_Wednesday'] ?? '',
                    $row['Skins_Thursday'] ?? '', 
                    $row['Handicap'] ?? '',
                    $row['SEDGA_Officer'] ?? 0,
                    $row['Awards_Discount'] ?? '',
                    $row['Members_due'] ?? ''
                ]);
            }

            fclose($output);
            $stmt->close();
            $mysqli->close();
            exit;
        }

        if ($stmt) {
            $stmt->close();
        }
    }
}

$matchingCount = 0;
if (empty($errors)) {
    $countSql = 'SELECT COUNT(*) AS cnt FROM registrations r';
    $whereParts = [];
    $params = [];
    $types = '';

    if ($statusFilter !== 'ALL') {
        $whereParts[] = 'r.registration_status = ?';
        $types .= 's';
        $params[] = $statusFilter;
    }

    if ($startDate !== '') {
        $whereParts[] = 'DATE(r.registration_date) >= ?';
        $types .= 's';
        $params[] = $startDate;
    }

    if ($endDate !== '') {
        $whereParts[] = 'DATE(r.registration_date) <= ?';
        $types .= 's';
        $params[] = $endDate;
    }

    if (!empty($whereParts)) {
        $countSql .= ' WHERE ' . implode(' AND ', $whereParts);
    }

    $countStmt = $mysqli->prepare($countSql);
    if ($countStmt) {
        if (!empty($params)) {
            $countStmt->bind_param($types, ...$params);
        }
        if ($countStmt->execute()) {
            $countResult = $countStmt->get_result();
            $countRow = $countResult->fetch_assoc();
            $matchingCount = (int)($countRow['cnt'] ?? 0);
        }
        $countStmt->close();
    }
}

if ($mysqli && $mysqli->ping()) {
    $mysqli->close();
}

include('../menus/return_menu.php');

include '../html/header.php';
?>

<div class="container py-4">
    <div class="card shadow-sm mb-4">
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
                <i class="fas fa-file-csv me-2"></i>Secretary CSV Export
            </h5>
        </div>
        <div class="card-body">
            <p class="text-muted mb-3">Filter registrations and download a CSV file for reporting.</p>

            <?php if (!empty($errors)) { ?>
                <div class="alert alert-danger">
                    <?php echo html_escape(implode(' ', $errors)); ?>
                </div>
            <?php } ?>

            <form method="get" action="" class="row g-3 align-items-end">
                <div class="col-12 col-md-3">
                    <label for="status" class="form-label">Status</label>
                    <select id="status" name="status" class="form-select">
                        <option value="ALL"<?php echo $statusFilter === 'ALL' ? ' selected' : ''; ?>>All</option>
                        <option value="P"<?php echo $statusFilter === 'P' ? ' selected' : ''; ?>>Pending (P)</option>
                        <option value="R"<?php echo $statusFilter === 'R' ? ' selected' : ''; ?>>Registered (R)</option>
                        <option value="W"<?php echo $statusFilter === 'W' ? ' selected' : ''; ?>>Withdraw (W)</option>
                    </select>
                </div>

                <div class="col-12 col-md-3">
                    <label for="start_date" class="form-label">Start Date</label>
                    <input id="start_date" name="start_date" type="date" class="form-control" value="<?php echo html_escape($startDate); ?>">
                </div>

                <div class="col-12 col-md-3">
                    <label for="end_date" class="form-label">End Date</label>
                    <input id="end_date" name="end_date" type="date" class="form-control" value="<?php echo html_escape($endDate); ?>">
                </div>

                <div class="col-12 col-md-3 d-flex gap-2">
                    <button type="submit" class="btn btn-outline-primary">Apply Filters</button>
                    <a href="export-registration.php" class="btn btn-outline-secondary">Reset</a>
                </div>

                <div class="col-12 d-flex flex-wrap align-items-center justify-content-between border-top pt-3 mt-2">
                    <div>
                        <strong><?php echo html_escape((string)$matchingCount); ?></strong>
                        <span class="text-muted">matching registration(s)</span>
                        <span class="text-muted ms-2">Status: <?php echo html_escape(status_label($statusFilter)); ?></span>
                    </div>
                    <button type="submit" name="download" value="1" class="btn btn-success">
                        <i class="fas fa-download me-1"></i>Download CSV
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php include '../html/footer.php'; ?>
