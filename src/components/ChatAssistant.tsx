import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, X, Loader2, Minimize2, Maximize2, Mic, MicOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../store';
import { AirQualityData } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatAssistant: React.FC<{ data: AirQualityData | null }> = ({ data }) => {
  const { profiles, activeProfile, currentLocation } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Dobrý den! Jsem váš AI asistent pro celou rodinu. Rády poradím ohledně pylové situace a alergií pro vás i vaše děti. S čím vám mohu pomoci?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Váš prohlížeč nepodporuje hlasové rozpoznávání. Použijte prosím Google Chrome, Microsoft Edge nebo Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'cs-CZ';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const context = {
        location: currentLocation,
        activeProfileMode: activeProfile ? activeProfile.name : 'Rodinný přehled (všichni)',
        familyProfiles: profiles.map(p => ({
          name: p.name,
          trackedPollen: p.trackedAllergens,
          personalAllergens: p.customAllergens.map(ca => `${ca.name} (${ca.category})`)
        })),
        currentAirQualityData: data?.current
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
          context
        })
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || 'Server vrátil chybu při komunikaci s AI.');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: resData.reply }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Omlouvám se: ${error.message || 'Nepodařilo se spojit se serverem.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-24 md:bottom-6 right-4 md:right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all z-50 group flex items-center justify-center"
        aria-label="Otevřít asistenta"
      >
        <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed right-4 md:right-6 bottom-24 md:bottom-6 z-50 bg-white rounded-3xl shadow-2xl shadow-indigo-900/10 border border-indigo-100 flex flex-col transition-all duration-300 overflow-hidden",
      isMinimized ? "w-72 h-14" : "w-[calc(100vw-2rem)] md:w-96 h-[500px]"
    )}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white cursor-pointer select-none"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-xl">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-none">AI Rodinný Asistent</span>
            <span className="text-[10px] text-indigo-100">
              {activeProfile ? `Profil: ${activeProfile.name}` : 'Rodinný přehled'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} 
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex items-end gap-2", msg.role === 'user' ? "flex-row-reverse" : "")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                  msg.role === 'user' ? "bg-indigo-100 text-indigo-600" : "bg-white border border-slate-200 text-slate-500"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn(
                  "max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? "bg-indigo-600 text-white rounded-br-sm" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-bl-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-white border border-slate-200 text-slate-500">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[75%] px-4 py-3 rounded-2xl bg-white border border-slate-100 rounded-bl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span className="text-xs text-slate-400">Přemýšlím...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Listening Indicator */}
          {isListening && (
            <div className="px-4 py-1.5 bg-red-50 border-t border-red-100 flex items-center justify-between text-xs text-red-600 animate-pulse">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Poslouchám... mluvte česky
              </span>
              <button 
                onClick={toggleVoiceInput}
                className="text-[11px] font-bold text-red-700 underline hover:no-underline"
              >
                Zastavit
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Mluvte nyní..." : "Zeptejte se na děti, výlet, pyly..."}
                className={cn(
                  "w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-20 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                  isListening && "border-red-300 bg-red-50/20"
                )}
                disabled={isLoading}
              />
              
              <div className="absolute right-1.5 flex items-center gap-1">
                {/* Voice Input Button */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    title={isListening ? "Zastavit diktování" : "Hlasové zadávání"}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      isListening
                        ? "bg-red-500 text-white animate-bounce shadow-md shadow-red-200"
                        : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    )}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}

                {/* Send Button */}
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  title="Odeslat zprávu"
                  className="p-1.5 text-indigo-500 hover:text-indigo-600 disabled:text-slate-300 disabled:hover:text-slate-300 transition-colors bg-white rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
