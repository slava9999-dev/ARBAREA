import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import AmbientDust from './AmbientDust';

/**
 * Живой фон приложения — три слоя тёплого света, тёплая пыль и зерно.
 *
 * Производительность: только композитные transform/opacity, без blur-фильтров
 * (см. index.css .ambient-orb), canvas ограничен 30 fps и паузами, параллакс
 * двигает слои на считанные пиксели при скролле. При prefers-reduced-motion
 * движение выключается целиком, остаётся статичный тёплый фон.
 */
const AnimatedBackground = () => {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const orbY = useTransform(scrollY, [0, 900], [0, -24]);
  const grainY = useTransform(scrollY, [0, 900], [0, -10]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-base">
      <motion.div
        style={{ y: reduceMotion ? 0 : orbY }}
        className="absolute inset-0 w-full h-full opacity-60 transform-gpu"
      >
        {/* Верхнее левое янтарное свечение */}
        <div
          className="ambient-orb ambient-orb-1 -top-[15%] -left-[5%] w-[75vw] h-[75vw]"
          style={{
            background:
              'radial-gradient(circle, rgba(201, 164, 92, 0.34) 0%, rgba(201, 164, 92, 0.14) 38%, transparent 70%)',
          }}
        />

        {/* Нижнее правое свечение (тёмный янтарь / венге) */}
        <div
          className="ambient-orb ambient-orb-2 -bottom-[15%] -right-[5%] w-[85vw] h-[85vw]"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 131, 74, 0.3) 0%, rgba(168, 131, 74, 0.12) 38%, transparent 70%)',
          }}
        />

        {/* Центральное едва уловимое тёплое свечение */}
        <div
          className="ambient-orb ambient-orb-3 top-[30%] left-[15%] w-[65vw] h-[65vw]"
          style={{
            background:
              'radial-gradient(circle, rgba(219, 185, 120, 0.22) 0%, rgba(219, 185, 120, 0.08) 40%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Тёплая пыль — живая динамика фона (30 fps, пауза вне вкладки) */}
      <AmbientDust />

      {/* Текстура дерева (wood-grain) — статичное зерно поверх света,
          убирает бандинг колец градиента. */}
      <motion.div
        style={{ y: reduceMotion ? 0 : grainY }}
        className="absolute inset-0 bg-wood-grain opacity-[0.15] mix-blend-overlay"
      />
    </div>
  );
};

export default AnimatedBackground;
