/*
 * Mobile header + bottom tab bar (was components/mobile/MobileNavigation.tsx).
 * Rendered into <div data-component="mobile-navigation"></div> on every page.
 */
(function () {
  var ICONS = {
    "Home": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"></path><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"></path>",
    "Events": "<path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"></path><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"></path><path d=\"M4 22h16\"></path><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"></path><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"></path><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"></path>",
    "Schedule": "<path d=\"M8 2v4\"></path><path d=\"M16 2v4\"></path><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"></rect><path d=\"M3 10h18\"></path>",
    "About": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path>",
    "Contact": "<path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path>"
  };

  var TABS = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/schedule", label: "Schedule" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];
  var ICON_CLASS = { Home: "lucide-house", Events: "lucide-trophy", Schedule: "lucide-calendar", About: "lucide-users", Contact: "lucide-phone" };

  function render(host) {
    var route = document.body.getAttribute("data-route") || "/";
    var tabs = TABS.map(function (t) {
      var color = route === t.href ? "text-white" : "text-gray-400";
      return (
        '<a href="' + Site.url(t.href) + '"><div class="flex flex-col items-center p-2 rounded-lg transition-all duration-200">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" class="lucide ' + ICON_CLASS[t.label] + ' transition-all duration-200 ' + color + '">' + ICONS[t.label] + "</svg>" +
        '<span class="text-xs mt-1 font-medium transition-all duration-200 ' + color + '">' + t.label + "</span>" +
        "</div></a>"
      );
    }).join("");

    host.outerHTML =
      '<div class="fixed top-0 left-0 right-0 z-50 bg-[#00204E]/90 backdrop-blur-md border-b border-white/10">' +
      '  <div class="flex items-center justify-between px-4 py-2">' +
      '    <div class="flex items-center justify-start flex-1">' +
      '      <a href="' + Site.url("/") + '"><img src="/attached_assets/Strategia-25_1_1753885997515.png" alt="STRATEGIA&#39;25" class="h-10 w-auto" style="margin-top: 0.2cm" /></a>' +
      "    </div>" +
      "    <div>" +
      '      <a href="' + Site.url("/registration") + '"><button class="!h-8 bg-gradient-to-r from-[#E30613] to-red-600 text-white font-bold text-[14px] leading-none px-5 rounded-md shadow-lg hover:scale-105 transition-transform duration-200">REGISTER</button></a>' +
      "    </div>" +
      "  </div>" +
      "</div>" +
      '<div class="fixed bottom-0 left-0 right-0 z-40 bg-[#012557]/100 backdrop-blur-md border-t border-white/10">' +
      '  <div class="flex items-center justify-around py-2">' + tabs + "</div>" +
      "</div>";
  }

  document.querySelectorAll('[data-component="mobile-navigation"]').forEach(render);
})();
