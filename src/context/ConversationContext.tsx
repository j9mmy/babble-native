import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { load } from '@tauri-apps/plugin-store';
import { HfInference } from '@huggingface/inference';

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
    loadConversations: () => void;
    sendMessage: (input: string, activeModel: string) => void;
}

const generateId = () => `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const createConversation = (): ConversationType => ({
    id: generateId(),
    title: "New conversation",
    messages: [{ role: "system", content: "Always assist with care, respect, and truth. Respond with utmost utility yet securely. Avoid harmful, unethical, prejudiced, or negative content. Ensure replies promote fairness and positivity. Keep responses short."}]
})

const ConversationContext = createContext<ConversationContextType>({} as ConversationContextType);

export const ConversationProvider = ({ children }: {children: ReactNode}) => {
    const [conversations, setConversations] = useState<ConversationType[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    useEffect(() => {
        loadConversations();
    }, []);
    
    const activeConversation = useMemo(() =>
        activeConversationId
            ? conversations.find((conv) => conv.id === activeConversationId) ?? null
            : null,
        [activeConversationId, conversations]
    );

    async function loadConversations() {
        const store = await load('conversations.json', { autoSave: false });
        const convs = await store.get<ConversationType[]>('conversations');

        if (!convs) {
            throw new Error('No conversations found in conversations.json');
        }

        console.log('Loaded conversations:', convs);    
        setConversations(convs);
    }

    async function sendMessage(input: string, activeModel: string) {
        if (!input.trim()) return;
    
        const currentConversation = activeConversation ?? createConversation();
        if (!activeConversationId) {
          setActiveConversationId(currentConversation.id);
          setConversations((prevConversations) => [...prevConversations, currentConversation]);
        }
    
        const updatedConv = {
          ...currentConversation,
          messages: [
            ...currentConversation.messages,
            { role: 'user', content: input },
            { role: 'assistant', content: '' }
          ]
        }
    
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.id === updatedConv.id ? updatedConv : conv
          )
        );
    
        const tokenStore = await load('token.dat', { autoSave: false });
        const hf = new HfInference(await tokenStore.get('token'));
    
        const stream = hf.chatCompletionStream({
          model: activeModel,
          messages: updatedConv.messages.slice(0, -1),
          max_tokens: 1024,
          temperature: 0.5,
        });

        const convsStore = await load('conversations.json', { autoSave: false });
    
        try 
        {
            for await (const chunk of stream) {
                if (!chunk.choices?.[0]?.delta?.content) continue;
        
                setConversations((prevConversations) => {
                    const conv = prevConversations.find((conv) => conv.id === updatedConv.id);
                    if (!conv) return prevConversations;
            
                    const convs = prevConversations.map((conv) =>
                        conv.id === updatedConv.id
                        ? {
                            ...conv,
                            messages: [
                                ...conv.messages.slice(0, -1),
                                {
                                ...conv.messages[conv.messages.length - 1],
                                content: conv.messages[conv.messages.length - 1].content + chunk.choices[0].delta.content
                                }
                            ]
                        }
                        : conv
                    );

                    convsStore.set('conversations', convs);
                    convsStore.save();
                    return convs;
                })
            }
        } 
        catch (error) 
        {
          console.error(error);
          setConversations((prevConversations) => {
            const conv = prevConversations.find((conv) => conv.id === updatedConv.id);
            if (!conv) return prevConversations;
    
            return prevConversations.map((conv) =>
                conv.id === updatedConv.id
                    ? {
                        ...conv,
                        messages: [
                        ...conv.messages.slice(0, -1),
                        {
                            ...conv.messages[conv.messages.length - 1],
                            content: conv.messages[conv.messages.length - 1].content + 'An error occurred while processing your request. Check if your access token is valid and try again.'
                        }
                        ]
                    }
                    : conv
                );
            });
        }
    }

    const editConversation = useCallback(async (id: string, title: string) => {
        if (!id) return;

        const store = await load('conversations.json', { autoSave: false });

        setConversations((prevConversations) => {
            const convs = prevConversations.map((conv) => 
              conv.id === id
                ? { ...conv, title: title }
                : conv
            );

            store.set('conversations', convs);
            store.save();
            return convs;
        });
    }, [conversations]);

    const deleteConversation = useCallback(async (id: string) => {
        if (!id) return;

        const store = await load('conversations.json', { autoSave: false });
        
        setConversations(prev => {
            const convs = prev.filter(conv => conv.id !== id)

            store.set('conversations', convs);
            store.save();
            return convs;
        });
        
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
            editConversation,
            loadConversations,
            sendMessage
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