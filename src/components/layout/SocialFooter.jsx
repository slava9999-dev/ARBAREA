import { Instagram, Send, Youtube } from 'lucide-react';
import { PinterestIcon, VKIcon } from '../ui/CustomIcons';
import { PaymentTrustBlock } from '../ui/PaymentTrustBlock';
import { reachGoal } from '../../lib/yandex-metrica';

const socialLinks = [
  {
    name: 'VK',
    url: 'https://vk.com/arbarea_nn',
    icon: VKIcon,
    ariaLabel: 'Мы ВКонтакте',
  },
  {
    name: 'Telegram',
    url: 'https://t.me/Arbarea_life',
    icon: Send,
    ariaLabel: 'Мы в Telegram',
    iconClass: '-ml-0.5 mt-0.5',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/p/DRB3DPoCF9S/?igsh=MWNzcWNlbnVjbjRiMw==',
    icon: Instagram,
    ariaLabel: 'Мы в Instagram',
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@arbarea?si=ualSgBnV9ZtH9Cjv',
    icon: Youtube,
    ariaLabel: 'Наш YouTube канал',
  },
  {
    name: 'Pinterest',
    url: 'https://pin.it/4Ltks459c',
    icon: PinterestIcon,
    ariaLabel: 'Мы в Pinterest',
  },
];

const SocialFooter = () => (
  <div className="mt-12 mb-6 px-6 animate-fade-in relative z-10">
    {/* Разделитель */}
    <div className="flex items-center gap-4 mb-6">
      <div className="h-px bg-stone-800 flex-1" />
      <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
        Мы в соцсетях
      </span>
      <div className="h-px bg-stone-800 flex-1" />
    </div>

    {/* Иконки соцсетей */}
    <div className="flex justify-center gap-4 mb-8">
      {socialLinks.map((social) => {
        const Icon = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.ariaLabel}
            onClick={() => {
              // 🎯 YANDEX METRICA: Track contact initiation
              reachGoal('CONTACT_INIT', { platform: social.name });
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full text-stone-500 hover:text-amber-500 transition-colors duration-300 hover:bg-stone-800/50"
          >
            <Icon size={20} className={social.iconClass || ''} />
          </a>
        );
      })}
    </div>

    {/* Копирайт */}
    <div className="text-center space-y-1 mb-8">
      <p className="text-xs text-stone-400 font-bold tracking-wider font-serif">
        ARBAREA
      </p>
      <p className="text-[10px] text-stone-500">
        Авторская столярная мастерская
      </p>
      <p className="text-[10px] text-stone-600">© 2025 Все права защищены</p>
    </div>

    {/* Блок доверия к оплате */}
    <PaymentTrustBlock variant="full" />
  </div>
);

export default SocialFooter;
