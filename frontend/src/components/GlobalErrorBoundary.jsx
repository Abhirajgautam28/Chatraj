import React from 'react';
import PropTypes from 'prop-types';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full">
            <i className="ri-error-warning-line text-6xl text-red-500 mb-4 block"></i>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong.</h1>
            <p className="text-gray-600 mb-6">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left bg-gray-50 p-4 rounded border text-sm overflow-auto">
                <summary className="cursor-pointer text-gray-500 font-medium">Error Details</summary>
                <pre className="mt-2 text-red-600">{this.state.error?.toString()}</pre>
              </details>
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
