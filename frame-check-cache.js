function resolveFrameCheckCacheTtl(env = process.env) {
  const configuredTtl = Number(env.FRAME_CHECK_CACHE_TTL_MS);

  return Number.isFinite(configuredTtl) && configuredTtl > 0
    ? configuredTtl
    : 300000;
}

function createFrameCheckCache(options = {}) {
  const ttlMs = Number(options.ttlMs) > 0
    ? Number(options.ttlMs)
    : 300000;
  const now = options.now || Date.now;
  const entries = new Map();

  return {
    get(targetUrl) {
      const entry = entries.get(targetUrl);
      if (!entry) return null;

      if (entry.expiresAt <= now()) {
        entries.delete(targetUrl);
        return null;
      }

      return entry.result;
    },

    set(targetUrl, result) {
      entries.set(targetUrl, {
        result,
        expiresAt: now() + ttlMs
      });
    }
  };
}

module.exports = {
  createFrameCheckCache,
  resolveFrameCheckCacheTtl
};
