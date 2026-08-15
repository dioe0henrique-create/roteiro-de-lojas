# Roteiro de Lojas — Primavera Tur

App em React + Supabase para lojistas explorarem as 336 marcas dos 3 shoppings
do polo atacadista do Parana (Master Cianorte, Parana Moda Park e Vest Sul).

## Rodar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

## Deploy (Vercel)

Importar este repositorio na Vercel e definir as variaveis de ambiente:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Tornar alguem admin

No Supabase: Table Editor > tabela perfis > trocar a coluna papel de lojista para admin.
