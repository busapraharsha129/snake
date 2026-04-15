import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Track } from '../types';

export const DUMMY_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Cyber Drift',
    artist: 'AI Ensemble 01',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: '⚡',
  },
  {
    id: '2',
    title: 'Glitch Horizon',
    artist: 'Neural Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: '🌌',
  },
  {
    id: '3',
    title: 'Arcade Echo',
    artist: 'Synth-Mind v4',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: '🕹️',
  },
];

interface MusicContextType {
  currentTrack: Track;
  isPlaying: boolean;
  progress: number;
  duration: number;
  togglePlay: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  setCurrentTrackIndex: (index: number) => void;
  currentTrackIndex: number;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within a MusicProvider');
  return context;
};

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };

  const skipBackward = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  return (
    <MusicContext.Provider value={{
      currentTrack,
      isPlaying,
      progress,
      duration,
      togglePlay,
      skipForward,
      skipBackward,
      setCurrentTrackIndex,
      currentTrackIndex
    }}>
      {children}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={skipForward}
      />
    </MusicContext.Provider>
  );
}

export function Playlist() {
  const { currentTrackIndex, setCurrentTrackIndex } = useMusic();

  return (
    <aside className="w-[280px] border-r-4 border-glitch-magenta bg-black p-6 flex flex-col h-full overflow-y-auto relative">
      <div className="absolute inset-0 noise-bg" />
      <h2 className="text-2xl font-pixel text-glitch-cyan mb-8 glitch-text">DATA_STREAM</h2>
      <div className="flex flex-col gap-4 relative z-10">
        {DUMMY_TRACKS.map((track, index) => (
          <div
            key={track.id}
            onClick={() => setCurrentTrackIndex(index)}
            className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
              currentTrackIndex === index 
                ? 'bg-glitch-cyan text-black glitch-border' 
                : 'text-glitch-magenta border-2 border-transparent hover:border-glitch-cyan'
            }`}
          >
            <div className="text-3xl font-pixel">
              {track.cover}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-pixel truncate">
                {track.title}
              </span>
              <span className="text-xs font-mono opacity-70 truncate">{track.artist}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function PlayerControls() {
  const { currentTrack, isPlaying, progress, togglePlay, skipForward, skipBackward } = useMusic();

  return (
    <footer className="h-[120px] border-t-4 border-glitch-cyan bg-black px-10 flex items-center justify-between w-full relative overflow-hidden">
      <div className="absolute inset-0 noise-bg" />
      <div className="scanline" />
      
      <div className="flex items-center gap-6 w-[300px] relative z-10">
        <div className="w-[64px] h-[64px] bg-glitch-magenta flex items-center justify-center text-4xl glitch-border">
          {currentTrack.cover}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xl font-pixel text-glitch-cyan glitch-text truncate">{currentTrack.title}</span>
          <span className="text-sm font-mono text-glitch-magenta truncate">{currentTrack.artist}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 flex-1 max-w-[600px] relative z-10">
        <div className="flex items-center gap-10">
          <button onClick={skipBackward} className="text-glitch-cyan hover:text-glitch-magenta transition-all">
            <SkipBack className="w-8 h-8 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-glitch-cyan text-black flex items-center justify-center hover:bg-glitch-magenta transition-colors glitch-border"
          >
            {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current translate-x-1" />}
          </button>
          <button onClick={skipForward} className="text-glitch-cyan hover:text-glitch-magenta transition-all">
            <SkipForward className="w-8 h-8 fill-current" />
          </button>
        </div>
        <div className="w-full h-3 bg-zinc-900 border border-glitch-magenta relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="absolute top-0 left-0 h-full bg-glitch-magenta shadow-[0_0_15px_var(--color-glitch-magenta)]"
          />
        </div>
      </div>

      <div className="w-[300px] flex justify-end items-center gap-4 text-glitch-cyan text-xl font-mono relative z-10">
        <span className="glitch-text">VOL_LVL</span>
        <div className="w-32 h-2 bg-zinc-900 border border-glitch-cyan">
          <div className="w-[70%] h-full bg-glitch-cyan" />
        </div>
        <span className="text-glitch-magenta">70%</span>
      </div>
    </footer>
  );
}
