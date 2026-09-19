-- Safe demo catalog data. These are fictional examples, not real accounts or credentials.
-- Run schema.sql first. Image URLs are intentionally NULL: upload test images in the admin panel.

insert into public.products (
  slug, title, description, price, currency, gold, rank, nations, vehicles,
  premium_vehicles, battle_count, badge, status, funpay_url
) values
(
  'test-nations-mix-001',
  '[ТЕСТ] Nations Mix',
  'Тестовая запись для проверки каталога. Реальных данных аккаунта здесь нет.',
  1250, 'RUB', 2500, 5, array['СССР', 'Германия'], array['T-34-85', 'Panther A'],
  array['Тестовая премиум-техника'], 420, 'NEW', 'available', 'https://funpay.com/'
),
(
  'test-aviation-002',
  '[ТЕСТ] Aviation Collection',
  'Безопасный демонстрационный товар для проверки фильтров и карточек.',
  2150, 'RUB', 5000, 6, array['США'], array['P-51D-30', 'F-86F-2'],
  array[]::text[], 960, 'TOP', 'available', 'https://funpay.com/'
),
(
  'test-sold-003',
  '[ТЕСТ] Sold Account',
  'Демонстрационная проданная позиция. Кнопка покупки должна быть отключена.',
  990, 'RUB', 1200, 4, array['Великобритания'], array['Spitfire Mk IX'],
  array[]::text[], 180, 'SALE', 'sold', 'https://funpay.com/'
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  price = excluded.price,
  currency = excluded.currency,
  gold = excluded.gold,
  rank = excluded.rank,
  nations = excluded.nations,
  vehicles = excluded.vehicles,
  premium_vehicles = excluded.premium_vehicles,
  battle_count = excluded.battle_count,
  badge = excluded.badge,
  status = excluded.status,
  funpay_url = excluded.funpay_url;
