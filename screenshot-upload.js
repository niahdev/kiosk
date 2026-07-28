const path = require("node:path");

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = {
  "image/png": {
    extension: "png",
    matches: (buffer) => buffer.length >= 4
      && buffer[0] === 0x89
      && buffer.subarray(1, 4).toString("ascii") === "PNG"
  },
  "image/jpeg": {
    extension: "jpg",
    matches: (buffer) => buffer.length >= 3
      && buffer[0] === 0xff
      && buffer[1] === 0xd8
      && buffer[2] === 0xff
  },
  "image/webp": {
    extension: "webp",
    matches: (buffer) => buffer.length >= 12
      && buffer.subarray(0, 4).toString("ascii") === "RIFF"
      && buffer.subarray(8, 12).toString("ascii") === "WEBP"
  }
};

function validateScreenshotUpload(contentType, buffer) {
  const normalizedType = String(contentType || "").split(";")[0].trim().toLowerCase();
  const imageType = IMAGE_TYPES[normalizedType];

  if (!imageType) {
    throw new Error("스크린샷은 PNG, JPG, WebP 파일만 올릴 수 있습니다.");
  }

  if (!buffer.length || buffer.length > MAX_SCREENSHOT_BYTES) {
    throw new Error("스크린샷은 5MB 이하 파일만 올릴 수 있습니다.");
  }

  if (!imageType.matches(buffer)) {
    throw new Error("invalid image file");
  }

  return { contentType: normalizedType, extension: imageType.extension };
}

function buildUploadedScreenshotName(projectId, extension, timestamp = Date.now()) {
  return `upload_${Number(projectId)}_${timestamp}.${extension}`;
}

function getScreenshotContentType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return "image/png";
}

module.exports = {
  MAX_SCREENSHOT_BYTES,
  validateScreenshotUpload,
  buildUploadedScreenshotName,
  getScreenshotContentType
};
