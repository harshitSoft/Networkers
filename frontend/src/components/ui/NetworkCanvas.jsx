import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function NetworkCanvas({ intensity = 1, interactive = true }) {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    const count = Math.round((mobile ? 40 : window.innerWidth < 1024 ? 80 : 120) * intensity);
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, movedAt: 0 };
    let width = 0, height = 0, raf = 0, visible = true, scrolling = false, scrollTimer;
    let lightMix = themeRef.current === "light" ? 1 : 0;
    let pulses = [];
    const nodes = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .11, vy: (Math.random() - .5) * .11,
      phase: Math.random() * Math.PI * 2, size: 1 + Math.random() * 1.7
    }));

    const resize = () => {
      width = canvas.width = window.innerWidth * devicePixelRatio;
      height = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    const move = (event) => { mouse.targetX = event.clientX; mouse.targetY = event.clientY; mouse.movedAt = performance.now(); };
    const click = (event) => pulses.push({ x: event.clientX, y: event.clientY, born: performance.now() });
    const onScroll = () => { scrolling = true; clearTimeout(scrollTimer); scrollTimer = setTimeout(() => { scrolling = false; }, 120); };
    const onVisibility = () => { visible = !document.hidden; if (visible) draw(performance.now()); };

    function draw(now) {
      if (!visible) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      lightMix += ((themeRef.current === "light" ? 1 : 0) - lightMix) * .045;
      mouse.x += (mouse.targetX - mouse.x) * .085;
      mouse.y += (mouse.targetY - mouse.y) * .085;
      const threshold = mobile ? 92 : 125;
      nodes.forEach((node) => {
        const dx = mouse.x - node.x, dy = mouse.y - node.y, md = Math.hypot(dx, dy);
        if (interactive && !mobile && md < 110) { node.vx += dx / Math.max(md, 1) * .0016; node.vy += dy / Math.max(md, 1) * .0016; }
        if (!reduced && !scrolling) { node.x += node.vx; node.y += node.vy; }
        node.vx = Math.max(-.18, Math.min(.18, node.vx));
        node.vy = Math.max(-.18, Math.min(.18, node.vy));
        if (node.x < -10) node.x = window.innerWidth + 10; if (node.x > window.innerWidth + 10) node.x = -10;
        if (node.y < -10) node.y = window.innerHeight + 10; if (node.y > window.innerHeight + 10) node.y = -10;
      });
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < threshold) {
          const nearMouse = Math.min(Math.hypot(a.x - mouse.x, a.y - mouse.y), Math.hypot(b.x - mouse.x, b.y - mouse.y));
          const hot = interactive && nearMouse < 110;
          const alpha = Math.exp(-distance / 48) * (hot ? .42 : .24) * intensity;
          const darkAlpha = hot ? .36 : Math.max(.08, Math.min(.22, alpha));
          const lightAlpha = hot ? .46 : Math.max(.16, Math.min(.32, alpha * 1.45));
          const lineAlpha = darkAlpha + (lightAlpha - darkAlpha) * lightMix;
          ctx.strokeStyle = `rgba(225,6,0,${lineAlpha})`;
          ctx.lineWidth = hot ? .72 : .48; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      nodes.forEach((node) => {
        const near = Math.hypot(node.x - mouse.x, node.y - mouse.y) < 110;
        const radius = node.size * (1 + Math.sin(now / 900 + node.phase) * .25);
        const dotChannel = Math.round(255 + (10 - 255) * lightMix);
        const dotAlpha = (near ? .78 : .4) + ((near ? .82 : .52) - (near ? .78 : .4)) * lightMix;
        ctx.fillStyle = `rgba(${dotChannel},${dotChannel},${dotChannel},${dotAlpha})`;
        ctx.beginPath(); ctx.arc(node.x, node.y, radius, 0, Math.PI * 2); ctx.fill();
      });
      if (interactive && !mobile && now - mouse.movedAt < 500 && mouse.x > 0) {
        ctx.fillStyle = "rgba(255,30,30,.48)"; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2); ctx.fill();
      }
      pulses = pulses.filter((pulse) => now - pulse.born < 500);
      pulses.forEach((pulse) => {
        const progress = (now - pulse.born) / 500, radius = progress * 300;
        ctx.strokeStyle = `rgba(255,30,30,${.45 * (1 - progress)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2); ctx.stroke();
      });
      raf = requestAnimationFrame(draw);
    }
    resize(); draw(performance.now());
    window.addEventListener("resize", resize); document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("click", click); window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => { cancelAnimationFrame(raf); clearTimeout(scrollTimer); window.removeEventListener("resize", resize); document.removeEventListener("mousemove", move); document.removeEventListener("click", click); window.removeEventListener("scroll", onScroll); document.removeEventListener("visibilitychange", onVisibility); };
  }, [intensity, interactive]);

  return <canvas ref={canvasRef} className="network-canvas" aria-hidden="true" />;
}
