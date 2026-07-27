const mysql = require("mysql2/promise");
const { mapStudentRows } = require("./student-view");

function getDbConfig() {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "kiosk"
  };
}

async function createConnection() {
  return mysql.createConnection(getDbConfig());
}

async function ensureTableColumn(connection, tableName, columnName, columnDefinition) {
  const [databaseRows] = await connection.query("SELECT DATABASE() AS database_name");
  const databaseName = databaseRows[0].database_name;
  const [columnRows] = await connection.execute(
    `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?`,
    [databaseName, tableName, columnName]
  );

  if (columnRows.length === 0) {
    await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`);
  }
}

async function ensureStudentColumn(connection, columnName, columnDefinition) {
  await ensureTableColumn(connection, "student", columnName, columnDefinition);
}

async function ensureProjectTables(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS student_project (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(50) NOT NULL,
      project_name VARCHAR(255) NOT NULL,
      progress VARCHAR(100) NOT NULL,
      deployment_url VARCHAR(500) NULL,
      professor_feedback TEXT NULL,
      project_description LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_student_project (student_id, project_name)
    )
  `);

  await ensureTableColumn(
    connection,
    "student_project",
    "deployment_url",
    "deployment_url VARCHAR(500) NULL AFTER progress"
  );
  await ensureTableColumn(
    connection,
    "student_project",
    "screenshot_path",
    "screenshot_path VARCHAR(500) NULL AFTER deployment_url"
  );
  await ensureTableColumn(
    connection,
    "student_project",
    "project_description",
    "project_description LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER professor_feedback"
  );

  await connection.query(`
    CREATE TABLE IF NOT EXISTS project_comment (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      comment_author VARCHAR(80) NOT NULL,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_project_comment_project
        FOREIGN KEY (project_id) REFERENCES student_project(id)
        ON DELETE CASCADE
    )
  `);

  await ensureTableColumn(
    connection,
    "project_comment",
    "comment_author",
    "comment_author VARCHAR(80) NOT NULL DEFAULT '' AFTER project_id"
  );

  await connection.query(`
    CREATE TABLE IF NOT EXISTS project_view_event (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      event_type VARCHAR(40) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_project_view_event_project (project_id),
      CONSTRAINT fk_project_view_event_project
        FOREIGN KEY (project_id) REFERENCES student_project(id)
        ON DELETE CASCADE
    )
  `);
}

async function ensureSettingTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS app_setting (
      setting_key VARCHAR(80) PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

async function fetchSettings() {
  const connection = await createConnection();
  try {
    await ensureSettingTable(connection);
    const [rows] = await connection.query("SELECT setting_key, setting_value FROM app_setting");
    const settings = { deadline: "2026-07-31" };

    rows.forEach((row) => {
      settings[String(row.setting_key)] = String(row.setting_value ?? "");
    });

    return settings;
  } finally {
    await connection.end();
  }
}

async function saveDeadline(deadline) {
  const connection = await createConnection();
  try {
    await ensureSettingTable(connection);
    await connection.execute(
      `INSERT INTO app_setting (setting_key, setting_value)
       VALUES ('deadline', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [deadline]
    );

    return { deadline };
  } finally {
    await connection.end();
  }
}

function mapProjectRows(rows) {
  return rows.map((row) => ({
    id: Number(row.id),
    studentId: String(row.student_id ?? ""),
    projectName: String(row.project_name ?? ""),
    progress: String(row.progress ?? ""),
    deploymentUrl: String(row.deployment_url ?? ""),
    screenshotPath: String(row.screenshot_path ?? ""),
    professorFeedback: String(row.professor_feedback ?? ""),
    projectDescription: String(row.project_description ?? ""),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : "",
    latestComment: String(row.latest_comment ?? ""),
    commentCount: Number(row.comment_count ?? 0),
    viewCount: Number(row.view_count ?? 0)
  }));
}

async function fetchProjectRows(connection) {
  const [rows] = await connection.query(`
    SELECT
      p.id,
      p.student_id,
      p.project_name,
      p.progress,
      p.deployment_url,
      p.screenshot_path,
      p.professor_feedback,
      p.project_description,
      p.updated_at,
      (
        SELECT c.comment_text
        FROM project_comment c
        WHERE c.project_id = p.id
        ORDER BY c.created_at DESC, c.id DESC
        LIMIT 1
      ) AS latest_comment,
      (
        SELECT COUNT(*)
        FROM project_comment c
        WHERE c.project_id = p.id
      ) AS comment_count,
      (
        SELECT COUNT(*)
        FROM project_view_event v
        WHERE v.project_id = p.id
      ) AS view_count
    FROM student_project p
    ORDER BY p.student_id, p.project_name
  `);

  return mapProjectRows(rows);
}

async function fetchProjects() {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    return await fetchProjectRows(connection);
  } finally {
    await connection.end();
  }
}

async function fetchProjectById(projectId) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    const [rows] = await connection.execute(
      `
        SELECT
          id,
          student_id,
          project_name,
          progress,
          deployment_url,
          screenshot_path,
          professor_feedback,
          project_description,
          (
            SELECT COUNT(*)
            FROM project_view_event v
            WHERE v.project_id = student_project.id
          ) AS view_count
        FROM student_project
        WHERE id = ?
      `,
      [projectId]
    );

    if (rows.length === 0) {
      return null;
    }

    const [comments] = await connection.execute(
      `
        SELECT id, comment_author, comment_text, created_at
        FROM project_comment
        WHERE project_id = ?
        ORDER BY created_at ASC, id ASC
      `,
      [projectId]
    );

    return {
      id: Number(rows[0].id),
      studentId: String(rows[0].student_id ?? ""),
      projectName: String(rows[0].project_name ?? ""),
      progress: String(rows[0].progress ?? ""),
      deploymentUrl: String(rows[0].deployment_url ?? ""),
      screenshotPath: String(rows[0].screenshot_path ?? ""),
      professorFeedback: String(rows[0].professor_feedback ?? ""),
      projectDescription: String(rows[0].project_description ?? ""),
      viewCount: Number(rows[0].view_count ?? 0),
      comments: comments.map((comment) => ({
        id: Number(comment.id),
        author: String(comment.comment_author ?? ""),
        comment: String(comment.comment_text ?? ""),
        createdAt: new Date(comment.created_at).toISOString()
      }))
    };
  } finally {
    await connection.end();
  }
}

async function saveProject(project) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    await connection.execute(
      `
        INSERT INTO student_project (student_id, project_name, progress, deployment_url, professor_feedback, project_description)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          progress = VALUES(progress),
          deployment_url = VALUES(deployment_url),
          professor_feedback = VALUES(professor_feedback),
          project_description = VALUES(project_description)
      `,
      [
        project.studentId,
        project.projectName,
        project.progress,
        project.deploymentUrl,
        project.professorFeedback,
        project.projectDescription
      ]
    );

    const [rows] = await connection.execute(
      `
        SELECT id, student_id, project_name, progress, deployment_url, screenshot_path, professor_feedback, project_description
        FROM student_project
        WHERE student_id = ? AND project_name = ?
      `,
      [project.studentId, project.projectName]
    );

    return {
      id: Number(rows[0].id),
      studentId: String(rows[0].student_id ?? ""),
      projectName: String(rows[0].project_name ?? ""),
      progress: String(rows[0].progress ?? ""),
      deploymentUrl: String(rows[0].deployment_url ?? ""),
      screenshotPath: String(rows[0].screenshot_path ?? ""),
      professorFeedback: String(rows[0].professor_feedback ?? ""),
      projectDescription: String(rows[0].project_description ?? "")
    };
  } finally {
    await connection.end();
  }
}

async function updateProjectById(projectId, project) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    const [result] = await connection.execute(
      `
        UPDATE student_project
        SET student_id = ?,
            project_name = ?,
            progress = ?,
            deployment_url = ?,
            professor_feedback = ?,
            project_description = COALESCE(?, project_description)
        WHERE id = ?
      `,
      [
        project.studentId,
        project.projectName,
        project.progress,
        project.deploymentUrl,
        project.professorFeedback,
        project.projectDescription,
        projectId
      ]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return fetchProjectById(projectId);
  } finally {
    await connection.end();
  }
}

async function deleteProjectById(projectId) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    const [result] = await connection.execute("DELETE FROM student_project WHERE id = ?", [projectId]);
    return { id: projectId, deleted: result.affectedRows > 0 };
  } finally {
    await connection.end();
  }
}

async function updateProjectScreenshotPath(projectId, screenshotPath) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    const [result] = await connection.execute(
      "UPDATE student_project SET screenshot_path = ? WHERE id = ?",
      [screenshotPath, projectId]
    );
    return { id: projectId, screenshotPath, updated: result.affectedRows > 0 };
  } finally {
    await connection.end();
  }
}

async function addProjectViewEvent(projectId, eventType) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    const [result] = await connection.execute(
      "INSERT INTO project_view_event (project_id, event_type) VALUES (?, ?)",
      [projectId, eventType]
    );
    return { id: Number(result.insertId), projectId, eventType };
  } finally {
    await connection.end();
  }
}

async function addProjectComment(projectId, comment) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    const [result] = await connection.execute(
      "INSERT INTO project_comment (project_id, comment_author, comment_text) VALUES (?, ?, ?)",
      [projectId, comment.author, comment.comment]
    );

    const [rows] = await connection.execute(
      "SELECT id, comment_author, comment_text, created_at FROM project_comment WHERE id = ?",
      [result.insertId]
    );

    return {
      id: Number(rows[0].id),
      author: String(rows[0].comment_author ?? ""),
      comment: String(rows[0].comment_text ?? ""),
      createdAt: new Date(rows[0].created_at).toISOString()
    };
  } finally {
    await connection.end();
  }
}

async function fetchStudents() {
  const connection = await createConnection();
  try {
    await ensureStudentColumn(connection, "comment", "comment TEXT NULL");
    const [rows] = await connection.query("SELECT id, progress, comment FROM student ORDER BY id LIMIT 30");
    return mapStudentRows(rows);
  } finally {
    await connection.end();
  }
}

async function saveStudentProgress(student) {
  const connection = await createConnection();
  try {
    await connection.execute(
      `INSERT INTO student (id, progress)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE progress = VALUES(progress)`,
      [student.id, student.progress]
    );
    return student;
  } finally {
    await connection.end();
  }
}

async function saveStudentComment(id, comment) {
  const connection = await createConnection();
  try {
    await ensureStudentColumn(connection, "comment", "comment TEXT NULL");
    const [result] = await connection.execute(
      "UPDATE student SET comment = ? WHERE id = ?",
      [comment, id]
    );

    return { id, comment, updated: result.affectedRows > 0 };
  } finally {
    await connection.end();
  }
}

async function deleteStudentById(id) {
  const connection = await createConnection();
  try {
    const [result] = await connection.execute("DELETE FROM student WHERE id = ?", [id]);
    return { id, deleted: result.affectedRows > 0 };
  } finally {
    await connection.end();
  }
}

async function checkStudentTable() {
  const connection = await createConnection();
  try {
    const [databaseRows] = await connection.query("SELECT DATABASE() AS database_name");
    const [tableRows] = await connection.query("SHOW TABLES LIKE 'student'");
    const [countRows] = await connection.query("SELECT COUNT(*) AS row_count FROM student");
    const [sampleRows] = await connection.query("SELECT * FROM student LIMIT 3");

    return {
      database: databaseRows[0].database_name,
      tableExists: tableRows.length > 0,
      rowCount: Number(countRows[0].row_count),
      sample: mapStudentRows(sampleRows)
    };
  } finally {
    await connection.end();
  }
}

module.exports = {
  fetchSettings,
  saveDeadline,
  fetchProjects,
  fetchProjectById,
  saveProject,
  updateProjectById,
  deleteProjectById,
  updateProjectScreenshotPath,
  addProjectViewEvent,
  addProjectComment,
  fetchStudents,
  saveStudentProgress,
  saveStudentComment,
  deleteStudentById,
  checkStudentTable,
  getDbConfig,
  mapProjectRows
};
