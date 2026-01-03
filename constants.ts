
import { ParticleShape } from './types';

export const PARTICLE_COUNT = 15000;
export const LERP_SPEED = 0.05;
export const ROTATION_SPEED = 0.002;
export const PINCH_THRESHOLD = 0.05;
export const GESTURE_CONFIDENCE_THRESHOLD = 15;

export const SHAPE_LABELS: Record<ParticleShape, string> = {
  [ParticleShape.SPHERE]: 'Orbital Sphere',
  [ParticleShape.HEART]: 'Core Pulse (4 Fingers)',
  [ParticleShape.FLOWER]: 'Blossom (2 Fingers)',
  [ParticleShape.SATURN]: 'Ring System (3 Fingers)',
  [ParticleShape.FIREWORKS]: 'Supernova (5 Fingers)'
};
