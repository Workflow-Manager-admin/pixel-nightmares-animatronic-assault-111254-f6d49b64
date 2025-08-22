import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { usePersistentSetting } from '../hooks/usePersistentSetting';

/**
 * Simple audio registry for ambient loops and sfx.
 * Uses HTMLAudioElement for simplicity and wide support in CRA environment.
 */

const audioBank = {
  ambient: { src: process.env.REACT_APP_AMBIENT_URL || '', loop: true, volume: 0.25 },
  jumpscare: { src: process.env.REACT_APP_JUMPSCARE_URL || '', loop: false, volume: 0.6 },
  taser: { src: process.env.REACT_APP_TASER_URL || '', loop: false, volume: 0.35 },
  ak: { src: process.env.REACT_APP_AK_URL || '', loop: false, volume: 0.35 },
  rpg: { src: process.env.REACT_APP_RPG_URL || '', loop: false, volume: 0.45 },
  hit: { src: process.env.REACT_APP_HIT_URL || '', loop: false, volume: 0.4 },
  enemy_down: { src: process.env.REACT_APP_ENEMY_DOWN_URL || '', loop: false, volume: 0.4 },
  boss_roar: { src: process.env.REACT_APP_BOSS_ROAR_URL || '', loop: false, volume: 0.6 },
};

function createAudio(tag) {
  const cfg = audioBank[tag];
  if (!cfg || !cfg.src) return null;
  const audio = new Audio(cfg.src);
  audio.loop = !!cfg.loop;
  audio.volume = cfg.volume ?? 0.3;
  return audio;
}

// PUBLIC_INTERFACE
export const SFXContext = createContext({
  enabled: true,
  play: (tag) => {},
  stop: (tag) => {},
  ensureAmbient: () => {},
  setEnabled: (_v) => {},
});

/**
 * PUBLIC_INTERFACE
 * AudioProvider wraps app and exposes play/stop functions for sound effects.
 */
export function AudioProvider({ children }) {
  const [enabled, setEnabled] = usePersistentSetting('audioEnabled', true);
  const refs = useRef({}); // {tag: HTMLAudioElement}

  const play = useCallback(
    (tag) => {
      if (!enabled) return;
      let a = refs.current[tag];
      if (!a) {
        a = createAudio(tag);
        if (!a) return;
        refs.current[tag] = a;
      }
      // rewind if needed
      a.currentTime = 0;
      a.play().catch(() => {});
    },
    [enabled]
  );

  const stop = useCallback((tag) => {
    const a = refs.current[tag];
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  }, []);

  const ensureAmbient = useCallback(() => {
    if (!enabled) return;
    const tag = 'ambient';
    if (!refs.current[tag]) {
      const a = createAudio(tag);
      if (a) {
        refs.current[tag] = a;
        a.play().catch(() => {});
      }
    } else if (refs.current[tag].paused) {
      refs.current[tag].play().catch(() => {});
    }
  }, [enabled]);

  const value = useMemo(
    () => ({ enabled, play, stop, ensureAmbient, setEnabled }),
    [enabled, play, stop, ensureAmbient, setEnabled]
  );

  return <SFXContext.Provider value={value}>{children}</SFXContext.Provider>;
}

// PUBLIC_INTERFACE
export function useSFX() {
  /** Use audio SFX context {enabled, play, stop, ensureAmbient, setEnabled} */
  return useContext(SFXContext);
}
