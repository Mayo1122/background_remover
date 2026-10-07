/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { SidebarControls } from './components/SidebarControls';
import { ExportBar } from './components/ExportBar';
import {
  PhotoData,
  BackgroundConfig,
  DropShadowConfig,
  ContactShadowConfig,
  OutlineConfig,
  ActiveTab,
  ViewMode,
  TouchUpMode,
  GeminiInsights,
  SampleImage,
} from './types';
import {
  loadImage,
  removeBackgroundSmart,
  renderCompositeToCanvas,
  downloadBlob,
  copyCanvasToClipboard,
} from './utils/backgroundRemoval';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  const [photo, setPhoto] = useState<PhotoData | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [cutoutCanvas, setCutoutCanvas] = useState<HTMLCanvasElement | null>(null);
  const [initialCutoutCanvas, setInitialCutoutCanvas] = useState<HTMLCanvasElement | null>(null);
  const [maskVersion, setMaskVersion] = useState<number>(0);

  // Studio configuration
  const [background, setBackground] = useState<BackgroundConfig>({
    mode: 'transparent',
    color: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    presetId: 'studio-podium',
    customImageUrl: null,
    blurAmount: 14,
  });

  const [dropShadow, setDropShadow] = useState<DropShadowConfig>({
    enabled: false,
    color: '#000000',
    blur: 24,
    offsetX: 0,
    offsetY: 14,
    opacity: 0.35,
  });

  const [contactShadow, setContactShadow] = useState<ContactShadowConfig>({
    enabled: false,
    opacity: 0.6,
    size: 0.75,
    offsetY: 0,
  });

  const [outline, setOutline] = useState<OutlineConfig>({
    enabled: false,
    color: '#FFFFFF',
    width: 6,
  });

  // UI Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('background');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [autoTrim, setAutoTrim] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Touch-Up tool state
  const [touchUpMode, setTouchUpMode] = useState<TouchUpMode>('erase');
  const [brushSize, setBrushSize] = useState<number>(24);
  const [brushHardness, setBrushHardness] = useState<number>(80);

  // Gemini Subject Analysis
  const [insights, setInsights] = useState<GeminiInsights | null>(null);

  // Helper to downscale image thumbnail for Gemini API
  const getThumbnailBase64 = (img: HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    const maxDim = 512;
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, w, h);
    }
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Fetch subject insights from server-side Gemini endpoint
  const analyzeSubjectWithGemini = async (img: HTMLImageElement) => {
    try {
      const base64 = getThumbnailBase64(img);
      const res = await fetch('/api/analyze-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInsights(data);
        // If product/footwear is detected, intelligently enable realistic contact shadow!
        if (
          data.isECommerceReady ||
          data.category?.toLowerCase().includes('footwear') ||
          data.category?.toLowerCase().includes('product')
        ) {
          setContactShadow((s) => ({ ...s, enabled: true }));
        }
      }
    } catch (e) {
      console.warn('Gemini subject analysis skipped or offline:', e);
    }
  };

  // Process image source through AI background removal
  const processImage = async (
    source: File | Blob | string,
    filename: string
  ) => {
    // 1. Create temporary object URL to render original image
    let origUrl: string;
    let inputBlob: Blob;
    if (typeof source === 'string') {
      const res = await fetch(source);
      inputBlob = await res.blob();
      origUrl = URL.createObjectURL(inputBlob);
    } else {
      inputBlob = source;
      origUrl = URL.createObjectURL(source);
    }

    try {
      const loadedImg = await loadImage(origUrl);
      setOriginalImage(loadedImg);

      setPhoto({
        id: Math.random().toString(36).substring(7),
        name: filename,
        originalUrl: origUrl,
        originalWidth: loadedImg.naturalWidth,
        originalHeight: loadedImg.naturalHeight,
        cutoutUrl: null,
        cutoutBlob: null,
        maskCanvas: null,
        aspectRatio: loadedImg.naturalWidth / loadedImg.naturalHeight,
        status: 'processing',
        progressPct: 10,
        progressStage: 'Starting AI neural isolation...',
      });

      // Kick off Gemini analysis in parallel
      analyzeSubjectWithGemini(loadedImg);

      // Perform AI background removal
      const result = await removeBackgroundSmart(
        inputBlob,
        (progressPct, progressStage) => {
          setPhoto((prev) =>
            prev
              ? {
                  ...prev,
                  progressPct,
                  progressStage,
                }
              : null
          );
        }
      );

      // Save initial cutout canvas for reset capability
      const initialCopy = document.createElement('canvas');
      initialCopy.width = result.width;
      initialCopy.height = result.height;
      const initialCtx = initialCopy.getContext('2d');
      if (initialCtx) {
        initialCtx.drawImage(result.maskCanvas, 0, 0);
      }
      setInitialCutoutCanvas(initialCopy);

      setCutoutCanvas(result.maskCanvas);
      setPhoto((prev) =>
        prev
          ? {
              ...prev,
              cutoutUrl: result.url,
              cutoutBlob: result.blob,
              maskCanvas: result.maskCanvas,
              status: 'ready',
              progressPct: 100,
              progressStage: 'Ready!',
            }
          : null
      );
    } catch (err: any) {
      console.error('Failed to process image:', err);
      setPhoto((prev) =>
        prev
          ? {
              ...prev,
              status: 'error',
              error:
                err.message ||
                'Failed to isolate background. Please try another image.',
            }
          : null
      );
    }
  };

  const handleFileSelected = (file: File) => {
    processImage(file, file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleSampleSelected = (sample: SampleImage) => {
    processImage(sample.url, sample.id);
  };

  const handleReset = () => {
    setPhoto(null);
    setOriginalImage(null);
    setCutoutCanvas(null);
    setInitialCutoutCanvas(null);
    setInsights(null);
  };

  const handleResetTouchUp = () => {
    if (!initialCutoutCanvas || !cutoutCanvas) return;
    const ctx = cutoutCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, cutoutCanvas.width, cutoutCanvas.height);
      ctx.drawImage(initialCutoutCanvas, 0, 0);
      setMaskVersion((v) => v + 1);
    }
  };

  const handleApplyRecommendedBackdrop = () => {
    if (insights?.recommendedBackdropColor) {
      setBackground({
        ...background,
        mode: 'color',
        color: insights.recommendedBackdropColor,
      });
    }
  };

  const handleExport = async (format: 'png' | 'jpeg' | 'webp') => {
    if (!cutoutCanvas) return;
    setIsExporting(true);
    try {
      const composite = await renderCompositeToCanvas(
        cutoutCanvas,
        originalImage,
        background,
        dropShadow,
        contactShadow,
        outline,
        autoTrim
      );

      const mimeType =
        format === 'jpeg'
          ? 'image/jpeg'
          : format === 'webp'
          ? 'image/webp'
          : 'image/png';

      composite.toBlob(
        (blob) => {
          if (blob) {
            const fileName = `${photo?.name || 'cutout'}-cutout.${
              format === 'jpeg' ? 'jpg' : format
            }`;
            downloadBlob(blob, fileName);
          }
          setIsExporting(false);
        },
        mimeType,
        0.95
      );
    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async (): Promise<boolean> => {
    if (!cutoutCanvas) return false;
    setIsExporting(true);
    try {
      const composite = await renderCompositeToCanvas(
        cutoutCanvas,
        originalImage,
        background,
        dropShadow,
        contactShadow,
        outline,
        autoTrim
      );
      const success = await copyCanvasToClipboard(composite);
      setIsExporting(false);
      return success;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      setIsExporting(false);
      return false;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
      {/* Top Navigation */}
      <Header
        onSelectSample={handleSampleSelected}
        onReset={handleReset}
        hasPhoto={!!photo && photo.status === 'ready'}
      />

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col">
        {!photo || photo.status !== 'ready' ? (
          /* Upload & Processing View */
          <div className="flex flex-1 flex-col justify-center">
            {photo?.status === 'error' ? (
              <div className="mx-auto max-w-md p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                  Segmentation Failed
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {photo.error || 'Unable to isolate background from this image.'}
                </p>
                <button
                  onClick={handleReset}
                  className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Another Image</span>
                </button>
              </div>
            ) : (
              <UploadZone
                onFileSelected={handleFileSelected}
                onSampleSelected={handleSampleSelected}
                isProcessing={photo?.status === 'processing'}
                progressPct={photo?.progressPct || 0}
                progressStage={photo?.progressStage || ''}
              />
            )}
          </div>
        ) : (
          /* Photo Studio Workspace */
          <div className="flex flex-1 flex-col">
            <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-4 p-3 lg:grid-cols-12 lg:p-6">
              {/* Left: Interactive Canvas (8 cols on desktop) */}
              <div className="h-[62vh] lg:col-span-8 lg:h-auto">
                <InteractiveCanvas
                  key={`canvas-${maskVersion}`}
                  originalImage={originalImage}
                  cutoutCanvas={cutoutCanvas}
                  maskCanvas={photo.maskCanvas}
                  background={background}
                  dropShadow={dropShadow}
                  contactShadow={contactShadow}
                  outline={outline}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  isTouchUpActive={activeTab === 'touchup'}
                  touchUpMode={touchUpMode}
                  brushSize={brushSize}
                  brushHardness={brushHardness}
                  onMaskUpdated={() => setMaskVersion((v) => v + 1)}
                />
              </div>

              {/* Right: Studio Sidebar Controls (4 cols on desktop) */}
              <div className="h-[55vh] lg:col-span-4 lg:h-auto">
                <SidebarControls
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  background={background}
                  onBackgroundChange={setBackground}
                  dropShadow={dropShadow}
                  onDropShadowChange={setDropShadow}
                  contactShadow={contactShadow}
                  onContactShadowChange={setContactShadow}
                  outline={outline}
                  onOutlineChange={setOutline}
                  touchUpMode={touchUpMode}
                  onTouchUpModeChange={setTouchUpMode}
                  brushSize={brushSize}
                  onBrushSizeChange={setBrushSize}
                  brushHardness={brushHardness}
                  onBrushHardnessChange={setBrushHardness}
                  onResetTouchUp={handleResetTouchUp}
                  insights={insights}
                  onApplyRecommendedBackdrop={handleApplyRecommendedBackdrop}
                />
              </div>
            </div>

            {/* Bottom Export & Clipboard Bar */}
            <ExportBar
              onExport={handleExport}
              onCopyClipboard={handleCopyClipboard}
              autoTrim={autoTrim}
              onAutoTrimChange={setAutoTrim}
              width={cutoutCanvas?.width || photo.originalWidth}
              height={cutoutCanvas?.height || photo.originalHeight}
              isExporting={isExporting}
              hasBackground={background.mode !== 'transparent'}
            />
          </div>
        )}
      </main>
      <SpeedInsights />
    </div>
  );
}
