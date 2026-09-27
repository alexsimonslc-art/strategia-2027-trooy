/*
 * Pop-up notifications (was components/ui/toaster.tsx + hooks/use-toast.ts).
 * Usage:  toast({ title: "Message Sent!", description: "..." })
 *         toast({ title: "Failed", description: "...", variant: "destructive" })
 * Shows one toast at a time and closes it after 5 seconds.
 */
(function () {
  var host = document.querySelector('[data-component="toaster"]');
  var viewport = document.createElement("ol");
  viewport.className =
    "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]";
  viewport.setAttribute("tabindex", "-1");
  if (host) host.replaceWith(viewport);
  else document.body.appendChild(viewport);

  var BASE =
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all " +
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full " +
    "data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full";
  var VARIANTS = {
    default: "border bg-background text-foreground",
    destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
  };
  var CLOSE_CLASS =
    "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none " +
    "focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 " +
    "group-[.destructive]:focus:ring-offset-red-600";

  var timer = null;

  function dismiss(li) {
    if (!li || !li.parentNode) return;
    li.setAttribute("data-state", "closed");
    setTimeout(function () { li.remove(); }, 150);
  }

  window.toast = function (opts) {
    opts = opts || {};
    viewport.querySelectorAll("li").forEach(dismiss);
    clearTimeout(timer);
    var li = document.createElement("li");
    li.setAttribute("role", "status");
    li.setAttribute("data-state", "open");
    li.className = BASE + " " + (VARIANTS[opts.variant] || VARIANTS.default);
    li.innerHTML =
      '<div class="grid gap-1">' +
      (opts.title ? '<div class="text-sm font-semibold">' + Site.escapeHtml(opts.title) + "</div>" : "") +
      (opts.description ? '<div class="text-sm opacity-90">' + Site.escapeHtml(opts.description) + "</div>" : "") +
      "</div>" +
      '<button type="button" class="' + CLOSE_CLASS + '" toast-close="">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>' +
      "</button>";
    li.querySelector("button").addEventListener("click", function () { dismiss(li); });
    viewport.appendChild(li);
    timer = setTimeout(function () { dismiss(li); }, 5000);
  };
})();
