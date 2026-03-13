import { useEffect, useRef, useCallback, useState } from "react";

type Stroke = {
  tool: "pen" | "eraser";
  color: string;
  size: number;
  points: number[];
};

const ClientDrawingBoard = ({ lastJsonMessage }: { lastJsonMessage: any }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokeHistory = useRef<Stroke[]>([]);
  const redoStack = useRef<Stroke[]>([]);
  const currentStroke = useRef<Stroke | null>(null);
  const scaleRef = useRef(1);
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 520 });

  const getCtx = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return null;
    return ctx;
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokeHistory.current) {
      ctx.globalCompositeOperation =
        stroke.tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle =
        stroke.tool === "eraser" ? "rgba(0,0,0,1)" : stroke.color;
      ctx.lineWidth =
        stroke.tool === "eraser" ? stroke.size * 2.5 : stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const pts = stroke.points;
      if (pts.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.stroke();
    }
    ctx.beginPath();
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const padding = 32;
      const maxW = Math.min(window.innerWidth - padding, 900);
      const maxH = window.innerHeight - padding;

      const aspect = 900 / 520;
      let w = maxW;
      let h = w / aspect;
      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }

      scaleRef.current = w / 900;
      setCanvasSize({ width: Math.floor(w), height: Math.floor(h) });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    redraw();
  }, [canvasSize, redraw]);

  useEffect(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (!Array.isArray(lastJsonMessage)) return;
    const ctx = getCtx();
    if (!ctx) return;

    const s = scaleRef.current;
    const [opcode] = lastJsonMessage;

    if (opcode === 0) {
      const [, x, y, color, size, tool] = lastJsonMessage as [
        number,
        number,
        number,
        string,
        number,
        "pen" | "eraser",
      ];
      currentStroke.current = { tool, color, size, points: [x, y] };
      redoStack.current = [];
      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : color;
      ctx.lineWidth = (tool === "eraser" ? size * 2.5 : size) * s;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(x * s, y * s);
    } else if (opcode === 1) {
      const [, points, color, size, tool] = lastJsonMessage as [
        number,
        number[],
        string,
        number,
        "pen" | "eraser",
      ];
      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : color;
      ctx.lineWidth = (tool === "eraser" ? size * 2.5 : size) * s;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < points.length; i += 2) {
        ctx.lineTo(points[i] * s, points[i + 1] * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(points[i] * s, points[i + 1] * s);
        currentStroke.current?.points.push(points[i], points[i + 1]);
      }
    } else if (opcode === 2) {
      ctx.beginPath();
      if (currentStroke.current && currentStroke.current.points.length > 2)
        strokeHistory.current.push(currentStroke.current);
      currentStroke.current = null;
    } else if (opcode === 3) {
      const last = strokeHistory.current.pop();
      if (!last) return;
      redoStack.current.push(last);
      redraw();
    } else if (opcode === 4) {
      const next = redoStack.current.pop();
      if (!next) return;
      strokeHistory.current.push(next);
      redraw();
    } else if (opcode === 5) {
      strokeHistory.current = [];
      redoStack.current = [];
      redraw();
    }
  }, [lastJsonMessage, redraw]);

  return (
    <div className="bg-[#1a1a2e] min-h-screen w-full flex items-center justify-center p-4">
      <div
        className="rounded-md overflow-hidden"
        style={{
          boxShadow:
            "0 0 0 6px #c9a96e, 0 0 0 10px #8b6914, 0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ display: "block", background: "#f5f0e8" }}
        />
      </div>
    </div>
  );
};

export default ClientDrawingBoard;
