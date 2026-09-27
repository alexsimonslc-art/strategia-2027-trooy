/*
 * Competition detail pages: pages/events/*.html (was pages/event-detail.tsx).
 * The "Return to ..." buttons point back to wherever the visitor came from:
 * the Events page or the Home page.
 */
(function () {
  var lastPage = sessionStorage.getItem("lastPage");
  var ref = document.referrer;
  var referrer = "home";
  if (lastPage === "events") referrer = "events";
  else if (lastPage === "home") referrer = "home";
  else if (/\/pages\/events\.html/.test(ref)) referrer = "events";

  var label = referrer === "home" ? "Return to Home" : "Return to Events";
  var href = referrer === "home" ? Site.url("/") : Site.url("/events");

  document.querySelectorAll(".view-desktop a").forEach(function (a) {
    if (!/Return to (Home|Events)/.test(a.textContent)) return;
    a.setAttribute("href", href);
    a.querySelectorAll("button").forEach(function (b) {
      b.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && /Return to/.test(n.textContent)) n.textContent = label;
      });
    });
    // going back restores the scroll position of the list you came from
    a.addEventListener("click", function () {
      sessionStorage.setItem("restoreScroll", "1");
    });
  });
})();
