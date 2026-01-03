
import React from 'react';
import { ParticleShape } from '../types';
import { SHAPE_LABELS } from '../constants';
import { Disc, Heart, Flower, Orbit, Sparkles } from 'lucide-react';

interface ControlsProps {
  activeShape: ParticleShape;
  onShapeChange: (shape: ParticleShape) => void;
}

const Controls: React.FC<ControlsProps> = ({ activeShape, onShapeChange }) => {
  const buttons = [
    { id: ParticleShape.SPHERE, icon: <Disc size={20} /> },
    { id: ParticleShape.FLOWER, icon: <Flower size={20} /> },
    { id: ParticleShape.SATURN, icon: <Orbit size={20} /> },
    { id: ParticleShape.HEART, icon: <Heart size={20} /> },
    { id: ParticleShape.FIREWORKS, icon: <Sparkles size={20} /> },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-2xl z-20">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          onClick={() => onShapeChange(btn.id)}
          className={`p-3 rounded-full transition-all duration-300 group relative ${
            activeShape === btn.id 
            ? 'bg-white text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
            : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title={SHAPE_LABELS[btn.id]}
        >
          {btn.icon}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {SHAPE_LABELS[btn.id]}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Controls;
