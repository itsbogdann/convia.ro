import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[Convia] Widget error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: 24,
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: 14,
          }}
        >
          <div>
            <p style={{ marginBottom: 8 }}>Something went wrong.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                background: 'transparent',
                color: '#6B7280',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
