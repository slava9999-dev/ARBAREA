
import {
  Home,
  Image as ImageIcon,
  MessageCircle,
  ShoppingBag,
  User,
} from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, cartCount }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-3 pb-6 flex justify-between items-center z-50 shadow-lg">
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
        className={`relative flex flex-col items-center space-y-1 flex-1 ${activeTab === tab.id ? 'text-stone-800' : 'text-stone-400'}`}
      >
        <div className="relative">
          <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
          {tab.id === 'cart' && cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-stone-800 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce-short">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium uppercase">{tab.label}</span>
      </button>
    ))}
  </div>
);

export default BottomNav;
