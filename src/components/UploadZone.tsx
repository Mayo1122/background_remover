import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  ArrowRight,
  Maximize2,
  FileCheck,
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/sampleImages';
import { SampleImage } from '../types';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onSampleSelected: (sample: SampleImage) => void;
  isProcessing: boolean;
  progressPct: number;
  progressStage: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  onSampleSelected,
  isProcessing,
  progressPct,
  progressStage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen to paste events (e.g. user screenshots or copies image from web and presses Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isProcessing) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            onFileSelected(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFileSelected, isProcessing]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelected(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Hero Title & Subtitle */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200/80 bg-indigo-50/70 px-3.5 py-1 text-xs font-semibold text-indigo-700 backdrop-blur-xs dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Next-Generation Neural Background Removal</span>
        </div>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
          Remove Backgrounds <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
            Instantly with AI
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
          Cut out subjects with fine hair and fur precision in seconds. Export
          high-resolution transparent PNGs, customize studio backdrops, and add
          realistic contact shadows.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="mt-10">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-8 text-center transition-all sm:p-12 ${
            isDragging
              ? 'scale-[1.01] border-indigo-500 bg-indigo-50/70 shadow-2xl shadow-indigo-500/10 dark:border-indigo-400 dark:bg-indigo-950/40'
              : 'border-slate-300 bg-white shadow-xl shadow-slate-200/50 hover:border-indigo-400 hover:bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none dark:hover:border-indigo-500/80 dark:hover:bg-slate-800/80'
          } ${isProcessing ? 'pointer-events-none' : 'cursor-pointer'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/avif"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {isProcessing ? (
            /* Progress State */
            <div className="py-6 sm:py-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400">
                <Sparkles className="h-8 w-8 animate-spin" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                Removing Background...
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {progressStage || 'Processing neural segmentation mask'}
              </p>

              {/* Progress Bar */}
              <div className="mx-auto mt-6 max-w-md">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>AI Processing</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Idle Drag & Drop UI */
            <div>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-inner dark:bg-indigo-950/60 dark:text-indigo-400">
                <UploadCloud className="h-10 w-10 animate-pulse" />
              </div>

              <div className="mt-6">
                <span className="inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40">
                  Choose a Photo
                </span>
                <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  or drag and drop your image here
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Supports PNG, JPG, WebP, AVIF up to 25MB • Paste anytime with{' '}
                  <kbd className="rounded border border-slate-300 bg-slate-100 px-1 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Ctrl + V
                  </kbd>
                </p>
              </div>

              {/* Guarantees */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-slate-100 pt-6 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>100% Free & Unlimited</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Ultra-Fast Neural Processing</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="h-4 w-4 text-indigo-500" />
                  <span>Full-Res Transparent PNG</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sample Photos Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              No photo ready? Try these samples
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any photo to test instant background removal on diverse subjects
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelected(sample)}
              disabled={isProcessing}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-left shadow-xs transition-all hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/80"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <img
                  src={sample.previewUrl}
                  alt={sample.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 backdrop-blur-xs opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-900/90 dark:text-white">
                  Remove BG ➔
                </span>
              </div>
              <div className="mt-2 px-1 pb-1">
                <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {sample.title}
                </span>
                <span className="block truncate text-[11px] text-slate-400 dark:text-slate-500">
                  {sample.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature showcase highlights */}
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
            Hair & Fur Edge Precision
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Advanced neural segmentation preserves delicate wisps of hair, animal
            fur, translucent fabrics, and fine product contours with natural
            alpha feathering.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
            <Maximize2 className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
            E-Commerce & Studio Backdrops
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Instantly swap backgrounds with Amazon/Shopify clean white, modern
            podiums, marble surfaces, gradient presets, or add realistic
            contact shadows.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400">
            <FileCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
            1-Click Clipboard & High-Res Export
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Download uncompressed transparent PNGs or copy directly to your
            clipboard to paste straight into Figma, Photoshop, Canva, Slack, or
            Discord.
          </p>
        </div>
      </div>
    </div>
  );
};
