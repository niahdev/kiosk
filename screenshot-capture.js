const fs = require("node:fs/promises");
const path = require("node:path");

const DEFAULT_OUTPUT_DIR = path.join(__dirname, "public", "screenshots");
const DEFAULT_VIEWPORT = { width: 1280, height: 720 };
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_WAIT_MS = 2500;

function sanitizeFilePart(value) {
  return String(value || "unknown")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";
}

function buildScreenshotFileName(project) {
  return `${sanitizeFilePart(project.studentId)}_${sanitizeFilePart(project.id)}.png`;
}

function buildScreenshotWebPath(fileName) {
  return `/screenshots/${fileName}`;
}

async function createDefaultBrowser() {
  const { chromium } = require("playwright");
  return chromium.launch({
    args: ["--no-sandbox"]
  });
}

async function captureSingleProject(project, options) {
  const fileName = buildScreenshotFileName(project);
  const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
  const outputPath = path.join(outputDir, fileName);
  const screenshotPath = buildScreenshotWebPath(fileName);
  const context = await options.browser.newContext({ viewport: DEFAULT_VIEWPORT });

  try {
    const page = await context.newPage();
    await page.goto(project.deploymentUrl, {
      waitUntil: "domcontentloaded",
      timeout: options.timeoutMs || DEFAULT_TIMEOUT_MS
    });
    await page.waitForTimeout(options.waitMs || DEFAULT_WAIT_MS);
    await page.screenshot({
      path: outputPath,
      fullPage: false,
      timeout: options.timeoutMs || DEFAULT_TIMEOUT_MS
    });

    await options.updateScreenshotPath(project.id, screenshotPath);
    return { ok: true, projectId: project.id, screenshotPath };
  } finally {
    await context.close();
  }
}

async function captureProjectScreenshots(options = {}) {
  const projects = options.projects || [];
  const updateScreenshotPath = options.updateScreenshotPath || (async () => {});
  const logs = [];
  const result = { captured: 0, skipped: 0, failed: 0, logs };
  const projectsToCapture = projects.filter((project) => {
    if (project.deploymentUrl) return true;
    result.skipped += 1;
    logs.push({ projectId: project.id, status: "skipped", reason: "deployment_url 없음" });
    return false;
  });

  if (projectsToCapture.length === 0) {
    return result;
  }

  await fs.mkdir(options.outputDir || DEFAULT_OUTPUT_DIR, { recursive: true });
  const browser = options.browser || await (options.browserFactory || createDefaultBrowser)();

  try {
    for (const project of projectsToCapture) {
      try {
        const capture = await captureSingleProject(project, {
          ...options,
          browser,
          updateScreenshotPath
        });
        result.captured += 1;
        logs.push({ projectId: project.id, status: "captured", screenshotPath: capture.screenshotPath });
      } catch (error) {
        result.failed += 1;
        logs.push({
          projectId: project.id,
          status: "failed",
          reason: error.message
        });
      }
    }
  } finally {
    if (!options.browser && browser && typeof browser.close === "function") {
      await browser.close();
    }
  }

  return result;
}

function selectProjectsForCapture(projects, projectId) {
  return projects.filter((project) => Number(project.id) === Number(projectId));
}

async function captureScreenshotsFromDatabase(dependencies) {
  const projects = await dependencies.fetchProjects();
  return captureProjectScreenshots({
    projects: dependencies.projectId
      ? selectProjectsForCapture(projects, dependencies.projectId)
      : projects,
    updateScreenshotPath: dependencies.updateProjectScreenshotPath,
    outputDir: dependencies.outputDir,
    timeoutMs: dependencies.timeoutMs,
    waitMs: dependencies.waitMs
  });
}

module.exports = {
  DEFAULT_OUTPUT_DIR,
  buildScreenshotFileName,
  buildScreenshotWebPath,
  selectProjectsForCapture,
  captureProjectScreenshots,
  captureScreenshotsFromDatabase
};
