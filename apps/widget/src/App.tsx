import { useEffect } from 'react';
import { useWidgetStore } from './store';
import { ChatBubble, ChatWindow } from './components';
import type { UserFields } from './types';

// Get config from window (set by embed script or parent)
declare global {
  interface Window {
    loopReplyConfig?: {
      agentId: string;
      apiKey?: string;
      apiUrl?: string;
      preview?: boolean;
      // Custom fields from developer
      user?: UserFields;
      customFields?: Record<string, string | number | boolean>;
    };
    Convia?: {
      init: (config: Window['loopReplyConfig']) => void;
      open: () => void;
      close: () => void;
      toggle: () => void;
      setUser: (user: UserFields) => void;
      setCustomFields: (fields: Record<string, string | number | boolean>) => void;
      reset: () => void; // Reset conversation and start fresh
      getState?: () => unknown; // For debugging
    };
  }
}

function App() {
  const { initialize, theme, error, setOpen, reset, isOpen, config, isPreview } = useWidgetStore();
  const windowConfig = window.loopReplyConfig;

  useEffect(() => {
    if (!windowConfig?.agentId) {
      console.error('[Convia] agentId is required');
      return;
    }

    // Initialize with config
    initialize({
      apiKey: windowConfig.apiKey,
      preview: windowConfig.preview,
      agentId: windowConfig.agentId,
      user: windowConfig.user,
      customFields: windowConfig.customFields,
    });
  }, [windowConfig, initialize]);

  // Expose public API
  useEffect(() => {
    window.Convia = {
      init: (config) => {
        window.loopReplyConfig = config;
        if (config?.agentId) {
          initialize({
            apiKey: config.apiKey,
            preview: config.preview,
            agentId: config.agentId,
            user: config.user,
            customFields: config.customFields,
          });
        }
      },
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => useWidgetStore.getState().toggleOpen(),
      setUser: (user) => {
        useWidgetStore.setState({ userFields: user });
      },
      setCustomFields: (fields) => {
        useWidgetStore.setState({ customFields: fields });
      },
      reset: () => {
        // Clear session from localStorage
        localStorage.removeItem('lr_session_id');
        localStorage.removeItem('lr_conversation_id');
        // Reset store state
        useWidgetStore.getState().reset();
        // Pick a new random profile
        if ((window as any).__lrApplyRandomConfig) {
          (window as any).__lrApplyRandomConfig();
        }
        // Re-initialize with fresh config
        const config = window.loopReplyConfig;
        if (config?.agentId) {
          initialize({
            apiKey: config.apiKey,
            preview: config.preview,
            agentId: config.agentId,
            user: config.user,
            customFields: config.customFields,
          });
        }
      },
    };
  }, [initialize, setOpen]);

  if (!windowConfig?.agentId) {
    return null;
  }

  // Only block rendering for fatal init errors (no config loaded)
  // Runtime errors (conversation failures) are handled locally and should not kill the widget
  if (error && !config) {
    console.error('[Convia] Error:', error);
    return null;
  }

  // Don't render until config is loaded to prevent flash of default theme
  if (!config) {
    return null;
  }

  const isStudioMode = !!(window as any).__lrStudioMode;

  // Calculate container position
  const getContainerStyles = (): React.CSSProperties => {
    // Studio mode: offset bubble to the right so the chat window (which opens left) is centered
    if (isStudioMode) {
      return {
        position: 'fixed',
        zIndex: 9999,
        bottom: 20,
        left: '50%',
        transform: `translateX(calc(-50% + ${theme.chatWidth / 2}px))`,
      };
    }

    const pos = theme.position;
    const offset = theme.offset;

    const styles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
    };

    // Horizontal position
    if (pos.includes('right')) {
      styles.right = offset.x;
    } else {
      styles.left = offset.x;
    }

    // Vertical position
    if (pos.includes('bottom')) {
      styles.bottom = offset.y;
    } else {
      styles.top = offset.y;
    }

    return styles;
  };

  const handleReset = () => {
    // In studio mode (iframe), ask parent to reload the iframe for a clean reset
    if (isStudioMode && window.parent !== window) {
      window.parent.postMessage({ type: "lr:requestReset" }, "*");
      return;
    }
    // Standalone mode: reset locally
    localStorage.removeItem('lr_session_id');
    localStorage.removeItem('lr_conversation_id');
    localStorage.removeItem('lr_visitor_id');
    reset();
    // Pick a new random profile
    if ((window as any).__lrApplyRandomConfig) {
      (window as any).__lrApplyRandomConfig();
    }
    // Re-initialize with the updated config
    const freshConfig = window.loopReplyConfig;
    if (freshConfig?.agentId) {
      initialize({
        apiKey: freshConfig.apiKey,
        preview: freshConfig.preview,
        agentId: freshConfig.agentId,
        user: freshConfig.user,
        customFields: freshConfig.customFields,
      });
    }
  };

  // Hide bubble and reset button on mobile when widget is fullscreen
  const isMobileFullscreen = isOpen && typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div style={getContainerStyles()}>
      <ChatWindow />
      {!isMobileFullscreen && <ChatBubble />}
      {/* Reset button - only on preview page or localhost */}
      {isOpen && !isMobileFullscreen && (isPreview || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
        <button
          onClick={handleReset}
          style={{
            position: 'absolute',
            bottom: (theme.bubble.size - 20) / 2,
            right: theme.bubble.size + 8,
            padding: '4px 10px',
            fontSize: '10px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            opacity: 0.7,
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}

export default App;
