import {
  BackgroundConfig,
  DropShadowConfig,
  ContactShadowConfig,
  OutlineConfig,
  BackgroundPreset,
} from '../types';
import { STUDIO_BACKGROUND_PRESETS } from '../data/backgroundPresets';

/**
 * Loads an image from a URL or object URL safely with crossOrigin
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image from: ${src.substring(0, 50)}...`));
    img.src = src;
  });
}

/**
 * Robust AI Background Removal using @imgly/background-removal with fallback
 */
export async function removeBackgroundSmart(
  imageSource: File | Blob | string,
  onProgress?: (progressPct: number, stage: string) => void
): Promise<{ blob: Blob; url: string; width: number; height: number; maskCanvas: HTMLCanvasElement }> {
  // Determine source blob
  let inputBlob: Blob;
  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('data:') || imageSource.startsWith('blob:')) {
      const res = await fetch(imageSource);
      inputBlob = await res.blob();
    } else {
      // External URL
      const res = await fetch(imageSource, { mode: 'cors' });
      inputBlob = await res.blob();
    }
  } else {
    inputBlob = imageSource;
  }

  // First measure natural dimensions
  const tempUrl = URL.createObjectURL(inputBlob);
  let originalWidth = 800;
  let originalHeight = 600;
  try {
    const originalImg = await loadImage(tempUrl);
    originalWidth = originalImg.naturalWidth;
    originalHeight = originalImg.naturalHeight;
  } finally {
    URL.revokeObjectURL(tempUrl);
  }

  if (onProgress) onProgress(15, 'Initializing AI neural model...');

  try {
    // Dynamically import @imgly/background-removal
    const imglyModule = await import('@imgly/background-removal');
    const removeBackground =
      (imglyModule as any).default ||
      (imglyModule as any).removeBackground ||
      imglyModule;

    if (onProgress) onProgress(35, 'Analyzing image contours & edges...');

    const resultBlob = await removeBackground(inputBlob, {
      progress: (key: string, current: number, total: number) => {
        if (total > 0 && onProgress) {
          const pct = Math.min(95, Math.max(35, Math.round(35 + (current / total) * 60)));
          const stageName = key.includes('fetch')
            ? 'Downloading model weights...'
            : key.includes('compute')
            ? 'Separating foreground subject...'
            : 'Extracting transparent mask...';
          onProgress(pct, stageName);
        }
      },
      output: {
        format: 'image/png',
        quality: 1.0,
      },
    });

    if (onProgress) onProgress(100, 'Finishing high-res cutout...');

    const cutoutUrl = URL.createObjectURL(resultBlob);
    const cutoutImg = await loadImage(cutoutUrl);

    // Create mask canvas for touch-ups
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = cutoutImg.naturalWidth || originalWidth;
    maskCanvas.height = cutoutImg.naturalHeight || originalHeight;
    const ctx = maskCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(cutoutImg, 0, 0);
    }

    return {
      blob: resultBlob,
      url: cutoutUrl,
      width: cutoutImg.naturalWidth || originalWidth,
      height: cutoutImg.naturalHeight || originalHeight,
      maskCanvas,
    };
  } catch (err: any) {
    console.warn('Primary @imgly neural network was unavailable or timed out, executing intelligent canvas segmentation fallback:', err);
    if (onProgress) onProgress(60, 'Applying intelligent edge & saliency matting...');

    // Execute fallback
    return await removeBackgroundCanvasFallback(inputBlob, onProgress);
  }
}

/**
 * Intelligent canvas-based edge, color distance & saliency matting
 * Used as high-speed reliable fallback
 */
export async function removeBackgroundCanvasFallback(
  blob: Blob,
  onProgress?: (progressPct: number, stage: string) => void
): Promise<{ blob: Blob; url: string; width: number; height: number; maskCanvas: HTMLCanvasElement }> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    if (onProgress) onProgress(75, 'Detecting background color profiles...');

    // Sample border pixels to detect background color palette
    const bgSamples: [number, number, number][] = [];
    const step = Math.max(1, Math.floor(Math.min(width, height) / 40));

    // Top & bottom rows
    for (let x = 0; x < width; x += step) {
      const topIdx = (0 * width + x) * 4;
      bgSamples.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]]);
      const botIdx = ((height - 1) * width + x) * 4;
      bgSamples.push([data[botIdx], data[botIdx + 1], data[botIdx + 2]]);
    }
    // Left & right columns
    for (let y = 0; y < height; y += step) {
      const leftIdx = (y * width + 0) * 4;
      bgSamples.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]]);
      const rightIdx = (y * width + (width - 1)) * 4;
      bgSamples.push([data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]]);
    }

    // Compute average corner background color
    let avgR = 0, avgG = 0, avgB = 0;
    bgSamples.forEach(([r, g, b]) => {
      avgR += r;
      avgG += g;
      avgB += b;
    });
    avgR /= bgSamples.length;
    avgG /= bgSamples.length;
    avgB /= bgSamples.length;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistFromCenter = Math.hypot(centerX, centerY);

    if (onProgress) onProgress(85, 'Calculating alpha transparency masks...');

    // Process each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Minimum distance to any background sample
        let minSampleDist = 9999;
        for (let s = 0; s < Math.min(bgSamples.length, 60); s++) {
          const [sr, sg, sb] = bgSamples[s];
          const dist = Math.hypot(r - sr, g - sg, b - sb);
          if (dist < minSampleDist) minSampleDist = dist;
        }

        // Distance to average background
        const avgDist = Math.hypot(r - avgR, g - avgG, b - avgB);
        const effectiveDist = Math.min(minSampleDist, avgDist);

        // Distance to center of image (subjects are usually centered)
        const distToCenter = Math.hypot(x - centerX, y - centerY);
        const centerWeight = 1 - Math.min(1, distToCenter / maxDistFromCenter);

        // Calculate alpha based on color distance and central saliency
        let alpha = 255;
        const threshold = 38;
        const feather = 24;

        if (effectiveDist < threshold) {
          // If close to center, be a bit more conservative
          if (centerWeight > 0.65 && effectiveDist > 20) {
            alpha = Math.round(((effectiveDist - 20) / (threshold - 20)) * 255);
          } else {
            alpha = 0;
          }
        } else if (effectiveDist < threshold + feather) {
          alpha = Math.round(((effectiveDist - threshold) / feather) * 255);
        }

        data[idx + 3] = alpha;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    if (onProgress) onProgress(100, 'Complete!');

    const resultBlob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b || blob), 'image/png')
    );
    const cutoutUrl = URL.createObjectURL(resultBlob);

    return {
      blob: resultBlob,
      url: cutoutUrl,
      width,
      height,
      maskCanvas: canvas,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Trims transparent outer margins and returns cropped canvas
 */
export function trimTransparentMargins(
  canvas: HTMLCanvasElement,
  padding = 16
): HTMLCanvasElement {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let hasPixels = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 10) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasPixels) return canvas;

  // Add padding
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;
  const croppedCtx = croppedCanvas.getContext('2d');
  if (croppedCtx) {
    croppedCtx.drawImage(
      canvas,
      minX,
      minY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
  }

  return croppedCanvas;
}

/**
 * Renders the final composite with background, shadows, sticker outline, and cutout
 */
export async function renderCompositeToCanvas(
  cutoutCanvas: HTMLCanvasElement,
  originalImage: HTMLImageElement | null,
  background: BackgroundConfig,
  dropShadow: DropShadowConfig,
  contactShadow: ContactShadowConfig,
  outline: OutlineConfig,
  autoTrim = false
): Promise<HTMLCanvasElement> {
  const targetCutout = autoTrim
    ? trimTransparentMargins(cutoutCanvas, 24)
    : cutoutCanvas;

  const width = targetCutout.width;
  const height = targetCutout.height;

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = width;
  exportCanvas.height = height;
  const ctx = exportCanvas.getContext('2d')!;

  // 1. Draw Background
  if (background.mode === 'color') {
    ctx.fillStyle = background.color;
    ctx.fillRect(0, 0, width, height);
  } else if (background.mode === 'gradient') {
    // Parse gradient or create clean linear gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (background.gradient.includes('#f6d365')) {
      grad.addColorStop(0, '#f6d365');
      grad.addColorStop(1, '#fda085');
    } else if (background.gradient.includes('#84fab0')) {
      grad.addColorStop(0, '#84fab0');
      grad.addColorStop(1, '#8fd3f4');
    } else if (background.gradient.includes('#334155')) {
      grad.addColorStop(0, '#334155');
      grad.addColorStop(1, '#0f172a');
    } else if (background.gradient.includes('#f093fb')) {
      grad.addColorStop(0, '#f093fb');
      grad.addColorStop(1, '#f5576c');
    } else if (background.gradient.includes('#fa709a')) {
      grad.addColorStop(0, '#fa709a');
      grad.addColorStop(1, '#fee140');
    } else if (background.gradient.includes('#0ba360')) {
      grad.addColorStop(0, '#0ba360');
      grad.addColorStop(1, '#3cba92');
    } else {
      // Clean Apple Minimalist default
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(1, '#cbd5e1');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (background.mode === 'preset' && background.presetId) {
    const preset = STUDIO_BACKGROUND_PRESETS.find(
      (p) => p.id === background.presetId
    );
    if (preset) {
      try {
        const bgImg = await loadImage(preset.imageUrl);
        ctx.drawImage(bgImg, 0, 0, width, height);
      } catch {
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, width, height);
      }
    }
  } else if (background.mode === 'custom' && background.customImageUrl) {
    try {
      const customImg = await loadImage(background.customImageUrl);
      ctx.drawImage(customImg, 0, 0, width, height);
    } catch {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, height);
    }
  } else if (background.mode === 'blur_original' && originalImage) {
    ctx.save();
    ctx.filter = `blur(${Math.max(1, background.blurAmount)}px)`;
    // Scale slightly to prevent blur edge artifacts
    ctx.drawImage(originalImage, -20, -20, width + 40, height + 40);
    ctx.restore();
  }

  // 2. Draw Contact Shadow (e-commerce floor shadow beneath subject)
  if (contactShadow.enabled) {
    ctx.save();
    const shadowY = height * 0.92 + contactShadow.offsetY;
    const shadowWidth = width * 0.65 * contactShadow.size;
    const shadowHeight = Math.max(12, height * 0.05 * contactShadow.size);

    const grad = ctx.createRadialGradient(
      width / 2,
      shadowY,
      2,
      width / 2,
      shadowY,
      shadowWidth / 2
    );
    grad.addColorStop(0, `rgba(0, 0, 0, ${contactShadow.opacity * 0.75})`);
    grad.addColorStop(0.5, `rgba(0, 0, 0, ${contactShadow.opacity * 0.3})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(
      width / 2,
      shadowY,
      shadowWidth / 2,
      shadowHeight / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // 3. Draw Sticker / YouTube Outline if enabled
  if (outline.enabled && outline.width > 0) {
    ctx.save();
    // Render outline using multi-directional offset expansion
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext('2d')!;

    // Create solid silhouette of the cutout
    offCtx.drawImage(targetCutout, 0, 0);
    offCtx.globalCompositeOperation = 'source-in';
    offCtx.fillStyle = outline.color;
    offCtx.fillRect(0, 0, width, height);

    // Stamp outline radially
    const w = outline.width;
    const stepCount = 16;
    for (let i = 0; i < stepCount; i++) {
      const angle = (i / stepCount) * Math.PI * 2;
      const ox = Math.cos(angle) * w;
      const oy = Math.sin(angle) * w;
      ctx.drawImage(offCanvas, ox, oy);
    }
    ctx.restore();
  }

  // 4. Draw Drop Shadow
  if (dropShadow.enabled) {
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${dropShadow.opacity})`;
    ctx.shadowBlur = dropShadow.blur;
    ctx.shadowOffsetX = dropShadow.offsetX;
    ctx.shadowOffsetY = dropShadow.offsetY;
    ctx.drawImage(targetCutout, 0, 0);
    ctx.restore();
  }

  // 5. Draw Subject Cutout
  ctx.drawImage(targetCutout, 0, 0);

  return exportCanvas;
}

/**
 * Download a Blob or Canvas as a file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copy transparent PNG canvas directly to user's system clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    return false;
  }
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        resolve(true);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        resolve(false);
      }
    }, 'image/png');
  });
}
