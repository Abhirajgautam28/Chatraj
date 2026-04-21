import React from 'react';
import PropTypes from 'prop-types';
import { logger } from '../utils/logger';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Global Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 text-center border border-red-100 dark:border-red-900/20">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-error-warning-fill text-4xl text-red-600"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              The application encountered an unexpected error. Don&apos;t worry, your progress might still be saved.
            </p>
            <div className="space-y-3">
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30"
                >
                    Refresh Page
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all"
                >
                    Go to Home
                </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 text-left p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto max-h-40">
                    <p className="text-xs font-mono text-red-500">{this.state.error?.toString()}</p>
                </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

GlobalErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GlobalErrorBoundary;
