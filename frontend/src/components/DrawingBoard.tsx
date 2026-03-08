import { useEffect, useRef } from "react";

const DrawingBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.fillRect(0, 0, window.innerWidth - 30, window.innerHeight - 30);
  });
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="border border-gray-300 bg-white"
    ></canvas>
  );
};

export default DrawingBoard;
