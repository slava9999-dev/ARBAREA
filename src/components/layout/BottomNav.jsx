import {
  Home,
  Image as ImageIcon,
  MessageCircle,
  ShoppingBag,
  User,
} from 'lucide-react';
import { memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const BottomNav = memo(({ cartCount }) => {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-stone-900/90 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl flex items-center z-[100] overflow-hidden h-20 will-change-transform">
      {[
        { path: '/', icon: Home, label: 'Витрина' },
        { path: '/gallery', icon: ImageIcon, label: 'Галерея' },
        { path: '/ai', icon: MessageCircle, label: 'AI' },
        { path: '/cart', icon: ShoppingBag, label: 'Корзина', badge: cartCount },
        { path: '/profile', icon: User, label: 'Кабинет' },
      ].map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `flex-1 relative flex flex-col items-center justify-center h-full transition-colors duration-150 ${isActive ? 'text-amber-500' : 'text-stone-400 hover:text-stone-200'}`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <tab.icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                {tab.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-neon-amber">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium uppercase tracking-wider hidden sm:block">
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
