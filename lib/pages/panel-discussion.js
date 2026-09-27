/*
 * Panel Discussion page (was pages/panel-discussion.tsx and
 * components/mobile/MobilePanelDiscussion.tsx).
 *  - desktop: panelist slider with arrows; hovering a card greys out the rest
 *  - mobile: panelist strip scrolls by itself every 3s (pauses while touched)
 */
(function () {
  var desktop = document.querySelector(".view-desktop");
  var mobile = document.querySelector(".view-mobile");

  var wrap = desktop.querySelector("[class~=\"group/carousel\"]");
  if (wrap) {
    var buttons = wrap.querySelectorAll(":scope > button");
    var track = wrap.querySelector(".overflow-hidden > .flex.gap-6");
    var cards = Array.prototype.slice.call(track.children);
    Carousels.arrowSlider({ track: track, prev: buttons[0], next: buttons[1], cardsToShow: 4, total: cards.length });
    Carousels.hoverDim(cards);
  }

  var strip = mobile.querySelector(".flex.overflow-x-auto");
  if (strip) {
    Carousels.autoScroll({
      container: strip,
      section: strip.closest("section"),
      amount: 0.1,
      mode: "loop",
      count: strip.children.length,
      gap: 16,
      fallbackWidth: 200,
      pauseOn: [strip.parentElement],
    });
    Carousels.hoverDim(Array.prototype.slice.call(strip.children));
  }
})();
