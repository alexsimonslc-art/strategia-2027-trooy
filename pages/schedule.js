/*
 * Schedule page (was pages/schedule.tsx and components/mobile/MobileSchedule.tsx).
 * The Day 1 / Day 2 buttons swap the timeline. Both days are stored in this page
 * as <template> blocks (search for data-state="day2").
 */
(function () {
  ["view-desktop", "view-mobile"].forEach(function (cls) {
    var root = document.querySelector("." + cls);
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn || !btn.closest('[data-state-region="schedule"]')) return;
      var label = btn.textContent.trim();
      if (/^Day 1/.test(label)) States.show(root, "schedule", "day1");
      else if (/^Day 2/.test(label)) States.show(root, "schedule", "day2");
    });
  });
})();
