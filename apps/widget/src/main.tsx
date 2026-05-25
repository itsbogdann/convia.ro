import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { api } from './api';
import { useWidgetStore } from './store';
import { mergeTheme } from './types';

function PasswordGate({ botId, autoToken, children }: { botId: string; autoToken?: string | null; children: React.ReactNode }) {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(() => {
    const expiry = localStorage.getItem(`lr_playground_${botId}_expiry`);
    return expiry ? Date.now() < Number(expiry) : false;
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-validate token from URL param (used by Bot Studio iframe)
  useEffect(() => {
    if (autoToken && !unlocked) {
      setLoading(true);
      api.validatePlaygroundToken(botId, autoToken)
        .then(() => {
          localStorage.setItem(`lr_playground_${botId}_expiry`, String(Date.now() + 48 * 60 * 60 * 1000));
          setUnlocked(true);
        })
        .catch(() => {
          setError('Invalid or expired token');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [autoToken, botId]);

  if (unlocked) return <>{children}</>;
  // If auto-token is provided, show loading while validating
  if (autoToken && loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ fontSize: 14, color: '#64748b' }}>Loading preview...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      await api.validatePlaygroundToken(botId, input.trim());
      localStorage.setItem(`lr_playground_${botId}_expiry`, String(Date.now() + 48 * 60 * 60 * 1000));
      setUnlocked(true);
    } catch {
      setError('Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      zIndex: 99999,
    }}>
      {/* Left side - decorative */}
      <div style={{
        width: '50%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'absolute', top: '40px', left: '40px' }}>
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M8.60917 36.9866C5.3218 33.3783 3.32191 28.6146 3.32191 23.3914C3.32191 12.1271 12.6184 2.99568 24.0861 2.99568C35.5539 2.99568 44.8504 12.1271 44.8504 23.3914C44.8504 31.3561 40.2009 38.2516 33.4239 41.6092C29.2775 43.771 24.5472 44.9957 19.5258 44.9957C13.3731 44.9957 7.65739 43.157 2.91748 40.0088C2.91748 40.0088 6.09606 39.6621 8.60835 36.9874L8.60917 36.9866ZM33.8397 33.4855C39.2117 28.1137 39.2117 19.4042 33.8397 14.0322C31.3487 11.5414 28.1401 10.2063 24.8794 10.0256V10.0248C24.781 7.57835 26.0979 5.92616 26.1043 5.91811L26.1036 5.91824L26.1045 5.9171C22.3569 6.64104 18.7783 8.45409 15.8764 11.356C13.6509 13.5814 12.0663 16.205 11.1216 18.9972C11.2591 18.6329 11.4124 18.2733 11.5814 17.9193C11.3865 18.4167 11.2103 18.925 11.051 19.445C9.47775 24.2209 10.5882 29.6873 14.3864 33.4855C19.7584 38.8575 28.4679 38.8575 33.8397 33.4855Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M17.1299 22.345V24.0539V25.1922C17.1299 26.3283 18.0509 27.2494 19.1872 27.2494C20.3234 27.2494 21.2443 26.3283 21.2443 25.1922V24.0522V22.345C21.2443 21.2089 20.3234 20.2877 19.1872 20.2877C18.0509 20.2877 17.1299 21.2089 17.1299 22.345Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M27.313 22.345V24.0539V25.1922C27.313 26.3283 28.2341 27.2494 29.3702 27.2494C30.5064 27.2494 31.4275 26.3283 31.4275 25.1922V24.0522V22.345C31.4275 21.2089 30.5064 20.2877 29.3702 20.2877C28.2341 20.2877 27.313 21.2089 27.313 22.345Z" fill="white"/>
          </svg>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'white' }}>Convia</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 700, color: 'white', lineHeight: 1.2, margin: 0 }}>
          Widget Playground
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginTop: '12px', lineHeight: 1.6, maxWidth: '400px' }}>
          Enter the playground token to access the widget preview and test your bot in a simulated environment.
        </p>
      </div>

      {/* Right side - form */}
      <div style={{
        width: '50%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          width: '100%',
          maxWidth: '356px',
          padding: '0 24px',
        }}>
          <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M8.60917 36.9866C5.3218 33.3783 3.32191 28.6146 3.32191 23.3914C3.32191 12.1271 12.6184 2.99568 24.0861 2.99568C35.5539 2.99568 44.8504 12.1271 44.8504 23.3914C44.8504 31.3561 40.2009 38.2516 33.4239 41.6092C29.2775 43.771 24.5472 44.9957 19.5258 44.9957C13.3731 44.9957 7.65739 43.157 2.91748 40.0088C2.91748 40.0088 6.09606 39.6621 8.60835 36.9874L8.60917 36.9866ZM33.8397 33.4855C39.2117 28.1137 39.2117 19.4042 33.8397 14.0322C31.3487 11.5414 28.1401 10.2063 24.8794 10.0256V10.0248C24.781 7.57835 26.0979 5.92616 26.1043 5.91811L26.1036 5.91824L26.1045 5.9171C22.3569 6.64104 18.7783 8.45409 15.8764 11.356C13.6509 13.5814 12.0663 16.205 11.1216 18.9972C11.2591 18.6329 11.4124 18.2733 11.5814 17.9193C11.3865 18.4167 11.2103 18.925 11.051 19.445C9.47775 24.2209 10.5882 29.6873 14.3864 33.4855C19.7584 38.8575 28.4679 38.8575 33.8397 33.4855Z" fill="#1e293b"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M17.1299 22.345V24.0539V25.1922C17.1299 26.3283 18.0509 27.2494 19.1872 27.2494C20.3234 27.2494 21.2443 26.3283 21.2443 25.1922V24.0522V22.345C21.2443 21.2089 20.3234 20.2877 19.1872 20.2877C18.0509 20.2877 17.1299 21.2089 17.1299 22.345Z" fill="#1e293b"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M27.313 22.345V24.0539V25.1922C27.313 26.3283 28.2341 27.2494 29.3702 27.2494C30.5064 27.2494 31.4275 26.3283 31.4275 25.1922V24.0522V22.345C31.4275 21.2089 30.5064 20.2877 29.3702 20.2877C28.2341 20.2877 27.313 21.2089 27.313 22.345Z" fill="#1e293b"/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>Widget Playground</div>
            <div style={{ fontSize: '14px', color: '#475569', marginTop: '6px' }}>Enter the playground token to continue</div>
          </div>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(''); }}
              placeholder="Playground token"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                paddingRight: input ? '14px' : '72px',
                borderRadius: '10px',
                border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
                backgroundColor: '#fff',
                color: '#1e293b',
                fontSize: '14px',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                letterSpacing: '0.05em',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = '#3b82f6'; }}
              onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = '#e2e8f0'; }}
            />
            {!input && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text.trim()) { setInput(text.trim()); setError(''); }
                  } catch {
                    // Clipboard permission denied — ignore
                  }
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s',
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Paste
              </button>
            )}
          </div>
          {error && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '-12px' }}>{error}</div>
          )}
          <button type="submit" disabled={loading} style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: loading ? '#64748b' : '#1e293b',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s',
          }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#334155'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1e293b'; }}
          >
            {loading ? 'Validating...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

function MissingBotId() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8fafc',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px' }}>
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 16px' }}>
          <path fillRule="evenodd" clipRule="evenodd" d="M8.60917 36.9866C5.3218 33.3783 3.32191 28.6146 3.32191 23.3914C3.32191 12.1271 12.6184 2.99568 24.0861 2.99568C35.5539 2.99568 44.8504 12.1271 44.8504 23.3914C44.8504 31.3561 40.2009 38.2516 33.4239 41.6092C29.2775 43.771 24.5472 44.9957 19.5258 44.9957C13.3731 44.9957 7.65739 43.157 2.91748 40.0088C2.91748 40.0088 6.09606 39.6621 8.60835 36.9874L8.60917 36.9866ZM33.8397 33.4855C39.2117 28.1137 39.2117 19.4042 33.8397 14.0322C31.3487 11.5414 28.1401 10.2063 24.8794 10.0256V10.0248C24.781 7.57835 26.0979 5.92616 26.1043 5.91811L26.1036 5.91824L26.1045 5.9171C22.3569 6.64104 18.7783 8.45409 15.8764 11.356C13.6509 13.5814 12.0663 16.205 11.1216 18.9972C11.2591 18.6329 11.4124 18.2733 11.5814 17.9193C11.3865 18.4167 11.2103 18.925 11.051 19.445C9.47775 24.2209 10.5882 29.6873 14.3864 33.4855C19.7584 38.8575 28.4679 38.8575 33.8397 33.4855Z" fill="#cbd5e1"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M17.1299 22.345V24.0539V25.1922C17.1299 26.3283 18.0509 27.2494 19.1872 27.2494C20.3234 27.2494 21.2443 26.3283 21.2443 25.1922V24.0522V22.345C21.2443 21.2089 20.3234 20.2877 19.1872 20.2877C18.0509 20.2877 17.1299 21.2089 17.1299 22.345Z" fill="#cbd5e1"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M27.313 22.345V24.0539V25.1922C27.313 26.3283 28.2341 27.2494 29.3702 27.2494C30.5064 27.2494 31.4275 26.3283 31.4275 25.1922V24.0522V22.345C31.4275 21.2089 30.5064 20.2877 29.3702 20.2877C28.2341 20.2877 27.313 21.2089 27.313 22.345Z" fill="#cbd5e1"/>
        </svg>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
          Missing Bot ID
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
          No bot ID was provided. Open the Playground from your bot's dashboard to get a valid link with a token.
        </p>
      </div>
    </div>
  );
}

// Mock user profiles for demo — each reset picks a random one
const PREVIEW_PROFILES = [
  {
    user: { name: 'Andrei Popescu', email: 'andrei.popescu@digitalnova.ro', phone: '+40 721 555 101' },
    customFields: { plan: 'enterprise', company: 'DigitalNova', source: 'website', role: 'CTO' },
  },
  {
    user: { name: 'Elena Ionescu', email: 'elena@techforge.ro', phone: '+40 734 555 192' },
    customFields: { plan: 'pro', company: 'TechForge', source: 'google-ads', role: 'Founder' },
  },
  {
    user: { name: 'Maria Dumitrescu', email: 'maria@cafeaprospata.ro', phone: '+40 745 555 147' },
    customFields: { plan: 'starter', company: 'Cafea Proaspata', source: 'referral', role: 'Owner' },
  },
  {
    user: { name: 'Alexandru Radu', email: 'alex.radu@medvision.ro', phone: '+40 756 555 238' },
    customFields: { plan: 'enterprise', company: 'MedVision', source: 'linkedin', role: 'VP of Operations' },
  },
  {
    user: { name: 'Cristina Marinescu', email: 'cristina@designcraft.ro', phone: '+40 767 555 958' },
    customFields: { plan: 'pro', company: 'DesignCraft Studio', source: 'product-hunt', role: 'Creative Director' },
  },
  {
    user: { name: 'Bogdan Stanescu', email: 'bogdan@shopexpert.ro', phone: '+40 722 555 312' },
    customFields: { plan: 'enterprise', company: 'ShopExpert', source: 'website', role: 'Head of E-commerce' },
  },
  {
    user: { name: 'Ioana Gheorghe', email: 'ioana.gheorghe@finsmart.ro', phone: '+40 733 555 210' },
    customFields: { plan: 'pro', company: 'FinSmart Solutions', source: 'webinar', role: 'Product Manager' },
  },
  {
    user: { name: 'Dan Moldovan', email: 'dan@autoplus.ro', phone: '+40 744 555 421' },
    customFields: { plan: 'starter', company: 'AutoPlus SRL', source: 'google-ads', role: 'CEO' },
  },
  {
    user: { name: 'Raluca Popa', email: 'raluca@verdecreativ.ro', phone: '+40 755 555 489' },
    customFields: { plan: 'pro', company: 'Verde Creativ', source: 'referral', role: 'Marketing Lead' },
  },
  {
    user: { name: 'Mihai Constantinescu', email: 'mihai@cloudpeak.ro', phone: '+40 766 555 376' },
    customFields: { plan: 'enterprise', company: 'CloudPeak Systems', source: 'linkedin', role: 'Engineering Manager' },
  },
];

export function getRandomProfile() {
  return PREVIEW_PROFILES[Math.floor(Math.random() * PREVIEW_PROFILES.length)];
}

function applyRandomConfig(botId: string) {
  const profile = getRandomProfile();
  window.loopReplyConfig = {
    agentId: botId,
    preview: true,
    user: profile.user,
    customFields: profile.customFields,
  };
  // Dispatch event so ConfigPanel updates
  window.dispatchEvent(new CustomEvent('lr-config-changed'));
}

function ConfigPanel() {
  const [config, setConfig] = useState<Window['loopReplyConfig']>(window.loopReplyConfig);

  useEffect(() => {
    const handler = () => {
      setConfig(window.loopReplyConfig);
    };
    window.addEventListener('lr-config-changed', handler);
    return () => window.removeEventListener('lr-config-changed', handler);
  }, []);

  if (!config) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 99998,
        maxWidth: 440,
        width: 'calc(100% - 24px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px 10px 0 0',
          fontSize: 13,
          fontWeight: 600,
          color: '#1E293B',
          width: '100%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ fontSize: 12 }}>{'</>'}</span>
        <span>Init Config</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 11,
          fontWeight: 500,
          color: '#64748B',
          backgroundColor: '#F1F5F9',
          padding: '2px 8px',
          borderRadius: 6,
        }}>
          {config.user?.name || 'Unknown User'}
        </span>
      </div>
      <div
        style={{
          backgroundColor: '#FAFAFA',
          border: '1px solid #E2E8F0',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          padding: 14,
          maxHeight: 320,
          overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <pre
          style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.7,
            color: '#334155',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          }}
        >
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// Read URL query params
const params = new URLSearchParams(window.location.search);
const botId = params.get('botID');
const urlToken = params.get('token');
const studioMode = params.get('mode') === 'studio';

// In studio mode, hide the fake website skeleton and center the widget
if (studioMode) {
  document.body.style.background = 'transparent';
  document.documentElement.style.background = 'transparent';
  // Hide all skeleton elements
  document.querySelectorAll('.sk-nav, .sk-page').forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });
  // Clear all widget state so each iframe load starts completely fresh
  localStorage.removeItem('lr_session_id');
  localStorage.removeItem('lr_conversation_id');
  localStorage.removeItem('lr_visitor_id');
  // Set global flag so widget components detect studio mode
  (window as any).__lrStudioMode = true;
}

if (botId) {
  // Apply config with the bot ID from URL
  applyRandomConfig(botId);
  // Expose for Reset button in App.tsx
  (window as any).__lrApplyRandomConfig = () => applyRandomConfig(botId);
}

// Listen for postMessage commands from parent frame (Bot Studio)
const ALLOWED_ORIGINS = [
  'http://localhost:9001',
  'https://app.convia.ro',
  window.location.origin,
];

window.addEventListener('message', (event) => {
  if (!ALLOWED_ORIGINS.includes(event.origin)) return;
  const { type, profile } = event.data || {};

  if (type === 'lr:setProfile' && profile && botId) {
    // Update the config with the selected profile — the iframe was just reloaded
    // so this sets up the config before the widget initializes
    window.loopReplyConfig = {
      agentId: botId,
      preview: true,
      user: profile.user,
      customFields: profile.customFields,
    };
    window.dispatchEvent(new CustomEvent('lr-config-changed'));
  } else if (type === 'lr:reset') {
    if ((window as any).Convia?.reset) {
      (window as any).Convia.reset();
    }
  } else if (type === 'lr:updateTheme' && event.data.theme) {
    // Live theme update from Appearance editor — merge partial theme into current store
    const currentTheme = useWidgetStore.getState().theme;
    const merged = mergeTheme(currentTheme, event.data.theme);
    useWidgetStore.setState({ theme: merged });
  } else if (type === 'lr:open') {
    if ((window as any).Convia?.open) {
      (window as any).Convia.open();
    }
  } else if (type === 'lr:close') {
    if ((window as any).Convia?.close) {
      (window as any).Convia.close();
    }
  }
});

// In studio mode, notify parent frame when widget layout changes so the preview panel can auto-resize
if (studioMode) {
  let prevOpen = useWidgetStore.getState().isOpen;
  let prevExpanded = useWidgetStore.getState().isExpanded;
  useWidgetStore.subscribe((state) => {
    if (state.isOpen !== prevOpen || state.isExpanded !== prevExpanded) {
      prevOpen = state.isOpen;
      prevExpanded = state.isExpanded;
      const { theme } = state;
      const isPortal = theme.mode === 'portal';
      const chatWindowWidth = state.isExpanded
        ? 600
        : isPortal ? Math.max(theme.chatWidth, 420) : theme.chatWidth;
      // The widget container is centered via: left:50% + translateX(-50% + chatWidth/2)
      // This shifts the bubble right so the chat window (positioned right:0) appears centered.
      // The rightmost point = iframe center + chatWidth/2 + bubbleSize/2
      // The leftmost point = rightmost - chatWindowWidth
      // For no clipping, iframe width must be >= 2 * rightmost point
      // = 2 * (chatWidth/2 + bubbleSize/2) + extra = chatWidth + bubbleSize + extra
      // BUT since the centering uses 50% of iframe width, we need:
      // iframeWidth/2 + chatWidth/2 + bubbleSize/2 <= iframeWidth (right side)
      // iframeWidth/2 + chatWidth/2 + bubbleSize/2 - chatWindowWidth >= 0 (left side)
      // Solving the left constraint: iframeWidth >= 2*(chatWindowWidth - chatWidth/2 - bubbleSize/2)
      const minFromLeft = 2 * (chatWindowWidth - theme.chatWidth / 2 - theme.bubble.size / 2);
      const minFromRight = theme.chatWidth + theme.bubble.size;
      const totalNeeded = state.isOpen
        ? Math.max(minFromLeft, minFromRight, 640) + 80 // +80 for breathing room
        : 640;
      window.parent.postMessage(
        { type: 'lr:widgetResized', width: totalNeeded },
        '*'
      );
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {botId ? (
      <PasswordGate botId={botId} autoToken={urlToken}>
        {!studioMode && <ConfigPanel />}
        <App />
      </PasswordGate>
    ) : (
      <MissingBotId />
    )}
  </React.StrictMode>
);
