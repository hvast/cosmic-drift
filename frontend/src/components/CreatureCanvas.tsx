import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

interface CreatureCanvasProps {
  onExport: (imageData: string) => void;
  onDrawingChange?: () => void; // 绘制变化回调
  initialImage?: string; // 初始图片数据
  width?: number;
  height?: number;
}

const CreatureCanvas: React.FC<CreatureCanvasProps> = ({
  onExport,
  onDrawingChange,
  initialImage,
  width = 600,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width,
      height,
      backgroundColor: '#ffffff',
    });

    fabricCanvas.freeDrawingBrush.color = brushColor;
    fabricCanvas.freeDrawingBrush.width = brushSize;

    setCanvas(fabricCanvas);

    // 如果有初始图片，加载它
    if (initialImage) {
      fabric.Image.fromURL(initialImage, (img) => {
        if (img && fabricCanvas) {
          // 缩放图片以适应画布
          const scale = Math.min(width / (img.width || 1), height / (img.height || 1));
          img.scale(scale);
          img.set({
            left: (width - (img.width || 0) * scale) / 2,
            top: (height - (img.height || 0) * scale) / 2,
            selectable: false,
            evented: false,
          });
          fabricCanvas.add(img);
          fabricCanvas.sendToBack(img);
          fabricCanvas.renderAll();
          setHasDrawn(true);
        }
      });
    }

    return () => {
      fabricCanvas.dispose();
    };
  }, [width, height, brushColor, brushSize]);

  // Update brush color
  useEffect(() => {
    if (!canvas) return;
    if (!isEraser) {
      canvas.freeDrawingBrush.color = brushColor;
    }
  }, [canvas, brushColor, isEraser]);

  // Update brush size
  useEffect(() => {
    if (!canvas) return;
    canvas.freeDrawingBrush.width = brushSize;
  }, [canvas, brushSize]);

  // 监听绘制事件，标记已绘制和未保存
  useEffect(() => {
    if (!canvas) return;

    const handlePathCreated = () => {
      setHasDrawn(true);
      // 通知父组件有未保存的更改
      if (onDrawingChange) {
        onDrawingChange();
      }
    };

    canvas.on('path:created', handlePathCreated);

    return () => {
      canvas.off('path:created', handlePathCreated);
    };
  }, [canvas, onDrawingChange]);

  // Toggle eraser mode
  useEffect(() => {
    if (!canvas) return;
    if (isEraser) {
      canvas.freeDrawingBrush.color = '#ffffff';
    } else {
      canvas.freeDrawingBrush.color = brushColor;
    }
  }, [canvas, isEraser, brushColor]);

  const handleClear = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
    setHasDrawn(false);
  };

  const handleExport = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    onExport(dataURL);
  };

  const handleUndo = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  };

  const toggleEraser = () => {
    setIsEraser(!isEraser);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setBrushColor(newColor);
    if (!isEraser) {
      setIsEraser(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-center bg-gray-100 p-4 rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">颜色:</label>
          <input
            type="color"
            value={brushColor}
            onChange={handleColorChange}
            disabled={isEraser}
            className="w-12 h-8 rounded cursor-pointer border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="选择画笔颜色"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">笔刷大小:</label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-32"
            title="调整笔刷大小"
          />
          <span className="text-sm w-8 text-gray-600">{brushSize}px</span>
        </div>

        <button
          onClick={toggleEraser}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isEraser
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
          title={isEraser ? '切换到画笔' : '切换到橡皮擦'}
        >
          {isEraser ? '画笔' : '橡皮擦'}
        </button>

        <button
          onClick={handleUndo}
          className="px-4 py-2 bg-yellow-500 text-white rounded font-medium hover:bg-yellow-600 transition-colors"
          title="撤销上一步"
        >
          撤销
        </button>

        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition-colors"
          title="清空画布"
        >
          清空画布
        </button>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600 transition-colors"
          title="导出为PNG图片"
        >
          导出图片
        </button>
      </div>

      <div className="border-4 border-gray-300 rounded-lg shadow-lg bg-white">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default CreatureCanvas;
