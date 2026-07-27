function isHttpUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function getHeader(headers, name) {
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) || "");
  return String(headers[name] || headers[name.toLowerCase()] || "");
}

function inspectFrameHeaders(headers) {
  const xFrameOptions = getHeader(headers, "x-frame-options").toLowerCase();
  const contentSecurityPolicy = getHeader(headers, "content-security-policy").toLowerCase();
  const frameAncestorsBlocked = contentSecurityPolicy.includes("frame-ancestors")
    && !contentSecurityPolicy.includes("frame-ancestors *");

  if (xFrameOptions.includes("deny") || xFrameOptions.includes("sameorigin") || frameAncestorsBlocked) {
    return {
      ok: true,
      checked: true,
      frameAllowed: false,
      reason: "이 사이트는 iframe 표시를 막고 있어 새 창으로 열어야 합니다."
    };
  }

  return { ok: true, checked: true, frameAllowed: true, reason: "" };
}

function looksLikeNotFoundPage(html) {
  const sample = String(html || "").slice(0, 20000).replace(/\s+/g, " ");
  const notFoundText = "(?:404(?: error)?(?: not found)?|not found|page not found|페이지를 찾을 수 없습니다)";

  return new RegExp(`<title[^>]*>\\s*${notFoundText}[^<]*<\\/title>`, "i").test(sample)
    || new RegExp(`<(?:h1|h2)[^>]*>\\s*${notFoundText}\\s*<\\/(?:h1|h2)>`, "i").test(sample);
}

async function checkFrameAvailability(targetUrl, options = {}) {
  if (!isHttpUrl(targetUrl)) {
    return { ok: false, checked: true, frameAllowed: false, reason: "올바른 URL이 아닙니다." };
  }

  const fetchImpl = options.fetchImpl || fetch;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    resolveFrameCheckTimeout(options)
  );

  try {
    const response = await fetchImpl(targetUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal
    });

    if (!response.ok) {
      return {
        ok: true,
        checked: true,
        reachable: false,
        status: response.status,
        frameAllowed: false,
        reason: `사이트가 HTTP ${response.status} 오류를 반환했습니다.`
      };
    }

    const responseBody = typeof response.text === "function"
      ? await response.text()
      : "";

    if (looksLikeNotFoundPage(responseBody)) {
      return {
        ok: true,
        checked: true,
        reachable: false,
        notFound: true,
        status: response.status,
        frameAllowed: false,
        reason: "사이트가 404 페이지를 표시하고 있습니다."
      };
    }

    return {
      ...inspectFrameHeaders(response.headers),
      reachable: true,
      status: response.status
    };
  } catch (error) {
    return {
      ok: true,
      checked: false,
      frameAllowed: true,
      reason: "iframe 가능 여부를 확인하지 못해 기존 목업 보기로 표시합니다."
    };
  } finally {
    clearTimeout(timeout);
  }
}

function resolveFrameCheckTimeout(options = {}, env = process.env) {
  const configuredTimeout = Number(
    options.timeoutMs ?? env.FRAME_CHECK_TIMEOUT_MS
  );

  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : 5000;
}

module.exports = {
  checkFrameAvailability,
  inspectFrameHeaders,
  isHttpUrl,
  looksLikeNotFoundPage,
  resolveFrameCheckTimeout
};
