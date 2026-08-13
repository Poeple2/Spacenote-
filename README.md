# SpaceNotes

Application React/Vite connectée à Supabase pour l'authentification et la sauvegarde des notes.

## Installation

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Copier `.env.example` vers `.env.local` et remplacer les deux valeurs par celles du projet Supabase :

   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_publiable
   ```

   Ces valeurs se trouvent dans Supabase : **Project Settings > API**. Ne jamais placer la clé `service_role` dans cette application.

3. Dans le **SQL Editor** de Supabase, exécuter le fichier `supabase/notes.sql` une seule fois.

4. Démarrer l'application :

   ```bash
   npm run dev
   ```

## Fonctionnalités Supabase intégrées

- inscription et connexion par e-mail/mot de passe ;
- session conservée après le rechargement de la page ;
- chargement des notes appartenant à l'utilisateur connecté ;
- création et modification avec enregistrement automatique ;
- suppression d'une note ;
- protection des données par Row Level Security (RLS).

Le fichier `.env.local` est volontairement ignoré par Git et n'est pas inclus dans les archives de livraison.
