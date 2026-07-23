'use client';
import React, { useRef, useEffect } from 'react';
import { IconArrowRight } from "./icons";

const CTABannerCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const gridSize = 40;
    const activeSquares: { [key: string]: number } = {};

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      // Draw grid lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Randomly light up blocks and fade them out over time
      if (Math.random() < 0.1) {
        const col = Math.floor(Math.random() * (width / gridSize));
        const row = Math.floor(Math.random() * (height / gridSize));
        const key = `${col}-${row}`;
        activeSquares[key] = 1.0; // max opacity
      }

      for (const key in activeSquares) {
        const [col, row] = key.split('-').map(Number);
        const opacity = activeSquares[key];
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.08})`;
        ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
        activeSquares[key] -= 0.01; // fade out
        if (activeSquares[key] <= 0) {
          delete activeSquares[key];
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export function CtaBanner() {
  return (
    <section className="py-24 md:py-32 bg-surface-invert text-text-invert relative overflow-hidden">
      {/* Background Texture 1 */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{ backgroundImage: 'url(https://conversion.ai/images/textures/1.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      {/* Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-75 mix-blend-overlay"
        style={{ backgroundImage: 'url(https://conversion.ai/images/textures/grain.avif)' }}
      />
      
      {/* Dynamic Grid Canvas Overlay */}
      <CTABannerCanvas />
      
      <div className="mx-auto max-w-4xl px-6 relative z-10 text-center">
        <h2 className="text-lg md:text-5xl font-sans font-normal tracking-tight mb-8">
          See where giving grows.
        </h2>
        <a
          href="/report"
          className="inline-flex items-center justify-center font-normal font-sans rounded transition-all duration-300 bg-text text-text-invert border border-white/20 hover:brightness-125 px-5 py-2 text-xs tracking-wide group"
        >
          See a sample report <IconArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}
