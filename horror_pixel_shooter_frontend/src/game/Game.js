import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSFX } from '../audio/AudioContext';
import { randRange, clamp, chance } from './utils';
import { useInput } from './useInput';
import { Weapons, weaponMeta } from './weapons';
import { drawSprite, drawTextPixel, makeSprites } from './render';

/**
 * Constants defining world and gameplay.
 */
const WORLD = {
  width: 480,
  height: 270,
  scale: 3, // 1440x810 effective canvas
  bgColor: '#0a0d14',
};
const PLAYER = {
  speed: 1.2,
  size: 10,
  maxHealth: 100,
  invulnTime: 700, // ms
};
const ENEMY = {
  minSpeed: 0.3,
  maxSpeed: 0.7,
  size: 10,
  spawnInterval: 1300,
  damage: 15,
};
const BOSS = {
  size: 24,
  health: 400,
  speed: 0.6,
  damage: 25,
  triggerScore: 20,
};

const JUMPSCARE = {
  chancePerSecond: 0.05,
  duration: 700,
};

/**
 * Game Component: sets up canvas, runs loop, manages entities and collisions.
 * Exposes a full-screen canvas and positions children on top as HUD.
 */
export default function Game({ onGameOver, audioEnabled, children }) {
  const canvasRef = useRef(null);
  const [stats, setStats] = useState({ score: 0, kills: 0, time: 0 });
  const [health, setHealth] = useState(PLAYER.maxHealth);
  const [ammo, setAmmo] = useState({ [Weapons.TASER]: Infinity, [Weapons.AK]: 90, [Weapons.RPG]: 6 });
  const [weapon, setWeapon] = useState(Weapons.TASER);
  const [boss, setBoss] = useState(null);
  const [jumpscareOn, setJumpscareOn] = useState(false);

  const { play, ensureAmbient } = useSFX();

  // Input handling
  const input = useInput();

  // Sprites
  const spriteRef = useRef(makeSprites());

  // Entities
  const playerRef = useRef({ x: WORLD.width / 2, y: WORLD.height / 2, lastHitAt: -9999 });
  const bulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const lastSpawnRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastFrameRef = useRef(0);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    startTimeRef.current = performance.now();
    lastFrameRef.current = startTimeRef.current;
    enemiesRef.current = [];
    bulletsRef.current = [];
    lastSpawnRef.current = 0;
    setStats({ score: 0, kills: 0, time: 0 });
    setHealth(PLAYER.maxHealth);
    setAmmo({ [Weapons.TASER]: Infinity, [Weapons.AK]: 90, [Weapons.RPG]: 6 });
    setWeapon(Weapons.TASER);
    setBoss(null);

    // Ensure ambient loop
    ensureAmbient();

    function spawnEnemy(now) {
      const edge = Math.floor(Math.random() * 4);
      const margin = 12;
      let x = 0, y = 0;
      if (edge === 0) { x = -margin; y = randRange(0, WORLD.height); }
      else if (edge === 1) { x = WORLD.width + margin; y = randRange(0, WORLD.height); }
      else if (edge === 2) { x = randRange(0, WORLD.width); y = -margin; }
      else { x = randRange(0, WORLD.width); y = WORLD.height + margin; }

      enemiesRef.current.push({
        type: 'animatronic',
        x, y,
        speed: randRange(ENEMY.minSpeed, ENEMY.maxSpeed),
        hp: 1,
      });
      lastSpawnRef.current = now;
    }

    function spawnBoss() {
      setBoss({
        x: WORLD.width / 2,
        y: -40,
        hp: BOSS.health,
        cooldown: 0,
      });
      play('boss_roar');
    }

    function shoot(now) {
      const meta = weaponMeta[weapon];
      const canShoot = meta.canShoot(ammoRef.current[weapon], now, bulletsRef.current);
      if (!canShoot) return;

      const dir = input.aimDir(playerRef.current, input.mousePos, WORLD);
      const recoil = meta.recoil || 0;
      const spread = meta.spread || 0;

      const angle = Math.atan2(dir.y, dir.x) + randRange(-spread, spread);
      const vel = { x: Math.cos(angle) * meta.speed, y: Math.sin(angle) * meta.speed };
      bulletsRef.current.push({
        x: playerRef.current.x,
        y: playerRef.current.y,
        vx: vel.x,
        vy: vel.y,
        dmg: meta.damage,
        life: meta.life,
        size: meta.size || 2,
        owner: 'player',
        weapon,
      });
      if (meta.consume > 0 && ammoRef.current[weapon] !== Infinity) {
        ammoRef.current = {
          ...ammoRef.current,
          [weapon]: Math.max(0, ammoRef.current[weapon] - meta.consume),
        };
        setAmmo(ammoRef.current);
      }

      // SFX
      if (weapon === Weapons.TASER) play('taser');
      else if (weapon === Weapons.AK) play('ak');
      else if (weapon === Weapons.RPG) play('rpg');

      // mild recoil - nudge player opposite direction
      if (recoil) {
        playerRef.current.x -= vel.x * recoil;
        playerRef.current.y -= vel.y * recoil;
      }
    }

    // Refs for state used in game loop
    const healthRef = { current: PLAYER.maxHealth };
    const statsRef = { current: { score: 0, kills: 0, time: 0 } };
    let running = true;
    let jumpUntil = 0;

    const ammoRef = { current: { [Weapons.TASER]: Infinity, [Weapons.AK]: 90, [Weapons.RPG]: 6 } };
    setAmmo(ammoRef.current);

    function endGame() {
      running = false;
      cancelAnimationFrame(raf);
      onGameOver({
        ...statsRef.current,
        health: healthRef.current,
        time: Math.round((performance.now() - startTimeRef.current) / 1000),
        bossDefeated: bossRef.current ? bossRef.current.hp <= 0 : false,
      });
    }

    const bossRef = { current: null };

    function update(now) {
      const dt = Math.min(33, now - lastFrameRef.current);
      lastFrameRef.current = now;
      statsRef.current.time = Math.round((now - startTimeRef.current) / 1000);
      setStats({ ...statsRef.current });

      // Random jump scare chance
      if (!jumpscareOn && chance(JUMPSCARE.chancePerSecond * (dt / 1000))) {
        setJumpscareOn(true);
        play('jumpscare');
        jumpUntil = now + JUMPSCARE.duration;
      } else if (jumpscareOn && now > jumpUntil) {
        setJumpscareOn(false);
      }

      // Player movement
      const move = input.moveAxis();
      const speed = PLAYER.speed;
      playerRef.current.x = clamp(playerRef.current.x + move.x * speed, 6, WORLD.width - 6);
      playerRef.current.y = clamp(playerRef.current.y + move.y * speed, 6, WORLD.height - 6);

      // Shooting
      if (input.shooting) shoot(now);

      // Spawn enemies
      if (!bossRef.current && now - lastSpawnRef.current > ENEMY.spawnInterval) {
        spawnEnemy(now);
      }

      // Boss trigger
      if (!bossRef.current && statsRef.current.score >= BOSS.triggerScore) {
        spawnBoss();
        bossRef.current = { current: true }; // marker that boss is active
        setBoss({ x: WORLD.width / 2, y: -40, hp: BOSS.health, cooldown: 0 });
      }

      // Update bullets
      bulletsRef.current = bulletsRef.current.filter((b) => {
        b.x += b.vx;
        b.y += b.vy;
        b.life -= dt;
        return b.life > 0 && b.x > -20 && b.x < WORLD.width + 20 && b.y > -20 && b.y < WORLD.height + 20;
      });

      // Update enemies
      enemiesRef.current = enemiesRef.current.filter((e) => {
        const dx = playerRef.current.x - e.x;
        const dy = playerRef.current.y - e.y;
        const d = Math.hypot(dx, dy) || 0.001;
        e.x += (dx / d) * e.speed;
        e.y += (dy / d) * e.speed;

        // Collide player
        if (d < (PLAYER.size + ENEMY.size) * 0.5) {
          const since = now - playerRef.current.lastHitAt;
          if (since > PLAYER.invulnTime) {
            healthRef.current = Math.max(0, healthRef.current - ENEMY.damage);
            setHealth(healthRef.current);
            playerRef.current.lastHitAt = now;
            play('hit');
            if (healthRef.current <= 0) {
              endGame();
              return false;
            }
          }
        }

        return e.hp > 0 && e.x > -40 && e.x < WORLD.width + 40 && e.y > -40 && e.y < WORLD.height + 40;
      });

      // Collisions: bullets vs enemies/boss
      bulletsRef.current.forEach((b) => {
        enemiesRef.current.forEach((e) => {
          if (Math.abs(b.x - e.x) < (b.size + ENEMY.size) * 0.6 && Math.abs(b.y - e.y) < (b.size + ENEMY.size) * 0.6) {
            e.hp -= b.dmg;
            b.life = Math.min(b.life, 0); // remove bullet on hit
            if (e.hp <= 0) {
              statsRef.current.kills += 1;
              statsRef.current.score += 1;
              setStats({ ...statsRef.current });
              play('enemy_down');

              // progression: unlock AK at 5 kills, RPG at 10 kills
              if (statsRef.current.kills === 5 && ammoRef.current[Weapons.AK] === 90) {
                // notify via HUD popup handled by HUD reading stats
              }
              if (statsRef.current.kills === 10 && ammoRef.current[Weapons.RPG] === 6) {
                // unlock RPG usage
              }
            }
          }
        });

        // Boss
        if (boss && Math.abs(b.x - boss.x) < (b.size + BOSS.size) * 0.6 && Math.abs(b.y - boss.y) < (b.size + BOSS.size) * 0.6) {
          setBoss((prev) => {
            if (!prev) return prev;
            const hp = Math.max(0, prev.hp - b.dmg * (b.weapon === Weapons.RPG ? 2 : 1));
            b.life = Math.min(b.life, 0);
            if (hp <= 0) {
              statsRef.current.score += 10;
              setStats({ ...statsRef.current });
              return null;
            }
            return { ...prev, hp };
          });
        }
      });

      // Boss AI
      setBoss((prev) => {
        if (!prev) return prev;
        let { x, y, hp, cooldown } = prev;
        cooldown = Math.max(0, cooldown - dt);
        // Descend initially
        if (y < WORLD.height * 0.25) y += BOSS.speed;
        // Move horizontally following player slowly
        const dx = playerRef.current.x - x;
        x += clamp(dx, -BOSS.speed, BOSS.speed);

        // Fire at player occasionally
        if (cooldown <= 0 && chance(0.01)) {
          const dir = { x: playerRef.current.x - x, y: playerRef.current.y - y };
          const d = Math.hypot(dir.x, dir.y) || 1;
          bulletsRef.current.push({
            x, y,
            vx: (dir.x / d) * 1.2,
            vy: (dir.y / d) * 1.2,
            dmg: 20,
            life: 5000,
            size: 3,
            owner: 'boss',
          });
          cooldown = 1500;
        }

        // Collide with player
        const pd = Math.hypot(playerRef.current.x - x, playerRef.current.y - y);
        if (pd < (PLAYER.size + BOSS.size) * 0.6) {
          const since = now - playerRef.current.lastHitAt;
          if (since > PLAYER.invulnTime) {
            healthRef.current = Math.max(0, healthRef.current - BOSS.damage);
            setHealth(healthRef.current);
            playerRef.current.lastHitAt = now;
            play('hit');
            if (healthRef.current <= 0) {
              endGame();
            }
          }
        }

        return { x, y, hp, cooldown };
      });

      // Enemy bullets hit player
      bulletsRef.current.forEach((b) => {
        if (b.owner === 'boss') {
          const d = Math.hypot(playerRef.current.x - b.x, playerRef.current.y - b.y);
          if (d < PLAYER.size + b.size) {
            b.life = Math.min(b.life, 0);
            const since = now - playerRef.current.lastHitAt;
            if (since > PLAYER.invulnTime) {
              healthRef.current = Math.max(0, healthRef.current - 20);
              setHealth(healthRef.current);
              playerRef.current.lastHitAt = now;
              play('hit');
              if (healthRef.current <= 0) {
                endGame();
              }
            }
          }
        }
      });

      // Weapon switching rules
      if (statsRef.current.kills >= 5 && input.switchToAK) setWeapon(Weapons.AK);
      if (statsRef.current.kills >= 10 && input.switchToRPG) setWeapon(Weapons.RPG);
      if (input.switchToTaser) setWeapon(Weapons.TASER);

      // Render
      render(ctx, now);
      if (running) raf = requestAnimationFrame(update);
    }

    function render(ctx, now) {
      const s = spriteRef.current;
      // Clear
      ctx.fillStyle = WORLD.bgColor;
      ctx.fillRect(0, 0, WORLD.width, WORLD.height);

      // Background vignette
      ctx.fillStyle = 'rgba(10,5,5,0.15)';
      ctx.fillRect(0, 0, WORLD.width, 20);
      ctx.fillRect(0, WORLD.height - 20, WORLD.width, 20);

      // Player
      drawSprite(ctx, s.player, playerRef.current.x, playerRef.current.y);

      // Enemies
      enemiesRef.current.forEach((e) => {
        drawSprite(ctx, s.animatronic, e.x, e.y);
      });

      // Boss
      if (boss) drawSprite(ctx, s.boss, boss.x, boss.y);

      // Bullets
      bulletsRef.current.forEach((b) => {
        if (b.owner === 'player') {
          ctx.fillStyle = weaponMeta[b.weapon].trailColor;
        } else {
          ctx.fillStyle = '#a11';
        }
        ctx.fillRect(b.x - b.size / 2, b.y - b.size / 2, b.size, b.size);
      });

      // Jump scare overlay
      if (jumpscareOn) {
        ctx.fillStyle = 'rgba(200,20,20,0.55)';
        ctx.fillRect(0, 0, WORLD.width, WORLD.height);
        drawTextPixel(ctx, 'RUN', WORLD.width / 2 - 20, WORLD.height / 2, '#fff', 2);
      }
    }

    raf = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onGameOver, audioEnabled]);

  // Expose HUD info via DOM custom properties using data attributes if needed
  return (
    <div className="game-root" style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        className="game-stage"
        width={WORLD.width}
        height={WORLD.height}
        style={{ width: WORLD.width * WORLD.scale, height: WORLD.height * WORLD.scale }}
        tabIndex={0}
        aria-label="Game Canvas"
        onContextMenu={(e) => e.preventDefault()}
      />
      {/* HUD overlay */}
      {children &&
        React.cloneElement(children, {
          health,
          ammo,
          weapon,
          stats,
          boss,
        })}
    </div>
  );
}
