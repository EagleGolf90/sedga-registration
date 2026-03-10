<?php
/**
 * Officer Registration Status Listing
 * Allows bulk status updates for P/R.
 */

require_once '../includes/config.php';

$messages = [];
$errors = [];

function normalize_status($value) {
    return strtoupper(trim((string)$value));
}

function html_escape($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function status_label($status) {
    $normalized = normalize_status($status);
    if ($normalized === 'P') {
        return 'Pending';
    }
    if ($normalized === 'R') {
        return 'Registered';
    }
    return $normalized;
}

function load_event_category_names() {
    $pricesPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'prices-data.json';
    if (!is_readable($pricesPath)) {
        return [];
    }

    $raw = file_get_contents($pricesPath);
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded) || !isset($decoded['eventCategories']) || !is_array($decoded['eventCategories'])) {
        return [];
    }

    $names = [];
    foreach ($decoded['eventCategories'] as $category) {
        if (!is_array($category)) {
            continue;
        }
        $name = trim((string)($category['name'] ?? ''));
        if ($name !== '') {
            $names[] = $name;
        }
    }

    return array_values(array_unique($names));
}

$mysqli = new mysqli($db_host, $db_username, $db_password, $db_name);
if ($mysqli->connect_error) {
    $errors[] = 'Database connection failed.';
} else {
    $mysqli->set_charset('utf8mb4');
}

$allowedUpdateStatuses = ['P', 'R'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($errors)) {
    $updateStatus = normalize_status($_POST['bulk_status'] ?? '');
    $selectedIds = $_POST['registration_ids'] ?? [];

    if (!in_array($updateStatus, $allowedUpdateStatuses, true)) {
        $errors[] = 'Invalid status selected for update.';
    }

    if (!is_array($selectedIds) || count($selectedIds) === 0) {
        $errors[] = 'Please select at least one registration.';
    }

    $cleanIds = [];
    if (empty($errors)) {
        foreach ($selectedIds as $value) {
            $id = (int)$value;
            if ($id > 0) {
                $cleanIds[$id] = true;
            }
        }
        $cleanIds = array_keys($cleanIds);
    }

    if (empty($errors) && count($cleanIds) === 0) {
        $errors[] = 'No valid registration IDs were selected.';
    }

    if (empty($errors)) {
        $mysqli->begin_transaction();
        try {
            $stmt = $mysqli->prepare('UPDATE registrations SET registration_status = ?, last_updated = NOW() WHERE registration_id = ?');
            if (!$stmt) {
                throw new Exception('Failed to prepare status update statement.');
            }

            foreach ($cleanIds as $registrationId) {
                $stmt->bind_param('si', $updateStatus, $registrationId);
                if (!$stmt->execute()) {
                    throw new Exception('Failed to update registration status.');
                }
            }

            $stmt->close();
            $mysqli->commit();
            $messages[] = 'Updated ' . count($cleanIds) . ' registration(s) to status ' . $updateStatus . '.';
        } catch (Exception $ex) {
            $mysqli->rollback();
            $errors[] = $ex->getMessage();
        }
    }
}

$statusFilter = normalize_status($_GET['status'] ?? 'ALL');
if ($statusFilter === '') {
    $statusFilter = 'ALL';
}

$statusOptions = [];
$registrations = [];
$divisionMap = [];

if (empty($errors)) {
    $statusResult = $mysqli->query('SELECT DISTINCT registration_status FROM registrations ORDER BY registration_status ASC');
    if ($statusResult) {
        while ($row = $statusResult->fetch_assoc()) {
            $status = normalize_status($row['registration_status'] ?? '');
            if ($status !== '') {
                $statusOptions[$status] = true;
            }
        }
        $statusResult->free();
    }

    $statusOptions = array_keys($statusOptions);
    sort($statusOptions);

    $query = 'SELECT registration_id, first_name, last_name, state, registration_status FROM registrations';
    $params = [];
    $types = '';
    if ($statusFilter !== 'ALL') {
        $query .= ' WHERE registration_status = ?';
        $params[] = $statusFilter;
        $types .= 's';
    }
    $query .= ' ORDER BY registration_id DESC';

    $stmt = $mysqli->prepare($query);
    if ($stmt) {
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            while ($row = $result->fetch_assoc()) {
                $registrations[] = $row;
            }
        }
        $stmt->close();
    }

    $eventCategoryNames = load_event_category_names();
    if (!empty($registrations) && !empty($eventCategoryNames)) {
        $registrationIds = array_column($registrations, 'registration_id');
        $registrationIds = array_values(array_filter(array_map('intval', $registrationIds)));

        if (!empty($registrationIds)) {
            $namePlaceholders = implode(',', array_fill(0, count($eventCategoryNames), '?'));
            $idPlaceholders = implode(',', array_fill(0, count($registrationIds), '?'));
            $itemSql =
                'SELECT registration_id, item_name '
                . 'FROM registrations_items '
                . 'WHERE item_name IN (' . $namePlaceholders . ') '
                . 'AND registration_id IN (' . $idPlaceholders . ') '
                . 'ORDER BY item_id ASC';

            $itemStmt = $mysqli->prepare($itemSql);
            if ($itemStmt) {
                $types = str_repeat('s', count($eventCategoryNames)) . str_repeat('i', count($registrationIds));
                $values = array_merge($eventCategoryNames, $registrationIds);
                $itemStmt->bind_param($types, ...$values);

                if ($itemStmt->execute()) {
                    $itemResult = $itemStmt->get_result();
                    while ($item = $itemResult->fetch_assoc()) {
                        $regId = (int)$item['registration_id'];
                        if ($regId <= 0 || isset($divisionMap[$regId])) {
                            continue;
                        }
                        $divisionMap[$regId] = $item['item_name'];
                    }
                }

                $itemStmt->close();
            }
        }
    }
}

if ($mysqli && $mysqli->ping()) {
    $mysqli->close();
}

include '../html/header.php';
?>

<div class="container py-4">
    <div class="card shadow-sm mb-4">
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
                <i class="fas fa-list-check me-2"></i>Registrants Status Updates
            </h5>
        </div>
        <div class="card-body">
            <p class="text-muted mb-3">Select registrations and apply a bulk status update.</p>

            <?php if (!empty($errors)) { ?>
                <div class="alert alert-danger">
                    <?php echo html_escape(implode(' ', $errors)); ?>
                </div>
            <?php } ?>

            <?php if (!empty($messages)) { ?>
                <div class="alert alert-success">
                    <?php echo html_escape(implode(' ', $messages)); ?>
                </div>
            <?php } ?>

            <div class="d-flex flex-wrap gap-2 mb-3">
                <a class="btn btn-outline-secondary<?php echo $statusFilter === 'ALL' ? ' active' : ''; ?>" href="?status=ALL">All statuses</a>
                <a class="btn btn-outline-secondary<?php echo $statusFilter === 'P' ? ' active' : ''; ?>" href="?status=P">Pending (P)</a>
                <a class="btn btn-outline-secondary<?php echo $statusFilter === 'R' ? ' active' : ''; ?>" href="?status=R">Registered (R)</a>
                <form class="d-flex align-items-center" method="get" action="">
                    <label for="statusFilter" class="me-2">Filter:</label>
                    <select id="statusFilter" name="status" class="form-select form-select-sm" style="width:auto;">
                        <option value="ALL"<?php echo $statusFilter === 'ALL' ? ' selected' : ''; ?>>All</option>
                        <?php foreach ($statusOptions as $status) { ?>
                            <option value="<?php echo html_escape($status); ?>"<?php echo $statusFilter === $status ? ' selected' : ''; ?>><?php echo html_escape(status_label($status)); ?></option>
                        <?php } ?>
                    </select>
                    <button type="submit" class="btn btn-sm btn-outline-primary ms-2">Apply</button>
                </form>
            </div>

            <form method="post" action="?status=<?php echo html_escape($statusFilter); ?>">
                <input type="hidden" name="status" value="<?php echo html_escape($statusFilter); ?>">
                <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
                    <select name="bulk_status" class="form-select form-select-sm" style="width:auto;">
                        <option value="">Bulk status...</option>
                        <option value="P">Pending (P)</option>
                        <option value="R">Registered (R)</option>
                    </select>
                    <button type="submit" class="btn btn-sm btn-success">Apply to Selected</button>
                    <span class="text-muted">Selected: <span id="selectedCount">0</span></span>
                </div>

                <div class="table-responsive">
                    <table class="table table-striped table-bordered align-middle">
                        <thead class="table-light">
                            <tr>
                                <th class="text-center" style="width:48px;">
                                    <input type="checkbox" id="selectAll" />
                                </th>
                                <th>Division</th>
                                <th>Register ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th class="text-center">State</th>
                                <th class="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (empty($registrations)) { ?>
                                <tr>
                                    <td colspan="7" class="text-center text-muted">No registrations found.</td>
                                </tr>
                            <?php } else { ?>
                                <?php foreach ($registrations as $row) {
                                    $registrationId = (int)($row['registration_id'] ?? 0);
                                    $status = normalize_status($row['registration_status'] ?? '');
                                    $state = (string)($row['state'] ?? '');
                                    $division = $divisionMap[$registrationId] ?? '';
                                    $statusClass = $status === 'P' ? 'text-danger' : ($status === 'R' ? 'text-primary' : 'text-muted');
                                ?>
                                    <tr>
                                        <td class="text-center">
                                            <?php if ($registrationId > 0) { ?>
                                                <input type="checkbox" name="registration_ids[]" value="<?php echo $registrationId; ?>" class="row-check" />
                                            <?php } ?>
                                        </td>
                                        <td><?php echo html_escape($division); ?></td>
                                        <td><?php echo html_escape($registrationId); ?></td>
                                        <td><?php echo html_escape($row['first_name'] ?? ''); ?></td>
                                        <td><?php echo html_escape($row['last_name'] ?? ''); ?></td>
                                        <td class="text-center"><?php echo html_escape($state); ?></td>
                                        <td class="text-center"><span class="fw-semibold <?php echo $statusClass; ?>"><?php echo html_escape(status_label($status)); ?></span></td>
                                    </tr>
                                <?php } ?>
                            <?php } ?>
                        </tbody>
                    </table>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    (function () {
        const selectAll = document.getElementById('selectAll');
        const checkboxes = Array.from(document.querySelectorAll('.row-check'));
        const selectedCount = document.getElementById('selectedCount');

        function updateCount() {
            const count = checkboxes.filter((box) => box.checked).length;
            if (selectedCount) {
                selectedCount.textContent = String(count);
            }
        }

        if (selectAll) {
            selectAll.addEventListener('change', function () {
                checkboxes.forEach((box) => {
                    box.checked = selectAll.checked;
                });
                updateCount();
            });
        }

        checkboxes.forEach((box) => {
            box.addEventListener('change', updateCount);
        });
    })();
</script>

<?php include '../html/footer.php'; ?>
