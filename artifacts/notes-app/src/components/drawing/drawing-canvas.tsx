import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { DrawOp, DrawTool } from '@/lib/types';

export interface DrawingCanvasHandle {
  undo: () => void;
  clear: () => void;
}

interface Props {
  ops: DrawOp[];
  onOpsChange: (ops: DrawOp[]) => void;
  tool: DrawTool;
  color: string;
  strokeWidth: number;
  active: boolean;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, Props>(
  function DrawingCanvas({ ops, onOpsChange, tool, color, strokeWidth, active }, ref) {
    const canvasRef   = useRef<HTMLCanvasElement>(null);
    const isDrawing   = useRef(false);
    const currentOp   = useRef<DrawOp | null>(null);
    const opsRef      = useRef(ops);
    opsRef.current = ops;

    useImperativeHandle(ref, () => ({
      undo:  () => { if (opsRef.current.length > 0) onOpsChange(opsRef.current.slice(0, -1)); },
      clear: () => onOpsChange([]),
    }));

    const redraw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const op of opsRef.current) renderOp(ctx, op);
      if (currentOp.current) renderOp(ctx, currentOp.current);
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const ro = new ResizeObserver(() => {
        canvas.width  = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        redraw();
      });
      ro.observe(parent);
      canvas.width  = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      return () => ro.disconnect();
    }, [redraw]);

    useEffect(() => { redraw(); }, [ops, redraw]);

    useEffect(() => {
      if (!active) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          if (opsRef.current.length > 0) onOpsChange(opsRef.current.slice(0, -1));
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [active, onOpsChange]);

    const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!active) return;
      e.preventDefault();
      canvasRef.current?.setPointerCapture(e.pointerId);
      isDrawing.current = true;
      const { x, y } = getPos(e);
      const id = crypto.randomUUID();
      switch (tool) {
        case 'pen':       currentOp.current = { id, type: 'pen',       pts: [x, y], color, width: strokeWidth }; break;
        case 'highlight': currentOp.current = { id, type: 'highlight', pts: [x, y], color, width: strokeWidth * 8, opacity: 0.35 }; break;
        case 'eraser':    currentOp.current = { id, type: 'eraser',    pts: [x, y], color: '#000', width: strokeWidth * 5 }; break;
        case 'line':      currentOp.current = { id, type: 'line',  x1: x, y1: y, x2: x, y2: y, color, width: strokeWidth }; break;
        case 'arrow':     currentOp.current = { id, type: 'arrow', x1: x, y1: y, x2: x, y2: y, color, width: strokeWidth }; break;
        case 'rect':      currentOp.current = { id, type: 'rect',    x, y, w: 0, h: 0, color, width: strokeWidth }; break;
        case 'ellipse':   currentOp.current = { id, type: 'ellipse', cx: x, cy: y, rx: 0, ry: 0, color, width: strokeWidth }; break;
      }
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!active || !isDrawing.current || !currentOp.current) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      const op = currentOp.current;
      if (op.type === 'pen' || op.type === 'highlight' || op.type === 'eraser') {
        op.pts.push(x, y);
      } else if (op.type === 'line' || op.type === 'arrow') {
        op.x2 = x; op.y2 = y;
      } else if (op.type === 'rect') {
        op.w = x - op.x; op.h = y - op.y;
      } else if (op.type === 'ellipse') {
        op.rx = Math.abs(x - op.cx); op.ry = Math.abs(y - op.cy);
      }
      redraw();
    };

    const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!active || !isDrawing.current) return;
      isDrawing.current = false;
      const op = currentOp.current;
      if (op) {
        const valid =
          (op.type === 'pen' || op.type === 'highlight' || op.type === 'eraser') ? op.pts.length >= 4 :
          (op.type === 'line' || op.type === 'arrow') ? (Math.abs(op.x2 - op.x1) + Math.abs(op.y2 - op.y1)) > 3 :
          (op.type === 'rect') ? (Math.abs(op.w) + Math.abs(op.h)) > 4 :
          (op.type === 'ellipse') ? (op.rx + op.ry) > 4 : true;
        if (valid) onOpsChange([...opsRef.current, { ...op }]);
        currentOp.current = null;
        redraw();
      }
    };

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: active ? 50 : -1,
          pointerEvents: active ? 'all' : 'none',
          cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          touchAction: 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    );
  }
);

function renderOp(ctx: CanvasRenderingContext2D, op: DrawOp) {
  ctx.save();
  ctx.lineCap   = 'round';
  ctx.lineJoin  = 'round';
  ctx.globalAlpha = op.opacity ?? 1;

  if (op.type === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth   = op.width;
    if (op.pts.length >= 4) {
      ctx.beginPath();
      ctx.moveTo(op.pts[0], op.pts[1]);
      for (let i = 2; i < op.pts.length; i += 2) ctx.lineTo(op.pts[i], op.pts[i + 1]);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  ctx.strokeStyle = op.color;
  ctx.lineWidth   = op.width;

  switch (op.type) {
    case 'pen':
    case 'highlight': {
      if (op.pts.length < 4) break;
      ctx.beginPath();
      ctx.moveTo(op.pts[0], op.pts[1]);
      for (let i = 2; i < op.pts.length; i += 2) ctx.lineTo(op.pts[i], op.pts[i + 1]);
      ctx.stroke();
      break;
    }
    case 'line': {
      ctx.beginPath();
      ctx.moveTo(op.x1, op.y1);
      ctx.lineTo(op.x2, op.y2);
      ctx.stroke();
      break;
    }
    case 'rect': {
      if (op.fill) { ctx.fillStyle = op.fill; ctx.fillRect(op.x, op.y, op.w, op.h); }
      ctx.strokeRect(op.x, op.y, op.w, op.h);
      break;
    }
    case 'ellipse': {
      if (op.rx < 1 || op.ry < 1) break;
      ctx.beginPath();
      ctx.ellipse(op.cx, op.cy, op.rx, op.ry, 0, 0, Math.PI * 2);
      if (op.fill) { ctx.fillStyle = op.fill; ctx.fill(); }
      ctx.stroke();
      break;
    }
    case 'arrow': {
      const dx = op.x2 - op.x1, dy = op.y2 - op.y1;
      const len = Math.hypot(dx, dy);
      if (len < 3) break;
      ctx.beginPath();
      ctx.moveTo(op.x1, op.y1);
      ctx.lineTo(op.x2, op.y2);
      ctx.stroke();
      const ang = Math.atan2(dy, dx);
      const ah  = Math.min(22, len * 0.38) + op.width * 1.5;
      const sp  = Math.PI / 6;
      ctx.beginPath();
      ctx.moveTo(op.x2, op.y2);
      ctx.lineTo(op.x2 - ah * Math.cos(ang - sp), op.y2 - ah * Math.sin(ang - sp));
      ctx.lineTo(op.x2 - ah * Math.cos(ang + sp), op.y2 - ah * Math.sin(ang + sp));
      ctx.closePath();
      ctx.fillStyle = op.color;
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}
