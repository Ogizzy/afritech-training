<?php
$host = 'localhost';
$db   = 'afdic_training';
$user = 'afdic_training';
$pass = '';
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
  die(json_encode(['success'=>false,'message'=>'Database connection failed']));
}
?>