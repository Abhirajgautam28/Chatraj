import React from 'react';

class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chat message rendering failed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-2 my-1 text-xs italic text-red-500 bg-red-100 rounded border border-red-200">
          Message failed to render.
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChatErrorBoundary;
