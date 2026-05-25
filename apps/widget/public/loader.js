/**
 * LoopReply Widget Loader
 *
 * A lightweight loader script (~2KB) that:
 * 1. Parses configuration from data attributes or window.loopReplyConfig
 * 2. Asynchronously loads the full widget bundle
 * 3. Provides a public API for control
 *
 * Usage:
 * <script
 *   src="https://widget.loopreply.com/loader.js"
 *   data-agent-id="your-agent-id"
 *   data-api-key="lr_..."
 * ></script>
 */
(function() {
  'use strict';

  var currentScript = document.currentScript || document.querySelector('script[src*="loader.js"]');
  var scriptOrigin = currentScript && currentScript.src ? new URL(currentScript.src).origin : 'https://widget.convia.ro';
  var isLocal = scriptOrigin.indexOf('localhost') !== -1 || scriptOrigin.indexOf('127.0.0.1') !== -1;

  var WIDGET_URL = isLocal ? scriptOrigin + '/embed.js' : 'https://widget.convia.ro/embed.js';
  var API_URL = isLocal ? 'http://localhost:9002/api' : 'https://api.convia.ro';

  // Queue for commands called before widget loads
  var commandQueue = [];
  var widgetLoaded = false;

  // Get current script
  function getCurrentScript() {
    var scripts = document.querySelectorAll('script[src*="loopreply"], script[src*="loader.js"]');
    return scripts[scripts.length - 1];
  }

  // Parse data attributes
  function parseConfig() {
    var script = getCurrentScript();
    if (!script) return null;

    var config = {
      agentId: script.getAttribute('data-agent-id'),
      apiKey: script.getAttribute('data-api-key'),
      apiUrl: script.getAttribute('data-api-url') || API_URL,
    };

    if (!config.agentId) return null;

    // Parse user fields
    var userName = script.getAttribute('data-user-name');
    var userEmail = script.getAttribute('data-user-email');
    var userPhone = script.getAttribute('data-user-phone');
    var userId = script.getAttribute('data-user-id');

    if (userName || userEmail || userPhone || userId) {
      config.user = {
        name: userName || undefined,
        email: userEmail || undefined,
        phone: userPhone || undefined,
        id: userId || undefined
      };
    }

    // Parse custom fields
    var customJson = script.getAttribute('data-custom');
    if (customJson) {
      try {
        config.customFields = JSON.parse(customJson);
      } catch (e) {
        console.error('[LoopReply] Invalid data-custom JSON:', e);
      }
    }

    return config;
  }

  // Load the widget script
  function loadWidget(config) {
    if (widgetLoaded) return;

    // Set config before loading
    window.loopReplyConfig = config;

    // Create script element
    var script = document.createElement('script');
    script.src = WIDGET_URL;
    script.async = true;
    script.onload = function() {
      widgetLoaded = true;
      // Process queued commands
      while (commandQueue.length > 0) {
        var cmd = commandQueue.shift();
        if (window.LoopReply && typeof window.LoopReply[cmd.method] === 'function') {
          window.LoopReply[cmd.method].apply(window.LoopReply, cmd.args);
        }
      }
    };
    script.onerror = function() {
      console.error('[LoopReply] Failed to load widget');
    };

    document.head.appendChild(script);
  }

  // Create proxy API
  function createProxyMethod(method) {
    return function() {
      if (widgetLoaded && window.LoopReply) {
        return window.LoopReply[method].apply(window.LoopReply, arguments);
      }
      commandQueue.push({ method: method, args: Array.prototype.slice.call(arguments) });
    };
  }

  // Expose API immediately
  window.LoopReply = {
    init: function(config) {
      loadWidget(config);
    },
    open: createProxyMethod('open'),
    close: createProxyMethod('close'),
    toggle: createProxyMethod('toggle'),
    setUser: createProxyMethod('setUser'),
    setCustomFields: createProxyMethod('setCustomFields'),
  };

  // Auto-initialize if config present
  var existingConfig = window.loopReplyConfig;
  var dataConfig = parseConfig();

  if (existingConfig && existingConfig.agentId) {
    loadWidget(existingConfig);
  } else if (dataConfig && dataConfig.agentId) {
    loadWidget(dataConfig);
  }
})();
