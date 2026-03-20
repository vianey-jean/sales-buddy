import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DrawingCanvasProps {
  initialData?: string | null;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ initialData, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 600;
    canvas.height = 400;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 400);
    if (initialData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = initialData;
    }
  }, [initialData]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 400);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0" />
        <input type="range" min="1" max="10" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))} className="w-24 accent-cyan-500" />
        <Button variant="outline" size="sm" onClick={clearCanvas} className="rounded-xl text-xs">Effacer</Button>
        <div className="flex-1" />
        <Button size="sm" onClick={() => onSave(canvasRef.current!.toDataURL('image/jpeg', 0.9))} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs">
          <Check className="h-3.5 w-3.5 mr-1" /> Sauvegarder
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl"><X className="h-4 w-4" /></Button>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl cursor-crosshair touch-none shadow-inner"
        style={{ aspectRatio: '3/2' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
    </div>
  );
};

export default DrawingCanvas;
