"use client";

import Modal from "@/app/_components/common/modal";
import React, { createContext, useContext, useState, ReactNode } from "react";

type ModalContextType = {
  isOpen: boolean;
  modalContent: React.ReactNode;
  modalTitle?: string;
  openModal: (content: React.ReactNode, title?: string) => void;
  closeModal: () => void;
};

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState<string>();

  const openModal = (content: React.ReactNode, title?: string) => {
    setModalContent(content);
    setModalTitle(title);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
    setModalTitle(undefined);
  };

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        modalContent,
        modalTitle,
        openModal,
        closeModal,
      }}
    >
      {children}
      <Modal isOpen={isOpen} onClose={closeModal} title={modalTitle}>
        {modalContent}
      </Modal>
    </ModalContext.Provider>
  );
}
