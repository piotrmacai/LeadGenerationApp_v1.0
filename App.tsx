import React, { useState, useEffect } from 'react';
import { ChatSession, Lead, Message, Role, SearchParams } from './types';
import LeadFinder from './components/LeadFinder';
import LeadsTable from './components/LeadsTable';
import ChatInterface from './components/ChatInterface';
import { generateLeads, sendChatMessage } from './services/geminiService';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('leadgen_sessions');
    return saved ? JSON.parse(saved) : [{
      id: Date.now().toString(),
      name: 'Initial Prospecting',
      messages: [],
      createdAt: Date.now()
    }];
  });
  
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0].id);
  const [activeLeads, setActiveLeads] = useState<Lead[]>([]);
  
  const [isGeneratingLeads, setIsGeneratingLeads] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('leadgen_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation access denied or failed", error);
        }
      );
    }
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Market Analysis ${sessions.length + 1}`,
      messages: [],
      createdAt: Date.now()
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setActiveLeads([]);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setActiveLeads([]);
  };

  const handleLeadSearch = async (params: SearchParams) => {
    setIsGeneratingLeads(true);
    
    const searchMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: `Researching: ${params.query} in ${params.location} within ${params.radius}km`,
      timestamp: Date.now()
    };
    
    updateSessionMessages(activeSessionId, searchMsg);

    try {
      const result = await generateLeads(
        params.query, 
        params.location, 
        params.radius, 
        userLocation?.lat, 
        userLocation?.lng
      );
      
      setActiveLeads(result.leads);
      
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: result.text,
        timestamp: Date.now(),
        relatedLeads: result.leads,
        groundingSources: result.groundingSources
      };
      
      updateSessionMessages(activeSessionId, responseMsg);
      
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: "System intelligence encountered an anomaly during lead verification. Please retry your query.",
        isError: true,
        timestamp: Date.now()
      };
      updateSessionMessages(activeSessionId, errorMsg);
    } finally {
      setIsGeneratingLeads(false);
    }
  };

  const handleChatMessage = async (text: string, image?: string) => {
    setIsSendingMessage(true);
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text,
      image,
      timestamp: Date.now()
    };
    
    updateSessionMessages(activeSessionId, userMsg);

    try {
      const result = await sendChatMessage(
        activeSession.messages,
        text,
        activeLeads,
        image
      );
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: result.text,
        groundingSources: result.groundingSources,
        timestamp: Date.now()
      };
      
      updateSessionMessages(activeSessionId, modelMsg);
      
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: "Communication bridge failure. Ensure your connection and API authorization are active.",
        isError: true,
        timestamp: Date.now()
      };
      updateSessionMessages(activeSessionId, errorMsg);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const updateSessionMessages = (sessionId: string, message: Message) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, messages: [...s.messages, message] };
      }
      return s;
    }));
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar - Deep Glassmorphism Style */}
      <aside className="w-72 bg-slate-950 flex flex-col shrink-0 border-r border-slate-800 shadow-2xl z-20">
        <div className="px-8 py-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transform rotate-3">
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">VANTAGE</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Lead Intelligence</p>
            </div>
          </div>
        </div>
        
        <div className="px-6 mb-8">
          <button 
            onClick={handleNewSession}
            className="w-full bg-white/5 hover:bg-white/10 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all text-sm font-semibold border border-white/10 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Intelligence Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
          <div className="flex items-center justify-between px-3 mb-4">
             <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Deployment History</h3>
          </div>
          <div className="space-y-2">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all group relative
                  ${activeSessionId === session.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'hover:bg-white/5 text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${activeSessionId === session.id ? 'bg-white' : 'bg-slate-700'}`}></div>
                  <span className="truncate font-medium">
                    {session.messages.length > 0 
                      ? session.messages[0].text.substring(0, 30)
                      : session.name}
                  </span>
                </div>
                {activeSessionId === session.id && (
                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                   </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex items-center gap-3">
           <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Powered By</p>
             <p className="text-xs text-slate-300 font-semibold truncate">Gemini 2.5 Ultra-Pro</p>
           </div>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Subtle Background Decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/30 blur-[120px] -z-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-50/50 blur-[100px] -z-10 rounded-full"></div>
        
        <div className="flex-1 p-8 overflow-hidden flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Intelligence Hub (Chat) */}
          <div className="w-full lg:w-[460px] shrink-0 flex flex-col h-full order-2 lg:order-1">
            <ChatInterface 
              messages={activeSession.messages} 
              onSendMessage={handleChatMessage}
              isProcessing={isSendingMessage}
            />
          </div>

          {/* Right Column: Execution Engine */}
          <div className="flex flex-col flex-1 gap-8 min-w-0 order-1 lg:order-2 overflow-hidden">
            {/* Lead Finder Section */}
            <div className="shrink-0">
               <LeadFinder 
                onSearch={handleLeadSearch} 
                isLoading={isGeneratingLeads} 
               />
            </div>
            
            {/* Table / Results Section */}
            <div className="flex-1 min-h-0 flex flex-col">
              {activeLeads.length > 0 ? (
                <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <LeadsTable leads={activeLeads} />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-12 text-center">
                  <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner transform -rotate-6">
                     <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Engine Awaiting Input</h3>
                  <p className="max-w-sm text-slate-500 leading-relaxed text-lg">Define your parameters above to initiate high-fidelity market prospecting.</p>
                  
                  <div className="mt-8 flex gap-3 opacity-50">
                    <span className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600 uppercase tracking-widest">Maps Grounding</span>
                    <span className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600 uppercase tracking-widest">Live Search</span>
                    <span className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600 uppercase tracking-widest">Business Verify</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;