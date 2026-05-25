import { useWidgetStore } from '../../store';

/**
 * Derives adaptive secondary colors from the theme.
 * Ensures muted text, borders, and subtle backgrounds work on both light and dark themes.
 */
export const usePortalColors = () => {
  const { theme } = useWidgetStore();
  const bg = theme.chat.backgroundColor;
  const isLight = isLightColor(bg);

  const hasImageBg = theme.chat.backgroundPattern === 'image' && !!theme.chat.backgroundImage;

  return {
    /** Chat background — transparent when image background is active so the blurred image shows through */
    chatBg: hasImageBg ? 'transparent' : bg,
    /** Muted text — timestamps, secondary info, placeholders */
    mutedText: isLight ? '#9CA3AF' : 'rgba(255,255,255,0.45)',
    /** Secondary text — section headers, summaries */
    secondaryText: isLight ? '#6B7280' : 'rgba(255,255,255,0.6)',
    /** Subtle border for the navigation separator */
    navBorder: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
    /** Subtle background for tags/badges in article detail */
    subtleBg: isLight ? '#F3F4F6' : 'rgba(255,255,255,0.1)',
    /** Empty star stroke */
    emptyStar: isLight ? '#D1D5DB' : 'rgba(255,255,255,0.25)',
    /** Chevron / arrow color */
    chevron: isLight ? '#C4C4C4' : 'rgba(255,255,255,0.3)',
    /** Whether the chat background is light */
    isLight,
    /** Multi-layer resting shadow for cards */
    cardShadow: isLight
      ? '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03)'
      : '0 1px 3px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15)',
    /** Top-edge inner highlight for glass-like depth on cards */
    cardHighlight: isLight
      ? 'inset 0 1px 0 rgba(255,255,255,0.6)'
      : 'inset 0 1px 0 rgba(255,255,255,0.06)',
    /** Combined card shadow (resting + inner highlight) */
    get cardStyle() {
      return `${this.cardShadow}, ${this.cardHighlight}`;
    },
    /** Content area subtle gradient overlay (top → transparent) */
    contentGradient: isLight
      ? 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 40%)'
      : 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%)',
    /** Frosted nav background */
    navBg: isLight
      ? 'rgba(255,255,255,0.8)'
      : 'rgba(20,20,30,0.75)',
  };
};

function isLightColor(color: string): boolean {
  let hex = color.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  // Handle non-hex (rgb, etc) — assume light as safe fallback
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return true;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
