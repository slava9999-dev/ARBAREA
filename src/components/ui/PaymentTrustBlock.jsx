import { ShieldCheck } from 'lucide-react';

export const PaymentTrustBlock = ({ variant = 'full' }) => {
  return (
    <div
      className={`
      w-full rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm
      ${variant === 'compact' ? 'py-3' : 'py-5'}
    `}
    >
      {/* Заголовок (только для полного варианта) */}
      {variant === 'full' && (
        <div className="flex items-center gap-2 mb-4 text-stone-300">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium tracking-wide">
            Безопасная онлайн-оплата
          </span>
        </div>
      )}

      {/* Логотипы и Текст */}
      <div className="flex items-center justify-between gap-4 opacity-80 grayscale transition-all hover:grayscale-0 hover:opacity-100">
        {/* SBP Logo (System Fast Payments) */}
        <div className="flex flex-col items-center gap-1">
          <svg
            className="h-8 w-auto"
            viewBox="0 0 100 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>SBP Logo</title>
            <path
              d="M15.5 5L5 25L25 25L10 55L50 15L30 15L45 5H15.5Z"
              fill="#e7e5e4"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Схематичный логотип СБП для темной темы */}
          </svg>
          <span className="text-[10px] font-mono text-stone-400">СБП</span>
        </div>

        {/* T-Bank Logo */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-8 flex items-center">
            <span className="font-serif text-xl font-bold text-[#e7e5e4]">
              T-Pay
            </span>
          </div>
          <span className="text-[10px] font-mono text-stone-400">Тинькофф</span>
        </div>

        {/* Cards Logo */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1 h-8 items-center">
            <div className="w-6 h-4 rounded bg-stone-600/50 border border-stone-500"></div>
            <div className="w-6 h-4 rounded bg-stone-600/50 border border-stone-500 -ml-3 mt-2"></div>
          </div>
          <span className="text-[10px] font-mono text-stone-400">Карты</span>
        </div>
      </div>

      {/* Подпись (только для полного варианта) */}
      {variant === 'full' && (
        <p className="mt-4 text-xs text-stone-500 text-center leading-relaxed">
          Оплата проходит через защищенный шлюз Тинькофф Кассы. Чек отправляется
          на e-mail автоматически.
        </p>
      )}
    </div>
  );
};
