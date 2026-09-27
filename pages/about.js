/*
 * About page (was pages/about.tsx and components/mobile/MobileAbout.tsx).
 *  - background slideshow in the hero (changes every 8s; desktop: click to advance)
 *  - sticky "About Us" bar that slides in as you scroll (desktop)
 *  - quick links that scroll to each section
 *  - team cards: clicking an email copies it and shows "Copied"
 */
(function () {
  var desktop = document.querySelector(".view-desktop");
  var mobile = document.querySelector(".view-mobile");

  var ICON_CHECK = '<path d="M20 6 9 17l-5-5"></path>';
  var ICON_MAIL = '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>';
  function icon(cls, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' + cls + '">' + body + "</svg>";
  }

  // ---------- hero slideshow ------------------------------------------------
  function slideshow(root, clickable) {
    var hero = root.querySelector("section.min-h-screen");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll(":scope > .absolute.inset-0.bg-black > div"));
    slides.forEach(Site.takeOver);
    var current = 0;
    var timer;
    function show(i) {
      current = i;
      slides.forEach(function (s, idx) {
        Motion.animate(s, { opacity: idx === current ? 1 : 0 }, { duration: 2, ease: "easeInOut" });
      });
    }
    function next() { show((current + 1) % slides.length); }
    function restart() { clearInterval(timer); timer = setInterval(next, 8000); }
    restart();
    if (clickable) {
      hero.addEventListener("click", function (e) {
        if (!e.target.closest('a, button, [role="button"]')) { next(); restart(); }
      });
    }
  }

  // ---------- quick links ----------------------------------------------------
  var LINKS = { "About the College": "college", "About the Department": "department", "About STRATEGIA": "strategia", "Meet our Team": "administration" };
  function quickLinks(root, prefix) {
    root.querySelectorAll("section.min-h-screen .cursor-pointer.group").forEach(function (el) {
      var label = el.textContent.trim();
      Object.keys(LINKS).forEach(function (k) {
        if (label.indexOf(k) === 0) el.addEventListener("click", function () { Site.scrollToId(prefix + LINKS[k]); });
      });
    });
  }

  // ---------- desktop: sticky header + scroll-linked hero ----------------------
  function desktopScroll() {
    var sticky = Site.takeOver(desktop.querySelector(".fixed.top-16"));
    if (!sticky) return;
    var title = Site.takeOver(sticky.querySelector("h2"));
    var buttons = Array.prototype.slice.call(sticky.querySelectorAll("button")).map(Site.takeOver);
    var hero = desktop.querySelector("section.min-h-screen");
    var indicator = Site.takeOver(hero.querySelector(".absolute.z-20.cursor-pointer.group"));
    var heroBlocks = Array.prototype.slice.call(hero.querySelectorAll(".relative.z-10 .relative > div")).slice(0, 2).map(Site.takeOver);
    var ACTIVE = ["bg-white", "text-strategia-navy", "transform", "scale-105"];
    var IDLE = ["text-gray-300", "hover:text-white", "hover:bg-white/10"];
    var SECTION_ORDER = ["college", "department", "strategia", "administration"];

    // entrance for the scroll indicator (fades in after 2s)
    Motion.set(indicator, { opacity: 0, y: 20 });

    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () { Site.scrollToId(SECTION_ORDER[i]); });
    });
    indicator.addEventListener("click", function () { Site.scrollToId("college"); });

    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY;
      var start = 50, end = window.innerHeight - 100;
      var raw = Math.min(Math.max((y - start) / (end - start), 0), 1);
      var p = raw * raw * (3 - 2 * raw);

      Site.animateIfChanged(sticky, { y: p > 0.1 ? 0 : -100, opacity: p > 0.1 ? p : 0 }, { type: "tween", ease: "easeOut", duration: 0.15 });
      var show = p > 0.3, op = show ? Math.min(p * 1.5, 1) : 0;
      Site.animateIfChanged(title, { x: show ? 0 : -30, opacity: op }, { type: "tween", ease: "easeOut", duration: 0.2 });
      buttons.forEach(function (b, i) {
        Site.animateIfChanged(b, { x: show ? 0 : 50, opacity: op }, { delay: i * 0.05, type: "tween", ease: "easeOut", duration: 0.2 });
      });
      Site.animateIfChanged(indicator, { opacity: Math.max(1 - p * 3, 0), y: 0 }, { delay: 2, duration: 0.8 });
      heroBlocks.forEach(function (b) {
        Site.animateIfChanged(b, { opacity: Math.max(1 - p * 2, 0), x: -p * 100 }, { duration: 0.2 });
      });

      // which section are we in?
      var ids = ["college", "department", "strategia", "strategia-unique", "future-cxos", "administration", "core-team"];
      var current = "college";
      for (var i = ids.length - 1; i >= 0; i--) {
        var el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 200) {
          current = ids[i] === "strategia-unique" || ids[i] === "future-cxos" ? "strategia" : ids[i] === "core-team" ? "administration" : ids[i];
          break;
        }
      }
      buttons.forEach(function (b, i) {
        var on = SECTION_ORDER[i] === current;
        ACTIVE.forEach(function (c) { b.classList.toggle(c, on); });
        IDLE.forEach(function (c) { b.classList.toggle(c, !on); });
      });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    document.addEventListener("DOMContentLoaded", update);
  }

  // ---------- email cards ----------------------------------------------------
  function desktopEmailCards() {
    desktop.querySelectorAll('a[href^="mailto:"][title^="Send email to"]').forEach(function (a) {
      var overlay = a.querySelector(".absolute.inset-0.backdrop-blur-\\[2px\\]");
      if (!overlay) return;
      var bubble = overlay.firstElementChild;
      var idle = { overlay: overlay.className, bubble: bubble.className, inner: bubble.innerHTML };
      var timer;
      a.addEventListener("click", function () {
        Site.copyText(a.getAttribute("href").replace("mailto:", ""));
        overlay.className = idle.overlay.replace("bg-strategia-navy/60 opacity-0 group-hover:opacity-100", "bg-green-500/80 opacity-100");
        bubble.className = idle.bubble.replace("bg-white/20 border-white/40 scale-0 group-hover:scale-100", "bg-white border-white scale-110");
        bubble.innerHTML = '<div class="flex flex-col items-center">' + icon("lucide lucide-check w-6 h-6 text-green-600 mb-0.5", ICON_CHECK) +
          '<span class="text-[10px] font-bold text-green-700 uppercase">Copied</span></div>';
        clearTimeout(timer);
        timer = setTimeout(function () {
          overlay.className = idle.overlay;
          bubble.className = idle.bubble;
          bubble.innerHTML = idle.inner;
        }, 2000);
      });
    });
  }

  var LINKEDIN = {
    "Vansh P Moryani": "https://www.linkedin.com/in/vansh-moryani",
    "Dhruv Nair": "https://www.linkedin.com/in/dhruvnairceo/",
    "Alex Simon S": "https://www.linkedin.com/in/alexsimon05",
    "Yug Daga": "http://www.linkedin.com/in/yugdaga2745",
    "Shamith Vinod Kumar": "https://www.linkedin.com/in/shamith-vinod-1202b9287",
    "Pragdeesh N": "https://in.linkedin.com/in/pragdeesh-n-341808266",
    "F M Roderic": "https://www.linkedin.com/in/roderic-f-m-19b058271/",
  };

  var EMAILS = {
    "Dr. Reena F": "reenaalbert@loyolacollege.edu",
    "Dr. Minothi J": "minothi@loyolacollege.edu",
    "Dr. R. Leema Rose": "leemarose@loyolacollege.edu",
    "Dr. Jerusha Irene Chitra D": "jichitra@loyolacollege.edu",
  };

  function mobileCards() {
    mobile.querySelectorAll(".group.bg-white.rounded-xl.shadow-md").forEach(function (card) {
      var name = (card.querySelector("h3") || {}).textContent;
      name = name ? name.trim() : "";
      if (LINKEDIN[name]) {
        card.addEventListener("click", function () { window.open(LINKEDIN[name], "_blank"); });
        return;
      }
      var inner = card.querySelector(":scope > .flex.items-center.w-full");
      var badge = card.querySelector(".absolute.-bottom-1.-right-1");
      var email = EMAILS[name];
      if (!inner || !badge || !email) return;
      var idleClass = badge.className, idleHtml = badge.innerHTML, timer;
      inner.addEventListener("click", function () {
        Site.copyText(email);
        badge.className = idleClass.replace("bg-white text-strategia-navy", "bg-green-100 text-green-600");
        badge.innerHTML = icon("lucide lucide-check w-3 h-3", ICON_CHECK);
        clearTimeout(timer);
        timer = setTimeout(function () { badge.className = idleClass; badge.innerHTML = idleHtml; }, 2000);
        window.location.href = "mailto:" + email;
      });
    });
  }

  // ---------- boot -----------------------------------------------------------
  slideshow(desktop, true);
  slideshow(mobile, false);
  quickLinks(desktop, "");
  quickLinks(mobile, "m-");
  desktopScroll();
  desktopEmailCards();
  mobileCards();

  // /pages/about.html#department jumps to that section
  var hash = window.location.hash.substring(1);
  if (["college", "department", "strategia"].indexOf(hash) !== -1) {
    setTimeout(function () { Site.scrollToId(window.IS_MOBILE ? "m-" + hash : hash); }, 100);
  }
})();
