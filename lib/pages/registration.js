/*
 * Registration page (was pages/registration.tsx, pages/PanelRegistrationForm.tsx
 * and the mobile versions).
 *  - "Competitions" / "Panel Discussion" switch (both versions of the page are
 *    stored here as <template data-state="competition|panel">)
 *  - ?event=panel opens the Panel Discussion form directly
 *  - team form: validation, event picker, submit to the Google Sheet
 *
 * NOTE: as on the live site, every competition is marked CLOSED and the panel
 * button reads "Registration Closed". To reopen, edit the markup in the
 * templates (remove disabled / CLOSED) — the code below already handles it.
 */
(function () {
  var views = [document.querySelector(".view-desktop"), document.querySelector(".view-mobile")];

  var YEAR_FIELDS = ["yearOfStudy", "member1YearOfStudy", "member2YearOfStudy"];
  var TEAM_RULES = {
    teamName: [Forms.required("Please enter team name")],
    institution: [Forms.required("Please enter institution")],
    captainName: [Forms.required("Please enter captain name")],
    captainEmail: [Forms.email("Please enter valid email address")],
    captainPhone: [Forms.minLength(10, "Please enter valid phone number")],
    yearOfStudy: [Forms.required("Please select year of study")],
    member1Name: [Forms.required("Please enter member 2 name")],
    member1Email: [Forms.email("Please enter valid email address")],
    member1Phone: [Forms.minLength(10, "Please enter valid phone number")],
    member1YearOfStudy: [Forms.required("Please select year of study")],
    member2Name: [],
    member2Email: [Forms.optionalEmail("Please enter valid email address")],
    member2Phone: [],
    member2YearOfStudy: [],
  };

  function setupTeamForm(root) {
    var form = root.querySelector("form");
    if (!form || !form.querySelector('[name="teamName"]')) return;
    form.querySelectorAll('button[role="combobox"] + select').forEach(function (sel, i) {
      if (YEAR_FIELDS[i]) sel.setAttribute("name", YEAR_FIELDS[i]);
    });
    SelectMenu.init(form);

    var submit = form.querySelector('button[type="submit"]');
    var selectedEvent = "";
    var boxes = Array.prototype.slice.call(form.querySelectorAll('button[role="checkbox"]'));
    var CHECK_ICON = '<span data-state="checked" class="flex items-center justify-center text-current" style="pointer-events: none">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check h-4 w-4"><path d="M20 6 9 17l-5-5"></path></svg></span>';

    function render() {
      boxes.forEach(function (b) {
        var on = b.id === selectedEvent;
        b.setAttribute("data-state", on ? "checked" : "unchecked");
        b.setAttribute("aria-checked", on ? "true" : "false");
        b.innerHTML = on ? CHECK_ICON : "";
      });
      submit.disabled = !selectedEvent;
    }
    boxes.forEach(function (b) {
      if (b.disabled) return;
      var toggle = function () { selectedEvent = selectedEvent === b.id ? "" : b.id; render(); };
      b.addEventListener("click", toggle);
      var label = form.querySelector('label[for="' + b.id + '"]');
      if (label) label.addEventListener("click", function (e) { e.preventDefault(); toggle(); });
    });

    var busy = document.createElement("div");
    busy.className = "mt-4 text-amber-600 font-bold text-sm";
    busy.textContent = "Please wait, Processing your registration... Do not refresh or navigate away from this page.";

    Forms.bind(form, {
      rules: TEAM_RULES,
      onSubmit: function (data) {
        if (!selectedEvent) {
          toast({ title: "Registration Failed", description: "Please select at least one event", variant: "destructive" });
          return;
        }
        data.selectedEvents = [selectedEvent];
        submit.disabled = true;
        submit.textContent = "Registering...";
        submit.parentElement.appendChild(busy);
        Api.registerTeam(data).then(function () {
          Site.go("/registration-confirmation");
        }, function (err) {
          toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
          submit.disabled = false;
          submit.textContent = "Register";
          busy.remove();
        });
      },
    });
  }

  function setupPanelForm(root) {
    var form = root.querySelector("form");
    if (!form || !form.querySelector('[name="salutation"]')) return;
    var button = form.querySelector("button");
    // The live site closed panel registrations (button disabled, "Registration Closed").
    if (!button || button.disabled) return;
    button.addEventListener("click", function () {
      if (!form.reportValidity()) return;
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.age = parseInt(data.age, 10);
      button.disabled = true;
      Api.registerPanel(data).then(function () { Site.go("/panel-confirmation"); }, function (err) {
        button.disabled = false;
        toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
      });
    });
  }

  function setup(root) {
    setupTeamForm(root);
    setupPanelForm(root);
  }

  views.forEach(function (root) {
    // "Next" under the guidelines scrolls to the form
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      if (btn.getAttribute("aria-label") === "Proceed to registration form") {
        var next = root.querySelector('[data-section="registration-form"]');
        if (next) next.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (!btn.closest('[data-state-region="registration"]') || btn.closest("form")) return;
      var label = btn.textContent.trim();
      var target = label === "Competitions" ? "competition" : label === "Panel Discussion" ? "panel" : null;
      if (!target || States.current(root, "registration") === target) return;
      var region = States.show(root, "registration", target);
      // the title and subtitle re-animate, as they did in React
      var h1 = region.querySelector("h1"), sub = h1 && h1.nextElementSibling;
      if (h1) { Motion.set(h1, { opacity: 0, y: window.IS_MOBILE ? -5 : -20 }); Motion.animate(h1, { opacity: 1, y: 0 }, { duration: 0.5 }); }
      if (sub) { Motion.set(sub, { opacity: 0 }); Motion.animate(sub, { opacity: 1 }, { duration: 0.5, delay: 0.1 }); }
      setup(region);
    });

    if (new URLSearchParams(window.location.search).get("event") === "panel") {
      // swap before the page animates in, so it enters like the React page did
      var region = States.region(root, "registration");
      var tpl = root.querySelector('template[data-state-for="registration"][data-state="panel"]');
      if (region && tpl) region.replaceWith(tpl.content.firstElementChild.cloneNode(true));
    }
    setup(States.region(root, "registration") || root);
  });
})();
