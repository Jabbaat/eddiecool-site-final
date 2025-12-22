import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import Button from './Button';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface VibeAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const VibeAssistant: React.FC<VibeAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Yo! I'm the Hidden Layer Protocol. Ready to vibe check your code? Ask me anything about AI." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !process.env.API_KEY) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Filter out the first static greeting message because Gemini API expects 
      // conversation history to start with a 'user' turn, not a 'model' turn.
      const history = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            ...history,
            { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
          systemInstruction: "You are a Neobrutalist AI Tutor called 'Hidden Layer'. You speak in a confident, slightly edgy, 'vibe coding' style. You love bold design, fast code, and high efficiency. Keep answers concise, punchy, and use tech slang (e.g., 'shipped', 'LGTM', 'based'). If asked about code, provide clean, modern examples. You are strictly an AI coding assistant.",
        },
      });

      const text = response.text || "Error: No vibe detected.";
      
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "System overload. Check your API key or try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.9, opacity: 0, rotate: 5 }}
            className="w-full max-w-lg bg-white border-4 border-black shadow-neo-lg flex flex-col h-[600px] overflow-hidden relative"
          >
            {/* Header */}
            <div className="bg-gblue border-b-4 border-black p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white border-2 border-black p-1">
                    <Bot className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Vibe Assistant</h3>
              </div>
              <button 
                onClick={onClose}
                className="bg-gred text-white p-1 border-2 border-black hover:bg-white hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-offwhite">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[80%] p-4 border-2 border-black shadow-neo-sm font-bold
                    ${msg.role === 'user' 
                      ? 'bg-gyellow text-black rounded-tl-xl rounded-bl-xl rounded-tr-xl' 
                      : 'bg-white text-black rounded-tr-xl rounded-br-xl rounded-tl-xl'}
                  `}>
                    <div className="flex items-center gap-2 mb-1 opacity-50 text-xs uppercase tracking-wider">
                        {msg.role === 'user' ? <User size={12}/> : <Sparkles size={12}/>}
                        {msg.role === 'user' ? 'You' : 'Hidden Layer'}
                    </div>
                    <div className="whitespace-pre-wrap font-mono text-sm">{msg.text}</div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                 <div className="flex justify-start">
                    <div className="bg-white border-2 border-black p-3 shadow-neo-sm">
                        <span className="font-mono animate-pulse">Thinking...</span>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t-4 border-black">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about the hidden layer..."
                  className="flex-1 bg-gray-100 border-2 border-black p-3 font-bold focus:outline-none focus:bg-white focus:ring-0 placeholder-gray-500"
                />
                <Button onClick={handleSend} color="ggreen" size="sm" className="px-4">
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VibeAssistant;