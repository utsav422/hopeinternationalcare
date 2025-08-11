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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-white">
        <Button
          aria-label="Close modal"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
          type="button"
          variant="ghost"
        >
          &times;
        </Button>
        <p className="text-gray-800 dark:text-gray-200">{text}</p>
      </div>
    </div>
  );
};

export default Modal;
