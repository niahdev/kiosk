const {
  fetchProjects,
  updateProjectScreenshotPath
} = require("../db");
const { captureScreenshotsFromDatabase } = require("../screenshot-capture");
const { parseProjectId } = require("./screenshot-cli-options");

async function main() {
  const projectId = parseProjectId(process.argv.slice(2));
  const result = await captureScreenshotsFromDatabase({
    fetchProjects,
    updateProjectScreenshotPath,
    projectId
  });

  console.log(`screenshots captured=${result.captured}, skipped=${result.skipped}, failed=${result.failed}`);
  result.logs.forEach((log) => {
    if (log.status === "failed") {
      console.log(`failed project=${log.projectId}: ${log.reason}`);
      return;
    }

    console.log(`${log.status} project=${log.projectId}${log.screenshotPath ? ` path=${log.screenshotPath}` : ""}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
