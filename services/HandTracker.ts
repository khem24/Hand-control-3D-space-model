
import { HandData } from '../types';

export class HandTracker {
  private hands: any;
  private camera: any;
  private videoElement: HTMLVideoElement;
  private currentHandData: HandData = {
    detected: false,
    x: 0,
    y: 0,
    pinch: 0,
    fingerCount: 0
  };

  constructor(videoElement: HTMLVideoElement, onResults: (data: HandData) => void) {
    this.videoElement = videoElement;
    
    // MediaPipe window objects check
    const Hands = (window as any).Hands;
    const Camera = (window as any).Camera;

    if (!Hands || !Camera) {
      throw new Error('MediaPipe Hands or Camera utilities not loaded. Ensure scripts are in index.html');
    }

    this.hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    this.hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];
        
        const pinchDist = Math.sqrt(
          Math.pow(indexTip.x - thumbTip.x, 2) + 
          Math.pow(indexTip.y - thumbTip.y, 2)
        );

        let count = 0;
        const fingerTips = [8, 12, 16, 20]; 
        const fingerBases = [5, 9, 13, 17];
        
        fingerTips.forEach((tip, idx) => {
          if (landmarks[tip].y < landmarks[fingerBases[idx]].y) count++;
        });
        
        if (Math.abs(landmarks[4].x - landmarks[2].x) > 0.1) count++;

        this.currentHandData = {
          detected: true,
          x: (indexTip.x - 0.5) * 20,
          y: (0.5 - indexTip.y) * 20,
          pinch: pinchDist < 0.06 ? 1 : 0,
          fingerCount: count
        };
      } else {
        this.currentHandData.detected = false;
      }
      onResults(this.currentHandData);
    });

    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        try {
          await this.hands.send({ image: this.videoElement });
        } catch (e) {
          console.error("Error sending frame to MediaPipe:", e);
        }
      },
      width: 640,
      height: 480
    });
  }

  start() {
    console.log("HandTracker: Attempting to start camera...");
    this.camera.start().catch((err: any) => {
      console.error("HandTracker: Camera start error:", err);
    });
  }

  stop() {
    console.log("HandTracker: Stopping camera...");
    if (this.camera) this.camera.stop();
  }
}
