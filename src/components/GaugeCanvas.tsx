import React, { useEffect, useRef } from 'react';

interface GaugeCanvasProps {
  percentage: number;
  isDraining?: boolean;
}

export const GaugeCanvas: React.FC<GaugeCanvasProps> = ({ percentage, isDraining }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      angle: number;
      speed: number;
      alpha: number;
      color: string;
    }> = [];

    // Resize handling
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth * window.devicePixelRatio;
        canvas.height = parent.clientHeight * window.devicePixelRatio;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate ring particles
    const particleCount = 70;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: 0,
        y: 0,
        radius: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        alpha: Math.random() * 0.7 + 0.3,
        color: Math.random() > 0.3 ? '#ff2a55' : '#00f0ff'
      });
    }

    let waveOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) * 0.7;

      // Draw background glow track
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 14 * window.devicePixelRatio;
      ctx.stroke();

      // Arc completion angle based on percentage
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (Math.PI * 2 * (percentage / 100));

      // Draw remaining life ring gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      if (isDraining) {
        gradient.addColorStop(0, '#ff2a55');
        gradient.addColorStop(0.5, '#ffaa00');
        gradient.addColorStop(1, '#ff0055');
      } else {
        gradient.addColorStop(0, '#00f0ff');
        gradient.addColorStop(0.5, '#00ffaa');
        gradient.addColorStop(1, '#ff2a55');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 14 * window.devicePixelRatio;
      ctx.lineCap = 'round';
      ctx.shadowColor = isDraining ? '#ff2a55' : '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Update & render orbiting particles
      particles.forEach((p) => {
        p.angle += p.speed * (isDraining ? 3 : 1);
        const r = radius + (Math.sin(waveOffset + p.angle * 4) * 8);
        p.x = centerX + Math.cos(p.angle) * r;
        p.y = centerY + Math.sin(p.angle) * r;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      waveOffset += 0.03;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [percentage, isDraining]);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} />
      <div className="canvas-overlay-text">
        <div className="percent-display">{percentage.toFixed(4)}%</div>
        <div className="percent-label">Life Remaining (残量)</div>
      </div>
    </div>
  );
};
