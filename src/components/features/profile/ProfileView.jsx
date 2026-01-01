import { Coffee, FileText, LogOut, Star, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SocialFooter from '../../layout/SocialFooter';
import DonateModal from './DonateModal';
import IndividualOrderForm from './IndividualOrderForm';
import OrderHistory from './OrderHistory';

const ProfileView = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showDonateModal, setShowDonateModal] = useState(false);

  // Helper to safely get user display name and avatar
  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || user?.phone || 'Гость';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="pb-32 pt-20 px-4 animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-stone-800 rounded-full overflow-hidden border-2 border-stone-700 shadow-lg flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="text-stone-500" size={32} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-white">
              {displayName}
            </h2>
            <span className="inline-block mt-1 px-3 py-1 bg-stone-800 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-stone-700">
              Ценитель дерева
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          aria-label="Выйти из аккаунта"
          className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center shadow-lg border border-stone-700 text-stone-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Gamification Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {/* Карточка Клуба */}
        <a
          href="https://vk.com/arbarea_nn?w=donut_payment-229247954&levelId=2246"
          target="_blank"
          rel="noopener noreferrer"
          className="relative overflow-hidden bg-gradient-to-br from-stone-800 to-stone-900 text-white p-4 rounded-2xl shadow-lg border border-white/5 text-left group active:scale-95 transition-transform block"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-4 -mt-4"></div>
          <Star
            className="text-amber-500 mb-3 group-hover:scale-110 transition-transform"
            size={24}
            fill="currentColor"
          />
          <div className="font-bold text-sm leading-tight font-serif">
            Закрытый Клуб
          </div>
          <div className="text-[10px] text-stone-400 mt-1">Вступить</div>
        </a>

        {/* Карточка Доната */}
        <button
          type="button"
          onClick={() => setShowDonateModal(true)}
          className="bg-white/5 p-4 rounded-2xl shadow-lg border border-white/10 text-left flex flex-col justify-between group hover:border-amber-500/50 active:scale-95 transition-all"
        >
          <Coffee
            className="text-stone-400 group-hover:text-amber-500 transition-colors"
            size={24}
          />
          <div>
            <div className="font-bold text-white text-sm leading-tight font-serif">
              Поддержать
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              Угостить мастера
            </div>
          </div>
        </button>

        {/* Карточка О компании */}
        <button
          type="button"
          onClick={() => navigate('/legal')}
          className="bg-white/5 p-4 rounded-2xl shadow-lg border border-white/10 text-left flex flex-col justify-between group hover:border-emerald-500/50 active:scale-95 transition-all"
        >
          <FileText
            className="text-emerald-500 group-hover:scale-110 transition-transform"
            size={24}
          />
          <div>
            <div className="font-bold text-white text-sm leading-tight font-serif">
              О компании
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              Реквизиты и доставка
            </div>
          </div>
        </button>
      </div>

      <OrderHistory />
      <IndividualOrderForm />

      <div className="mt-8">
        <SocialFooter />
      </div>

      {showDonateModal && (
        <DonateModal onClose={() => setShowDonateModal(false)} />
      )}
    </div>
  );
};

export default ProfileView;
