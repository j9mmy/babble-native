import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { load } from '@tauri-apps/plugin-store';

type ModelContextType = {
    activeModel: string;
    setActiveModel: (model: string) => void;
    loadModel: () => void;
    setModel: (model: string) => void;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
    const [activeModel, setActiveModel] = useState("");

    useEffect(() => {
        loadModel();
    }, []);

    async function loadModel() {
        const store = await load('settings.json', { autoSave: false });
        const model = await store.get('activeModel') as string;

        if (!model.trim()) {
            throw new Error('No model found in settings.json');
        }

        setActiveModel(model);
        console.info(`Loaded model: ${model}`);
    }

    async function setModel(model: string) {
        if (!model.trim()) {
            throw new Error('Model cannot be empty');
        }

        const store = await load('settings.json', { autoSave: false });
        await store.set('activeModel', model);
        await store.save();
        console.log(`Set model: ${model}`);
    }

    return (
        <ModelContext.Provider value={{
            activeModel,
            setActiveModel,
            loadModel,
            setModel
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