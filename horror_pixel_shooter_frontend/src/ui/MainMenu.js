import React from 'react';

// PUBLIC_INTERFACE
export default function MainMenu({ onStart }) {
  return (
    <div className="menu-root">
      <div className="panel">
        <h1 className="title">Pixel Nightmares: Animatronic Assault</h1>
        <p className="subtitle">A retro 2D horror shooter. Survive the malfunctioning animatronics.</p>
        <div className="center" style={{ margin: '10px 0 16px' }}>
          <button className="btn" onClick={onStart} autoFocus>Start</button>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <small className="subtitle">Tip: Unlock AK at 5 kills and RPG at 10 kills. Beware the boss.</small>
        </div>
      </div>
    </div>
  );
}
