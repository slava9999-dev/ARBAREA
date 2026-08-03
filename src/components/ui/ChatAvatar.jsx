import { Sprout } from 'lucide-react';

/**
 * Themed chat avatars for the ARBAREA assistant ("Арбо") and the user.
 * The assistant wears a wood-grain gradient with a sprout — the workshop's
 * living-wood identity; the user gets a warm amber ring with their initial.
 */

const SIZES = {
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
};

const ICON_SIZE = { sm: 18, md: 22, lg: 30 };

export const AssistantAvatar = ({ size = 'sm', animated = false }) => (
  <div
    className={`${SIZES[size]} relative shrink-0 rounded-full flex items-center justify-center overflow-hidden border border-wood-amber/40 shadow-[0_0_18px_rgba(201,164,92,0.35)]`}
    style={{
      background:
        'radial-gradient(120% 120% at 30% 20%, #c9a45c 0%, #8a6a3a 45%, #4a3826 100%)',
    }}
  >
    {/* wood-grain streaks */}
    <span className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay bg-[repeating-linear-gradient(115deg,transparent_0_3px,rgba(0,0,0,0.5)_3px_4px)]" />
    <Sprout
      size={ICON_SIZE[size]}
      className={`relative text-[#fff7e8] drop-shadow ${animated ? 'animate-pulse' : ''}`}
      strokeWidth={2.2}
    />
  </div>
);

export const UserAvatar = ({ name = '', size = 'sm' }) => {
  const initial = (name || '').trim().charAt(0).toUpperCase() || 'Я';
  return (
    <div
      className={`${SIZES[size]} shrink-0 rounded-full flex items-center justify-center overflow-hidden border border-white/15 shadow-lg font-serif font-bold text-[#1a1614]`}
      style={{
        background:
          'radial-gradient(120% 120% at 30% 20%, #f4d8a0 0%, #dbb978 45%, #a8834a 100%)',
        fontSize: size === 'lg' ? '1.5rem' : '0.95rem',
      }}
    >
      {initial}
    </div>
  );
};
