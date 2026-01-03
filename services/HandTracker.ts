
import { HandData } from '../types';

export class HandTracker {
  private hands: any;
  private camera: any;
  private currentHandData: HandData = {
    detected: false,
    x: 0,
    y: 0,
    pinch: 0,
    fingerCount: 0
  };

  constructor(videoElement: HTMLVideoElement, onResults: (data: HandData) => void) {
    // MediaPipe window objects
    const Hands = (window as any).Hands;
    const Camera = (window as any).Camera;

    if (!Hands || !Camera) {
      console.error('MediaPipe libraries not found on window');
      return;
    }

    this.hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    this.hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Index tip (8) for position
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];
        
        // Distance for pinch
        const pinchDist = Math.sqrt(
          Math.pow(indexTip.x - thumbTip.x, 2) + 
          Math.pow(indexTip.y - thumbTip.y, 2)
        );

        // Count fingers up
        let count = 0;
        const fingerTips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
        const fingerBases = [5, 9, 13, 17];
        
        fingerTips.forEach((tip, idx) => {
          if (landmarks[tip].y < landmarks[fingerBases[idx]].y) count++;
        });
        
        // Thumb (special case)
        if (Math.abs(landmarks[4].x - landmarks[2].x) > 0.1) count++;

        this.currentHandData = {
          detected: true,
          x: (indexTip.x - 0.5) * 20, // Map to scene coords approx
          y: (0.5 - indexTip.y) * 20,
          pinch: pinchDist < 0.05 ? 1 : 0,
          fingerCount: count
        };
      } else {
        this.currentHandData.detected = false;
      }
      onResults(this.currentHandData);
    });

    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: videoElement });
      },
      width: 640,
      height: 480
    });
  }

  start() {
    this.camera.start();
  }

  stop() {
    this.camera.stop();
  }
}
