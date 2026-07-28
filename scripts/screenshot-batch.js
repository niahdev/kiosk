function runProjectCaptures(projectIds, runCapture) {
  let succeeded = 0;
  let failed = 0;

  for (const projectId of projectIds) {
    const exitCode = runCapture(projectId);
    if (exitCode === 0) {
      succeeded += 1;
    } else {
      failed += 1;
    }
  }

  return { succeeded, failed };
}

module.exports = {
  runProjectCaptures
};
