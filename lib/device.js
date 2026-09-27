/*
 * Chooses the layout before the page paints (was hooks/useDeviceType.ts).
 * Phones, tablets and any window 768px or narrower get the mobile layout;
 * touch screens up to 1024px wide do too.
 */
(function () {
  function isMobile() {
    var ua = navigator.userAgent.toLowerCase();
    var mobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/.test(ua);
    var touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    return mobileUA || window.innerWidth <= 768 || (touch && window.innerWidth <= 1024);
  }
  function apply() {
    var mobile = isMobile();
    document.documentElement.classList.toggle("is-mobile", mobile);
    window.IS_MOBILE = mobile;
  }
  apply();
  window.addEventListener("resize", function () {
    var before = window.IS_MOBILE;
    apply();
    if (before !== window.IS_MOBILE) window.dispatchEvent(new Event("layoutchange"));
  });
})();
