-- ==========================================================
-- SCHEMA SUPABASE PARA SALÓN & NAILS (Yamina, Katya, Gisel)
-- ==========================================================
-- Ejecutá todo este script en: Supabase -> SQL Editor -> New query -> Run

-- 1. TABLA DE CLIENTAS
create table if not exists public.clientes (
  id text primary key default ('c_' || floor(extract(epoch from now()) * 1000)::text),
  nombre text not null,
  telefono text,
  cumpleanos date,
  alerta_capilar text,
  observaciones text,
  created_at timestamp with time zone default now()
);

-- 2. TABLA DE ATENCIONES DE PELUQUERÍA / HISTORIA CLÍNICA CAPILAR (Yamina)
create table if not exists public.visitas_pelo (
  id bigint primary key default floor(extract(epoch from now()) * 1000)::bigint,
  cliente_id text references public.clientes(id) on delete set null,
  cliente_nombre text,
  fecha date default current_date not null,
  servicio text not null, -- 'Tintura', 'Mechas / Reflejos', 'Hidratación / Botox', etc.
  formula text,          -- Detalle técnico de gramos, tintes, oxidantes y decolorante
  total numeric not null default 0,
  pago text default 'Efectivo',
  created_at timestamp with time zone default now()
);

-- 3. TABLA DE TURNOS Y FICHAS DE UÑAS (Katya y Gisel - Mesa compartida)
create table if not exists public.turnos_unas (
  id bigint primary key default floor(extract(epoch from now()) * 1000)::bigint,
  manicurista_id text not null check (manicurista_id in ('katya', 'gisel')),
  manicurista_nombre text not null,
  fecha date not null,
  hora_inicio text not null, -- '10:00'
  hora_fin text not null,    -- '11:00'
  cliente_id text references public.clientes(id) on delete set null,
  cliente_nombre text not null,
  trabajo text not null,     -- 'Semipermanente', 'Capping en acrílico', 'Soft gel', etc.
  detalle text,
  monto numeric not null default 0,
  ganancia_chica numeric generated always as (round(monto * 0.60)) stored,  -- 60% que retiene la manicurista
  comision_yamila numeric generated always as (round(monto * 0.40)) stored, -- 40% que entrega a Yamina
  pago text default 'Efectivo',
  created_at timestamp with time zone default now()
);

-- 4. TABLA DE USUARIOS Y PINES (Para cambiar PINes en la nube)
create table if not exists public.usuarios (
  usuario_key text primary key,
  nombre text not null,
  rol text not null, -- 'duena' | 'manicurista'
  icono text not null,
  color text not null,
  pin text not null
);

-- Insertar usuarios por defecto si no existen
insert into public.usuarios (usuario_key, nombre, rol, icono, color, pin)
values 
  ('yamila', 'Yamina', 'duena', '💇‍♀️', '#b84a7a', '1234'),
  ('katya', 'Katya', 'manicurista', '💅', '#c026d3', '1111'),
  ('gisel', 'Gisel', 'manicurista', '✨', '#7c3aed', '2222')
on conflict (usuario_key) do nothing;

-- 5. HABILITAR PERMISOS (Row Level Security abierto con anon key)
alter table public.clientes enable row level security;
alter table public.visitas_pelo enable row level security;
alter table public.turnos_unas enable row level security;
alter table public.usuarios enable row level security;

-- Políticas de lectura y escritura para la web
create policy "Acceso total a clientes" on public.clientes for all using (true) with check (true);
create policy "Acceso total a visitas_pelo" on public.visitas_pelo for all using (true) with check (true);
create policy "Acceso total a turnos_unas" on public.turnos_unas for all using (true) with check (true);
create policy "Acceso total a usuarios" on public.usuarios for all using (true) with check (true);

-- 6. HABILITAR TIEMPO REAL (Realtime) PARA SINCRONIZACIÓN INSTANTÁNEA
alter publication supabase_realtime add table public.clientes;
alter publication supabase_realtime add table public.visitas_pelo;
alter publication supabase_realtime add table public.turnos_unas;
alter publication supabase_realtime add table public.usuarios;

-- ==========================================================
-- ¡Listo! Ya tenés la base de datos configurada y en tiempo real.
-- ==========================================================
