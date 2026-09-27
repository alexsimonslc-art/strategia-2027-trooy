/*
 * Small helpers shared by every page (was lib/utils.ts + wouter routing).
 */
(function () {
  // The React site used routes like "/about" and "/events/strategiq".
  // Every page is now its own file; this turns a route into that file.
  function url(route) {
    if (!route || /^(https?:|mailto:|tel:|#)/i.test(route)) return route;
    var m = route.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
    var p = m[1].replace(/\/+$/, "") || "/";
    var rest = (m[2] || "") + (m[3] || "");
    var table = {
      "/": "/index.html",
      "/events/panel-discussion": "/pages/panel-discussion.html",
      "/events/startup-expo": "/pages/startup-expo.html",
      "/panel-discussion/register": "/pages/panel-registration-form.html",
    };
    if (table[p]) return table[p] + rest;
    var ev = p.match(/^\/events\/([\w-]+)$/);
    if (ev) return "/pages/events/" + ev[1] + ".html" + rest;
    return "/pages" + p + ".html" + rest;
  }

  function go(route) {
    window.location.href = url(route);
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // The layout currently on screen (desktop or mobile) — pages hold both.
  function view() {
    return document.querySelector(window.IS_MOBILE ? ".view-mobile" : ".view-desktop");
  }

  // Format a number the way the site does: 100000 -> "1,00,000"
  function inr(n) {
    return new Intl.NumberFormat("en-IN").format(n);
  }

  // Run fn once the element scrolls into view (was framer-motion useInView)
  function onInView(el, fn, options) {
    options = options || {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          fn(true);
          if (options.once !== false) io.disconnect();
        } else if (options.once === false) {
          fn(false);
        }
      });
    }, { threshold: options.amount || 0 });
    io.observe(el);
    return io;
  }

  // A page script is about to drive this element's animation itself:
  // keep only its hover/tap effects in data-motion.
  function takeOver(el) {
    if (!el) return el;
    var spec = {};
    try { spec = JSON.parse(el.getAttribute("data-motion") || "{}"); } catch (e) {}
    var keep = {};
    ["whileHover", "whileTap", "transition"].forEach(function (k) { if (spec[k]) keep[k] = spec[k]; });
    if (keep.whileHover || keep.whileTap) el.setAttribute("data-motion", JSON.stringify(keep));
    else el.removeAttribute("data-motion");
    return el;
  }

  // Animate only when the target actually changes (like React re-rendering
  // with new animate values). Returns true when it started an animation.
  function animateIfChanged(el, target, transition) {
    var key = JSON.stringify(target);
    if (el.__lastTarget === key) return false;
    el.__lastTarget = key;
    Motion.animate(el, target, transition);
    return true;
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(function () {});
  }

  window.Site = {
    url: url, go: go, escapeHtml: escapeHtml, view: view, inr: inr, onInView: onInView,
    takeOver: takeOver, animateIfChanged: animateIfChanged, scrollToId: scrollToId, copyText: copyText,
  };
})();
