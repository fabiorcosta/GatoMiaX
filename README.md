# GatoMiaX — Backoffice Inteligente

> Plataforma administrativa para gestão de eventos e recreação infantil.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Animações**: Motion (framer-motion)
- **Gráficos**: Recharts
- **Backend**: Firebase (Firestore + Auth)
- **Deploy**: Vercel

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar Firebase
cp .env.example .env.local
# Preencha com as credenciais do seu projeto Firebase

# 3. Rodar em desenvolvimento
npm run dev
```

## Estrutura

```
src/
├── components/       # Componentes reutilizáveis
│   ├── layout/       # Sidebar, MainLayout
│   ├── ui/           # Button, Card, Input, Badge
│   └── shared/       # StatCard, StatusBadge
├── pages/            # Telas (1 por tab)
│   ├── Dashboard.tsx
│   ├── FunilVendas.tsx
│   ├── NovoEvento.tsx
│   ├── Servicos.tsx
│   └── Equipe.tsx
├── hooks/            # Custom hooks (useEventos, etc.)
├── lib/              # Firebase config, utils, constants
├── types/            # TypeScript types
├── App.tsx           # Router
└── index.css         # Design System
```
