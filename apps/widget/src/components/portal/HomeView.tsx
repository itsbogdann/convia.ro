import { useEffect } from 'react';
import { useWidgetStore } from '../../store';
import { usePortalColors } from './usePortalColors';
import { t } from '../../utils/translations';

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: '#DCFCE7', text: '#166534' },
  improvement: { bg: '#DBEAFE', text: '#1E40AF' },
  fix: { bg: '#FEF3C7', text: '#92400E' },
  announcement: { bg: '#F3E8FF', text: '#6B21A8' },
};

const actionIcons: Record<string, React.ReactNode> = {
  send: <SendIcon />,
  star: <StarIcon />,
  calendar: <CalendarIcon />,
  link: <LinkIcon />,
  help: <SearchIcon />,
};

// Helper to lighten/darken hex colors for subtle backgrounds
const hexToRgba = (hex: string, alpha: number) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Shift hex color brightness by amount (-255 to 255)
const adjustBrightness = (hex: string, amount: number) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = Math.max(0, Math.min(255, parseInt(h.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(h.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(h.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const HomeView = () => {
  const { theme, navigatePortal, setPortalTab, updates, loadUpdates, setSelectedUpdateId, setOpen, toggleExpanded, isExpanded } = useWidgetStore();
  const colors = usePortalColors();
  const portal = theme.portal;
  const primary = theme.header.backgroundColor;
  const headerText = theme.header.textColor;
  // Accent color for icons — sendButtonColor is always vibrant/visible on any background
  const accent = theme.input.sendButtonColor || primary;

  useEffect(() => {
    if (portal?.showLatestUpdates && updates.length === 0) {
      loadUpdates();
    }
  }, [portal?.showLatestUpdates]);

  if (!portal) return null;

  return (
    <div className="lr-flex lr-flex-col lr-flex-1 lr-overflow-y-auto lr-scrollbar-hide" style={{ backgroundColor: colors.chatBg }}>
      {/* Hero header section — gradient background for depth */}
      <div
        className="lr-relative lr-shrink-0 lr-animate-fade-slide-down lr-overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${hexToRgba(primary, 0.85)} 50%, ${adjustBrightness(primary, -15)} 100%)`,
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
        {/* Expand + Close buttons */}
        <div className="lr-absolute lr-top-3 lr-right-3 lr-flex lr-items-center lr-gap-1">
          <button
            onClick={toggleExpanded}
            className="lr-p-1.5 lr-rounded-lg lr-transition-opacity hover:lr-opacity-70"
            style={{ color: headerText, background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-label={isExpanded ? 'Collapse chat' : 'Expand chat'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isExpanded ? (
                <>
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              ) : (
                <>
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              )}
            </svg>
          </button>
          {theme.header.showCloseButton && (
          <button
            onClick={() => setOpen(false)}
            className="lr-p-1.5 lr-rounded-lg lr-transition-opacity hover:lr-opacity-70"
            style={{ color: headerText }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          )}
        </div>

        <div className="lr-px-6 lr-pt-6 lr-pb-5">
          {/* Team avatars */}
          {portal.showTeamAvatars && theme.messages.showAvatar && theme.messages.avatarUrl && (
            <div className="lr-mb-3">
              <img
                src={theme.messages.avatarUrl}
                alt=""
                className="lr-w-10 lr-h-10 lr-rounded-full lr-object-cover lr-border-2"
                style={{ borderColor: hexToRgba(headerText, 0.3) }}
              />
            </div>
          )}

          <h2
            className="lr-text-2xl lr-font-bold lr-mb-1.5 lr-leading-tight"
            style={{ color: headerText }}
          >
            {portal.greeting}
          </h2>
          <p
            className="lr-text-sm lr-opacity-80"
            style={{ color: headerText }}
          >
            {portal.subheading}
          </p>
        </div>

      </div>

      {/* Search — positioned below hero, overlapping upward */}
      {portal.showSearch && (
        <div className="lr-px-5 lr-relative" style={{ marginTop: -20, zIndex: 10 }}>
          <button
            onClick={() => navigatePortal('search')}
            className="lr-w-full lr-flex lr-items-center lr-gap-2.5 lr-px-4 lr-py-3 lr-rounded-xl lr-text-sm lr-text-left lr-transition-all"
            style={{
              backgroundColor: theme.input.backgroundColor,
              color: colors.mutedText,
              border: `1px solid ${theme.input.borderColor}`,
              boxShadow: `${colors.cardStyle}, 0 8px 24px rgba(0,0,0,0.08)`,
            }}
          >
            <SearchIcon />
            <span>{portal.searchPlaceholder}</span>
          </button>
        </div>
      )}

      {/* Content below hero */}
      <div
        className="lr-flex lr-flex-col lr-flex-1 lr-px-5"
        style={{
          paddingTop: portal.showSearch ? 16 : 16,
          backgroundImage: colors.contentGradient,
        }}
      >
        {/* Quick Actions */}
        <div className="lr-space-y-2.5 lr-mb-5 lr-stagger">
          {portal.quickActions
            .filter((a) => a.enabled)
            .map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  if (action.action === 'messages') navigatePortal('messages');
                  else if (action.action === 'feedback') navigatePortal('feedback');
                  else if (action.action === 'help') navigatePortal('search');
                  else if (action.action === 'url' && action.url) {
                    window.open(action.url, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="lr-w-full lr-flex lr-items-center lr-gap-3.5 lr-px-4 lr-py-3.5 lr-rounded-xl lr-text-sm lr-font-medium lr-transition-all lr-card-interactive"
                style={{
                  backgroundColor: theme.input.backgroundColor,
                  color: theme.messages.assistantTextColor,
                  border: `1px solid ${theme.input.borderColor}`,
                  boxShadow: colors.cardStyle,
                }}
              >
                <div
                  className="lr-w-9 lr-h-9 lr-rounded-lg lr-flex lr-items-center lr-justify-center lr-shrink-0 lr-overflow-hidden"
                  style={{ backgroundColor: hexToRgba(accent, 0.1), color: accent }}
                >
                  {action.imageUrl ? (
                    <img
                      src={action.imageUrl}
                      alt=""
                      className="lr-w-full lr-h-full lr-object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).nextElementSibling as HTMLElement).style.removeProperty('display'); }}
                    />
                  ) : null}
                  <span style={action.imageUrl ? { display: 'none' } : undefined}>
                    {actionIcons[action.icon] || <SendIcon />}
                  </span>
                </div>
                <div className="lr-flex-1 lr-text-left">
                  <span className="lr-block">{action.label}</span>
                  {action.description && (
                    <span className="lr-block lr-text-xs lr-font-normal lr-mt-0.5" style={{ color: colors.secondaryText }}>
                      {action.description}
                    </span>
                  )}
                </div>
                <span className="lr-shrink-0" style={{ color: colors.chevron }}>
                  {action.action === 'url' ? <ExternalLinkIcon /> : <ChevronRight />}
                </span>
              </button>
            ))}
        </div>

        {/* Latest Updates */}
        {portal.showLatestUpdates && updates.length > 0 && (
          <div className="lr-pb-5">
            <div className="lr-flex lr-items-center lr-justify-between lr-mb-3">
              <h3
                className="lr-text-xs lr-font-bold lr-uppercase lr-tracking-wider"
                style={{ color: colors.secondaryText }}
              >
                {portal.latestUpdatesTitle}
              </h3>
              <button
                onClick={() => setPortalTab('help')}
                className="lr-text-xs lr-font-semibold lr-transition-opacity hover:lr-opacity-70"
                style={{ color: accent }}
              >
                {t(theme.translations, 'viewAll')}
              </button>
            </div>
            <div className="lr-space-y-2 lr-stagger">
              {updates.slice(0, 3).map((update) => {
                const labelStyle = LABEL_COLORS[update.label] || LABEL_COLORS.new;
                return (
                  <button
                    key={update.id}
                    onClick={() => setSelectedUpdateId(update.id)}
                    className="lr-w-full lr-text-left lr-p-3.5 lr-rounded-xl lr-transition-all lr-card-interactive"
                    style={{
                      backgroundColor: theme.input.backgroundColor,
                      border: `1px solid ${theme.input.borderColor}`,
                      boxShadow: colors.cardStyle,
                    }}
                  >
                    {update.coverImage && (
                      <img
                        src={update.coverImage}
                        alt=""
                        className="lr-w-full lr-rounded-lg lr-mb-3"
                      />
                    )}
                    <div className="lr-flex lr-items-center lr-gap-2 lr-mb-1.5">
                      <span
                        className="lr-text-[10px] lr-font-bold lr-px-2 lr-py-0.5 lr-rounded-full lr-uppercase"
                        style={{ backgroundColor: labelStyle.bg, color: labelStyle.text }}
                      >
                        {update.label}
                      </span>
                      {update.publishedAt && (
                        <span className="lr-text-[10px]" style={{ color: colors.mutedText }}>
                          {new Date(update.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p
                      className="lr-text-sm lr-font-semibold lr-truncate"
                      style={{ color: theme.messages.assistantTextColor }}
                    >
                      {update.title}
                    </p>
                    {update.summary && (
                      <p className="lr-text-xs lr-mt-1 lr-line-clamp-2" style={{ color: colors.secondaryText }}>
                        {update.summary}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
