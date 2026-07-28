const test = require("node:test");
const assert = require("node:assert/strict");

const { runProjectCaptures } = require("../scripts/screenshot-batch");

test("captures projects sequentially and continues after a failure", () => {
  const calls = [];
  const result = runProjectCaptures([3, 7, 9], (projectId) => {
    calls.push(projectId);
    return projectId === 7 ? 1 : 0;
  });

  assert.deepEqual(calls, [3, 7, 9]);
  assert.deepEqual(result, { succeeded: 2, failed: 1 });
});
