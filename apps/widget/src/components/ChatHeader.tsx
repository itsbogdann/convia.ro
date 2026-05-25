import { useWidgetStore } from '../store';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { sanitizeSvg } from '../utils/sanitize';

/**
 * Convert a hex color string to rgba. Supports 3-char (#RGB) and 6-char (#RRGGBB) hex codes.
 */
function hexToRgba(hex: string, opacity: number): string {
  let sanitized = hex.replace('#', '');
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const ChatHeader = () => {
  const { setOpen, toggleExpanded, isExpanded, theme } = useWidgetStore();

  const glassEnabled = theme.chat.glassEffect === true;
  const glassBlur = theme.chat.glassBlur ?? 12;
  const glassOpacity = theme.chat.glassOpacity ?? 0.7;

  return (
    <div
      className="lr-flex lr-items-center lr-gap-3 lr-px-4 lr-py-3 lr-shrink-0 lr-relative lr-z-10 lr-overflow-hidden"
      style={{
        backgroundColor: glassEnabled
          ? hexToRgba(theme.header.backgroundColor, glassOpacity)
          : theme.header.backgroundColor,
        color: theme.header.textColor,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        ...(glassEnabled
          ? {
              backdropFilter: `blur(${glassBlur}px)`,
              WebkitBackdropFilter: `blur(${glassBlur}px)`,
              borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
            }
          : {}),
      }}
    >
      {theme.header.showDotPattern && (
        <div
          className="lr-absolute lr-inset-0 lr-pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />
      )}
      {/* Avatar with green active dot */}
      {theme.messages.showAvatar && (
        <div className="lr-relative lr-shrink-0">
          <div
            className="lr-w-10 lr-h-10 lr-rounded-full lr-flex lr-items-center lr-justify-center lr-overflow-hidden"
            style={{ backgroundColor: theme.messages.avatarBackgroundColor || 'rgba(255,255,255,0.2)' }}
          >
            {theme.messages.avatarUrl ? (
              <img
                src={theme.messages.avatarUrl}
                alt="Agent"
                className="lr-w-full lr-h-full lr-object-cover"
              />
            ) : theme.messages.avatarSvg ? (
              <div
                className="lr-w-full lr-h-full"
                dangerouslySetInnerHTML={{ __html: sanitizeSvg(
                  theme.messages.avatarSvg.replace(/<circle[^>]*r=["']24["'][^>]*>/gi, '')
                ) }}
              />
            ) : (
              <LogoIcon size={24} color={theme.header.textColor} className="lr-w-6 lr-h-6" />
            )}
          </div>
          {theme.header.showOnlineStatus && (
            <span
              className="lr-absolute lr-bottom-0 lr-right-0 lr-w-3.5 lr-h-3.5 lr-rounded-full lr-bg-green-400"
              style={{ border: '2px solid', borderColor: theme.header.backgroundColor }}
            />
          )}
        </div>
      )}

      {/* Title, subtitle, and online status */}
      <div className="lr-flex-1 lr-min-w-0">
        <div className="lr-font-semibold lr-text-sm lr-truncate">{theme.header.title}</div>
        {theme.header.subtitle && (
          <div className="lr-text-xs lr-opacity-80 lr-truncate">{theme.header.subtitle}</div>
        )}
      </div>

      {/* Expand/Collapse button */}
      <button
        onClick={toggleExpanded}
        className="lr-p-1.5 lr-transition-opacity hover:lr-opacity-70"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
        aria-label={isExpanded ? 'Collapse chat' : 'Expand chat'}
      >
        {isExpanded ? (
          <Minimize2 className="lr-w-4 lr-h-4" style={{ color: theme.header.textColor }} />
        ) : (
          <Maximize2 className="lr-w-4 lr-h-4" style={{ color: theme.header.textColor }} />
        )}
      </button>

      {/* Close button */}
      {theme.header.showCloseButton !== false && (
        <button
          onClick={() => setOpen(false)}
          className="lr-p-1.5 lr-transition-opacity hover:lr-opacity-70"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Close chat"
        >
          <X className="lr-w-5 lr-h-5" style={{ color: theme.header.textColor }} />
        </button>
      )}
    </div>
  );
};
