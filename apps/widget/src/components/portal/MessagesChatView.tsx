import { useWidgetStore } from '../../store';
import { MessageList } from '../MessageList';
import { ChatInput } from '../ChatInput';
import { PortalHeader } from './PortalHeader';

export const MessagesChatView = () => {
  const { navigatePortal, hasEnded, isLoading } = useWidgetStore();

  return (
    <div className="lr-flex lr-flex-col lr-flex-1 lr-overflow-hidden">
      <PortalHeader
        title={hasEnded ? 'Conversation ended' : undefined}
        showBotInfo={!hasEnded}
        onBack={() => {
          navigatePortal('messages');
        }}
      />
      {isLoading ? (
        <div className="lr-flex lr-items-center lr-justify-center lr-flex-1">
          <div className="lr-w-6 lr-h-6 lr-border-2 lr-border-current lr-border-t-transparent lr-rounded-full lr-animate-spin" style={{ opacity: 0.4 }} />
        </div>
      ) : (
        <>
          <MessageList />
          {!hasEnded && <ChatInput />}
        </>
      )}
    </div>
  );
};
