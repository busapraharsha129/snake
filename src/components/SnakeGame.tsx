import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play, Pause } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = 'UP';
const GAME_SPEED = 150;

interface SnakeGameProps {
  score: number;
  highScore: number;
  onScoreUpdate: (score: number) => void;
  onHighScoreUpdate: (highScore: number) => void;
}

export default function SnakeGame({ score, highScore, onScoreUpdate, onHighScoreUpdate }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const generateFood = useCallback((currentSnake: { x: number; y: number }[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    onScoreUpdate(0);
    setIsGameOver(false);
    setIsPaused(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collisions
      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setIsGameOver(true);
        if (score > highScore) onHighScoreUpdate(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if food eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        onScoreUpdate(score + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isPaused, isGameOver, score, highScore, generateFood, onScoreUpdate, onHighScoreUpdate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
        case ' ': setIsPaused((p) => !p); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (subtle)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#00ffff' : '#ff00ff';
      
      // Add glitchy glow
      if (isHead) {
        ctx.shadowBlur = Math.random() > 0.9 ? 25 : 10;
        ctx.shadowColor = '#00ffff';
      } else {
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ff00ff';
      }

      ctx.beginPath();
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      const size = cellSize;
      ctx.fillRect(x, y, size, size);
    });

    // Draw food
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffff00';
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    const foodX = food.x * cellSize + cellSize / 2;
    const foodY = food.y * cellSize + cellSize / 2;
    ctx.fillRect(food.x * cellSize + 2, food.y * cellSize + 2, cellSize - 4, cellSize - 4);
    ctx.shadowBlur = 0;

  }, [snake, food]);

  return (
    <div className="flex flex-col items-center gap-0 w-full h-full justify-center relative bg-black">
      <div className="absolute top-5 left-5 font-mono text-glitch-magenta text-lg glitch-text">
        [SYS.EXE]: RUNNING_SNAKE.BIN
      </div>

      <div className="relative group p-1 bg-glitch-magenta">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="bg-black border-4 border-glitch-cyan"
        />
        
        <AnimatePresence>
          {(isPaused || isGameOver) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
            >
              {isGameOver ? (
                <div className="text-center space-y-6">
                  <h2 className="text-6xl font-pixel text-glitch-magenta glitch-text">
                    FATAL_ERROR
                  </h2>
                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-8 py-4 bg-glitch-cyan text-black font-pixel text-xs hover:bg-glitch-magenta transition-colors glitch-border"
                  >
                    REBOOT_SYSTEM
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <h2 className="text-6xl font-pixel text-glitch-cyan glitch-text">
                    HALTED
                  </h2>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="flex items-center gap-2 px-10 py-4 bg-glitch-cyan text-black font-pixel text-xs hover:bg-glitch-magenta transition-colors glitch-border"
                  >
                    RESUME_PROCESS
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
