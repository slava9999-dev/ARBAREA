import { useEffect, useRef } from 'react';

/**
 * Тёплая пыль/угольки — canvas 2D слой живого фона.
 *
 * Бюджет производительности: 30 fps, DPR ≤ 1.5, ≤ 110 частиц, пауза когда
 * вкладка скрыта. При prefers-reduced-motion рисуется один статичный кадр
 * (движение отключается, атмосфера остаётся).
 */

const FPS = 30;
const FRAME_MS = 1000 / FPS;
const MAX_DPR = 1.25;
const MAX_PARTICLES = 96;
const MIN_PARTICLES = 40;
const AREA_PER_PARTICLE = 9000;

const AmbientDust = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let particles = [];
    let sprite = null;
    let width = 0;
    let height = 0;
    let rafId = 0;
    let lastFrame = 0;
    let running = false;

    // Мягкая тёплая точка рисуется один раз в оффскрин-канвас: drawImage
    // дешевле, чем radial-gradient на каждую частицу каждый кадр.
    const makeSprite = () => {
      const size = 32;
      const canvasSprite = document.createElement('canvas');
      canvasSprite.width = size;
      canvasSprite.height = size;
      const sctx = canvasSprite.getContext('2d');
      const glow = sctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      );
      glow.addColorStop(0, 'rgba(232, 202, 142, 1)');
      glow.addColorStop(0.45, 'rgba(201, 164, 92, 0.4)');
      glow.addColorStop(1, 'rgba(201, 164, 92, 0)');
      sctx.fillStyle = glow;
      sctx.fillRect(0, 0, size, size);
      return canvasSprite;
    };
    sprite = makeSprite();

    const spawn = (initial) => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + Math.random() * 24,
      r: 1.6 + Math.random() * 2.2,
      vy: -(4 + Math.random() * 11),
      drift: Math.random() * Math.PI * 2,
      driftSpeed: 0.15 + Math.random() * 0.3,
      alpha: 0.1 + Math.random() * 0.2,
    });

    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(sprite, p.x - p.r * 2, p.y - p.r * 2, p.r * 4, p.r * 4);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const step = (dt) => {
      for (const p of particles) {
        p.drift += dt * p.driftSpeed;
        p.x += Math.sin(p.drift) * 0.35;
        p.y += p.vy * dt;
        if (p.y < -24 || p.x < -24 || p.x > width + 24) {
          Object.assign(p, spawn(false));
        }
      }
      paint();
    };

    const tick = (now) => {
      rafId = requestAnimationFrame(tick);
      if (now - lastFrame < FRAME_MS) return;
      const dt = Math.min((now - lastFrame) / 1000, 0.1);
      lastFrame = now;
      step(dt);
    };

    const start = () => {
      if (running || motionQuery.matches || width === 0) return;
      running = true;
      lastFrame = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(
        Math.min(
          MAX_PARTICLES,
          Math.max(MIN_PARTICLES, (width * height) / AREA_PER_PARTICLE),
        ),
      );
      particles = Array.from({ length: count }, () => spawn(true));
      if (motionQuery.matches) {
        stop();
        paint();
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    const onMotionChange = () => {
      if (motionQuery.matches) {
        stop();
        paint();
      } else {
        start();
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener('visibilitychange', onVisibility);
    motionQuery.addEventListener('change', onMotionChange);
    resize();
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full contain-strict"
    />
  );
};

export default AmbientDust;
