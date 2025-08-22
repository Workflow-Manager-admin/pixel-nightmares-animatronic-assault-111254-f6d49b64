import React from 'react';

// PUBLIC_INTERFACE
export default function GameOver({ stats, onMenu, onRetry }) {
  const s = stats || { score: 0, kills: 0, time: 0, bossDefeated: false };
  return (
    <div className="gameover-root">
      <div className="panel">
        <h2 className="title">You fell silent.</h2>
        <p className="subtitle">Score {s.score} • Kills {s.kills} • Time {s.time}s {s.bossDefeated ? '• Boss Defeated' : ''}</p>
        <div className="center" style={{ gap: 10, gridTemplateColumns: 'repeat(2,1fr)' }}>
          <div className="row">
            <button className="btn" onClick={onRetry}>Retry</button>
            <button className="btn" onClick={onMenu}>Main Menu</button>
          </div>
        </div>
      </div>
    </div>
  );
}
