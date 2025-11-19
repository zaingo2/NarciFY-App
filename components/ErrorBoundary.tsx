import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-900 min-h-screen text-slate-50 flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-rose-500/10 p-6 rounded-xl border border-rose-500/50 max-w-md">
                <i className="fa-solid fa-triangle-exclamation text-5xl text-rose-400 mb-6"></i>
                <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
                <p className="text-slate-300 mb-6 text-sm">
                    The application encountered an unexpected error.
                </p>
                {this.state.error && (
                    <pre className="text-xs text-left bg-slate-950 p-4 rounded mb-6 overflow-auto max-h-32 text-rose-300 font-mono">
                        {this.state.error.toString()}
                    </pre>
                )}
                <button
                    onClick={() => window.location.reload()}
                    className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition-colors"
                >
                    Reload Application
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;