"use client";

import { useEffect, useRef } from "react";

interface Charge {
  x: number;
  y: number;
  q: number;
  vx: number;
  vy: number;
}

interface StreamParticle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  speed: number;
  history: { x: number; y: number }[];
}

export function LandingFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Mouse interactive charge
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
      charge: 2.2,
    };

    // Soft virtual background field poles
    const charges: Charge[] = [
      { x: 0.2, y: 0.3, q: 1.8, vx: 0.00015, vy: 0.0001 },
      { x: 0.8, y: 0.35, q: -1.9, vx: -0.00012, vy: 0.00015 },
      { x: 0.5, y: 0.75, q: 1.6, vx: 0.0001, vy: -0.00012 },
    ];

    const numParticles = 45;
    const particles: StreamParticle[] = [];

    const initParticle = (p?: StreamParticle): StreamParticle => {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const maxAge = 140 + Math.random() * 160;
      const speed = 0.8 + Math.random() * 0.9;
      if (p) {
        p.x = px;
        p.y = py;
        p.age = 0;
        p.maxAge = maxAge;
        p.speed = speed;
        p.history = [{ x: px, y: py }];
        return p;
      }
      return {
        x: px,
        y: py,
        age: Math.random() * maxAge,
        maxAge,
        speed,
        history: [{ x: px, y: py }],
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        particles.push(initParticle());
      }
    };

    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const getField = (x: number, y: number) => {
      let ex = 0;
      let ey = 0;

      for (const ch of charges) {
        const cx = ch.x * width;
        const cy = ch.y * height;
        const dx = x - cx;
        const dy = y - cy;
        const distSq = dx * dx + dy * dy + 3200;
        const dist = Math.sqrt(distSq);
        const force = (ch.q * 16000) / distSq;
        ex += (dx / dist) * force;
        ey += (dy / dist) * force;
      }

      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const distSq = dx * dx + dy * dy + 4000;
        const dist = Math.sqrt(distSq);
        const force = (mouse.charge * 24000) / distSq;
        ex += (dx / dist) * force;
        ey += (dy / dist) * force;
      }

      const mag = Math.sqrt(ex * ex + ey * ey);
      if (mag === 0) return { nx: 1, ny: 0, mag: 0 };
      return { nx: ex / mag, ny: ey / mag, mag };
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      if (!prefersReducedMotion) {
        for (const ch of charges) {
          ch.x += ch.vx * (dt * 60);
          ch.y += ch.vy * (dt * 60);
          if (ch.x < 0.1 || ch.x > 0.9) ch.vx *= -1;
          if (ch.y < 0.1 || ch.y > 0.9) ch.vy *= -1;
        }
      }

      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      const vectorColor = isDark ? "147, 197, 253" : "37, 99, 235";
      const particleColor = isDark ? "191, 219, 254" : "59, 130, 246";

      // 1. Draw very soft, restrained field lines / vector needles
      const gridStep = 76;
      const numCols = Math.ceil(width / gridStep);
      const numRows = Math.ceil(height / gridStep);

      for (let i = 0; i <= numCols; i++) {
        for (let j = 0; j <= numRows; j++) {
          const gx = i * gridStep;
          const gy = j * gridStep;
          const { nx, ny, mag } = getField(gx, gy);

          const needleLen = 10;
          // Soft and non-distracting
          const alpha = isDark
            ? Math.min(0.04 + mag * 0.05, 0.18)
            : Math.min(0.04 + mag * 0.06, 0.16);

          ctx.strokeStyle = `rgba(${vectorColor}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx - nx * needleLen * 0.5, gy - ny * needleLen * 0.5);
          ctx.lineTo(gx + nx * needleLen * 0.5, gy + ny * needleLen * 0.5);
          ctx.stroke();
        }
      }

      // 2. Animate gentle, soft flowing particles
      if (!prefersReducedMotion) {
        for (let k = 0; k < particles.length; k++) {
          const p = particles[k];
          p.age += 1;

          if (p.age >= p.maxAge || p.x < -40 || p.x > width + 40 || p.y < -40 || p.y > height + 40) {
            initParticle(p);
            continue;
          }

          const { nx, ny, mag } = getField(p.x, p.y);
          const currentSpeed = p.speed * Math.max(0.8, Math.min(mag * 0.6 + 1.0, 2.5));

          p.x += nx * currentSpeed;
          p.y += ny * currentSpeed;

          p.history.push({ x: p.x, y: p.y });
          if (p.history.length > 10) {
            p.history.shift();
          }

          if (p.history.length > 1) {
            const lifeProgress = p.age / p.maxAge;
            const fade = Math.sin(lifeProgress * Math.PI);
            const particleAlpha = isDark ? fade * 0.28 : fade * 0.22;

            ctx.strokeStyle = `rgba(${particleColor}, ${particleAlpha.toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p.history[0].x, p.history[0].y);
            for (let h = 1; h < p.history.length; h++) {
              ctx.lineTo(p.history[h].x, p.history[h].y);
            }
            ctx.stroke();

            // Soft glowing dot
            ctx.fillStyle = `rgba(${vectorColor}, ${(particleAlpha * 1.3).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 3. Very subtle soft cursor glow
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        const rad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          260
        );
        rad.addColorStop(0, `rgba(${vectorColor}, ${isDark ? 0.08 : 0.04})`);
        rad.addColorStop(0.6, `rgba(${particleColor}, ${isDark ? 0.02 : 0.01})`);
        rad.addColorStop(1, "transparent");

        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 260, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      render(0);
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="size-full block" />
    </div>
  );
}
