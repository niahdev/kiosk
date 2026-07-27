const test = require("node:test");
const assert = require("node:assert/strict");
const {
  checkFrameAvailability,
  inspectFrameHeaders,
  resolveFrameCheckTimeout
} = require("../frame-check");

test("marks x-frame-options deny as blocked", () => {
  assert.deepEqual(
    inspectFrameHeaders({ "x-frame-options": "DENY" }),
    {
      ok: true,
      checked: true,
      frameAllowed: false,
      reason: "이 사이트는 iframe 표시를 막고 있어 새 창으로 열어야 합니다."
    }
  );
});

test("keeps frame available when no blocking headers are present", () => {
  assert.deepEqual(
    inspectFrameHeaders({}),
    { ok: true, checked: true, frameAllowed: true, reason: "" }
  );
});

test("does not mark frame as blocked when the precheck cannot reach the url", async () => {
  const result = await checkFrameAvailability("https://example.com", {
    fetchImpl: async () => {
      throw new Error("network unavailable");
    },
    timeoutMs: 1
  });

  assert.deepEqual(result, {
    ok: true,
    checked: false,
    frameAllowed: true,
    reason: "iframe 가능 여부를 확인하지 못해 기존 목업 보기로 표시합니다."
  });
});

test("marks a 404 response as unreachable", async () => {
  const result = await checkFrameAvailability("https://example.com/missing", {
    fetchImpl: async () => ({
      ok: false,
      status: 404,
      headers: {}
    })
  });

  assert.deepEqual(result, {
    ok: true,
    checked: true,
    reachable: false,
    status: 404,
    frameAllowed: false,
    reason: "사이트가 HTTP 404 오류를 반환했습니다."
  });
});

test("marks a successful response containing a 404 page as unreachable", async () => {
  const result = await checkFrameAvailability("https://example.com/missing", {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: {},
      text: async () => "<html><title>404 Not Found</title></html>"
    })
  });

  assert.deepEqual(result, {
    ok: true,
    checked: true,
    reachable: false,
    notFound: true,
    status: 200,
    frameAllowed: false,
    reason: "사이트가 404 페이지를 표시하고 있습니다."
  });
});

test("reads the frame check timeout from environment configuration", () => {
  assert.equal(
    resolveFrameCheckTimeout({}, { FRAME_CHECK_TIMEOUT_MS: "2500" }),
    2500
  );
  assert.equal(
    resolveFrameCheckTimeout({}, { FRAME_CHECK_TIMEOUT_MS: "invalid" }),
    5000
  );
});
