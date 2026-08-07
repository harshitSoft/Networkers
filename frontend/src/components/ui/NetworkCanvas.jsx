import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function NetworkCanvas({ intensity = 1 }) {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let nodes = [];
    let raf = 0;
    let running = false;
    let lightMix = themeRef.current === "light" ? 1 : 0;

    const desiredCount = () => Math.round((window.innerWidth < 768 ? 48 : window.innerWidth < 1024 ? 84 : 125) * intensity);
    const makeNode = () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
      phase: Math.random() * Math.PI * 2, size: 1 + Math.random() * 1.7,
    });
    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * ratio; canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`; canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = desiredCount();
      while (nodes.length < count) nodes.push(makeNode());
      if (nodes.length > count) nodes = nodes.slice(0, count);
    }
    function draw(now) {
      if (!running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      lightMix += ((themeRef.current === "light" ? 1 : 0) - lightMix) * 0.045;
      const speed = reduced ? 0.45 : 1;
      nodes.forEach((node) => {
        node.x += node.vx * speed; node.y += node.vy * speed;
        if (node.x < -10) node.x = window.innerWidth + 10;
        if (node.x > window.innerWidth + 10) node.x = -10;
        if (node.y < -10) node.y = window.innerHeight + 10;
        if (node.y > window.innerHeight + 10) node.y = -10;
      });
      const threshold = window.innerWidth < 768 ? 100 : 130;
      ctx.setLineDash(lightMix > 0.5 ? [] : [2.5, 5.5]);
      ctx.lineDashOffset = lightMix > 0.5 ? 0 : -(now / 70);
      if (lightMix < 0.5) for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance >= threshold) continue;
        const strength = (1 - distance / threshold) * intensity;
        const alpha = (0.1 + strength * 0.24) * (1 + lightMix * 0.75);
        ctx.strokeStyle = `rgba(225,6,0,${alpha})`; ctx.lineWidth = 0.55 + strength * (0.35 + lightMix * 0.45);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.setLineDash([]);
      nodes.forEach((node) => {
        const radius = node.size * (1 + Math.sin(now / 850 + node.phase) * 0.25);
        const darkColor = `rgba(255,255,255,${0.42 * (1 - lightMix)})`;
        const lightColor = `rgba(225,6,0,${0.58 * lightMix})`;
        if(lightMix>.5){ctx.shadowColor="rgba(225,6,0,.45)";ctx.shadowBlur=12}else ctx.shadowBlur=0;
        ctx.fillStyle = lightMix < 0.02 ? darkColor : lightColor;
        ctx.beginPath(); ctx.arc(node.x, node.y, radius, 0, Math.PI * 2); ctx.fill();
      });
      ctx.shadowBlur=0;
      raf = requestAnimationFrame(draw);
    }
    function start() {
      cancelAnimationFrame(raf);
      running = true;
      raf = requestAnimationFrame(draw);
    }
    function handleVisibility() {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else start();
    }
    resize(); start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      running = false; cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intensity]);

  return <canvas ref={canvasRef} className="network-canvas" aria-hidden="true"/>;
}
