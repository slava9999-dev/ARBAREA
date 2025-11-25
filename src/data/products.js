export const PRODUCTS = [
    // НОВИНКА: Рейлинг Ясень
    {
        id: 101,
        name: 'Рейлинг Ясень 1000 мм бронза METAL AND GRAIN',
        category: 'Для кухни',
        price: 3500,
        image: '/images/products/railing_ash_1.webp',
        gallery: [
            '/images/products/railing_ash_1.webp',
            '/images/products/railing_ash_2.webp',
            '/images/products/railing_ash_3.webp',
            '/images/products/railing_ash_4.webp',
            '/images/products/railing_ash_5.webp',
            '/images/products/railing_ash_6.webp',
            '/images/products/railing_ash_7.webp',
            '/images/products/railing_ash_8.webp',
            '/images/products/railing_ash_9.webp'
        ],
        video: '/videos/railing_ash_1.mp4',
        rating: 5.0,
        hasOptions: true,
        description: 'Этот стильный рейлинг для кухни станет не только функциональным элементом, но и изысканным украшением вашего интерьера. Изготовленный из термообработанного дуба, он сочетает в себе природную красоту, долговечность и экологичность. Каждая деталь тщательно проработана вручную, что подчеркивает высокое качество и уникальность изделия. Полная детализация и использование натуральных материалов делают этот рейлинг не только практичным, но и эстетически привлекательным. Идеальный выбор для тех, кто ценит натуральные материалы, ручную работу и современный дизайн.'
    },
    {
        id: 103,
        name: 'Панно "Эхо Леса"',
        category: 'Панно',
        price: 8500,
        image: '/images/products/panno_echo_1.webp',
        gallery: [
            '/images/products/panno_echo_1.webp',
            '/images/products/panno_echo_2.webp',
            '/images/products/panno_echo_3.webp',
            '/images/products/panno_echo_4.webp',
            '/images/products/panno_echo_5.webp',
            '/images/products/panno_echo_6.webp',
            '/images/products/panno_echo_7.webp',
            '/images/products/panno_echo_8.webp',
            '/images/products/panno_echo_9.webp',
            '/images/products/panno_echo_10.webp',
            '/images/products/panno_echo_11.webp',
            '/images/products/panno_echo_12.webp'
        ],
        video: '/videos/panno_echo_1.mp4',
        rating: 5.0,
        hasOptions: false,
        description: 'Это элегантное панно из массива сосны притягивает взгляд своей сложной геометрией и гармоничным сочетанием природных оттенков. Узор, напоминающий переплетение лесных троп или игру света в кронах деревьев, привносит в интерьер ощущение глубины и стиля.\n\nХарактеристики:\nМатериал: Массив сосны.\nРазмеры: 78 см х 38 см.\nДизайн: Динамичный геометрический узор из планок различных светлых и темных оттенков дерева.\nОсобенности: Ручная работа, подчеркивающая уникальность каждого элемента и естественную красоту древесины. Идеально подходит для создания акцентной стены или дополнения современного интерьера.'
    },
    {
        id: 104,
        name: 'Панно "Зимние Горы"',
        category: 'Панно',
        price: 4900,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1000&auto=format&fit=crop'
        ],
        rating: 5.0,
        hasOptions: false,
        description: 'Изящное панно, выполненное из массива сосны, станет уютным акцентом в любом интерьере. Его минималистичный дизайн с изображением заснеженных гор под звездным небом создает атмосферу спокойствия и гармонии.\n\nХарактеристики:\nМатериал: Массив сосны.\nРазмеры: 30 см х 30 см.\nДизайн: Изображение стилизованных гор со снежными вершинами на фоне звездного неба.\nОсобенности: Ручная работа, подчеркивающая естественную красоту дерева и уникальность каждого элемента.\n\nДанное изделие уже нашло своего владельца.',
        isSold: true
    },

    // Панно
    {
        id: 1,
        name: 'Панно "Горы"',
        category: 'Панно',
        price: 8900,
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop',
        rating: 4.9,
        hasOptions: true,
        description: 'Эффектное деревянное панно с изображением горного пейзажа. Ручная работа, натуральный дуб. Создаёт атмосферу спокойствия и единения с природой.'
    },
    {
        id: 2,
        name: 'Панно "Лес"',
        category: 'Панно',
        price: 7500,
        image: 'https://images.unsplash.com/photo-1579856475740-38c62bc14bd8?q=80&w=1000&auto=format&fit=crop',
        rating: 4.8,
        hasOptions: true,
        description: 'Минималистичное панно с абстрактным изображением леса. Идеально для современных интерьеров. Покрыто экологичным маслом.'
    },
    {
        id: 3,
        name: 'Панно "Волны"',
        category: 'Панно',
        price: 9500,
        image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1000&auto=format&fit=crop',
        rating: 5.0,
        hasOptions: true,
        description: 'Элегантное объёмное панно с рельефом морских волн. Игра света и тени создаёт живой эффект. Премиум качество.'
    },

    // Для кухни (остальные)
    {
        id: 5,
        name: 'Подставка для ножей',
        category: 'Для кухни',
        price: 4200,
        image: 'https://images.unsplash.com/photo-1584990347449-39b4aa37f955?q=80&w=1000&auto=format&fit=crop',
        rating: 4.9,
        hasOptions: false,
        description: 'Магнитная подставка из дуба с мощными неодимовыми магнитами. Надёжно удерживает ножи любого веса. Стильный акцент на кухне.'
    },
    {
        id: 6,
        name: 'Бутылочница настенная',
        category: 'Для кухни',
        price: 5500,
        image: 'https://images.unsplash.com/photo-1572297794533-5eec6b40ae11?q=80&w=1000&auto=format&fit=crop',
        rating: 4.8,
        hasOptions: true,
        description: 'Стильная настенная полка для хранения вина. Вмещает до 6 бутылок. Металлические крепления в комплекте.'
    },
    {
        id: 7,
        name: 'Разделочная доска премиум',
        category: 'Для кухни',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1604421017753-7a9f03fef9ef?q=80&w=1000&auto=format&fit=crop',
        rating: 5.0,
        hasOptions: false,
        description: 'Торцевая доска из дуба премиум класса. Не тупит ножи, выдерживает интенсивное использование. Пропитана минеральным маслом.'
    },

    // Для ванной
    {
        id: 102,
        name: 'Держатель Ясень 600мм бронза WOOD AND STEEL',
        category: 'Для ванной',
        price: 3000,
        image: '/images/products/holder_ash_1.webp',
        gallery: [
            '/images/products/holder_ash_1.webp',
            '/images/products/holder_ash_2.webp',
            '/images/products/holder_ash_3.webp',
            '/images/products/holder_ash_4.webp',
            '/images/products/holder_ash_5.webp',
            '/images/products/holder_ash_6.webp',
            '/images/products/holder_ash_7.webp',
            '/images/products/holder_ash_8.webp',
            '/images/products/holder_ash_9.webp',
            '/images/products/holder_ash_10.webp'
        ],
        rating: 5.0,
        hasOptions: true,
        description: 'Этот стильный держатель для полотенец станет прекрасным дополнением вашей ванной комнаты или спальни. Изготовленный из термообработанного дуба или ясеня, он сочетает в себе природную красоту, долговечность и экологичность. Держатель для полотенец — идеальный выбор для тех, кто ценит натуральные материалы, ручную работу и современный дизайн. Он не только украсит ваше пространство, но и сделает его более уютным и функциональным. Держатель доступен в стандартных размерах 1000 мм, 800 мм и 600 мм, а также может быть выполнен по индивидуальным размерам, чтобы идеально вписаться в ваш интерьер.'
    },
    {
        id: 9,
        name: 'Полка для ванной',
        category: 'Для ванной',
        price: 4800,
        image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=1000&auto=format&fit=crop',
        rating: 4.7,
        hasOptions: true,
        description: 'Многоуровневая полка из влагостойкого дуба. Идеальна для хранения косметики и полотенец. Специальная обработка против плесени.'
    },
    {
        id: 10,
        name: 'Держатель для туалетной бумаги',
        category: 'Для ванной',
        price: 2200,
        image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1000&auto=format&fit=crop',
        rating: 4.6,
        hasOptions: true,
        description: 'Компактный держатель в минималистичном стиле. Дерево и металл гармонично сочетаются. Простая установка.'
    },
    {
        id: 11,
        name: 'Вешалка для халатов',
        category: 'Для ванной',
        price: 3800,
        image: 'https://images.unsplash.com/photo-1600566752734-a4e0c6c4d088?q=80&w=1000&auto=format&fit=crop',
        rating: 4.9,
        hasOptions: true,
        description: 'Настенная вешалка с 4 крючками из натурального дерева. Выдерживает до 20 кг. Стильное дополнение ванной комнаты.'
    },

    // Свет
    {
        id: 12,
        name: 'Светильник настенный "Куб"',
        category: 'Свет',
        price: 6500,
        image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?q=80&w=1000&auto=format&fit=crop',
        rating: 5.0,
        hasOptions: false,
        description: 'Дизайнерский светильник кубической формы. Рассеянный тёплый свет создаёт уютную атмосферу. LED лампа в комплекте.'
    },
    {
        id: 13,
        name: 'Люстра деревянная',
        category: 'Свет',
        price: 12500,
        image: 'https://images.unsplash.com/photo-1550664973-880c57c6cca0?q=80&w=1000&auto=format&fit=crop',
        rating: 4.9,
        hasOptions: false,
        description: 'Массивная потолочная люстра из состаренного дуба. Настоящее произведение искусства. До 5 ламп E27.'
    },
    {
        id: 14,
        name: 'Бра "Лофт"',
        category: 'Свет',
        price: 5800,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop',
        rating: 4.8,
        hasOptions: true,
        description: 'Настенное бра в индустриальном стиле. Комбинация дерева и металла. Регулируемый угол наклона плафона.'
    },
    {
        id: 15,
        name: 'Торшер напольный',
        category: 'Свет',
        price: 9200,
        image: 'https://images.unsplash.com/photo-1565705990481-cc46c3d861e7?q=80&w=1000&auto=format&fit=crop',
        rating: 4.7,
        hasOptions: false,
        description: 'Элегантный торшер с основанием из массива ясеня. Тканевый абажур ручной работы. Высота 150 см.'
    },
];
