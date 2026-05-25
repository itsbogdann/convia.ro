import { useEffect } from 'react';
import { useWidgetStore } from '../../store';
import { PortalHeader } from './PortalHeader';
import { PortalLoader } from './PortalLoader';
import { usePortalColors } from './usePortalColors';
import { t } from '../../utils/translations';

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const formatTime = (dateStr: string | null, translations?: import('../../types').WidgetTranslations) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t(translations, 'justNow');
  if (diffMins < 60) return t(translations, 'minutesAgo', { n: diffMins });
  if (diffHours < 24) return t(translations, 'hoursAgo', { n: diffHours });
  if (diffDays < 7) return t(translations, 'daysAgo', { n: diffDays });
  return date.toLocaleDateString();
};

const STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  waiting: '#F59E0B',
  human_takeover: '#3B82F6',
  ended: '#9CA3AF',
  archived: '#6B7280',
};

export const MessagesListView = () => {
  const {
    theme,
    conversationsList,
    conversationsLoading,
    loadConversationsList,
    openConversation,
    startNewPortalConversation,
  } = useWidgetStore();
  const colors = usePortalColors();

  useEffect(() => {
    loadConversationsList();
  }, []);

  return (
    <div className="lr-flex lr-flex-col lr-flex-1 lr-overflow-hidden">
      <PortalHeader
        title={t(theme.translations, 'conversationsTitle')}
        backTo="home"
      />

      <div className="lr-flex-1 lr-overflow-y-auto" style={{ backgroundColor: colors.chatBg }}>
        {conversationsLoading ? (
          <PortalLoader />
        ) : conversationsList.length === 0 ? (
          <div
            className="lr-flex lr-flex-col lr-items-center lr-justify-center lr-py-12 lr-px-5 lr-animate-fade-in"
          >
            <div className="lr-p-3 lr-rounded-full lr-mb-3" style={{ backgroundColor: `${theme.header.backgroundColor}15` }}>
              <MessageIcon />
            </div>
            <p className="lr-text-sm lr-font-medium lr-mb-1" style={{ color: theme.messages.assistantTextColor }}>
              {t(theme.translations, 'noConversations')}
            </p>
            <p className="lr-text-xs lr-mb-4" style={{ color: colors.mutedText }}>
              {t(theme.translations, 'startNewConversation')}
            </p>
            <button
              onClick={startNewPortalConversation}
              className="lr-flex lr-items-center lr-gap-2 lr-px-4 lr-py-2.5 lr-rounded-lg lr-text-sm lr-font-medium lr-transition-opacity hover:lr-opacity-90"
              style={{
                backgroundColor: theme.header.backgroundColor,
                color: theme.header.textColor,
              }}
            >
              <PlusIcon />
              {t(theme.translations, 'newConversation')}
            </button>
          </div>
        ) : (
          <div>
            {/* New Conversation button */}
            <div className="lr-px-4 lr-pt-3 lr-pb-1">
              <button
                onClick={startNewPortalConversation}
                className="lr-flex lr-items-center lr-justify-center lr-gap-2 lr-w-full lr-py-2.5 lr-rounded-lg lr-text-sm lr-font-medium lr-transition-opacity hover:lr-opacity-90"
                style={{
                  backgroundColor: theme.header.backgroundColor,
                  color: theme.header.textColor,
                }}
              >
                <PlusIcon />
                {t(theme.translations, 'newConversation')}
              </button>
            </div>

            {/* Conversation list */}
            <div className="lr-stagger">
              {conversationsList.map((conv, index) => (
                <div key={conv.id}>
                  <button
                    onClick={() => openConversation(conv.id)}
                    className="lr-w-full lr-text-left lr-px-4 lr-py-3 lr-transition-colors hover:lr-opacity-80"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <div className="lr-flex lr-items-center lr-justify-between lr-mb-1">
                      <div className="lr-flex lr-items-center lr-gap-2">
                        <div
                          className="lr-w-2 lr-h-2 lr-rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[conv.status] || '#9CA3AF' }}
                        />
                        <span className="lr-text-xs lr-font-medium" style={{ color: colors.secondaryText }}>
                          {conv.status === 'active' ? 'Active' : conv.status === 'ended' ? 'Ended' : conv.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="lr-text-[10px]" style={{ color: colors.mutedText }}>
                        {formatTime(conv.lastMessageAt || conv.updatedAt, theme.translations)}
                      </span>
                    </div>
                    <p className="lr-text-sm lr-truncate" style={{ color: theme.messages.assistantTextColor }}>
                      {conv.lastMessage || 'No messages'}
                    </p>
                    <p className="lr-text-[10px] lr-mt-0.5" style={{ color: colors.mutedText }}>
                      {conv.messageCount} message{conv.messageCount !== 1 ? 's' : ''}
                    </p>
                  </button>
                  {index < conversationsList.length - 1 && (
                    <div className="lr-mx-4 lr-h-px" style={{ backgroundColor: theme.input.borderColor }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
