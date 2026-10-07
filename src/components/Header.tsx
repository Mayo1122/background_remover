import React from 'react';
import {
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/sampleImages';
import { SampleImage } from '../types';

interface HeaderProps {
  onSelectSample: (sample: SampleImage) => void;
  onReset: () => void;
  hasPhoto: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectSample,
  onReset,
  hasPhoto,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div
          onClick={onReset}
          className="flex cursor-pointer items-center space-x-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 text-white shadow-md shadow-indigo-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Cutout<span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Sparkles className="mr-1 h-3 w-3" />
                AI Remover
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
              Instant transparent cutouts, studio backdrops & shadows
            </p>
          </div>
        </div>

        {/* Action pills & sample shortcuts */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Sample Selector Dropdown or Pills */}
          <div className="hidden items-center space-x-1.5 md:flex">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Try sample:
            </span>
            {SAMPLE_IMAGES.slice(0, 3).map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className="group relative flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-all hover:border-indigo-300 hover:bg-indigo-50/70 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
                title={sample.description}
              >
                <img
                  src={sample.previewUrl}
                  alt={sample.title}
                  className="h-4 w-4 rounded-full object-cover"
                />
                <span>{sample.title}</span>
              </button>
            ))}
          </div>

          {hasPhoto && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <UploadCloud className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>New Photo</span>
            </button>
          )}

          <div className="hidden items-center space-x-2 text-xs font-medium text-emerald-600 sm:flex dark:text-emerald-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold">Local AI Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
};
