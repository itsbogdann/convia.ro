/**
 * Convia Widget - Embeddable Entry Point
 *
 * This is the production entry point for the embeddable widget.
 * It creates its own container and renders the React app.
 *
 * Usage Method 1 - Script Tag with Config:
 * <script>
 *   window.loopReplyConfig = {
 *     agentId: 'your-agent-id',
 *     apiKey: 'lr_...',
 *     apiUrl: 'https://api.convia.com',
 *     user: { name: 'John', email: 'john@example.com' },
 *     customFields: { plan: 'pro', company: 'Acme' }
 *   };
 * </script>
 * <script src="https://widget.convia.com/embed.js"></script>
 *
 * Usage Method 2 - Data Attributes:
 * <script
 *   src="https://widget.convia.com/embed.js"
 *   data-agent-id="your-agent-id"
 *   data-api-key="lr_..."
 *   data-user-name="John"
 *   data-user-email="john@example.com"
 * ></script>
 *
 * Usage Method 3 - JavaScript API:
 * <script src="https://widget.convia.com/embed.js"></script>
 * <script>
 *   Convia.init({
 *     agentId: 'your-agent-id',
 *     apiKey: 'lr_...',
 *     user: { name: 'John' }
 *   });
 * </script>
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useWidgetStore } from './store';
import type { UserFields } from './types';

// Get script tag to read data attributes
const getCurrentScript = (): HTMLScriptElement | null => {
  const scripts = document.querySelectorAll('script[src*="convia"], script[src*="embed.js"]');
  return scripts[scripts.length - 1] as HTMLScriptElement | null;
};

// Parse data attributes from script tag
const parseDataAttributes = (): Partial<typeof window.loopReplyConfig> | null => {
  const script = getCurrentScript();
  if (!script) return null;

  const agentId = script.getAttribute('data-agent-id');
  if (!agentId) return null;

  const config: Partial<typeof window.loopReplyConfig> = {
    agentId,
  };

  const apiKey = script.getAttribute('data-api-key');
  if (apiKey) config.apiKey = apiKey;

  const apiUrl = script.getAttribute('data-api-url');
  if (apiUrl) config.apiUrl = apiUrl;

  // Parse user fields
  const userName = script.getAttribute('data-user-name');
  const userEmail = script.getAttribute('data-user-email');
  const userPhone = script.getAttribute('data-user-phone');
  const userId = script.getAttribute('data-user-id');

  if (userName || userEmail || userPhone || userId) {
    config.user = {
      name: userName || undefined,
      email: userEmail || undefined,
      phone: userPhone || undefined,
      id: userId || undefined,
    };
  }

  // Parse custom fields from data-custom attribute
  const customJson = script.getAttribute('data-custom');
  if (customJson) {
    try {
      config.customFields = JSON.parse(customJson);
    } catch (e) {
      console.error('[Convia] Invalid data-custom JSON:', e);
    }
  }

  return config;
};

// Initialize the widget
const initWidget = (config: typeof window.loopReplyConfig) => {
  if (!config?.agentId) {
    console.error('[Convia] Error: agentId is required');
    return;
  }

  // Set global config
  window.loopReplyConfig = config;

  // Check if already initialized
  let container = document.getElementById('convia-widget-root');
  if (container) {
    // Already initialized, just update config
    useWidgetStore.getState().initialize({
      apiKey: config.apiKey,
      agentId: config.agentId,
      preview: config.preview,
      user: config.user,
      customFields: config.customFields,
    });
    return;
  }

  // Create container element
  container = document.createElement('div');
  container.id = 'convia-widget-root';
  document.body.appendChild(container);

  // Render widget
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('[Convia] Widget initialized for agent:', config.agentId);
  if (config.preview) {
    console.log('[Convia] Running in preview mode');
  }
};

// Expose public API before initialization
window.Convia = {
  init: (config: typeof window.loopReplyConfig) => {
    initWidget(config);
  },
  open: () => {
    useWidgetStore.getState().setOpen(true);
  },
  close: () => {
    useWidgetStore.getState().setOpen(false);
  },
  toggle: () => {
    useWidgetStore.getState().toggleOpen();
  },
  setUser: (user: UserFields) => {
    useWidgetStore.setState({ userFields: user });
  },
  setCustomFields: (fields: Record<string, string | number | boolean>) => {
    useWidgetStore.setState({ customFields: fields });
  },
  reset: () => {
    localStorage.removeItem('lr_session_id');
    localStorage.removeItem('lr_conversation_id');
    useWidgetStore.getState().reset();
    const config = window.loopReplyConfig;
    if (config?.agentId) {
      useWidgetStore.getState().initialize({
        apiKey: config.apiKey,
        preview: config.preview,
        agentId: config.agentId,
        user: config.user,
        customFields: config.customFields,
      });
    }
  },
};

// Auto-initialize if config is present
const existingConfig = window.loopReplyConfig;
const dataConfig = parseDataAttributes();

if (existingConfig?.agentId) {
  // Initialize from window.loopReplyConfig
  initWidget(existingConfig);
} else if (dataConfig?.agentId) {
  // Initialize from data attributes
  initWidget(dataConfig as typeof window.loopReplyConfig);
} else {
  console.log('[Convia] Waiting for Convia.init() call or config');
}
