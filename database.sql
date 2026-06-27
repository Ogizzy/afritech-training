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

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO admin_users (username, password_hash)
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- After import, run PHP to update the hash:
-- php -r "\$conn = new mysqli('localhost','root','','afritech_training'); \$conn->query(\"UPDATE admin_users SET password_hash='\" . password_hash('afdic@2026#', PASSWORD_BCRYPT) . \"' WHERE username='admin'\");"