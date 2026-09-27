/*
 * Mobile panel discussion form, /pages/panel-registration-form.html
 * (was components/mobile/MobilePanelRegistrationForm.tsx).
 * As on the live site the button reads "Registration Closed" and is disabled.
 * If it is re-enabled, this sends the form to the panel Google Sheet.
 */
(function () {
  var form = document.querySelector(".view-mobile form");
  if (!form) return;
  var button = form.querySelector("button");
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
})();
