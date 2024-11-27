import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';	

interface MessagesType {
    role: string;
    content: string;
}

export interface ConversationType {
    id: string;
    title: string;
    messages: MessagesType[];
}

interface ConversationContextType {
    conversations: ConversationType[];
    setConversations: React.Dispatch<React.SetStateAction<ConversationType[]>>;
    activeConversationId: string | null;
    setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
    activeConversation: ConversationType | null;
    deleteConversation: (id: string) => void;
    editConversation: (id: string, title: string) => void;
}

const generateId = () => `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const createConversation = (): ConversationType => ({
    id: generateId(),
    title: "New conversation",
    messages: [{ role: "system", content: "Always assist with care, respect, and truth. Respond with utmost utility yet securely. Avoid harmful, unethical, prejudiced, or negative content. Ensure replies promote fairness and positivity. Keep responses short."}]
})

const ConversationContext = createContext<ConversationContextType>({} as ConversationContextType);

export const ConversationProvider = ({ children }: {children: ReactNode}) => {
    const [conversations, setConversations] = useState<ConversationType[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    
    const activeConversation = useMemo(() =>
        activeConversationId
            ? conversations.find((conv) => conv.id === activeConversationId) ?? null
            : null,
        [activeConversationId, conversations]
    );

    const editConversation = useCallback((id: string, title: string) => {
        if (!id) return;

        setConversations((prevConversations) => 
            prevConversations.map((conv) => 
              conv.id === id
                ? { ...conv, title: title }
                : conv
            )
        );
    }, [conversations]);

    const deleteConversation = useCallback((id: string) => {
        if (!id) return;
        
        setConversations(prev => prev.filter(conv => conv.id !== id));
        
        setActiveConversationId(currentId => {
            if (currentId !== id) return currentId;
            
            const remainingConversations = conversations.filter(conv => conv.id !== id);
            return remainingConversations.length > 0
                ? remainingConversations[remainingConversations.length - 1].id
                : null;
        });
    }, [conversations]);

    return (
        <ConversationContext.Provider value={{
            conversations,
            setConversations,
            activeConversationId: activeConversationId!,
            setActiveConversationId,
            activeConversation,
            deleteConversation,
            editConversation
        }}>
            {children}
        </ConversationContext.Provider>
    );
};

export const useConversations = () => {
    const context = useContext(ConversationContext);
    if (!context) throw new Error('useConversations must be used within a ConversationProvider');

    return context;
}