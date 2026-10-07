import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  Eraser,
  Paintbrush,
  Move,
  Sparkles,
} from 'lucide-react';
import {
  BackgroundConfig,
  DropShadowConfig,
  ContactShadowConfig,
  OutlineConfig,
  ViewMode,
  TouchUpMode,
} from '../types';
import { STUDIO_BACKGROUND_PRESETS } from '../data/backgroundPresets';

interface InteractiveCanvasProps {
  originalImage: HTMLImageElement | null;
  cutoutCanvas: HTMLCanvasElement | null;
  maskCanvas: HTMLCanvasElement | null;
  background: BackgroundConfig;
  dropShadow: DropShadowConfig;
  contactShadow: ContactShadowConfig;
  outline: OutlineConfig;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isTouchUpActive: boolean;
  touchUpMode: TouchUpMode;
  brushSize: number;
  brushHardness: number;
  onMaskUpdated: () => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  originalImage,
  cutoutCanvas,
  maskCanvas,
  background,
  dropShadow,
  contactShadow,
  outline,
  viewMode,
  onViewModeChange,
  isTouchUpActive,
  touchUpMode,
  brushSize,
  brushHardness,
  onMaskUpdated,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchCanvasRef = useRef<HTMLCanvasElement>(null);

  // Split slider position (0 to 100 percent)
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Zoom and Pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hold to view original
  const [isHoldingOriginal, setIsHoldingOriginal] = useState<boolean>(false);

  // Touch-up painting state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // Calculate natural aspect ratio
  const imgWidth = originalImage?.naturalWidth || cutoutCanvas?.width || 800;
  const imgHeight = originalImage?.naturalHeight || cutoutCanvas?.height || 600;
  const aspectRatio = imgWidth / imgHeight;

  // Split dragging handlers
  const handleSplitMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSplitPos(pct);
    },
    []
  );

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDraggingSplit(false);
      setIsPanning(false);
      setIsDrawing(false);
      setLastPoint(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSplit) {
        handleSplitMove(e.clientX);
      } else if (isPanning) {
        setPan((prev) => ({
          x: prev.x + (e.clientX - panStart.x),
          y: prev.y + (e.clientY - panStart.y),
        }));
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingSplit && e.touches.length > 0) {
        handleSplitMove(e.touches[0].clientX);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDraggingSplit, isPanning, panStart, handleSplitMove]);

  // Touch-Up painting logic
  const handleTouchUpMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isTouchUpActive || !cutoutCanvas || !originalImage) return;
    const canvas = touchCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = cutoutCanvas.width / rect.width;
    const scaleY = cutoutCanvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setLastPoint({ x, y });
    applyTouchUpStroke(x, y, x, y);
  };

  const handleTouchUpMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = touchCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });

    if (!isDrawing || !isTouchUpActive || !cutoutCanvas || !originalImage || !lastPoint) {
      return;
    }

    const scaleX = cutoutCanvas.width / rect.width;
    const scaleY = cutoutCanvas.height / rect.height;

    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    applyTouchUpStroke(lastPoint.x, lastPoint.y, currentX, currentY);
    setLastPoint({ x: currentX, y: currentY });
  };

  const applyTouchUpStroke = (x1: number, y1: number, x2: number, y2: number) => {
    if (!cutoutCanvas || !originalImage) return;
    const ctx = cutoutCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (touchUpMode === 'erase') {
      // Erasing from cutout
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else {
      // Restoring from original image
      // Create offscreen brush path mask
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = cutoutCanvas.width;
      tempCanvas.height = cutoutCanvas.height;
      const tempCtx = tempCanvas.getContext('2d')!;

      tempCtx.lineCap = 'round';
      tempCtx.lineJoin = 'round';
      tempCtx.lineWidth = brushSize;
      tempCtx.beginPath();
      tempCtx.moveTo(x1, y1);
      tempCtx.lineTo(x2, y2);
      tempCtx.stroke();

      // Clip original image by stroke and draw onto cutout
      tempCtx.globalCompositeOperation = 'source-in';
      tempCtx.drawImage(originalImage, 0, 0, cutoutCanvas.width, cutoutCanvas.height);

      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(tempCanvas, 0, 0);
    }
    ctx.restore();

    onMaskUpdated();
  };

  // Helper to get CSS style for custom background
  const getBackgroundStyle = (): React.CSSProperties => {
    if (background.mode === 'color') {
      return { backgroundColor: background.color };
    }
    if (background.mode === 'gradient') {
      return { background: background.gradient };
    }
    if (background.mode === 'preset') {
      const preset = STUDIO_BACKGROUND_PRESETS.find((p) => p.id === background.presetId);
      if (preset) {
        return {
          backgroundImage: `url(${preset.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
    }
    if (background.mode === 'custom' && background.customImageUrl) {
      return {
        backgroundImage: `url(${background.customImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (background.mode === 'blur_original' && originalImage) {
      return {
        backgroundImage: `url(${originalImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: `blur(${background.blurAmount}px)`,
        transform: 'scale(1.08)',
      };
    }
    return {}; // Transparent checkered
  };

  // Shadow styling for the cutout image
  const getSubjectFilter = (): string => {
    const filters: string[] = [];
    if (dropShadow.enabled) {
      filters.push(
        `drop-shadow(${dropShadow.offsetX}px ${dropShadow.offsetY}px ${dropShadow.blur}px rgba(0, 0, 0, ${dropShadow.opacity}))`
      );
    }
    if (outline.enabled && outline.width > 0) {
      // Outline glow via multiple tight drop-shadows
      const w = outline.width;
      const c = outline.color;
      filters.push(`drop-shadow(0 0 ${w}px ${c}) drop-shadow(0 0 ${Math.max(1, w / 2)}px ${c})`);
    }
    return filters.join(' ');
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/80 shadow-inner dark:border-slate-800 dark:bg-slate-950/60">
      {/* Top Floating View Controls */}
      <div className="z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-3 py-2 text-xs backdrop-blur-md sm:px-4 dark:border-slate-800 dark:bg-slate-900/90">
        {/* Mode Selector Tabs */}
        <div className="flex items-center space-x-1 rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800">
          <button
            onClick={() => onViewModeChange('split')}
            className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-indigo-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Before / After</span>
          </button>
          <button
            onClick={() => onViewModeChange('cutout')}
            className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 font-medium transition-all ${
              viewMode === 'cutout'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-indigo-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Cutout Only</span>
          </button>
          <button
            onClick={() => onViewModeChange('side_by_side')}
            className={`hidden items-center space-x-1 rounded-lg px-2.5 py-1 font-medium transition-all sm:flex ${
              viewMode === 'side_by_side'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-indigo-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Side by Side</span>
          </button>
        </div>

        {/* View Actions: Hold to Compare & Zoom */}
        <div className="flex items-center space-x-2">
          {viewMode !== 'split' && (
            <button
              onMouseDown={() => setIsHoldingOriginal(true)}
              onMouseUp={() => setIsHoldingOriginal(false)}
              onTouchStart={() => setIsHoldingOriginal(true)}
              onTouchEnd={() => setIsHoldingOriginal(false)}
              className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700 select-none hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title="Hold to see original photo"
            >
              <Eye className="h-3.5 w-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Hold Original</span>
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-1 py-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden p-4 select-none sm:p-6"
        style={{
          cursor: isPanning ? 'grabbing' : isTouchUpActive ? 'crosshair' : 'default',
        }}
      >
        {/* Zoom & Pan Wrapper */}
        <div
          className="relative max-h-full max-w-full transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {viewMode === 'side_by_side' ? (
            /* Side by Side Mode */
            <div className="grid grid-cols-2 gap-4">
              {/* Original */}
              <div className="flex flex-col items-center">
                <span className="mb-2 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                  Original Photo
                </span>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800">
                  <img
                    src={originalImage?.src}
                    alt="Original"
                    className="max-h-[60vh] max-w-full object-contain"
                  />
                </div>
              </div>
              {/* Cutout */}
              <div className="flex flex-col items-center">
                <span className="mb-2 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                  AI Cutout
                </span>
                <div
                  className={`overflow-hidden rounded-xl border border-slate-200 shadow-lg dark:border-slate-800 ${
                    background.mode === 'transparent' ? 'bg-checkered' : ''
                  }`}
                  style={getBackgroundStyle()}
                >
                  <img
                    src={cutoutCanvas?.toDataURL() || originalImage?.src}
                    alt="Cutout"
                    className="max-h-[60vh] max-w-full object-contain"
                    style={{ filter: getSubjectFilter() }}
                  />
                </div>
              </div>
            </div>
          ) : viewMode === 'split' ? (
            /* Interactive Before/After Split Slider */
            <div
              className={`relative overflow-hidden rounded-xl border border-slate-300 shadow-2xl dark:border-slate-700 ${
                background.mode === 'transparent' ? 'bg-checkered' : ''
              }`}
              style={{
                ...getBackgroundStyle(),
                maxWidth: '85vw',
                maxHeight: '68vh',
              }}
            >
              {/* Contact Shadow on Floor */}
              {contactShadow.enabled && (
                <div
                  className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 transform rounded-full"
                  style={{
                    width: `${contactShadow.size * 70}%`,
                    height: '30px',
                    marginBottom: `${contactShadow.offsetY}px`,
                    background: `radial-gradient(ellipse at center, rgba(0,0,0,${
                      contactShadow.opacity * 0.7
                    }) 0%, rgba(0,0,0,0) 70%)`,
                  }}
                />
              )}

              {/* Layer 1: Cutout with chosen background */}
              <img
                src={cutoutCanvas?.toDataURL() || originalImage?.src}
                alt="Cutout"
                className="pointer-events-none block max-h-[68vh] max-w-full object-contain"
                style={{ filter: getSubjectFilter() }}
              />

              {/* Layer 2: Original Image clipped by split percentage */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(0 ${100 - splitPos}% 0 0)`,
                }}
              >
                <img
                  src={originalImage?.src}
                  alt="Original"
                  className="pointer-events-none block h-full w-full object-contain"
                />
              </div>

              {/* Draggable Divider Handle */}
              <div
                className="absolute top-0 bottom-0 z-30 flex w-1 cursor-ew-resize items-center justify-center bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)] transition-shadow hover:shadow-[0_0_16px_rgba(99,102,241,0.8)]"
                style={{ left: `${splitPos}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingSplit(true);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsDraggingSplit(true);
                }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
              </div>

              {/* Floating Labels */}
              <span className="pointer-events-none absolute top-3 left-3 z-20 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                Original
              </span>
              <span className="pointer-events-none absolute top-3 right-3 z-20 rounded-md bg-indigo-600/90 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
                Cutout
              </span>
            </div>
          ) : (
            /* Cutout Only View */
            <div
              className={`relative overflow-hidden rounded-xl border border-slate-300 shadow-2xl dark:border-slate-700 ${
                background.mode === 'transparent' ? 'bg-checkered' : ''
              }`}
              style={{
                ...getBackgroundStyle(),
                maxWidth: '85vw',
                maxHeight: '68vh',
              }}
            >
              {/* Product Floor Contact Shadow */}
              {contactShadow.enabled && (
                <div
                  className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 transform rounded-full"
                  style={{
                    width: `${contactShadow.size * 70}%`,
                    height: '30px',
                    marginBottom: `${contactShadow.offsetY}px`,
                    background: `radial-gradient(ellipse at center, rgba(0,0,0,${
                      contactShadow.opacity * 0.7
                    }) 0%, rgba(0,0,0,0) 70%)`,
                  }}
                />
              )}

              {/* Hold Original or Cutout */}
              {isHoldingOriginal ? (
                <img
                  src={originalImage?.src}
                  alt="Original"
                  className="block max-h-[68vh] max-w-full object-contain"
                />
              ) : (
                <div className="relative">
                  <img
                    src={cutoutCanvas?.toDataURL() || originalImage?.src}
                    alt="Cutout"
                    className="block max-h-[68vh] max-w-full object-contain"
                    style={{ filter: getSubjectFilter() }}
                  />

                  {/* Touch-Up Interactive Canvas Overlay */}
                  {isTouchUpActive && cutoutCanvas && (
                    <canvas
                      ref={touchCanvasRef}
                      width={cutoutCanvas.width}
                      height={cutoutCanvas.height}
                      onMouseDown={handleTouchUpMouseDown}
                      onMouseMove={handleTouchUpMouseMove}
                      onMouseLeave={() => setCursorPos((p) => ({ ...p, visible: false }))}
                      className="absolute inset-0 h-full w-full cursor-crosshair"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Touch-Up Brush Cursor Ring */}
        {isTouchUpActive && cursorPos.visible && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-500 bg-indigo-500/20 shadow-xs"
            style={{
              left: cursorPos.x + (containerRef.current?.getBoundingClientRect().left || 0),
              top: cursorPos.y + (containerRef.current?.getBoundingClientRect().top || 0),
              width: `${brushSize}px`,
              height: `${brushSize}px`,
            }}
          />
        )}
      </div>

      {/* Touch-Up Active Indicator Pill */}
      {isTouchUpActive && (
        <div className="z-20 flex items-center justify-between border-t border-indigo-100 bg-indigo-50/90 px-4 py-2 text-xs font-semibold text-indigo-900 backdrop-blur-xs dark:border-indigo-900/60 dark:bg-indigo-950/80 dark:text-indigo-200">
          <div className="flex items-center space-x-2">
            {touchUpMode === 'erase' ? (
              <Eraser className="h-4 w-4 text-red-500" />
            ) : (
              <Paintbrush className="h-4 w-4 text-indigo-500" />
            )}
            <span>
              Touch-Up Mode Active:{' '}
              <strong className="underline">
                {touchUpMode === 'erase' ? 'Erasing Background' : 'Restoring Subject'}
              </strong>{' '}
              (Brush: {brushSize}px)
            </span>
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
            Paint directly on the image above
          </span>
        </div>
      )}
    </div>
  );
};
