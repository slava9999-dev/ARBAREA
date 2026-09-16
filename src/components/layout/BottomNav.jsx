import {
  Home,
  Image as ImageIcon,
  MessageCircle,
  ShoppingBag,
  User,
} from 'lucide-react';
import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { haptic } from '../../lib/haptics';

const BottomNav = memo(({ cartCount }) => {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-[100] will-change-transform">
      {/* Glass background with wood accent */}
      <div className="nav-glass relative flex items-center h-[72px] rounded-2xl overflow-hidden">
        {/* Subtle top glow line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(201, 164, 92, 0.3), transparent)',
          }}
        />

        {/* Navigation Items */}
        {[
          { path: '/', icon: Home, label: 'Витрина' },
          { path: '/gallery', icon: ImageIcon, label: 'Галерея' },
          { path: '/ai', icon: MessageCircle, label: 'AI' },
          {
            path: '/cart',
            icon: ShoppingBag,
            label: 'Корзина',
            badge: cartCount,
          },
          { path: '/profile', icon: User, label: 'Кабинет' },
        ].map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            onPointerDown={() => haptic(8)}
            className={({ isActive }) =>
              `flex-1 relative flex flex-col items-center justify-center h-full group
               transition-[color,transform] duration-200 ease-out
               active:scale-[0.94] active:duration-75 ${
                 isActive
                   ? 'text-wood-amber'
                   : 'text-stone-500 hover:text-stone-300'
               }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator glow */}
                {isActive && (
                  <div
                    className="absolute inset-x-2 -bottom-1 h-8 rounded-full opacity-30 blur-lg"
                    style={{ background: 'rgba(201, 164, 92, 0.5)' }}
                  />
                )}

                {/* Icon container */}
                <div className="relative z-10">
                  <tab.icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={`transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  />

                  {/* Badge */}
                  {tab.badge > 0 && (
                    <span
                      className="absolute -top-2 -right-3 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold rounded-full"
                      style={{
                        background:
                          'linear-gradient(135deg, #a8834a 0%, #c9a45c 100%)',
                        color: '#1a1614',
                        boxShadow: '0 0 12px rgba(201, 164, 92, 0.5)',
                      }}
                    >
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[9px] font-semibold uppercase tracking-widest mt-1 transition-all duration-200 ${
                    isActive
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-70'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Active dot indicator */}
                {isActive && (
                  <div
                    className="absolute bottom-2 w-1 h-1 rounded-full"
                    style={{ background: '#c9a45c' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
