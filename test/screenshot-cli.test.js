const test = require("node:test");
const assert = require("node:assert/strict");

const { parseProjectId } = require("../scripts/screenshot-cli-options");

test("parses a positive project id", () => {
  assert.equal(parseProjectId(["--project-id", "17"]), 17);
});

test("rejects a missing project id", () => {
  assert.throws(
    () => parseProjectId([]),
    /--project-id/
  );
});

test("rejects an invalid project id", () => {
  assert.throws(
    () => parseProjectId(["--project-id", "all"]),
    /positive integer/
  );
});
