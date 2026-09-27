/*
 * Sparkle trail that follows the mouse over hero sections (was components/cursor-trail.tsx).
 * Desktop only. Rendered into <div data-component="cursor-trail"></div>.
 */
(function () {
  var host = document.querySelector('[data-component="cursor-trail"]');
  if (!host) return;
  var layer = document.createElement("div");
  layer.className = "pointer-events-none fixed inset-0 z-50";
  host.replaceWith(layer);

  var route = document.body.getAttribute("data-route") || "/";
  var currentSection = "default";
  var lastParticleTime = 0;

  var DARK_CLASSES = ["bg-black", "bg-strategia-navy", "bg-slate-900", "bg-blue-900", "from-[#001a33]"];
  function hasDarkClass(el, extra) {
    var c = el.className;
    if (typeof c !== "string") return false;
    return DARK_CLASSES.concat(extra || []).some(function (d) { return c.indexOf(d) !== -1; });
  }
  function brightness(bg) {
    var m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return null;
    return (+m[1] * 299 + +m[2] * 587 + +m[3] * 114) / 1000;
  }

  // Is the cursor over a blue or dark background?
  function isOverDarkBackground(el) {
    if (!el) return false;
    if (el.tagName === "IMG" || el.tagName === "VIDEO") return true;
    if (hasDarkClass(el)) return true;
    if (el.closest(".hero-section")) {
      var hero = el.closest(".hero-section") || el.closest("section");
      if (hero && hero.querySelector('img[alt*="Banner"]')) return true;
    }
    var bg = getComputedStyle(el).backgroundColor;
    if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
      var parent = el.parentElement;
      for (var levels = 0; parent && levels < 3; levels++) {
        if (hasDarkClass(parent, ["hero-section"])) return true;
        var pbg = getComputedStyle(parent).backgroundColor;
        if (pbg && pbg !== "rgba(0, 0, 0, 0)" && pbg !== "transparent") {
          var b = brightness(pbg);
          if (b !== null) return b < 128;
        }
        parent = parent.parentElement;
      }
      return false;
    }
    var br = brightness(bg);
    return br !== null && br < 128;
  }

  // Sparkles only appear over hero sections
  function isGlitterAllowed(el) {
    if (!el) return false;
    if (route === "/") return !!el.closest(".hero-section");
    if (route === "/about") return !!(el.closest(".hero-section") || el.closest("#future-cxos"));
    if (route === "/events") {
      var hero = document.querySelector(".py-32.min-h-\\[70vh\\]");
      return !!(hero && hero.contains(el));
    }
    return !!el.closest(".hero-section");
  }

  function onScroll() {
    var mid = window.scrollY + window.innerHeight / 2;
    var next = "default";
    document.querySelectorAll("section").forEach(function (section) {
      var r = section.getBoundingClientRect();
      var top = r.top + window.scrollY;
      if (mid >= top && mid <= top + r.height) {
        if (section.classList.contains("hero-section")) next = "hero";
        else if (section.id === "events" || section.classList.contains("events-section")) next = "events";
        else if (section.id === "about" || section.classList.contains("about-section")) next = "about";
      }
    });
    currentSection = next;
  }
  window.addEventListener("scroll", onScroll);
  onScroll();

  function particleMarkup(type, color) {
    if (type === "star") {
      return '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0L12.5 7.5L20 10L12.5 12.5L10 20L7.5 12.5L0 10L7.5 7.5L10 0Z" fill="' +
        color + '" opacity="0.7" style="filter: drop-shadow(0 0 4px ' + color + '88)"></path></svg>';
    }
    return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="' +
      color + '" opacity="0.8"></path></svg>';
  }

  window.addEventListener("mousemove", function (e) {
    if (window.IS_MOBILE) return;
    var now = Date.now();
    if (now - lastParticleTime < 50) return;
    lastParticleTime = now;

    var under = document.elementFromPoint(e.clientX, e.clientY);
    if (!isGlitterAllowed(under)) return;

    var type = "sparkle", color;
    if (isOverDarkBackground(under)) {
      type = Math.random() > 0.7 ? "star" : "sparkle";
      color = "#FFFFFF";
    } else if (currentSection === "hero") {
      type = Math.random() > 0.5 ? "star" : "sparkle";
      color = Math.random() > 0.5 ? "#E30613" : "#FFD700";
    } else if (currentSection === "events") {
      color = Math.random() > 0.5 ? "#00204E" : "#4169E1";
    } else if (currentSection === "about") {
      color = Math.random() > 0.5 ? "#E30613" : "#00204E";
    } else {
      color = Math.random() > 0.5 ? "#00204E" : "#E30613";
    }

    var x = e.clientX + (Math.random() - 0.5) * 20 - 8;
    var y = e.clientY + (Math.random() - 0.5) * 20 - 8;
    var p = document.createElement("div");
    p.className = "absolute";
    p.innerHTML = particleMarkup(type, color);
    layer.appendChild(p);
    Motion.set(p, { x: x, y: y, scale: 0, opacity: 1 });
    Motion.animate(p, {
      x: x + (Math.random() - 0.5) * 50,
      y: y + (Math.random() - 0.5) * 50,
      scale: 1,
      opacity: 0,
    }, { duration: 1, ease: "easeOut" });
    setTimeout(function () { p.remove(); }, 1000);
  });
})();
