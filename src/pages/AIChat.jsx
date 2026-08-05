import { AnimatePresence, motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SEO from '../components/seo/SEO';
import { AssistantAvatar, UserAvatar } from '../components/ui/ChatAvatar';
import { useSimpleAuth } from '../context/SimpleAuthContext';
import { sendMessageToAI } from '../lib/ai-assistant';
import { haptic } from '../lib/haptics';

const GREETING =
  'Здравствуйте! Я Арбо — цифровой мастер студии ARBAREA 🌳 Помогу выбрать вещь из натурального дерева: под интерьер, в подарок или на заказ. С чего начнём?';

const QUICK_REPLIES = [
  'Панно для гостиной',
  'Идея в подарок',
  'Что-то для кухни',
  'Индивидуальный заказ',
];

const TypingDots = () => (
  <div className="flex items-center gap-1.5 py-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-wood-amber"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          delay: i * 0.18,
        }}
      />
    ))}
  </div>
);

const AIChat = () => {
  const { user } = useSimpleAuth();
  const [messages, setMessages] = useState([{ text: GREETING, sender: 'ai' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const send = async (text) => {
    const value = (text ?? input).trim();
    if (!value || isLoading) return;

    haptic(10);
    const nextMessages = [...messages, { text: value, sender: 'user' }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToAI(messages, value, null);
      setMessages((prev) => [...prev, { text: responseText, sender: 'ai' }]);
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Ой, связь с мастерской прервалась. Попробуйте, пожалуйста, ещё раз.',
          sender: 'ai',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const showQuickReplies = messages.length === 1 && !isLoading;

  return (
    <div className="pt-16 pb-24 px-4 h-screen flex flex-col bg-wood-bg">
      <SEO
        title="AI-консультант"
        description="Подберите изделие Arbarea из массива дерева с помощью умного консультанта."
        url="/ai"
        noindex
      />

      {/* Assistant header */}
      <div className="shrink-0 mt-2 mb-3 flex items-center gap-3 rounded-2xl bg-wood-bg-card/80 backdrop-blur-xl border border-wood-amber/15 px-4 py-3 shadow-wood-sm">
        <AssistantAvatar size="md" animated={isLoading} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-lg text-wood-amber leading-none">
              Арбо
            </h1>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              на связи
            </span>
          </div>
          <p className="text-xs text-wood-text-muted mt-0.5 truncate">
            Цифровой мастер ARBAREA
          </p>
        </div>
        <Sparkles size={18} className="ml-auto text-wood-amber/60 shrink-0" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-40 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className={`flex gap-2.5 items-end ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {m.sender === 'user' ? (
                <UserAvatar name={user?.name} size="sm" />
              ) : (
                <AssistantAvatar size="sm" />
              )}
              <div
                className={`p-4 rounded-2xl max-w-[78%] text-sm leading-relaxed whitespace-pre-wrap shadow-lg ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-br from-wood-amber to-[#a8834a] text-[#1a1614] font-medium rounded-br-md'
                    : 'bg-wood-bg-elevated/90 border border-wood-amber/15 text-wood-text-secondary rounded-bl-md backdrop-blur-sm'
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5 items-end"
          >
            <AssistantAvatar size="sm" animated />
            <div className="bg-wood-bg-elevated/90 border border-wood-amber/15 px-4 py-3 rounded-2xl rounded-bl-md backdrop-blur-sm">
              <TypingDots />
            </div>
          </motion.div>
        )}

        {/* Quick-reply chips */}
        {showQuickReplies && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap gap-2 pt-1 pl-11"
          >
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="px-3.5 py-2 rounded-full text-xs font-semibold text-wood-amber bg-wood-amber/10 border border-wood-amber/25 hover:bg-wood-amber/20 active:scale-95 transition-all"
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-24 left-0 right-0 p-4 bg-gradient-to-t from-wood-bg via-wood-bg to-transparent z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 bg-wood-bg-card/90 backdrop-blur-xl p-2 rounded-2xl border border-wood-amber/20 shadow-wood-glow">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              className="flex-1 px-3 outline-none text-white placeholder:text-wood-text-muted bg-transparent border-0 focus:ring-0"
              placeholder="Напишите Арбо…"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={isLoading || !input.trim()}
              aria-label="Отправить сообщение"
              className="btn-primary !px-0 w-11 h-11 rounded-xl shrink-0 disabled:opacity-40"
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
