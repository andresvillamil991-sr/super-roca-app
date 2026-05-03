create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('administrador','vendedor','facturacion_despacho','conductor')),
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists products (
  id bigserial primary key,
  name text not null,
  base_price numeric(12,2) not null check (base_price >= 0),
  presentation text,
  photo_url text,
  active boolean default true,
  created_at timestamptz default now()
);

insert into products (name, base_price, presentation) values
('Roca gris x 25 kg', 7800, '25 kg'),
('Porcelanato gris x 25 kg', 11000, '25 kg'),
('Porcelanato reforzado x 25 kg', 14000, '25 kg'),
('Pegante especial x 25 kg', 25000, '25 kg'),
('Cemento gris x 50 kg', 29000, '50 kg'),
('Gravilla mona #2', 8000, 'Unidad')
on conflict do nothing;

create table if not exists sellers (
  id bigserial primary key,
  name text not null,
  active boolean default true
);

insert into sellers (name) values
('Hernando Ayala'),('Angela María'),('Andrés Villamil'),('Súper roca'),('Edward Páramo')
on conflict do nothing;

create table if not exists drivers (
  id bigserial primary key,
  name text not null,
  phone text,
  plate text not null,
  active boolean default true
);

create table if not exists customers (
  id bigserial primary key,
  business_name text not null,
  contact_name text,
  phone text,
  document_number text,
  address text,
  city text,
  zone text,
  seller_id bigint references sellers(id),
  notes text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists orders (
  id bigserial primary key,
  order_date date default current_date,
  seller_id bigint references sellers(id),
  customer_id bigint references customers(id),
  product_id bigint references products(id),
  quantity integer not null check (quantity > 0),
  base_price numeric(12,2) not null,
  sale_price numeric(12,2) not null,
  total numeric(14,2) generated always as (quantity * sale_price) stored,
  delivery_type text,
  status text not null default 'pendiente' check (status in ('pendiente','en_ruta','entregado','devuelto','anulado')),
  driver_id bigint references drivers(id),
  plate text,
  route text,
  payment_method text check (payment_method in ('efectivo','bancos','mixto','credito') or payment_method is null),
  driver_note text,
  internal_note text,
  delivered_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  constraint sale_price_not_below_base check (sale_price >= base_price)
);

create table if not exists invoice_payments (
  id bigserial primary key,
  payment_date date default current_date,
  customer_id bigint references customers(id),
  driver_id bigint references drivers(id),
  invoice_number text not null,
  invoice_value numeric(14,2),
  paid_value numeric(14,2) not null check (paid_value > 0),
  payment_method text not null check (payment_method in ('efectivo','bancos','mixto','credito')),
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists daily_closures (
  id bigserial primary key,
  closure_date date default current_date,
  driver_id bigint references drivers(id),
  closed_by uuid references profiles(id),
  total_cash numeric(14,2) default 0,
  total_banks numeric(14,2) default 0,
  total_mixed numeric(14,2) default 0,
  total_credit numeric(14,2) default 0,
  total_bags integer default 0,
  total_sales numeric(14,2) default 0,
  pdf_url text,
  closed_at timestamptz default now(),
  unique (closure_date, driver_id)
);

alter table profiles enable row level security;
alter table products enable row level security;
alter table sellers enable row level security;
alter table drivers enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table invoice_payments enable row level security;
alter table daily_closures enable row level security;

-- Políticas base para iniciar pruebas. Ajustar antes de producción final.
create policy "authenticated read products" on products for select to authenticated using (true);
create policy "authenticated read sellers" on sellers for select to authenticated using (true);
create policy "authenticated read drivers" on drivers for select to authenticated using (true);
create policy "authenticated read customers" on customers for select to authenticated using (true);
create policy "authenticated read orders" on orders for select to authenticated using (true);
create policy "authenticated read payments" on invoice_payments for select to authenticated using (true);

create policy "authenticated insert orders" on orders for insert to authenticated with check (true);
create policy "authenticated update orders" on orders for update to authenticated using (true) with check (true);
create policy "authenticated insert payments" on invoice_payments for insert to authenticated with check (true);
