import React, { useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-strong/50 z-40 transition-opacity"
        onClick={handleOutsideClick}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 lg:p-8">
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 max-w-full sm:max-w-lg lg:max-w-7xl w-full mx-4 transition-transform transform scale-95 overflow-y-auto max-h-full"
        >
          {title && (
            <div className="flex justify-between items-center mb-4  pb-2">
              <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="text-strong hover:text-brand focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          <div>{children}</div>
        </div>
      </div>
    </>
  );
};

export default Modal;
