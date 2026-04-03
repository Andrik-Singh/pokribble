import { useRef, useEffect, useState } from "react";

export default function Canvas404() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  let hue = 0;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
  }, []);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
    setDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    hue += 1;
    ctx.strokeStyle = `hsl(${hue},100%,50%)`;
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
  };

  const endDraw = () => {
    setDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-100 via-orange-50 to-amber-100 overflow-hidden text-green-400 font-mono">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pointer-events-none">
        <h1 className="text-6xl md:text-9xl font-bold tracking-widest drop-shadow-[0_0_10px_#00ff88] animate-pulse">
          404
        </h1>

        <p className="mt-4 text-lg md:text-2xl text-green-300">
          ROOM NOT FOUND
        </p>

        <p className="text-green-500 mt-2 text-sm">
          This room doesn’t exist… draw something instead.
        </p>
        <div className="mt-8 flex gap-4 pointer-events-auto">
          <a
            href="/"
            className="px-5 py-2 border-2 border-green-400 bg-green-400 text-black font-bold shadow-[4px_4px_0px_#008f5a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition"
          >
            HOME
          </a>

          <button
            onClick={clearCanvas}
            className="px-5 py-2 border-2 border-green-400 shadow-[4px_4px_0px_#008f5a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition"
          >
            CLEAR
          </button>
        </div>
      </div>
    </div>
  );
}
