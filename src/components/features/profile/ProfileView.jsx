/**
 * ProfileView - Полный личный кабинет пользователя
 *
 * Функции:
 * - Просмотр профиля и аватара
 * - Редактирование имени и телефона
 * - История заказов
 * - Индивидуальный заказ
 * - Поддержка мастера (донаты)
 * - Закрытый клуб VK
 * - О компании
 */

import {
  Coffee,
  FileText,
  LogOut,
  Star,
  User as UserIcon,
  Edit3,
  Check,
  X,
  MessageCircle,
  Heart,
  Package,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useWishlist } from '../../../context/WishlistContext';
import SocialFooter from '../../layout/SocialFooter';
import DonateModal from './DonateModal';
import IndividualOrderForm from './IndividualOrderForm';
import OrderHistory from './OrderHistory';

const ProfileView = () => {
  const { logout, user, updateProfile } = useAuth();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Helper to safely get user display name and avatar
  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    user?.phone ||
    'Гость';
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userPhone = user?.phone || user?.user_metadata?.phone || '';
  const userEmail = user?.email || '';

  const startEditing = () => {
    setEditName(
      user?.user_metadata?.name || user?.user_metadata?.full_name || '',
    );
    setEditPhone(userPhone.replace('+7', ''));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName('');
    setEditPhone('');
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: editName,
        phone: editPhone ? `+7${editPhone.replace(/\D/g, '')}` : undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  };

  const openTelegram = () => {
    window.open('https://t.me/arbarea', '_blank');
  };

  return (
    <div className="pb-32 pt-20 px-4 animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-center flex-1">
          <div className="w-16 h-16 bg-stone-800 rounded-full overflow-hidden border-2 border-stone-700 shadow-lg flex items-center justify-center shrink-0">
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
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none"
              />
            ) : (
              <h2 className="text-xl font-bold font-serif text-white truncate">
                {displayName}
              </h2>
            )}
            {userEmail && !isEditing && (
              <p className="text-xs text-stone-400 truncate">{userEmail}</p>
            )}
            {isEditing && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-stone-400 text-sm">+7</span>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) =>
                    setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  placeholder="9991234567"
                  className="flex-1 bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none"
                />
              </div>
            )}
            {!isEditing && (
              <span className="inline-block mt-1 px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-500/20">
                ✨ Скидка 10%
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={saveProfile}
                disabled={isSaving}
                className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg text-white hover:bg-emerald-500 transition-colors"
              >
                <Check size={18} />
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="w-10 h-10 bg-stone-700 rounded-full flex items-center justify-center shadow-lg text-stone-400 hover:bg-stone-600 transition-colors"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={startEditing}
                aria-label="Редактировать профиль"
                className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center shadow-lg border border-stone-700 text-stone-400 hover:text-amber-500 transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <button
                type="button"
                onClick={logout}
                aria-label="Выйти из аккаунта"
                className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center shadow-lg border border-stone-700 text-stone-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-stone-800/50 rounded-2xl p-3 text-center border border-white/5">
          <Package className="mx-auto text-amber-500 mb-1" size={20} />
          <p className="text-lg font-bold text-white">0</p>
          <p className="text-[10px] text-stone-400">Заказов</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/wishlist')}
          className="bg-stone-800/50 rounded-2xl p-3 text-center border border-white/5 hover:border-pink-500/30 transition-colors"
        >
          <Heart className="mx-auto text-pink-500 mb-1" size={20} />
          <p className="text-lg font-bold text-white">
            {wishlistItems?.length || 0}
          </p>
          <p className="text-[10px] text-stone-400">В избранном</p>
        </button>
        <button
          type="button"
          onClick={openTelegram}
          className="bg-stone-800/50 rounded-2xl p-3 text-center border border-white/5 hover:border-blue-500/30 transition-colors"
        >
          <MessageCircle className="mx-auto text-blue-400 mb-1" size={20} />
          <p className="text-lg font-bold text-white">TG</p>
          <p className="text-[10px] text-stone-400">Чат</p>
        </button>
      </div>

      {/* Gamification Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {/* Карточка Клуба VK */}
        <a
          href="https://vk.com/arbarea_nn?w=donut_payment-229247954&levelId=2246"
          target="_blank"
          rel="noopener noreferrer"
          className="relative overflow-hidden bg-gradient-to-br from-[#0077FF] to-[#0055CC] text-white p-4 rounded-2xl shadow-lg border border-white/10 text-left group active:scale-95 transition-transform block"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-4 -mt-4" />
          <Star
            className="text-yellow-300 mb-3 group-hover:scale-110 transition-transform"
            size={24}
            fill="currentColor"
          />
          <div className="font-bold text-sm leading-tight font-serif">
            VK Donut
          </div>
          <div className="text-[10px] text-white/70 mt-1">Закрытый клуб</div>
        </a>

        {/* Карточка Доната */}
        <button
          type="button"
          onClick={() => setShowDonateModal(true)}
          className="bg-gradient-to-br from-amber-600 to-orange-600 p-4 rounded-2xl shadow-lg border border-white/10 text-left flex flex-col justify-between group hover:from-amber-500 hover:to-orange-500 active:scale-95 transition-all text-white"
        >
          <Coffee
            className="group-hover:scale-110 transition-transform"
            size={24}
          />
          <div>
            <div className="font-bold text-sm leading-tight font-serif">
              Поддержать
            </div>
            <div className="text-[10px] text-white/70 mt-1">
              Угостить мастера ☕
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
              Реквизиты и оферта
            </div>
          </div>
        </button>

        {/* Настройки */}
        <button
          type="button"
          onClick={startEditing}
          className="bg-white/5 p-4 rounded-2xl shadow-lg border border-white/10 text-left flex flex-col justify-between group hover:border-stone-500/50 active:scale-95 transition-all"
        >
          <Settings
            className="text-stone-400 group-hover:text-white group-hover:scale-110 transition-all"
            size={24}
          />
          <div>
            <div className="font-bold text-white text-sm leading-tight font-serif">
              Настройки
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              Редактировать профиль
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
