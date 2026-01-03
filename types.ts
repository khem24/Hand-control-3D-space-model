
export enum ParticleShape {
  SPHERE = 'SPHERE',
  HEART = 'HEART',
  FLOWER = 'FLOWER',
  SATURN = 'SATURN',
  FIREWORKS = 'FIREWORKS'
}

export interface HandData {
  detected: boolean;
  x: number;
  y: number;
  pinch: number; // 0 to 1
  fingerCount: number;
}
