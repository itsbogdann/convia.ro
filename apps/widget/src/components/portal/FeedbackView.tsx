import { useWidgetStore } from '../../store';
import { PortalHeader } from './PortalHeader';
import { usePortalColors } from './usePortalColors';
import { t } from '../../utils/translations';

const StarFilled = ({ color }: { color: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarEmpty = ({ color }: { color: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CheckCircle = ({ color }: { color: string }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const FeedbackView = () => {
  const {
    theme,
    portalView,
    feedbackRating,
    feedbackComment,
    feedbackEmail,
    feedbackSubmitting,
    setFeedbackRating,
    setFeedbackComment,
    setFeedbackEmail,
    submitFeedback,
    navigatePortal,
  } = useWidgetStore();
  const colors = usePortalColors();
  const primary = theme.header.backgroundColor;

  // Success state
  if (portalView === 'feedback:success') {
    return (
      <div className="lr-flex lr-flex-col lr-flex-1 lr-overflow-hidden">
        <PortalHeader title={t(theme.translations, 'feedbackTitle')} backTo="home" />
        <div
          className="lr-flex lr-flex-col lr-items-center lr-justify-center lr-flex-1 lr-px-6 lr-animate-scale-fade-in"
          style={{ backgroundColor: colors.chatBg }}
        >
          <CheckCircle color="#22C55E" />
          <h3 className="lr-text-lg lr-font-semibold lr-mt-4 lr-mb-2" style={{ color: theme.messages.assistantTextColor }}>
            {t(theme.translations, 'thankYou')}
          </h3>
          <p className="lr-text-sm lr-text-center lr-mb-6" style={{ color: colors.secondaryText }}>
            {t(theme.translations, 'feedbackThanks')}
          </p>
          <button
            onClick={() => navigatePortal('home')}
            className="lr-px-6 lr-py-2.5 lr-rounded-lg lr-text-sm lr-font-medium lr-transition-opacity hover:lr-opacity-90"
            style={{
              backgroundColor: primary,
              color: theme.header.textColor,
            }}
          >
            {t(theme.translations, 'backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lr-flex lr-flex-col lr-flex-1 lr-overflow-hidden">
      <PortalHeader title={t(theme.translations, 'leaveFeedbackTitle')} backTo="home" />
      <div
        className="lr-flex lr-flex-col lr-flex-1 lr-overflow-y-auto lr-px-5 lr-py-6 lr-animate-fade-in"
        style={{ backgroundColor: colors.chatBg }}
      >
        {/* Rating */}
        <div className="lr-mb-6">
          <label className="lr-text-sm lr-font-medium lr-mb-3 lr-block" style={{ color: theme.messages.assistantTextColor }}>
            {t(theme.translations, 'rateExperience')}
          </label>
          <div className="lr-flex lr-gap-1 lr-justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setFeedbackRating(star)}
                className="lr-p-1 lr-transition-transform hover:lr-scale-110"
              >
                {star <= feedbackRating ? (
                  <StarFilled color="#F59E0B" />
                ) : (
                  <StarEmpty color={colors.emptyStar} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="lr-mb-4">
          <label className="lr-text-sm lr-font-medium lr-mb-1.5 lr-block" style={{ color: theme.messages.assistantTextColor }}>
            {t(theme.translations, 'tellUsMore')}
          </label>
          <textarea
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder={t(theme.translations, 'commentPlaceholder')}
            rows={4}
            className="lr-w-full lr-px-3 lr-py-2.5 lr-rounded-xl lr-text-sm lr-resize-none lr-outline-none lr-transition-colors focus:lr-ring-2"
            style={{
              backgroundColor: theme.input.backgroundColor,
              color: theme.input.textColor,
              border: `1px solid ${theme.input.borderColor}`,
            }}
          />
        </div>

        {/* Email */}
        <div className="lr-mb-6">
          <label className="lr-text-sm lr-font-medium lr-mb-1.5 lr-block" style={{ color: theme.messages.assistantTextColor }}>
            {t(theme.translations, 'emailOptional')}
          </label>
          <input
            type="email"
            value={feedbackEmail}
            onChange={(e) => setFeedbackEmail(e.target.value)}
            placeholder="your@email.com"
            className="lr-w-full lr-px-3 lr-py-2.5 lr-rounded-xl lr-text-sm lr-outline-none lr-transition-colors focus:lr-ring-2"
            style={{
              backgroundColor: theme.input.backgroundColor,
              color: theme.input.textColor,
              border: `1px solid ${theme.input.borderColor}`,
            }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={submitFeedback}
          disabled={feedbackRating === 0 || feedbackSubmitting}
          className="lr-w-full lr-py-2.5 lr-rounded-xl lr-text-sm lr-font-medium lr-transition-opacity disabled:lr-opacity-50"
          style={{
            backgroundColor: primary,
            color: theme.header.textColor,
          }}
        >
          {feedbackSubmitting ? t(theme.translations, 'submitting') : t(theme.translations, 'submitFeedback')}
        </button>
      </div>
    </div>
  );
};
