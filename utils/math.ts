
import { ParticleShape } from '../types';

export const generateShapePositions = (shape: ParticleShape, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const t = Math.random() * Math.PI * 2;
    const u = Math.random() * 2 - 1;
    const r = 5; // Base radius

    switch (shape) {
      case ParticleShape.SPHERE: {
        const phi = Math.acos(u);
        const theta = t;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case ParticleShape.HEART: {
        const phi = Math.random() * Math.PI * 2;
        const scale = r / 16;
        x = scale * (16 * Math.pow(Math.sin(phi), 3));
        y = scale * (13 * Math.cos(phi) - 5 * Math.cos(2 * phi) - 2 * Math.cos(3 * phi) - Math.cos(4 * phi));
        z = (Math.random() - 0.5) * 2;
        break;
      }
      case ParticleShape.FLOWER: {
        const k = 4; // Petals
        const phi = Math.random() * Math.PI * 2;
        const radius = r * Math.cos(k * phi);
        x = radius * Math.cos(phi);
        y = radius * Math.sin(phi);
        z = (Math.random() - 0.5) * 1;
        break;
      }
      case ParticleShape.SATURN: {
        if (i < count * 0.6) {
          // Central Sphere
          const phi = Math.acos(u);
          const theta = t;
          const sR = r * 0.6;
          x = sR * Math.sin(phi) * Math.cos(theta);
          y = sR * Math.sin(phi) * Math.sin(theta);
          z = sR * Math.cos(phi);
        } else {
          // Rings
          const ringR = r * (0.9 + Math.random() * 0.6);
          const theta = Math.random() * Math.PI * 2;
          x = ringR * Math.cos(theta);
          y = ringR * Math.sin(theta) * 0.3; // Tilted
          z = ringR * Math.sin(theta) * 0.9;
        }
        break;
      }
      case ParticleShape.FIREWORKS: {
        const speed = Math.random() * r;
        const phi = Math.acos(u);
        const theta = t;
        x = speed * Math.sin(phi) * Math.cos(theta);
        y = speed * Math.sin(phi) * Math.sin(theta);
        z = speed * Math.cos(phi);
        break;
      }
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  
  return positions;
};
