import { useEffect, useRef, useCallback, useState } from "react";
import throttle from "lodash.throttle";

type Stroke = {
  tool: "pen" | "eraser";
  color: string;
  size: number;
  points: number[];
};

const COLORS = [
  ["#1a1a2e", "#16213e", "#0f3460", "#533483"],
  ["#e63946", "#f4a261", "#2a9d8f", "#457b9d"],
  ["#06d6a0", "#ffd166", "#ef476f", "#118ab2"],
  ["#ffffff", "#aaaaaa", "#555555", "#000000"],
];

const DrawingBoard = ({
  sendJsonMessage,
}: {
  sendJsonMessage: (msg: any) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawing = useRef(false);
  const toolbar = useRef({
    color: "#1a1a2e",
    size: 5,
    tool: "pen" as "pen" | "eraser",
  });
  const moveBuffer = useRef<number[]>([]);
  const strokeHistory = useRef<Stroke[]>([]);
  const redoStack = useRef<Stroke[]>([]);
  const currentStroke = useRef<Stroke | null>(null);
  const LOGICAL_W = 900;
  const LOGICAL_H = 520;
  const [displaySize, setDisplaySize] = useState({ width: 900, height: 520 });
  const scaleRef = useRef(1);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
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

  // Redraw when display size changes (content is preserved because logical canvas size never changes)
  useEffect(() => {
    redraw();
  }, [displaySize, redraw]);

  const undo = useCallback(() => {
    if (strokeHistory.current.length === 0) return;
    redoStack.current.push(strokeHistory.current.pop()!);
    redraw();
    sendJsonMessage([3]);
  }, [redraw, sendJsonMessage]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    strokeHistory.current.push(redoStack.current.pop()!);
    redraw();
    sendJsonMessage([4]);
  }, [redraw, sendJsonMessage]);

  const clearCanvas = useCallback(() => {
    strokeHistory.current = [];
    redoStack.current = [];
    redraw();
    sendJsonMessage([5]);
  }, [redraw, sendJsonMessage]);

  const throttledFlush = useRef(
    throttle(() => {
      if (moveBuffer.current.length === 0) return;
      sendJsonMessage([
        1,
        [...moveBuffer.current],
        toolbar.current.color,
        toolbar.current.size,
        toolbar.current.tool,
      ]);
      moveBuffer.current = [];
    }, 32),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = LOGICAL_W * dpr;
    canvas.height = LOGICAL_H * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    const getPos = (e: MouseEvent | Touch, rect: DOMRect): [number, number] => {
      const clientX = e.clientX;
      const clientY = e.clientY;
      const s = scaleRef.current;
      return [
        Math.round((clientX - rect.left) / s),
        Math.round((clientY - rect.top) / s),
      ];
    };

    const startDraw = (x: number, y: number) => {
      isDrawing.current = true;
      redoStack.current = [];
      currentStroke.current = {
        tool: toolbar.current.tool,
        color: toolbar.current.color,
        size: toolbar.current.size,
        points: [x, y],
      };
      ctx.globalCompositeOperation =
        toolbar.current.tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle =
        toolbar.current.tool === "eraser"
          ? "rgba(0,0,0,1)"
          : toolbar.current.color;
      ctx.lineWidth =
        toolbar.current.tool === "eraser"
          ? toolbar.current.size * 2.5
          : toolbar.current.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      sendJsonMessage([
        0,
        x,
        y,
        toolbar.current.color,
        toolbar.current.size,
        toolbar.current.tool,
      ]);
    };

    const moveDraw = (x: number, y: number) => {
      if (!isDrawing.current) return;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      moveBuffer.current.push(x, y);
      currentStroke.current?.points.push(x, y);
      throttledFlush.current();
    };

    const endDraw = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      throttledFlush.current.flush();
      ctx.beginPath();
      if (currentStroke.current && currentStroke.current.points.length > 2) {
        strokeHistory.current.push(currentStroke.current);
      }
      currentStroke.current = null;
      sendJsonMessage([2]);
    };

    const handleMouseDown = (e: MouseEvent) =>
      startDraw(...getPos(e, canvas.getBoundingClientRect()));
    const handleMouseMove = (e: MouseEvent) =>
      moveDraw(...getPos(e, canvas.getBoundingClientRect()));
    const handleMouseUp = () => endDraw();
    const handleMouseLeave = () => {
      if (isDrawing.current) endDraw();
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      startDraw(...getPos(e.touches[0], canvas.getBoundingClientRect()));
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      moveDraw(...getPos(e.touches[0], canvas.getBoundingClientRect()));
    };
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      endDraw();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      throttledFlush.current.cancel();
    };
  }, [undo, redo, sendJsonMessage]);

  const btnCls =
    "w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/20 bg-white/8 text-white cursor-pointer text-base flex items-center justify-center hover:bg-white/15 transition-colors";
  const divider = <div className="w-px h-7 bg-white/10 mx-0.5" />;
  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth;
      const toolbarH = toolbarRef.current?.offsetHeight ?? 80;
      const hintH = 28;
      const padding = 32;

      const maxW = Math.min(vw - 16, LOGICAL_W);
      const maxH = window.innerHeight - toolbarH - hintH - padding;

      const aspect = LOGICAL_W / LOGICAL_H;
      let w = maxW;
      let h = w / aspect;
      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }

      scaleRef.current = w / LOGICAL_W;
      setDisplaySize({ width: Math.floor(w), height: Math.floor(h) });
    };

    // Wait for toolbar to render before measuring
    const ro = new ResizeObserver(updateSize);
    if (toolbarRef.current) ro.observe(toolbarRef.current);
    window.addEventListener("resize", updateSize);
    updateSize();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);
  return (
    <div className="bg-white w-full flex flex-col items-center  gap-3 sm:gap-4 p-2 sm:p-6 font-[Nunito,sans-serif] overflow-hidden">
      {/* Toolbar */}

      {/* Canvas */}
      <div
        ref={containerRef}
        style={{
          boxShadow:
            "0 0 0 6px #c9a96e, 0 0 0 10px #8b6914, 0 20px 50px rgba(0,0,0,0.6)",
        }}
        className="rounded-md overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          width={LOGICAL_W}
          height={LOGICAL_H}
          style={{
            display: "block",
            width: displaySize.width,
            height: displaySize.height,
            background: "#f5f0e8",
            cursor: "crosshair",
            touchAction: "none",
          }}
        />
      </div>
      <div
        ref={toolbarRef}
        className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 bg-black border border-white/10 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-2.5 backdrop-blur-md w-full max-w-3xl"
      >
        {/* Tools */}
        {(["pen", "eraser"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              toolbar.current.tool = t;
            }}
            className={btnCls}
            title={t}
          >
            {t === "pen" ? "✏️" : "🧹"}
          </button>
        ))}

        {divider}

        {/* Undo / Redo / Clear */}
        <button onClick={undo} title="Undo (Ctrl+Z)" className={btnCls}>
          ↩️
        </button>
        <button onClick={redo} title="Redo (Ctrl+Shift+Z)" className={btnCls}>
          ↪️
        </button>
        <button
          onClick={clearCanvas}
          title="Clear"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 cursor-pointer text-sm font-bold flex items-center justify-center hover:bg-red-500/20 transition-colors"
        >
          ✕
        </button>

        {divider}

        {/* Brush size */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest hidden sm:block">
            Size
          </span>
          <input
            type="range"
            min={1}
            max={40}
            defaultValue={5}
            onChange={(e) => {
              toolbar.current.size = Number(e.target.value);
            }}
            className="w-16 sm:w-24 cursor-pointer accent-white"
          />
        </div>

        {divider}

        {/* Color palette */}
        <div className="flex gap-3">
          {[COLORS.slice(0, 2), COLORS.slice(2)].map((group, gi) => (
            <div key={gi} className="flex flex-col gap-1">
              {group.map((row, ri) => (
                <div key={ri} className="flex gap-1">
                  {row.map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        toolbar.current.color = c;
                        toolbar.current.tool = "pen";
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          toolbar.current.color = c;
                          toolbar.current.tool = "pen";
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select color ${c}`}
                      style={{ background: c }}
                      className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full border-2 border-white/25 cursor-pointer transition-transform hover:scale-125 shrink-0"
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-black/20 text-[10px] tracking-widest hidden sm:block">
        CTRL+Z · CTRL+SHIFT+Z to undo / redo
      </p>
    </div>
  );
};

export default DrawingBoard;
