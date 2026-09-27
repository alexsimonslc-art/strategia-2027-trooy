/*
 * Reusable carousel behaviours used by the Home, Panel Discussion and
 * Startup Expo pages (the React pages each had their own copy of these).
 */
(function () {
  /*
   * Arrow slider: a flex track moved with a spring (x: -index * 100/cardsToShow %).
   * Arrows fade out at either end.
   */
  function arrowSlider(opts) {
    var track = Site.takeOver(opts.track);
    var index = 0;
    var max = Math.max(0, opts.total - opts.cardsToShow);
    function update() {
      Motion.animate(track, { x: "-" + index * (100 / opts.cardsToShow) + "%" }, { type: "spring", stiffness: 300, damping: 30 });
      if (opts.prev) {
        opts.prev.disabled = index === 0;
        opts.prev.classList.toggle("opacity-0", index === 0);
        opts.prev.classList.toggle("pointer-events-none", index === 0);
        opts.prev.classList.toggle("opacity-100", index !== 0);
      }
      if (opts.next) {
        opts.next.disabled = index >= max;
        opts.next.classList.toggle("opacity-0", index >= max);
        opts.next.classList.toggle("pointer-events-none", index >= max);
        opts.next.classList.toggle("opacity-100", index < max);
      }
    }
    if (opts.prev) opts.prev.addEventListener("click", function () { if (index > 0) { index--; update(); } });
    if (opts.next) opts.next.addEventListener("click", function () { if (index < max) { index++; update(); } });
    return { update: update };
  }

  /*
   * Hovering one card greys out the others.
   */
  function hoverDim(cards) {
    var DIM = ["grayscale", "opacity-60", "scale-95"];
    var FULL = ["grayscale-0", "opacity-100", "scale-100"];
    function set(hovered) {
      cards.forEach(function (c, i) {
        var dim = hovered !== null && hovered !== i;
        DIM.forEach(function (k) { c.classList.toggle(k, dim); });
        FULL.forEach(function (k) { c.classList.toggle(k, !dim); });
      });
    }
    cards.forEach(function (c, i) {
      c.addEventListener("mouseenter", function () { set(i); });
      c.addEventListener("mouseleave", function () { set(null); });
    });
  }

  /*
   * Auto-scrolling strip of cards (overflow-x container), every `interval` ms
   * while its section is on screen and not paused.
   *   mode "loop":  step 0,1,2,...,count-1 then back to 0
   *   mode "edge":  next card, or back to the start when at the end
   */
  function autoScroll(opts) {
    var el = opts.container;
    var paused = false;
    var inView = false;
    var timer = null;
    var cardIndex = 0;

    function step() {
      var first = el.children[0];
      var amount = ((first && first.clientWidth) || opts.fallbackWidth || 260) + (opts.gap || 16);
      if (opts.mode === "loop") {
        cardIndex++;
        if (cardIndex >= opts.count) cardIndex = 0;
        el.scrollTo({ left: cardIndex * amount, behavior: "smooth" });
      } else if (opts.mode === "by") {
        el.scrollBy({ left: amount, behavior: "smooth" });
      } else {
        var current = el.scrollLeft;
        var max = el.scrollWidth - el.clientWidth;
        if (current >= max - 10) el.scrollTo({ left: 0, behavior: "smooth" });
        else el.scrollTo({ left: (Math.round(current / amount) + 1) * amount, behavior: "smooth" });
      }
    }
    function sync() {
      clearInterval(timer);
      timer = null;
      cardIndex = 0; // React restarted the effect (and its counter) whenever this changed
      if (inView && !paused) timer = setInterval(step, opts.interval || 3000);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var now = e.isIntersecting && e.intersectionRatio >= (opts.amount || 0);
        if (now !== inView) { inView = now; sync(); }
      });
    }, { threshold: opts.amount ? [0, opts.amount] : 0 });
    io.observe(opts.section || el);

    function pause(on) { if (paused !== on) { paused = on; sync(); } }
    (opts.pauseOn || []).forEach(function (target) {
      target.addEventListener("mouseenter", function () { pause(true); });
      target.addEventListener("mouseleave", function () { pause(false); });
      target.addEventListener("touchstart", function () { pause(true); }, { passive: true });
      target.addEventListener("touchend", function () { pause(false); });
    });
    return {
      pause: pause,
      // arrows next to the strip: scroll one card and pause for 6 seconds
      nudge: function (dir) {
        var first = el.children[0];
        var amount = ((first && first.clientWidth) || 260) + (opts.nudgeGap || 24);
        el.scrollBy({ left: dir * amount, behavior: "smooth" });
        pause(true);
        setTimeout(function () { pause(false); }, 6000);
      },
    };
  }

  window.Carousels = { arrowSlider: arrowSlider, hoverDim: hoverDim, autoScroll: autoScroll };
})();
