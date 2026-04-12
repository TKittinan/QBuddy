import { User } from "lucide-react";

interface ChatMessageProps {
  text: string;
  senderName: string;
  timestamp: string;
  isAdmin: boolean;
}

export function ChatMessage({ text, senderName, timestamp, isAdmin }: ChatMessageProps) {
  return (
    <div className={`flex w-full ${isAdmin ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-[70%] ${isAdmin ? "flex-row-reverse" : "flex-row"} gap-3`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? "bg-[#5AB2A8] text-white" : "bg-slate-200 text-slate-600"}`}>
          {isAdmin ? senderName.charAt(0).toUpperCase() : <User size={16} />}
        </div>
        <div className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
          <span className="text-xs text-slate-400 mb-1">{senderName} • {timestamp}</span>
          <div className={`p-3 rounded-2xl text-sm ${isAdmin ? "bg-[#5AB2A8] text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm"}`}>
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}