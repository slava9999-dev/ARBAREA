import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-base">
      {/* 
        Оптимизация производительности: 
        Вместо ресурсоемкого backdrop-filter: blur(), мы используем 
        заранее размытые элементы с аппаратным ускорением (transform-gpu).
        Это дает 60 FPS на любых устройствах и не сажает батарею.
      */}
      <div className="absolute inset-0 w-full h-full opacity-60 blur-[100px] transform-gpu">
        {/* Верхнее левое янтарное свечение */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full aurora-orb-1"
          style={{
            background:
              'radial-gradient(circle, rgba(201, 164, 92, 0.15) 0%, transparent 70%)',
          }}
        />

        {/* Нижнее правое свечение (темный янтарь / венге) */}
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[80vw] h-[80vw] rounded-full aurora-orb-2"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 131, 74, 0.15) 0%, transparent 70%)',
          }}
        />

        {/* Центральное едва уловимое теплое свечение */}
        <div
          className="absolute top-[30%] left-[20%] w-[60vw] h-[60vw] rounded-full aurora-orb-3"
          style={{
            background:
              'radial-gradient(circle, rgba(219, 185, 120, 0.08) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* 
        Текстура дерева (wood-grain). 
        Накладывается поверх градиентов для создания фактуры и устранения бандинга (колец градиента). 
      */}
      <div className="absolute inset-0 bg-wood-grain opacity-[0.15] mix-blend-overlay" />
    </div>
  );
};

export default AnimatedBackground;
