<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/db.php';

define('ADMIN_PASSWORD', 'admin123');

function requireAuth() {
    if (empty($_SESSION['admin_logged_in'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
}

function mapCandidate($row) {
    return [
        'id'            => (int)$row['id'],
        'trackingNo'    => $row['tracking_no'],
        'fullName'      => $row['full_name'],
        'email'         => $row['email'],
        'phone'         => $row['phone'],
        'gender'        => $row['gender'],
        'country'       => $row['country'],
        'state'         => $row['state'],
        'education'     => $row['education'],
        'skill'         => $row['skill'],
        'laptop'        => $row['laptop'],
        'internet'      => $row['internet'],
        'reason'        => $row['reason'],
        'status'        => $row['status'],
        'paymentStatus' => $row['payment_status'],
        'paymentRef'    => $row['payment_ref'],
        'date'          => date('M j, Y, g:i:s A', strtotime($row['created_at']))
    ];
}

$action = $_REQUEST['action'] ?? '';

switch ($action) {

    case 'login':
        $data = json_decode(file_get_contents('php://input'), true);
        $pass = $data['password'] ?? '';
        if ($pass === ADMIN_PASSWORD) {
            $_SESSION['admin_logged_in'] = true;
            echo json_encode(['success' => true, 'message' => 'Login successful']);
        } else {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Incorrect password']);
        }
        break;

    case 'logout':
        $_SESSION['admin_logged_in'] = false;
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logged out']);
        break;

    case 'check_session':
        echo json_encode(['success' => true, 'loggedIn' => !empty($_SESSION['admin_logged_in'])]);
        break;

    case 'get_candidates':
        requireAuth();
        $result = $conn->query("SELECT * FROM candidates ORDER BY created_at DESC");
        $candidates = [];
        while ($row = $result->fetch_assoc()) {
            $candidates[] = mapCandidate($row);
        }
        echo json_encode(['success' => true, 'data' => $candidates]);
        break;

    case 'get_messages':
        requireAuth();
        $result = $conn->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $messages[] = [
                'id'      => (int)$row['id'],
                'name'    => $row['name'],
                'email'   => $row['email'],
                'subject' => $row['subject'],
                'message' => $row['message'],
                'status'  => $row['status'],
                'date'    => date('M j, Y, g:i:s A', strtotime($row['created_at']))
            ];
        }
        echo json_encode(['success' => true, 'data' => $messages]);
        break;

    case 'get_stats':
        requireAuth();
        $total    = $conn->query("SELECT COUNT(*) AS c FROM candidates")->fetch_assoc()['c'];
        $approved = $conn->query("SELECT COUNT(*) AS c FROM candidates WHERE status='Approved'")->fetch_assoc()['c'];
        $rejected = $conn->query("SELECT COUNT(*) AS c FROM candidates WHERE status='Rejected'")->fetch_assoc()['c'];
        $paid     = $conn->query("SELECT COUNT(*) AS c FROM candidates WHERE payment_status='Paid'")->fetch_assoc()['c'];
        $messages = $conn->query("SELECT COUNT(*) AS c FROM contact_messages")->fetch_assoc()['c'];
        echo json_encode([
            'success' => true,
            'data'    => [
                'total'    => (int)$total,
                'approved' => (int)$approved,
                'rejected' => (int)$rejected,
                'paid'     => (int)$paid,
                'messages' => (int)$messages
            ]
        ]);
        break;

    case 'update_status':
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $id     = (int)$data['id'];
        $status = $conn->real_escape_string($data['status']);
        $conn->query("UPDATE candidates SET status='$status' WHERE id=$id");
        echo json_encode(['success' => true, 'message' => 'Status updated']);
        break;

    case 'update_payment':
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $id      = (int)$data['id'];
        $payStat = $conn->real_escape_string($data['paymentStatus']);
        $payRef  = $conn->real_escape_string($data['paymentRef'] ?? '');
        $conn->query("UPDATE candidates SET payment_status='$payStat', payment_ref='$payRef' WHERE id=$id");
        echo json_encode(['success' => true, 'message' => 'Payment status updated']);
        break;

    case 'delete_candidate':
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = (int)$data['id'];
        $conn->query("DELETE FROM candidates WHERE id=$id");
        echo json_encode(['success' => true, 'message' => 'Candidate deleted']);
        break;

    case 'mark_read':
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = (int)$data['id'];
        $conn->query("UPDATE contact_messages SET status='Read' WHERE id=$id");
        echo json_encode(['success' => true, 'message' => 'Message marked as read']);
        break;

    case 'delete_message':
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = (int)$data['id'];
        $conn->query("DELETE FROM contact_messages WHERE id=$id");
        echo json_encode(['success' => true, 'message' => 'Message deleted']);
        break;

    case 'clear_candidates':
        requireAuth();
        $conn->query("TRUNCATE TABLE candidates");
        echo json_encode(['success' => true, 'message' => 'All candidates cleared']);
        break;

    case 'clear_messages':
        requireAuth();
        $conn->query("TRUNCATE TABLE contact_messages");
        echo json_encode(['success' => true, 'message' => 'All messages cleared']);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Unknown action']);
}
