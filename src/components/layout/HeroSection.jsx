
import { ArrowDown } from 'lucide-react';

/**
 * HeroSection – премиальная верхняя часть главной страницы.
 * Содержит крупный заголовок, подзаголовок и CTA‑кнопку, которая плавно
 * скроллит страницу к списку товаров.
 */
const HeroSection = () => {
  const scrollToProducts = () => {
    const el = document.getElementById('product-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center text-center py-20 px-4 bg-gradient-to-br from-primary to-primary-light glass">
      <h1 className="text-5xl md:text-6xl font-serif text-white mb-4 animate-fade-in">
        Добро пожаловать в <span className="text-accent">Arbarea</span>
      </h1>
      <p
        className="text-lg md:text-xl text-white/80 max-w-2xl mb-8 animate-fade-in"
        style={{ animationDelay: '0.2s' }}
      >
        Эксклюзивные изделия ручной работы, созданные с любовью к деталям.
      </p>
      <button
        type="button"
        onClick={scrollToProducts}
        className="btn btn-primary rounded-md px-6 py-3 text-base font-semibold animate-scale-up"
      >
        Смотреть коллекцию <ArrowDown className="ml-2 inline-block" size={18} />
      </button>
    </section>
  );
};

export default HeroSection;
