import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
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
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-tertiary/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-tertiary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Hoppla! Etwas ist schiefgelaufen.</h2>
          <p className="text-on-surface-variant mb-6 max-w-xs mx-auto">
            Die Anwendung konnte nicht wie erwartet geladen werden.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20"
          >
            <RefreshCw className="w-5 h-5" />
            App neu laden
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-surface-container-low rounded-lg text-left text-xs overflow-auto max-w-full">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
