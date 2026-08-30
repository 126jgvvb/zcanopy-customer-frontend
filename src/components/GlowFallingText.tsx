"use client";

import { useEffect, useRef } from "react";

export default function GlowFallingText({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    }

    let { w, h } = resize();

    const fontSize = Math.max(22, Math.min(46, w / 22));
    ctx.font = `bold ${fontSize}px 'Arial Black', Impact, sans-serif`;

    const HOLD = 90;
    const START_GAP = 6;

    let letters: {
      char: string;
      x: number;
      targetY: number;
      speed: number;
      startFrame: number;
      y: number;
      held: number;
    }[] = [];

    function build() {
      letters = [];
      ctx!.font = `bold ${fontSize}px 'Arial Black', Impact, sans-serif`;
      const totalWidth = ctx!.measureText(text).width;
      let currentX = (w - totalWidth) / 2;
      const targetY = h / 2;
      for (let i = 0; i < text.length; i++) {
        const charWidth = ctx!.measureText(text[i]).width;
        letters.push({
          char: text[i],
          x: currentX,
          targetY,
          speed: 4 + Math.random() * 3,
          startFrame: i * START_GAP,
          y: -100 - i * 20,
          held: 0,
        });
        currentX += charWidth;
      }
    }
    build();

    let frame = 0;
    let raf = 0;

    function animate() {
      ctx!.clearRect(0, 0, w, h);
      frame++;
      letters.forEach((l) => {
        if (frame < l.startFrame) {
          l.y = -100 - Math.random() * 200;
        } else if (l.y < l.targetY) {
          l.y += l.speed;
        } else {
          l.held++;
          if (l.held > HOLD) {
            l.y = -100 - Math.random() * 120;
            l.held = 0;
          }
        }

        const wave = Math.sin((frame - l.startFrame) * 0.1);
        const glowRadius = wave > 0 ? wave * 25 : 0;
        const scale = 1 + (wave > 0 ? wave * 0.05 : 0);

        ctx!.save();
        ctx!.translate(l.x, l.y);
        ctx!.scale(scale, scale);

        for (let i = 8; i > 0; i--) {
          ctx!.fillStyle = `rgba(160, 130, 0, ${1 - i / 8})`;
          ctx!.fillText(l.char, -i, i);
        }

        ctx!.shadowColor = "rgba(255, 235, 0, 1)";
        ctx!.shadowBlur = glowRadius;
        ctx!.fillStyle = "#FFFF00";
        ctx!.fillText(l.char, 0, 0);
        ctx!.restore();
      });
      raf = requestAnimationFrame(animate);
    }
    animate();

    function onResize() {
      const dims = resize();
      w = dims.w;
      h = dims.h;
      build();
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full"
      aria-label={text}
    />
  );
}
