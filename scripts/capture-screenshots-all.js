const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { fetchProjects } = require("../db");
const { runProjectCaptures } = require("./screenshot-batch");

async function main() {
  const projects = await fetchProjects();
  const projectIds = projects
    .filter((project) => project.deploymentUrl)
    .map((project) => project.id);
  const captureScript = path.join(__dirname, "capture-screenshots.js");

  console.log(`screenshots queued=${projectIds.length}`);
  const result = runProjectCaptures(projectIds, (projectId) => {
    console.log(`screenshot starting project=${projectId}`);
    const child = spawnSync(
      process.execPath,
      [captureScript, "--project-id", String(projectId)],
      { stdio: "inherit" }
    );
    return child.status ?? 1;
  });

  console.log(`screenshots finished succeeded=${result.succeeded} failed=${result.failed}`);
  if (result.failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
