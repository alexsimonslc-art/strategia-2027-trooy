/*
 * STRATEGIA'26 — animation runtime
 * ---------------------------------------------------------------
 * The original site used Framer Motion (React). This file replays the
 * same animations in plain JavaScript. Any element can opt in with a
 * data-motion attribute holding JSON:
 *
 *   data-motion='{"initial":{"opacity":0,"y":20},
 *                 "whileInView":{"opacity":1,"y":0},
 *                 "viewport":{"once":true},
 *                 "transition":{"duration":0.6}}'
 *
 * Supported keys: initial, animate, whileInView, viewport, whileHover,
 * whileTap, transition, follow (animate together with a parent group),
 * and data-scroll for scroll-linked values.
 *
 * Page scripts can also drive elements directly:
 *   Motion.animate(element, { x: -300, opacity: 1 }, { duration: 0.5 })
 */
(function () {
  "use strict";

  // ---------- easing ----------------------------------------------------
  function cubicBezier(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; }
    function b(p1, p2) { return 3 * p2 - 6 * p1; }
    function c(p1) { return 3 * p1; }
    function calc(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) {
        var s = slope(t, x1, x2);
        if (Math.abs(s) < 1e-6) break;
        t -= (calc(t, x1, x2) - x) / s;
      }
      return calc(t, y1, y2);
    };
  }
  var EASINGS = {
    linear: function (t) { return t; },
    easeIn: cubicBezier(0.42, 0, 1, 1),
    easeOut: cubicBezier(0, 0, 0.58, 1),
    easeInOut: cubicBezier(0.42, 0, 0.58, 1),
    circIn: function (t) { return 1 - Math.sin(Math.acos(t)); },
    circOut: function (t) { return Math.sin(Math.acos(t - 1)); },
    backOut: cubicBezier(0.33, 1.53, 0.69, 0.99),
    backIn: cubicBezier(0.31, 0.01, 0.66, -0.59),
    backInOut: cubicBezier(0.68, -0.55, 0.265, 1.55),
    anticipate: cubicBezier(0.33, 1.53, 0.69, 0.99),
  };
  function easing(e) {
    if (Array.isArray(e) && e.length === 4 && typeof e[0] === "number") return cubicBezier(e[0], e[1], e[2], e[3]);
    return EASINGS[e] || EASINGS.easeInOut;
  }

  // ---------- values ----------------------------------------------------
  var TRANSFORM_ORDER = ["transformPerspective", "x", "y", "z", "translateX", "translateY", "translateZ",
    "scale", "scaleX", "scaleY", "rotate", "rotateX", "rotateY", "rotateZ", "skew", "skewX", "skewY"];
  var TRANSFORM_FN = { x: "translateX", y: "translateY", z: "translateZ", transformPerspective: "perspective" };
  var IS_TRANSFORM = {};
  TRANSFORM_ORDER.forEach(function (k) { IS_TRANSFORM[k] = true; });
  var DEFAULTS = { opacity: 1, scale: 1, scaleX: 1, scaleY: 1 };
  var PX_PROPS = { x: 1, y: 1, z: 1, translateX: 1, translateY: 1, translateZ: 1, width: 1, height: 1, top: 1, left: 1,
    right: 1, bottom: 1, borderRadius: 1, transformPerspective: 1 };

  function defaultOf(key) { return key in DEFAULTS ? DEFAULTS[key] : 0; }
  function unitFor(key) {
    if (key.indexOf("rotate") === 0 || key.indexOf("skew") === 0) return "deg";
    if (PX_PROPS[key]) return "px";
    return "";
  }
  function fmt(key, v) { return typeof v === "number" ? v + unitFor(key) : v; }

  // Complex strings ("0 0 15px rgba(96, 165, 250, 0.3)") interpolate number by number.
  var NUM_RE = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
  function mix(from, to, p) {
    if (typeof from === "number" && typeof to === "number") return from + (to - from) * p;
    var fs = String(from), ts = String(to);
    var fn = fs.match(NUM_RE) || [], tn = ts.match(NUM_RE) || [];
    if (fn.length && fn.length === tn.length && fs.replace(NUM_RE, "#") === ts.replace(NUM_RE, "#")) {
      var i = 0;
      return ts.replace(NUM_RE, function () {
        var a = parseFloat(fn[i]), b = parseFloat(tn[i]); i++;
        var v = a + (b - a) * p;
        return String(Math.round(v * 1000) / 1000);
      });
    }
    return p < 0.5 ? from : to;
  }

  // ---------- per-element state ------------------------------------------
  var states = new WeakMap();
  function stateOf(el) {
    var s = states.get(el);
    if (!s) { s = { values: {}, anims: {} }; states.set(el, s); }
    return s;
  }
  function render(el) {
    var s = stateOf(el), v = s.values, parts = [], hasT = false;
    for (var i = 0; i < TRANSFORM_ORDER.length; i++) {
      var k = TRANSFORM_ORDER[i];
      if (!(k in v)) continue;
      hasT = true;
      var val = v[k];
      if (val === defaultOf(k) || val === String(defaultOf(k))) continue;
      parts.push((TRANSFORM_FN[k] || k) + "(" + fmt(k, val) + ")");
    }
    if (hasT) el.style.transform = parts.length ? parts.join(" ") : "none";
    for (var key in v) {
      if (IS_TRANSFORM[key]) continue;
      el.style[key] = fmt(key, v[key]);
    }
  }
  function current(el, key) {
    var s = stateOf(el);
    if (key in s.values) return s.values[key];
    if (key === "opacity") { var o = parseFloat(getComputedStyle(el).opacity); return isNaN(o) ? 1 : o; }
    if (IS_TRANSFORM[key]) return defaultOf(key);
    var cs = getComputedStyle(el)[key];
    return cs == null || cs === "" ? defaultOf(key) : cs;
  }
  function setValues(el, values) {
    var s = stateOf(el);
    for (var k in values) {
      if (k === "transition" || k === "transitionEnd") continue;
      var v = values[k];
      s.values[k] = Array.isArray(v) ? v[0] : v;
    }
    render(el);
  }

  // ---------- one animated value -----------------------------------------
  var running = [];
  var frameRequested = false;
  function tick(now) {
    frameRequested = false;
    var dirty = new Set();
    for (var i = running.length - 1; i >= 0; i--) {
      var a = running[i];
      if (a.cancelled) { running.splice(i, 1); continue; }
      if (a.start == null) a.start = now;
      var done = a.step(now - a.start);
      dirty.add(a.el);
      if (done) { running.splice(i, 1); if (a.onDone) a.onDone(); }
    }
    dirty.forEach(render);
    if (running.length) requestFrame();
  }
  function requestFrame() {
    if (!frameRequested) { frameRequested = true; requestAnimationFrame(tick); }
  }

  function springFn(from, to, t, opts) {
    var k = opts.stiffness || 100, c = opts.damping == null ? 10 : opts.damping, m = opts.mass || 1;
    var w0 = Math.sqrt(k / m), zeta = c / (2 * Math.sqrt(k * m)), delta = from - to;
    if (zeta < 1) {
      var wd = w0 * Math.sqrt(1 - zeta * zeta);
      return to + Math.exp(-zeta * w0 * t) * (delta * Math.cos(wd * t) + (zeta * w0 * delta / wd) * Math.sin(wd * t));
    }
    return to + (delta + (w0 * delta) * t) * Math.exp(-w0 * t);
  }

  function defaultTransition(key, keyframes) {
    if (keyframes.length > 2) return { duration: 0.8, ease: "easeInOut" };
    if (IS_TRANSFORM[key]) {
      if (key.indexOf("scale") === 0) return { type: "spring", stiffness: 550, damping: keyframes[1] === 0 ? 2 * Math.sqrt(550) : 30 };
      return { type: "spring", stiffness: 500, damping: 25 };
    }
    return { duration: 0.3, ease: [0.25, 0.1, 0.35, 1] };
  }

  function animateValue(el, key, target, tr, onDone) {
    var s = stateOf(el);
    if (s.anims[key]) s.anims[key].cancelled = true;
    var keyframes = Array.isArray(target) ? target.slice() : [current(el, key), target];
    if (keyframes[0] === null || keyframes[0] === undefined) keyframes[0] = current(el, key);
    // "-25%" and 0 animate as numbers in the same unit
    var unitOf = null;
    var parsed = keyframes.map(function (k) {
      if (typeof k === "number") return k;
      var m = /^(-?d*.?d+)([a-z%]+)$/i.exec(String(k).trim());
      if (!m) return null;
      if (unitOf && unitOf !== m[2]) return null;
      unitOf = m[2];
      return parseFloat(m[1]);
    });
    if (unitOf && parsed.every(function (n) { return n !== null; })) keyframes = parsed;
    else unitOf = null;
    function withUnit(v) { return unitOf && typeof v === "number" ? v + unitOf : v; }
    var own = tr && tr[key] && typeof tr[key] === "object" ? Object.assign({}, tr, tr[key]) : tr;
    var t = own && (own.duration != null || own.type || own.ease || own.repeat != null) ? own : Object.assign(defaultTransition(key, keyframes), own || {});
    var delay = ((t.delay || 0) * 1000);
    var repeat = t.repeat === "Infinity" || t.repeat === Infinity ? Infinity : (t.repeat || 0);
    var repeatType = t.repeatType || "loop";
    var repeatDelay = (t.repeatDelay || 0) * 1000;
    var isSpring = t.type === "spring" && keyframes.length === 2 && typeof keyframes[0] === "number" && typeof keyframes[1] === "number" && !t.duration;
    var duration = (t.duration != null ? t.duration : (isSpring ? 0 : 0.3)) * 1000;
    if (t.type === "spring" && t.duration != null) t = Object.assign({}, t, { ease: [0.22, 1.2, 0.36, 1] });
    var times = t.times && t.times.length === keyframes.length ? t.times : keyframes.map(function (_, i) { return i / (keyframes.length - 1); });
    var eases = Array.isArray(t.ease) && typeof t.ease[0] !== "number" ? t.ease.map(easing) : null;
    var ease = eases ? null : easing(t.ease || (t.type === "spring" ? "easeOut" : "easeInOut"));

    function sample(p, kf) {
      if (p <= 0) return kf[0];
      if (p >= 1) return kf[kf.length - 1];
      for (var i = 1; i < times.length; i++) {
        if (p <= times[i]) {
          var seg = (p - times[i - 1]) / (times[i] - times[i - 1] || 1);
          var e = eases ? (eases[i - 1] || eases[0]) : ease;
          return mix(kf[i - 1], kf[i], e(seg));
        }
      }
      return kf[kf.length - 1];
    }

    var anim = { el: el, onDone: onDone, cancelled: false, start: null };
    if (isSpring) {
      var from = keyframes[0], to = keyframes[1];
      anim.step = function (elapsed) {
        var tt = (elapsed - delay) / 1000;
        if (tt < 0) return false;
        var v = springFn(from, to, tt, t);
        var settled = tt > 0.1 && Math.abs(v - to) < 0.01 && Math.abs(springFn(from, to, tt + 0.016, t) - v) < 0.01;
        s.values[key] = withUnit(settled ? to : v);
        return settled || tt > 10;
      };
    } else {
      anim.step = function (elapsed) {
        var tt = elapsed - delay;
        if (tt < 0) return false;
        var cycle = duration + repeatDelay;
        var iter = cycle > 0 ? Math.floor(tt / cycle) : 0;
        if (iter > repeat) { s.values[key] = withUnit(finalValue()); return true; }
        var local = cycle > 0 ? tt - iter * cycle : duration;
        var p = duration > 0 ? Math.min(local / duration, 1) : 1;
        var kf = keyframes;
        if (iter % 2 === 1 && (repeatType === "reverse" || repeatType === "mirror")) {
          if (repeatType === "reverse") p = 1 - p; else kf = keyframes.slice().reverse();
        }
        s.values[key] = withUnit(sample(p, kf));
        return repeat !== Infinity && iter >= repeat && local >= duration;
      };
    }
    function finalValue() {
      var last = repeat % 2 === 1 && repeatType !== "loop" ? keyframes[0] : keyframes[keyframes.length - 1];
      return last;
    }
    s.anims[key] = anim;
    running.push(anim);
    requestFrame();
    return anim;
  }

  function animate(el, target, transition, onDone) {
    if (!el || !target) return;
    var tr = transition || target.transition;
    var keys = Object.keys(target).filter(function (k) { return k !== "transition" && k !== "transitionEnd"; });
    var left = keys.length;
    if (!left && onDone) onDone();
    keys.forEach(function (k) {
      animateValue(el, k, target[k], tr, function () { if (--left === 0 && onDone) onDone(); });
    });
  }

  // ---------- declarative data-motion ------------------------------------
  function parseSpec(el) {
    try { return JSON.parse(el.getAttribute("data-motion")); } catch (e) { return null; }
  }
  function restingValues(spec) {
    var base = {};
    if (spec.initial) Object.assign(base, spec.initial);
    if (spec.animate) for (var k in spec.animate) {
      var v = spec.animate[k];
      if (k !== "transition") base[k] = Array.isArray(v) ? v[v.length - 1] : v;
    }
    return base;
  }
  function withDefaults(target, keys) {
    var out = {};
    keys.forEach(function (k) { out[k] = k in target ? target[k] : defaultOf(k); });
    return out;
  }

  var followers = {};
  function run(el, spec, which) {
    var target = spec[which];
    if (!target) return;
    animate(el, target, target.transition || spec.transition);
  }
  function trigger(el, spec, which) {
    run(el, spec, which);
    var id = el.getAttribute("data-motion-id");
    if (id && followers[id]) followers[id].forEach(function (f) { run(f.el, f.spec, which); });
  }

  function setup(el, settled) {
    if (el.__motion) return;
    var spec = parseSpec(el);
    if (!spec) return;
    el.__motion = spec;

    if (settled) {
      // content swapped in after load (tabs, slides): show it finished, the way
      // React keeps already-mounted elements, but keep any looping animation.
      var done = restingValues({ animate: spec.animate });
      if (spec.whileInView) { Object.assign(done, spec.whileInView); delete done.transition; el.__inView = true; }
      setValues(el, Object.assign({}, spec.initial || {}, done));
      var loops = spec.animate && (spec.animate.transition || spec.transition || {}).repeat;
      if (loops) trigger(el, spec, "animate");
      if (spec.whileInView && !(spec.viewport && spec.viewport.once)) observeInView(el, spec);
    } else if (spec.initial) setValues(el, spec.initial);
    else if (spec.animate) setValues(el, restingValues({ animate: spec.animate }));

    if (settled) {
      // gestures only below
    } else if (spec.follow) {
      (followers[spec.follow] = followers[spec.follow] || []).push({ el: el, spec: spec });
    } else {
      if (spec.animate) trigger(el, spec, "animate");
      if (spec.whileInView) observeInView(el, spec);
    }

    if (spec.whileHover) {
      el.addEventListener("mouseenter", function () { animate(el, spec.whileHover, spec.whileHover.transition || spec.transition); });
      el.addEventListener("mouseleave", function () {
        var base = Object.assign(restingValues(spec), el.__inView && spec.whileInView ? spec.whileInView : {});
        animate(el, withDefaults(base, Object.keys(spec.whileHover).filter(function (k) { return k !== "transition"; })), spec.transition);
      });
    }
    if (spec.whileTap) {
      var release = function () {
        if (!el.__pressed) return;
        el.__pressed = false;
        var base = restingValues(spec);
        if (el.matches(":hover") && spec.whileHover) base = Object.assign(base, spec.whileHover);
        animate(el, withDefaults(base, Object.keys(spec.whileTap).filter(function (k) { return k !== "transition"; })), spec.transition);
      };
      el.addEventListener("pointerdown", function () {
        el.__pressed = true;
        animate(el, spec.whileTap, spec.whileTap.transition || spec.transition);
      });
      window.addEventListener("pointerup", release);
      el.addEventListener("pointercancel", release);
    }
  }

  function observeInView(el, spec) {
    var vp = spec.viewport || {};
    var amount = vp.amount === "all" ? 1 : vp.amount === "some" || vp.amount == null ? 0 : vp.amount;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (el.__inView) return;
          el.__inView = true;
          trigger(el, spec, "whileInView");
          if (vp.once) io.disconnect();
        } else if (el.__inView && !vp.once) {
          el.__inView = false;
          var back = spec.initial || {};
          var keys = Object.keys(spec.whileInView).filter(function (k) { return k !== "transition"; });
          var out = withDefaults(Object.assign(restingValues({ animate: spec.animate }), back), keys);
          animate(el, out, spec.transition);
          var id = el.getAttribute("data-motion-id");
          if (id && followers[id]) followers[id].forEach(function (f) {
            if (!f.spec.whileInView) return;
            var ks = Object.keys(f.spec.whileInView).filter(function (k) { return k !== "transition"; });
            animate(f.el, withDefaults(f.spec.initial || {}, ks), f.spec.transition);
          });
        }
      });
    }, { threshold: amount, rootMargin: vp.margin || "0px" });
    io.observe(el);
  }

  // ---------- scroll-linked values (data-scroll) -------------------------
  var scrollEls = [];
  function edge(v, size) {
    if (v === "start") return 0;
    if (v === "center") return size / 2;
    if (v === "end") return size;
    if (/%$/.test(v)) return (parseFloat(v) / 100) * size;
    if (/px$/.test(v)) return parseFloat(v);
    var n = parseFloat(v);
    return isNaN(n) ? 0 : n * size;
  }
  function progressFor(targetEl, offset) {
    var o = offset || ["start end", "end start"];
    var r = targetEl.getBoundingClientRect();
    var vh = window.innerHeight;
    function pos(pair) {
      var p = pair.split(" ");
      return r.top + edge(p[0], r.height) - edge(p[1] || p[0], vh);
    }
    var a = pos(o[0]), b = pos(o[1]);
    // a and b are where each edge pair sits relative to "now"; progress runs from a hitting 0 to b hitting 0
    if (a === b) return a <= 0 ? 1 : 0;
    var p = a / (a - b);
    return Math.max(0, Math.min(1, p));
  }
  function interp(input, output, x) {
    if (x <= input[0]) return output[0];
    if (x >= input[input.length - 1]) return output[output.length - 1];
    for (var i = 1; i < input.length; i++) {
      if (x <= input[i]) {
        var p = (x - input[i - 1]) / (input[i] - input[i - 1]);
        return mix(output[i - 1], output[i], p);
      }
    }
    return output[output.length - 1];
  }
  function valueOf(def) {
    if (!def) return null;
    if (def.kind === "transform") {
      var src = valueOf(def.src);
      return src == null ? null : interp(def.input, def.output, src);
    }
    if (def.kind === "scroll") {
      var t = def.target ? document.querySelector('[data-scroll-target="' + def.target + '"]') : null;
      if (!t) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        return max > 0 ? window.scrollY / max : 0;
      }
      return progressFor(t, def.offset);
    }
    return null;
  }
  function updateScroll() {
    for (var i = 0; i < scrollEls.length; i++) {
      var item = scrollEls[i];
      if (!item.el.offsetParent && item.el.style.position !== "fixed") continue;
      var s = stateOf(item.el);
      for (var key in item.defs) {
        var v = valueOf(item.defs[key]);
        if (v != null) s.values[key] = v;
      }
      render(item.el);
    }
  }

  // ---------- boot --------------------------------------------------------
  function init(root, options) {
    var settled = !!(options && options.settled);
    (root || document).querySelectorAll("[data-motion]").forEach(function (el) {
      if (el.closest("template")) return;
      setup(el, settled);
    });
    (root || document).querySelectorAll("[data-scroll]").forEach(function (el) {
      if (el.__scroll || el.closest("template")) return;
      try { el.__scroll = JSON.parse(el.getAttribute("data-scroll")); } catch (e) { return; }
      scrollEls.push({ el: el, defs: el.__scroll });
    });
    updateScroll();
  }
  var scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () { scrollQueued = false; updateScroll(); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  window.Motion = {
    animate: animate,
    set: setValues,
    init: init,
    stop: function (el) {
      var s = stateOf(el);
      for (var k in s.anims) s.anims[k].cancelled = true;
    },
    value: current,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); });
  else init();
})();
