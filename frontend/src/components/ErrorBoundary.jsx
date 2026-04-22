import React from 'react';
import PropTypes from 'prop-types';
import { logger } from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50 dark:bg-gray-900 border border-red-200 dark:border-red-900 rounded-lg">
          <i className="mb-4 text-4xl text-red-500 ri-error-warning-line"></i>
          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Something went wrong</h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {this.props.fallbackMessage || 'An unexpected error occurred in this component.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackMessage: PropTypes.string
};

export default ErrorBoundary;
