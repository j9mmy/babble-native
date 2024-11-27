import { createContext, useContext, useState, ReactNode } from 'react';

export type ModalAction = {
    type: 'edit' | 'delete' | 'model' | 'token' | 'settings';
    id?: string;
}

type ModalContextType = {
    isOpen: boolean;
    modal: ModalAction | null;
    setIsOpen: (value: boolean) => void;
    setModal: (value: ModalAction | null) => void;
    handleCloseModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [modal, setModal] = useState<ModalAction | null>(null);

    const handleCloseModal = () => {
        setIsOpen(false);
        setTimeout(() => {
            setModal(null);
        }, 150);
    };

    return (
        <ModalContext.Provider value={{
            isOpen,
            modal,
            setIsOpen,
            setModal,
            handleCloseModal
        }}>
            {children}
        </ModalContext.Provider>
    );
}

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};