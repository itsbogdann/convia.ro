import { useWidgetStore } from '../store';
import { MessageCircle, MessageSquare, Headphones, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

import { LogoIcon } from './LogoIcon';

export const ChatBubble = () => {
  const { isOpen, toggleOpen, setOpen, theme } = useWidgetStore();
  const isStudioMode = !!(window as any).__lrStudioMode;
  const [showGreeting, setShowGreeting] = useState(false);
  const greetingShownOnce = useRef(false);
  const dismissedByUser = useRef(false);

  // Studio mode: show greeting immediately when chat is closed (always visible for preview)
  // Production: show greeting once after 6 seconds, only if never dismissed
  useEffect(() => {
    if (isStudioMode) {
      if (!isOpen && theme.bubble.showGreeting && theme.bubble.greeting) {
        setShowGreeting(true);
      } else {
        setShowGreeting(false);
      }
      return;
    }

    if (!isOpen && theme.bubble.showGreeting && theme.bubble.greeting && !greetingShownOnce.current && !dismissedByUser.current) {
      const timer = setTimeout(() => {
        setShowGreeting(true);
        greetingShownOnce.current = true;
      }, 6000);
      return () => clearTimeout(timer);
    }
    if (isOpen) {
      setShowGreeting(false);
    }
  }, [isOpen, theme.bubble.showGreeting, theme.bubble.greeting, isStudioMode]);

  // Use explicit iconSize if set, otherwise default to 55% of bubble size (65% for custom SVG icons)
  const baseIconSize = theme.bubble.iconSize ?? Math.round(theme.bubble.size * 0.55);
  const iconSize = theme.bubble.customIconSvg ? Math.round(theme.bubble.size * 0.65) : baseIconSize;
  const iconStyle: React.CSSProperties = {
    width: iconSize,
    height: iconSize,
    color: theme.bubble.iconColor,
    flexShrink: 0,
  };

  const getIcon = () => {
    if (isOpen) {
      return <X style={iconStyle} />;
    }

    // Check for custom SVG icon — use LogoIcon for clean rendering
    if (theme.bubble.customIconSvg) {
      return <LogoIcon size={iconSize} color={theme.bubble.iconColor} className="lr-ml-[2px] lr-mt-[2px]" />;
    }

    switch (theme.bubble.icon) {
      case 'message':
        return <MessageSquare style={iconStyle} />;
      case 'support':
        return <Headphones style={iconStyle} />;
      case 'custom':
        if (theme.bubble.customIconUrl) {
          return (
            <img
              src={theme.bubble.customIconUrl}
              alt="Chat"
              style={{ width: iconSize, height: iconSize }}
            />
          );
        }
        return <MessageCircle style={iconStyle} />;
      case 'chat':
      default:
        return <MessageCircle style={iconStyle} />;
    }
  };

  return (
    <div className="lr-relative">
      {/* Greeting bubble */}
      <AnimatePresence>
        {showGreeting && theme.bubble.greeting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="lr-absolute lr-bottom-full lr-right-0 lr-mb-3 lr-shadow-lg lr-text-sm lr-cursor-pointer"
            style={{
              backgroundColor: theme.messages.assistantBubbleColor,
              color: theme.messages.assistantTextColor,
              borderRadius: 16,
              width: 'max-content',
              maxWidth: 300,
            }}
            onClick={() => {
              setShowGreeting(false);
              setOpen(true);
            }}
          >
            {/* Dismiss X button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissedByUser.current = true;
                setShowGreeting(false);
              }}
              className="lr-absolute lr-flex lr-items-center lr-justify-center lr-rounded-full lr-transition-opacity hover:lr-opacity-70"
              style={{
                top: -8,
                right: -8,
                width: 22,
                height: 22,
                backgroundColor: theme.messages.assistantTextColor,
                color: theme.messages.assistantBubbleColor,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>

            <div className="lr-px-4 lr-py-3">
              {theme.bubble.greeting}
            </div>

            {/* Arrow */}
            <div
              className="lr-absolute lr-top-full lr-right-4 lr-w-0 lr-h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: `8px solid ${theme.messages.assistantBubbleColor}`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble button */}
      <motion.button
        className="lr-relative lr-shadow-lg lr-flex lr-items-center lr-justify-center lr-cursor-pointer lr-transition-transform lr-gap-2"
        style={{
          minWidth: theme.bubble.size,
          height: theme.bubble.size,
          paddingLeft: theme.bubble.text ? 16 : 0,
          paddingRight: theme.bubble.text ? 16 : 0,
          backgroundColor: theme.bubble.backgroundColor,
          borderRadius: theme.bubble.borderRadius ?? theme.bubble.size / 2,
          border: 'none',
        }}
        onClick={() => {
          setShowGreeting(false);
          toggleOpen();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {getIcon()}
          </motion.div>
        </AnimatePresence>

        {/* Text label */}
        {theme.bubble.text && !isOpen && (
          <span
            className="lr-text-sm lr-font-medium lr-whitespace-nowrap"
            style={{ color: theme.bubble.iconColor }}
          >
            {theme.bubble.text}
          </span>
        )}

        {/* Pulse animation */}
        {theme.bubble.pulseAnimation && !isOpen && (
          <motion.span
            className="lr-absolute lr-inset-0"
            style={{
              backgroundColor: theme.bubble.backgroundColor,
              borderRadius: theme.bubble.borderRadius ?? theme.bubble.size / 2,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>
    </div>
  );
};
