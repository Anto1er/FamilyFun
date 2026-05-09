# Guide de Configuration Supabase

## 1. Creer un compte Supabase

1. Va sur [supabase.com](https://supabase.com) et cree un compte gratuit
2. Clique sur "New Project"
3. Choisis un nom (ex: "familyfun"), un mot de passe pour la base de donnees, et une region proche de toi
4. Attends que le projet soit provisionne (~2 minutes)

## 2. Recuperer les cles

1. Dans le dashboard Supabase, va dans **Settings > API**
2. Copie :
   - **Project URL** (ex: `https://abcdefg.supabase.co`)
   - **anon public key** (commence par `eyJ...`)

## 3. Configurer le projet local

```bash
cp .env.example .env
```

Edite le fichier `.env` :
```
EXPO_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ta-cle-anon-ici
```

## 4. Executer les migrations

### Option A : Via le Dashboard (plus simple)

1. Va dans **SQL Editor** dans le dashboard Supabase
2. Execute chaque fichier de `supabase/migrations/` dans l'ordre (00001 a 00008)
3. Copie-colle le contenu de chaque fichier et clique "Run"

### Option B : Via la CLI Supabase

```bash
# Installer la CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref TON_PROJECT_REF

# Executer les migrations
supabase db push
```

Le `project-ref` se trouve dans Settings > General > Reference ID.

## 5. Configurer l'Authentification

1. Va dans **Authentication > Providers**
2. Assure-toi que "Email" est active
3. Pour le developpement, desactive "Confirm email" dans **Authentication > Settings** (Email section)

## 6. Activer le Realtime

1. Va dans **Database > Replication**
2. Active la replication pour les tables :
   - `missions`
   - `gifts`
   - `mission_submissions`
   - `notifications`
   - `profiles`

## 7. Lancer l'application

```bash
npm start
```

Scanne le QR code avec Expo Go (iOS/Android) ou lance un simulateur.

## Structure de la Base de Donnees

| Table | Description |
|-------|-------------|
| `profiles` | Utilisateurs (parents et enfants) |
| `families` | Familles avec code d'invitation |
| `missions` | Missions/taches creees par les parents |
| `mission_submissions` | Soumissions de missions par les enfants |
| `gifts` | Cadeaux dans la liste de souhaits |
| `transactions` | Historique des points (gagnes/depenses) |
| `notifications` | Notifications in-app |

## Depannage

- **Erreur RLS** : Verifie que les politiques RLS sont bien appliquees (migration 00008)
- **Auth non fonctionnelle** : Verifie que les cles dans `.env` sont correctes
- **Realtime ne fonctionne pas** : Verifie que la replication est activee pour les tables concernees
