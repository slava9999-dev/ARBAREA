import { ShieldCheck } from 'lucide-react';

export const PaymentTrustBlock = ({ variant = 'full' }) => {
  return (
    <section
      className={`
      ${variant === 'compact' ? 'py-4' : 'py-6'}
      w-full rounded-xl
      bg-stone-900/80
      text-stone-200 p-5 backdrop-blur-sm
      border border-white/10
    `}
    >
      {/* Header (full) */}
      {variant === 'full' && (
        <h3 className="font-serif text-amber-500 text-lg mb-6 flex items-center gap-2 font-bold">
          <ShieldCheck className="w-5 h-5" />
          Безопасная онлайн-оплата
        </h3>
      )}

      {/* Logos */}
      <div className="flex items-center justify-around gap-6">
        {/* SBP */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-16 bg-white rounded-lg flex items-center justify-center p-1">
             {/* SBP Logo (Simplified) */}
             <svg viewBox="0 0 100 60" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="sbpTitle">
                <title id="sbpTitle">Логотип СБП</title>
                <path d="M15 10 L5 30 L25 30 L10 50 L50 10 L30 10 L45 0 Z" fill="#0D2C54"/>
                <path d="M55 10 L95 10 L80 30 L90 50 L50 50 L65 30 L55 10 Z" fill="#0D2C54" opacity="0.2"/>
             </svg>
          </div>
          <span className="text-[11px] font-medium text-stone-400 tracking-wide">
            СБП
          </span>
        </div>

        {/* T-Pay */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-16 bg-[#FFDD2D] rounded-lg flex items-center justify-center">
            <span className="font-sans font-extrabold text-black text-lg tracking-tighter">
              T-Pay
            </span>
          </div>
          <span className="text-[11px] font-medium text-stone-400 tracking-wide">
            Т-Банк
          </span>
        </div>

        {/* Cards */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-16 bg-stone-800 rounded-lg border border-stone-700 flex items-center justify-center relative overflow-hidden">
            <div className="absolute left-2 w-6 h-6 rounded-full bg-red-500/80 mix-blend-screen"></div>
            <div className="absolute right-2 w-6 h-6 rounded-full bg-orange-500/80 mix-blend-screen"></div>
          </div>
          <span className="text-[11px] font-medium text-stone-400 tracking-wide">
            Карты РФ
          </span>
        </div>
      </div>

      {/* Footer text (full) */}
      {variant === 'full' && (
        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-xs text-stone-400 text-center leading-relaxed">
            Платежи обрабатываются через защищённый шлюз <span className="text-stone-300 font-medium">Т-Касса</span>.
            <br/>Мы не храним данные ваших карт.
          </p>
        </div>
      )}
    </section>
  );
};
