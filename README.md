# ocekyWT

Полноценная витрина аккаунтов War Thunder. Покупатель ищет и просматривает лоты на сайте, затем переходит по ссылке конкретного лота на FunPay. Сайт **не принимает оплату** и не хранит платёжные данные.

Администратор входит через Supabase Auth и управляет товарами, статусами, изображениями и внутренней финансовой информацией. Проект рассчитан на бесплатные тарифы GitHub Pages и Supabase — отдельный сервер, VPS и service role key не требуются.

## Что реализовано

- React + TypeScript + Vite + Tailwind CSS.
- Главная, каталог, поиск с debounce, фильтры, сортировка и постраничная выдача.
- Карточка и детальная страница товара, галерея, статусы `available`, `sold`, `hidden`.
- Кнопка покупки ведёт на `funpay_url` в новой вкладке; у проданных лотов она отключена.
- Email/Password вход администратора без публичной регистрации в интерфейсе.
- Защищённый CRUD товаров, drag-and-drop загрузка и сортировка изображений, WebP-оптимизация в браузере.
- Админский dashboard и закрытая финансовая аналитика.
- RLS, отдельная таблица `admin_users`, SQL-функция `is_admin()` и отдельный публичный view без финансовых полей.
- GitHub Actions deploy для GitHub Pages, включая SPA fallback для прямых ссылок.
- Empty/error/skeleton states, toast-уведомления, подтверждение удаления, focus states и адаптивность от 320px.

## Стек

| Зона | Технологии |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, Lucide React |
| Данные и Auth | Supabase PostgreSQL, Supabase Auth, Supabase Storage |
| Хостинг | GitHub Pages |
| CI/CD | GitHub Actions |

## Структура

```text
src/
  components/
    admin/              # форма товара и image uploader
    layout/             # публичный и административный layouts
    products/           # карточки, галерея, фильтры, статусы
    ui/                 # toast, confirm dialog, состояния загрузки
  contexts/AuthContext.tsx
  hooks/
  lib/                  # Supabase, auth, products, Storage
  pages/
  types/database.ts
supabase/
  schema.sql            # таблицы, функции, RLS и policies
  storage.sql           # bucket и Storage policies
  seed.sql              # безопасные тестовые товары
.github/workflows/deploy.yml
```

## 1. Установите Node.js

Установите [Node.js LTS](https://nodejs.org/) (рекомендуется 22 LTS; подойдёт и современная 20 LTS). После установки откройте терминал и убедитесь, что команды работают:

```bash
node --version
npm --version
```

## 2. Скачайте проект и установите зависимости

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
npm install
```

`package-lock.json` уже включён в проект. В GitHub Actions используется `npm ci`, поэтому не удаляйте lock-файл без причины.

## 3. Создайте Supabase-проект

1. Откройте [Supabase](https://supabase.com/) и создайте бесплатный проект.
2. Сохраните пароль базы данных в надёжном месте. Он не нужен фронтенду.
3. Дождитесь окончания создания проекта.
4. Откройте **Project Settings → API**.
5. Скопируйте **Project URL** и **Publishable key**. В старом интерфейсе ключ может называться `anon public` — используйте только публичный/anon ключ.

Никогда не используйте в `.env`, GitHub secrets или браузерном коде **Service Role key**.

## 4. Создайте таблицы и RLS-политики

1. В Supabase откройте **SQL Editor → New query**.
2. Откройте [supabase/schema.sql](supabase/schema.sql), скопируйте весь файл в редактор и нажмите **Run**.
3. По желанию откройте [supabase/seed.sql](supabase/seed.sql) и выполните его. Он добавит три явно тестовых товара без аккаунтов, паролей и реальных ссылок.

`schema.sql` создаёт:

- `products` — все данные о товаре, включая закрытые финансовые поля;
- `product_images` — дополнительные изображения;
- `admin_users` — список разрешённых администраторов;
- индексы, constraints, автоматическое обновление `updated_at` и slug trigger;
- `is_admin()` и `is_public_product()`;
- `catalog_products` — безопасный публичный view;
- `public_catalog_stats()` — безопасную статистику главной страницы;
- Row Level Security policies.

### Почему финансовые данные не публичны

Посетитель не читает таблицу `products` напрямую. У неё нет public SELECT-policy. Витрина использует только `catalog_products`, где физически отсутствуют `cost_usd`, `cost_rub`, `sale_price`, `platform_fee` и `profit`. Полные строки доступны только авторизованному пользователю, для которого `is_admin()` вернул `true`.

## 5. Настройте Storage для изображений

1. После выполнения `schema.sql` создайте новый SQL query.
2. Скопируйте и выполните [supabase/storage.sql](supabase/storage.sql).

Файл создаёт публичный bucket `product-images` с ограничением **8 МБ** и MIME-типами JPG/JPEG, PNG, WEBP. Он добавляет политики:

- все могут читать изображения;
- добавлять, менять и удалять файлы может только пользователь, прошедший `is_admin()`.

Файлы создаются в папке товара:

```text
product-images/
  <product-id>/
    main.webp
    image-<timestamp>-<number>.webp
```

Перед отправкой изображение масштабируется максимум до 2200px по большей стороне и перекодируется в WebP в браузере. Исходный файл всё равно сначала проверяется на размер и MIME-тип.

## 6. Создайте администратора

Публичной регистрации в приложении нет. Администратор создаётся вручную в Supabase.

1. В Supabase откройте **Authentication → Providers → Email**. Оставьте Email/Password включённым и выключите возможность самостоятельной регистрации, если она включена в вашем проекте.
2. Откройте **Authentication → Users → Add user**.
3. Создайте пользователя с email и сильным паролем. При необходимости отметьте подтверждение email.
4. Скопируйте UUID созданного пользователя из списка пользователей.
5. В SQL Editor выполните, подставив UUID:

```sql
insert into public.admin_users (user_id)
values ('PASTE_AUTH_USER_UUID_HERE');
```

Без строки в `admin_users` пользователь сможет пройти Auth, но будет немедленно разлогинен из админ-интерфейса и не получит доступ к данным: это предусмотренная защита.

## 7. Создайте `.env`

Скопируйте пример:

```bash
copy .env.example .env
```

На macOS/Linux используйте:

```bash
cp .env.example .env
```

Заполните `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_or_anon_key
VITE_FUNPAY_PROFILE_URL=https://funpay.com/users/21503962/
VITE_BASE_PATH=/
```

`VITE_FUNPAY_PROFILE_URL` используется для общей кнопки «Перейти на FunPay». У каждого товара есть собственный обязательный `funpay_url`.

`.env` уже внесён в `.gitignore`. Не коммитьте его.

## 8. Локальный запуск

```bash
npm run dev
```

Vite покажет локальный адрес, обычно `http://localhost:5173/`.

Проверки перед публикацией:

```bash
npm run build
npm run lint
npm run preview
```

На Windows в изолированной среде этой задачи `vite build` использует штатный Vite `--configLoader runner`; это уже включено в `package.json` и прозрачно для обычной разработки и GitHub Actions.

## 9. Первый товар

1. Откройте `/admin/login` и войдите созданным администратором.
2. В панели выберите **Новый товар**.
3. Заполните название, цену, GE, статус и обязательную HTTPS-ссылку на конкретное объявление FunPay.
4. Добавьте главное изображение и, при необходимости, дополнительные. Новые изображения можно перетащить на область загрузки; порядок дополнительных — менять drag-and-drop.
5. Нажмите **Создать товар**.

Статусы:

- `available` — виден в каталоге и доступен для покупки;
- `sold` — виден как проданный, переход на покупку отключён;
- `hidden` — не отдаётся публичному API и не показывается посетителям.

На странице редактирования можно поменять все поля, статус, FunPay URL, главное изображение, удалять и менять порядок дополнительных изображений. Удаление товара требует подтверждения и удаляет его файлы из Storage.

## Внутренняя экономика

В форме товара есть закрываемый по умолчанию блок «Внутренняя финансовая информация»:

- себестоимость USD и RUB;
- внутренняя цена продажи;
- вручную заданная комиссия площадки;
- автоматически рассчитанная прибыль в RUB.

Прибыль рассчитывается только если задана себестоимость в RUB. Если поле отсутствует, аналитика честно показывает «Нет данных», а не подставляет курс или комиссию. Значения доступны исключительно в админке.

## 10. Публикация на GitHub Pages

1. Создайте новый репозиторий на GitHub.
2. В папке проекта выполните:

```bash
git init
git add .
git commit -m "Initial ocekyWT storefront"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

3. В GitHub откройте **Settings → Secrets and variables → Actions → New repository secret** и создайте:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Откройте **Settings → Pages** и в **Build and deployment → Source** выберите **GitHub Actions**.
5. Откройте вкладку **Actions**. Workflow **Deploy ocekyWT to GitHub Pages** запустится после push в `main`.
6. После успешного job GitHub покажет адрес вида `https://USERNAME.github.io/REPOSITORY/`.

Workflow сам передаёт `VITE_BASE_PATH=/<имя-репозитория>/`, поэтому Vite и React Router корректно работают не в корне домена. Он также копирует `index.html` в `404.html`: это позволяет открывать и обновлять прямые ссылки вроде `/REPOSITORY/product/<uuid>` на GitHub Pages.

### Если используется custom domain

Для custom domain измените в `.github/workflows/deploy.yml` значение `VITE_BASE_PATH` с `/${{ github.event.repository.name }}/` на `/`, закоммитьте изменение и дождитесь нового deployment.

## Проверка после deployment

Проверьте:

1. `/` — hero, статистика и последние поступления;
2. `/catalog` — поиск, фильтры, сортировка, переход по страницам;
3. `/product/<id>` — галерея, характеристики и кнопка FunPay;
4. `/admin/login` — вход разрешённого администратора;
5. `/admin` — суммы и статусы;
6. `/admin/products/new` — создание, загрузка файлов, валидация HTTPS;
7. `/admin/products/<id>/edit` — изменения, статус, сортировка/удаление изображений;
8. `/admin/analytics` — приватные показатели;
9. кнопка выхода и переход неавторизованного пользователя на `/admin/login`.

Для полной ручной проверки нужны ваши Supabase URL/key и созданный администратор; проект не содержит и не должен содержать эти credentials.

## Обновление и изменение дизайна

- Визуальные переменные и компоненты: `src/index.css`, `tailwind.config.ts`, `src/components/`.
- Поля товара: `src/types/database.ts`, формы в `src/components/admin/ProductForm.tsx`, затем SQL migration в Supabase.
- Публичные запросы: `src/lib/products.ts` и безопасный view в `supabase/schema.sql`.
- Изменения SQL после первого запуска вносите отдельными migration queries в Supabase SQL Editor; не выполняйте старый schema-файл вслепую над продакшен-базой, если меняете структуру вручную.

Обычный цикл обновления:

```bash
npm install
npm run build
npm run lint
git add .
git commit -m "Describe update"
git push
```

Push в `main` автоматически публикует новую версию.
