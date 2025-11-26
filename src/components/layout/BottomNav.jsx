
import {
  Home,
  Image as ImageIcon,
  MessageCircle,
  ShoppingBag,
  User,
} from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, cartCount }) => (
  <div className="fixed bottom-4 left-4 right-4 glass-panel px-6 py-4 flex justify-between items-center z-50">
    {[
      { id: 'home', icon: Home, label: 'Витрина' },
      { id: 'gallery', icon: ImageIcon, label: 'Галерея' },
      { id: 'ai', icon: MessageCircle, label: 'AI' },
      { id: 'cart', icon: ShoppingBag, label: 'Корзина' },
      { id: 'profile', icon: User, label: 'Кабинет' },
    ].map((tab) => (
      <button
        type="button"
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`relative flex flex-col items-center space-y-1 transition-colors duration-300 ${activeTab === tab.id ? 'text-primary' : 'text-stone-400 hover:text-stone-200'}`}
      >
        <div className="relative">
          <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
          {tab.id === 'cart' && cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce-short shadow-glow">
              {cartCount}
            </span>
          )}
        </div>
        {/* Label is hidden on mobile for cleaner look, or can be kept small */}
        <span className="text-[9px] font-medium uppercase tracking-wider hidden sm:block">{tab.label}</span>
      </button>
    ))}
  </div>
);

export default BottomNav;
