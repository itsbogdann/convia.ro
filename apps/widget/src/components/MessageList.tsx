import { useRef, useEffect } from 'react';
import { useWidgetStore } from '../store';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { CardMessage } from './CardMessage';
import { CardCarousel } from './CardCarousel';
import { PreChatForm } from './PreChatForm';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { QuickReply } from '../types';
import { t } from '../utils/translations';

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
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex; // fallback to original if parsing fails
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const MessageList = () => {
  const { messages, isLoading, theme, sendQuickReply, sendMessage, hasEnded, isFormVisible, formData, submitPreChatForm, dismissForm } = useWidgetStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when content height changes (new messages, typing indicator, etc.)
  // During streaming, use instant scroll (the bubble height transition is already smooth).
  // For non-streaming changes (new message appears), use smooth scroll.
  const isStreamingRef = useRef(false);
  isStreamingRef.current = messages.some((m) => m.isStreaming);

  useEffect(() => {
    const content = contentRef.current;
    const scroll = scrollRef.current;
    if (!content || !scroll) return;

    const observer = new ResizeObserver(() => {
      const behavior = isStreamingRef.current ? 'instant' : 'smooth';
      scroll.scrollTo({ top: scroll.scrollHeight, behavior: behavior as ScrollBehavior });
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // Get quick replies from the last message
  const lastMessage = messages[messages.length - 1];
  const quickReplies = lastMessage?.quickReplies || [];

  const isImageBg = theme.chat.backgroundPattern === 'image' && theme.chat.backgroundImage;
  const blurPx = theme.chat.backgroundBlur ?? 8;

  // Glass morphism settings
  const glassEnabled = theme.chat.glassEffect === true;
  const glassBlur = theme.chat.glassBlur ?? 12;
  const glassOpacity = theme.chat.glassOpacity ?? 0.7;

  // Build background styles (for non-image patterns)
  const getBackgroundStyle = (): React.CSSProperties => {
    if (isImageBg) return {};

    const base: React.CSSProperties = {};

    // When glass effect is on, use semi-transparent background instead of solid
    if (glassEnabled) {
      base.backgroundColor = hexToRgba(theme.chat.backgroundColor, glassOpacity);
    } else {
      base.backgroundColor = theme.chat.backgroundColor;
    }

    if (theme.chat.backgroundPattern === 'gradient' && theme.chat.backgroundGradient) {
      base.background = theme.chat.backgroundGradient;
    } else if (theme.chat.backgroundPattern === 'dots') {
      const dotColor = theme.chat.backgroundPatternColor || 'rgba(0,0,0,0.05)';
      base.backgroundImage = `radial-gradient(${dotColor} 1px, transparent 1px)`;
      base.backgroundSize = '20px 20px';
    }

    // Apply backdrop-filter for glass effect
    if (glassEnabled) {
      base.backdropFilter = `blur(${glassBlur}px)`;
      (base as Record<string, unknown>).WebkitBackdropFilter = `blur(${glassBlur}px)`;
    }

    return base;
  };

  const handleQuickReply = (reply: QuickReply) => {
    sendQuickReply(reply);
  };

  const handleCardButton = (value: string, label: string) => {
    sendMessage(value, label);
  };

  // Helper to extract cards from uiComponent (handles both direct and metadata-nested formats)
  const getCards = (uiComponent: any) => {
    if (!uiComponent || uiComponent.type !== 'cards') return null;
    const cards = uiComponent.cards || uiComponent.metadata?.cards;
    if (!cards || !Array.isArray(cards) || cards.length === 0) return null;
    const displayMode = uiComponent.displayMode || uiComponent.metadata?.displayMode || 'single';
    return { cards, displayMode };
  };

  return (
    <div
      className="lr-flex-1 lr-relative lr-overflow-hidden"
      style={{ backgroundColor: theme.chat.backgroundColor }}
    >
      {/* Blurred background image layer */}
      {isImageBg && (
        <div
          className="lr-absolute lr-inset-0 lr-z-0"
          style={{
            backgroundImage: `url(${theme.chat.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(${blurPx}px)`,
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Scrollable messages */}
      <div
        ref={scrollRef}
        className="lr-relative lr-z-10 lr-h-full lr-overflow-y-auto lr-p-4 lr-scroll-smooth"
        style={{
          ...getBackgroundStyle(),
          overscrollBehavior: 'contain',
          // For image backgrounds, apply glass effect directly on the scroll container
          ...(isImageBg && glassEnabled
            ? {
                backgroundColor: hexToRgba(theme.chat.backgroundColor, glassOpacity),
                backdropFilter: `blur(${glassBlur}px)`,
                WebkitBackdropFilter: `blur(${glassBlur}px)`,
              }
            : {}),
        }}
      >
      <div ref={contentRef}>
      {/* Loading state */}
      {isLoading && messages.length === 0 && (
        <div className="lr-flex lr-flex-col lr-items-center lr-justify-center lr-h-full">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="lr-animate-pulse">
            <path fillRule="evenodd" clipRule="evenodd" d="M8.60917 36.9866C5.3218 33.3783 3.32191 28.6146 3.32191 23.3914C3.32191 12.1271 12.6184 2.99568 24.0861 2.99568C35.5539 2.99568 44.8504 12.1271 44.8504 23.3914C44.8504 31.3561 40.2009 38.2516 33.4239 41.6092C29.2775 43.771 24.5472 44.9957 19.5258 44.9957C13.3731 44.9957 7.65739 43.157 2.91748 40.0088C2.91748 40.0088 6.09606 39.6621 8.60835 36.9874L8.60917 36.9866ZM33.8397 33.4855C39.2117 28.1137 39.2117 19.4042 33.8397 14.0322C31.3487 11.5414 28.1401 10.2063 24.8794 10.0256V10.0248C24.781 7.57835 26.0979 5.92616 26.1043 5.91811L26.1036 5.91824L26.1045 5.9171C22.3569 6.64104 18.7783 8.45409 15.8764 11.356C13.6509 13.5814 12.0663 16.205 11.1216 18.9972C11.2591 18.6329 11.4124 18.2733 11.5814 17.9193C11.3865 18.4167 11.2103 18.925 11.051 19.445C9.47775 24.2209 10.5882 29.6873 14.3864 33.4855C19.7584 38.8575 28.4679 38.8575 33.8397 33.4855Z" fill="#c0c5cd"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M17.1299 22.345V24.0539V25.1922C17.1299 26.3283 18.0509 27.2494 19.1872 27.2494C20.3234 27.2494 21.2443 26.3283 21.2443 25.1922V24.0522V22.345C21.2443 21.2089 20.3234 20.2877 19.1872 20.2877C18.0509 20.2877 17.1299 21.2089 17.1299 22.345Z" fill="#c0c5cd"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M27.313 22.345V24.0539V25.1922C27.313 26.3283 28.2341 27.2494 29.3702 27.2494C30.5064 27.2494 31.4275 26.3283 31.4275 25.1922V24.0522V22.345C31.4275 21.2089 30.5064 20.2877 29.3702 20.2877C28.2341 20.2877 27.313 21.2089 27.313 22.345Z" fill="#c0c5cd"/>
          </svg>
        </div>
      )}

      {/* Messages */}
      <LayoutGroup>
        {messages.map((message, index) => {
          const cardData = message.uiComponent ? getCards(message.uiComponent) : null;

          // Avatar only on the very last assistant message in the conversation
          const isLastAssistant =
            message.sender !== 'user' &&
            message.sender !== 'system' &&
            (() => {
              for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].sender !== 'user' && messages[i].sender !== 'system') {
                  return i === index;
                }
              }
              return false;
            })();

          return (
            <div key={message.id}>
              {message.sender === 'system' ? (
                <div className="lr-flex lr-items-center lr-gap-3 lr-my-3">
                  <div className="lr-flex-1 lr-h-px" style={{ backgroundColor: theme.input.borderColor }} />
                  <span className="lr-text-xs lr-font-medium lr-whitespace-nowrap" style={{ color: '#9CA3AF' }}>
                    {message.content}
                  </span>
                  <div className="lr-flex-1 lr-h-px" style={{ backgroundColor: theme.input.borderColor }} />
                </div>
              ) : (
                <Message
                  message={message}
                  isLast={index === messages.length - 1}
                  showAvatar={isLastAssistant}
                />
              )}

              {/* Card / Carousel rendering */}
              {cardData && !hasEnded && (
                <div className="lr-mt-2 lr-ml-8">
                  {cardData.displayMode === 'carousel' || cardData.cards.length > 1 ? (
                    <CardCarousel cards={cardData.cards} onButtonClick={handleCardButton} />
                  ) : cardData.cards.length === 1 ? (
                    <CardMessage card={cardData.cards[0]} onButtonClick={handleCardButton} />
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </LayoutGroup>

      {/* Typing indicator */}
      <TypingIndicator />

      {/* Quick replies - aligned to right, stacked vertically */}
      {quickReplies.length > 0 && !hasEnded && (
        <div className="lr-flex lr-justify-end lr-mt-3">
          <div className="lr-flex lr-flex-col lr-gap-2 lr-items-end">
            {quickReplies.map((reply, index) => {
              const qrTheme = theme.quickReplies;
              const isFilled = qrTheme?.style === 'filled';
              const borderRadius = qrTheme?.borderRadius ?? 20;
              const bgColor = isFilled
                ? (qrTheme?.backgroundColor || theme.header.backgroundColor)
                : 'transparent';
              const textColor = isFilled
                ? (qrTheme?.textColor || theme.header.textColor)
                : (qrTheme?.textColor || theme.header.backgroundColor);
              const borderColor = qrTheme?.borderColor || theme.header.backgroundColor;
              const hoverBgColor = qrTheme?.hoverBackgroundColor || theme.header.backgroundColor;
              const hoverTextColor = qrTheme?.hoverTextColor || theme.header.textColor;

              return (
                <motion.button
                  key={reply.id}
                  onClick={() => handleQuickReply(reply)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="lr-px-4 lr-py-2 lr-text-sm quick-reply-btn"
                  style={{
                    '--qr-bg': bgColor,
                    '--qr-bg-hover': hoverBgColor,
                    '--qr-color': textColor,
                    '--qr-color-hover': hoverTextColor,
                    '--qr-border': borderColor,
                    backgroundColor: 'var(--qr-bg)',
                    border: `1px solid var(--qr-border)`,
                    color: 'var(--qr-color)',
                    borderRadius,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease, color 0.15s ease, transform 0.15s ease',
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                    e.currentTarget.style.color = hoverTextColor;
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = bgColor;
                    e.currentTarget.style.color = textColor;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                >
                  {reply.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversation ended message */}
      {hasEnded && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lr-text-center lr-py-4 lr-text-sm lr-text-gray-500"
        >
          This conversation has ended.
          <button
            onClick={() => useWidgetStore.getState().reset()}
            className="lr-ml-2 lr-underline"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme.header.backgroundColor,
            }}
          >
            {t(theme.translations, 'startNewChat')}
          </button>
        </motion.div>
      )}

      </div>
    </div>

      {/* Pre-Chat Form Overlay */}
      <AnimatePresence>
        {isFormVisible && formData && (
          <PreChatForm
            steps={formData.steps}
            dismissable={formData.dismissable}
            submitButtonText={formData.submitButtonText}
            successMessage={formData.successMessage}
            nodeId={formData.nodeId}
            onSubmit={(data) => submitPreChatForm(data)}
            onDismiss={() => dismissForm()}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
