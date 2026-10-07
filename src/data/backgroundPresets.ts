import { BackgroundPreset } from '../types';

export const SOLID_COLOR_PRESETS = [
  { name: 'Pure White', value: '#FFFFFF', isDark: false },
  { name: 'Studio Off-White', value: '#F8FAFC', isDark: false },
  { name: 'Amazon Neutral', value: '#F3F4F6', isDark: false },
  { name: 'Cool Slate', value: '#E2E8F0', isDark: false },
  { name: 'Studio Ash', value: '#94A3B8', isDark: false },
  { name: 'Charcoal Dark', value: '#334155', isDark: true },
  { name: 'Obsidian Black', value: '#0F172A', isDark: true },
  { name: 'Pitch Dark', value: '#000000', isDark: true },
  { name: 'Pastel Rose', value: '#FFE4E6', isDark: false },
  { name: 'Pastel Mint', value: '#DCFCE7', isDark: false },
  { name: 'Soft Lavender', value: '#EDE9FE', isDark: false },
  { name: 'Warm Cream', value: '#FEF3C7', isDark: false },
  { name: 'Coral Punch', value: '#FB7185', isDark: false },
  { name: 'Vibrant Emerald', value: '#10B981', isDark: true },
  { name: 'Electric Cyan', value: '#06B6D4', isDark: false },
  { name: 'Royal Indigo', value: '#6366F1', isDark: true },
];

export const GRADIENT_PRESETS = [
  {
    name: 'Apple Minimalist',
    value: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    preview: '#f5f7fa',
  },
  {
    name: 'Clean Studio Soft',
    value: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #e2e8f0 100%)',
    preview: '#ffffff',
  },
  {
    name: 'Sunset Glow',
    value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    preview: '#fda085',
  },
  {
    name: 'Aurora Borealis',
    value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    preview: '#84fab0',
  },
  {
    name: 'Cotton Candy',
    value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    preview: '#a1c4fd',
  },
  {
    name: 'Dark Studio Spotlight',
    value: 'radial-gradient(circle at 50% 35%, #334155 0%, #0f172a 100%)',
    preview: '#0f172a',
  },
  {
    name: 'Neon Cyberpunk',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    preview: '#f5576c',
  },
  {
    name: 'Deep Oceanic',
    value: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
    preview: '#0ba360',
  },
  {
    name: 'Midnight Purple',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    preview: '#4facfe',
  },
  {
    name: 'Golden Hour',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    preview: '#fa709a',
  },
];

export const STUDIO_BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'studio-podium',
    name: 'Minimal Stage Podium',
    category: 'podium',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=200&q=70',
  },
  {
    id: 'studio-marble',
    name: 'Luxury White Marble',
    category: 'studio',
    imageUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=200&q=70',
  },
  {
    id: 'studio-sunlit',
    name: 'Sunlit Architecture Loft',
    category: 'studio',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=70',
  },
  {
    id: 'studio-bokeh',
    name: 'Soft Warm Bokeh',
    category: 'studio',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=70',
  },
  {
    id: 'nature-forest',
    name: 'Lush Green Botanicals',
    category: 'nature',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=200&q=70',
  },
  {
    id: 'urban-neon',
    name: 'Cyberpunk City Night',
    category: 'urban',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=200&q=70',
  },
];
