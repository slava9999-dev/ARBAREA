import { NavLink } from 'react-router-dom';
import {
  Home,
  Image as ImageIcon,
  MessageCircle,
  ShoppingBag,
  User,
} from 'lucide-react';

const BottomNav = ({ cartCount }) => (
  <div className="fixed bottom-4 left-4 right-4 glass-panel px-6 py-4 flex justify-between items-center z-50">
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
          `relative flex flex-col items-center space-y-1 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-stone-400 hover:text-stone-200'}`
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
