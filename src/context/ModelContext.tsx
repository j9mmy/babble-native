import { createContext, useContext, useState, ReactNode } from 'react';

type ModelContextType = {
    activeModel: string;
    setActiveModel: (model: string) => void;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
    const [activeModel, setActiveModel] = useState('microsoft/Phi-3.5-mini-instruct');

    return (
        <ModelContext.Provider value={{
            activeModel,
            setActiveModel
        }}>
            {children}
        </ModelContext.Provider>
    );
}

export const useModel = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModel must be used within a ModelProvider');
    }
    return context;
};