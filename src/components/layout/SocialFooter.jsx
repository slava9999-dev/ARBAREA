import { Send, Instagram, Youtube } from 'lucide-react';
import { VKIcon, PinterestIcon } from '../ui/CustomIcons';
import { PaymentTrustBlock } from '../ui/PaymentTrustBlock';

const socialLinks = [
  {
    name: 'VK',
    url: 'https://vk.com/arbarea_nn',
    icon: VKIcon,
    color: '#0077FF',
    ariaLabel: 'Мы ВКонтакте',
  },
  {
    name: 'Telegram',
    url: 'https://t.me/Arbarea_life',
    icon: Send,
    color: '#229ED9',
    ariaLabel: 'Мы в Telegram',
    iconClass: '-ml-0.5 mt-0.5',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/p/DRB3DPoCF9S/?igsh=MWNzcWNlbnVjbjRiMw==',
    icon: Instagram,
    color: '#E1306C',
    ariaLabel: 'Мы в Instagram',
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@arbarea?si=ualSgBnV9ZtH9Cjv',
    icon: Youtube,
    color: '#FF0000',
    ariaLabel: 'Наш YouTube канал',
  },
  {
    name: 'Pinterest',
    url: 'https://pin.it/4Ltks459c',
    icon: PinterestIcon,
    color: '#BD081C',
    ariaLabel: 'Мы в Pinterest',
  },
];

const SocialFooter = () => (
  <div className="mt-12 mb-6 px-6 animate-fade-in relative z-10">
    {/* Разделитель */}
    <div className="flex items-center gap-4 mb-6">
      <div className="h-px bg-stone-200 dark:bg-stone-700 flex-1"></div>
      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest">
        Мы в соцсетях
      </span>
      <div className="h-px bg-stone-200 dark:bg-stone-700 flex-1"></div>
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
            className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
            style={{
              '--hover-color': social.color,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = social.color;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.color = '';
            }}
          >
            <Icon size={20} className={social.iconClass || ''} />
          </a>
        );
      })}
    </div>

    {/* Копирайт */}
    <div className="text-center space-y-1 mb-8">
      <p className="text-xs text-stone-600 dark:text-stone-400 font-bold tracking-wider">
        ARBAREA
      </p>
      <p className="text-[10px] text-stone-400 dark:text-stone-500">
        Столярная мастерская
      </p>
      <p className="text-[10px] text-stone-300 dark:text-stone-600">
        © 2025 Все права защищены
      </p>
    </div>

    {/* Блок доверия к оплате */}
    <PaymentTrustBlock variant="full" />
  </div>
);

export default SocialFooter;
