# Tâches fonctionnelles restantes — Pages Paiement & Responsable de club (Pages 10–14)

Ce document rassemble, par page, les éléments fonctionnels qui restent à rectifier, implémenter ou synchroniser pour les pages listées par le product owner (Pages 10..14 et pages de paiement associées). Il met aussi en évidence les dépendances backend, endpoints et priorités.

---

## Checklist d'approche (à lire en premier)
- [ ] Valider les endpoints API backend requis et les tester (mock + e2e rapide).
- [ ] Corriger la structure des templates Angular (utiliser *ngIf/*ngFor, async pipe, OnPush si possible).
- [ ] Lier les composants UI (cards, tables, forms) aux services (club.service, payment.service, club-manager.service).
- [ ] Implémenter gestion d'erreurs & états (loading, empty, error) pour chaque vue.
- [ ] Ajouter tests unitaires basiques (composant + service) et un test d'intégration minimal pour paiements.

---

## PAGE 10 — `Mes paiements` (URL: `/my-payments`)
Objectif : affichage des stats, historique paiements, abonnements actifs, moyens de paiement.

Points fonctionnels à vérifier / implémenter :
- Composants UI
  - `PaymentsSummaryCards` (4 cartes) : recevoir les valeurs depuis `paymentService.getSummary()`.
  - `PaymentsTabs` : onglets (Historique, Abonnements, Moyens de paiement) avec émission d'événements pour rechargement.
  - `PaymentsTable` : table paginée (20/liste) avec filtres période & type.
  - `PaymentMethodsList` : CRUD cartes (set default, delete, add) via Stripe Customer APIs.
- Backend / Endpoints
  - GET `/api/payments?period=&type=&page=&limit=` (pagination + total)
  - GET `/api/payments/summary` (totaux mois/année, abonnements actifs, prochain paiement)
  - POST `/api/payments/export` (CSV export)
  - POST `/api/payments/:id/refund` (initier remboursement) — vérif règles d'éligibilité
  - GET/POST endpoints pour cartes : `/api/payment-methods` (list, create, set-default, delete)
- Logique
  - Filtrage côté serveur (période/type)
  - Permissions : l'utilisateur ne doit voir que ses paiements
  - Téléchargement reçu : endpoint `/api/payments/:id/receipt` (PDF)
  - Actions optimistes & rechargement après action (annuler abonnement, rembourser)
- Tests / QA
  - Test rendu table + filtres + pagination
  - Test export CSV (mock)

Priorité : haute (surtout export, refund, et sécurité des méthodes de paiement).

---

## PAGE 11 — `Page de paiement` (URL: `/checkout/:type/:id`)
Objectif : UX paiement sécurisé (Stripe/PayPal), choix méthode, récapitulatif commande.

Points fonctionnels à vérifier / implémenter :
- Intégration Stripe
  - Stripe Elements pour carte (ou redirection vers Checkout selon flux choisi)
  - Backend endpoints pour PaymentIntent / Checkout Session :
    - POST `/api/checkout/create-payment-intent` (event)
    - POST `/api/checkout/create-subscription` (membership)
    - Webhooks Stripe → `/api/webhooks/stripe`
- Flow frontend
  - Pré-remplissage facturation (user profile)
  - Option cartes enregistrées (liste depuis `/api/payment-methods`)
  - Gestion 3D Secure (confirmation côté client via stripe.js)
  - Handling des erreurs Stripe et affichage clair
- Récapitulatif commande (colonne droite)
  - Calcs (sous-total, réductions membre, taxes, total)
  - Bouton `Payer X€` désactivé si CGV non coché
- Tests
  - Simulation d'un PaymentIntent réussi/échoué (mock stripe)

Priorité : critique (flux de paiement central).

---

## PAGE 12 — `Dashboard responsable` (URL: `/club-manager/dashboard`)
Objectif : vue d'ensemble, actions rapides, graphes revenus, demandes en attente.

Points fonctionnels :
- Données à exposer
  - `clubManagerService.getOverview(clubId)` renvoyant : membres total, nouveaux ce mois, en attente, événements à venir, revenus, taux participation, top events
  - Graphs sur 6 mois (`/api/club/:id/stats?months=6`)
- UI / actions
  - `QuickActions` (create event, publier annonce, approuver membres) → triggers + navigation
  - `PendingRequestsList` : accept/refuse actions appellent `/api/club/:id/members/approve` et `/reject`
  - Indicateurs en temps réel si possible (SSE / websocket) pour demandes en attente
- Sécurité
  - Guard: `club-manager.guard.ts` et vérification que user est responsable du club
- Tests
  - Composant dashboard render + approve/reject flows

Priorité : élevée (dépend de la partie membres et paiements).

---

## PAGE 13 — `Gérer mon club` (URL: `/club-manager/my-club`)
Objectif : édition profil club, tarification, paramètres.

Points fonctionnels :
- Upload images (logo, cover) ⇒ endpoints `/api/uploads` ou storage (S3)
- Sauvegarde des sections (general, pricing, settings) : PUT `/api/club/:id` avec validation backend
- Tarification
  - Si payant : création/édition des plans (monthly/annual) et link vers Stripe (prod/test)
  - Calcul économie affichée (client-side)
- Paramètres d'adhésion
  - Mode approbation vs auto : impacts sur members workflow (backend)
- Tests
  - Form submit success + error handling

Priorité : moyenne-haute.

---

## PAGE 14 — `Gérer les membres` (URL: `/club-manager/members`)
Objectif : gestion membres actifs, demandes en attente, historique.

Points fonctionnels :
- Membres actifs
  - Table avec actions (voir profil, suspendre, promouvoir, retirer)
  - Actions en masse (export CSV, message groupé)
  - Endpoint : GET `/api/club/:id/members` avec filtres & pagination
  - Endpoints actions : POST `/api/club/:id/members/:memberId/promote`, `/suspend`, `/remove`
- Demandes en attente
  - List cards + Accept/Reject endpoints
  - Workflow accept -> si paiement requis, create subscription/charge and notify
- Historique
  - Endpoint d'historique d'actions : GET `/api/club/:id/activity` (filtrable)
- Synchronisation
  - S'assurer que les actions (approve/reject) renvoient l'état mis à jour et provoquent refresh côté client
  - Verifier notifications (email) sont déclenchées par backend (webhook ou internal)
- Tests
  - approve/reject unit + e2e minimal

Priorité : critique (contrôle d'accès au club).

---

## Dépendances backend clés à vérifier
- Webhooks Stripe (confidentialité & sécurité)
- Endpoints payments list/summary/export/refund
- Endpoints members approve/reject/promote/suspend
- Storage pour uploads (logo/cover)
- Permissions & Guards

---

## Qualité / Tests / Accessibilité
- Ajouter états loading / empty / error pour chaque vue
- Tests unitaires pour chaque composant majeur (summary cards, payments table, checkout form)
- Tests d'intégration pour le flux d'abonnement / paiement (utiliser mocks Stripe)
- Vérifier contrastes, labels, keyboard navigation sur formulaires

---

## Priorités proposées (raccourci)
1. Implémenter et sécuriser le flux de paiement (PAGE 11). (critique)
2. API paiements & historique + export + remboursement (PAGE 10). (haut)
3. Approve/Reject members & workflow abonnements (PAGE 14). (critique)
4. Dashboard responsable — données + actions rapides + SSE (PAGE 12). (haut)
5. Gérer mon club — uploads & tarification Stripe (PAGE 13). (moyen)

---

## Fichiers frontend à ouvrir / vérifier en priorité
- `frontend/src/app/.../services/payment.service.ts`
- `frontend/src/app/.../services/club-manager.service.ts`
- `frontend/src/app/features/club-manager/*` (composants dashboard, members, my-club, checkout)
- `frontend/src/app/Core/interceptors/auth.interceptor.ts` (headers pour API)
- `frontend/src/environments/environment.ts` (keys Stripe en dev)

---

## Notes finales
- Si vous voulez, je peux :
  - 1) générer les squelettes de composants Angular (checkout, payments-table, payments-summary, members-requests) et les tests correspondants,
  - 2) écrire les appels API typescript pour les endpoints listés (avec modèles d'interface),
  - 3) proposer le markup HTML+CSS moderne (2x2 cards ou 4 en ligne) pour les summaries et le header du dashboard.

Indiquez si vous préférez que je commence par le flux de paiement (PAGE 11) ou par l'interface `Mes paiements` (PAGE 10).

