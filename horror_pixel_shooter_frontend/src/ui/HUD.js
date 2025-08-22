import React, { useMemo } from 'react';
import { weaponMeta, Weapons } from '../game/weapons';

// PUBLIC_INTERFACE
export default function HUD({ health = 100, ammo = {}, weapon = Weapons.TASER, stats = { score: 0, kills: 0, time: 0 }, boss }) {
  const healthPct = Math.max(0, Math.min(100, Math.round((health / 100) * 100)));
  const ammoDisplay = useMemo(() => ({
    [Weapons.TASER]: '∞',
    [Weapons.AK]: ammo[Weapons.AK] ?? 0,
    [Weapons.RPG]: ammo[Weapons.RPG] ?? 0,
  }), [ammo]);

  const bossBar = boss ? (
    <div className="hud-row" style={{ justifyContent: 'center' }}>
      <div className="hud-panel" style={{ width: '60%' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span>Boss</span>
          <span>{boss.hp}</span>
        </div>
        <div className="healthbar">
          <span style={{ width: `${Math.max(0, Math.min(100, (boss.hp / 400) * 100))}%` }} />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="hud" aria-hidden="true">
      <div className="hud-row">
        <div className="hud-panel">
          <div className="row">
            <span>Health</span>
            <div className="healthbar"><span style={{ width: `${healthPct}%` }} /></div>
          </div>
        </div>
        <div className="hud-panel">
          <div className="row">
            <span>Ammo</span>
            <div className="ammobar"><span style={{ width: `${ammo[weapon] === Infinity ? 100 : Math.max(0, Math.min(100, (ammo[weapon] || 0) / (weapon === Weapons.AK ? 90 : 6) * 100))}%` }} /></div>
            <span>{ammoDisplay[weapon]}</span>
          </div>
        </div>
        <div className="hud-panel">
          <div className="row">
            <span>Weapon</span>
            <div className="weapon-slots">
              {[Weapons.TASER, Weapons.AK, Weapons.RPG].map((w) => (
                <div key={w} className={`slot ${w === weapon ? 'active' : ''}`} title={`${weaponMeta[w].name} ${w === Weapons.TASER ? '(1)' : w === Weapons.AK ? '(2)' : '(3)'}`}>
                  {w === Weapons.TASER ? '⚡' : w === Weapons.AK ? '🔫' : '💥'}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hud-panel">
          <div className="row">
            <span className="score">Score {stats.score}</span>
            <span>Kills {stats.kills}</span>
            <span>Time {stats.time}s</span>
          </div>
        </div>
      </div>
      {bossBar}
      <div className="hud-row" style={{ marginTop: 'auto' }}>
        <div className="hud-panel">
          <div className="hud-badges">
            <span className="badge" title="Move">
              <span className="dot" /> WASD / Arrows
            </span>
            <span className="badge" title="Shoot">
              <span className="dot" /> Left Click
            </span>
            <span className="badge" title="Switch Weapon">
              <span className="dot" /> 1 Taser / 2 AK / 3 RPG
            </span>
            <span className="badge" title="Unlocks">
              <span className="dot" /> AK at 5 kills, RPG at 10 kills
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
