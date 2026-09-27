/*
 * Desktop navigation bar (was components/layout/navigation.tsx).
 * Rendered into <div data-component="navigation"></div> on every page.
 */
(function () {
  var NAV_ITEMS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/schedule", label: "Schedule" },
    { href: "/sponsors", label: "Sponsors" },
    { href: "/contact", label: "Contact" },
  ];

  var ICON_TROPHY =
    '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path>' +
    '<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>' +
    '<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>';
  var ICON_MENU = '<line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line>';
  var ICON_X = '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>';

  function svg(cls, body) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' + cls + '">' + body + "</svg>"
    );
  }

  // The red "Register Now" button with the slide-up hover (was components/ui/register-button.tsx)
  function registerButton(extraClass) {
    return (
      '<button class="relative overflow-hidden group bg-[#E30613] border border-[#E30613] hover:border-white font-bold px-6 h-10 rounded-md shadow-md dm-sans-bold text-base ' + (extraClass || "") + '">' +
      '  <div class="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>' +
      '  <div class="relative z-10 flex flex-col items-center justify-center overflow-hidden h-6">' +
      '    <span class="flex items-center gap-2 text-white whitespace-nowrap transform group-hover:-translate-y-[150%] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]">' +
             svg("lucide lucide-trophy w-4 h-4", ICON_TROPHY) + "<span>Register Now</span></span>" +
      '    <span class="absolute flex items-center gap-2 text-[#00204E] whitespace-nowrap transform translate-y-[150%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]">' +
             svg("lucide lucide-trophy w-4 h-4 text-[#00204E]", ICON_TROPHY) + "<span>Register Now</span></span>" +
      "  </div>" +
      "</button>"
    );
  }
  window.RegisterButton = registerButton;

  function isActive(route, href) {
    return route === href || (href !== "/" && route.indexOf(href) === 0);
  }

  function render(host) {
    var route = document.body.getAttribute("data-route") || "/";
    var links = NAV_ITEMS.map(function (item) {
      var active = isActive(route, item.href);
      return (
        '<div class="relative group cursor-pointer py-2 mt-1">' +
        '  <a href="' + Site.url(item.href) + '"><div class="relative px-2">' +
        '    <span class="relative z-10 text-base font-bold dm-sans-bold transition-colors duration-300 ' +
               (active ? "text-red-400" : "text-gray-300 hover:text-red-400") + '">' + item.label + "</span>" +
               (active ? '<div class="absolute -bottom-1.5 left-0 right-0 h-[3px] bg-red-400" style="transform-origin: 50% 0px 0px"></div>' : "") +
        "  </div></a>" +
        "</div>"
      );
    }).join("");

    var drawerLinks = NAV_ITEMS.map(function (item) {
      var active = isActive(route, item.href);
      return (
        '<div><div><a href="' + Site.url(item.href) + '"><span class="block px-4 py-3 text-lg font-bold rounded-lg transition-colors cursor-pointer dm-sans-bold flex justify-between items-center ' +
        (active ? "bg-white/10 text-red-400" : "text-gray-400 hover:text-white hover:bg-white/5") + '">' + item.label + "</span></a></div></div>"
      );
    }).join("");

    host.outerHTML =
      '<nav class="fixed top-0 w-full bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-md border-b border-white/10 z-50 shadow-2xl" ' +
      'style="box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 30px, rgba(255, 255, 255, 0.1) 0px 1px 0px inset; transform: translateY(-100px)" ' +
      'data-motion=\'{"initial":{"y":-100},"animate":{"y":0},"transition":{"type":"spring","stiffness":300,"damping":30}}\'>' +
      '  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">' +
      '    <div class="flex justify-between items-center h-16">' +
      '      <div class="flex items-center">' +
      '        <a href="' + Site.url("/") + '"><div class="flex items-center space-x-3 cursor-pointer" style="margin-top: 10px">' +
      '          <img src="/attached_assets/Strategia-25_1_1753885997515.png" alt="STRATEGIA\'25" class="h-8 sm:h-10 w-auto logo-glow hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300" />' +
      "        </div></a>" +
      "      </div>" +
      '      <div class="hidden md:block">' +
      '        <div class="ml-10 flex items-center space-x-12">' + links +
      '          <div class="ml-4"><a href="' + Site.url("/registration") + '"><div>' + registerButton() + "</div></a></div>" +
      "        </div>" +
      "      </div>" +
      '      <div class="md:hidden flex items-center gap-4">' +
      '        <button class="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none" data-nav-toggle data-motion=\'{"whileTap":{"scale":0.9}}\'>' +
               svg("lucide lucide-menu h-6 w-6", ICON_MENU) + svg("lucide lucide-x h-6 w-6 hidden", ICON_X) +
      "        </button>" +
      "      </div>" +
      "    </div>" +
      "  </div>" +
      '  <div class="md:hidden bg-[#0f172a] border-b border-white/10 overflow-hidden hidden" data-nav-drawer>' +
      '    <div class="px-4 pt-4 pb-6 space-y-2">' + drawerLinks +
      '      <div class="pt-4 mt-4 border-t border-white/10"><a href="' + Site.url("/registration") + '"><div><div class="flex justify-center">' + registerButton("w-full") + "</div></div></a></div>" +
      "    </div>" +
      "  </div>" +
      "</nav>";

    var nav = document.querySelector("nav[data-motion]");
    var toggle = nav.querySelector("[data-nav-toggle]");
    var drawer = nav.querySelector("[data-nav-drawer]");
    toggle.addEventListener("click", function () {
      var open = drawer.classList.toggle("hidden") === false;
      toggle.querySelector(".lucide-menu").classList.toggle("hidden", open);
      toggle.querySelector(".lucide-x").classList.toggle("hidden", !open);
    });
  }

  document.querySelectorAll('[data-component="navigation"]').forEach(render);
})();
