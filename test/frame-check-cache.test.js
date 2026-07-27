const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createFrameCheckCache,
  resolveFrameCheckCacheTtl
} = require("../frame-check-cache");

test("keeps a frame check result until its ttl expires", () => {
  let now = 1000;
  const cache = createFrameCheckCache({
    ttlMs: 300000,
    now: () => now
  });
  const result = { checked: true, reachable: true, frameAllowed: true };

  cache.set("https://example.com", result);
  assert.deepEqual(cache.get("https://example.com"), result);

  now += 300001;
  assert.equal(cache.get("https://example.com"), null);
});

test("reads the frame check cache ttl from environment configuration", () => {
  assert.equal(
    resolveFrameCheckCacheTtl({ FRAME_CHECK_CACHE_TTL_MS: "300000" }),
    300000
  );
  assert.equal(
    resolveFrameCheckCacheTtl({ FRAME_CHECK_CACHE_TTL_MS: "invalid" }),
    300000
  );
});
