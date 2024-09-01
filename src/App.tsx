import { Message } from "@/components/message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Send, Menu, User, Settings, LogOut, ChevronDown, Plus, Key } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { invoke } from "@tauri-apps/api";

interface MessageProps {
    id: number;
    conversationId: number;
    message: string;
    isAi: boolean;
}

interface HfResponse {
    model: string;
    generated_text: string;
}

function App() {
    const [messages, setMessages] = useState<MessageProps[]>([]);
    const [models, setModels] = useState([
        "google/gemma-1.1-7b-it",
        "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "meta-llama/Meta-Llama-3-70B-Instruct",
        "mistralai/Mistral-Nemo-Instruct-2407",
        "mistralai/Mistral-7B-Instruct-v0.3",
        "openai-community/gpt2"
    ])
    const [currentModel, setCurrentModel] = useState(models[0]);
    const [inputField, setInputField] = useState("");
    const [responseLoading, setResponseLoading] = useState(false);
    const [key, setKey] = useState("");

    const sendMessage = async (message: string, isAi: boolean) => {
        setResponseLoading(true);
        setInputField("");
    
        // Create a new array with the user's message
        const newMessages = [...messages, {
            id: messages.length,
            conversationId: 0,
            message: message,
            isAi: isAi
        }];
        setMessages(newMessages);
    
        // Add a "Thinking" message to the state
        const thinkingMessage = {
            id: newMessages.length,
            conversationId: 0,
            message: "Thinking...",
            isAi: true
        };
        setMessages([...newMessages, thinkingMessage]);
    
        // Define the system prompt
        const systemPrompt = "System: Always assist with care, respect, and truth. Respond with utmost utility yet securely. Avoid harmful, unethical, prejudiced, or negative content. Ensure replies promote fairness and positivity.";
    
        // Concatenate all previous messages into a single string with labels
        const conversationHistory = systemPrompt + '\n' + newMessages.map(msg => `${msg.isAi ? 'AI' : 'User'}: ${msg.message}`).join('\n') + '\nAI:';
        console.log(conversationHistory);
    
        await invoke<HfResponse>('hf_request', { message: conversationHistory, model: currentModel, key: key })
            .then((response) => {
                console.log(response);
                const trimmedGeneratedText = response.generated_text.trim();
                // Replace the "Thinking" message with the actual AI-generated message
                const updatedMessages = [...newMessages, {
                    id: newMessages.length,
                    conversationId: 0,
                    message: trimmedGeneratedText,
                    isAi: true,
                }];
                setMessages(updatedMessages);
            })
            .catch((error) => {
                console.error(error);
                const updatedMessages = [...newMessages, {
                    id: newMessages.length,
                    conversationId: 0,
                    message: "An error occurred while processing your request.",
                    isAi: true,
                }];
                setMessages(updatedMessages);
            });
    
        setResponseLoading(false);
    }

    return (
        <div className="flex flex-col h-screen py-2">
            <header className="flex justify-between items-center p-2 pt-0">
                <div className="flex gap-2 w-full">
                    <Sheet>
                        <SheetTrigger>
                            <Button variant={"ghost"} size={"icon"}><Menu size={16}/></Button>
                        </SheetTrigger>
                        <SheetContent side={"left"} className="h-fit w-fit m-4 p-0 rounded-lg">
                            <SheetHeader className="p-4 pb-2 pt-3">
                                <SheetTitle className="text-xl font-extrabold">Babble</SheetTitle>
                            </SheetHeader>
                            <hr className="w-full h-0.5 bg-stone-100" />
                            <SheetDescription className="p-4 py-2 text-stone-900 font-bold">Previous Babbles</SheetDescription>
                            <div className="w-full pb-2">
                                <Button className="w-full justify-start rounded-none" variant="ghost">Trip to Italy</Button>
                                <Button className="w-full justify-start rounded-none" variant="ghost">Digital Nomadism</Button>
                                <Button className="w-full justify-start rounded-none" variant="ghost">Test Article</Button>
                            </div>
                            <hr className="w-full h-0.5 bg-stone-100" />
                            <SheetDescription className="p-4 py-2 text-stone-900 font-bold">Miscellaneous</SheetDescription>
                            <div className="w-full pb-2">
                                <Button className="w-full justify-start rounded-none" variant="ghost">Help</Button>
                                <Button className="w-full justify-start rounded-none" variant="ghost">Feedback</Button>
                                <Button className="w-full justify-start rounded-none" variant="ghost">About</Button>
                                <Button className="w-full justify-start rounded-none" variant="ghost">GitHub</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <Button size={"icon"} variant="ghost"><Plus size={16}/></Button>
                </div>
                <div className="flex flex-row items-center justify-center w-full">
                    <p className="w-max text-sm">You are now babbling    to</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="link" className="font-bold px-1 h-auto gap-1">
                                {currentModel}
                                <ChevronDown size={12} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto">
                            <DropdownMenuLabel>Switch model</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {models.map((model, index) => (
                                    <DropdownMenuItem key={index} onSelect={() => setCurrentModel(model)}>
                                        <span>{model}</span>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>Add new model</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex flex-row w-full me-2 justify-end">
                    <Popover>
                        <PopoverTrigger>
                            <Button size={"icon"} variant="ghost"><Key size={16}/></Button>
                        </PopoverTrigger>
                        <PopoverContent side={"bottom"} className="w-48">
                            <Input type="password" value={key} onChange={(e) => setKey(e.target.value)} className="bg-stone-100" placeholder="API Key" />
                        </PopoverContent>
                    </Popover>
                </div>
            </header>
            <ScrollArea className="h-full">
                <div className="flex flex-col gap-2 h-full max-w-screen-md mx-auto px-8 mb-8">
                    {messages.map((message, index) => (
                        <Message key={index} message={message.message} isAi={message.isAi} />
                    ))}
                </div>
            </ScrollArea>
            <footer className="flex justify-center items-center w-full p-2 pt-2">
                <div className="flex flex-row max-w-screen-md w-full gap-2">
                    <Input value={inputField} onChange={(e) => setInputField(e.target.value)} className="bg-stone-100" placeholder={"Babble to " + currentModel} />
                    <Button disabled={responseLoading} onClick={() => sendMessage(inputField, false)} className="p-3"><Send size={16}/></Button>
                </div>
            </footer>
        </div>
    );
}

export default App;