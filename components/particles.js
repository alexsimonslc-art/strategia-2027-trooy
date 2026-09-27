/*
 * WebGL particle field (was components/Particles.tsx). Needs lib/vendor/ogl.min.js.
 *
 *   Particles.mount(containerElement, {
 *     particleColors: ["#ffffff", "#60a5fa"], particleCount: 500, particleSpread: 15,
 *     speed: 0.4, particleBaseSize: 120, moveParticlesOnHover: true, particleHoverFactor: 2,
 *     alphaParticles: true, sizeRandomness: 1.2, cameraDistance: 20, disableRotation: false
 *   });
 *
 * The container is the <div class="particles-container"> inside a section.
 */
(function () {
  var vertex = [
    "attribute vec3 position;",
    "attribute vec4 random;",
    "attribute vec3 color;",
    "uniform mat4 modelMatrix;",
    "uniform mat4 viewMatrix;",
    "uniform mat4 projectionMatrix;",
    "uniform float uTime;",
    "uniform float uSpread;",
    "uniform float uBaseSize;",
    "uniform float uSizeRandomness;",
    "varying vec4 vRandom;",
    "varying vec3 vColor;",
    "void main() {",
    "  vRandom = random;",
    "  vColor = color;",
    "  vec3 pos = position * uSpread;",
    "  pos.z *= 10.0;",
    "  vec4 mPos = modelMatrix * vec4(pos, 1.0);",
    "  float t = uTime;",
    "  mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);",
    "  mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);",
    "  mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);",
    "  vec4 mvPos = viewMatrix * mPos;",
    "  if (uSizeRandomness == 0.0) {",
    "    gl_PointSize = uBaseSize;",
    "  } else {",
    "    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);",
    "  }",
    "  gl_Position = projectionMatrix * mvPos;",
    "}",
  ].join("\n");

  var fragment = [
    "precision highp float;",
    "uniform float uTime;",
    "uniform float uAlphaParticles;",
    "varying vec4 vRandom;",
    "varying vec3 vColor;",
    "void main() {",
    "  vec2 uv = gl_PointCoord.xy;",
    "  float d = length(uv - vec2(0.5));",
    "  if(uAlphaParticles < 0.5) {",
    "    if(d > 0.5) { discard; }",
    "    gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);",
    "  } else {",
    "    float circle = smoothstep(0.5, 0.4, d) * 1.0;",
    "    gl_FragColor = vec4(vColor + 0.3 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);",
    "  }",
    "}",
  ].join("\n");

  function hexToRgb(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var int = parseInt(hex, 16);
    return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
  }

  function mount(container, o) {
    if (!container || !window.OGL) return;
    o = Object.assign({
      particleCount: 200, particleSpread: 10, speed: 0.1, particleColors: ["#ffffff", "#ffffff", "#ffffff"],
      moveParticlesOnHover: false, particleHoverFactor: 1, alphaParticles: false, particleBaseSize: 100,
      sizeRandomness: 1, cameraDistance: 20, disableRotation: false,
    }, o || {});
    container.querySelectorAll("canvas").forEach(function (c) { c.remove(); });
    var section = container.parentElement;

    // Hover follow only while the section sits in the middle of the screen
    var hoverActive = false;
    var sectionVisible = false;
    var mouse = { x: 0, y: 0 };
    function checkVisible() {
      var r = section.getBoundingClientRect();
      var vh = window.innerHeight;
      var visible = r.top < vh * 0.8 && r.bottom > vh * 0.2;
      if (sectionVisible !== visible) {
        sectionVisible = visible;
        if (!visible) hoverActive = false;
      }
    }
    window.addEventListener("scroll", checkVisible, { passive: true });
    document.addEventListener("mousemove", function (e) {
      checkVisible();
      var r = section.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom && sectionVisible) hoverActive = true;
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    });
    checkVisible();

    var renderer = new OGL.Renderer({ depth: false, alpha: true });
    var gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);
    var camera = new OGL.Camera(gl, { fov: 15 });
    camera.position.set(0, 0, o.cameraDistance);

    function resize() {
      var w = container.clientWidth, h = container.clientHeight;
      if (w > 0 && h > 0) {
        renderer.setSize(w, h);
        camera.perspective({ aspect: w / h });
      }
    }
    resize();
    window.addEventListener("resize", resize, false);
    window.addEventListener("layoutchange", resize);

    var count = o.particleCount;
    var positions = new Float32Array(count * 3);
    var randoms = new Float32Array(count * 4);
    var colors = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var x, y, z, len;
      do {
        x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      var r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      colors.set(hexToRgb(o.particleColors[Math.floor(Math.random() * o.particleColors.length)]), i * 3);
    }

    var geometry = new OGL.Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });
    var program = new OGL.Program(gl, {
      vertex: vertex,
      fragment: fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: o.particleSpread },
        uBaseSize: { value: o.particleBaseSize },
        uSizeRandomness: { value: o.sizeRandomness },
        uAlphaParticles: { value: o.alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });
    var particles = new OGL.Mesh(gl, { mode: gl.POINTS, geometry: geometry, program: program });

    var last = performance.now(), elapsed = 0;
    var target = { x: 0, y: 0 }, pos = { x: 0, y: 0 };
    function update(t) {
      requestAnimationFrame(update);
      if (!container.offsetParent) { last = t; return; } // hidden layout: skip drawing
      var delta = t - last;
      last = t;
      elapsed += delta * o.speed;
      program.uniforms.uTime.value = elapsed * 0.001;
      if (o.moveParticlesOnHover && hoverActive) {
        target.x = -mouse.x * o.particleHoverFactor;
        target.y = -mouse.y * o.particleHoverFactor;
      } else {
        target.x = 0;
        target.y = 0;
      }
      pos.x += (target.x - pos.x) * 0.08;
      pos.y += (target.y - pos.y) * 0.08;
      particles.position.x = pos.x;
      particles.position.y = pos.y;
      if (!o.disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * o.speed;
      }
      renderer.render({ scene: particles, camera: camera });
    }
    requestAnimationFrame(update);
  }

  window.Particles = { mount: mount };
})();
