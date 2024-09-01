import ReactMarkdown from 'react-markdown';

interface MessageProps {
    message: string;
    isAi: boolean;
}

function Message({ message, isAi: variant }: MessageProps) {

    return (
        <div>
            {!variant ? (
                <UserMessage message={message} />
            ) : (
                <AiMessage message={message} />
            )}
        </div>
    );
}

function UserMessage({ message }: { message: string }) {
    return (
        <div className="flex flex-col grow items-end gap-1 text-sm">
            <strong className="w-max">You</strong>
            <div className="w-max bg-stone-100 px-4 py-2 rounded-sm max-w-screen-sm text-neutral-800 font-normal prose prose-invert prose-neutral prose-sm">
                <ReactMarkdown>{message}</ReactMarkdown>
            </div>
        </div>
    );
}

function AiMessage({message}: {message: string}) {
    return (
        <div className="flex flex-col grow items-start gap-1 text-sm">
            <strong>AI</strong>
            <div className="bg-stone-800 px-4 py-2 rounded-sm max-w-screen-sm text-neutral-100 font-normal prose prose-invert prose-neutral prose-sm">
                <ReactMarkdown>{message}</ReactMarkdown>
            </div>
        </div>
    );
}

export { Message };