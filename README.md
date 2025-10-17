# Task
https://docs.google.com/document/d/1nCHuBjLxwJvzXHCDFUMZMPh5VyTI4bJj0waSy1RntHk/edit?tab=t.0#heading=h.5dt3hghpa22f
# How to run the app
1. Install the dependencies: 'npm install'
2. Run dev server: 'npm run dev'
3. Build production: 'npm run build'
# Database snapshot
Коллекция: users
{
  uid: string,             // ID пользователя
  email: string,           // Электронная почта
  displayName: string,     // Отображаемое имя
  role: string,            // Роль пользователя
  createdAt: Timestamp,    // Дата регистрации
}
Коллекция: landmarks
{
  id: string,              // ID достопримечательности
  name: string,            // Название
  description: string,     // Описание
  latitude: number         // Широта для карты
  longitude: number,       // Долгота для карты
  createdBy: string,       // ID создателя
  createdAt: Timestamp,    // Дата создания
  averageRating: number,   // Средний рейтинг
  visitCount: number,      // Общее количество оценок
  photos: string[],        // Массив URL-адресов фотографий (из Firebase Storage)
  userRatings: { [userId: strin]: number }  // Объект, хранящий оценки каждого пользователя
}
# Application stack
Vue,vue router,vite,firebase,pinia,vue i18n,typescript
# Stcructure
src/
|- components/                  # Vue компоненты приложения
│   |- GeneralMap/              # Компоненты-части для страницы GeneralMap.vue
│   │    |- Header.vue          # Шапка страницы
│   │    |- LandmarkCard.vue    # Карточка достопримечательности
│   │    |- MapSection.vue      # Секция карты
│   │    |- Sidebar.vue         # Боковая панель
│   │    |- SidebarHeader.vue   # Заголовок боковой панели
│   |- LandmarkDetail/          # Компоненты-части для страницы LandmarkDetail.vue
│   │    |- Header.vue          # Заголовок страницы деталей
│   │    |- InfoSection.vue     # Универсальный контейнер секции
│   │    |- LocationDetails.vue # Детали местоположения
│   │    |- PhotoGallery.vue    # Галерея фотографий
│   │    |- PhotoViewer.vue     # Модальное окно просмотра фото
│   │    |- RatingSummary.vue   # Сводка рейтинга
│   |- LandmarkForm/            # Компоненты-части для формы LandmarkForm.vue
│   │    |- Actions.vue         # Кнопки формы
│   │    |- InputGroup.vue      # Поле ввода текста/textarea
│   │    |- MapSelector.vue     # Выбор местоположения на карте
│   │    |- PhotoUploader.vue   # Загрузка фотографий
│   │    |- RatingSelector.vue  # Выбор рейтинга
│   |- UI/                      # UI-компоненты
│   │    |- FormButton.vue      # UI-компонент для кнопки отправки
│   │    |- FormInput.vue       # UI-компонент для текстового ввода
│   |- LandmarkForm.vue         # Форма создания/редактирования достопримечательности
│   |- LandmarkMap.vue          # Компонент Leaflet Map. Отображает карту, маркеры, кластеризацию и обрабатывает выбор местоположения
│   |- LanguageSwitcher.vue     # Переключатель языка
|- firebase/                    # Конфигурация Firebase
│   |- config.ts                # # Инициализация Firebase приложения
|- i18n/                        # Файлы для локализации
│   |- locales                  # Папка с файлами переводов
│   │    |- be.json             # Беларуская локализация
│   │    |- en.json             # Русская локализация
│   │    |- ru.json             # Английская локализация
│   |- index.ts                 # Конфигурация Vue I18n
|- pages/                       # Основные страницы приложения
│   |- GeneralMap.vue           # Главная страница
│   |- LandmarkDetail.vue       # Страница деталей достопримечательности
│   |- Register.vue             # Страница регистрации
│   |- SignIn.vue               # Страница входа
|- router/                      # Конфигурация маршрутизации
│   |- index.ts                 # Определение маршрутов приложения
|- stores/                      # Модули Pinia для управления состоянием
│   |- auth.ts                  # Хранилище аутентификации
│   |- landmarks.ts             # Хранилище достопримечательностей
│   |- locale.ts                # Хранилище выбора языка
|- types/                       # Файлы TypeScript с глобальными интерфейсами и типами
│   |- index.ts                 # Глобальные интерфейсы и типы
|- App.vue                      # Корневой компонент приложения
|- main.ts                      # Точка входа приложения
