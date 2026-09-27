/*
 * Form validation (was react-hook-form + zod + components/ui/form.tsx).
 * Shows the same red messages under each field and re-checks as you type
 * after the first submit.
 *
 *   Forms.bind(formElement, {
 *     rules: { email: [Forms.email("Invalid email address")] },
 *     onSubmit: function (values) { return promise; }
 *   });
 */
(function () {
  function required(msg) { return function (v) { return String(v || "").trim() ? null : msg; }; }
  function minLength(n, msg) { return function (v) { return String(v || "").length >= n ? null : msg; }; }
  function email(msg) { return function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "")) ? null : msg; }; }
  function optionalEmail(msg) { return function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) ? null : msg; }; }
  function range(min, max, minMsg, maxMsg) {
    return function (v) {
      var n = parseInt(v, 10);
      if (isNaN(n)) return minMsg;
      if (n < min) return minMsg;
      if (n > max) return maxMsg;
      return null;
    };
  }

  function fieldEl(form, name) { return form.querySelector('[name="' + name + '"]'); }

  // The FormItem wrapper that holds label + control + message
  function itemOf(el) {
    return el.closest(".space-y-2") || el.parentElement;
  }

  function showError(form, name, msg) {
    var el = fieldEl(form, name);
    var holder = el ? itemOf(el) : form.querySelector('[data-field="' + name + '"]');
    if (!holder) return;
    var p = holder.querySelector(":scope > p.text-destructive[data-form-message]");
    var label = holder.querySelector(":scope > label");
    if (msg) {
      if (!p) {
        p = document.createElement("p");
        p.className = "text-sm font-medium text-destructive";
        p.setAttribute("data-form-message", "");
        holder.appendChild(p);
      }
      p.textContent = msg;
      if (label) label.classList.add("text-destructive");
      if (el) el.setAttribute("aria-invalid", "true");
    } else {
      if (p) p.remove();
      if (label) label.classList.remove("text-destructive");
      if (el) el.setAttribute("aria-invalid", "false");
    }
  }

  function values(form, names) {
    var out = {};
    names.forEach(function (n) {
      var el = fieldEl(form, n);
      out[n] = el ? el.value : (form.__values && form.__values[n]) || "";
    });
    return out;
  }

  function validate(form, rules, only) {
    var ok = true;
    var vals = values(form, Object.keys(rules));
    Object.keys(rules).forEach(function (name) {
      if (only && only !== name) return;
      var msg = null;
      for (var i = 0; i < rules[name].length && !msg; i++) msg = rules[name][i](vals[name], vals);
      showError(form, name, msg);
      if (msg) ok = false;
    });
    return ok;
  }

  function bind(form, opts) {
    var rules = opts.rules || {};
    var submitted = false;
    form.setAttribute("novalidate", "");
    form.addEventListener("input", function (e) {
      if (submitted && e.target.name && rules[e.target.name]) validate(form, rules, e.target.name);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitted = true;
      if (!validate(form, rules)) {
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        return;
      }
      var data = values(form, Object.keys(rules));
      if (opts.collect) data = opts.collect(data);
      opts.onSubmit(data, function reset() {
        form.reset();
        submitted = false;
        Object.keys(rules).forEach(function (n) { showError(form, n, null); });
      });
    });
    return { validate: function () { return validate(form, rules); }, showError: function (n, m) { showError(form, n, m); } };
  }

  window.Forms = {
    bind: bind, required: required, minLength: minLength, email: email, optionalEmail: optionalEmail, range: range,
    showError: showError,
  };
})();
