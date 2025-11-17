import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  // Fix: The constructor-based state initialization was causing issues, likely due to a
  // misconfigured build environment. Using a class field initializer for `state`
  // is a more modern approach that should resolve the reported errors about
  // 'state' and 'props' not existing on the component instance.
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-900 min-h-screen text-slate-50 flex flex-col items-center justify-center p-8 text-center main-bg">
            <i className="fa-solid fa-triangle-exclamation text-5xl text-rose-400 mb-6"></i>
            <h1 className="text-3xl font-bold mb-2">Something went wrong.</h1>
            <p className="text-slate-300 mb-6 max-w-md">
                An unexpected error occurred. This might be a temporary issue with an external service or your connection.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-colors"
            >
                Refresh Page
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
