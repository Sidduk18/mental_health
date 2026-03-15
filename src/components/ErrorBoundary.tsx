import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="max-w-md w-full bg-red-50 border border-red-100 p-10 rounded-[40px] text-center space-y-6">
            <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-red-900">Something went wrong</h2>
            <p className="text-red-900/60 text-sm">
              An unexpected error occurred. We've been notified and are looking into it.
            </p>
            <div className="bg-white/50 p-4 rounded-2xl text-left overflow-auto max-h-32">
              <code className="text-xs text-red-800 break-all">
                {this.state.error?.message}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-all"
            >
              <RefreshCcw className="w-5 h-5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
