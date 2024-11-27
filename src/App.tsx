import { KeyboardEvent, useRef, useState, useEffect, useCallback } from 'react'
import { HfInference } from '@huggingface/inference';
import { ScrollArea } from './components/ui/scroll-area';
import { Button } from './components/ui/button';
import ReactMarkdown from 'react-markdown';
import './App.css'
import { MoreHorizontal, Send } from 'lucide-react';
import { useConversations, createConversation } from './context/ConversationContext';
import { Textarea } from './components/ui/textarea';
import { SidebarTrigger, useSidebar } from './components/ui/sidebar';
import { useModel } from './context/ModelContext';
import { load } from '@tauri-apps/plugin-store';

function App() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsprocessing] = useState(false);
  const { activeModel } = useModel();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    conversations, 
    setConversations, 
    activeConversationId, 
    setActiveConversationId,
    activeConversation
  } = useConversations();
  const { isMobile } = useSidebar();

  const handleNewConversation = useCallback(() => {
    const newConversation = createConversation();
    setConversations(prevConversations => [...prevConversations, newConversation]);
    setActiveConversationId(newConversation.id);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [{...activeConversation?.messages}]);

  async function sendMessage() {
    if (!input.trim()) return;
    setInput('');
    setIsprocessing(true);

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

    const store = await load('token.dat', { autoSave: false });
    const hf = new HfInference(await store.get('token'));

    const stream = hf.chatCompletionStream({
      model: activeModel,
      messages: updatedConv.messages.slice(0, -1),
      max_tokens: 1024,
      temperature: 0.5,
    });

    try {
      for await (const chunk of stream) {
        if (!chunk.choices?.[0]?.delta?.content) continue;

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
                      content: conv.messages[conv.messages.length - 1].content + chunk.choices[0].delta.content
                    }
                  ]
              }
              : conv
          );
        })
      }
    } catch (error) {
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

    setIsprocessing(false);
  }

  function handleEnterKeyPress(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing && input.trim().length > 0) {
      sendMessage();

      const textArea = document.querySelector('textarea');
      if (textArea) {
        textArea.focus();
        textArea.style.height = '36px';
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  }

  function handleTextArea(e: React.ChangeEvent<HTMLTextAreaElement>) {
      setInput(e.target.value);
      e.target.style.height = '36px';
      e.target.style.height = (e.target.scrollHeight + 1.5) + 'px';
    }

  return (
    <div className={`w-full max-h-screen p-2 ${!isMobile && "ps-0"}`}>
      <div className="flex flex-col h-full w-full bg-background shadow-md rounded-lg border border-sidebar-border">
        <div className='flex flex-col md:flex-row justify-center items-center text-sm p-2 md:p-4 relative'>
          <p>You are now babbling to</p>
          <strong className='ms-1'>{activeModel}</strong>
        </div>
        {activeConversation == null || activeConversation.messages.length < 2 ? (
          <div className='flex flex-col h-full justify-end items-center text-sm text-muted-foreground animate-pulse p-2 md:p-4'>
            <p>Send a message to start babbling</p>
          </div>
        ) : (
          <ScrollArea className="flex flex-col h-full w-full">
            <div className='flex flex-col gap-4 max-w-screen-md px-2 mx-auto'>
              {activeConversation.messages.slice(1).map((message, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col gap-2 mb-0 ${message.role === 'assistant' ? 'self-start' : 'self-end'} ${index == activeConversation.messages.length - 2 ? 'md:mb-8' : ''}`}
                >
                  <strong className={`text-xs ${message.role === 'assistant' ? 'self-start' : 'self-end'}`}>{message.role}</strong>
                  <div className={`no-margin flex flex-col gap-2 ${message.role === 'assistant' ? 'assistant-message' : 'user-message'}`}>
                    {message.content.length == 0 ? (
                      <MoreHorizontal className='animate-pulse'/>
                    ) : (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <div className="flex gap-2 w-full self-center p-2 max-w-screen-md">
          <SidebarTrigger />
          <Textarea 
            placeholder={"Babble to " + activeModel}
            value={input}
            className='h-9 max-h-20 w-full bg-sidebar shadow-sm focus-visible:ring-0 resize-none'
            onChange={(e) => handleTextArea(e)}
            onKeyDown={(e) => handleEnterKeyPress(e)}
          />
          <Button 
            disabled={input.trim() ===  '' || isProcessing} 
            onClick={() => sendMessage()} 
            className="h-9 w-9 shadow-sm transition"
          >
            <Send/>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App;