import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetStore } from '../store';
import { useState, useEffect } from 'react';
import { sanitizeSvg } from '../utils/sanitize';
import { t } from '../utils/translations';

export const TypingIndicator = () => {
  const { isTyping, theme } = useWidgetStore();
  const [isVisible, setIsVisible] = useState(false);
  const [showAfterDelay, setShowAfterDelay] = useState(false);
  const [hasPaused, setHasPaused] = useState(false);

  // Get typing indicator config (fallback to defaults)
  const typingConfig = theme.typingIndicator ?? {
    enabled: true,
    durationMode: 'automatic',
    presetDuration: 3,
    animation: 'dots',
    delay: 0,
  };

  // Handle delay before showing typing indicator
  useEffect(() => {
    if (isTyping && typingConfig.enabled) {
      const delayMs = (typingConfig.delay ?? 0) * 1000;
      if (delayMs > 0) {
        setShowAfterDelay(false);
        const timer = setTimeout(() => {
          setShowAfterDelay(true);
        }, delayMs);
        return () => clearTimeout(timer);
      } else {
        setShowAfterDelay(true);
      }
    } else {
      setShowAfterDelay(false);
    }
  }, [isTyping, typingConfig.enabled, typingConfig.delay]);

  // Simulate realistic typing with occasional pauses
  useEffect(() => {
    if (isTyping && showAfterDelay && theme.humanSimulation.randomPauses && !hasPaused) {
      setIsVisible(true);
      // Possibly pause after initial typing
      const shouldPause = Math.random() < 0.3;
      if (shouldPause) {
        const pauseDelay = 2000 + Math.random() * 2000; // 2-4 seconds
        const pauseTimer = setTimeout(() => {
          setIsVisible(false);
          setHasPaused(true);

          // Resume after a brief pause
          const resumeTimer = setTimeout(() => {
            setIsVisible(true);
          }, 500 + Math.random() * 1000); // 0.5-1.5 seconds pause

          return () => clearTimeout(resumeTimer);
        }, pauseDelay);

        return () => clearTimeout(pauseTimer);
      }
    } else if (isTyping && showAfterDelay) {
      setIsVisible(true);
    }
  }, [isTyping, showAfterDelay, theme.humanSimulation.randomPauses, hasPaused]);

  // Reset pause state when typing stops/starts
  useEffect(() => {
    if (isTyping) {
      setHasPaused(false);
    } else {
      setIsVisible(false);
    }
  }, [isTyping]);

  if (!isTyping || !isVisible || !typingConfig.enabled) return null;

  // Render the appropriate animation based on config
  const renderAnimation = () => {
    const textColor = theme.messages.assistantTextColor;

    switch (typingConfig.animation) {
      case 'pulse':
        return (
          <div className="lr-flex lr-gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="lr-w-1.5 lr-h-1.5 lr-rounded-full"
                style={{ backgroundColor: textColor }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      case 'wave':
        return (
          <div className="lr-flex lr-items-center lr-gap-0.5 lr-h-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="lr-w-1 lr-rounded-full"
                style={{ backgroundColor: textColor }}
                animate={{
                  height: ['6px', '14px', '6px'],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      case 'thinking':
        return (
          <motion.span
            className="lr-text-sm lr-font-medium"
            style={{ color: textColor }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {t(theme.translations, 'thinking')}
          </motion.span>
        );

      case 'dots':
      default:
        return (
          <div className="lr-flex lr-gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="lr-w-1.5 lr-h-1.5 lr-rounded-full"
                style={{ backgroundColor: textColor, opacity: 0.5 }}
                animate={{
                  y: [0, -3, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="lr-flex lr-items-center lr-gap-2 lr-mb-3"
        style={{ marginBottom: theme.messages.messageSpacing }}
      >
        {/* Avatar */}
        {theme.messages.showAvatar && (
          <div
            className="lr-w-7 lr-h-7 lr-rounded-full lr-flex lr-items-center lr-justify-center lr-shrink-0 lr-overflow-hidden"
            style={{ backgroundColor: theme.header.backgroundColor }}
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
                dangerouslySetInnerHTML={{ __html: sanitizeSvg(theme.messages.avatarSvg) }}
              />
            ) : (
              <svg className="lr-w-3.5 lr-h-3.5" fill={theme.header.textColor} viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            )}
          </div>
        )}

        {/* Typing indicator bubble */}
        <div
          className="lr-px-3 lr-py-1.5 lr-flex lr-items-center lr-justify-center"
          style={{
            backgroundColor: theme.messages.assistantBubbleColor,
            borderRadius: theme.messages.borderRadius,
            borderBottomLeftRadius: 4,
            minWidth: 48,
            minHeight: 28,
          }}
        >
          {renderAnimation()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
