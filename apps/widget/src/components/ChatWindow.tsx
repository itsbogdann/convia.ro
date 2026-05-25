import { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetStore } from '../store';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { CartPill } from './CartPill';
import { ErrorBoundary } from './ErrorBoundary';
import { t } from '../utils/translations';

// Lazy-load portal components to keep classic mode bundle size unchanged
const PortalContainer = lazy(() =>
  import('./portal/PortalContainer').then((m) => ({ default: m.PortalContainer }))
);

// Calculate if a color is light or dark based on luminance
const isLightColor = (color: string): boolean => {
  // Handle hex colors
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

export const ChatWindow = () => {
  const { isOpen, isMinimized, isExpanded, theme } = useWidgetStore();

  if (!isOpen || isMinimized) return null;

  // Detect mobile (< 640px)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Mobile fullscreen: always go fullscreen on mobile when open
  const isMobileFullscreen = isMobile;

  const isStudioMode = !!(window as any).__lrStudioMode;

  // Calculate position styles based on theme
  const getPositionStyles = (): React.CSSProperties => {
    const pos = theme.position;

    // Mobile = fullscreen overlay using dvh for iOS Safari compatibility
    if (isMobileFullscreen) {
      return {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        maxWidth: '100vw',
        maxHeight: '100dvh',
      };
    }

    // Portal mode uses larger default dimensions
    const isPortal = theme.mode === 'portal';
    const baseWidth = isPortal ? Math.max(theme.chatWidth, 420) : theme.chatWidth;
    const baseHeight = isPortal ? Math.max(theme.chatHeight, 700) : theme.chatHeight;

    // Studio mode: same as bottom-right — window opens to the left of the bubble
    if (isStudioMode) {
      return {
        position: 'absolute' as const,
        width: isExpanded ? Math.min(600, window.innerWidth - 32) : baseWidth,
        height: isExpanded ? `min(85vh, calc(100vh - 4rem))` : baseHeight,
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: isExpanded ? 'calc(100vh - 4rem)' : 'calc(100vh - 8rem)',
        transition: 'width 0.3s ease, height 0.3s ease, max-height 0.3s ease, border-radius 0.3s ease',
        bottom: theme.bubble.size + 12,
        right: 0,
      };
    }

    const styles: React.CSSProperties = {
      position: 'absolute',
      width: isExpanded ? Math.min(600, window.innerWidth - 32) : baseWidth,
      height: isExpanded ? `min(85vh, calc(100vh - 4rem))` : baseHeight,
      maxWidth: 'calc(100vw - 2rem)',
      maxHeight: isExpanded ? 'calc(100vh - 4rem)' : 'calc(100vh - 8rem)',
      transition: 'width 0.3s ease, height 0.3s ease, max-height 0.3s ease, border-radius 0.3s ease',
    };

    // Horizontal position
    if (pos.includes('right')) {
      styles.right = 0;
    } else {
      styles.left = 0;
    }

    // Vertical position - always above the bubble
    if (pos.includes('bottom')) {
      styles.bottom = theme.bubble.size + 12;
    } else {
      styles.top = theme.bubble.size + 12;
    }

    return styles;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="lr-flex lr-flex-col lr-overflow-hidden lr-relative"
        style={{
          ...getPositionStyles(),
          borderRadius: isMobileFullscreen ? 0 : theme.borderRadius,
          backgroundColor: theme.chat.backgroundColor,
          boxShadow: theme.windowShadow !== false
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 12px 24px -8px rgba(0, 0, 0, 0.3)'
            : undefined,
        }}
      >
        {/* Blurred background image layer */}
        {theme.chat.backgroundPattern === 'image' && theme.chat.backgroundImage && (
          <div
            className="lr-absolute lr-inset-0 lr-z-0"
            style={{
              backgroundImage: `url(${theme.chat.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: `blur(${theme.chat.backgroundBlur ?? 8}px)`,
              transform: 'scale(1.1)',
              borderRadius: isMobileFullscreen ? 0 : theme.borderRadius,
            }}
          />
        )}

        {theme.mode === 'portal' ? (
          <ErrorBoundary>
          <Suspense fallback={
            <div className="lr-flex lr-items-center lr-justify-center lr-flex-1 lr-relative lr-z-10" style={{ backgroundColor: theme.chat.backgroundPattern === 'image' ? 'transparent' : theme.chat.backgroundColor }}>
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="lr-animate-pulse">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.60917 36.9866C5.3218 33.3783 3.32191 28.6146 3.32191 23.3914C3.32191 12.1271 12.6184 2.99568 24.0861 2.99568C35.5539 2.99568 44.8504 12.1271 44.8504 23.3914C44.8504 31.3561 40.2009 38.2516 33.4239 41.6092C29.2775 43.771 24.5472 44.9957 19.5258 44.9957C13.3731 44.9957 7.65739 43.157 2.91748 40.0088C2.91748 40.0088 6.09606 39.6621 8.60835 36.9874L8.60917 36.9866ZM33.8397 33.4855C39.2117 28.1137 39.2117 19.4042 33.8397 14.0322C31.3487 11.5414 28.1401 10.2063 24.8794 10.0256V10.0248C24.781 7.57835 26.0979 5.92616 26.1043 5.91811L26.1036 5.91824L26.1045 5.9171C22.3569 6.64104 18.7783 8.45409 15.8764 11.356C13.6509 13.5814 12.0663 16.205 11.1216 18.9972C11.2591 18.6329 11.4124 18.2733 11.5814 17.9193C11.3865 18.4167 11.2103 18.925 11.051 19.445C9.47775 24.2209 10.5882 29.6873 14.3864 33.4855C19.7584 38.8575 28.4679 38.8575 33.8397 33.4855Z" fill="#c0c5cd"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M17.1299 22.345V24.0539V25.1922C17.1299 26.3283 18.0509 27.2494 19.1872 27.2494C20.3234 27.2494 21.2443 26.3283 21.2443 25.1922V24.0522V22.345C21.2443 21.2089 20.3234 20.2877 19.1872 20.2877C18.0509 20.2877 17.1299 21.2089 17.1299 22.345Z" fill="#c0c5cd"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M27.313 22.345V24.0539V25.1922C27.313 26.3283 28.2341 27.2494 29.3702 27.2494C30.5064 27.2494 31.4275 26.3283 31.4275 25.1922V24.0522V22.345C31.4275 21.2089 30.5064 20.2877 29.3702 20.2877C28.2341 20.2877 27.313 21.2089 27.313 22.345Z" fill="#c0c5cd"/>
              </svg>
            </div>
          }>
            <div className="lr-relative lr-z-10 lr-flex lr-flex-col lr-flex-1 lr-overflow-hidden">
              <PortalContainer />
            </div>
          </Suspense>
          </ErrorBoundary>
        ) : (
          <div className="lr-relative lr-z-10 lr-flex lr-flex-col lr-flex-1 lr-overflow-hidden">
            <ChatHeader />
            <MessageList />
            <CartPill />
            <ChatInput />
          </div>
        )}

        {/* Branding */}
        {theme.branding.showPoweredBy && (
          <div
            className="lr-text-center lr-py-2 lr-text-xs lr-flex lr-items-center lr-justify-center lr-gap-1 lr-relative lr-z-10"
            style={{
              color: '#9CA3AF',
              borderTop: `1px solid ${theme.input.borderColor}`,
              paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
            }}
          >
            {t(theme.translations, 'poweredBy')}{' '}
            <a
              href="https://convia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="lr-inline-flex lr-items-center lr-gap-0.5"
              style={{
                color: isLightColor(theme.chat.backgroundColor) ? '#1F2937' : '#FFFFFF',
                textDecoration: 'underline',
                textDecorationColor: '#3B82F6',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.60917 36.9866C5.3218 33.3783 3.32191 28.6146 3.32191 23.3914C3.32191 12.1271 12.6184 2.99568 24.0861 2.99568C35.5539 2.99568 44.8504 12.1271 44.8504 23.3914C44.8504 31.3561 40.2009 38.2516 33.4239 41.6092C29.2775 43.771 24.5472 44.9957 19.5258 44.9957C13.3731 44.9957 7.65739 43.157 2.91748 40.0088C2.91748 40.0088 6.09606 39.6621 8.60835 36.9874L8.60917 36.9866ZM33.8397 33.4855C39.2117 28.1137 39.2117 19.4042 33.8397 14.0322C31.3487 11.5414 28.1401 10.2063 24.8794 10.0256V10.0248C24.781 7.57835 26.0979 5.92616 26.1043 5.91811L26.1036 5.91824L26.1045 5.9171C22.3569 6.64104 18.7783 8.45409 15.8764 11.356C13.6509 13.5814 12.0663 16.205 11.1216 18.9972C11.2591 18.6329 11.4124 18.2733 11.5814 17.9193C11.3865 18.4167 11.2103 18.925 11.051 19.445C9.47775 24.2209 10.5882 29.6873 14.3864 33.4855C19.7584 38.8575 28.4679 38.8575 33.8397 33.4855Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.1299 22.345V24.0539V25.1922C17.1299 26.3283 18.0509 27.2494 19.1872 27.2494C20.3234 27.2494 21.2443 26.3283 21.2443 25.1922V24.0522V22.345C21.2443 21.2089 20.3234 20.2877 19.1872 20.2877C18.0509 20.2877 17.1299 21.2089 17.1299 22.345Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M27.313 22.345V24.0539V25.1922C27.313 26.3283 28.2341 27.2494 29.3702 27.2494C30.5064 27.2494 31.4275 26.3283 31.4275 25.1922V24.0522V22.345C31.4275 21.2089 30.5064 20.2877 29.3702 20.2877C28.2341 20.2877 27.313 21.2089 27.313 22.345Z"
                  fill="currentColor"
                />
              </svg>
              Convia
            </a>
          </div>
        )}

      </motion.div>

    </AnimatePresence>
  );
};
