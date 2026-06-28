import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import hljs from 'highlight.js';

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);
  React.useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && hljs) {
      try {
        hljs.highlightElement(ref.current);
        ref.current.removeAttribute('data-highlighted');
      } catch (e) {
        // Non-fatal: highlight.js may throw for unknown languages
        // keep rendering without syntax highlighting
        // eslint-disable-next-line no-console
        console.warn('hljs highlight failed', e);
      }
    }
  }, [props.className, props.children]);
  return <code {...props} ref={ref} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', display: 'block' }} />;
}

SyntaxHighlightedCode.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export default SyntaxHighlightedCode;
