import React, { useRef } from 'react';
import {
  Sparkles,
  Layers,
  Palette,
  Sun,
  Shield,
  Eraser,
  Paintbrush,
  RotateCcw,
  Sliders,
  Check,
  Upload,
  Eye,
  Tag,
  Lightbulb,
  CheckCircle,
  Sticker,
} from 'lucide-react';
import {
  ActiveTab,
  BackgroundConfig,
  DropShadowConfig,
  ContactShadowConfig,
  OutlineConfig,
  TouchUpMode,
  GeminiInsights,
} from '../types';
import {
  SOLID_COLOR_PRESETS,
  GRADIENT_PRESETS,
  STUDIO_BACKGROUND_PRESETS,
} from '../data/backgroundPresets';

interface SidebarControlsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  background: BackgroundConfig;
  onBackgroundChange: (bg: BackgroundConfig) => void;
  dropShadow: DropShadowConfig;
  onDropShadowChange: (shadow: DropShadowConfig) => void;
  contactShadow: ContactShadowConfig;
  onContactShadowChange: (shadow: ContactShadowConfig) => void;
  outline: OutlineConfig;
  onOutlineChange: (outline: OutlineConfig) => void;
  touchUpMode: TouchUpMode;
  onTouchUpModeChange: (mode: TouchUpMode) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushHardness: number;
  onBrushHardnessChange: (hardness: number) => void;
  onResetTouchUp: () => void;
  insights: GeminiInsights | null;
  onApplyRecommendedBackdrop: () => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  activeTab,
  onTabChange,
  background,
  onBackgroundChange,
  dropShadow,
  onDropShadowChange,
  contactShadow,
  onContactShadowChange,
  outline,
  onOutlineChange,
  touchUpMode,
  onTouchUpModeChange,
  brushSize,
  onBrushSizeChange,
  brushHardness,
  onBrushHardnessChange,
  onResetTouchUp,
  insights,
  onApplyRecommendedBackdrop,
}) => {
  const customBgInputRef = useRef<HTMLInputElement>(null);

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onBackgroundChange({
        ...background,
        mode: 'custom',
        customImageUrl: url,
      });
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Tab Navigation */}
      <div className="grid grid-cols-4 border-b border-slate-200 p-1.5 dark:border-slate-800">
        <button
          onClick={() => onTabChange('background')}
          className={`flex flex-col items-center justify-center rounded-xl py-2 text-xs font-semibold transition-all ${
            activeTab === 'background'
              ? 'bg-indigo-50 text-indigo-700 shadow-xs dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span className="mt-1">Backdrop</span>
        </button>

        <button
          onClick={() => onTabChange('shadow')}
          className={`flex flex-col items-center justify-center rounded-xl py-2 text-xs font-semibold transition-all ${
            activeTab === 'shadow'
              ? 'bg-indigo-50 text-indigo-700 shadow-xs dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Sun className="h-4 w-4" />
          <span className="mt-1">Shadows</span>
        </button>

        <button
          onClick={() => onTabChange('outline')}
          className={`flex flex-col items-center justify-center rounded-xl py-2 text-xs font-semibold transition-all ${
            activeTab === 'outline'
              ? 'bg-indigo-50 text-indigo-700 shadow-xs dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Sticker className="h-4 w-4" />
          <span className="mt-1">Outline</span>
        </button>

        <button
          onClick={() => onTabChange('touchup')}
          className={`flex flex-col items-center justify-center rounded-xl py-2 text-xs font-semibold transition-all ${
            activeTab === 'touchup'
              ? 'bg-indigo-50 text-indigo-700 shadow-xs dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Eraser className="h-4 w-4" />
          <span className="mt-1">Touch-Up</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ================= BACKGROUND TAB ================= */}
        {activeTab === 'background' && (
          <div className="space-y-6">
            {/* Transparent Mode */}
            <div>
              <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                Transparency
              </span>
              <button
                onClick={() =>
                  onBackgroundChange({ ...background, mode: 'transparent' })
                }
                className={`mt-2 flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  background.mode === 'transparent'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg border border-slate-300 bg-checkered shadow-inner" />
                  <div>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                      Transparent PNG
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Export with zero background
                    </span>
                  </div>
                </div>
                {background.mode === 'transparent' && (
                  <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </button>
            </div>

            {/* AI Recommended Backdrop Quick Apply */}
            {insights && (
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 p-3 dark:border-indigo-900/60 dark:from-indigo-950/40 dark:to-violet-950/40">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Studio Recommendation</span>
                  </div>
                  <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-slate-900 dark:text-indigo-300">
                    {insights.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {insights.advice || 'Recommended studio backdrop color'}
                </p>
                <button
                  onClick={onApplyRecommendedBackdrop}
                  className="mt-2.5 flex w-full items-center justify-center space-x-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700"
                >
                  <span
                    className="h-3 w-3 rounded-full border border-white/50"
                    style={{ backgroundColor: insights.recommendedBackdropColor }}
                  />
                  <span>Apply {insights.recommendedBackdropName}</span>
                </button>
              </div>
            )}

            {/* Solid Color Presets */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  Solid Studio Colors
                </span>
                {/* Custom Color Input */}
                <label className="flex cursor-pointer items-center space-x-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                  <Palette className="h-3.5 w-3.5" />
                  <span>Custom</span>
                  <input
                    type="color"
                    value={background.color}
                    onChange={(e) =>
                      onBackgroundChange({
                        ...background,
                        mode: 'color',
                        color: e.target.value,
                      })
                    }
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="mt-2.5 grid grid-cols-8 gap-2">
                {SOLID_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      onBackgroundChange({
                        ...background,
                        mode: 'color',
                        color: preset.value,
                      })
                    }
                    title={preset.name}
                    className={`group relative aspect-square rounded-lg border shadow-xs transition-transform hover:scale-110 ${
                      background.mode === 'color' &&
                      background.color.toUpperCase() === preset.value.toUpperCase()
                        ? 'ring-2 ring-indigo-500 ring-offset-2'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: preset.value }}
                  >
                    {background.mode === 'color' &&
                      background.color.toUpperCase() ===
                        preset.value.toUpperCase() && (
                        <Check
                          className={`absolute inset-0 m-auto h-3 w-3 ${
                            preset.isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        />
                      )}
                  </button>
                ))}
              </div>
            </div>

            {/* Designer Gradients */}
            <div>
              <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                Studio Gradients
              </span>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {GRADIENT_PRESETS.map((grad) => (
                  <button
                    key={grad.name}
                    onClick={() =>
                      onBackgroundChange({
                        ...background,
                        mode: 'gradient',
                        gradient: grad.value,
                      })
                    }
                    className={`flex items-center space-x-2 rounded-xl border p-2 text-left transition-all ${
                      background.mode === 'gradient' &&
                      background.gradient === grad.value
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    <div
                      className="h-7 w-7 rounded-lg border border-slate-200 shadow-xs shrink-0 dark:border-slate-700"
                      style={{ background: grad.value }}
                    />
                    <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                      {grad.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Virtual Studio Scenes */}
            <div>
              <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                Virtual Studio Backdrops
              </span>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {STUDIO_BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() =>
                      onBackgroundChange({
                        ...background,
                        mode: 'preset',
                        presetId: preset.id,
                      })
                    }
                    className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                      background.mode === 'preset' &&
                      background.presetId === preset.id
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={preset.thumbnailUrl}
                        alt={preset.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-1.5">
                      <span className="block truncate text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Image Upload & Blur Original */}
            <div className="space-y-3 pt-2">
              <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                Custom Backdrop & Bokeh
              </span>

              {/* Upload custom backdrop button */}
              <input
                ref={customBgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCustomBgUpload}
              />
              <button
                onClick={() => customBgInputRef.current?.click()}
                className="flex w-full items-center justify-center space-x-2 rounded-xl border border-dashed border-slate-300 p-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-500 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-indigo-950/40"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Custom Backdrop Photo</span>
              </button>

              {/* Blur Original Background */}
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Bokeh Blur Original Photo
                  </span>
                  <input
                    type="checkbox"
                    checked={background.mode === 'blur_original'}
                    onChange={(e) =>
                      onBackgroundChange({
                        ...background,
                        mode: e.target.checked ? 'blur_original' : 'transparent',
                      })
                    }
                    className="h-4 w-4 rounded accent-indigo-600"
                  />
                </div>
                {background.mode === 'blur_original' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Blur Strength</span>
                      <span>{background.blurAmount}px</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="40"
                      value={background.blurAmount}
                      onChange={(e) =>
                        onBackgroundChange({
                          ...background,
                          blurAmount: Number(e.target.value),
                        })
                      }
                      className="mt-1.5 w-full accent-indigo-600"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= SHADOWS TAB ================= */}
        {activeTab === 'shadow' && (
          <div className="space-y-6">
            {/* 3D Soft Drop Shadow */}
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    Soft Drop Shadow
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Studio ambient depth behind subject
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={dropShadow.enabled}
                    onChange={(e) =>
                      onDropShadowChange({
                        ...dropShadow,
                        enabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all dark:bg-slate-700" />
                </label>
              </div>

              {dropShadow.enabled && (
                <div className="mt-4 space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Blur */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Softness / Blur</span>
                      <span>{dropShadow.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="60"
                      value={dropShadow.blur}
                      onChange={(e) =>
                        onDropShadowChange({
                          ...dropShadow,
                          blur: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full accent-indigo-600"
                    />
                  </div>

                  {/* Opacity */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Shadow Darkness</span>
                      <span>{Math.round(dropShadow.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={dropShadow.opacity}
                      onChange={(e) =>
                        onDropShadowChange({
                          ...dropShadow,
                          opacity: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full accent-indigo-600"
                    />
                  </div>

                  {/* Y Offset */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Vertical Distance</span>
                      <span>{dropShadow.offsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={dropShadow.offsetY}
                      onChange={(e) =>
                        onDropShadowChange({
                          ...dropShadow,
                          offsetY: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full accent-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Product Ground Contact Shadow */}
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    Floor Contact Shadow
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Essential for shoes, products & objects
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={contactShadow.enabled}
                    onChange={(e) =>
                      onContactShadowChange({
                        ...contactShadow,
                        enabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all dark:bg-slate-700" />
                </label>
              </div>

              {contactShadow.enabled && (
                <div className="mt-4 space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Shadow Size */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Shadow Spread</span>
                      <span>{Math.round(contactShadow.size * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="1.2"
                      step="0.05"
                      value={contactShadow.size}
                      onChange={(e) =>
                        onContactShadowChange({
                          ...contactShadow,
                          size: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full accent-indigo-600"
                    />
                  </div>

                  {/* Opacity */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Floor Opacity</span>
                      <span>{Math.round(contactShadow.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={contactShadow.opacity}
                      onChange={(e) =>
                        onContactShadowChange({
                          ...contactShadow,
                          opacity: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full accent-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= OUTLINE TAB ================= */}
        {activeTab === 'outline' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    Sticker / Thumbnail Outline
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Crisp pop border around subject
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={outline.enabled}
                    onChange={(e) =>
                      onOutlineChange({
                        ...outline,
                        enabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all dark:bg-slate-700" />
                </label>
              </div>

              {outline.enabled && (
                <div className="mt-4 space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Outline Color */}
                  <div>
                    <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Border Color
                    </span>
                    <div className="mt-2 flex items-center space-x-2">
                      {['#FFFFFF', '#000000', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'].map(
                        (c) => (
                          <button
                            key={c}
                            onClick={() => onOutlineChange({ ...outline, color: c })}
                            className={`h-6 w-6 rounded-full border shadow-xs transition-transform hover:scale-110 ${
                              outline.color.toUpperCase() === c.toUpperCase()
                                ? 'ring-2 ring-indigo-500 ring-offset-2'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        )
                      )}
                      <input
                        type="color"
                        value={outline.color}
                        onChange={(e) =>
                          onOutlineChange({ ...outline, color: e.target.value })
                        }
                        className="h-7 w-7 cursor-pointer rounded-full border border-slate-300"
                        title="Custom Color"
                      />
                    </div>
                  </div>

                  {/* Outline Width */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Border Thickness</span>
                      <span>{outline.width}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="24"
                      value={outline.width}
                      onChange={(e) =>
                        onOutlineChange({
                          ...outline,
                          width: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full accent-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TOUCH-UP TAB ================= */}
        {activeTab === 'touchup' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850">
              <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                Precision Edge Refinement
              </span>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Paint directly on the photo above to erase missed background
                specks or restore clipped subject areas.
              </p>

              {/* Mode Toggle */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onTouchUpModeChange('erase')}
                  className={`flex items-center justify-center space-x-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                    touchUpMode === 'erase'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-xs dark:bg-red-950/60 dark:text-red-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Eraser className="h-4 w-4" />
                  <span>Erase BG</span>
                </button>

                <button
                  onClick={() => onTouchUpModeChange('restore')}
                  className={`flex items-center justify-center space-x-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                    touchUpMode === 'restore'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Paintbrush className="h-4 w-4" />
                  <span>Restore Subject</span>
                </button>
              </div>

              {/* Brush Size Slider */}
              <div className="mt-5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Brush Radius</span>
                  <span>{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="80"
                  value={brushSize}
                  onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                  className="mt-1.5 w-full accent-indigo-600"
                />
              </div>

              {/* Reset Touch-Ups */}
              <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  onClick={onResetTouchUp}
                  className="flex w-full items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Touch-Ups to AI Cutout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
