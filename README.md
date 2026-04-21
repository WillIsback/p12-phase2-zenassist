# Claims Management System

## 🏗️ Tech Stack

- **Frontend**: Next.js 15.4.5 with React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Docker
- **Language**: TypeScript
- **Styling**: CSS Modules

## ⚙️ Configuration

Copier le fichier d'exemple et le remplir :

```bash
cp .example.env .env
```

### Variables d'environnement

| Variable | Requis | Description |
|---|---|---|
| `INFERENCE_MODE` | Oui | `LOCAL` pour vLLM auto-hébergé, toute autre valeur (ou absent) pour Mistral API |
| `LLM_BASE_URL` | Mode LOCAL | URL de base du serveur vLLM (ex: `http://192.168.1.100:8000/v1`) |
| `PROVIDER_API_KEY` | Mode LOCAL | Clé API du provider local (`none` si vLLM sans auth) |
| `MISTRAL_API_KEY` | Mode Mistral | Clé API Mistral ([console.mistral.ai](https://console.mistral.ai/)) |
| `DB_HOST` | Non | Hôte PostgreSQL (défaut: `localhost`) |
| `DB_PORT` | Non | Port PostgreSQL (défaut: `5555`) |
| `DB_NAME` | Non | Nom de la base (défaut: `dev_ia_p12`) |
| `DB_USER` | Non | Utilisateur PostgreSQL (défaut: `postgres`) |
| `DB_PASSWORD` | Non | Mot de passe PostgreSQL (défaut: `postgres`) |

### Modes d'inférence

**Mode LOCAL (vLLM sur réseau privé)** — Utilise un serveur vLLM auto-hébergé avec le modèle `Intel/Qwen3.5-122B-A10B-int4-AutoRound`. Nécessite `INFERENCE_MODE=LOCAL`, `LLM_BASE_URL` et optionnellement `PROVIDER_API_KEY`.

**Mode Mistral (API payante)** — Utilise `mistral-small-latest` via l'API Mistral. Nécessite `MISTRAL_API_KEY`. C'est le mode par défaut si `INFERENCE_MODE` n'est pas `LOCAL`.

## 🚀 Quick Start

### Prerequisites

- Node.js
- Docker and Docker Compose

### 1. Clone and Install

```bash
npm install
```

### 2. Configuration

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

### 3. Database Setup

```bash
# Start PostgreSQL in Docker
npm run db:start

# Seed with sample data
npm run db:reset
```

### 4. Start Development

```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── actions/           # Server Actions (classification LLM)
│   └── api/               # API endpoints
├── components/            # UI components
├── constants/             # Tags et prompts système
├── services/              # Services (LLM classification)
│   └── llm_cls.service.ts # Double mode : vLLM local / Mistral API
└── database/              # Database related code
    ├── client.ts          # PostgreSQL connection
    ├── queries.ts         # Database queries
    ├── seed.ts            # Database seeding
    └── seed-data.json     # Sample data
```

## 🛠️ Available Scripts

| Command            | Description                             |
|--------------------|-----------------------------------------|
| `npm run dev`      | Start development server with Turbopack |
| `npm run db:start` | Start PostgreSQL container              |
| `npm run db:stop`  | Stop PostgreSQL container               |
| `npm run db:reset` | Reset and seed database                 |
