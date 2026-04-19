import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import Button from "../atoms/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full bg-surface rounded-2xl border border-border p-6 shadow-lg">
            <div className="text-center">
              <div className="text-5xl mb-4">!</div>
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-muted mb-4">
                We encountered an unexpected error. Please try refreshing the
                page.
              </p>

              {this.state.error && (
                <details className="text-left bg-surface-secondary p-3 rounded text-sm">
                  <summary className="cursor-pointer font-medium text-foreground mb-2">
                    Error Details
                  </summary>
                  <div className="text-danger font-mono text-xs">
                    {this.state.error.message}
                  </div>
                </details>
              )}

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  fullWidth
                  variant="primary"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  fullWidth
                  variant="secondary"
                >
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
