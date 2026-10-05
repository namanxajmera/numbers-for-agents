// First-party page-view beacon. No cookies, no storage.
// Skipped when the browser sends Do Not Track or Global Privacy Control.
(function () {
  var nav = navigator;
  if (nav.doNotTrack === "1" || window.doNotTrack === "1") return;
  if (nav.globalPrivacyControl) return;
  if (nav.webdriver) return;

  var payload = JSON.stringify({
    p: location.pathname,
    q: location.search,
    r: document.referrer,
  });

  function send() {
    if (nav.sendBeacon && nav.sendBeacon("/api/collect", payload)) return;
    fetch("/api/collect", {
      method: "POST",
      body: payload,
      keepalive: true,
    }).catch(function () {});
  }

  // A prerendered page is not a view until the visitor opens it.
  if (document.prerendering) {
    document.addEventListener("prerenderingchange", send, { once: true });
  } else {
    send();
  }
})();
