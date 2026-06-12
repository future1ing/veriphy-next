# 🌿 Veriphy — Next.js on Vercel

## Stack
- **Next.js 14** (App Router) — frontend + API routes
- **Supabase** — PostgreSQL + Auth + Row Level Security
- **Stripe** — abonnements récurrents
- **Resend** — emails transactionnels
- **Twilio** — WhatsApp + SMS
- **Vercel** — hébergement + cron jobs

## Démarrage en 4 étapes

### 1. Supabase
1. Créer un projet sur [supabase.com](https://supabase.com)
2. SQL Editor → coller et exécuter `lib/supabase/schema.sql`
3. Copier `NEXT_PUBLIC_SUPABASE_URL` et les clés API

### 2. Variables d'environnement
```bash
cp .env.example .env.local
# Remplir toutes les variables
```

### 3. Développement local
```bash
npm install
npm run dev
# → http://localhost:3000
```

### 4. Déploiement Vercel
```bash
# Via GitHub (recommandé)
git init && git add . && git commit -m "init"
# Pousser sur GitHub → connecter sur vercel.com → importer

# Ou via CLI
npx vercel --prod
```

Puis dans Vercel Dashboard :
- Settings → Environment Variables → ajouter toutes les vars de `.env.example`
- Settings → Domains → ajouter `veriphy.app`

## Structure du projet

```
veriphy-next/
├── app/
│   ├── page.tsx                    # Redirect → login ou dashboard
│   ├── login/page.tsx              # Page de connexion (4 langues)
│   ├── dashboard/
│   │   ├── layout.tsx              # Auth guard + sidebar client
│   │   ├── page.tsx                # Dashboard client
│   │   ├── alerts/page.tsx         # Alertes filtrables
│   │   ├── profile/page.tsx        # Profil + cultures + notifs
│   │   └── pricing/page.tsx        # Plans tarifaires + Stripe
│   ├── admin/
│   │   ├── layout.tsx              # Auth guard admin
│   │   ├── page.tsx                # Dashboard admin (stats réelles)
│   │   ├── clients/page.tsx        # Gestion clients
│   │   ├── databases/page.tsx      # Explorer bases EU/MA/ES
│   │   ├── stats/page.tsx          # Statistiques & MRR
│   │   └── pipeline/page.tsx       # Lancer diff engine
│   └── api/
│       ├── alerts/route.ts         # CRUD alertes avec plan limits
│       ├── stripe/
│       │   ├── checkout/route.ts   # Créer session paiement
│       │   └── webhook/route.ts    # Gérer événements Stripe
│       └── cron/pipeline/route.ts  # Pipeline mensuel auto
├── components/
│   └── layout/Sidebar.tsx          # Sidebar partagée client/admin
├── lib/
│   └── supabase/
│       ├── client.ts               # Client navigateur
│       ├── server.ts               # Client serveur + admin
│       └── schema.sql              # Schéma base de données
├── types/index.ts                  # Types TypeScript + plans + limites
├── vercel.json                     # Cron jobs config
└── .env.example                    # Variables d'environnement
```

## Créer le compte admin
Dans Supabase SQL Editor :
```sql
-- Après inscription normale, promouvoir en admin
UPDATE profiles SET role = 'admin' WHERE email = 'admin@veriphy.app';
```

## Configurer Stripe
1. Créer les produits dans Stripe Dashboard :
   - Starter: 39€/mois récurrent
   - Pro: 99€/mois récurrent
   - Business: 249€/mois récurrent
2. Copier les Price IDs dans les variables d'environnement
3. Configurer le webhook Stripe → `https://veriphy.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Cron job mensuel
Configuré dans `vercel.json` — se déclenche le 1er de chaque mois à 6h UTC.
Déclenche le pipeline diff EU + notifications clients.

## Ajouter les bases de données (MA/ES/EU)
Les données JSON des bases parsées (eu_mrl_agent_db.json, etc.) peuvent être :
1. Stockées dans Supabase Storage (recommandé pour prod)
2. Ou intégrées directement dans la page `/admin/databases`
