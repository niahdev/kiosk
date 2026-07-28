const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateScreenshotUpload,
  buildUploadedScreenshotName,
  getScreenshotContentType
} = require("../screenshot-upload");

test("accepts PNG, JPEG, and WebP images with matching signatures", () => {
  assert.equal(validateScreenshotUpload("image/png", Buffer.from([0x89, 0x50, 0x4e, 0x47])).extension, "png");
  assert.equal(validateScreenshotUpload("image/jpeg", Buffer.from([0xff, 0xd8, 0xff, 0xe0])).extension, "jpg");
  assert.equal(
    validateScreenshotUpload("image/webp", Buffer.from("RIFF1234WEBP")).extension,
    "webp"
  );
});

test("rejects unsupported content and mismatched image signatures", () => {
  assert.throws(
    () => validateScreenshotUpload("image/gif", Buffer.from("GIF89a")),
    /PNG, JPG, WebP/
  );
  assert.throws(
    () => validateScreenshotUpload("image/png", Buffer.from("not-an-image")),
    /invalid image/
  );
});

test("builds cache-safe uploaded names and content types", () => {
  assert.equal(buildUploadedScreenshotName(47, "jpg", 12345), "upload_47_12345.jpg");
  assert.equal(getScreenshotContentType("sample.jpg"), "image/jpeg");
  assert.equal(getScreenshotContentType("sample.webp"), "image/webp");
});
