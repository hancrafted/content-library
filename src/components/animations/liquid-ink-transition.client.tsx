'use client';

import { InkFilterDefinition, type TransitionStyle } from '@/components/animations/transition-filters';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

interface StyleConfig {
  bleed: number;
  ease: (p: number) => number;
}

const STYLE_CONFIGS: Record<TransitionStyle, StyleConfig> = {
  liquid: {
    bleed: 300,
    ease: (p: number) => (p < 0.02 ? (p / 0.02) * 0.18 : 0.18 + ((p - 0.02) / 0.98) * 0.82),
  },
  paper: {
    bleed: 120,
    ease: (p: number) => (p < 0.02 ? (p / 0.02) * 0.1 : 0.1 + ((p - 0.02) / 0.98) * 0.9),
  },
  glitch: {
    bleed: 200,
    ease: (p: number) => (p < 0.02 ? (p / 0.02) * 0.15 : 0.15 + ((p - 0.02) / 0.98) * 0.85),
  },
  goo: {
    bleed: 250,
    ease: (p: number) => (p < 0.02 ? (p / 0.02) * 0.15 : 0.15 + ((p - 0.02) / 0.98) * 0.85),
  },
  dither: {
    bleed: 100,
    ease: (p: number) => (p < 0.02 ? (p / 0.02) * 0.08 : 0.08 + ((p - 0.02) / 0.98) * 0.92),
  },
  wave: {
    bleed: 180,
    ease: (p: number) => (p < 0.02 ? (p / 0.02) * 0.12 : 0.12 + ((p - 0.02) / 0.98) * 0.88),
  },
};

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

interface InkCanvasProps {
  inkScaleRef: React.RefObject<HTMLDivElement | null>;
  color: string;
  style: TransitionStyle;
  bleed: number;
}

function InkCanvas({ inkScaleRef, color, style, bleed }: InkCanvasProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -bleed,
        left: -bleed,
        right: -bleed,
        bottom: -bleed,
        filter: `url(#ink-edge-${style})`,
        willChange: 'transform',
      }}
    >
      <div
        ref={inkScaleRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: color,
          transformOrigin: 'bottom',
          willChange: 'transform',
        }}
      />
    </div>
  );
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
  const resolvedTheme = useResolvedTheme();
  const activeColor = color ?? (resolvedTheme === 'dark' ? '#FAF9F6' : '#0A0E1A');
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
      <InkCanvas inkScaleRef={inkScaleRef} color={activeColor} style={activeStyle} bleed={styleConfig.bleed} />
    </div>
  );
}
