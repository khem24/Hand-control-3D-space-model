
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ParticleShape, HandData } from './types';
import { HandTracker } from './services/HandTracker';
import { audioEngine } from './services/AudioEngine';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import HUD from './components/HUD';
import { GESTURE_CONFIDENCE_THRESHOLD } from './constants';
import { CircleHelp, Play, Hand } from 'lucide-react';

const App: React.FC = () => {
  const [activeShape, setActiveShape] = useState<ParticleShape>(ParticleShape.SPHERE);
  const [handData, setHandData] = useState<HandData>({
    detected: false,
    x: 0,
    y: 0,
    pinch: 0,
    fingerCount: 0
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const trackerRef = useRef<HandTracker | null>(null);
  const gestureHistory = useRef<number[]>([]);

  const handleStart = async () => {
    audioEngine.init();
    setIsStarted(true);
    
    if (videoRef.current) {
      try {
        trackerRef.current = new HandTracker(videoRef.current, (data) => {
          setHandData(data);
          processGesture(data.fingerCount);
        });
        trackerRef.current.start();
        setIsCameraActive(true);
      } catch (err) {
        console.warn("Camera failed, using mouse mode", err);
      }
    }
  };

  const processGesture = (count: number) => {
    gestureHistory.current.push(count);
    if (gestureHistory.current.length > GESTURE_CONFIDENCE_THRESHOLD) {
      gestureHistory.current.shift();
    }

    // Modal value detection
    const counts = gestureHistory.current.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Cast 'c' to number to fix comparison operator error with 'unknown'
    const dominant = Object.entries(counts).find(([_, c]) => (c as number) > GESTURE_CONFIDENCE_THRESHOLD * 0.8);
    
    if (dominant) {
      const c = parseInt(dominant[0]);
      if (c === 2) setActiveShape(ParticleShape.FLOWER);
      else if (c === 3) setActiveShape(ParticleShape.SATURN);
      else if (c === 4) setActiveShape(ParticleShape.HEART);
      else if (c === 5) setActiveShape(ParticleShape.FIREWORKS);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (0.5 - e.clientY / window.innerHeight) * 20
    });
  };

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden select-none touch-none"
      onMouseMove={onMouseMove}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
    >
      <Visualizer 
        activeShape={activeShape} 
        handData={handData} 
        mousePos={mousePos} 
        isMouseDown={isMouseDown}
      />

      {isStarted && (
        <>
          <HUD 
            handData={handData} 
            activeShape={activeShape} 
            videoRef={videoRef} 
            isCameraActive={isCameraActive}
          />
          <Controls 
            activeShape={activeShape} 
            onShapeChange={setActiveShape} 
          />
          <button 
            onClick={() => setShowHelp(true)}
            className="fixed top-8 right-8 z-30 p-2 rounded-full border border-white/20 text-white/50 hover:text-white hover:border-white transition-all bg-black/20 backdrop-blur"
          >
            <CircleHelp size={24} />
          </button>
        </>
      )}

      {/* Start Overlay */}
      {!isStarted && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-1000 p-8">
          <div className="max-w-xl text-center">
            <h1 className="text-6xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
              NEBULA
            </h1>
            <p className="text-white/60 mb-12 text-lg leading-relaxed font-light">
              Experience a real-time cinematic particle environment controlled by your hands. 
              Step into the void and manipulate the stars.
            </p>
            <button
              onClick={handleStart}
              className="group relative inline-flex items-center gap-3 px-12 py-5 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <Play className="fill-current" size={20} />
              <span>ENTER EXPERIENCE</span>
            </button>
            <div className="mt-12 flex gap-8 justify-center opacity-30 text-[10px] font-mono tracking-widest">
              <span>THREE.JS ENGINE</span>
              <span>MEDIAPIPE AI</span>
              <span>WEB AUDIO API</span>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md w-full relative">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Hand size={20} className="text-cyan-400" />
              GESTURE RECOGNITION
            </h2>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-white/40">2 FINGERS</span>
                <span className="text-white">BLOSSOM</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-white/40">3 FINGERS</span>
                <span className="text-white">SATURN RINGS</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-white/40">4 FINGERS</span>
                <span className="text-white">CORE PULSE</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-white/40">OPEN HAND</span>
                <span className="text-white">SUPERNOVA</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-white/40">PINCH / CLICK</span>
                <span className="text-white text-cyan-400">ATTRACT FORCE</span>
              </div>
            </div>
            <p className="mt-8 text-white/30 text-[10px] text-center leading-relaxed">
              If camera is disabled, use your mouse/touch to interact with the nebula. 
              Click and hold to attract particles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
