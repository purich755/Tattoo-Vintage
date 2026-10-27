// Все факты, ссылки, тексты и список фото — одно место для правок.
// Источники: бриф владельцу, карточка Яндекс Карт, Telegram-канал t.me/tattoovintage888.
// Спорные места помечены TODO_CONFIRM — их нужно сверить с владельцами перед запуском.

// Имя мастера в отзывах пишут и «Наргиз», и «Наргиза». Меняется здесь — и везде на сайте.
export const MASTER_F = 'Наргиз'; // TODO_CONFIRM: «Наргиз» или «Наргиза»
export const MASTER_M = 'Дмитрий';

export const STUDIO = {
  name: 'Tattoo Vintage',
  city: 'Краснодар',
  district: 'микрорайон им. Петра Метальникова',
  address: {
    street: 'ул. Петра Метальникова, 28',
    entrance: 'вход 2',
    floor: 'цокольный этаж',
    room: 'помещение 6/8',
  },
  stop: '«ЖК Времена Года»',
  stopDistance: '~130 м',
  geo: { lat: 45.095541, lon: 39.005532 },
  hours: 'до 02:00', // время открытия неизвестно — не выдумывать
  byAppointment: true,
  amenities: ['парковка', 'велопарковка', 'Wi-Fi', 'наличные и перевод'],
  award: 'Хорошее место 2026 · Яндекс Карты',
  slogan: 'Запомни: с тобой навсегда останется только краска под кожей',
  joke: 'я не косячу, а экспериментирую',
  night: '3 дня кропотливой работы до раннего утра, вот почему мы не принимаем с 8 утра',
  // TODO_CONFIRM: история про Астрахань — со слов отзывов и канала («клиенты с Астрахани всегда ждут нас»)
  story: 'Мы начинали в Астрахани — там до сих пор ждут наших приездов. Теперь у нас свой угол в Краснодаре: одна комната, два мастера и только те работы, за которые не стыдно.',
};

export const LINKS = {
  telegram: 'https://t.me/tattoovintage888',
  whatsapp: 'https://wa.me/79965052031',
  phone: 'tel:+79965052031',
  phoneText: '+7 (996) 505-20-31',
  vk: 'https://vk.ru/tattoo5632',
  max: 'https://max.ru/join/8P3zVSFklNrtuisw2JIs_2uCTjYrx_R1jcxU86QZ6M4',
  yandex: 'https://yandex.ru/maps/org/tattoo_vintage/115039352448/',
  reviews: 'https://yandex.ru/maps/org/tattoo_vintage/115039352448/reviews/',
  route: 'https://yandex.ru/maps/org/tattoo_vintage/115039352448/?mode=routes&rtext=~45.095541%2C39.005532',
  map: 'https://yandex.ru/map-widget/v1/?ll=39.005532%2C45.095541&z=17&pt=39.005532,45.095541,pm2rdm',
  nightPost: 'https://t.me/tattoovintage888/364',
};

// Кнопки-строки в кадре 10
export const CONTACT_ROWS = [
  { key: 'telegram', label: 'Telegram', note: '@tattoovintage888' },
  { key: 'whatsapp', label: 'WhatsApp', note: 'тот же номер' },
  { key: 'phone', label: LINKS.phoneText, note: 'позвонить' },
  { key: 'vk', label: 'ВКонтакте', note: 'vk.ru/tattoo5632' },
  { key: 'max', label: 'MAX', note: 'группа студии' },
];

// Кадр 03: под каждым мастером — цитата клиента про него.
// Портретов нет — руки за работой. Авторство кадров рук не подтверждено. TODO_CONFIRM: портреты мастеров
export const MASTERS = [
  { name: MASTER_F, photo: 'hands-1', frame: '07', quote: { text: `Очень благодарна за работу, а особенно ${MASTER_F}: очень внимательная, отзывчивая девушка, учла все пожелания.`, author: 'Елена Т.', date: 'май 2026' } },
  { name: MASTER_M, photo: 'hands-2', frame: '08', quote: { text: 'Мастер Дмитрий — настоящий профессионал, атмосфера творческая и стерильная.', author: 'Юрий С.', date: 'декабрь 2025' } },
];

// Кадр 04: вкладки и пометки карандашом. Пустая зона — вкладка не показывается.
export const ZONES = [
  { key: 'all', label: 'Все' },
  { key: 'sleeves', label: 'Рукава', short: 'РУКАВ' },
  { key: 'backs', label: 'Спины', short: 'СПИНА' },
  { key: 'legs', label: 'Ноги', short: 'НОГА' },
  { key: 'small', label: 'Небольшие', short: 'НЕБОЛЬШАЯ' },
  { key: 'covers', label: 'Перекрытия', short: 'ПЕРЕКРЫТИЕ' },
];
export const SHEET = [
  'back-gta', 'sleeve-scandi', 'small-hands', 'leg-portraits', 'sleeve-dragon', 'cover-dragon',
  'sleeve-faith', 'small-ankh', 'leg-caesar', 'sleeve-full', 'back-angels', 'small-dagger',
  'sleeve-lilies', 'leg-familia', 'small-lilies', 'forearm-madonna', 'cover-clown', 'sleeve-samurai',
  'small-script', 'leg-red', 'sleeve-olive', 'small-thorns',
];
// circle — номер неровного кружка (0–3), note — рукописная пометка
export const MARKS = {
  'back-gta': { circle: 0, note: 'спина' },
  'sleeve-dragon': { circle: 1, note: 'этот!' },
  'leg-caesar': { circle: 2, note: 'печатать' },
  'small-ankh': { circle: 3, note: null },
};

// Кадр 05: «Сушка». caption — только подтверждённые подписи. photo: null — засвеченный отпечаток со ссылкой.
export const DRYING = [
  { photo: 'back-gta', caption: 'спина GTA — готово' },
  { photo: 'dry-leg', caption: 'нога, ±8 часов за день' },
  { photo: null, caption: '3 дня до раннего утра', link: LINKS.nightPost, linkText: 'кадр в Telegram ↗' },
  { photo: 'dry-sleeve', caption: 'внешний рукав — один сеанс' }, // TODO_CONFIRM: тот ли это рукав, что «за один сеанс» из отзыва
  { photo: 'dry-black-dragon', caption: null },
  { photo: 'dry-red-sleeve', caption: null },
];

// Кадр 06: пары до/после (Telegram, посты 320 и 294)
export const PAIRS = [
  { before: 'pair1-before', after: 'pair1-after', label: 'перекрытие' },
  { before: 'pair2-before', after: 'pair2-after', label: 'исправление' },
];

// Кадр 07: лабораторный таймер
export const STEPS = [
  { name: 'Зарядка', text: 'Пишете в Telegram или WhatsApp. Присылайте идею, референс или фото зоны — можно и свой эскиз.' },
  { name: 'Экспозиция', text: 'Вместе доводим эскиз и подбираем, как он ляжет на тело.' },
  { name: 'Стоп-ванна', text: 'Согласуем цену до сеанса. По ходу она не растёт.' },
  { name: 'Проявка', text: 'Сеанс в удобное вам время, в том числе вечером. Большие объёмы стараемся делать за минимум сеансов.' },
  { name: 'Фиксаж', text: 'Подробно рассказываем про уход. Плотный чёрный раскрывается не сразу — после заживления смотрим работу вместе.' },
];

// Кадр 08: карточки-негативы
export const FEARS = [
  { q: 'Будет больно?', a: 'Ощущения у всех разные и зависят от зоны. Многие в отзывах пишут, что было почти не больно.',
    quote: { text: 'Били рукав у ребят. Я даже в процессе успевала поспать.', author: 'Татьяна Ц.', date: 'июнь 2026' } },
  { q: 'А вдруг нестерильно?', a: 'Чистота — первое, о чём нам пишут в отзывах.',
    quote: { text: 'Комфортная студия и лучшие мастера, всё стерильно, что важно для меня.', author: 'Елизавета', date: 'январь 2026' } },
  { q: 'Не знаю, что хочу', a: 'Приходите с идеей или с настроением — сюжет и место подберём вместе.',
    quote: { text: 'Это моя первая тату. Спасибо ребятам — помогли определиться с сюжетом.', author: 'Елена К.', date: 'июль 2026' } },
  { q: 'Вдруг выйдет дороже?', a: 'Цену называем до начала и держим её.',
    quote: { text: 'По цене всё было, как договорились с самого начала, ничего не увеличилось.', author: 'Богдан Б.', date: 'май 2026' } },
];

// Бегущие полоски фотобумаги — короткие цитаты с Яндекс Карт (без звёзд и чисел)
export const QUOTES = [
  { text: 'За один сеанс забили весь внешний рукав. Работа очень большая, а всё выглядит аккуратно и цельно.', author: 'Дарья Д.', date: 'сентябрь 2026' },
  { text: 'Все другие салоны хотели растянуть на три и более сеансов, тут мне сделали за два.', author: 'Дарья М.', date: 'май 2026' },
  { text: 'Моя первая тату, было страшно. Но страх развеялся, как только мастер ко мне прикоснулась.', author: 'Галина К.', date: 'март 2026' },
  { text: 'Делала впервые, переживала — как оказалось, зря. Приехала, они и успокоили, и советы дали.', author: 'Виктория Т.', date: 'декабрь 2025' },
  { text: 'Ценник не конский и нет понтов лишних. Всегда подберут время, удобное клиенту.', author: 'Вадим Д.', date: 'сентябрь 2026' },
  { text: 'В первый же день быстро помогли подобрать эскиз, учли все пожелания, согласовали цену.', author: 'Никита Т.', date: 'апрель 2026' },
  { text: 'Я так переживала, что попаду не в те руки. Но зря переживала.', author: 'Элина', date: 'ноябрь 2025' },
  { text: 'Делал у ребят перекрытие старой татуировки. Всё прошло хорошо и комфортно, всё было стерильно.', author: 'Иван С.', date: 'январь 2026' },
  { text: 'Подробно проконсультировали, помогли с эскизами и учли все пожелания.', author: 'Ирина З.', date: 'январь 2026' },
  { text: 'Помогли эскизом и расположением. Ребята делают всё очень качественно и быстро.', author: 'Кристина', date: 'август 2026' },
  { text: 'Делала первое тату в жизни у этих ребят. Всё объяснили, подсказали, посоветовали.', author: 'Диана З.', date: 'сентябрь 2026' },
  { text: 'Дмитрий — профессионал своего дела. Долго искала мастера, который воплотит все идеи, — нашла.', author: 'Виктория Б.', date: 'декабрь 2025' },
];

// Кадр 09
// TODO_CONFIRM: цены пирсинга. В Telegram в декабре 2025 был «пирсинг носа — 1500», в брифе — от 2000.
export const PIERCING = [
  { name: 'нос', from: 2000 },
  { name: 'губа', from: 2500 },
  { name: 'бровь', from: 2500 },
  { name: 'язык', from: 3000 },
  { name: 'индастриал', from: 3000 },
];
export const SERVICES = [
  { name: 'Пирсинг', detail: 'НОС ОТ 2000 ₽ · ГУБА, БРОВЬ ОТ 2500 ₽ · ЯЗЫК, ИНДАСТРИАЛ ОТ 3000 ₽', photo: 'piercing' },
  { name: 'Перманентный макияж', detail: 'ПО ЗАПИСИ', photo: null }, // TODO_CONFIRM: фото работ по перманенту
  { name: 'Коррекция и перекрытие', detail: 'ОЦЕНИМ ПО ФОТО', photo: 'cover-dragon' },
  { name: 'Обучение', detail: 'ТАТУ · ПИРСИНГ · ТАТУАЖ', photo: 'process' },
];

// Список фото: генерируется tools/sync-photos.mjs из assets/img/manifest.json — руками не править.
/* photos:start */
export const PHOTOS = {
  'hero': { src: 'assets/img/hero', w: [640, 1200, 1920], ratio: 1.24, zone: 'hero', alt: "Чёрно-серый рукав с ангелами на фоне оливковой стены студии, Tattoo Vintage" },
  'sleeve-scandi': { src: 'assets/img/sleeve-scandi', w: [640, 1200, 1920], ratio: 1.333, zone: 'sleeves', alt: "Чёрно-серый рукав в скандинавском стиле, Tattoo Vintage" },
  'sleeve-faith': { src: 'assets/img/sleeve-faith', w: [640, 1200, 1920], ratio: 1.333, zone: 'sleeves', alt: "Чёрно-серый рукав с портретом и облаками, Tattoo Vintage" },
  'sleeve-dragon': { src: 'assets/img/sleeve-dragon', w: [640, 1200, 1920], ratio: 1.333, zone: 'sleeves', alt: "Рукав с драконом в чёрно-сером, Tattoo Vintage" },
  'sleeve-full': { src: 'assets/img/sleeve-full', w: [640, 1200, 1440], ratio: 1.333, zone: 'sleeves', alt: "Полный рукав, чёрно-серый реализм, Tattoo Vintage" },
  'sleeve-lilies': { src: 'assets/img/sleeve-lilies', w: [640, 1104], ratio: 1.739, zone: 'sleeves', alt: "Женский рукав с цветами и драконом, Tattoo Vintage" },
  'sleeve-samurai': { src: 'assets/img/sleeve-samurai', w: [640, 1200, 1403], ratio: 1.669, zone: 'sleeves', alt: "Рукав с самураем, чёрный и красный, Tattoo Vintage" },
  'sleeve-olive': { src: 'assets/img/sleeve-olive', w: [640, 1200, 1280], ratio: 1.334, zone: 'sleeves', alt: "Женский рукав на фоне оливковой стены, Tattoo Vintage" },
  'forearm-madonna': { src: 'assets/img/forearm-madonna', w: [640, 1200, 1920], ratio: 1.333, zone: 'sleeves', alt: "Реалистичный портрет с чётками на предплечье, Tattoo Vintage" },
  'back-gta': { src: 'assets/img/back-gta', w: [640, 1200, 1440], ratio: 1.333, zone: 'backs', alt: "Чёрно-серая татуировка на всю спину на тему GTA, Tattoo Vintage" },
  'back-angels': { src: 'assets/img/back-angels', w: [640, 1200, 1280], ratio: 1.334, zone: 'backs', alt: "Чёрно-серая татуировка на спине с ангелами и надписью, Tattoo Vintage" },
  'leg-portraits': { src: 'assets/img/leg-portraits', w: [640, 1200, 1500], ratio: 1.707, zone: 'legs', alt: "Нога с женскими портретами и орнаментом, Tattoo Vintage" },
  'leg-caesar': { src: 'assets/img/leg-caesar', w: [640, 1200, 2000], ratio: 1.333, zone: 'legs', alt: "Статуя в чёрно-сером на икре, Tattoo Vintage" },
  'leg-familia': { src: 'assets/img/leg-familia', w: [640, 1200, 1920], ratio: 1.227, zone: 'legs', alt: "Надпись Familia и компас на голени, Tattoo Vintage" },
  'leg-red': { src: 'assets/img/leg-red', w: [640, 1200, 2000], ratio: 1.6, zone: 'legs', alt: "Татуировка с красными акцентами на голени, Tattoo Vintage" },
  'small-hands': { src: 'assets/img/small-hands', w: [640, 1200], ratio: 1.333, zone: 'small', alt: "Молитвенные руки и надпись «Спаси и сохрани» на кисти, Tattoo Vintage" },
  'small-script': { src: 'assets/img/small-script', w: [640, 843], ratio: 1.604, zone: 'small', alt: "Надпись Until the very end под ключицей, Tattoo Vintage" },
  'small-dagger': { src: 'assets/img/small-dagger', w: [640, 1200, 1920], ratio: 1.333, zone: 'small', alt: "Кинжал с надписью вдоль предплечья, Tattoo Vintage" },
  'small-ankh': { src: 'assets/img/small-ankh', w: [640, 1200, 2000], ratio: 1.333, zone: 'small', alt: "Маленький анх на шее, файнлайн, Tattoo Vintage" },
  'small-lilies': { src: 'assets/img/small-lilies', w: [640, 1200, 1551], ratio: 0.941, zone: 'small', alt: "Лилии под ключицей, файнлайн, Tattoo Vintage" },
  'small-thorns': { src: 'assets/img/small-thorns', w: [640, 1200, 1290], ratio: 1.538, zone: 'small', alt: "Графичный орнамент вдоль предплечья, Tattoo Vintage" },
  'cover-dragon': { src: 'assets/img/cover-dragon', w: [640, 1200, 2000], ratio: 1.156, zone: 'covers', alt: "Перекрытие старой татуировки драконом на груди, Tattoo Vintage" },
  'cover-clown': { src: 'assets/img/cover-clown', w: [600], ratio: 1.333, zone: 'covers', alt: "Перекрытие старой работы: новый эскиз на предплечье, Tattoo Vintage" },
  'dry-leg': { src: 'assets/img/dry-leg', w: [600], ratio: 1.333, zone: 'drying', alt: "Нога в чёрно-сером после первого дня работы, Tattoo Vintage" },
  'dry-sleeve': { src: 'assets/img/dry-sleeve', w: [600], ratio: 1.333, zone: 'drying', alt: "Законченный внешний рукав, Tattoo Vintage" },
  'dry-black-dragon': { src: 'assets/img/dry-black-dragon', w: [640, 1200, 1920], ratio: 1.333, zone: 'drying', alt: "Дракон в чёрно-сером на плече и руке, Tattoo Vintage" },
  'dry-red-sleeve': { src: 'assets/img/dry-red-sleeve', w: [640, 1200, 1920], ratio: 1.333, zone: 'drying', alt: "Рукав в японском стиле с красным, Tattoo Vintage" },
  'pair1-before': { src: 'assets/img/pair1-before', w: [300], ratio: 2, zone: 'pairs', alt: "Старая татуировка на предплечье до перекрытия" },
  'pair1-after': { src: 'assets/img/pair1-after', w: [300], ratio: 2, zone: 'pairs', alt: "То же предплечье после перекрытия, Tattoo Vintage" },
  'pair2-before': { src: 'assets/img/pair2-before', w: [330], ratio: 1.455, zone: 'pairs', alt: "Расплывшиеся птицы на запястье до исправления" },
  'pair2-after': { src: 'assets/img/pair2-after', w: [336], ratio: 1.429, zone: 'pairs', alt: "Птицы на запястье после исправления, Tattoo Vintage" },
  'hands-1': { src: 'assets/img/hands-1', w: [640, 1072], ratio: 1.791, zone: 'masters', alt: "Руки мастера с машинкой над переведённым эскизом" },
  'hands-2': { src: 'assets/img/hands-2', w: [640, 720], ratio: 1.778, zone: 'masters', alt: "Руки мастера в чёрных перчатках, сеанс на предплечье" },
  'process': { src: 'assets/img/process', w: [640, 1072], ratio: 1.776, zone: 'process', alt: "Процесс: заливка чёрных полос на руке" },
  'piercing': { src: 'assets/img/piercing', w: [600], ratio: 1.067, zone: 'services', alt: "Пирсинг уха: индастриал и кольца" },
};
/* photos:end */
