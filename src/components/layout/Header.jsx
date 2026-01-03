import { motion } from 'framer-motion';

const Header = () => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 px-5 py-3 flex justify-between items-center"
      style={{
        background:
          'linear-gradient(180deg, rgba(26, 22, 20, 0.95) 0%, rgba(26, 22, 20, 0.85) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(201, 164, 92, 0.1)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'backOut' }}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #a8834a 0%, #c9a45c 100%)',
            boxShadow:
              '0 0 20px rgba(201, 164, 92, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <span className="font-serif font-bold text-xl text-base">A</span>
          {/* Subtle shine effect */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
            }}
          />
        </motion.div>

        <div className="flex flex-col">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg font-serif font-bold tracking-[0.3em] leading-none"
            style={{
              background: 'linear-gradient(135deg, #f5efe6 0%, #bdb3a7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            RBAREA
          </motion.h1>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-[9px] uppercase tracking-[0.5em] ml-0.5"
            style={{ color: '#8a7f74' }}
          >
            Workshop
          </motion.span>
        </div>
      </div>

      {/* Right side - can add actions here */}
      <div className="flex items-center gap-2">
        {/* Placeholder for future actions like search, notifications */}
      </div>

      {/* Bottom glow line */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(201, 164, 92, 0.3), transparent)',
        }}
      />
    </header>
  );
};

export default Header;
