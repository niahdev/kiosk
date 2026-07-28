const test = require("node:test");
const assert = require("node:assert/strict");
const { validateProjectInput, validateProjectCommentInput } = require("../project-input");

test("accepts project input for one student project", () => {
  assert.deepEqual(
    validateProjectInput({
      studentId: " kopo01 ",
      projectName: " 프로젝트 A ",
      progress: "프로토타입",
      deploymentUrl: " https://example.com/kopo01 ",
      githubUrl: " https://github.com/example/kopo01 ",
      professorFeedback: "README 보강",
      projectDescription: " 기획부터 배포까지\n직접 구현했습니다. "
    }),
    {
      ok: true,
      project: {
        studentId: "kopo01",
        projectName: "프로젝트 A",
        progress: "프로토타입",
        deploymentUrl: "https://example.com/kopo01",
        githubUrl: "https://github.com/example/kopo01",
        professorFeedback: "README 보강",
        projectDescription: "기획부터 배포까지\n직접 구현했습니다."
      }
    }
  );
});

test("rejects a repository url outside github.com", () => {
  assert.deepEqual(
    validateProjectInput({
      studentId: "kopo01",
      projectName: "프로젝트 A",
      progress: "기획",
      githubUrl: "https://gitlab.com/example/project"
    }),
    {
      ok: false,
      error: "GitHub 주소는 github.com 주소로 입력하세요."
    }
  );
});

test("preserves a long multilingual project description with line breaks", () => {
  const description = `사용 기술: Node.js, MySQL\n구현 과정: ${"상세 설명 ".repeat(2000)}`;
  const result = validateProjectInput({
    studentId: "kopo01",
    projectName: "포트폴리오",
    progress: "완료",
    deploymentUrl: "https://example.com",
    professorFeedback: "",
    projectDescription: description
  });

  assert.equal(result.ok, true);
  assert.equal(result.project.projectDescription, description.trim());
});

test("rejects invalid deployment url", () => {
  assert.deepEqual(
    validateProjectInput({
      studentId: "kopo01",
      projectName: "프로젝트 A",
      progress: "기획",
      deploymentUrl: "ftp://example.com",
      professorFeedback: ""
    }),
    {
      ok: false,
      error: "배포 주소는 http 또는 https 주소로 입력하세요."
    }
  );
});

test("rejects blank project name", () => {
  assert.deepEqual(
    validateProjectInput({
      studentId: "kopo01",
      projectName: "",
      progress: "기획",
      professorFeedback: ""
    }),
    {
      ok: false,
      error: "프로젝트 이름을 입력하세요."
    }
  );
});

test("accepts public comment input with author", () => {
  assert.deepEqual(
    validateProjectCommentInput({ author: "kopo05", comment: "좋아요" }),
    {
      ok: true,
      comment: {
        author: "kopo05",
        comment: "좋아요"
      }
    }
  );
});

test("rejects blank author input", () => {
  assert.deepEqual(
    validateProjectCommentInput({ author: "   ", comment: "좋아요" }),
    {
      ok: false,
      error: "작성자를 입력하세요."
    }
  );
});

test("rejects blank public comment input", () => {
  assert.deepEqual(
    validateProjectCommentInput({ author: "kopo05", comment: "   " }),
    {
      ok: false,
      error: "코멘트를 입력하세요."
    }
  );
});
