CREATE DATABASE IF NOT EXISTS afritech_training;
USE afritech_training;

CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracking_no VARCHAR(30) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30) UNIQUE NOT NULL,
  gender VARCHAR(20),
  country VARCHAR(80),
  state VARCHAR(80),
  education VARCHAR(100),
  skill VARCHAR(100),
  laptop VARCHAR(20),
  internet VARCHAR(20),
  reason TEXT,
  status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  payment_status ENUM('Not Paid','Paid') DEFAULT 'Not Paid',
  payment_ref VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('Unread','Read') DEFAULT 'Unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);