import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Scissors,
  FileImage,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportBarProps {
  onExport: (format: 'png' | 'jpeg' | 'webp') => Promise<void>;
  onCopyClipboard: () => Promise<boolean>;
  autoTrim: boolean;
  onAutoTrimChange: (trim: boolean) => void;
  width: number;
  height: number;
  isExporting: boolean;
  hasBackground: boolean;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  onExport,
  onCopyClipboard,
  autoTrim,
  onAutoTrimChange,
  width,
  height,
  isExporting,
  hasBackground,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCopy = async () => {
    const success = await onCopyClipboard();
    if (success) {
      setCopied(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.9 },
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleExportClick = async (format: 'png' | 'jpeg' | 'webp') => {
    setShowDropdown(false);
    await onExport(format);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.9 },
    });
  };

  return (
    <div className="z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        {/* Left: Trim Option & Dimensions */}
        <div className="flex items-center space-x-4">
          {/* Auto Trim Margins */}
          <label className="flex cursor-pointer items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={autoTrim}
              onChange={(e) => onAutoTrimChange(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
            <Scissors className="h-3.5 w-3.5 text-slate-400" />
            <span>Trim Empty Transparent Margins</span>
          </label>

          {/* Resolution Badge */}
          <div className="hidden items-center space-x-1.5 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-mono text-slate-500 sm:flex dark:bg-slate-800 dark:text-slate-400">
            <span>{width}</span>
            <span>×</span>
            <span>{height} px</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Copy to Clipboard */}
          <button
            onClick={handleCopy}
            disabled={isExporting}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Copied PNG!
                </span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-500" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          {/* Download Dropdown */}
          <div className="relative">
            <div className="flex rounded-xl shadow-md shadow-indigo-600/20">
              <button
                onClick={() => handleExportClick('png')}
                disabled={isExporting}
                className="flex items-center space-x-2 rounded-l-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 active:scale-98 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={() => setShowDropdown((v) => !v)}
                disabled={isExporting}
                className="rounded-r-xl border-l border-indigo-500/50 bg-indigo-600 px-2 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Formats Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 bottom-full mb-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={() => handleExportClick('png')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center space-x-2">
                    <FileImage className="h-3.5 w-3.5 text-indigo-500" />
                    <span>PNG (Transparent)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Lossless</span>
                </button>

                <button
                  onClick={() => handleExportClick('jpeg')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center space-x-2">
                    <FileImage className="h-3.5 w-3.5 text-amber-500" />
                    <span>JPG (With Backdrop)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">High Res</span>
                </button>

                <button
                  onClick={() => handleExportClick('webp')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center space-x-2">
                    <FileImage className="h-3.5 w-3.5 text-emerald-500" />
                    <span>WebP</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Lightweight</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
