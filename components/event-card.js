/*
 * Competition cards on the home page.
 *   EventCards.desktop(grid)  (was components/event-card.tsx)
 *     - hovering a card turns the other cards' photos grey
 *     - the white "Explore" chip opens on hover; the first time a card is
 *       seen it opens by itself for 2 seconds
 *   EventCards.mobile(grid)   (was components/mobile/MobileEventCard.tsx)
 *     - the chip opens for 3.5s when a card reaches the middle of the screen
 */
(function () {
  var EASE = [0.25, 1, 0.5, 1];

  // Chip width animates between px values, then settles to the CSS value.
  function widthTo(chip, target, duration, delay) {
    return new Promise(function (resolve) {
      var from = chip.getBoundingClientRect().width;
      var to = target === "100%" ? chip.parentElement.getBoundingClientRect().width : parseFloat(target);
      Motion.set(chip, { width: from });
      Motion.animate(chip, { width: to }, { duration: duration, ease: EASE, delay: delay || 0 }, function () {
        Motion.set(chip, { width: target });
        resolve();
      });
    });
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function desktop(grid) {
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.children).filter(function (c) { return c.tagName === "A"; });

    // The grid's fade-in plays once per browser session
    if (sessionStorage.getItem("viewedLineupGrid") === "true") {
      [grid].concat(cards).forEach(function (el) { el.removeAttribute("data-motion"); Motion.set(el, { opacity: 1 }); });
    } else {
      Site.onInView(grid, function () {
        setTimeout(function () { sessionStorage.setItem("viewedLineupGrid", "true"); }, 400 * cards.length + 500);
      });
    }

    var hoveredCard = null;
    function dim() {
      cards.forEach(function (c) {
        var img = c.querySelector("img");
        var dimmed = hoveredCard !== null && hoveredCard !== c;
        img.classList.toggle("grayscale", dimmed);
        img.classList.toggle("filter-none", !dimmed);
      });
    }
    grid.addEventListener("mouseleave", function () { hoveredCard = null; dim(); });

    cards.forEach(function (card) {
      var chip = card.querySelector(".absolute.right-0.h-10.rounded-full");
      var text = chip && chip.children[0];
      var icon = chip && chip.children[1];
      var prize = card.querySelector(".text-yellow-400.text-lg");
      [chip, text, icon, prize].forEach(function (el) { if (el) el.removeAttribute("data-motion"); });
      var hovered = false, autoAnimating = false;

      function expand(duration, delay) {
        Motion.animate(text, { opacity: 1, x: 0 }, { duration: 0.3, delay: (delay || 0) + 0.1 });
        Motion.animate(icon, { opacity: 0, x: 10 }, { duration: 0.2, delay: delay || 0 });
        return widthTo(chip, "100%", duration || 0.4, delay);
      }
      function collapse(duration, delay) {
        Motion.animate(text, { opacity: 0, x: -10 }, { duration: 0.2, delay: delay || 0 });
        Motion.animate(icon, { opacity: 1, x: 0 }, { duration: 0.3, delay: (delay || 0) + 0.1 });
        return widthTo(chip, "40px", duration || 0.4, delay);
      }

      var key = "viewedChip-" + (card.getAttribute("href") || "").split("/").pop().replace(".html", "");
      Site.onInView(card, function () {
        if (sessionStorage.getItem(key) === "true") return;
        sessionStorage.setItem(key, "true");
        autoAnimating = true;
        wait(3000)
          .then(function () { return expand(0.4); })
          .then(function () { return wait(2000); })
          .then(function () {
            autoAnimating = false;
            if (!hovered) return collapse(0.4);
          });
      });

      card.addEventListener("mouseenter", function () {
        hoveredCard = card;
        dim();
        hovered = true;
        Motion.animate(prize, { opacity: 0 }, { duration: 0.2 });
        if (!autoAnimating) expand(0.4);
      });
      card.addEventListener("mouseleave", function () {
        hovered = false;
        Motion.animate(prize, { opacity: 1 }, { duration: 0.2, delay: 0.2 });
        if (!autoAnimating) collapse(0.4);
      });
    });
  }

  function mobile(grid) {
    if (!grid) return;
    grid.querySelectorAll(".relative.flex.items-center.justify-center.h-9.rounded-full").forEach(function (chip) {
      var arrow = chip.children[0], text = chip.children[1];
      [chip, arrow, text].forEach(function (el) { el.removeAttribute("data-motion"); });
      var card = chip.closest(".rounded-2xl.overflow-hidden");
      var open = false, timer = null;
      function show(on) {
        open = on;
        Motion.animate(chip, { width: on ? 80 : 35 }, { duration: 0.4, ease: EASE });
        Motion.animate(arrow, { opacity: on ? 0 : 1, x: on ? 10 : 0 }, { duration: 0.3 });
        Motion.animate(text, { opacity: on ? 1 : 0, x: on ? 0 : -10 }, { duration: 0.3, delay: on ? 0.1 : 0 });
      }
      function check() {
        var r = card.getBoundingClientRect();
        if (Math.abs(r.top + r.height / 2 - window.innerHeight / 2) < 100 && !open && !timer) {
          show(true);
          timer = setTimeout(function () { show(false); timer = null; }, 3500);
        }
      }
      window.addEventListener("scroll", check);
      check();
    });
  }

  window.EventCards = { desktop: desktop, mobile: mobile };
})();
