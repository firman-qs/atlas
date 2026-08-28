"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Atom, ShieldCheck, Sparkles, Zap } from "lucide-react";

interface OrbitBadge {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Atom;
  color: string;
  initialX: number;
  initialY: number;
}

export function InteractiveHeroLogo() {
  const t = useTranslations("landing.visuals");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<
    { x: number; y: number; r: number; alpha: number }[]
  >([]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeBadgeId, setActiveBadgeId] = useState<string | null>(null);
  const orbitBadges: OrbitBadge[] = [
    {
      id: "concepts",
      title: t("orbit.concepts.title"),
      subtitle: t("orbit.concepts.subtitle"),
      icon: Atom,
      color:
        "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      initialX: -160,
      initialY: -50,
    },
    {
      id: "taxonomy",
      title: t("orbit.taxonomy.title"),
      subtitle: t("orbit.taxonomy.subtitle"),
      icon: ShieldCheck,
      color:
        "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      initialX: 160,
      initialY: -50,
    },
    {
      id: "evaluation",
      title: t("orbit.evaluation.title"),
      subtitle: t("orbit.evaluation.subtitle"),
      icon: Sparkles,
      color: "text-primary bg-primary/10 border-primary/30",
      initialX: 160,
      initialY: 65,
    },
    {
      id: "assistance",
      title: t("orbit.assistance.title"),
      subtitle: t("orbit.assistance.subtitle"),
      icon: Zap,
      color:
        "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
      initialX: -160,
      initialY: 65,
    },
  ];

  // Dynamic 3D tilt
  const tiltX = isHovered ? (mousePos.y / 150) * -12 : 0;
  const tiltY = isHovered ? (mousePos.x / 150) * 12 : 0;

  // Fluid contour canvas background inside hero centerpiece
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = 440);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    };

    window.addEventListener("resize", handleResize);

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw subtle fluid equipotential wave contours around the logo
      const isDark = document.documentElement.classList.contains("dark");
      const baseAlpha = isDark ? 0.25 : 0.2;

      for (let i = 1; i <= 4; i++) {
        const radius = 70 + i * 32 + Math.sin(time * 0.002 + i * 0.8) * 6;
        const waveDistort = isHovered ? Math.sin(time * 0.003 + i) * 8 : 0;

        ctx.beginPath();
        ctx.ellipse(
          cx + mousePos.x * 0.06,
          cy + mousePos.y * 0.06,
          radius + waveDistort,
          (radius + waveDistort) * 0.85,
          0,
          0,
          Math.PI * 2,
        );

        ctx.strokeStyle = isDark
          ? `rgba(96, 165, 250, ${(baseAlpha / i).toFixed(3)})`
          : `rgba(37, 99, 235, ${(baseAlpha / i).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Render ripples
      for (let k = ripplesRef.current.length - 1; k >= 0; k--) {
        const rp = ripplesRef.current[k];
        rp.r += 4;
        rp.alpha *= 0.94;

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? `rgba(147, 197, 253, ${rp.alpha.toFixed(3)})`
          : `rgba(59, 130, 246, ${rp.alpha.toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (rp.alpha < 0.02) {
          ripplesRef.current.splice(k, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isHovered, mousePos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    setMousePos({ x, y });
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    ripplesRef.current.push({ x: clickX, y: clickY, r: 15, alpha: 0.8 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      className="relative mx-auto flex h-72 w-full max-w-2xl select-none items-center justify-center sm:h-80"
    >
      {/* Background Fluid Wave Contour Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
      />

      {/* Central Fluid Interactive Logo Container */}
      <div
        onClick={handleLogoClick}
        style={{
          transform: `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(${isHovered ? "1.06" : "1"}, ${isHovered ? "1.06" : "1"}, 1)`,
          transition: "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
        }}
        className="group relative z-20 flex cursor-pointer items-center justify-center p-3"
      >
        {/* Luminous Core Halo */}
        <div
          className={`absolute -inset-4 -z-10 rounded-full bg-gradient-to-tr from-blue-500/30 via-primary/20 to-cyan-400/20 blur-2xl transition-opacity duration-500 ${
            isHovered ? "opacity-100 scale-125" : "opacity-60 scale-100"
          }`}
        />

        {/* Outer Organic Fluid Glow Ring */}
        <div
          className={`absolute size-40 rounded-full border border-primary/25 transition-all duration-700 ${
            isHovered ? "scale-110 border-primary/50" : "scale-100"
          }`}
        />

        {/* Real Authentic ATLAS Logo Image with Subtle Drop Shadow */}
        <div className="relative size-28 overflow-hidden transition-transform duration-300 group-hover:scale-105 sm:size-32">
          <Image
            src="/logo.png"
            alt={t("logoAlt")}
            width={128}
            height={128}
            priority
            className="size-full object-contain drop-shadow-[0_8px_20px_rgba(37,99,235,0.25)]"
          />
        </div>

        {/* Dynamic Hover Ring Pill */}
        <div
          className={`pointer-events-none absolute -bottom-6 rounded-full border bg-background/90 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-xs backdrop-blur-md transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          <span>{t("pulseHint")}</span>
        </div>
      </div>

      {/* Orbiting Conceptual Satellites with Fluid Hover Displacement */}
      {orbitBadges.map((badge) => {
        const Icon = badge.icon;
        const isBadgeActive = activeBadgeId === badge.id;

        // Interactive organic offset reacting to cursor position
        const offsetX = badge.initialX + (isHovered ? mousePos.x * 0.08 : 0);
        const offsetY = badge.initialY + (isHovered ? mousePos.y * 0.08 : 0);

        return (
          <div
            key={badge.id}
            onMouseEnter={() => setActiveBadgeId(badge.id)}
            onMouseLeave={() => setActiveBadgeId(null)}
            style={{
              transform: `translate(${offsetX}px, ${offsetY}px)`,
              transition:
                "transform 0.4s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s",
            }}
            className={`absolute z-10 hidden sm:flex cursor-pointer items-center gap-2.5 rounded-xl border bg-card/85 p-2.5 shadow-xs backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-primary/40 hover:bg-card ${
              isBadgeActive
                ? "ring-1 ring-primary/40 border-primary/50 shadow-md scale-105"
                : ""
            }`}
          >
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${badge.color}`}
            >
              <Icon className="size-4" />
            </div>

            <div className="text-left pr-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {badge.title}
              </p>
              <p className="text-xs font-semibold text-foreground">
                {badge.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
