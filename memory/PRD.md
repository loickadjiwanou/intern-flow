# InternFlow - CRM de Gestion de Stagiaires

## Description du Projet
Application full-stack de gestion de stagiaires pour entreprise. Interface CRM professionnelle permettant de suivre, évaluer et accompagner les stagiaires tout au long de leur parcours.

## Stack Technique
- **Frontend**: React, Vite, TailwindCSS, shadcn/ui, React Router, React Hook Form, Zod
- **Backend**: Node.js, Express.js, MongoDB avec Mongoose, JWT
- **UI/UX**: Design bleu professionnel, support dark/light mode, multilingue (FR/EN)

## Fonctionnalités Implémentées

### Session du 18 Mars 2026 - P0 (Critiques)
- [x] **Recherche globale fonctionnelle** - Barre de recherche dans le header avec résultats en temps réel
- [x] **Page de détail stagiaire** - Affichage complet avec onglets (Vue d'ensemble, Tâches, Documents, Évaluations)
- [x] **Formulaire d'ajout/édition stagiaire** - Formulaire complet avec validation Zod
- [x] **Corrections dark mode** - Toutes les pages principales corrigées (Interns, Tasks, Evaluations, Reports, Analytics, AuditLogs)

### Fonctionnalités de Base (Sessions Précédentes)
- [x] Authentification JWT (Login/Register)
- [x] Dashboard avec statistiques et graphiques
- [x] Liste des stagiaires avec filtres
- [x] Page Tâches avec vue Kanban
- [x] Page Recrutement (Pipeline ATS)
- [x] Page Évaluations
- [x] Page Rapports
- [x] Page Documents
- [x] Page Messages
- [x] Calendrier interactif (react-big-calendar)
- [x] Page Analytics
- [x] Page Audit Logs
- [x] Page Paramètres
- [x] Système multilingue (FR/EN)
- [x] Mode sombre/clair

## Backlog P1 (À Venir)
- [ ] Améliorations UI (drag-and-drop documents, plus de graphiques Analytics)
- [ ] WebSockets - Notifications temps réel pour chat et actions
- [ ] Gestion des rôles (RBAC) - Interface admin pour gérer les rôles utilisateurs
- [ ] Audit Logs complet (enregistrement backend)

## Backlog P2 (Futur)
- [ ] Refactorisation emails (templates backend professionnels FR/EN)
- [ ] Supprimer page de sélection langue initiale
- [ ] Statistiques Analytics avancées
- [ ] Génération PDF (attestations, certificats)
- [ ] Règles d'automatisation
- [ ] Chat interne temps réel
- [ ] Export CSV/Excel

## Architecture des Fichiers Clés

```
/app
├── backend/
│   ├── routes/
│   │   ├── search.js (NEW - recherche globale)
│   │   ├── interns.js
│   │   ├── auth.js, tasks.js, evaluations.js...
│   └── server.js
└── frontend/src/
    ├── pages/
    │   ├── InternDetail.jsx (NEW)
    │   ├── InternForm.jsx (NEW)
    │   ├── Dashboard.jsx, Interns.jsx, Tasks.jsx...
    ├── components/layout/
    │   ├── Header.jsx (mise à jour - recherche fonctionnelle)
    └── services/api.js (mise à jour - searchAPI)
```

## Compte de Test
- Email: admin@internflow.com
- Password: admin123

## URL de Prévisualisation
https://rbac-admin-panel.preview.emergentagent.com
