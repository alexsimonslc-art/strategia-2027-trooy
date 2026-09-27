/*
 * Dropdown select (was components/ui/select.tsx, Radix Select).
 * Turns every button[role="combobox"] followed by a hidden <select> into the
 * same pop-up list the React site used. The chosen value is written to the
 * hidden <select>, so forms can read it like a normal field.
 */
(function () {
  var CONTENT_CLASS =
    "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md " +
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:translate-y-1";
  var ITEM_CLASS =
    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground";
  var CHECK =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check h-4 w-4"><path d="M20 6 9 17l-5-5"></path></svg>';

  var open = null;

  function close() {
    if (!open) return;
    open.popup.remove();
    open.trigger.setAttribute("aria-expanded", "false");
    open.trigger.setAttribute("data-state", "closed");
    open = null;
  }

  function enhance(trigger) {
    if (trigger.__select) return;
    var native = trigger.nextElementSibling && trigger.nextElementSibling.tagName === "SELECT" ? trigger.nextElementSibling : null;
    if (!native) return;
    trigger.__select = true;
    trigger.type = "button";
    var valueSpan = trigger.querySelector("span");

    function choose(value) {
      native.value = value;
      valueSpan.textContent = value;
      trigger.removeAttribute("data-placeholder");
      native.dispatchEvent(new Event("input", { bubbles: true }));
      native.dispatchEvent(new Event("change", { bubbles: true }));
    }
    trigger.__choose = choose;

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      if (trigger.disabled) return;
      if (open && open.trigger === trigger) { close(); return; }
      close();
      var r = trigger.getBoundingClientRect();
      var popup = document.createElement("div");
      popup.setAttribute("role", "listbox");
      popup.setAttribute("data-state", "open");
      popup.setAttribute("data-side", "bottom");
      popup.className = CONTENT_CLASS;
      popup.style.position = "fixed";
      popup.style.left = r.left + "px";
      popup.style.top = r.bottom + "px";
      popup.style.minWidth = r.width + "px";
      var list = document.createElement("div");
      list.className = "p-1 w-full";
      Array.prototype.forEach.call(native.options, function (opt) {
        if (!opt.value) return;
        var item = document.createElement("div");
        item.setAttribute("role", "option");
        item.tabIndex = -1;
        item.className = ITEM_CLASS;
        item.innerHTML = '<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">' + (native.value === opt.value ? CHECK : "") +
          "</span><span>" + Site.escapeHtml(opt.textContent) + "</span>";
        item.addEventListener("mouseenter", function () { item.focus(); });
        item.addEventListener("click", function () { choose(opt.value); close(); trigger.focus(); });
        list.appendChild(item);
      });
      popup.appendChild(list);
      document.body.appendChild(popup);
      trigger.setAttribute("aria-expanded", "true");
      trigger.setAttribute("data-state", "open");
      open = { trigger: trigger, popup: popup };
    });
  }

  document.addEventListener("click", function (e) {
    if (open && !open.popup.contains(e.target) && !open.trigger.contains(e.target)) close();
  });
  window.addEventListener("scroll", close, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  function init(root) {
    (root || document).querySelectorAll('button[role="combobox"]').forEach(enhance);
  }
  window.SelectMenu = { init: init, close: close };
  init();
})();
