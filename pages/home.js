/*
 * Home page (was pages/home.tsx and components/mobile/MobileHome.tsx).
 *  - loading screen until the hero images are ready
 *  - hero event carousel (6 slides stored below as <template data-state="slideN">)
 *  - countdown, typing headline, prize counters
 *  - competition cards, speakers strip, reels + video pop-ups
 */
(function () {
  var desktop = document.querySelector(".view-desktop");
  var mobile = document.querySelector(".view-mobile");
  sessionStorage.setItem("lastPage", "home");

  var TESTIMONIAL_IDS = ["WTaCcuB4we4", "8_cG0jxe_aE"];

  // ---------- loading screen -------------------------------------------------
  function loading(root) {
    var content = root.querySelector(".transition-opacity.duration-500");
    var hero = content && content.querySelector("section");
    if (!hero) return;
    var imgs = Array.prototype.slice.call(hero.querySelectorAll("img")).filter(function (i) { return !i.closest("[data-state-region]"); });
    imgs.forEach(function (i) { i.loading = "eager"; });
    var pending = imgs.filter(function (i) { return !(i.complete && i.naturalWidth); });
    if (!pending.length) return;
    var overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML = '<div class="loading-content"><div class="la-ball-atom"><div></div><div></div><div></div><div></div></div></div>';
    content.parentElement.insertBefore(overlay, content);
    content.classList.replace("opacity-100", "opacity-0");
    var left = pending.length;
    function done() {
      if (--left > 0) return;
      overlay.remove();
      content.classList.replace("opacity-0", "opacity-100");
    }
    pending.forEach(function (i) {
      i.addEventListener("load", done, { once: true });
      i.addEventListener("error", done, { once: true });
    });
  }
  loading(window.IS_MOBILE ? mobile : desktop);

  // ---------- hero carousel --------------------------------------------------
  function heroCarousel(root, opts) {
    var region = root.querySelector('[data-state-region="hero"]:not(template)');
    if (!region) return;
    var slides = [];
    for (var i = 0; i < 6; i++) {
      var tpl = root.querySelector('template[data-state-for="hero"][data-state="slide' + i + '"]');
      slides.push(tpl.content.firstElementChild.firstElementChild);
    }
    var current = region.firstElementChild;
    current.removeAttribute("data-motion");
    Motion.set(current, { x: "0%" });
    var index = 0;

    function makeSlide(i) {
      var el = slides[i].cloneNode(true);
      el.removeAttribute("data-motion");
      return el;
    }
    function go(next, direction) {
      if (next === index) return;
      index = next;
      var incoming = makeSlide(next);
      var outgoing = current;
      current = incoming;
      var t = { duration: 0.3, ease: "easeInOut" };
      function enter() {
        Motion.set(incoming, { x: direction > 0 ? "100%" : "-100%" });
        region.appendChild(incoming);
        Motion.animate(incoming, { x: "0%" }, t);
      }
      if (opts.waitForExit) {
        // mobile: the old card slides out first, then the new one slides in
        Motion.animate(outgoing, { x: "-100%" }, t, function () { outgoing.remove(); enter(); });
      } else {
        enter();
        Motion.animate(outgoing, { x: "-100%" }, t, function () { outgoing.remove(); });
      }
      progress();
      if (opts.onChange) opts.onChange();
    }

    // progress bar with 6 segments
    var bar = root.querySelector(".relative.w-48.h-1\\.5");
    var segs = bar ? Array.prototype.slice.call(bar.children[1].children) : [];
    segs.forEach(function (s) { s.removeAttribute("data-motion"); });
    function progress() {
      segs.forEach(function (s, i) {
        var on = i <= index;
        s.classList.toggle("bg-gray-300", on);
        s.classList.toggle("bg-transparent", !on);
        var target = { opacity: on ? 1 : 0 };
        if (opts.scaleSegments) target.scale = on ? 1 : 0.8;
        Motion.animate(s, target, { duration: 0.3, delay: i * 0.05, ease: "easeOut" });
        var fill = s.firstElementChild;
        if (on && !fill) {
          fill = document.createElement("div");
          fill.className = "absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 rounded-sm";
          s.appendChild(fill);
          Motion.set(fill, { x: "-100%" });
          Motion.animate(fill, { x: "0%" }, { duration: 0.6, delay: i * 0.1, ease: "easeOut" });
        } else if (!on && fill) {
          fill.remove();
        }
        if (fill) fill.removeAttribute("data-motion");
      });
    }
    if (bar) bar.addEventListener("click", function (e) {
      var r = bar.getBoundingClientRect();
      var target = Math.max(0, Math.min(5, Math.floor(((e.clientX - r.left) / r.width) * 6)));
      go(target, target > index ? 1 : -1);
    });
    return { go: go, index: function () { return index; } };
  }

  // desktop: arrows, auto-advance every 3s (restarts after any change)
  (function () {
    var timer;
    var c = heroCarousel(desktop, { onChange: function () { restart(); } });
    if (!c) return;
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { c.go((c.index() + 1) % 6, 1); }, 3000);
    }
    restart();
    var arrows = desktop.querySelectorAll(".hero-section button.hidden");
    if (arrows[0]) arrows[0].addEventListener("click", function () { c.go((c.index() + 5) % 6, -1); });
    if (arrows[1]) arrows[1].addEventListener("click", function () { c.go((c.index() + 1) % 6, 1); });
  })();

  // mobile: swipe left/right, auto-advance every 4s
  (function () {
    var c = heroCarousel(mobile, { waitForExit: true, scaleSegments: true });
    if (!c) return;
    setInterval(function () { c.go((c.index() + 1) % 6, 1); }, 4000);
    var card = mobile.querySelector('[data-state-region="hero"]:not(template)');
    var start = null, end = null;
    card.addEventListener("touchstart", function (e) { end = null; start = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY }; }, { passive: true });
    card.addEventListener("touchmove", function (e) { end = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY }; }, { passive: true });
    card.addEventListener("touchend", function () {
      if (!start || !end) return;
      var dx = start.x - end.x, dy = start.y - end.y;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      if (dx > 50) c.go((c.index() + 1) % 6, 1);
      else if (dx < -50) c.go((c.index() + 5) % 6, -1);
    });
  })();

  // ---------- countdown --------------------------------------------------------
  [desktop, mobile].forEach(function (root) {
    Countdown.mount(root.querySelector(".inline-flex.justify-center.items-stretch"));
  });

  // ---------- typing headline (desktop) ---------------------------------------
  (function () {
    var p = desktop.querySelector("p.min-h-\\[4rem\\]");
    if (!p) return;
    var cursor = p.querySelector("span");
    var text = document.createTextNode("");
    p.insertBefore(text, cursor);
    var FULL = "Join India's most prestigious business competition. Compete with the brightest minds, win massive prizes, and launch your career.";
    Site.onInView(p, function () {
      cursor.classList.replace("opacity-0", "opacity-100");
      var i = 0;
      var t = setInterval(function () {
        if (i <= FULL.length) {
          text.nodeValue = FULL.slice(0, i);
          i++;
        } else {
          clearInterval(t);
          cursor.classList.replace("opacity-100", "opacity-0");
        }
      }, 40);
    }, { amount: 0.25 });
  })();

  // ---------- prize counters (desktop) ----------------------------------------
  (function () {
    var spans = Array.prototype.slice.call(desktop.querySelectorAll("h2 > span")).filter(function (s) { return /^₹/.test(s.textContent.trim()); });
    if (spans.length < 2) return;
    var section = spans[0].closest("[data-scroll-target]") || spans[0];
    var plan = [[298000, 300000], [98000, 100000]];
    spans.slice(0, 2).forEach(function (s, i) { s.textContent = "₹" + Site.inr(plan[i][0]); });
    Site.onInView(section, function () {
      spans.slice(0, 2).forEach(function (s, i) {
        var start = null, from = plan[i][0], to = plan[i][1];
        requestAnimationFrame(function frame(t) {
          if (start === null) start = t;
          var p = Math.min((t - start) / 2500, 1);
          s.textContent = "₹" + Site.inr(Math.floor(from + (to - from) * p));
          if (p < 1) requestAnimationFrame(frame);
        });
      });
    });
  })();

  // ---------- competition cards ------------------------------------------------
  EventCards.desktop(desktop.querySelector('.rounded-2xl[class*="lg:grid-cols-4"]'));
  EventCards.mobile(mobile);

  // ---------- speakers strip ---------------------------------------------------
  (function () {
    var heading = Array.prototype.slice.call(desktop.querySelectorAll("h2")).filter(function (h) { return /Distinguished Speakers/.test(h.textContent); })[0];
    var section = heading && heading.closest("section");
    var strip = section && section.querySelector(".flex.overflow-x-auto");
    if (!strip) return;
    var cards = Array.prototype.slice.call(strip.children);
    // two timers ran on this strip in the React page: one card every 3s, plus a push every 20s
    var a = Carousels.autoScroll({ container: strip, section: section, amount: 0.1, mode: "edge", gap: 20, pauseOn: cards });
    var b = Carousels.autoScroll({ container: strip, section: section, amount: 0.1, mode: "by", gap: 24, interval: 8000 + 12 * 1000, pauseOn: cards });
    Carousels.hoverDim(cards);
    var arrows = section.querySelectorAll(".flex.justify-center.items-center.gap-4.mt-8 > button");
    function nudge(dir) {
      a.nudge(dir);
      b.pause(true);
      setTimeout(function () { b.pause(false); }, 6000);
    }
    if (arrows[0]) arrows[0].addEventListener("click", function () { nudge(-1); });
    if (arrows[1]) arrows[1].addEventListener("click", function () { nudge(1); });
  })();
  (function () {
    var heading = Array.prototype.slice.call(mobile.querySelectorAll("h2")).filter(function (h) { return /Distinguished Speakers/.test(h.textContent); })[0];
    var section = heading && heading.closest("section");
    var strip = section && section.querySelector(".flex.overflow-x-auto");
    if (!strip) return;
    Carousels.autoScroll({ container: strip, section: section, amount: 0.1, mode: "loop", count: strip.children.length, gap: 16, fallbackWidth: 200, pauseOn: [strip.parentElement] });
    Carousels.hoverDim(Array.prototype.slice.call(strip.children));
  })();

  // ---------- reels + video gallery pop-ups -----------------------------------
  [[desktop, "desktop"], [mobile, "mobile"]].forEach(function (pair) {
    var root = pair[0], variant = pair[1];
    root.querySelectorAll('[class*="aspect-[9/16]"]').forEach(function (thumb, i) {
      var card = thumb.closest(".cursor-pointer") || thumb.parentElement;
      card.addEventListener("click", function () { VideoModals.short(TESTIMONIAL_IDS[i], variant); });
    });
    var ids = [];
    root.querySelectorAll('img[src*="img.youtube.com/vi/"]').forEach(function (img) {
      var id = img.getAttribute("src").split("/vi/")[1].split("/")[0];
      var index = ids.push(id) - 1;
      var card = img.closest(".cursor-pointer");
      if (card) card.addEventListener("click", function () { VideoModals.video(ids, index, variant); });
    });
  });

  // ---------- particles in the mobile prize card -------------------------------
  Particles.mount(mobile.querySelector(".particles-container"), {
    particleColors: ["#ffffff", "#ffffff", "#60a5fa", "#3b82f6"],
    particleCount: 150, particleSpread: 10, speed: 0.15, particleBaseSize: 60,
    moveParticlesOnHover: false, alphaParticles: true, sizeRandomness: 1.2,
    cameraDistance: 20, disableRotation: false,
  });
})();
