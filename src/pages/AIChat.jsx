import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot } from 'lucide-react';
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
    <div className="pt-20 pb-24 px-4 h-screen flex flex-col bg-stone-50">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: messages list is append-only
            key={i}
            className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.sender === 'user' ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600'}`}
            >
              {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm ${m.sender === 'user' ? 'bg-stone-800 text-white rounded-tr-none' : 'bg-white border border-stone-100 text-stone-700 rounded-tl-none'}`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-stone-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-stone-400 text-sm">
              <Loader2 size={16} className="animate-spin" /> Печатает...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-stone-50/90 backdrop-blur z-10 max-w-md mx-auto">
        <div className="flex bg-white p-2 rounded-2xl border border-stone-200 shadow-lg">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 outline-none text-stone-800 placeholder:text-stone-400 bg-transparent"
            placeholder="Спросите про мебель..."
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-stone-800 text-white rounded-xl hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
