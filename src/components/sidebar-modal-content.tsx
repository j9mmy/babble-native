import { useState } from 'react';
import { useSidebar } from './ui/sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AppSidebar } from './app-sidebar';
import { useModal } from '../context/ModalContext';
import { useConversations } from '../context/ConversationContext';
import { useModel } from '../context/ModelContext';
import { load } from '@tauri-apps/plugin-store'

export function SidebarModalHandler() {
    const { isOpen, modal, handleCloseModal } = useModal();
    const { isMobile } = useSidebar();

    const ModalContent = () => {
        if (!modal) return null;

        switch (modal?.type) {
            case 'edit':
                if (!modal.id) return null;

                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Edit Conversation</DialogTitle>
                        </DialogHeader> 
                        <EditConversationForm 
                            conversationId={modal.id}
                            onClose={handleCloseModal} 
                        />
                    </>
                );
            case 'delete':
                if (!modal.id) return null;
                
                return (
                    <>
                        <DialogHeader className='gap-1.5'>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete your conversation.
                            </DialogDescription>
                        </DialogHeader>
                        <DeleteConversationForm
                            conversationId={modal.id}
                            onClose={handleCloseModal} 
                        />
                    </>
                );
            case 'model':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Change Model</DialogTitle>
                        </DialogHeader>
                        <ChangeModelForm onClose={handleCloseModal} />
                    </>
                );
            case 'token':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Change Access Token</DialogTitle>
                        </DialogHeader>
                        <ChangeTokenForm onClose={handleCloseModal} />
                    </>
                );
            default:
                return null;
        }
    };

    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={handleCloseModal}>
                <AppSidebar />
                <DrawerContent>
                    <ModalContent />
                </DrawerContent>
            </Drawer>
        );
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={handleCloseModal}>
            <AppSidebar />
            <DialogContent className="sm:max-w-[425px]">
                <ModalContent />
            </DialogContent>
        </Dialog>
    );
}

function EditConversationForm({conversationId, onClose}: {conversationId: string, onClose: () => void}) {
    const [input, setInput] = useState<string>('');
    const { editConversation } = useConversations();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (conversationId) {
            editConversation(conversationId, input);
        }
        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className={"grid gap-4"}>
            <div className="grid gap-2 mt-1">
                <Input type="input" placeholder="Conversation title" value={input} onChange={(e) => setInput(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Button type="submit">Save changes</Button>
                <Button type="button" variant="ghost" onClick={() => onClose()}>Cancel</Button>
            </div>
        </form>
    );
}

function DeleteConversationForm({conversationId, onClose}: {conversationId: string, onClose: () => void}) {
    const { deleteConversation } = useConversations();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (conversationId) {
            deleteConversation(conversationId);
        }
        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className='flex justify-end gap-2'>
            <Button type='button' onClick={() => onClose()} variant={'outline'}>Cancel</Button>
            <Button type="submit" variant={'default'}>Continue</Button>
        </form>
    );
}

function ChangeModelForm({onClose}: {onClose: () => void}) {
    const { activeModel, setModel, loadModel } = useModel();
    const [input, setInput] = useState<string>(activeModel);
    const [invalidInput, setInvalidInput] = useState<boolean>(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            await setModel(input);
            await loadModel();
        } catch (error) {
            console.error(error);
            setInvalidInput(true);
            return;
        }

        onClose();
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
        setInvalidInput(false);
    }

    return (
        <form onSubmit={handleSubmit} className={"grid gap-4"}>
            <div className="grid gap-2 mt-1">
                <Input 
                    type="input" 
                    placeholder="openai-community/gpt2" 
                    value={input} 
                    onChange={(e) => handleInputChange(e)}
                    className={invalidInput ? 'border-red-500' : ''}
                />
                {invalidInput && <p className="text-red-500 text-sm">Invalid model name</p>}
            </div>
            <div className="grid gap-2">
                <Button type="submit">Save changes</Button>
                <Button type="button" variant="ghost" onClick={() => onClose()}>Cancel</Button>
            </div>
        </form>
    )
}

function ChangeTokenForm({onClose}: {onClose: () => void}) {
    const [input, setInput] = useState<string>('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!input.trim()) {
            return;
        }

        const store = await load('token.dat', { autoSave: false });
        await store.set('token', input);
        await store.save();

        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className={"grid gap-4"}>
            <div className="grid gap-2 mt-1">
                <Input type="password" placeholder="Access token" value={input} onChange={(e) => setInput(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Button type="submit">Save changes</Button>
                <Button type="button" variant="ghost" onClick={() => onClose()}>Cancel</Button>
            </div>
        </form>
    )
}