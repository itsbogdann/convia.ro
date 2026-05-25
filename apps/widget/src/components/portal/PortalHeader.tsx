import { useWidgetStore } from '../../store';
import type { PortalView } from '../../types';
import { LogoIcon } from '../LogoIcon';
import { sanitizeSvg } from '../../utils/sanitize';

interface PortalHeaderProps {
  title?: string;
  showBotInfo?: boolean;
  onBack?: () => void;
  backTo?: PortalView;
  rightAction?: React.ReactNode;
}

const ExpandIcon = ({ expanded, color }: { expanded: boolean; color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {expanded ? (
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
);

export const PortalHeader = ({ title, showBotInfo, onBack, backTo, rightAction }: PortalHeaderProps) => {
  const { theme, navigatePortal, setOpen, toggleExpanded, isExpanded } = useWidgetStore();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigatePortal(backTo);
    }
  };

  const showBack = onBack || backTo;

  return (
    <div
      className="lr-flex lr-items-center lr-px-4 lr-py-3 lr-shrink-0 lr-relative lr-overflow-hidden"
      style={{
        backgroundColor: theme.header.backgroundColor,
        color: theme.header.textColor,
        minHeight: 52,
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
      {showBack && (
        <button
          onClick={handleBack}
          className="lr-mr-2 lr-p-1 lr-rounded-lg lr-transition-opacity hover:lr-opacity-70"
          style={{ color: theme.header.textColor }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {showBotInfo ? (
        <>
          <div className="lr-relative lr-shrink-0 lr-mr-2">
            <div
              className="lr-w-8 lr-h-8 lr-rounded-full lr-flex lr-items-center lr-justify-center lr-overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {theme.messages.avatarUrl || theme.header.avatarUrl ? (
                <img
                  src={theme.messages.avatarUrl || theme.header.avatarUrl}
                  alt="Agent"
                  className="lr-w-full lr-h-full lr-object-cover"
                />
              ) : theme.messages.avatarSvg ? (
                <div
                  className="lr-w-full lr-h-full"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(theme.messages.avatarSvg) }}
                />
              ) : (
                <LogoIcon size={18} color={theme.header.textColor} className="lr-w-[18px] lr-h-[18px]" />
              )}
            </div>
            <span
              className="lr-absolute lr-bottom-0 lr-right-0 lr-w-3 lr-h-3 lr-rounded-full lr-bg-green-400"
              style={{ border: '2px solid', borderColor: theme.header.backgroundColor }}
            />
          </div>
          <div className="lr-flex-1 lr-min-w-0">
            <span className="lr-font-semibold lr-text-sm lr-truncate lr-block">{theme.header.title}</span>
            {theme.header.subtitle && (
              <span className="lr-text-xs lr-opacity-80 lr-truncate lr-block">{theme.header.subtitle}</span>
            )}
          </div>
        </>
      ) : (
        <span className="lr-font-semibold lr-text-sm lr-flex-1 lr-truncate">{title}</span>
      )}
      {rightAction}
      <button
        onClick={toggleExpanded}
        className="lr-ml-2 lr-p-1 lr-rounded-lg lr-transition-opacity hover:lr-opacity-70 lr-relative"
        style={{ color: theme.header.textColor, background: 'transparent', border: 'none', cursor: 'pointer' }}
        aria-label={isExpanded ? 'Collapse chat' : 'Expand chat'}
      >
        <ExpandIcon expanded={isExpanded} color={theme.header.textColor} />
      </button>
      {theme.header.showCloseButton && (
        <button
          onClick={() => setOpen(false)}
          className="lr-ml-1 lr-p-1 lr-rounded-lg lr-transition-opacity hover:lr-opacity-70 lr-relative"
          style={{ color: theme.header.textColor }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};
