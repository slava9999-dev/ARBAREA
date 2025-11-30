import {
  Home,
  Image as ImageIcon,
  MessageCircle,
  ShoppingBag,
  User,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const BottomNav = ({ cartCount }) => (
  <div className="fixed bottom-4 left-4 right-4 glass-panel flex items-center z-[100] overflow-hidden h-20">
    {[
      { path: '/', icon: Home, label: 'Витрина' },
      { path: '/gallery', icon: ImageIcon, label: 'Галерея' },
      { path: '/ai', icon: MessageCircle, label: 'AI' },
      { path: '/cart', icon: ShoppingBag, label: 'Корзина' },
      { path: '/profile', icon: User, label: 'Кабинет' },
    ].map((tab) => (
      <NavLink
        key={tab.path}
        to={tab.path}
        className={({ isActive }) =>
          `flex-1 relative flex flex-col items-center justify-center h-full transition-colors duration-300 active:scale-95 ${isActive ? 'text-amber-500' : 'text-stone-400 hover:text-stone-200'}`
        }
      >
        {({ isActive }) => (
          <>
            <div className="relative">
              <tab.icon size={24} strokeWidth={isActive ? 2 : 1.5} />
              {tab.path === '/cart' && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce-short shadow-glow">
                  {cartCount}
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

export default BottomNav;
