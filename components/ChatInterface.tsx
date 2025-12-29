import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, image?: string) => void;
  isProcessing: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSend = () => {
    if (!inputText.trim() && !selectedImage) return;
    onSendMessage(inputText, selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1]; 
        setSelectedImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-200/20 border border-slate-200/60 overflow-hidden">
      {/* Premium Header */}
      <div className="px-8 py-6 border-b border-slate-100/50 bg-white/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
              </span>
              Intelligence Hub
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Context-Aware Advisory</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
             <div className="px-3 py-1 bg-white shadow-sm rounded-full text-[10px] font-bold text-slate-700 uppercase">Live</div>
             <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">Secure</div>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && !isProcessing && (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h4 className="text-slate-900 font-bold tracking-tight mb-2">Initiate Deployment</h4>
            <p className="text-sm text-slate-500 leading-relaxed">System is ready to analyze prospect lists, draft outreach, or optimize strategy.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[88%] relative group
                ${msg.role === Role.USER 
                  ? 'bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-none px-5 py-3.5 shadow-lg shadow-indigo-600/20' 
                  : 'bg-slate-100/70 text-slate-800 rounded-[1.5rem] rounded-tl-none px-5 py-3.5 border border-slate-200/30'
                }`}
            >
              {msg.image && (
                <div className="mb-3 overflow-hidden rounded-xl border border-white/20 shadow-sm">
                   <img src={`data:image/jpeg;base64,${msg.image}`} alt="Context" className="w-full object-cover max-h-48" />
                </div>
              )}
              <div className="text-[14.5px] leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</div>
              
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                 <div className="mt-4 pt-3 border-t border-black/5 flex flex-col gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      Verification Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {msg.groundingSources.slice(0, 3).map((source, idx) => (
                            <a 
                              key={idx} 
                              href={source.uri} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold border border-white/10 truncate max-w-[120px] transition-all"
                            >
                                {source.title || "Reference"}
                            </a>
                        ))}
                    </div>
                 </div>
              )}
              <div className={`absolute bottom-[-18px] text-[9px] font-bold text-slate-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === Role.USER ? 'right-2' : 'left-2'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-slate-100/50 rounded-[1.2rem] rounded-tl-none px-5 py-4 border border-slate-200/30">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input Bar */}
      <div className="px-8 py-6 border-t border-slate-100 bg-white/50 backdrop-blur-md">
        <div className="relative group">
          {selectedImage && (
            <div className="absolute top-[-54px] left-0 animate-in slide-in-from-bottom-2 fade-in duration-300">
                <div className="flex items-center gap-2 bg-slate-900 text-white pl-1 pr-3 py-1 rounded-xl shadow-xl shadow-slate-900/20 border border-slate-700">
                  <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-[10px]">IMG</div>
                  <span className="text-[11px] font-bold uppercase tracking-tight">Attached</span>
                  <button onClick={() => setSelectedImage(null)} className="ml-1 text-slate-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
            </div>
          )}
          
          <div className={`flex items-end gap-3 p-2 bg-white rounded-2xl border-2 transition-all shadow-sm
            ${isProcessing ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-slate-200 focus-within:border-indigo-500/50 focus-within:shadow-indigo-100/50 focus-within:shadow-lg'}
          `}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Attach Intel"
              disabled={isProcessing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            
            <textarea
              className="flex-1 bg-transparent resize-none border-none py-2.5 text-[14.5px] font-medium focus:ring-0 placeholder-slate-400 max-h-32 min-h-[40px]"
              rows={1}
              placeholder="Query strategic advisor..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
            />
            
            <button
              onClick={handleSend}
              disabled={!inputText.trim() && !selectedImage || isProcessing}
              className="h-10 w-10 shrink-0 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-45 -translate-y-0.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;