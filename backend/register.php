<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

$required = ['fullName', 'email', 'phone', 'gender', 'country', 'state', 'education', 'skill', 'laptop', 'internet', 'reason'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "$field is required"]);
        exit;
    }
}

$fullName = $conn->real_escape_string(trim($data['fullName']));
$email    = strtolower(trim($conn->real_escape_string($data['email'])));
$phone    = $conn->real_escape_string(trim($data['phone']));
$gender   = $conn->real_escape_string($data['gender']);
$country  = $conn->real_escape_string($data['country']);
$state    = $conn->real_escape_string($data['state']);
$education = $conn->real_escape_string($data['education']);
$skill    = $conn->real_escape_string($data['skill']);
$laptop   = $conn->real_escape_string($data['laptop']);
$internet = $conn->real_escape_string($data['internet']);
$reason   = $conn->real_escape_string(trim($data['reason']));

$check = $conn->query("SELECT id FROM candidates WHERE email = '$email'");
if ($check && $check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'This email address has already been used for registration.']);
    exit;
}

$check = $conn->query("SELECT id FROM candidates WHERE phone = '$phone'");
if ($check && $check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'This phone number has already been used for registration.']);
    exit;
}

$year = date('Y');
$result = $conn->query("SELECT COUNT(*) AS cnt FROM candidates WHERE YEAR(created_at) = $year");
$count = $result ? (int)$result->fetch_assoc()['cnt'] + 1 : 1;
$trackingNo = sprintf("AFDIC-%s-%06d", $year, $count);

$sql = "INSERT INTO candidates (tracking_no, full_name, email, phone, gender, country, state, education, skill, laptop, internet, reason)
        VALUES ('$trackingNo', '$fullName', '$email', '$phone', '$gender', '$country', '$state', '$education', '$skill', '$laptop', '$internet', '$reason')";

if ($conn->query($sql)) {
    echo json_encode([
        'success'    => true,
        'trackingNo' => $trackingNo,
        'message'    => "Registration submitted successfully. Your tracking number is $trackingNo."
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}
