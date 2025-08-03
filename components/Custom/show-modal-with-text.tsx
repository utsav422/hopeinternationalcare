'use client';
import type React from 'react';
import { Button } from '../ui/button';

interface ModalProps {
  isOpen: boolean;
  text: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, text }) => {
  if (!isOpen) {
    return null;
  }

  const modalStyle: React.CSSProperties = {
    display: isOpen ? 'block' : 'none',
    position: 'static',
    zIndex: 1,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    overflow: 'auto',
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: '#fefefe',
    margin: 'auto',
    padding: '20px',
    border: '1px solid #888',
    width: '80%',
    maxWidth: '600px',
    borderRadius: '8px',
  };

  return (
    <div className="modal" style={modalStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <Button
          aria-label="Close modal"
          className="close"
          onClick={onClose}
          type="button"
        >
          &times;
        </Button>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Modal;
