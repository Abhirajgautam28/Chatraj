import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import '../styles/AskChatRajModal.css';

const AskChatRajModal = ({ isOpen, onRequestClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Ask ChatRaj Modal"
      overlayClassName="ask-chat-raj-modal-overlay"
      className="ask-chat-raj-modal-content"
    >
      <div className="ask-chat-raj-modal-header">
        <h2>Ask ChatRaj</h2>
        <button onClick={onRequestClose} className="ask-chat-raj-modal-close-button">
          &times;
        </button>
      </div>
      <div className="ask-chat-raj-modal-body">
        {/* Add your custom chatbot implementation here */}
        <p>Custom chatbot implementation goes here.</p>
      </div>
    </Modal>
  );
};

AskChatRajModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
};

export default AskChatRajModal;
