import { useEffect } from 'react';
import { useWidgetStore } from '../../store';
import { PortalHeader } from './PortalHeader';
import { PortalLoader } from './PortalLoader';
import { usePortalColors } from './usePortalColors';
import { MarkdownText } from '../MarkdownText';

const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: '#DCFCE7', text: '#166534' },
  improvement: { bg: '#DBEAFE', text: '#1E40AF' },
  fix: { bg: '#FEF3C7', text: '#92400E' },
  announcement: { bg: '#F3E8FF', text: '#6B21A8' },
};

export const UpdatesView = () => {
  const {
    theme,
    updates,
    updatesLoading,
    loadUpdates,
    portalView,
    portalTab,
    selectedUpdateId,
    setSelectedUpdateId,
    navigatePortal,
  } = useWidgetStore();
  const colors = usePortalColors();

  useEffect(() => {
    if (updates.length === 0) {
      loadUpdates();
    }
  }, []);

  // Detail view
  if (portalView === 'updates:detail' && selectedUpdateId) {
    const update = updates.find((u) => u.id === selectedUpdateId);
    if (!update) return null;

    const labelStyle = LABEL_COLORS[update.label] || LABEL_COLORS.new;

    return (
      <div className="lr-flex lr-flex-col lr-flex-1 lr-overflow-hidden">
        <PortalHeader
          title="Update"
          onBack={() => {
            setSelectedUpdateId(null);
            if (portalTab === 'help') navigatePortal('help');
          }}
        />
        <div
          className="lr-flex lr-flex-col lr-flex-1 lr-overflow-y-auto lr-px-5 lr-py-4 lr-animate-fade-slide-up"
          style={{ backgroundColor: colors.chatBg }}
        >
          {update.coverImage && (
            <img
              src={update.coverImage}
              alt=""
              className="lr-w-full lr-rounded-xl lr-mb-4"
            />
          )}
          <div className="lr-flex lr-items-center lr-gap-2 lr-mb-3">
            <span
              className="lr-text-[10px] lr-font-semibold lr-px-2 lr-py-0.5 lr-rounded-full lr-uppercase"
              style={{ backgroundColor: labelStyle.bg, color: labelStyle.text }}
            >
              {update.label}
            </span>
            {update.publishedAt && (
              <span className="lr-text-xs" style={{ color: colors.mutedText }}>
                {new Date(update.publishedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
          <h2 className="lr-text-lg lr-font-bold lr-mb-3" style={{ color: theme.messages.assistantTextColor }}>
            {update.title}
          </h2>
          {update.summary && (
            <p className="lr-text-sm lr-mb-4 lr-font-medium" style={{ color: colors.secondaryText }}>
              {update.summary}
            </p>
          )}
          <div
            className="lr-text-sm lr-leading-relaxed"
            style={{ color: theme.messages.assistantTextColor }}
          >
            <MarkdownText content={update.content} />
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="lr-flex lr-flex-col lr-flex-1 lr-overflow-hidden">
      <PortalHeader
        title="Updates"
        backTo={portalTab === 'help' ? undefined : portalTab === 'changelog' ? undefined : 'home'}
        onBack={portalTab === 'help' ? () => navigatePortal('help') : undefined}
      />
      <div
        className="lr-flex-1 lr-overflow-y-auto"
        style={{ backgroundColor: colors.chatBg }}
      >
        {updatesLoading ? (
          <PortalLoader />
        ) : updates.length === 0 ? (
          <div
            className="lr-flex lr-flex-col lr-items-center lr-justify-center lr-py-12 lr-px-5 lr-animate-fade-in"
          >
            <p className="lr-text-sm lr-font-medium lr-mb-1" style={{ color: theme.messages.assistantTextColor }}>
              No updates yet
            </p>
            <p className="lr-text-xs" style={{ color: colors.mutedText }}>
              Check back later for product updates
            </p>
          </div>
        ) : (
          <div className="lr-px-4 lr-py-3 lr-space-y-3 lr-stagger">
            {updates.map((update) => {
              const labelStyle = LABEL_COLORS[update.label] || LABEL_COLORS.new;
              return (
                <button
                  key={update.id}
                  onClick={() => setSelectedUpdateId(update.id)}
                  className="lr-w-full lr-text-left lr-p-4 lr-rounded-xl lr-transition-all lr-card-interactive"
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
                  <div className="lr-flex lr-items-center lr-gap-2 lr-mb-2">
                    <span
                      className="lr-text-[10px] lr-font-semibold lr-px-1.5 lr-py-0.5 lr-rounded-full lr-uppercase"
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
                  <p className="lr-text-sm lr-font-semibold lr-mb-1" style={{ color: theme.messages.assistantTextColor }}>
                    {update.title}
                  </p>
                  {update.summary && (
                    <p className="lr-text-xs lr-line-clamp-2" style={{ color: colors.secondaryText }}>
                      {update.summary}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
