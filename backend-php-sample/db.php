<?php
$host = 'localhost';
$db   = 'afritech_training';
$user = 'root';
$pass = '';
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
  die(json_encode(['success'=>false,'message'=>'Database connection failed']));
}
?>