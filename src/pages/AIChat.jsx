import { Bot, Loader2, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sendMessageToGemini } from '../lib/gemini';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      text: 'Добро пожаловать в Arbarea! Я помогу вам выбрать изделия из натурального дерева. Что вас интересует: панно, рейлинги или освещение?',
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to scroll on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(messages, input);
      setMessages((prev) => [...prev, { text: responseText, sender: 'ai' }]);
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        { text: 'Произошла ошибка. Попробуйте позже.', sender: 'ai' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 pb-24 px-4 h-screen flex flex-col bg-[#1c1917]">
      <div className="flex-1 overflow-y-auto space-y-4 pb-32 custom-scrollbar">
        {messages.map((m, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: messages list is append-only
            key={i}
            className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.sender === 'user' ? 'bg-amber-600 text-white' : 'bg-stone-800 border border-white/10 text-amber-500'}`}
            >
              {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${m.sender === 'user' ? 'bg-amber-600 text-white rounded-tr-none shadow-[0_0_15px_rgba(217,119,6,0.2)]' : 'bg-stone-800/80 border border-white/5 text-stone-200 rounded-tl-none backdrop-blur-sm'}`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-800 border border-white/10 flex items-center justify-center text-amber-500">
              <Bot size={16} />
            </div>
            <div className="bg-stone-800/80 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-stone-400 text-sm backdrop-blur-sm">
              <Loader2 size={16} className="animate-spin text-amber-500" /> Печатает...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-28 left-0 right-0 p-4 bg-gradient-to-t from-[#1c1917] via-[#1c1917] to-transparent z-10">
        <div className="max-w-md mx-auto">
          <div className="flex bg-stone-800/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 outline-none text-white placeholder:text-stone-500 bg-transparent"
              placeholder="Спросите про мебель..."
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-amber-600 text-white rounded-xl hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_15px_rgba(217,119,6,0.3)]"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
