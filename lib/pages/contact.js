/*
 * Contact page (was pages/contact.tsx and components/mobile/MobileContact.tsx).
 *  - quick-link buttons scroll to each section
 *  - "Send us a Message" form (sent by lib/static-api.js)
 *  - FAQ accordion (one answer open at a time)
 *  - clicking the map opens Google Maps
 */
(function () {
  var MAPS_URL = "https://maps.app.goo.gl/RnXMAbqqpKmUiEDs5";
  var views = [
    { root: document.querySelector(".view-desktop"), links: { "Contact Information": "contact-section", "Send us a Message": "contact-form", "FAQs": "faq-section" } },
    { root: document.querySelector(".view-mobile"), links: null },
  ];

  views.forEach(function (v) {
    var root = v.root;

    // quick links in the hero
    root.querySelectorAll("section:first-of-type button").forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        var label = btn.textContent.trim();
        if (v.links) {
          Object.keys(v.links).forEach(function (k) { if (label.indexOf(k) === 0) Site.scrollToId(v.links[k]); });
        } else {
          Site.scrollToId(["contact-info", "m-contact-form", "faq"][i]);
        }
      });
    });

    // map
    var map = root.querySelector("iframe[src*='google.com/maps']");
    if (map) map.parentElement.addEventListener("click", function () { window.open(MAPS_URL, "_blank", "noopener,noreferrer"); });

    // message form
    var form = root.querySelector("form");
    if (form) {
      var button = form.querySelector('button[type="submit"]');
      Forms.bind(form, {
        rules: {
          firstName: [Forms.required("First name is required")],
          lastName: [Forms.required("Last name is required")],
          email: [Forms.email("Invalid email address")],
          subject: [Forms.required("Subject is required")],
          message: [Forms.minLength(10, "Message must be at least 10 characters")],
        },
        onSubmit: function (data, reset) {
          button.disabled = true;
          button.textContent = "Sending...";
          Api.sendContact(data).then(function () {
            toast({ title: "Message Sent!", description: "Thank you for your message. We'll get back to you soon." });
            reset();
          }, function (err) {
            toast({ title: "Failed to Send Message", description: err.message, variant: "destructive" });
          }).then(function () {
            button.disabled = false;
            button.textContent = "Send Message";
          });
        },
      });
    }

    // FAQ accordion
    var faqButtons = Array.prototype.slice.call(root.querySelectorAll("button.w-full.flex.items-center.justify-between"));
    function setOpen(btn, open) {
      var chevron = btn.querySelector("svg");
      var panel = btn.nextElementSibling;
      if (chevron) chevron.classList.toggle("rotate-180", open);
      if (panel) {
        panel.classList.toggle("max-h-96", open);
        panel.classList.toggle("opacity-100", open);
        panel.classList.toggle("max-h-0", !open);
        panel.classList.toggle("opacity-0", !open);
      }
      btn.__open = open;
    }
    faqButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var willOpen = !btn.__open;
        faqButtons.forEach(function (b) { setOpen(b, false); });
        if (willOpen) setOpen(btn, true);
      });
    });
  });
})();
