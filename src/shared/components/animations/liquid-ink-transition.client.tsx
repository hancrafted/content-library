'use client';

import { InkFilterDefinition, type TransitionStyle } from '@/shared/components/animations/transition-filters';
import { INK_PROFILES, inkScale } from '@/shared/lib/ink-transition.pure';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { InkCanvas } from './ink-canvas';

interface StyleConfig {
  bleed: number;
  ease: (p: number) => number;
}

const STYLE_CONFIGS = Object.fromEntries(
  Object.entries(INK_PROFILES).map(([name, profile]) => [
    name,
    { bleed: profile.bleed, ease: (p: number) => inkScale(name as TransitionStyle, p) },
  ]),
) as Record<TransitionStyle, StyleConfig>;

function resolveStyle(variant?: TransitionStyle): TransitionStyle {
  if (variant && variant in STYLE_CONFIGS) return variant;
  const configured = process.env.NEXT_PUBLIC_TRANSITION_STYLE as TransitionStyle | undefined;
  if (configured && configured in STYLE_CONFIGS) return configured;
  return 'liquid';
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface AnimationOptions {
  scopeRef: React.RefObject<HTMLDivElement | null>;
  inkScaleRef: React.RefObject<HTMLDivElement | null>;
  targetId: string;
  styleConfig: StyleConfig;
}

function useLiquidInkAnimation({ scopeRef, inkScaleRef, targetId, styleConfig }: AnimationOptions) {
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const target = inkScaleRef.current;
      const trigger = document.getElementById(targetId);
      if (!target || !trigger || prefersReducedMotion()) return;

      gsap.set(target, { scaleY: 0 });
      gsap.to(target, {
        scaleY: 1,
        ease: styleConfig.ease,
        scrollTrigger: { trigger, start: 'top bottom', end: 'top top', scrub: true },
      });
    },
    { scope: scopeRef, dependencies: [targetId, styleConfig] },
  );
}

interface LiquidInkProps {
  targetId: string;
  color?: string;
  variant?: TransitionStyle;
}

export function LiquidInkTransition({ targetId, color, variant }: LiquidInkProps) {
  const activeColor = color ?? 'var(--foreground)';
  const containerRef = useRef<HTMLDivElement>(null);
  const inkScaleRef = useRef<HTMLDivElement>(null);
  const activeStyle = resolveStyle(variant);
  const styleConfig = STYLE_CONFIGS[activeStyle];

  useLiquidInkAnimation({
    scopeRef: containerRef,
    inkScaleRef,
    targetId,
    styleConfig,
  });

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0 right-0 h-screen z-40 overflow-hidden"
    >
      <InkFilterDefinition style={activeStyle} />
      <InkCanvas inkScaleRef={inkScaleRef} color={activeColor} variant={activeStyle} bleed={styleConfig.bleed} />
    </div>
  );
}
