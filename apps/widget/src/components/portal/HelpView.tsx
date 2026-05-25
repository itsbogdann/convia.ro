import { useEffect, useState } from 'react';
import { useWidgetStore } from '../../store';
import { PortalLoader } from './PortalLoader';
import { usePortalColors } from './usePortalColors';
import { t } from '../../utils/translations';

const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: '#DCFCE7', text: '#166534' },
  improvement: { bg: '#DBEAFE', text: '#1E40AF' },
  fix: { bg: '#FEF3C7', text: '#92400E' },
  announcement: { bg: '#F3E8FF', text: '#6B21A8' },
};

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const HelpView = () => {
  const {
    theme,
    faqs,
    faqsLoading,
    loadFaqs,
    updates,
    updatesLoading,
    loadUpdates,
    setSelectedUpdateId,
  } = useWidgetStore();
  const colors = usePortalColors();
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  useEffect(() => {
    if (faqs.length === 0) loadFaqs();
    if (updates.length === 0) loadUpdates();
  }, []);

  const isLoading = faqsLoading && updatesLoading;

  // Group FAQs by category
  const faqsByCategory = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const categories = Object.keys(faqsByCategory);
  const hasFaqs = categories.length > 0;
  const hasUpdates = updates.length > 0;

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div
        className="lr-flex lr-flex-col lr-flex-1 lr-items-center lr-justify-center lr-animate-fade-in"
        style={{ backgroundColor: colors.chatBg }}
      >
        <PortalLoader />
      </div>
    );
  }

  if (!hasFaqs && !hasUpdates) {
    return (
      <div
        className="lr-flex lr-flex-col lr-flex-1 lr-items-center lr-justify-center lr-py-12 lr-px-5 lr-animate-fade-in"
        style={{ backgroundColor: colors.chatBg }}
      >
        <div
          className="lr-w-12 lr-h-12 lr-rounded-full lr-flex lr-items-center lr-justify-center lr-mb-3"
          style={{ backgroundColor: `${theme.header.backgroundColor}15` }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.header.backgroundColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <p className="lr-text-sm lr-font-medium lr-mb-1" style={{ color: theme.messages.assistantTextColor }}>
          {t(theme.translations, 'noHelpContent')}
        </p>
        <p className="lr-text-xs" style={{ color: colors.mutedText }}>
          {t(theme.translations, 'checkBackLater')}
        </p>
      </div>
    );
  }

  return (
    <div
      className="lr-flex lr-flex-col lr-flex-1 lr-overflow-y-auto"
      style={{ backgroundColor: colors.chatBg }}
    >
      {/* FAQs Section */}
      {hasFaqs && (
        <div className="lr-px-4 lr-pt-4 lr-pb-2">
          <h3
            className="lr-text-xs lr-font-bold lr-uppercase lr-tracking-wider lr-mb-3"
            style={{ color: colors.secondaryText }}
          >
            {t(theme.translations, 'faqTitle')}
          </h3>

          {categories.map((category) => (
            <div key={category} className="lr-mb-3">
              {/* Category label */}
              {categories.length > 1 && (
                <p
                  className="lr-text-[11px] lr-font-semibold lr-mb-1.5 lr-uppercase lr-tracking-wide"
                  style={{ color: theme.input.sendButtonColor || theme.header.backgroundColor }}
                >
                  {category}
                </p>
              )}

              {/* FAQ items */}
              <div className="lr-space-y-1.5 lr-stagger">
                {faqsByCategory[category].map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;

                  return (
                    <div
                      key={faq.id}
                      className="lr-rounded-xl lr-overflow-hidden lr-transition-all lr-card-interactive"
                      style={{
                        backgroundColor: theme.input.backgroundColor,
                        border: `1px solid ${theme.input.borderColor}`,
                        boxShadow: colors.cardStyle,
                      }}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="lr-w-full lr-flex lr-items-center lr-justify-between lr-px-3.5 lr-py-3 lr-text-left lr-transition-all"
                      >
                        <span
                          className="lr-text-sm lr-font-medium lr-flex-1 lr-pr-2"
                          style={{ color: theme.messages.assistantTextColor }}
                        >
                          {faq.question}
                        </span>
                        <span style={{ color: colors.mutedText }}>
                          <ChevronIcon expanded={isExpanded} />
                        </span>
                      </button>

                      <div className={`lr-faq-content ${isExpanded ? 'lr-expanded' : ''}`}>
                        <div>
                          <div
                            className="lr-px-3.5 lr-pb-3 lr-text-sm lr-leading-relaxed lr-whitespace-pre-wrap"
                            style={{
                              color: colors.secondaryText,
                              borderTop: `1px solid ${theme.input.borderColor}`,
                              paddingTop: 12,
                            }}
                          >
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Updates Section */}
      {hasUpdates && (
        <div className="lr-px-4 lr-pt-2 lr-pb-4">
          <h3
            className="lr-text-xs lr-font-bold lr-uppercase lr-tracking-wider lr-mb-3"
            style={{ color: colors.secondaryText }}
          >
            {t(theme.translations, 'latestUpdatesTitle')}
          </h3>

          <div className="lr-space-y-2 lr-stagger">
            {updates.slice(0, 5).map((update) => {
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
                  <div className="lr-flex lr-items-center lr-gap-2 lr-mb-1.5">
                    <span
                      className="lr-text-[10px] lr-font-bold lr-px-1.5 lr-py-0.5 lr-rounded-full lr-uppercase"
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
  );
};
