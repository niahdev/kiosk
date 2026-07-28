const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildScreenshotFileName,
  buildScreenshotWebPath,
  captureProjectScreenshots,
  selectProjectsForCapture
} = require("../screenshot-capture");

test("builds a stable screenshot filename from student and project ids", () => {
  assert.equal(buildScreenshotFileName({ studentId: "kopo05", id: 42 }), "kopo05_42.png");
});

test("builds a public screenshot web path", () => {
  assert.equal(buildScreenshotWebPath("kopo05_42.png"), "/screenshots/kopo05_42.png");
});

test("skips projects without deployment urls", async () => {
  const result = await captureProjectScreenshots({
    projects: [{ id: 1, studentId: "kopo01", deploymentUrl: "" }],
    browserFactory: async () => {
      throw new Error("browser should not start");
    },
    updateScreenshotPath: async () => {
      throw new Error("update should not run");
    }
  });

  assert.equal(result.skipped, 1);
  assert.equal(result.captured, 0);
  assert.equal(result.failed, 0);
});

test("updates screenshot path after successful capture", async () => {
  const updates = [];
  const result = await captureProjectScreenshots({
    projects: [{ id: 7, studentId: "kopo03", deploymentUrl: "https://example.com" }],
    outputDir: "public/screenshots",
    browserFactory: async () => ({
      newContext: async () => ({
        newPage: async () => ({
          goto: async () => {},
          waitForTimeout: async () => {},
          screenshot: async () => {}
        }),
        close: async () => {}
      }),
      close: async () => {}
    }),
    updateScreenshotPath: async (projectId, screenshotPath) => {
      updates.push({ projectId, screenshotPath });
    }
  });

  assert.equal(result.captured, 1);
  assert.deepEqual(updates, [{ projectId: 7, screenshotPath: "/screenshots/kopo03_7.png" }]);
});

test("continues after capture failure without updating screenshot path", async () => {
  const updates = [];
  const result = await captureProjectScreenshots({
    projects: [
      { id: 1, studentId: "kopo01", deploymentUrl: "https://bad.example" },
      { id: 2, studentId: "kopo02", deploymentUrl: "https://good.example" }
    ],
    browserFactory: async () => ({
      newContext: async () => ({
        newPage: async () => ({
          goto: async (url) => {
            if (url.includes("bad")) throw new Error("timeout");
          },
          waitForTimeout: async () => {},
          screenshot: async () => {}
        }),
        close: async () => {}
      }),
      close: async () => {}
    }),
    updateScreenshotPath: async (projectId, screenshotPath) => {
      updates.push({ projectId, screenshotPath });
    }
  });

  assert.equal(result.failed, 1);
  assert.equal(result.captured, 1);
  assert.deepEqual(updates, [{ projectId: 2, screenshotPath: "/screenshots/kopo02_2.png" }]);
});

test("selects only the requested project for a single capture process", () => {
  const projects = [
    { id: 1, deploymentUrl: "http://example.test/1" },
    { id: 2, deploymentUrl: "http://example.test/2" }
  ];

  assert.deepEqual(selectProjectsForCapture(projects, 2), [projects[1]]);
});

test("returns no projects when the requested project does not exist", () => {
  const projects = [{ id: 1, deploymentUrl: "http://example.test/1" }];

  assert.deepEqual(selectProjectsForCapture(projects, 99), []);
});
