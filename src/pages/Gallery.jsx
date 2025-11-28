import { motion } from 'framer-motion';
import { INTERIORS } from '../data/mockData';
import SocialFooter from '../components/layout/SocialFooter';

const Gallery = () => (
  <section className="pb-24 pt-20 px-4 bg-linen-dark min-h-screen">
    <h2 className="font-serif text-2xl text-amber-600 mb-6 text-center">
      Интерьеры
    </h2>

    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
      {INTERIORS.map((img, i) => (
        <motion.div
          key={img}
          className="break-inside-avoid mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <img
            src={img}
            alt={`Интерьер ${i + 1}`}
            loading="lazy"
            className="w-full rounded-lg object-cover hover:brightness-90 transition-all duration-300 shadow-lg"
          />
        </motion.div>
      ))}
    </div>
    <SocialFooter />
  </section>
);

export default Gallery;
