import React from 'react';

// PUBLIC_INTERFACE
export default function LoreOverlay({ onClose }) {
  const fragments = [
    'They said the animatronics were “family friendly.” The logs say otherwise.',
    'Power cuts at 3:33 AM. Someone wanted darkness.',
    'A maintenance note: “Do not look into their eyes.” The last note.',
    'The taser was never meant for guests.',
    'Behind the service door: claw marks on steel.',
    'He sold their laughter for profit. The machines remember.',
  ];
  return (
    <div className="lore-root">
      <div className="panel">
        <h3 className="title">Recovered Fragments</h3>
        <div className="lore-content">
          {fragments.map((t, i) => (
            <p key={i} style={{ margin: '6px 0' }}>• {t}</p>
          ))}
        </div>
        <div className="center" style={{ marginTop: 12 }}>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
