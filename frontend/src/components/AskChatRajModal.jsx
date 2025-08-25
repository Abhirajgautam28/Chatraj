import React from 'react';
import Modal from 'react-modal';

const AskChatRajModal = ({ isOpen, onRequestClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Ask ChatRaj Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)'
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '600px',
          padding: '0',
          border: 'none',
          borderRadius: '10px'
        }
      }}
    >
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '10px',
          backgroundColor: '#f1f1f1',
          borderBottom: '1px solid #ccc',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px'
        }}>
          <h2 style={{ margin: 0 }}>Ask ChatRaj</h2>
          <button onClick={onRequestClose} style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}>
            &times;
          </button>
        </div>
        <div style={{ flex: 1, padding: '20px' }}>
          {/* Add your custom chatbot implementation here */}
          <p>Custom chatbot implementation goes here.</p>
        </div>
      </div>
    </Modal>
  );
};

export default AskChatRajModal;
