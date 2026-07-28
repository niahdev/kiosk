const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("loads and saves the long project description from the edit page", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "edit.html"),
    "utf8"
  );

  assert.ok(source.includes('id="projectDescription"'));
  assert.ok(source.includes("projectDescriptionInput.value = project.projectDescription || \"\""));
  assert.ok(source.includes("projectDescription: projectDescriptionInput.value"));
  assert.ok(source.includes("사용한 프롬프트 팁"));
  assert.ok(!source.includes("프로젝트 제작 과정 및 설명"));
});

test("uses the short prompt tips label on the insert page", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "insert.html"),
    "utf8"
  );

  assert.ok(source.includes("사용한 프롬프트 팁"));
  assert.ok(!source.includes("프로젝트 제작 과정 및 설명"));
});

test("loads and saves an optional GitHub repository URL on insert and edit pages", () => {
  const insertSource = fs.readFileSync(path.join(__dirname, "..", "insert.html"), "utf8");
  const editSource = fs.readFileSync(path.join(__dirname, "..", "edit.html"), "utf8");

  assert.ok(insertSource.includes('id="githubUrl"'));
  assert.ok(insertSource.includes("githubUrl: githubUrlInput.value"));
  assert.ok(editSource.includes('id="githubUrl"'));
  assert.ok(editSource.includes('githubUrlInput.value = project.githubUrl || ""'));
  assert.ok(editSource.includes("githubUrl: githubUrlInput.value"));
});
