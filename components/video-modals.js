/*
 * YouTube pop-ups on the home page (were inline in pages/home.tsx and
 * components/mobile/MobileHome.tsx).
 *   VideoModals.short(id, "desktop" | "mobile")          vertical "Voices of Strategia" reels
 *   VideoModals.video(ids, index, "desktop" | "mobile")   "Video Gallery" player (desktop has arrows)
 */
(function () {
  function svg(cls, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" class="' + cls + '">' + body + "</svg>";
  }
  var X = '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>';
  var LEFT = '<path d="m15 18-6-6 6-6"></path>';
  var RIGHT = '<path d="m9 18 6-6-6-6"></path>';
  var ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

  function open(html) {
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    var overlay = wrap.firstElementChild;
    document.body.appendChild(overlay);
    Motion.set(overlay, { opacity: 0 });
    Motion.animate(overlay, { opacity: 1 });
    return overlay;
  }
  function close(overlay, after) {
    Motion.animate(overlay, { opacity: 0 }, null, function () {
      overlay.remove();
      if (after) after();
    });
  }
  function popIn(el) {
    Motion.set(el, { scale: 0.9, opacity: 0 });
    Motion.animate(el, { scale: 1, opacity: 1 }, { type: "spring", damping: 25, stiffness: 300 });
  }

  function short(id, variant) {
    var desktop = variant !== "mobile";
    var overlay = open(
      '<div class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4">' +
      '  <button class="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white z-[110]' + (desktop ? " hover:bg-white/20 transition-colors" : "") + '">' +
           svg(desktop ? "lucide lucide-x w-6 h-6 md:w-8 md:h-8" : "lucide lucide-x w-6 h-6", X) + "</button>" +
      '  <div class="relative w-full max-w-[350px]' + (desktop ? " md:max-w-[450px]" : "") + ' aspect-[9/16] overflow-hidden rounded-2xl shadow-2xl bg-black border border-gray-800">' +
      '    <div class="absolute inset-0 w-full h-full">' +
      '      <iframe class="w-full h-full" src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="YouTube Short" allow="' + ALLOW + '" allowfullscreen></iframe>' +
      "    </div>" +
      "  </div>" +
      "</div>"
    );
    var box = overlay.children[1];
    popIn(box.firstElementChild);
    overlay.addEventListener("click", function () { close(overlay); });
    box.addEventListener("click", function (e) { e.stopPropagation(); });
  }

  function video(ids, index, variant) {
    var desktop = variant !== "mobile";
    var html = desktop
      ? '<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8">' +
        '  <button data-close class="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-[110] transition-all duration-300 group hover:bg-orange-600 hover:scale-110">' +
             svg("lucide lucide-x w-5 h-5 text-black group-hover:text-white transition-colors duration-300", X) + "</button>" +
        '  <button data-prev class="absolute left-4 md:left-16 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group hover:bg-orange-600 hover:scale-110">' +
             svg("lucide lucide-chevron-left w-6 h-6 text-black group-hover:text-white transition-colors duration-300 mr-0.5", LEFT) + "</button>" +
        '  <button data-next class="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group hover:bg-orange-600 hover:scale-110">' +
             svg("lucide lucide-chevron-right w-6 h-6 text-black group-hover:text-white transition-colors duration-300 ml-0.5", RIGHT) + "</button>" +
        '  <div data-stage class="relative w-full max-w-6xl aspect-video overflow-hidden rounded-3xl shadow-2xl border border-white/10 bg-black"></div>' +
        "</div>"
      : '<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">' +
        '  <button data-close class="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center z-[110]">' + svg("lucide lucide-x w-6 h-6 text-white", X) + "</button>" +
        '  <div data-stage class="relative w-full max-w-5xl aspect-video overflow-hidden rounded-2xl shadow-2xl bg-black border border-white/10"></div>' +
        "</div>";
    var overlay = open(html);
    var stage = overlay.querySelector("[data-stage]");

    function frame(id) {
      return '<iframe class="w-full h-full" src="https://www.youtube.com/embed/' + id + '?autoplay=1&modestbranding=1&rel=0&showinfo=0" title="YouTube Video" allow="' + ALLOW + '" allowfullscreen></iframe>';
    }
    // desktop: slides left/right between videos (next one waits for the old one to leave)
    function show(i, direction) {
      index = (i + ids.length) % ids.length;
      if (!desktop) { stage.innerHTML = frame(ids[index]); return; }
      var old = stage.firstElementChild;
      var slide = document.createElement("div");
      slide.className = "absolute inset-0 w-full h-full";
      slide.innerHTML = frame(ids[index]);
      var enter = function () {
        stage.appendChild(slide);
        if (!direction) return;
        Motion.set(slide, { x: direction > 0 ? 1000 : -1000, opacity: 0, zIndex: 1 });
        Motion.animate(slide, { x: 0, opacity: 1 }, { x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } });
      };
      if (old && direction) {
        Motion.animate(old, { x: direction < 0 ? 1000 : -1000, opacity: 0, zIndex: 0 }, { x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }, function () {
          old.remove();
          enter();
        });
      } else {
        if (old) old.remove();
        enter();
      }
    }
    show(index, 0);

    var closed = false;
    function shut() {
      if (closed) return;
      closed = true;
      document.body.style.overflow = "";
      window.removeEventListener("popstate", shut);
      close(overlay);
    }
    overlay.addEventListener("click", shut);
    stage.addEventListener("click", function (e) { e.stopPropagation(); });
    overlay.querySelector("[data-close]").addEventListener("click", function (e) { e.stopPropagation(); shut(); });
    var prev = overlay.querySelector("[data-prev]"), next = overlay.querySelector("[data-next]");
    if (prev) prev.addEventListener("click", function (e) { e.stopPropagation(); show(index - 1, -1); });
    if (next) next.addEventListener("click", function (e) { e.stopPropagation(); show(index + 1, 1); });

    if (!desktop) {
      // phones: the Back button closes the video instead of leaving the page
      document.body.style.overflow = "hidden";
      history.pushState({ videoOpen: true }, "", location.href);
      window.addEventListener("popstate", shut);
    }
  }

  window.VideoModals = { short: short, video: video };
})();
