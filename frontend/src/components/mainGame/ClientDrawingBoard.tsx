import { useEffect, useRef, useCallback, useState } from "react";
import { useSocketFunction } from "../../zustand/sockets";

type Stroke = {
  tool: "pen" | "eraser";
  color: string;
  size: number;
  points: number[];
};

const ClientDrawingBoard = () => {
  const lastJsonMessage = useSocketFunction((s) => s.webSocketMessage);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokeHistory = useRef<Stroke[]>([]);
  const redoStack = useRef<Stroke[]>([]);
  const currentStroke = useRef<Stroke | null>(null);

  const LOGICAL_W = 900;
  const LOGICAL_H = 520;

  const [displaySize, setDisplaySize] = useState({ width: 900, height: 520 });

  // Helper to set up the context with correct DPR and Scaling
  const setupContext = useCallback(
    (ctx: CanvasRenderingContext2D, width: number) => {
      const dpr = window.devicePixelRatio || 1;
      const canvas = ctx.canvas;

      // Physical pixels for sharpness
      canvas.width = width * dpr;
      canvas.height = width * (LOGICAL_H / LOGICAL_W) * dpr;

      ctx.scale(dpr, dpr);

      // Scale logical coordinates to CSS pixels
      const scale = width / LOGICAL_W;
      ctx.scale(scale, scale);

      // Drawing settings
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    },
    [],
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    // Reset transform to clear the whole physical area
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Re-apply scaling for the redraw
    setupContext(ctx, displaySize.width);

    for (const stroke of strokeHistory.current) {
      ctx.globalCompositeOperation =
        stroke.tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle =
        stroke.tool === "eraser" ? "rgba(0,0,0,1)" : stroke.color;
      ctx.lineWidth =
        stroke.tool === "eraser" ? stroke.size * 2.5 : stroke.size;

      const pts = stroke.points;
      if (pts.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.stroke();
    }
  }, [displaySize.width, setupContext]);

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // Subtracting space for Header (~80px), Hints (~40px), and margins
      const maxH = vh - 200;
      const maxW = Math.min(vw - 32, LOGICAL_W);

      const aspect = LOGICAL_W / LOGICAL_H;
      let w = maxW;
      let h = w / aspect;

      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }

      setDisplaySize({ width: Math.floor(w), height: Math.floor(h) });
    };

    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Sync Redraw on Resize
  useEffect(() => {
    redraw();
  }, [displaySize, redraw]);

  // Handle Incoming WebSocket Messages
  useEffect(() => {
    if (!Array.isArray(lastJsonMessage)) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const [opcode] = lastJsonMessage;

    switch (opcode) {
      case 0: {
        // START_STROKE
        const [, x, y, color, size, tool] = lastJsonMessage;
        currentStroke.current = { tool, color, size, points: [x, y] };
        redoStack.current = [];

        ctx.globalCompositeOperation =
          tool === "eraser" ? "destination-out" : "source-over";
        ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : color;
        ctx.lineWidth = tool === "eraser" ? size * 2.5 : size;

        ctx.beginPath();
        ctx.moveTo(x, y);
        break;
      }

      case 1: {
        // DRAW_STROKE
        const [, points] = lastJsonMessage as unknown as [number, number[]];
        if (!currentStroke.current) return;

        for (let i = 0; i < points.length; i += 2) {
          const px = points[i];
          const py = points[i + 1];
          ctx.lineTo(px, py);
          ctx.stroke();

          // Use a new path for every segment to keep it buttery smooth
          ctx.beginPath();
          ctx.moveTo(px, py);
          currentStroke.current.points.push(px, py);
        }
        break;
      }

      case 2: // END_STROKE
        if (currentStroke.current && currentStroke.current.points.length > 2) {
          strokeHistory.current.push(currentStroke.current);
        }
        currentStroke.current = null;
        break;

      case 3: // UNDO
        strokeHistory.current.pop();
        redraw();
        break;

      case 4: // REDO (If you implement it)
        redraw();
        break;

      case 5: // CLEAR
        strokeHistory.current = [];
        redraw();
        break;
    }
  }, [lastJsonMessage, redraw]);

  return (
    <div className="w-full flex flex-col items-center justify-start p-2 sm:p-4 overflow-hidden">
      <div
        className="rounded-md overflow-hidden bg-[#f5f0e8]"
        style={{
          boxShadow:
            "0 0 0 6px #c9a96e, 0 0 0 10px #8b6914, 0 25px 60px rgba(0,0,0,0.6)",
          width: displaySize.width,
          height: displaySize.height,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
};

export default ClientDrawingBoard;
