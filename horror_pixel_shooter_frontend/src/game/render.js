const COLORS = {
  player: '#9ca3af',
  playerEye: '#f59e42',
  animatronic: '#7f1d1d',
  animEye: '#ef4444',
  boss: '#7f1d1d',
  bossEye: '#f87171',
};

/** Create simple pixel sprites as 2D arrays or draw functions */
export function makeSprites() {
  return {
    player: { w: 10, h: 10, color: COLORS.player, eye: COLORS.playerEye },
    animatronic: { w: 10, h: 10, color: COLORS.animatronic, eye: COLORS.animEye },
    boss: { w: 24, h: 24, color: COLORS.boss, eye: COLORS.bossEye },
  };
}

export function drawSprite(ctx, sprite, x, y) {
  const { w, h, color, eye } = sprite;
  const ox = Math.round(x - w / 2);
  const oy = Math.round(y - h / 2);
  ctx.fillStyle = color;
  ctx.fillRect(ox, oy, w, h);
  // eyes as two pixels
  ctx.fillStyle = eye;
  ctx.fillRect(ox + Math.floor(w * 0.25), oy + Math.floor(h * 0.35), 2, 2);
  ctx.fillRect(ox + Math.floor(w * 0.65), oy + Math.floor(h * 0.35), 2, 2);
}

/** Minimal pixel text rendering using canvas fillRect grid */
export function drawTextPixel(ctx, text, x, y, color = '#fff', scale = 1) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${8 * scale}px monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.imageSmoothingEnabled = false;
  ctx.fillText(text, x, y);
  ctx.restore();
}
