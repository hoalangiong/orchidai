import { useEffect, useRef } from 'react';

// 17 COCO keypoints from demo_server.py
// 0:nose 1:left_eye 2:right_eye 3:left_ear 4:right_ear
// 5:left_shoulder 6:right_shoulder 7:left_elbow 8:right_elbow
// 9:left_wrist 10:right_wrist 11:left_hip 12:right_hip
// 13:left_knee 14:right_knee 15:left_ankle 16:right_ankle

const BONES = [
  [0,1],[0,2],[1,3],[2,4],           // head
  [5,6],[5,7],[7,9],[6,8],[8,10],    // arms
  [5,11],[6,12],[11,12],             // torso
  [11,13],[13,15],[12,14],[14,16],   // legs
];

interface Keypoint { x: number; y: number; confidence: number; }
interface Person { keypoints: Keypoint[]; confidence: number; activity?: string; }

function generateMockPose(t: number, personId = 0): Person {
  const offset = (personId - 0.5) * 0.4;
  const bob = Math.sin(t * 1.2) * 0.02;
  const walk = Math.sin(t * 1.5);
  return {
    confidence: 0.91,
    activity: Math.abs(walk) < 0.3 ? 'standing' : 'walking',
    keypoints: [
      { x: 0.50 + offset, y: 0.15 + bob, confidence: 0.95 },
      { x: 0.52 + offset, y: 0.13 + bob, confidence: 0.90 },
      { x: 0.48 + offset, y: 0.13 + bob, confidence: 0.90 },
      { x: 0.54 + offset, y: 0.14 + bob, confidence: 0.85 },
      { x: 0.46 + offset, y: 0.14 + bob, confidence: 0.85 },
      { x: 0.57 + offset, y: 0.28 + bob, confidence: 0.92 },
      { x: 0.43 + offset, y: 0.28 + bob, confidence: 0.92 },
      { x: 0.60 + offset, y: 0.42 + Math.sin(t*1.5+1)*0.04, confidence: 0.88 },
      { x: 0.40 + offset, y: 0.42 + Math.sin(t*1.5)*0.04,   confidence: 0.88 },
      { x: 0.62 + offset, y: 0.55 + Math.sin(t*1.5+1)*0.06, confidence: 0.82 },
      { x: 0.38 + offset, y: 0.55 + Math.sin(t*1.5)*0.06,   confidence: 0.82 },
      { x: 0.54 + offset, y: 0.58, confidence: 0.93 },
      { x: 0.46 + offset, y: 0.58, confidence: 0.93 },
      { x: 0.54 + offset, y: 0.74 + walk*0.04, confidence: 0.87 },
      { x: 0.46 + offset, y: 0.74 - walk*0.04, confidence: 0.87 },
      { x: 0.54 + offset, y: 0.90 + walk*0.05, confidence: 0.83 },
      { x: 0.46 + offset, y: 0.90 - walk*0.05, confidence: 0.83 },
    ],
  };
}

interface Props {
  wsUrl?: string;       // ws://localhost:8000/ws/pose — if omitted, use mock
  presence?: boolean;
}

export default function PoseViewer3D({ wsUrl, presence = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    animId: number;
    ws: WebSocket | null;
    persons: Person[];
    startTime: number;
    useMock: boolean;
  }>({ animId: 0, ws: null, persons: [], startTime: Date.now(), useMock: !wsUrl });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    s.startTime = Date.now();
    s.useMock = !wsUrl;

    // Try WebSocket if URL provided
    if (wsUrl) {
      try {
        const ws = new WebSocket(wsUrl);
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.data?.persons) s.persons = msg.data.persons;
          } catch { /* ignore */ }
        };
        ws.onerror = () => { s.useMock = true; };
        ws.onclose = () => { s.useMock = true; };
        s.ws = ws;
      } catch {
        s.useMock = true;
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      const t = (Date.now() - s.startTime) / 1000;

      // Background
      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(0,100,200,0.12)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Scan line effect
      const scanY = ((t * 60) % H);
      const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scanGrad.addColorStop(0, 'rgba(0,150,255,0)');
      scanGrad.addColorStop(0.5, 'rgba(0,150,255,0.06)');
      scanGrad.addColorStop(1, 'rgba(0,150,255,0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 20, W, 40);

      if (!presence) {
        // Empty room
        ctx.fillStyle = 'rgba(0,200,100,0.6)';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('KHÔNG CÓ NGƯỜI', W / 2, H / 2 - 10);
        ctx.fillStyle = 'rgba(0,200,100,0.3)';
        ctx.font = '11px monospace';
        ctx.fillText('WiFi CSI scanning...', W / 2, H / 2 + 12);
        s.animId = requestAnimationFrame(draw);
        return;
      }

      // Get persons
      const persons: Person[] = s.useMock
        ? [generateMockPose(t)]
        : s.persons.length > 0 ? s.persons : [generateMockPose(t)];

      for (const person of persons) {
        const kps = person.keypoints;
        if (!kps || kps.length < 17) continue;

        // Map normalized coords to canvas
        const px = (kp: Keypoint) => kp.x * W;
        const py = (kp: Keypoint) => kp.y * H;

        // Draw bones
        for (const [a, b] of BONES) {
          const ka = kps[a], kb = kps[b];
          if (!ka || !kb) continue;
          const conf = (ka.confidence + kb.confidence) / 2;
          const alpha = 0.4 + conf * 0.5;
          ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = 'rgba(0,150,255,0.8)';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(px(ka), py(ka));
          ctx.lineTo(px(kb), py(kb));
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Draw joints
        for (let i = 0; i < kps.length; i++) {
          const kp = kps[i];
          const isHead = i <= 4;
          const r = isHead ? 7 : 5;
          const conf = kp.confidence;
          const alpha = 0.5 + conf * 0.5;

          // Glow
          const grd = ctx.createRadialGradient(px(kp), py(kp), 0, px(kp), py(kp), r * 2.5);
          grd.addColorStop(0, `rgba(0,220,255,${alpha * 0.6})`);
          grd.addColorStop(1, 'rgba(0,100,255,0)');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(px(kp), py(kp), r * 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Core dot
          ctx.fillStyle = isHead ? `rgba(0,255,220,${alpha})` : `rgba(0,180,255,${alpha})`;
          ctx.beginPath();
          ctx.arc(px(kp), py(kp), r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Activity label
        if (person.activity) {
          const hip = kps[11];
          ctx.fillStyle = 'rgba(0,255,180,0.85)';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(person.activity.toUpperCase(), px(hip), py(hip) + 20);
        }
      }

      // Corner labels
      ctx.fillStyle = 'rgba(0,150,255,0.4)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('WiFi CSI · RuView', 8, 16);
      ctx.textAlign = 'right';
      ctx.fillText(s.useMock ? 'DEMO' : 'LIVE', W - 8, 16);

      s.animId = requestAnimationFrame(draw);
    }

    s.animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(s.animId);
      s.ws?.close();
    };
  }, [wsUrl, presence]);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        canvas.width = e.contentRect.width;
        canvas.height = e.contentRect.height;
      }
    });
    ro.observe(canvas.parentElement!);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
