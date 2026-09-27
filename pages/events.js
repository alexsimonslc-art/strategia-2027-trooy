/*
 * Events page (was pages/events.tsx, components/ui/FloatingEventsNav.tsx and
 * components/mobile/MobileEvents.tsx).
 *  - rotating hero titles (Competition Arena / Panel Discussion / Startup Expo)
 *  - floating section switcher that appears after scrolling (desktop)
 *  - prize counters that count up when they come into view
 *  - event images turn from black & white to colour when on screen
 *  - particle background in the Final Showdown section
 *  - sound-wave bars that move away from the mouse (Panel Discussion section)
 */
(function () {
  var desktop = document.querySelector(".view-desktop");
  var mobile = document.querySelector(".view-mobile");

  sessionStorage.setItem("lastPage", "events");

  // Coming back from a competition page: return to where you were
  var savedScroll = sessionStorage.getItem("scrollPosition");
  if (savedScroll && (window.IS_MOBILE || sessionStorage.getItem("restoreScroll"))) {
    setTimeout(function () {
      window.scrollTo(0, parseInt(savedScroll, 10));
      sessionStorage.removeItem("scrollPosition");
    }, 100);
  }
  sessionStorage.removeItem("restoreScroll");

  // "Learn More" remembers the scroll position (for the Return button)
  document.querySelectorAll('a[href^="/pages/events/"]').forEach(function (a) {
    a.addEventListener("click", function () { sessionStorage.setItem("scrollPosition", String(window.scrollY)); });
  });

  function scrollWithOffset(id, offset) {
    // the mobile layout's copies of these ids start with "m-"
    var el = (window.IS_MOBILE && document.getElementById("m-" + id)) || document.getElementById(id);
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.pageYOffset + offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  // ---------- rotating hero titles (desktop) --------------------------------
  (function () {
    var wrap = desktop.querySelector(".relative.w-full.h-36");
    if (!wrap) return;
    var KEYS = ["arena", "panel", "expo"];
    var IDS = ["main-events", "panel-discussion-section", "startup-expo-section"];
    var buttons = Array.prototype.slice.call(wrap.querySelectorAll(":scope > button"));
    var step = 0;
    function position(key) {
      var table = [
        { arena: [0, 1, 1, 30], panel: [450, 0.7, 0.5, 10], expo: [-450, 0.7, 0.5, 10] },
        { panel: [0, 1, 1, 30], arena: [-450, 0.7, 0.5, 10], expo: [450, 0.7, 0.5, 10] },
        { expo: [0, 1, 1, 30], panel: [-450, 0.7, 0.5, 10], arena: [450, 0.7, 0.5, 10] },
      ][step][key];
      return { x: table[0], scale: table[1], opacity: table[2], z: table[3] };
    }
    var MOVE = { duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96], opacity: { duration: 0.6 } };
    function render() {
      buttons.forEach(function (b, i) {
        var p = position(KEYS[i]);
        var center = p.scale === 1;
        b.style.zIndex = p.z;
        b.__rest = p;
        Motion.animate(b, { x: p.x, scale: p.scale, opacity: p.opacity }, MOVE);
        var h1 = b.querySelector("h1");
        ["text-3xl", "md:text-5xl", "lg:text-6xl", "elite-text-glow"].forEach(function (c) { h1.classList.toggle(c, center || c === "text-3xl"); });
        ["md:text-4xl", "lg:text-5xl"].forEach(function (c) { h1.classList.toggle(c, !center); });
      });
    }
    buttons.forEach(function (b, i) {
      b.removeAttribute("data-motion");
      b.__rest = position(KEYS[i]);
      Motion.set(b, { x: b.__rest.x, scale: b.__rest.scale, opacity: b.__rest.opacity });
      b.addEventListener("click", function () { scrollWithOffset(IDS[i], -100); });
      b.addEventListener("mouseenter", function () {
        var p = b.__rest;
        Motion.animate(b, { scale: p.scale === 1 ? 1.03 : p.scale * 1.08 }, { duration: 0.3 });
      });
      b.addEventListener("mouseleave", function () { Motion.animate(b, { scale: b.__rest.scale }, MOVE); });
    });
    setInterval(function () { step = (step + 1) % 3; render(); }, 3500);
  })();

  // ---------- rotating hero titles (mobile) ---------------------------------
  (function () {
    var wrap = mobile.querySelector(".relative.w-full.h-32");
    if (!wrap) return;
    var IDS = ["main-events", "panel-discussion-section", "startup-expo-section"];
    var buttons = Array.prototype.slice.call(wrap.querySelectorAll(":scope > button"));
    var dots = Array.prototype.slice.call(wrap.querySelectorAll(":scope > .absolute > div"));
    var step = 0;
    function render(instant) {
      buttons.forEach(function (b, i) {
        var active = step === i, prev = step === (i + 1) % 3;
        b.style.zIndex = active ? 30 : 10;
        var target = { y: active ? 0 : prev ? -60 : 60, opacity: active ? 1 : 0, scale: active ? 1 : 0.85 };
        if (instant) Motion.set(b, target);
        else Motion.animate(b, target, { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] });
        var h1 = b.querySelector("h1");
        h1.classList.toggle("text-4xl", active);
        h1.classList.toggle("elite-text-glow", active);
        h1.classList.toggle("text-2xl", !active);
      });
      dots.forEach(function (d, i) {
        var target = { width: step === i ? 24 : 6, opacity: step === i ? 1 : 0.4 };
        if (instant) Motion.set(d, target);
        else Motion.animate(d, target, { duration: 0.3 });
      });
    }
    buttons.forEach(function (b, i) {
      b.removeAttribute("data-motion");
      b.addEventListener("click", function () { scrollWithOffset(IDS[i], -80); });
    });
    dots.forEach(function (d) { d.removeAttribute("data-motion"); });
    render(true);
    setInterval(function () { step = (step + 1) % 3; render(false); }, 3500);
  })();

  // ---------- floating section switcher (desktop) ---------------------------
  (function () {
    var bar = desktop.querySelector(".fixed.top-20.right-3");
    if (!bar) return;
    bar.removeAttribute("data-motion");
    bar.style.display = "none";
    var IDS = ["main-events", "panel-discussion-section", "startup-expo-section"];
    var buttons = Array.prototype.slice.call(bar.querySelectorAll("button"));
    var pill = bar.querySelector(".absolute.inset-0.bg-gradient-to-r");
    var visible = false;
    var active = -1;

    function setActive(i) {
      if (i === active) return;
      var from = pill.getBoundingClientRect();
      active = i;
      buttons.forEach(function (b, j) {
        b.classList.toggle("text-white", j === i);
        b.classList.toggle("text-strategia-navy", j !== i);
        b.classList.toggle("hover:text-strategia-blue", j !== i);
      });
      buttons[i].insertBefore(pill, buttons[i].firstChild);
      // slide the highlight from its old spot (like Framer's layoutId)
      var to = pill.getBoundingClientRect();
      if (visible && from.width && to.width) {
        pill.style.transformOrigin = "0 0";
        Motion.set(pill, { x: from.left - to.left, scaleX: from.width / to.width });
        Motion.animate(pill, { x: 0, scaleX: 1 }, { duration: 0.6, ease: [0.34, 1.2, 0.64, 1] });
      }
    }
    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () { scrollWithOffset(IDS[i], -100); });
    });
    function onScroll() {
      var show = window.scrollY > 600;
      if (show !== visible) {
        visible = show;
        if (show) {
          bar.style.display = "";
          Motion.set(bar, { opacity: 0, x: 100 });
          Motion.animate(bar, { opacity: 1, x: 0 }, { duration: 0.4 });
        } else {
          Motion.animate(bar, { opacity: 0, x: 100 }, { duration: 0.4 }, function () { if (!visible) bar.style.display = "none"; });
        }
      }
      for (var i = 0; i < IDS.length; i++) {
        var el = document.getElementById(IDS[i]);
        if (!el) continue;
        var r = el.getBoundingClientRect();
        if (r.top <= 250 && r.bottom >= 250) { setActive(i); break; }
      }
    }
    setActive(0); // React starts on "Competition Arena"
    window.addEventListener("scroll", onScroll);
    onScroll();
  })();

  // ---------- scroll-down arrow ----------------------------------------------
  var arrow = desktop.querySelector(".absolute.bottom-8.right-8.cursor-pointer");
  if (arrow) arrow.addEventListener("click", function () {
    var next = document.querySelector("#main-events");
    if (next) next.scrollIntoView({ behavior: "smooth" });
  });

  // ---------- prize counters -------------------------------------------------
  function counter(span, from, to, duration) {
    span.textContent = "₹" + Site.inr(from);
    var grid = span.closest("[data-motion]") || span;
    Site.onInView(grid, function () {
      var start = null;
      function frame(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / duration, 1);
        span.textContent = "₹" + Site.inr(Math.floor(from + (to - from) * p));
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }
  [desktop, mobile].forEach(function (root) {
    var total = root.querySelector(".text-amber-700 > span");
    var champ = root.querySelector(".text-yellow-700 > span");
    if (total && /₹/.test(total.textContent)) counter(total, 298000, 300000, 1500);
    if (champ && /₹/.test(champ.textContent)) counter(champ, 98000, 100000, 1200);
  });

  // ---------- black & white -> colour event images --------------------------
  desktop.querySelectorAll("img.object-cover.grayscale, img.object-cover.grayscale-0").forEach(function (img) {
    var box = img.parentElement.parentElement;
    new IntersectionObserver(function (entries) {
      var on = entries[0].isIntersecting;
      img.classList.toggle("grayscale-0", on);
      img.classList.toggle("grayscale", !on);
    }, { threshold: 0.75 }).observe(box);
  });
  mobile.querySelectorAll("img[data-motion]").forEach(function (img) {
    var spec = JSON.parse(img.getAttribute("data-motion"));
    if (!spec.initial || spec.initial.filter === undefined) return;
    img.removeAttribute("data-motion");
    Motion.set(img, { filter: "grayscale(100%)", scale: 1 });
    var box = img.parentElement.parentElement;
    new IntersectionObserver(function (entries) {
      var on = entries[0].isIntersecting;
      Motion.animate(img, { filter: on ? "grayscale(0%)" : "grayscale(100%)", scale: on ? 1.05 : 1 }, { duration: 0.7, ease: "easeOut" });
    }, { threshold: 0.75 }).observe(box);
  });

  // ---------- particles ------------------------------------------------------
  Particles.mount(desktop.querySelector(".particles-container"), {
    particleColors: ["#ffffff", "#ffffff", "#60a5fa", "#3b82f6"],
    particleCount: 500, particleSpread: 15, speed: 0.4, particleBaseSize: 120,
    moveParticlesOnHover: true, particleHoverFactor: 2.0, alphaParticles: true,
    sizeRandomness: 1.2, cameraDistance: 20, disableRotation: false,
  });
  Particles.mount(mobile.querySelector(".particles-container"), {
    particleColors: ["#ffffff", "#ffffff", "#60a5fa", "#3b82f6"],
    particleCount: 150, particleSpread: 10, speed: 0.15, particleBaseSize: 60,
    moveParticlesOnHover: false, alphaParticles: true, sizeRandomness: 1.2,
    cameraDistance: 20, disableRotation: false,
  });

  // ---------- sound-wave bars move away from the cursor ---------------------
  var waves = desktop.querySelector(".floating-wave");
  var area = waves && waves.parentElement.parentElement;
  if (area) {
    var bars = area.querySelectorAll(".floating-wave");
    area.addEventListener("mousemove", function (e) {
      var rect = area.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      bars.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var dx = x - (r.left + r.width / 2 - rect.left);
        var dy = y - (r.top + r.height / 2 - rect.top);
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200) {
          var force = (200 - distance) / 200;
          var angle = Math.atan2(dy, dx);
          el.style.transform = "translate(" + Math.cos(angle + Math.PI) * force * 80 + "px, " + Math.sin(angle + Math.PI) * force * 80 + "px) scale(" + (1 + force * 0.5) + ")";
          el.style.opacity = "1";
        } else {
          el.style.transform = "translate(0, 0) scale(1)";
          el.style.opacity = "0.6";
        }
      });
    });
    area.addEventListener("mouseleave", function () {
      bars.forEach(function (el) {
        el.style.transform = "translate(0, 0) scale(1)";
        el.style.opacity = "0.6";
      });
    });
  }
})();
