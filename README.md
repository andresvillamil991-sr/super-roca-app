# Súper Roca App

App web privada para pedidos, vendedores, clientes, rutas, conductores, abonos, comisiones y reportes.

## Tecnología
- Next.js
- Supabase/PostgreSQL
- Usuarios por rol
- Reportes diarios y mensuales
- PDF para cortes

## Pasos para publicar
1. Crear proyecto en Supabase.
2. Abrir SQL Editor y ejecutar `database/schema.sql`.
3. Crear proyecto en Vercel.
4. Agregar variables de entorno de `.env.example`.
5. Subir este proyecto a GitHub y conectarlo con Vercel.
6. Crear usuarios desde Supabase Auth y asignar rol en la tabla `profiles`.

## Roles
- Administrador
- Vendedor
- Facturación y despacho
- Conductor

## Reglas principales
- El vendedor puede subir precio, pero no bajar del precio base.
- Comisiones: $200 por unidad, solo pedidos ENTREGADOS.
- Pedidos anulados/devueltos no suman comisión.
- Conductores tienen corte del día con efectivo, bancos, mixto, crédito y abonos.
