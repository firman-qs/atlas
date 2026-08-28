"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function InteractiveMascot() {
  const t = useTranslations("landing.visuals");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mascotRef = useRef<HTMLDivElement | null>(null);

  // Eye state managed via refs for zero-CPU / 60-120 FPS hardware acceleration
  const eyeState = useRef({
    lookX: 0,
    lookY: 0,
    targetLookX: 0,
    targetLookY: 0,
    blinkProgress: 0, // 0 = fully open, 1 = fully closed
    isBlinking: false,
    isClosing: true,
    nextBlinkTime: 0,
    isHovered: false,
    physX: 0,
    physY: 0,
    physVX: 0,
    physVY: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    const mascot = mascotRef.current;
    if (!container || !mascot) return;

    const leftEyeEl = mascot.querySelector<HTMLElement>("[data-eye='left']");
    const rightEyeEl = mascot.querySelector<HTMLElement>("[data-eye='right']");
    if (!leftEyeEl || !rightEyeEl) return;

    let animId: number;
    const state = eyeState.current;
    state.nextBlinkTime = performance.now() + 2200 + Math.random() * 2000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 480) {
        state.targetLookX = Math.max(
          -8,
          Math.min(8, (dx / (rect.width / 2)) * 8),
        );
        state.targetLookY = Math.max(
          -6,
          Math.min(6, (dy / (rect.height / 2)) * 6),
        );
        state.targetX = dx * 0.14;
        state.targetY = dy * 0.14;
      } else {
        state.targetLookX = 0;
        state.targetLookY = 0;
        state.targetX = 0;
        state.targetY = 0;
      }

      state.isHovered = dist < rect.width * 0.45;
    };

    const handleMouseLeave = () => {
      state.targetLookX = 0;
      state.targetLookY = 0;
      state.targetX = 0;
      state.targetY = 0;
      state.isHovered = false;
    };

    const handleClick = () => {
      state.physVY -= 22;
      state.isBlinking = true;
      state.blinkProgress = 0;
      state.isClosing = true;
    };

    const render = (now: number) => {
      // Smooth look-at tracking
      state.lookX += (state.targetLookX - state.lookX) * 0.12;
      state.lookY += (state.targetLookY - state.lookY) * 0.12;

      // Elastic jelly spring physics
      const stiffness = 0.07;
      const damping = 0.84;
      state.physVX =
        (state.physVX + (state.targetX - state.physX) * stiffness) * damping;
      state.physVY =
        (state.physVY + (state.targetY - state.physY) * stiffness) * damping;
      state.physX += state.physVX;
      state.physY += state.physVY;

      // Natural blinking cycle
      if (!state.isBlinking && now > state.nextBlinkTime) {
        state.isBlinking = true;
        state.blinkProgress = 0;
        state.isClosing = true;
      }

      if (state.isBlinking) {
        const speed = 0.16;
        if (state.isClosing) {
          state.blinkProgress = Math.min(1, state.blinkProgress + speed);
          if (state.blinkProgress >= 1) state.isClosing = false;
        } else {
          state.blinkProgress = Math.max(0, state.blinkProgress - speed);
          if (state.blinkProgress <= 0) {
            state.isBlinking = false;
            state.nextBlinkTime = now + 2400 + Math.random() * 3000;
          }
        }
      }

      // 3D Perspective Tilt & Fluid Squash-Stretch
      const rotX = -state.physY * 0.12;
      const rotY = state.physX * 0.14;
      const rotZ = state.physVX * 0.06;
      const squashX = 1 + state.physVX * 0.003 - state.physVY * 0.002;
      const squashY = 1 + state.physVY * 0.003 - state.physVX * 0.002;
      const hoverScale = state.isHovered ? 1.04 : 1.0;

      mascot.style.transform = `perspective(800px) translate3d(${state.physX.toFixed(1)}px, ${state.physY.toFixed(1)}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${(squashX * hoverScale).toFixed(3)}, ${(squashY * hoverScale).toFixed(3)})`;

      // Animated Glowing Eyes (Look-At Vector + Pure ScaleY Blinking, ZERO Double Eyes)
      const eyeTranslate = `translate3d(${state.lookX.toFixed(1)}px, ${state.lookY.toFixed(1)}px, 0)`;
      const eyeScaleY = Math.max(0.08, 1 - state.blinkProgress * 0.92);

      leftEyeEl.style.transform = `${eyeTranslate} scaleY(${eyeScaleY.toFixed(2)})`;
      rightEyeEl.style.transform = `${eyeTranslate} scaleY(${eyeScaleY.toFixed(2)})`;

      animId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("click", handleClick);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="group relative mx-auto flex h-[380px] w-full max-w-[380px] select-none items-center justify-center cursor-pointer sm:h-[440px] sm:max-w-[440px]"
    >
      {/* Soft Ambient Core Glow Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-14 rounded-full bg-radial from-cyan-400/25 via-blue-500/15 to-transparent blur-3xl opacity-80 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Radiant Electric Cyan Floor Glow Pool */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 h-12 w-3/5 rounded-[100%] bg-cyan-400/55 blur-2xl transition-opacity duration-300 dark:bg-cyan-400/40"
      />

      {/* 3D Mascot Body (Authentic Artwork Body with Zero Baked Eyes) */}
      <div ref={mascotRef} className="relative will-change-transform">
        <div className="relative size-72 sm:size-84 animate-[float_6s_ease-in-out_infinite] will-change-transform">
          {/* Authentic 3D Mascot Character Body (Seamless Skin, Zero Duplicate Eyes) */}
          <Image
            src="/mascot-body.png"
            alt={t("mascotAlt")}
            width={336}
            height={336}
            priority
            className="size-full object-contain drop-shadow-[0_16px_36px_rgba(0,180,255,0.25)]"
          />

          {/* Dynamic Single Pair Glowing Capsule Eyes */}
          {/* Left Eye */}
          <div
            data-eye="left"
            className="pointer-events-none absolute will-change-transform"
            style={{
              top: "32.5%",
              left: "41.8%",
              width: "4.4%",
              height: "6.6%",
              borderRadius: "9999px",
              background: "#ffffff",
              boxShadow:
                "0 0 14px 4px rgba(0,229,255,0.75), 0 0 4px 1px rgba(255,255,255,0.9)",
            }}
          />

          {/* Right Eye */}
          <div
            data-eye="right"
            className="pointer-events-none absolute will-change-transform"
            style={{
              top: "32.5%",
              left: "54.2%",
              width: "4.4%",
              height: "6.6%",
              borderRadius: "9999px",
              background: "#ffffff",
              boxShadow:
                "0 0 14px 4px rgba(0,229,255,0.75), 0 0 4px 1px rgba(255,255,255,0.9)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
