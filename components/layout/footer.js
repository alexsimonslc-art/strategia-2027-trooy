/*
 * Site footer (was components/layout/footer.tsx).
 * Rendered into <div data-component="footer"></div> on every desktop page.
 * Edit the markup below to change links or contact details.
 */
(function () {
  var FOOTER_HTML = `
    <footer class="bg-gray-900 text-white py-12 border-t border-gray-800">
      <div class="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 border-b border-gray-800 pb-12">
          <div class="space-y-4">
            <div class="flex items-center">
              <img
                src="/attached_assets/Strategia-25_1_1753894594012.png"
                alt="STRATEGIA Logo"
                class="h-12 w-auto mr-3 logo-glow opacity-90 hover:opacity-100 transition-opacity"
                loading="lazy"
              /><span class="text-xl dm-sans-bold font-bold">2026</span>
            </div>
            <p class="text-gray-400 dm-sans-medium text-sm leading-relaxed">
              The Ultimate Business Strategy Challenge.<br /><br />Proudly presented by<br />Department of
              B.Com.(Honours)<br />Loyola College (Autonomous)
            </p>
            <div class="flex space-x-4 pt-2">
              <a
                href="https://www.instagram.com/strategia_official"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-400 hover:text-strategia-red transition-colors"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-instagram w-5 h-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg></a
              ><a
                href="https://www.linkedin.com/company/strategiaevent/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-400 hover:text-strategia-red transition-colors"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-linkedin w-5 h-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle></svg></a
              ><a
                href="https://youtube.com/@strategiaevent"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-400 hover:text-strategia-red transition-colors"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-youtube w-5 h-5"
                >
                  <path
                    d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"
                  ></path>
                  <path d="m10 15 5-3-5-3z"></path></svg
              ></a>
            </div>
          </div>
          <div>
            <h4 class="text-lg font-semibold dm-sans-bold mb-5 text-white">Quick Links</h4>
            <ul class="space-y-3 text-sm text-gray-400">
              <li><a href="/pages/about.html" class="hover:text-white transition-colors block">About Us</a></li>
              <li><a href="/pages/schedule.html" class="hover:text-white transition-colors block">Event Schedule</a></li>
              <li><a href="/pages/registration.html" class="hover:text-white transition-colors block">Register Now</a></li>
              <li><a href="/pages/sponsors.html" class="hover:text-white transition-colors block">Our Sponsors</a></li>
              <li><a href="/pages/contact.html" class="hover:text-white transition-colors block">Contact Support</a></li>
              <li><a href="/pages/contact.html#faq-section" class="hover:text-white transition-colors block">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold dm-sans-bold mb-5 text-white">Competitions</h4>
            <ul class="space-y-3 text-sm text-gray-400">
              <li>
                <a href="/pages/events/strategiq.html" class="hover:text-strategia-red transition-colors block"
                  >StrategIQ (Business Quiz)</a
                >
              </li>
              <li>
                <a href="/pages/events/market-masters.html" class="hover:text-strategia-red transition-colors block"
                  >Market Masters (Stock Trading)</a
                >
              </li>
              <li>
                <a href="/pages/events/venturex.html" class="hover:text-strategia-red transition-colors block"
                  >VentureX (Shark Tank)</a
                >
              </li>
              <li>
                <a href="/pages/events/case-quest.html" class="hover:text-strategia-red transition-colors block"
                  >Case Quest (Case Study)</a
                >
              </li>
              <li>
                <a href="/pages/panel-discussion.html" class="hover:text-strategia-red transition-colors block"
                  >Panel Discussion</a
                >
              </li>
              <li>
                <a href="/pages/startup-expo.html" class="hover:text-strategia-red transition-colors block">Startup Expo</a>
              </li>
              <li>
                <a
                  href="/pages/events/final-showdown.html"
                  class="hover:text-yellow-400 transition-colors block font-semibold"
                  >Grand Finale</a
                >
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold dm-sans-bold mb-5 text-white">Contact Info</h4>
            <ul class="space-y-4 text-sm text-gray-400">
              <li class="leading-relaxed flex items-start gap-3">
                <span>Loyola College, Sterling Road,<br />Nungambakkam, Chennai - 600 034.</span>
              </li>
              <li class="flex items-center gap-3">
                <a href="mailto:support@strategiaevent.com" class="hover:text-white transition-colors"
                  >support@strategiaevent.com</a
                >
              </li>
              <li class="flex flex-col gap-2 pl-4 border-l-2 border-gray-800">
                <a href="tel:+919940311635" class="hover:text-white transition-colors block"
                  >+91 99403 11635 <span class="text-xs text-gray-600 ml-1">(Support)</span></a
                ><a href="tel:+916380895766" class="hover:text-white transition-colors block"
                  >+91 63808 95766 <span class="text-xs text-gray-600 ml-1">(Registration)</span></a
                >
              </li>
            </ul>
          </div>
        </div>
        <div class="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <div
            class="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-center md:text-left order-2 md:order-1"
          >
            <span>© 2026 STRATEGIA. All rights reserved.</span><span class="hidden sm:inline text-gray-700">|</span
            ><a href="/pages/privacy-policy.html" class="hover:text-white transition-colors">Privacy Policy</a
            ><span class="hidden sm:inline text-gray-700">|</span
            ><a href="/pages/rules-regulations.html" class="hover:text-white transition-colors">Rules &amp; Regulations</a>
          </div>
          <div class="flex flex-col items-center md:items-end space-y-1 order-1 md:order-2">
            <p class="dm-sans-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Made with passion by Team Strategia 2026
            </p>
            <div class="text-[11px] font-medium tracking-wide text-gray-600">
              Tech Lead &amp; Developer:
              <a
                href="https://www.linkedin.com/in/alexsimon05"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-400 hover:text-white transition-colors"
                >Alex Simon S</a
              >
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;

  document.querySelectorAll('[data-component="footer"]').forEach(function (host) {
    host.outerHTML = FOOTER_HTML;
  });
})();
