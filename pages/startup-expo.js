/*
 * Startup Expo page (was pages/startup-expo.tsx and components/mobile/MobileStartupExpo.tsx).
 * The "Meet Our VCs & Investors" strip scrolls by itself every 3 seconds while
 * it is on screen. Hovering a card pauses it; the arrows move one card and
 * pause for 6 seconds.
 */
(function () {
  var desktop = document.querySelector(".view-desktop");
  var mobile = document.querySelector(".view-mobile");

  var strip = desktop.querySelector(".flex.overflow-x-auto");
  if (strip) {
    var section = strip.closest("section");
    var auto = Carousels.autoScroll({
      container: strip,
      section: section,
      mode: "edge",
      gap: 20,
      fallbackWidth: 260,
      pauseOn: Array.prototype.slice.call(strip.children),
    });
    var arrows = section.querySelectorAll(".flex.justify-center.items-center.gap-4.mt-8 > button");
    if (arrows[0]) arrows[0].addEventListener("click", function () { auto.nudge(-1); });
    if (arrows[1]) arrows[1].addEventListener("click", function () { auto.nudge(1); });
  }

  var mstrip = mobile.querySelector(".flex.overflow-x-auto");
  if (mstrip) {
    Carousels.autoScroll({
      container: mstrip,
      section: mstrip.closest("section"),
      amount: 0.1,
      mode: "loop",
      count: mstrip.children.length,
      gap: 16,
      fallbackWidth: 200,
      pauseOn: [mstrip.parentElement],
    });
  }
})();
