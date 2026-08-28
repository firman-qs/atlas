"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type AuthMascotExpression =
  | "idle"
  | "looking_email"
  | "shy_password"
  | "peeking_password"
  | "submitting"
  | "error";

export interface AuthMascotProps {
  expression?: AuthMascotExpression;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AuthMascot({
  expression = "idle",
  size = "lg",
  className,
}: AuthMascotProps) {
  const t = useTranslations("landing.visuals");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mascotRef = useRef<HTMLDivElement | null>(null);
  const expressionRef = useRef<AuthMascotExpression>(expression);

  useEffect(() => {
    expressionRef.current = expression;
  }, [expression]);

  const stateRef = useRef({
    lookX: 0,
    lookY: 0,
    targetLookX: 0,
    targetLookY: 0,
    blinkProgress: 0,
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
    wobblePhase: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    const mascot = mascotRef.current;
    if (!container || !mascot) return;

    const leftEyeEl = mascot.querySelector<HTMLElement>("[data-eye='left']");
    const rightEyeEl = mascot.querySelector<HTMLElement>("[data-eye='right']");
    if (!leftEyeEl || !rightEyeEl) return;

    let animId: number;
    const state = stateRef.current;
    state.nextBlinkTime = performance.now() + 2000 + Math.random() * 2000;

    const handleMouseMove = (e: MouseEvent) => {
      // Only do mouse tracking in idle mode
      if (expressionRef.current !== "idle") return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 600) {
        state.targetLookX = Math.max(-8, Math.min(8, (dx / (rect.width / 2)) * 8));
        state.targetLookY = Math.max(-6, Math.min(6, (dy / (rect.height / 2)) * 6));
        state.targetX = dx * 0.12;
        state.targetY = dy * 0.12;
      } else {
        state.targetLookX = 0;
        state.targetLookY = 0;
        state.targetX = 0;
        state.targetY = 0;
      }

      state.isHovered = dist < rect.width * 0.5;
    };

    const handleMouseLeave = () => {
      if (expressionRef.current !== "idle") return;
      state.targetLookX = 0;
      state.targetLookY = 0;
      state.targetX = 0;
      state.targetY = 0;
      state.isHovered = false;
    };

    const handleClick = () => {
      state.physVY -= 24;
      state.isBlinking = true;
      state.blinkProgress = 0;
      state.isClosing = true;
    };

    const render = (now: number) => {
      const currentExpr = expressionRef.current;

      // Adjust targets according to the active expression state
      if (currentExpr === "looking_email") {
        state.targetLookX = 5.5;
        state.targetLookY = 4.5;
        state.targetX = 8;
        state.targetY = 6;
      } else if (currentExpr === "shy_password") {
        state.targetLookX = 0;
        state.targetLookY = -2;
        state.targetX = -4;
        state.targetY = 3;
      } else if (currentExpr === "peeking_password") {
        state.targetLookX = 6.5;
        state.targetLookY = 1.0;
        state.targetX = 10;
        state.targetY = -2;
      } else if (currentExpr === "submitting") {
        state.targetLookX = 0;
        state.targetLookY = 0;
        state.targetX = 0;
        state.targetY = -8;
      } else if (currentExpr === "error") {
        state.targetLookX = -3;
        state.targetLookY = -2;
        state.targetX = -6;
        state.targetY = 4;
      }

      // Smooth look-at tracking
      state.lookX += (state.targetLookX - state.lookX) * 0.14;
      state.lookY += (state.targetLookY - state.lookY) * 0.14;

      // Elastic spring physics
      const stiffness = 0.08;
      const damping = 0.82;
      state.physVX = (state.physVX + (state.targetX - state.physX) * stiffness) * damping;
      state.physVY = (state.physVY + (state.targetY - state.physY) * stiffness) * damping;
      state.physX += state.physVX;
      state.physY += state.physVY;

      // Natural blinking cycle in idle/looking_email
      const allowBlink = currentExpr === "idle" || currentExpr === "looking_email";
      if (allowBlink && !state.isBlinking && now > state.nextBlinkTime) {
        state.isBlinking = true;
        state.blinkProgress = 0;
        state.isClosing = true;
      }

      if (state.isBlinking && allowBlink) {
        const speed = 0.18;
        if (state.isClosing) {
          state.blinkProgress = Math.min(1, state.blinkProgress + speed);
          if (state.blinkProgress >= 1) state.isClosing = false;
        } else {
          state.blinkProgress = Math.max(0, state.blinkProgress - speed);
          if (state.blinkProgress <= 0) {
            state.isBlinking = false;
            state.nextBlinkTime = now + 2500 + Math.random() * 3000;
          }
        }
      }

      // 3D Perspective Tilt & Fluid Squash-Stretch
      const rotX = -state.physY * 0.12;
      const rotY = state.physX * 0.14;
      const rotZ = state.physVX * 0.07;
      const squashX = 1 + state.physVX * 0.003 - state.physVY * 0.002;
      const squashY = 1 + state.physVY * 0.003 - state.physVX * 0.002;
      const hoverScale = state.isHovered ? 1.04 : 1.0;

      mascot.style.transform = `perspective(800px) translate3d(${state.physX.toFixed(1)}px, ${state.physY.toFixed(1)}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${(squashX * hoverScale).toFixed(3)}, ${(squashY * hoverScale).toFixed(3)})`;

      // Eye transformations based on expression
      const eyeTranslate = `translate3d(${state.lookX.toFixed(1)}px, ${state.lookY.toFixed(1)}px, 0)`;

      if (currentExpr === "shy_password") {
        // Cute closed/squinting happy smile eyes (no peeking)
        leftEyeEl.style.transform = `${eyeTranslate} scaleY(0.16) rotate(14deg)`;
        rightEyeEl.style.transform = `${eyeTranslate} scaleY(0.16) rotate(-14deg)`;
        leftEyeEl.style.borderRadius = "9999px";
        rightEyeEl.style.borderRadius = "9999px";
      } else if (currentExpr === "peeking_password") {
        // Playful wide peeking eyes
        leftEyeEl.style.transform = `${eyeTranslate} scale(1.15, 1.15)`;
        rightEyeEl.style.transform = `${eyeTranslate} scale(1.15, 1.15)`;
      } else if (currentExpr === "submitting") {
        // Excited energized eyes
        const pulse = Math.sin(now * 0.01) * 0.15;
        leftEyeEl.style.transform = `${eyeTranslate} scale(${1.2 + pulse}, ${1.2 + pulse})`;
        rightEyeEl.style.transform = `${eyeTranslate} scale(${1.2 + pulse}, ${1.2 + pulse})`;
      } else if (currentExpr === "error") {
        // Surprised/apologetic tilted eyes
        leftEyeEl.style.transform = `${eyeTranslate} scaleY(1.1) rotate(-12deg)`;
        rightEyeEl.style.transform = `${eyeTranslate} scaleY(1.1) rotate(12deg)`;
      } else {
        // Idle or looking_email with natural blink
        const eyeScaleY = Math.max(0.08, 1 - state.blinkProgress * 0.92);
        leftEyeEl.style.transform = `${eyeTranslate} scaleY(${eyeScaleY.toFixed(2)})`;
        rightEyeEl.style.transform = `${eyeTranslate} scaleY(${eyeScaleY.toFixed(2)})`;
      }

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

  const sizeClasses = {
    sm: "h-[130px] max-w-[130px]",
    md: "h-[200px] max-w-[200px]",
    lg: "h-[260px] max-w-[260px] sm:h-[300px] sm:max-w-[300px]",
  };

  const bodyDimensions = {
    sm: { size: "size-32", width: 128, height: 128 },
    md: { size: "size-48", width: 192, height: 192 },
    lg: { size: "size-64 sm:size-72", width: 288, height: 288 },
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative mx-auto flex w-full select-none items-center justify-center cursor-pointer transition-transform duration-300",
        sizeClasses[size],
        className,
      )}
    >
      {/* Soft Ambient Core Glow Aura */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-10 rounded-full bg-radial from-cyan-400/30 via-blue-500/20 to-transparent blur-3xl opacity-85 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105",
          expression === "submitting" && "from-cyan-300/50 via-blue-400/35 scale-110",
          expression === "error" && "from-amber-400/30 via-red-500/20",
        )}
      />

      {/* Radiant Electric Cyan Floor Glow Pool */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute bottom-2 h-10 w-3/5 rounded-[100%] bg-cyan-400/50 blur-2xl transition-all duration-300 dark:bg-cyan-400/40",
          expression === "submitting" && "bg-cyan-300/75 blur-3xl scale-110",
          expression === "error" && "bg-amber-400/40",
        )}
      />

      {/* 3D Mascot Body */}
      <div ref={mascotRef} className="relative will-change-transform">
        <div
          className={cn(
            "relative animate-[float_6s_ease-in-out_infinite] will-change-transform",
            bodyDimensions[size].size,
          )}
        >
          <Image
            src="/mascot-body.png"
            alt={t("mascotAlt")}
            width={bodyDimensions[size].width}
            height={bodyDimensions[size].height}
            priority
            className="size-full object-contain drop-shadow-[0_16px_36px_rgba(0,180,255,0.25)]"
          />

          {/* Dynamic Single Pair Glowing Capsule Eyes */}
          {/* Left Eye */}
          <div
            data-eye="left"
            className="pointer-events-none absolute will-change-transform transition-colors duration-300"
            style={{
              top: "32.5%",
              left: "41.8%",
              width: "4.4%",
              height: "6.6%",
              borderRadius: "9999px",
              background: expression === "error" ? "#fef08a" : "#ffffff",
              boxShadow:
                expression === "submitting"
                  ? "0 0 20px 6px rgba(0,229,255,0.95), 0 0 6px 2px rgba(255,255,255,1)"
                  : expression === "error"
                    ? "0 0 14px 4px rgba(251,191,36,0.8), 0 0 4px 1px rgba(255,255,255,0.9)"
                    : "0 0 14px 4px rgba(0,229,255,0.75), 0 0 4px 1px rgba(255,255,255,0.9)",
            }}
          />

          {/* Right Eye */}
          <div
            data-eye="right"
            className="pointer-events-none absolute will-change-transform transition-colors duration-300"
            style={{
              top: "32.5%",
              left: "54.2%",
              width: "4.4%",
              height: "6.6%",
              borderRadius: "9999px",
              background: expression === "error" ? "#fef08a" : "#ffffff",
              boxShadow:
                expression === "submitting"
                  ? "0 0 20px 6px rgba(0,229,255,0.95), 0 0 6px 2px rgba(255,255,255,1)"
                  : expression === "error"
                    ? "0 0 14px 4px rgba(251,191,36,0.8), 0 0 4px 1px rgba(255,255,255,0.9)"
                    : "0 0 14px 4px rgba(0,229,255,0.75), 0 0 4px 1px rgba(255,255,255,0.9)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
