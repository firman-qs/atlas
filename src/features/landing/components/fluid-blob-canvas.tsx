"use client";

import { useEffect, useRef } from "react";

export function FluidBlobCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    if (!gl) return;

    let animId: number;

    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    let clickTime = -10.0;
    let isHovered = 0.0;

    // Vertex shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Raymarching Fragment Shader: 3D ATLAS Mascot with Fluid Splash Sparks, Expressive Eyes & Glow Aura
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_is_dark;
      uniform float u_last_click;
      uniform float u_hover;
      varying vec2 v_uv;

      // 2D Rounded Triangle SDF
      float sdRoundedTriangle(in vec2 p, in float r, in float radius) {
        const float k = sqrt(3.0);
        p.x = abs(p.x) - r;
        p.y = p.y + r / k;
        if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
        p.x -= clamp(p.x, -2.0 * r, 0.0);
        return -length(p) * sign(p.y) - radius;
      }

      // 2D Capsule / Pill distance function for Mascot Eyes
      float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return length(pa - ba * h) - r;
      }

      // 2D Happy Arc / Crescent Eye SDF
      float sdHappyArc(vec2 p, float r, float thickness) {
        p.y += 0.015;
        float dRing = abs(length(p) - r) - thickness;
        // Only keep upper half of circle for happy curved eye (^)
        float dCut = p.y > 0.0 ? 0.0 : -p.y;
        return max(dRing, dCut);
      }

      // Rotation matrix around Y axis
      mat3 rotateY(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat3(
          c, 0, s,
          0, 1, 0,
          -s, 0, c
        );
      }

      // Rotation matrix around X axis
      mat3 rotateX(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat3(
          1, 0, 0,
          0, c, -s,
          0, s, c
        );
      }

      // Smooth Min for liquid blending
      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      // 3D Extruded and Rounded Delta SDF matching ATLAS mascot body
      float map(vec3 p) {
        // Smooth head tilt tracking user's cursor
        mat3 rot = rotateY(u_mouse.x * 0.38 + sin(u_time * 0.25) * 0.04) *
                   rotateX(u_mouse.y * 0.26 + cos(u_time * 0.2) * 0.03);
        vec3 q = rot * p;

        // Subtle fluid displacement
        float fluidDistort = sin(q.x * 3.5 + u_time * 1.0) * cos(q.y * 3.5 + u_time * 0.8) * 0.022;

        // Generously scaled and perfectly centered delta (zero clipping)
        vec2 p2d = q.xy;
        p2d.y += 0.06;
        float d2d = sdRoundedTriangle(p2d, 0.56, 0.24);

        // Extrude in Z with smooth rounded 3D dome
        float thickness = 0.20;
        vec2 w = vec2(d2d, abs(q.z) - thickness);
        float dMascot = min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - 0.15 + fluidDistort;

        // Floating Micro Fluid Droplets / Splash around the mascot
        vec3 d1 = q - vec3(0.68 + sin(u_time * 1.5) * 0.04, 0.32 + cos(u_time * 1.2) * 0.06, 0.1);
        float drop1 = length(d1) - 0.042;

        vec3 d2 = q - vec3(-0.66 + cos(u_time * 1.3) * 0.05, 0.18 + sin(u_time * 1.1) * 0.05, -0.05);
        float drop2 = length(d2) - 0.036;

        vec3 d3 = q - vec3(0.45 + sin(u_time * 1.8 + 1.0) * 0.03, -0.42 + cos(u_time * 1.4) * 0.04, 0.15);
        float drop3 = length(d3) - 0.028;

        float dDrops = min(drop1, min(drop2, drop3));

        return smin(dMascot, dDrops, 0.12);
      }

      // Estimate surface normal
      vec3 calcNormal(vec3 p) {
        float eps = 0.003;
        vec2 h = vec2(eps, 0.0);
        return normalize(vec3(
          map(p + h.xyy) - map(p - h.xyy),
          map(p + h.yxy) - map(p - h.yxy),
          map(p + h.yyx) - map(p - h.yyx)
        ));
      }

      void main() {
        vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        // Camera setup with ample breathing space
        vec3 ro = vec3(0.0, 0.0, 4.4);
        vec3 rd = normalize(vec3(st, -1.8));

        // Raymarching loop
        float t = 0.0;
        float tmax = 8.0;
        float d = 0.0;
        vec3 p = ro;
        bool hit = false;

        for (int i = 0; i < 72; i++) {
          p = ro + rd * t;
          d = map(p);
          if (d < 0.001) {
            hit = true;
            break;
          }
          t += d * 0.75;
          if (t > tmax) break;
        }

        // Ambient fluid aura around mascot
        float distFromCenter = length(st * vec2(1.1, 1.2) - vec2(0.0, -0.05));
        float auraGlow = smoothstep(0.95, 0.0, distFromCenter);

        if (!hit) {
          // Luminous fluid splash aura & floor glow in transparent space
          vec3 auraColor = u_is_dark > 0.5
            ? vec3(0.08, 0.45, 0.95) * auraGlow * 0.22
            : vec3(0.12, 0.55, 0.98) * auraGlow * 0.12;
          
          // Soft ambient particles in background
          float spark = sin(st.x * 25.0 + u_time * 2.0) * cos(st.y * 25.0 - u_time * 1.8);
          float sparkAura = smoothstep(0.85, 1.0, spark) * auraGlow * 0.15;
          auraColor += vec3(0.4, 0.9, 1.0) * sparkAura;

          gl_FragColor = vec4(auraColor, auraGlow * (u_is_dark > 0.5 ? 0.35 : 0.20));
          return;
        }

        // Shading on 3D Mascot Surface
        vec3 n = calcNormal(p);
        vec3 v = -rd;

        // Inverse transform to local model space
        mat3 invRot = rotateX(-(u_mouse.y * 0.26 + cos(u_time * 0.2) * 0.03)) *
                      rotateY(-(u_mouse.x * 0.38 + sin(u_time * 0.25) * 0.04));
        vec3 localP = invRot * p;
        vec2 lp = localP.xy;
        lp.y += 0.06;

        // ----------------------------------------------------
        // 1. 5 SOLO CONTOUR WAVE LAYERS (Deep Mascot Palette)
        // ----------------------------------------------------
        float waveCoord = (lp.x * 0.75 + lp.y * 1.1) + 
                          sin(lp.x * 2.5 + u_time * 0.45) * 0.08 + 
                          cos(lp.y * 2.8 - u_time * 0.35) * 0.06;

        float bands = fract(waveCoord * 2.2);
        float contourLine = smoothstep(0.04, 0.0, abs(bands - 0.5) - 0.42);

        // Deeper Mascot Palette: Midnight Navy -> Cobalt -> Royal Blue -> Azure Sky -> Cyan Base
        vec3 cMidnight = vec3(0.04, 0.08, 0.48);
        vec3 cCobalt = vec3(0.08, 0.22, 0.72);
        vec3 cRoyal = vec3(0.12, 0.42, 0.90);
        vec3 cSky = vec3(0.15, 0.68, 0.98);
        vec3 cCyan = vec3(0.08, 0.85, 0.98);

        float gradPos = clamp((waveCoord + 1.25) * 0.40, 0.0, 1.0);
        vec3 contourColor = mix(cCyan, cSky, smoothstep(0.0, 0.30, gradPos));
        contourColor = mix(contourColor, cRoyal, smoothstep(0.30, 0.55, gradPos));
        contourColor = mix(contourColor, cCobalt, smoothstep(0.55, 0.80, gradPos));
        contourColor = mix(contourColor, cMidnight, smoothstep(0.80, 1.0, gradPos));

        // ----------------------------------------------------
        // 2. EXPRESSIVE MASCOT EYES (Excited Arc / Capsule / Blink)
        // ----------------------------------------------------
        // Periodic Excited Expression (every 6 seconds or when clicking)
        float excitedCycle = fract(u_time * 0.16);
        float isExcitedTime = smoothstep(0.65, 0.75, excitedCycle) * (1.0 - smoothstep(0.85, 0.95, excitedCycle));
        
        float timeSinceClick = u_time - u_last_click;
        float isClickExcited = timeSinceClick < 1.4 ? (1.0 - timeSinceClick / 1.4) : 0.0;
        float isExcited = max(max(isExcitedTime, isClickExcited), u_hover * 0.4);

        // Blink cycle
        float blinkCycle = fract(u_time * 0.22);
        float isBlinking = smoothstep(0.94, 0.97, blinkCycle) * (1.0 - smoothstep(0.97, 1.0, blinkCycle));
        if (timeSinceClick < 0.2) {
          isBlinking = max(isBlinking, 1.0);
        }

        float eyeScaleY = mix(1.0, 0.08, isBlinking);

        // Eye positions looking at cursor
        vec2 eyeLook = clamp(u_mouse * 0.04, vec2(-0.04), vec2(0.04));
        vec2 eyeCenterLeft = vec2(-0.11, 0.22) + eyeLook;
        vec2 eyeCenterRight = vec2(0.11, 0.22) + eyeLook;

        // Normal Pill Eye SDF
        vec2 leftP = lp - eyeCenterLeft;
        leftP.y /= eyeScaleY;
        float dPillLeft = sdCapsule(leftP, vec2(0.0, -0.035), vec2(0.0, 0.035), 0.042);

        vec2 rightP = lp - eyeCenterRight;
        rightP.y /= eyeScaleY;
        float dPillRight = sdCapsule(rightP, vec2(0.0, -0.035), vec2(0.0, 0.035), 0.042);

        // Happy Curved Arch Eye SDF (^)
        float dArcLeft = sdHappyArc(leftP, 0.046, 0.018);
        float dArcRight = sdHappyArc(rightP, 0.046, 0.018);

        // Interpolate between capsule and excited happy arch
        float dLeft = mix(dPillLeft, dArcLeft, isExcited);
        float dRight = mix(dPillRight, dArcRight, isExcited);

        float dEyes = min(dLeft, dRight);
        float eyeMask = smoothstep(0.014, -0.008, dEyes) * step(0.0, localP.z);
        float eyeGlow = smoothstep(0.12, 0.0, dEyes) * step(0.0, localP.z) * 0.85;

        // ----------------------------------------------------
        // 3. FRESNEL & SPECULAR LIGHTING
        // ----------------------------------------------------
        float fresnel = pow(1.0 - max(0.0, dot(n, v)), 3.0);

        vec3 lightKey = normalize(vec3(1.2, 1.8, 2.2));
        vec3 lightFill = normalize(vec3(-1.6, -1.0, 1.0));
        vec3 lightRim = normalize(vec3(0.0, 2.2, -1.8));

        float diffKey = max(0.0, dot(n, lightKey));
        float diffFill = max(0.0, dot(n, lightFill));

        vec3 hKey = normalize(lightKey + v);
        float specKey = pow(max(0.0, dot(n, hKey)), 36.0);

        vec3 hRim = normalize(lightRim + v);
        float specRim = pow(max(0.0, dot(n, hRim)), 22.0);

        vec3 warmGlint = vec3(1.0, 0.92, 0.65);

        contourColor += cCyan * contourLine * 0.18;

        // Composite 3D Shading
        vec3 finalColor = contourColor * (0.42 + diffKey * 0.58 + diffFill * 0.22);
        finalColor += cSky * fresnel * 1.35;
        finalColor += warmGlint * specKey * 1.5;
        finalColor += cRoyal * specRim * 0.95;

        // Glowing Eyes
        vec3 eyeGlowColor = vec3(0.4, 0.85, 1.0);
        vec3 eyeCoreColor = vec3(1.0, 1.0, 1.0);

        finalColor = mix(finalColor, finalColor + eyeGlowColor * 0.9, eyeGlow);
        finalColor = mix(finalColor, eyeCoreColor, eyeMask);

        float alpha = clamp(0.95 + fresnel * 0.05, 0.0, 1.0);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    // Compile shader helper
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uIsDark = gl.getUniformLocation(program, "u_is_dark");
    const uLastClick = gl.getUniformLocation(program, "u_last_click");
    const uHover = gl.getUniformLocation(program, "u_hover");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);

      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const handleClick = () => {
      clickTime = performance.now() * 0.001;
    };

    const handleMouseEnter = () => {
      isHovered = 1.0;
    };

    const handleMouseLeave = () => {
      isHovered = 0.0;
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.001;

      // Smooth, gentle inertia damping
      mouse.x += (mouse.targetX - mouse.x) * 0.035;
      mouse.y += (mouse.targetY - mouse.y) * 0.035;

      const isDark = document.documentElement.classList.contains("dark") ? 1.0 : 0.0;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uIsDark, isDark);
      gl.uniform1f(uLastClick, clickTime);
      gl.uniform1f(uHover, isHovered);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="size-full block pointer-events-auto cursor-pointer"
    />
  );
}
