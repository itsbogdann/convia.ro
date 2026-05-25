import { motion, AnimatePresence } from 'framer-motion';
import type { Message as MessageType } from '../types';
import { useWidgetStore } from '../store';
import { useState, useEffect, useRef } from 'react';
import { MarkdownText } from './MarkdownText';
import { sanitizeSvg } from '../utils/sanitize';
import { Citations } from './Citations';
import { FormResponseMessage } from './FormResponseMessage';
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
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Smoothly reveals streamed text using requestAnimationFrame.
 * Instead of showing tokens in bursts, it eases toward the target content
 * at ~18% of the remaining distance per frame, creating a fluid typing feel.
 */
function SmoothStreamingText({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const [displayed, setDisplayed] = useState(content);
  const targetRef = useRef(content);
  const displayedLenRef = useRef(content.length);
  const rafRef = useRef<number | null>(null);

  // Keep target in sync without re-running the effect
  targetRef.current = content;

  // Animation loop — only controlled by isStreaming lifecycle
  useEffect(() => {
    if (!isStreaming) {
      setDisplayed(targetRef.current);
      displayedLenRef.current = targetRef.current.length;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const drain = () => {
      const target = targetRef.current;
      const currentLen = displayedLenRef.current;

      if (currentLen < target.length) {
        const remaining = target.length - currentLen;
        // Ease-out: close ~18% of the gap each frame → smooth deceleration
        const step = Math.max(1, Math.ceil(remaining * 0.18));
        const newLen = Math.min(currentLen + step, target.length);
        displayedLenRef.current = newLen;
        setDisplayed(target.slice(0, newLen));
      }

      rafRef.current = requestAnimationFrame(drain);
    };

    rafRef.current = requestAnimationFrame(drain);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isStreaming]);

  // Non-streaming content changes (e.g., route tag strip on finalize)
  useEffect(() => {
    if (!isStreaming) {
      setDisplayed(content);
      displayedLenRef.current = content.length;
    }
  }, [content, isStreaming]);

  return <MarkdownText content={displayed} />;
}

/**
 * Smoothly animates height changes during streaming so the bubble
 * grows fluidly instead of jumping line-by-line.
 * Uses a two-div technique: inner div sizes naturally (measured by ResizeObserver),
 * outer div transitions to that height with CSS transition.
 */
function useAnimatedHeight(active: boolean) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = contentRef.current;
    if (!active || !el) {
      setHeight(undefined);
      return;
    }

    setHeight(el.offsetHeight);

    const observer = new ResizeObserver(() => {
      setHeight(el.offsetHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  const wrapperStyle: React.CSSProperties | undefined =
    active && height !== undefined
      ? { height, transition: 'height 120ms ease-out', overflow: 'hidden' }
      : undefined;

  return { contentRef, wrapperStyle };
}

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
  showAvatar?: boolean;
}

export const Message = ({ message, showAvatar = true }: MessageProps) => {
  const { theme } = useWidgetStore();
  const isUser = message.sender === 'user';
  const { contentRef, wrapperStyle } = useAnimatedHeight(!!message.isStreaming);
  const [showDelivered, setShowDelivered] = useState(false);
  const [isNewMessage, setIsNewMessage] = useState(false);

  // Show "Delivered" after a delay for user messages
  useEffect(() => {
    if (isUser && theme.humanSimulation.showDelivered && message.status === 'delivered') {
      // Check if message is recent (within last 2 seconds) - means it's a new message
      const messageAge = Date.now() - message.createdAt.getTime();
      const isRecent = messageAge < 2000;

      if (isRecent) {
        // New message - show with delay and animation
        setIsNewMessage(true);
        const timer = setTimeout(() => setShowDelivered(true), 800);
        return () => clearTimeout(timer);
      } else {
        // Old message - show immediately without animation
        setShowDelivered(true);
      }
    }
  }, [isUser, theme.humanSimulation.showDelivered, message.status, message.createdAt]);

  // Animation variants based on sender
  const messageVariants = isUser
    ? {
        initial: { opacity: 0, scale: 0.8, x: 50 },
        animate: { opacity: 1, scale: 1, x: 0 },
      }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      };

  // Cap spacing at 8px max for tighter messages like the preview
  const spacing = Math.min(theme.messages.messageSpacing ?? 8, 8);

  return (
    <div className="lr-relative" style={{ marginBottom: spacing }}>
      <motion.div
        initial={messageVariants.initial}
        animate={messageVariants.animate}
        transition={{
          type: isUser ? 'spring' : 'tween',
          stiffness: 500,
          damping: 30,
          duration: isUser ? undefined : 0.2,
        }}
        className={`lr-flex lr-items-end ${isUser ? 'lr-justify-end' : 'lr-justify-start'}`}
      >
        {/* Avatar for assistant messages — only on the last bot message, animates to new messages */}
        {!isUser && theme.messages.showAvatar && (
          showAvatar ? (
            <div className="lr-relative lr-shrink-0 lr-mr-2">
              <motion.div
                layoutId="bot-avatar"
                className="lr-w-7 lr-h-7 lr-rounded-full lr-flex lr-items-center lr-justify-center lr-overflow-hidden"
                style={{ backgroundColor: theme.messages.avatarBackgroundColor || theme.header.backgroundColor }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
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
                  <svg className="lr-w-3.5 lr-h-3.5" fill={theme.header.textColor} viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                )}
              </motion.div>
              {/* Active status indicator with radiating pulse — border matches chat bg for cutout effect */}
              <span className="lr-absolute -lr-bottom-0.5 -lr-right-0.5 lr-flex lr-items-center lr-justify-center">
                <motion.span
                  className="lr-absolute lr-w-2.5 lr-h-2.5 lr-rounded-full"
                  style={{ backgroundColor: '#22c55e' }}
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.3, ease: 'easeOut' }}
                />
                <span
                  className="lr-relative lr-block lr-w-2.5 lr-h-2.5 lr-rounded-full"
                  style={{ backgroundColor: '#22c55e', border: '2px solid', borderColor: theme.chat.backgroundColor }}
                />
              </span>
            </div>
          ) : (
            <div className="lr-w-7 lr-shrink-0 lr-mr-2" />
          )
        )}

        {/* Message bubble */}
        <div className="lr-relative lr-max-w-[80%]">
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: isUser
                ? theme.messages.userBubbleColor
                : theme.chat.glassEffect
                  ? hexToRgba(theme.messages.assistantBubbleColor, 0.65)
                  : theme.messages.assistantBubbleColor,
              color: isUser
                ? theme.messages.userTextColor
                : theme.messages.assistantTextColor,
              borderRadius: theme.messages.borderRadius,
              borderBottomRightRadius: isUser ? 4 : theme.messages.borderRadius,
              borderBottomLeftRadius: isUser ? theme.messages.borderRadius : 4,
              boxShadow: theme.messages.showShadow !== false
                ? '0 1px 2px rgba(0, 0, 0, 0.1)'
                : undefined,
              // Subtle glass effect on assistant bubbles
              ...(!isUser && theme.chat.glassEffect
                ? {
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                  }
                : {}),
            }}
          >
            <div style={wrapperStyle}>
              <div ref={contentRef}>
                <div className="lr-text-sm lr-break-words" style={{ margin: 0 }}>
                  {isUser ? (
                    <p className="lr-whitespace-pre-wrap" style={{ margin: 0 }}>{message.content}</p>
                  ) : (
                    <>
                      {message.isStreaming ? (
                        <SmoothStreamingText content={message.content} isStreaming />
                      ) : (
                        <MarkdownText content={message.content} />
                      )}
                      {message.isStreaming && (
                        <span className="lr-inline-block lr-animate-pulse" style={{ color: theme.messages.assistantTextColor }}>|</span>
                      )}
                    </>
                  )}
                </div>

                {/* Form response viewer (read-only) */}
                {!isUser && message.uiComponent?.type === 'form_response' && message.uiComponent.fields && (
                  <div className="lr-mt-2">
                    <FormResponseMessage fields={message.uiComponent.fields} />
                  </div>
                )}

                {/* Timestamps */}
                {theme.messages.showTimestamps && (
                  <div
                    className="lr-text-xs lr-opacity-60 lr-mt-1"
                    style={{ color: isUser ? theme.messages.userTextColor : theme.messages.assistantTextColor }}
                  >
                    {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}

                {/* Source citations */}
                {!isUser && message.citations && message.citations.length > 0 && (
                  <Citations citations={message.citations} />
                )}
              </div>
            </div>
          </div>

          {/* Reaction badge */}
          {message.reaction && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className={`lr-absolute -lr-bottom-2 lr-w-6 lr-h-6 lr-rounded-full lr-bg-white lr-shadow-md lr-flex lr-items-center lr-justify-center lr-text-sm ${isUser ? '-lr-left-1' : 'lr-left-2'}`}
            >
              {message.reaction}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Delivered status */}
      <AnimatePresence>
        {isUser && showDelivered && (
          <motion.div
            initial={isNewMessage ? { opacity: 0, y: -5 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="lr-text-right lr-text-[10px] lr-text-gray-400 lr-mt-0.5 lr-pr-1"
            style={{ lineHeight: 1 }}
          >
            {t(theme.translations, 'delivered')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
