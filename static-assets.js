const staticAssets = new Map([
  ["/kiosk.css", {
    fileName: "kiosk.css",
    contentType: "text/css; charset=utf-8"
  }],
  ["/kiosk-print.css", {
    fileName: "kiosk-print.css",
    contentType: "text/css; charset=utf-8"
  }],
  ["/kiosk-i18n.js", {
    fileName: "kiosk-i18n.js",
    contentType: "text/javascript; charset=utf-8"
  }]
]);

function getStaticAsset(pathname) {
  return staticAssets.get(pathname) || null;
}

module.exports = {
  getStaticAsset
};
