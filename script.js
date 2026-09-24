/**
 * Faisal Aljaroshah — Minimalist Coming Soon
 * Cosmic Silk Shader with Mobile Gyroscope Gravity Flow
 */

(function () {
  'use strict';

  const EMAIL = 'f.aljaroshah@gmail.com';

  // --- Copy Email Utility ---
  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.style.display = 'block';
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (!toast.classList.contains('show')) {
          toast.style.display = 'none';
        }
      }, 260);
    }, 2400);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(EMAIL).then(() => {
          showToast(`copied: ${EMAIL}`);
        }).catch(() => fallbackCopy());
      } else {
        fallbackCopy();
      }
    });
  }

  function fallbackCopy() {
    const el = document.createElement('textarea');
    el.value = EMAIL;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      showToast(`copied: ${EMAIL}`);
    } catch (e) {
      showToast(EMAIL);
    }
    document.body.removeChild(el);
  }

  // --- WebGL Animated Background ---
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    init2DFallback();
    return;
  }

  // Vertex Shader: Fullscreen Quad
  const vsSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment Shader: Pure Cosmic Silk Fluid with Gravity-Driven Flow & Full-Bleed Glow
  const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_flow;

    // Simplex Noise 2D
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x  = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // 4-octave Fractional Brownian Motion (Exact 1112008)
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(0.87758256, 0.47942554, -0.47942554, 0.87758256);
      for (int i = 0; i < 4; ++i) {
        v += a * snoise(p);
        p = rot * p * 2.02 + vec2(100.0);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      vec2 mouse = (u_mouse - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

      // Smooth mouse interaction wave
      float dMouse = length(st - mouse);
      vec2 mouseShift = normalize(st - mouse + 0.0001) * exp(-dMouse * 3.2) * 0.22;

      vec2 p = st * 1.65 + mouseShift;

      // Double domain-warped fluid vectors with gravity-driven flow direction
      vec2 q = vec2(
        fbm(p + vec2(0.0, 0.0) + u_flow),
        fbm(p + vec2(5.2, 1.3) + u_flow * 0.785)
      );

      vec2 r = vec2(
        fbm(p + 2.8 * q + vec2(1.7, 9.2) + u_flow * 1.25),
        fbm(p + 2.8 * q + vec2(8.3, 2.8) + u_flow)
      );

      // Internal fluid breathing pulsation (Exact 1112008 frequency)
      float f = fbm(p + 3.2 * r + u_time * 0.034);

      // Atmospheric Dark Palette (Exact 1112008)
      vec3 bgObsidian = vec3(0.012, 0.014, 0.020);
      vec3 colMidnight = vec3(0.03, 0.06, 0.16);
      vec3 colViolet   = vec3(0.24, 0.10, 0.48);
      vec3 colCyan     = vec3(0.08, 0.52, 0.72);
      vec3 colGlow     = vec3(0.40, 0.78, 0.98);

      // Organic color transitions
      vec3 color = bgObsidian;
      color = mix(color, colMidnight, clamp(length(q) * 0.9, 0.0, 1.0));
      color = mix(color, colViolet,   clamp(length(r.x) * 0.75, 0.0, 1.0));
      color = mix(color, colCyan,     clamp(pow(f, 2.0) * 1.3, 0.0, 1.0));
      color += colGlow * pow(clamp(f * 1.15, 0.0, 1.0), 3.2) * 0.42;

      // Soft mouse aura
      color += vec3(0.12, 0.35, 0.65) * exp(-dMouse * 2.8) * 0.28;

      // Normalized soft vignette: never crushes color to black on portrait/mobile screens
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float dCenter = length(uv - 0.5) * 1.25;
      float vignette = clamp(1.0 - smoothstep(0.5, 1.5, dCenter), 0.75, 1.0);
      color *= vignette;

      // Film grain dither to eliminate color banding
      float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
      color += (grain - 0.5) * (1.5 / 255.0);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader compile failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

  if (!vs || !fs) {
    init2DFallback();
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Program link failed:', gl.getProgramInfoLog(program));
    init2DFallback();
    return;
  }

  gl.useProgram(program);

  // Full-screen Quad geometry
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0
    ]),
    gl.STATIC_DRAW
  );

  const aPosition = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');
  const uFlow = gl.getUniformLocation(program, 'u_flow');

  // Mouse State with Smooth Lerp (Exact 1112008 logic)
  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.5;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = window.innerHeight - e.clientY;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      targetMouseX = e.touches[0].clientX;
      targetMouseY = window.innerHeight - e.touches[0].clientY;
    }
  }, { passive: true });

  // Mobile Gyroscope & Gravity Flow
  let gx = 0;
  let gy = 0;
  let targetGx = 0;
  let targetGy = 0;
  let hasRealGyro = false;
  let permissionRequested = false;

  function handleOrientation(e) {
    if (e.gamma == null || e.beta == null) return;
    hasRealGyro = true;

    // Convert degrees to radians
    const radGamma = (e.gamma * Math.PI) / 180;
    const radBeta = (e.beta * Math.PI) / 180;

    // 2D Earth gravity vector projected onto the phone screen:
    // Tilted right -> gamma > 0 -> targetGx > 0
    // Held upright in hand (~70 deg) -> beta > 0 -> targetGy > 0 (downward gravity on screen)
    targetGx = Math.sin(radGamma);
    targetGy = Math.sin(radBeta);
  }

  function handleMotion(e) {
    const acc = e.accelerationIncludingGravity;
    if (!acc || acc.x == null || acc.y == null) return;
    hasRealGyro = true;
    // On device motion: -x is right tilt, -y is upright gravity
    targetGx = -acc.x / 9.81;
    targetGy = -acc.y / 9.81;
  }

  // Transparently enable motion sensors on user interaction (iOS 13+ requirement)
  function requestMotionAccess() {
    if (permissionRequested) return;
    permissionRequested = true;

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
          }
        })
        .catch(() => {});
    }
  }

  // Invisible user gesture trigger for iOS permission (no UI button needed)
  ['click', 'touchend'].forEach((evt) => {
    window.addEventListener(evt, requestMotionAccess, { once: true, passive: true });
  });

  // Listen immediately for Android, desktop browsers, or pre-granted sessions
  window.addEventListener('deviceorientation', handleOrientation, { passive: true });
  window.addEventListener('deviceorientationabsolute', handleOrientation, { passive: true });
  window.addEventListener('devicemotion', handleMotion, { passive: true });

  // Handle Resize: Guarantees true full-bleed edge-to-edge coverage across notch and home indicator
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Measure rendered element dimensions first (guarantees pixel-perfect full bleed)
    const w = canvas.clientWidth || (window.visualViewport ? window.visualViewport.width : window.innerWidth);
    const h = canvas.clientHeight || (window.visualViewport ? window.visualViewport.height : window.innerHeight);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => {
    setTimeout(resize, 120);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resize);
  }
  resize();

  // Prevent iOS Safari elastic rubber-banding bounce on background touch that reveals black bars
  document.addEventListener('touchmove', (e) => {
    if (e.target === canvas || e.target === document.body || e.target === document.documentElement) {
      e.preventDefault();
    }
  }, { passive: false });

  // Animation Loop: Flow accumulation driven by gravity
  let startTime = performance.now();
  let lastFrameTime = startTime;
  let flowX = 0;
  let flowY = 0;
  let animId = null;
  let isRunning = true;

  function render(now) {
    if (!isRunning) return;

    const dt = Math.min((now - lastFrameTime) * 0.001, 0.05);
    lastFrameTime = now;

    // Smooth mouse inertia (Exact 1112008 logic)
    mouseX += (targetMouseX * (canvas.width / window.innerWidth) - mouseX) * 0.045;
    mouseY += (targetMouseY * (canvas.height / window.innerHeight) - mouseY) * 0.045;

    if (hasRealGyro) {
      // Smoothly interpolate gravity direction
      gx += (targetGx - gx) * 0.1;
      gy += (targetGy - gy) * 0.1;

      // Mobile gravity flow speed
      const mobileFlowSpeed = 0.06;

      // Tilting right (gx > 0) -> liquid flows to the right (flowX decreases)
      // Holding upright (gy > 0) -> liquid flows downward (flowY increases)
      flowX -= gx * mobileFlowSpeed * dt;
      flowY += gy * mobileFlowSpeed * dt;
    } else {
      // Desktop PC: exact natural drift towards bottom-left corner (from commit 1112008)
      const pcFlowSpeed = 0.085;
      flowX += 0.28 * pcFlowSpeed * dt;
      flowY += 0.22 * pcFlowSpeed * dt;
    }

    const elapsedTime = (now - startTime) * 0.001;

    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, elapsedTime);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.uniform2f(uFlow, flowX, flowY);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animId = requestAnimationFrame(render);
  }

  // Energy & Battery Saving: Pause when user leaves tab
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
    } else {
      isRunning = true;
      lastFrameTime = performance.now();
      animId = requestAnimationFrame(render);
    }
  });

  animId = requestAnimationFrame(render);



  // 2D Canvas Fallback in case WebGL is blocked
  function init2DFallback() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function draw2D() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const grad = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.3, 50,
        canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.8
      );
      grad.addColorStop(0, '#10172a');
      grad.addColorStop(0.5, '#070b14');
      grad.addColorStop(1, '#030305');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    draw2D();
    window.addEventListener('resize', draw2D);
  }

})();
