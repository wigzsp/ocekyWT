-- ocekyWT database schema
-- Run this file in Supabase Dashboard → SQL Editor as the project owner.
-- It is safe to run on a new project; review DROP POLICY statements when updating a live project.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text,
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'RUB' check (currency in ('RUB', 'USD', 'EUR')),
  gold integer not null default 0 check (gold >= 0),
  rank integer check (rank is null or rank between 1 and 8),
  nations text[] not null default '{}',
  vehicles text[] not null default '{}',
  premium_vehicles text[] not null default '{}',
  battle_count integer check (battle_count is null or battle_count >= 0),
  badge text check (badge is null or badge in ('NEW', 'SALE', 'TOP')),
  status text not null default 'available' check (status in ('available', 'sold', 'hidden')),
  funpay_url text not null check (funpay_url ~ '^https://'),
  main_image_url text,
  -- Private operational fields. These are intentionally omitted from catalog_products.
  cost_usd numeric(12, 2) check (cost_usd is null or cost_usd >= 0),
  cost_rub numeric(12, 2) check (cost_rub is null or cost_rub >= 0),
  sale_price numeric(12, 2) check (sale_price is null or sale_price >= 0),
  platform_fee numeric(5, 2) check (platform_fee is null or platform_fee between 0 and 100),
  profit numeric(12, 2) generated always as (
    case
      when cost_rub is null then null
      else round((coalesce(sale_price, price) * (1 - coalesce(platform_fee, 0) / 100.0)) - cost_rub, 2)
    end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create index if not exists products_public_catalog_idx on public.products (status, created_at desc);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_rank_idx on public.products (rank);
create index if not exists products_nations_gin_idx on public.products using gin (nations);
create index if not exists product_images_product_sort_idx on public.product_images (product_id, sort_order);
create index if not exists admin_users_user_id_idx on public.admin_users (user_id);

-- Makes a unique stable slug without requiring the admin to type one.
create or replace function public.set_product_slug()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  base_slug text;
begin
  if new.slug is null or btrim(new.slug) = '' then
    base_slug := lower(regexp_replace(btrim(new.title), '[^[:alnum:]]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    if base_slug = '' then base_slug := 'account'; end if;
    new.slug := base_slug || '-' || substr(new.id::text, 1, 8);
  end if;
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_slug on public.products;
create trigger products_set_slug before insert on public.products
for each row execute function public.set_product_slug();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

-- SECURITY DEFINER is deliberate: it can safely check the caller without granting
-- public SELECT access to the roster of administrator accounts.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- This helper prevents direct image rows for hidden products being listed publicly.
create or replace function public.is_public_product(target_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.products
    where id = target_product_id and status in ('available', 'sold')
  );
$$;

-- Public view: the only product source the storefront uses. Do not add private
-- accounting fields to it. The view owner has access to the base table; filters
-- below make hidden products and financial information unreachable to visitors.
create or replace view public.catalog_products
with (security_invoker = false)
as
select
  p.id, p.slug, p.title, p.description, p.price, p.currency, p.gold, p.rank,
  p.nations, p.vehicles, p.premium_vehicles, p.battle_count, p.badge, p.status,
  p.funpay_url, p.main_image_url, p.created_at, p.updated_at,
  lower(concat_ws(' ', p.title, coalesce(p.description, ''), array_to_string(p.vehicles, ' '), array_to_string(p.premium_vehicles, ' '), array_to_string(p.nations, ' '))) as search_text
from public.products p
where p.status in ('available', 'sold');

-- Small public aggregate used on the home page. It never exposes a private row.
create or replace function public.public_catalog_stats()
returns table(available_count bigint, sold_count bigint, catalog_gold bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) filter (where status = 'available'),
    count(*) filter (where status = 'sold'),
    coalesce(sum(gold) filter (where status = 'available'), 0)
  from public.products
  where status in ('available', 'sold');
$$;

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public reads published product images" on public.product_images;
create policy "Public reads published product images"
on public.product_images for select to anon, authenticated
using (public.is_public_product(product_id));

drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images"
on public.product_images for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can inspect admin users" on public.admin_users;
create policy "Admins can inspect admin users"
on public.admin_users for select to authenticated
using (public.is_admin());

-- The dashboard owner creates the first row in admin_users through SQL Editor.
-- There is deliberately no client-side INSERT policy for admin_users.
revoke all on table public.products from anon;
revoke all on table public.admin_users from anon;
grant select, insert, update, delete on table public.products to authenticated;
grant select, insert, update, delete on table public.product_images to authenticated;
grant select on table public.product_images to anon;
grant select on table public.admin_users to authenticated;
grant select on public.catalog_products to anon, authenticated;

revoke all on function public.is_admin() from public;
revoke all on function public.is_public_product(uuid) from public;
revoke all on function public.public_catalog_stats() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_public_product(uuid) to anon, authenticated;
grant execute on function public.public_catalog_stats() to anon, authenticated;

-- After creating an Email/Password user in Authentication → Users, run:
-- insert into public.admin_users (user_id)
-- values ('PASTE_AUTH_USER_UUID_HERE');
