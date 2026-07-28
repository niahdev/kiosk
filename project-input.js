const PROGRESS_OPTIONS = [
  "기획",
  "프로토타입",
  "실제 제작 시작",
  "최종 테스트",
  "완료"
];

function validateProjectInput(input) {
  const studentId = String(input.studentId ?? "").trim();
  const projectName = String(input.projectName ?? "").trim();
  const progress = String(input.progress ?? "").trim();
  const deploymentUrl = String(input.deploymentUrl ?? "").trim();
  const githubUrl = input.githubUrl == null
    ? null
    : String(input.githubUrl).trim();
  const professorFeedback = String(input.professorFeedback ?? "").trim();
  const projectDescription = input.projectDescription == null
    ? null
    : String(input.projectDescription).trim();

  if (!studentId) {
    return { ok: false, error: "학생 ID를 입력하세요." };
  }

  if (!projectName) {
    return { ok: false, error: "프로젝트 이름을 입력하세요." };
  }

  if (!PROGRESS_OPTIONS.includes(progress)) {
    return { ok: false, error: "진행상황을 선택하세요." };
  }

  if (deploymentUrl) {
    try {
      const url = new URL(deploymentUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { ok: false, error: "배포 주소는 http 또는 https 주소로 입력하세요." };
      }
    } catch (error) {
      return { ok: false, error: "배포 주소를 올바르게 입력하세요." };
    }
  }

  if (githubUrl) {
    try {
      const url = new URL(githubUrl);
      const isHttp = url.protocol === "http:" || url.protocol === "https:";
      const isGithub = url.hostname === "github.com" || url.hostname === "www.github.com";
      if (!isHttp || !isGithub) {
        return { ok: false, error: "GitHub 주소는 github.com 주소로 입력하세요." };
      }
    } catch (error) {
      return { ok: false, error: "GitHub 주소는 github.com 주소로 입력하세요." };
    }
  }

  return {
    ok: true,
    project: {
      studentId,
      projectName,
      progress,
      deploymentUrl,
      githubUrl,
      professorFeedback,
      projectDescription
    }
  };
}

function validateProjectCommentInput(input) {
  const author = String(input.author ?? "").trim();
  const comment = String(input.comment ?? "").trim();

  if (!author) {
    return { ok: false, error: "작성자를 입력하세요." };
  }

  if (!comment) {
    return { ok: false, error: "코멘트를 입력하세요." };
  }

  return { ok: true, comment: { author, comment } };
}

module.exports = {
  PROGRESS_OPTIONS,
  validateProjectInput,
  validateProjectCommentInput
};
