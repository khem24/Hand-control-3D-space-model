
import React from 'react';
import { HandData, ParticleShape } from '../types';
import { Hand, MousePointer2 } from 'lucide-react';

interface HUDProps {
  handData: HandData;
  activeShape: ParticleShape;
  videoRef: React.RefObject<HTMLVideoElement>;
  isCameraActive: boolean;
}

const HUD: React.FC<HUDProps> = ({ handData, activeShape, videoRef, isCameraActive }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col p-8">
      {/* Top Left: Status */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-widest text-white/90 uppercase">Nebula Control</h1>
        <div className="flex items-center gap-2 text-xs font-mono text-white/50">
          <div className={`w-2 h-2 rounded-full ${handData.detected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {handData.detected ? 'HAND TRACKING ACTIVE' : 'MOUSE/TOUCH MODE'}
        </div>
      </div>

      {/* Center: Detection Info */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center transition-all duration-500">
          <div className="text-xs font-mono text-white/30 uppercase tracking-[0.3em] mb-2">Active Formation</div>
          <div className="text-4xl md:text-6xl font-black text-white drop-shadow-lg tracking-wider">
            {activeShape}
          </div>
          {handData.detected && (
            <div className="mt-4 flex flex-col items-center gap-2">
               <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 w-6 rounded-full transition-all duration-300 ${i < handData.fingerCount ? 'bg-cyan-400' : 'bg-white/10'}`} 
                  />
                ))}
              </div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                Fingers Detected: {handData.fingerCount}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Right: Mini Cam */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end">
        <div className="relative w-48 aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/50 shadow-2xl">
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 gap-2">
              <MousePointer2 size={24} />
              <span className="text-[10px] font-mono uppercase">Initializing...</span>
            </div>
          )}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover transition-all duration-700 ${handData.detected ? 'blur-sm brightness-50' : 'grayscale'}`}
            autoPlay
            playsInline
            muted
          />
          {handData.detected && (
             <div className="absolute inset-0 flex items-center justify-center">
                <Hand className="text-white/80 animate-ping" size={32} />
             </div>
          )}
        </div>
        <div className="mt-2 text-[10px] font-mono text-white/30 tracking-widest uppercase">
          Live Input Stream
        </div>
      </div>
    </div>
  );
};

export default HUD;
