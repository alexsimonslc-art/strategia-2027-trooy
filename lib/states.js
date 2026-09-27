/*
 * Swappable regions (day tabs, carousel slides, form steps).
 * A region is marked with data-state-region="name" and each of its states is
 * stored in the same page as <template data-state-for="name" data-state="...">.
 *
 *   States.show(viewRoot, "schedule", "day2")   // swap to a state
 *   States.current(viewRoot, "schedule")        // -> "day2"
 */
(function () {
  function region(root, name) {
    return root.querySelector('[data-state-region="' + name + '"]:not(template)');
  }

  function show(root, name, state) {
    var current = region(root, name);
    var tpl = root.querySelector('template[data-state-for="' + name + '"][data-state="' + state + '"]');
    if (!current || !tpl) return null;
    if (current.getAttribute("data-state") === state) return current;
    var next = tpl.content.firstElementChild.cloneNode(true);
    current.replaceWith(next);
    Motion.init(next, { settled: true });
    next.dispatchEvent(new CustomEvent("statechange", { bubbles: true, detail: { name: name, state: state } }));
    return next;
  }

  function current(root, name) {
    var r = region(root, name);
    return r ? r.getAttribute("data-state") : null;
  }

  window.States = { show: show, current: current, region: region };
})();
