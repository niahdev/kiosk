const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { translations } = require("../kiosk-i18n");

test("renders completed projects before waiting for deployment checks", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );
  const renderIndex = source.indexOf("renderProjectsTable();");
  const checkIndex = source.indexOf("await attachFrameStatuses(completedProjects)");

  assert.notEqual(renderIndex, -1);
  assert.notEqual(checkIndex, -1);
  assert.ok(renderIndex < checkIndex);
});

test("shows checking, reachable, blocked, and failed deployment states", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );

  ["checking", "available", "newWindowAvailable", "connectionCheckFailed"].forEach((key) => {
    assert.ok(source.includes(`t("${key}")`), `${key} 번역 상태가 필요합니다.`);
    assert.ok(translations.ko[key]);
    assert.ok(translations.en[key]);
    assert.ok(translations.ar[key]);
  });
});

test("treats an HTTP error response as a failed portfolio connection", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );

  assert.ok(source.includes("project.frameStatus.reachable === false"));
  assert.ok(source.includes("project.frameStatus.notFound"));
  assert.ok(source.includes('return t("unavailable")'));
});

test("treats an incomplete connection check as unavailable everywhere", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );

  assert.match(
    source,
    /project\.frameStatus\.checked === false\) return t\("unavailable"\)/
  );
  assert.match(
    source,
    /project\.frameStatus\.checked !== false\s*&&\s*project\.frameStatus\.reachable !== false/
  );
});

test("uses a cached project frame status before requesting a new check", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );

  assert.match(source, /frameStatus:\s*project\.frameStatus\s*\|\|/);
});

test("shows every project for a selected user with only its comment count", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );
  const start = source.indexOf("function openUserModal(user)");
  const end = source.indexOf("function closeUserModal()", start);
  const modalSource = source.slice(start, end);

  assert.ok(source.includes("allProjects = data.projects"));
  assert.ok(modalSource.includes("allProjects.filter"));
  assert.ok(modalSource.includes("project.commentCount"));
  assert.ok(!modalSource.includes("project.progress"));
  assert.ok(!modalSource.includes("project.latestComment"));
});

test("maps kiosk student ids to names instead of showing the name placeholder", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );

  assert.ok(source.includes('kopo01: "강태욱"'));
  assert.ok(source.includes('kopo17: "주갑열"'));
  assert.ok(source.includes('kopo33: "조현명"'));
  assert.ok(source.includes('studentNames[user.studentId] || t("nameNotRegistered")'));
  assert.ok(!source.includes("<span>여기에 이름 입력</span>"));
});

test("omits project progress and recommended schedule from the preview modal", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );

  assert.ok(!source.includes("modalProjectProgress"));
  assert.ok(!source.includes("projectScheduleList"));
  assert.ok(!source.includes("추천 일정"));
  assert.ok(!source.includes("renderRecommendedSchedule"));
});

test("omits professor feedback from the preview modal", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );

  assert.ok(!source.includes("modalProfessorFeedback"));
  assert.ok(!source.includes("피드백 (교수님)"));
});

test("places the optional project description after deployment and before comments", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );
  const deploymentIndex = source.indexOf('id="deploymentBlock"');
  const descriptionIndex = source.indexOf('id="projectDescriptionBlock"');
  const commentsIndex = source.indexOf('id="modalCommentList"');

  assert.ok(deploymentIndex < descriptionIndex);
  assert.ok(descriptionIndex < commentsIndex);
  assert.ok(source.includes("project.projectDescription"));
});

test("shows an optional GitHub repository directly below deployment", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );
  const deploymentIndex = source.indexOf('id="deploymentBlock"');
  const githubIndex = source.indexOf('id="githubBlock"');
  const descriptionIndex = source.indexOf('id="projectDescriptionBlock"');

  assert.ok(deploymentIndex < githubIndex);
  assert.ok(githubIndex < descriptionIndex);
  assert.ok(source.includes("project.githubUrl"));
  assert.ok(source.includes('window.open(activeGithubUrl, "_blank", "noopener")'));
});

test("uses localized project titles in cards, lists, and details", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );

  assert.ok(source.includes("formatLocalizedProjectName"));
  assert.ok(source.includes("getDisplayProjectName(project)"));
  assert.ok(source.includes("modalProjectName.textContent = getDisplayProjectName(project)"));
});

test("closes iframe-blocked external deployments after two minutes", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "kiosk.html"),
    "utf8"
  );

  assert.match(source, /EXTERNAL_WINDOW_TIMEOUT_MS\s*=\s*2 \* 60 \* 1000/);
  assert.match(source, /setTimeout\(\(\) => \{/);
  assert.match(source, /externalWindow\.close\(\)/);
  assert.match(source, /window\.focus\(\)/);
  assert.match(source, /openTimedExternalWindow\(project\.deploymentUrl\)/);
  assert.match(source, /window\.open\(url, "kioskExternalPreview"/);
  assert.doesNotMatch(source, /externalWindow\.opener\s*=\s*null/);
});
