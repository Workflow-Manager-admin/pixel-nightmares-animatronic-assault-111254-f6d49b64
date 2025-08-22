import { useEffect, useRef, useState } from 'react';

export function useInput() {
  const keys = useRef({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [shooting, setShooting] = useState(false);

  const switchToTaser = !!keys.current['Digit1'];
  const switchToAK = !!keys.current['Digit2'];
  const switchToRPG = !!keys.current['Digit3'];

  useEffect(() => {
    const onDown = (e) => {
      keys.current[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
    };
    const onUp = (e) => {
      keys.current[e.code] = false;
    };
    const onMouseDown = (e) => {
      if (e.button === 0) setShooting(true);
    };
    const onMouseUp = (e) => {
      if (e.button === 0) setShooting(false);
    };
    const onMouseMove = (e) => {
      // translate to canvas coordinate ratio
      const canvas = document.querySelector('.game-stage');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const rx = (e.clientX - rect.left) / rect.width;
      const ry = (e.clientY - rect.top) / rect.height;
      const x = rx * canvas.width;
      const y = ry * canvas.height;
      setMousePos({ x, y });
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  function moveAxis() {
    const x = (keys.current['ArrowRight'] || keys.current['KeyD'] ? 1 : 0)
      - (keys.current['ArrowLeft'] || keys.current['KeyA'] ? 1 : 0);
    const y = (keys.current['ArrowDown'] || keys.current['KeyS'] ? 1 : 0)
      - (keys.current['ArrowUp'] || keys.current['KeyW'] ? 1 : 0);
    return { x, y };
  }

  function aimDir(player, mouse, world) {
    // If no mouse movement, aim to the right
    const dx = (mouse.x || world.width / 2) - player.x;
    const dy = (mouse.y || world.height / 2) - player.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  return {
    shooting,
    moveAxis,
    aimDir,
    mousePos,
    switchToTaser,
    switchToAK,
    switchToRPG,
  };
}
