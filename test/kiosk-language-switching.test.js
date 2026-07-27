const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const projectRoot = path.join(__dirname, "..");

function contentType(filePath) {
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  return "text/html; charset=utf-8";
}

test("switches every fixed kiosk label while preserving user-created text", async () => {
  const projects = [{
    id: 1,
    studentId: "kopo01",
    projectName: "사용자가 만든 프로젝트",
    progress: "완료",
    deploymentUrl: "https://example.com",
    screenshotUrl: "",
    screenshotPath: "",
    viewCount: 12,
    commentCount: 2,
    frameStatus: {
      checked: true,
      reachable: true,
      frameAllowed: true,
      status: 200
    }
  }];
  const server = http.createServer((request, response) => {
    if (request.url === "/api/projects") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ projects }));
      return;
    }

    const requestPath = request.url === "/" ? "/kiosk.html" : request.url;
    const filePath = path.join(projectRoot, requestPath.replace(/^\//, ""));

    if (!fs.existsSync(filePath)) {
      response.writeHead(404);
      response.end();
      return;
    }

    response.writeHead(200, { "Content-Type": contentType(filePath) });
    response.end(fs.readFileSync(filePath));
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`http://127.0.0.1:${address.port}/`);
    await page.getByText("1명 / 1개 프로젝트 표시 중").waitFor();
    await page.locator("#modalProjectName").evaluate((element) => {
      element.textContent = "사용자가 만든 프로젝트";
    });

    await page.getByRole("button", { name: "English" }).click();

    assert.equal(await page.title(), "Kiosk Progress");
    assert.equal(await page.locator("h1").textContent(), "Projects by User");
    assert.equal(await page.locator("#modalTitle").textContent(), "Project Preview");
    assert.equal(
      await page.locator("#commentInput").getAttribute("placeholder"),
      "Anyone can leave a comment"
    );
    assert.equal(await page.locator("#modalProjectName").textContent(), "사용자가 만든 프로젝트");
    assert.equal(await page.locator("html").getAttribute("dir"), "ltr");
    assert.equal(await page.locator(".project-summary-title strong").textContent(), "사용자가 만든 프로젝트");
    assert.equal(await page.locator(".connection-status").textContent(), "Available");
    assert.equal(await page.locator(".mockup-link-button").textContent(), "View portfolio");
    assert.equal(await page.locator("[data-view-count-project-id='1']").textContent(), "12 views");

    const refreshButton = page.locator(".header").getByRole("button", { name: "Refresh page" });
    assert.equal(await refreshButton.getAttribute("title"), "Refresh page");
    await Promise.all([
      page.waitForNavigation(),
      refreshButton.click()
    ]);
    assert.equal(await page.locator("html").getAttribute("lang"), "en");

    await page.locator(".user-name-button").click();
    assert.equal(await page.locator(".project-option span").textContent(), "2 comments");

    await page.getByRole("button", { name: "العربية" }).evaluate((button) => button.click());

    assert.equal(await page.title(), "حالة تقدم الكشك");
    assert.equal(await page.locator("h1").textContent(), "حالة المشاريع حسب المستخدم");
    assert.equal(await page.locator("#modalTitle").textContent(), "معاينة المشروع");
    assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
    assert.equal(await page.locator(".project-option strong").textContent(), "사용자가 만든 프로젝트");
    assert.equal(await page.locator(".project-option span").textContent(), "2 تعليق");
    assert.equal(
      await page.locator("#modalProjectName").getAttribute("dir"),
      "auto"
    );

    await page.reload();

    assert.equal(await page.locator("html").getAttribute("lang"), "ar");
    assert.equal(await page.locator("h1").textContent(), "حالة المشاريع حسب المستخدم");
    assert.equal(
      await page.getByRole("button", { name: "العربية" }).getAttribute("aria-pressed"),
      "true"
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
