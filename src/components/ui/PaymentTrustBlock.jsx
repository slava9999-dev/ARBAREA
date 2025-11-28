import { ShieldCheck } from 'lucide-react';

export const PaymentTrustBlock = ({ variant = 'full' }) => {
  return (
    <section
      className={`
      ${variant === 'compact' ? 'py-3' : 'py-5'}
      w-full rounded-xl
      bg-gradient-to-br from-stone-800 to-stone-900
      text-stone-300 p-4 backdrop-blur-xl
      border border-white/5
    `}
    >
      {/* Header (full) */}
      {variant === 'full' && (
        <h3 className="font-serif text-amber-600 text-lg mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Безопасная онлайн-оплата
        </h3>
      )}

      {/* Logos */}
      <div className="flex items-center justify-between gap-4 group">
        {/* SBP */}
        <div className="flex flex-col items-center gap-1">
          <svg
            className="h-8 w-auto text-stone-500 transition-colors duration-300 group-hover:text-amber-500"
            viewBox="0 0 100 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>SBP Logo</title>
            <path
              d="M15.5 5L5 25L25 25L10 55L50 15L30 15L45 5H15.5Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-[10px] font-mono text-stone-500 transition-colors duration-300 group-hover:text-stone-400">
            СБП
          </span>
        </div>

        {/* T-Pay */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-8 flex items-center">
            <span className="font-serif text-xl font-bold text-stone-500 transition-colors duration-300 group-hover:text-amber-500">
              T-Pay
            </span>
          </div>
          <span className="text-[10px] font-mono text-stone-500 transition-colors duration-300 group-hover:text-stone-400">
            Т-Банк
          </span>
        </div>

        {/* Cards */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1 h-8 items-center">
            <div className="w-6 h-4 rounded bg-stone-700/50 border border-stone-600 transition-colors duration-300 group-hover:border-amber-500/50 group-hover:bg-amber-900/20"></div>
            <div className="w-6 h-4 rounded bg-stone-700/50 border border-stone-600 -ml-3 mt-2 transition-colors duration-300 group-hover:border-amber-500/50 group-hover:bg-amber-900/20"></div>
          </div>
          <span className="text-[10px] font-mono text-stone-500 transition-colors duration-300 group-hover:text-stone-400">
            Карты
          </span>
        </div>
      </div>

      {/* Footer text (full) */}
      {variant === 'full' && (
        <p className="mt-4 text-xs text-stone-500 text-center leading-relaxed">
          Оплата проходит через защищённый шлюз Тинькофф Кассы.
        </p>
      )}
    </section>
  );
};
