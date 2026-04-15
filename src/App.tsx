import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import { MusicProvider, Playlist, PlayerControls } from './components/MusicPlayer';

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  return (
    <MusicProvider>
      <div className="w-screen h-screen flex flex-col bg-bg-void text-glitch-cyan overflow-hidden font-sans relative">
        {/* CRT & Noise Overlays */}
        <div className="absolute inset-0 crt-overlay pointer-events-none z-50" />
        <div className="absolute inset-0 noise-bg pointer-events-none z-40" />
        
        {/* Header Section */}
        <header className="h-[80px] border-b-4 border-glitch-cyan flex items-center justify-between px-10 bg-black flex-shrink-0 relative z-10">
          <div className="font-pixel text-2xl glitch-text text-glitch-magenta">
            NEON_CORE // v3.0_GLITCH
          </div>
          <div className="flex gap-12 font-pixel text-xs">
            <div className="flex flex-col items-end">
              <span className="text-glitch-cyan opacity-50 mb-1">SCORE</span>
              <div className="text-glitch-magenta glitch-text text-xl">{score.toString().padStart(6, '0')}</div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-glitch-cyan opacity-50 mb-1">BEST</span>
              <div className="text-glitch-magenta glitch-text text-xl">{highScore.toString().padStart(6, '0')}</div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-glitch-cyan opacity-50 mb-1">SYNC</span>
              <div className="text-glitch-yellow glitch-text text-xl">OK</div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden relative z-10">
          <Playlist />
          
          <section className="flex-1 relative overflow-hidden bg-black">
            <div className="absolute inset-0 flex items-center justify-center">
              <SnakeGame 
                score={score} 
                highScore={highScore} 
                onScoreUpdate={setScore} 
                onHighScoreUpdate={setHighScore} 
              />
            </div>
          </section>
        </main>

        {/* Footer - Music Player Controls */}
        <PlayerControls />
      </div>
    </MusicProvider>
  );
}
