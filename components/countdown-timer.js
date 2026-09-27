/*
 * "Event Starts In" countdown (was components/ui/countdown-timer.tsx).
 * Counts down to window.EVENT_DATE (lib/constants.js). Each box also has a
 * soft spotlight that follows the mouse.
 *
 *   Countdown.mount(containerWithTheFourBoxes)
 */
(function () {
  function pad(n) { return String(n).padStart(2, "0"); }

  function mount(root) {
    if (!root) return;
    var numbers = Array.prototype.slice.call(root.querySelectorAll(".tabular-nums"));
    if (numbers.length < 4) return;
    var RED = [false, true, false, true]; // hours and seconds are red

    function render(t) {
      [t.days, t.hours, t.minutes, t.seconds].forEach(function (v, i) {
        numbers[i].textContent = pad(v);
        numbers[i].style.textShadow = RED[i] && v < 10 ? "0 0 10px rgba(227, 6, 19, 0.3)" : "";
      });
    }
    var timer = null;
    function tick() {
      var distance = window.EVENT_DATE.getTime() - Date.now();
      if (distance > 0) {
        render({
          days: Math.floor(distance / 86400000),
          hours: Math.floor((distance % 86400000) / 3600000),
          minutes: Math.floor((distance % 3600000) / 60000),
          seconds: Math.floor((distance % 60000) / 1000),
        });
      } else {
        render({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    }
    tick();
    timer = setInterval(tick, 1000);

    // spotlight that follows the cursor inside each box
    numbers.forEach(function (num) {
      var box = num.parentElement;
      var light = box.firstElementChild;
      if (!light || light === num) return;
      light.removeAttribute("data-motion");
      Motion.set(light, { opacity: 0 });
      box.addEventListener("mousemove", function (e) {
        var r = box.getBoundingClientRect();
        light.style.background = "radial-gradient(120px circle at " + (e.clientX - r.left) + "px " + (e.clientY - r.top) +
          "px, rgba(255, 255, 255, 0.4) 0%, transparent 70%)";
        Site.animateIfChanged(light, { opacity: 1 }, { duration: 0.2, ease: "easeOut" });
      });
      box.addEventListener("mouseleave", function () {
        Site.animateIfChanged(light, { opacity: 0 }, { duration: 0.2, ease: "easeOut" });
      });
    });
  }

  window.Countdown = { mount: mount };
})();
