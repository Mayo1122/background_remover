export type ProcessStatus = 'idle' | 'processing' | 'ready' | 'error';

export type BackgroundMode = 'transparent' | 'color' | 'gradient' | 'preset' | 'custom' | 'blur_original';

export type ViewMode = 'split' | 'cutout' | 'side_by_side' | 'original';

export type ActiveTab = 'background' | 'shadow' | 'outline' | 'touchup' | 'ai_insights';

export type TouchUpMode = 'erase' | 'restore';

export interface DropShadowConfig {
  enabled: boolean;
  color: string;
  blur: number; // 0 - 60
  offsetX: number; // -50 - 50
  offsetY: number; // -50 - 50
  opacity: number; // 0 - 1
}

export interface ContactShadowConfig {
  enabled: boolean;
  opacity: number; // 0 - 1
  size: number; // 0.2 - 1.2
  offsetY: number; // 0 - 60
}

export interface OutlineConfig {
  enabled: boolean;
  color: string;
  width: number; // 1 - 20
}

export interface BackgroundConfig {
  mode: BackgroundMode;
  color: string;
  gradient: string;
  presetId: string;
  customImageUrl: string | null;
  blurAmount: number; // 0 - 40 px
}

export interface PhotoData {
  id: string;
  name: string;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  originalFile?: File;
  cutoutUrl: string | null;
  cutoutBlob: Blob | null;
  maskCanvas: HTMLCanvasElement | null;
  aspectRatio: number;
  status: ProcessStatus;
  progressPct: number;
  progressStage: string;
  error?: string;
}

export interface GeminiInsights {
  category: string;
  subjectName: string;
  tags: string[];
  recommendedBackdropColor: string;
  recommendedBackdropName: string;
  advice: string;
  isECommerceReady: boolean;
  loading?: boolean;
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  url: string;
  previewUrl: string;
  description: string;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'studio' | 'nature' | 'urban' | 'podium';
  imageUrl: string;
  thumbnailUrl: string;
}
