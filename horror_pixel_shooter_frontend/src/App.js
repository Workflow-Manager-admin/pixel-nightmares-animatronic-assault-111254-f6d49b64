import React, { useMemo, useState, useEffect, useCallback } from 'react';
import './App.css';
import './index.css';
import Game from './game/Game';
import HUD from './ui/HUD';
import MainMenu from './ui/MainMenu';
import GameOver from './ui/GameOver';
import LoreOverlay from './ui/LoreOverlay';
import { AudioProvider } from './audio/AudioContext';
import { usePersistentSetting } from './hooks/usePersistentSetting';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

/**
 * Root Application: wraps the game with providers and renders menus/HUD.
 * This component manages the high-level flow: menu -> game -> game over -> menu.
 */
function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const [screen, setScreen] = useState('menu'); // menu | game | gameover
  const [lastRunStats, setLastRunStats] = useState(null);
  const [showLore, setShowLore] = useState(false);
  const [audioEnabled, setAudioEnabled] = usePersistentSetting('audioEnabled', true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Apply retro pixel scaling feel
    document.body.style.imageRendering = 'pixelated';
  }, [theme]);

  const handleStart = useCallback(() => {
    setScreen('game');
  }, []);

  const handleGameOver = useCallback((stats) => {
    setLastRunStats(stats);
    setScreen('gameover');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setScreen('menu');
  }, []);

  const handleLoreToggle = useCallback(() => {
    setShowLore((s) => !s);
  }, []);

  const topRightControls = useMemo(
    () => (
      <div className="top-controls">
        <button
          className="btn btn-ghost"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title="Toggle Theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button
          className="btn btn-ghost"
          aria-label={audioEnabled ? 'Mute' : 'Unmute'}
          onClick={() => setAudioEnabled((v) => !v)}
          title={audioEnabled ? 'Mute' : 'Unmute'}
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>
        <button
          className="btn btn-ghost"
          onClick={handleLoreToggle}
          aria-label="Lore"
          title="Hidden Lore"
        >
          📜
        </button>
      </div>
    ),
    [audioEnabled, handleLoreToggle, setAudioEnabled, theme, toggleTheme]
  );

  return (
    <div className="App app-root">
      {topRightControls}
      {screen === 'menu' && <MainMenu onStart={handleStart} />}
      {screen === 'game' && (
        <Game
          onGameOver={handleGameOver}
          audioEnabled={audioEnabled}
        >
          {/* HUD overlay plugged as children to position above canvas */}
          <HUD />
        </Game>
      )}
      {screen === 'gameover' && (
        <GameOver
          stats={lastRunStats}
          onMenu={handleBackToMenu}
          onRetry={handleStart}
        />
      )}
      {showLore && <LoreOverlay onClose={handleLoreToggle} />}
    </div>
  );
}

// PUBLIC_INTERFACE
export default function App() {
  /** App root provider composition */
  return (
    <ThemeProvider>
      <AudioProvider>
        <AppShell />
      </AudioProvider>
    </ThemeProvider>
  );
}
