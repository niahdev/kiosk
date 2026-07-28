CREATE TABLE IF NOT EXISTS student (
    id VARCHAR(50) PRIMARY KEY,
    progress VARCHAR(100),
    comment TEXT NULL
);

CREATE TABLE IF NOT EXISTS student_project (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    progress VARCHAR(100) NOT NULL,
    deployment_url VARCHAR(500) NULL,
    github_url VARCHAR(500) NULL,
    screenshot_path VARCHAR(500) NULL,
    professor_feedback TEXT NULL,
    project_description LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student_project (student_id, project_name)
);

CREATE TABLE IF NOT EXISTS project_comment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    comment_author VARCHAR(80) NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_comment_project
      FOREIGN KEY (project_id) REFERENCES student_project(id)
      ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_view_event (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project_view_event_project (project_id),
    CONSTRAINT fk_project_view_event_project
      FOREIGN KEY (project_id) REFERENCES student_project(id)
      ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_setting (
    setting_key VARCHAR(80) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
