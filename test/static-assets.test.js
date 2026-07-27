const test = require("node:test");
const assert = require("node:assert/strict");

const { getStaticAsset } = require("../static-assets");

test("serves the kiosk translation script as browser JavaScript", () => {
  assert.deepEqual(getStaticAsset("/kiosk-i18n.js"), {
    fileName: "kiosk-i18n.js",
    contentType: "text/javascript; charset=utf-8"
  });
});

test("does not expose arbitrary files as static assets", () => {
  assert.equal(getStaticAsset("/server.js"), null);
});
