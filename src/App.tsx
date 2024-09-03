import { Message } from "@/components/message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    SheetClose,
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
import { Send, Menu, ChevronDown, Plus, Key, Settings, Eraser } from "lucide-react";
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

type ModelProps = {
    id: number,
    name: string
  }

type ConversationProps = {
    id: number;
    name: string;
    messages: MessageProps[];
}

function App() {
    const [models, setModels] = useState<ModelProps[]>([
        {
        id: 0,
        name: "mistralai/Mistral-7B-Instruct-v0.3",
        },
        {
        id: 1,
        name: "google/gemma-1.1-7b-it",
        },
        {
        id: 2,
        name: "openai-community/gpt2",
        },
    ])
    const [conversations, setConversations] = useState<ConversationProps[]>([
        {
            id: 0,
            name: "Greetings",
            messages: [
                {
                    id: 0,
                    conversationId: 0,
                    message: "Hi, how are you?",
                    isAi: false,
                },
                {
                    id: 1,
                    conversationId: 0,
                    message: "I'm good, how about you?",
                    isAi: true,
                }
            ]
        },
        {
            id: 1,
            name: "Tomato discussion",
            messages: [
                {
                    id: 3,
                    conversationId: 1,
                    message: "Is tomato a fruit or a vegetable?",
                    isAi: false,
                },
                {
                    id: 4,
                    conversationId: 1,
                    message: "A tomato is a fruit. Knowledge is knowing that a tomato is a fruit. Wisdom is not putting it in a fruit salad.",
                    isAi: true,
                }
            ]
        }
    ])
    const [conversation, setConversation] = useState<ConversationProps>(conversations[0])
    const [currentModel, setCurrentModel] = useState(models[0]);
    const [userInput, setUserInput] = useState("");
    const [responseLoading, setResponseLoading] = useState(false);
    const [key, setKey] = useState("");

    const sendMessage = async (message: string, isAi: boolean) => {
        setResponseLoading(true);
        setUserInput("");
        
        // Add a new message to the conversation and let the user know that the AI is thinking
        const newMessage =  [
            {
                id: conversation.messages.length,
                conversationId: conversation.id,
                message: message,
                isAi: isAi
            },
            {
                id: conversation.messages.length + 1,
                conversationId: conversation.id,
                message: "Thinking...",
                isAi: true
            }
        ]
        let updatedMessages = [...conversation.messages, ...newMessage];
        setConversation({ ...conversation, messages: updatedMessages });
    
        // System prompt for the AI to follow
        const systemPrompt = `System: Always assist with care, respect, and truth. Respond with utmost utility yet securely. Avoid harmful, unethical, prejudiced, or negative content. Ensure replies promote fairness and positivity. Do not include "User: " in your responses. Only respond as the AI. \n\n`;
        
        // Concatenate all previous messages into a single prompt and label each message with their respective sender for better context
        const conversationHistory = systemPrompt + updatedMessages.map((message) => {
            return (message.isAi ? "AI: " : "User: ") + message.message;
        }).join("\n");
        console.log(conversationHistory);
    
        // Send the conversation history to the AI model and get a response
        await invoke<HfResponse>('hf_request', { message: conversationHistory, model: currentModel.name, key: key })
            .then((response) => {
                // Clean up the response and avoid the AI speaking on behalf of the user
                let trimmedGeneratedText = response.generated_text.trim();
                const indexOfUser = trimmedGeneratedText.indexOf("User: ");
                if (indexOfUser !== -1) {
                    trimmedGeneratedText = trimmedGeneratedText.substring(0, indexOfUser);
                }

                // Replace the "Thinking..." message with the AI's response
                updatedMessages[updatedMessages.length - 1].message = trimmedGeneratedText;

                updateConversation(updatedMessages);
                
            })
            .catch((error) => {
                console.error(error);
                updatedMessages[updatedMessages.length - 1].message = "An error occurred while processing your request.";

                updateConversation(updatedMessages);
            });
    
        setResponseLoading(false);
    }

    const updateConversation = (updatedMessages: MessageProps[]) => {
        // Update the active conversation with the new messages
        setConversation({ ...conversation, messages: updatedMessages });

        // Update the active conversation in the list of conversations
        setConversations(conversations.map((conv) => conv.id === conversation.id ? conversation : conv));
    }

    const addConversation = () => {
        const conversationObject = 
        {
            id: conversations.length,
            name: "New Conversation",
            messages: []
        }

        const newConversations = [...conversations, conversationObject]
        setConversations(newConversations)
        setConversation(conversationObject)
    }


    return (
        <div className="flex flex-col h-screen py-2">
            <header className="flex justify-between items-center p-2 pt-0">
                <div className="flex gap-2 w-full">
                    <Sheet>
                        <SheetTrigger>
                            <Button variant={"ghost"} size={"icon"}><Menu size={16}/></Button>
                        </SheetTrigger>
                        <SheetContent side={"left"} className="flex flex-col h-fit m-4 p-0 rounded-lg">
                            <SheetHeader className="p-4 pb-0 pt-3">
                                <SheetTitle className="font-bold">Babble</SheetTitle>
                            </SheetHeader>
                            <div className="w-full pb-2">
                                <SheetClose asChild>
                                    <Button 
                                            className="flex flex-row gap-2 justify-start w-full mb-2 rounded-none"
                                            variant={"ghost"}
                                            onClick={() => addConversation()}
                                        >
                                            <Plus size={16}/>
                                            New conversation
                                    </Button>
                                </SheetClose>
                                {conversations.map((conversation, index) => (
                                    <SheetClose asChild>
                                        <Button 
                                            className="w-full justify-start rounded-none font-normal" 
                                            variant="ghost"
                                            key={index}
                                            onClick={() => setConversation(conversation)}
                                        >
                                            {conversation.name}
                                        </Button>
                                    </SheetClose>
                            ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                    <Button 
                        size={"icon"} 
                        variant={"ghost"}
                        onClick={() => setConversation({
                            id: conversation.id,
                            name: conversation.name,
                            messages: []
                        })}
                    >
                        <Eraser size={16} />
                    </Button>
                </div>
                <div className="flex flex-row items-center justify-center w-full">
                    <p className="w-max text-sm">You are now babbling to</p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="link" className="font-bold px-1 h-auto gap-1">
                                    {currentModel.name}
                                    <ChevronDown size={12} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-auto">
                                <DropdownMenuLabel>Switch model</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    {models.map((model, index) => (
                                        <DropdownMenuItem key={index} onSelect={() => setCurrentModel(model)}>
                                            <span>{model.name}</span>
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Plus className="mr-2 h-4 w-4" />
                                            <span>Add new model</span>
                                        </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Manage models</span>
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
                            <Input type="password" value={key} onChange={(e) => setKey(e.target.value)} className="bg-stone-100" placeholder="Access Token" />
                        </PopoverContent>
                    </Popover>
                </div>
            </header>
            <ScrollArea className="h-full">
                <div className="flex flex-col gap-2 h-full max-w-screen-md mx-auto px-8 mb-8">
                    {conversation.messages.map((message, index) => (
                        <Message key={index} message={message.message} isAi={message.isAi} />
                    ))}
                </div>
            </ScrollArea>
            <footer className="flex justify-center items-center w-full p-2 pt-2">
                <div className="flex flex-row max-w-screen-md w-full gap-2">
                    <Input value={userInput} onChange={(e) => setUserInput(e.target.value)} className="bg-stone-100" placeholder={"Babble to " + currentModel.name} />
                    <Button disabled={responseLoading} onClick={() => sendMessage(userInput, false)} className="p-3"><Send size={16}/></Button>
                </div>
            </footer>
        </div>
    );
}

export default App;