# 🎓 ClubHub

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Angular](https://img.shields.io/badge/Angular-20-red.svg)
![NestJS](https://img.shields.io/badge/NestJS-11-ea2845.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**La plateforme complète pour la gestion des clubs universitaires**

*Développé par une équipe de 4 développeurs passionnés* 🚀

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Team](#-team)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [API Documentation](#-api-documentation)
- [Team](#-team)

---

## 🌟 Overview

**ClubHub** est une plateforme web moderne qui centralise la gestion des clubs universitaires. Elle permet aux administrateurs de créer et gérer des clubs, aux présidents d'organiser des événements et de gérer leurs membres, et aux étudiants de découvrir et rejoindre facilement les clubs qui les intéressent.

### 🎯 Objectifs

- **Centralisation** : Toutes les activités des clubs sur une seule plateforme
- **Automatisation** :  notifications temps réel, rapports automatiques
- **Transparence** : Suivi financier et statistiques détaillées
- **Engagement** : Interface moderne et intuitive pour les étudiants

---

## ✨ Features

### 🔐 1. Authentification & Sécurité

**Système d'authentification robuste basé sur JWT :**
- Inscription avec vérification email obligatoire
- Connexion sécurisée avec tokens (Access Token 1h, Refresh Token 7j)
- Mots de passe hashés avec bcrypt (10 salt rounds)
- Système de rôles : Admin, President, RH, Member
- Protection des routes selon les rôles

**Sécurité renforcée :**
- Protection CSRF et XSS
- Validation stricte des entrées (frontend + backend)
- SQL Injection prevention avec TypeORM
- Upload de fichiers sécurisé avec validation de type et taille

---

### 🏢 2. Gestion des Clubs

**Pour les Administrateurs :**
- Création de clubs avec formulaire complet (nom, description, catégorie, cotisation)
- Upload de logo et image de couverture (max 5MB)
- Modification et suppression de clubs
- Activation/Désactivation de clubs
- Tableau de bord avec statistiques globales (total clubs, actifs, membres)
- Filtres avancés par statut, catégorie, recherche textuelle
- Tri personnalisable et pagination

**Gestion des Présidents :**
- Interface dédiée pour assigner un président à chaque club
- Sélection parmi tous les utilisateurs de la plateforme
- Changement de président en un clic
- Suppression du président actuel possible
- Mise à jour automatique des rôles dans la base de données

**Catégories de Clubs :**
- Technologie, Sport, Culture, Environnement, Social
- Chaque catégorie avec icône et couleur distinctive
- Filtrage rapide par catégorie

---

### 📅 3. Gestion des Événements

**Création d'événements complète :**
- Informations détaillées (titre, description, lieu, dates)
- Définition de la capacité maximale
- Date limite d'inscription
- Upload d'image de couverture
- Événements publics ou réservés aux membres
- Suivi en temps réel des places disponibles

**Inscriptions :**
- Inscription en ligne simple et rapide
- Rappel automatique 24h avant l'événement
- Liste des participants exportable (PDF/Excel)
- Dashboard avec taux de présence et statistiques

---

### 💰 4. Gestion Financière

**Enregistrement des Transactions :**
- Deux types : Revenus (cotisations, sponsors, subventions) et Dépenses (équipement, location, déplacements)
- Formulaire avec montant, description, catégorie, date
- Upload de pièces justificatives (reçus, factures)
- Historique complet de toutes les transactions

**Rapports Financiers Automatiques :**
- **Export PDF professionnel** avec :
  - Résumé financier (revenus totaux, dépenses totales, solde)
  - Graphiques (camembert revenus vs dépenses)
  - Tableau détaillé des transactions
  - Logo du club et période sélectionnée
- **Export Excel** pour analyse approfondie
- Graphiques interactifs avec Chart.js
- Calcul automatique des totaux et moyennes

**Tableaux de bord financiers :**
- Vue d'ensemble des finances du club
- Évolution du solde dans le temps
- Répartition des dépenses par catégorie
- KPI (Key Performance Indicators) visuels

---

### 🔔 5. Notifications en Temps Réel

**Système SSE (Server-Sent Events) :**
- Notifications instantanées sans rechargement de page
- Plus léger que WebSocket, reconnexion automatique
- Badge avec nombre de notifications non lues

**Types de Notifications :**
- **Événements** : Nouvel événement, rappel 24h avant, annulation
- **Candidatures** : Nouvelle candidature (pour Président/RH), statut de candidature (pour étudiant)
- **Paiements** : Confirmation de paiement, cotisation expirée
- **Système** : Nouveau membre, changement de rôle, annonces importantes

**Interface intuitive :**
- Centre de notifications avec liste chronologique
- Marquer comme lu individuellement ou tout d'un coup
- Clic sur notification → redirection vers la page concernée
- Son de notification (optionnel)

---

### 📝 6. Système de Candidatures

**Pour les Étudiants :**
- Formulaire de candidature détaillé pour postuler à un club
- Questions sur motivations, expériences, compétences, disponibilité
- Suivi du statut de candidature (en attente, approuvée, rejetée)
- Notifications automatiques des décisions

**Pour les Présidents/RH :**
- Dashboard des candidatures en attente
- Consultation détaillée de chaque candidature
- Approbation ou rejet en un clic
- Message personnalisé lors du rejet
- Création automatique du membership lors de l'approbation
- Historique de toutes les candidatures

---

### 💳 7. Paiements en Ligne (Stripe)

**Intégration complète de Stripe :**
- Paiement sécurisé des cotisations annuelles
- Paiement des billets d'événements payants
- Interface Stripe.js (PCI-DSS compliant)
- Webhooks pour confirmation automatique des paiements
- Support des remboursements

**Flux de Paiement :**
1. Étudiant sélectionne un club/événement payant
2. Redirection vers la page de paiement Stripe
3. Saisie sécurisée des informations de carte
4. Traitement par Stripe
5. Confirmation et activation automatique du membership/inscription
6. Email de confirmation envoyé

---

### 📧 8. Système d'Emails Automatiques

**Emails transactionnels avec templates professionnels :**
- **Vérification de compte** : Lien de vérification unique (24h)
- **Bienvenue** : Message de bienvenue personnalisé lors de l'approbation
- **Confirmation d'événement** : Détails 
- **Rappels** : Notification 24h avant l'événement
- **Candidatures** : Notification de décision (approuvée/rejetée)
- **Paiements** : Confirmation de transaction

**Configuration SMTP :**
- Support Gmail, Outlook, serveurs SMTP personnalisés
- Templates HTML responsive (mobile-friendly)
- Variables personnalisables (nom, club, date, etc.)

---

### 📊 9. Statistiques et Analytics

**Dashboard Administrateur :**
- Vue d'ensemble globale (total clubs, membres, événements)
- Statistiques par club (membres actifs, événements organisés, revenus)
- Graphiques d'évolution dans le temps
- Clubs les plus populaires (top 5)
- Taux de participation aux événements

**Dashboard Président :**
- Statistiques détaillées de son club
- Nombre de membres actifs
- Taux d'approbation des candidatures
- Revenus et dépenses
- Événements à venir et passés
- Performance des événements (taux de présence)

---

### 🎨 10. Interface Utilisateur Moderne

**Design professionnel et intuitif :**
- Design system cohérent (couleurs, typographie, spacing)
- Interface responsive (mobile, tablette, desktop)
- Animations fluides et micro-interactions
- Composants réutilisables (boutons, modals, cards, forms)
- Accessibilité WCAG 2.1 Level AA
- Navigation au clavier complète
- Dark mode support (optionnel)

**Technologies UI :**
- TailwindCSS pour le styling utility-first
- Bootstrap Icons pour les icônes
- Angular Signals pour la réactivité
- RxJS pour la programmation réactive

---

## 📸 Screenshots

### Dashboard Administrateur
![Dashboard](docs/screenshots/dashboard.png)
*Vue d'ensemble avec statistiques globales et graphiques*

### Gestion des Clubs
![Club Management](docs/screenshots/clubs-list.png)
*Liste des clubs avec filtres, recherche et actions rapides*

### Formulaire de Création de Club
![Create Club](docs/screenshots/create-club.png)
*Formulaire complet avec upload de logo et image de couverture*

### Gestion du Président
![President Management](docs/screenshots/president-modal.png)
*Interface d'assignation du président avec liste des utilisateurs*

### Création d'Événement
![Create Event](docs/screenshots/create-event.png)
*Formulaire d'événement 

### Liste des Candidatures
![Applications](docs/screenshots/applications.png)
*Dashboard des candidatures avec actions d'approbation/rejet*

### Rapport Financier PDF
![Financial Report](docs/screenshots/financial-pdf.png)
*Rapport PDF professionnel avec graphiques et tableaux*

### Notifications en Temps Réel
![Notifications](docs/screenshots/notifications.png)
*Centre de notifications avec badge en temps réel*

### Profil de Club
![Club Profile](docs/screenshots/club-profile.png)
*Page détaillée d'un club avec statistiques*

---

## 🛠 Tech Stack

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Angular** | 20 | Framework principal |
| **TypeScript** | 5.0 | Langage de programmation |
| **RxJS** | 7.x | Programmation réactive |
| **Signals** | - | Gestion d'état moderne |
| **TailwindCSS** | 3.x | Styling |
| **Bootstrap Icons** | 1.x | Icônes |
| **jsPDF** | 2.x | Génération PDF |
| **jsPDF-AutoTable** | 3.x | Tableaux PDF |
| **xlsx** | 0.18 | Export Excel |
| **Chart.js** | 4.x | Graphiques |

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **NestJS** | 11 | Framework backend |
| **TypeScript** | 5.0 | Langage |
| **TypeORM** | 0.3 | ORM |
| **MySQL** | 8.0 | Base de données |
| **Passport** | 0.7 | Authentification |
| **JWT** | 9.x | Tokens |
| **bcrypt** | 5.x | Hashage |
| **class-validator** | 0.14 | Validation |
| **Multer** | 1.x | Upload fichiers |
| **Nodemailer** | 6.x | Emails |
| **Stripe** | 14.x | Paiements |

---

## 🚀 Installation

### Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MySQL** >= 8.x

### Cloner le Repository

```bash
git clone https://github.com/your-username/clubhub.git
cd clubhub
```

### Installation Backend

```bash
cd backend
npm install
```

### Installation Frontend

```bash
cd frontend
npm install
```

---

## ⚙️ Configuration

### Backend - Fichier `.env`

Créez un fichier `.env` dans le dossier `backend` :

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DB_HOST=localhost                    # Hôte MySQL
DB_PORT=3306                         # Port MySQL
DB_USERNAME=root                     # Utilisateur MySQL
DB_PASSWORD=your_password            # ⚠️ CHANGEZ : Mot de passe MySQL
DB_DATABASE=club_management          # Nom de la base de données

# ===========================================
# APPLICATION
# ===========================================
PORT=3000                            # Port du serveur backend
NODE_ENV=development                 # Environnement
FRONTEND_URL=http://localhost:4200   # URL du frontend

# ===========================================
# JWT (JSON WEB TOKENS)
# ===========================================
# ⚠️ CHANGEZ CES VALEURS EN PRODUCTION !
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=3600                  # 1 heure en secondes
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=604800        # 7 jours en secondes

# ===========================================
# EMAIL CONFIGURATION
# ===========================================
MAIL_HOST=smtp.gmail.com             # Serveur SMTP
MAIL_PORT=587                        # Port SMTP
MAIL_USER=your_email@gmail.com       # ⚠️ CHANGEZ : Email expéditeur
MAIL_PASSWORD=your_app_password      # ⚠️ CHANGEZ : Mot de passe application Gmail
MAIL_FROM=ClubHub <your_email@gmail.com>

# Comment obtenir un mot de passe d'application Gmail :
# 1. Activez la validation en 2 étapes
# 2. Allez sur : https://myaccount.google.com/apppasswords
# 3. Générez un mot de passe pour "Application"
# 4. Copiez le mot de passe (16 caractères)

# ===========================================
# STRIPE (PAIEMENTS)
# ===========================================
# Obtenez vos clés sur : https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_...   # ⚠️ CHANGEZ : Clé publique
STRIPE_SECRET_KEY=sk_test_...        # ⚠️ CHANGEZ : Clé secrète
STRIPE_WEBHOOK_SECRET=whsec_...      # ⚠️ CHANGEZ : Secret webhook
```

### Frontend - Fichier `environment.ts`

Créez/modifiez `frontend/src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  uploadUrl: 'http://localhost:3000/uploads',
  stripePublishableKey: 'pk_test_...', // ⚠️ CHANGEZ
};
```

---

## 🏃 Démarrage

### Backend

```bash
cd backend

# Créer la base de données
mysql -u root -p
CREATE DATABASE club_management;
exit;

# Lancer les migrations
npm run migration:run

# Démarrer le serveur
npm run start:dev
```

Backend accessible sur : `http://localhost:3000`

### Frontend

```bash
cd frontend

# Démarrer le serveur
npm start
```

Frontend accessible sur : `http://localhost:4200`

### Compte Admin par défaut

- **Email** : `admin@example.com`
- **Mot de passe** : `admin123`

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

```http
POST   /auth/register          # Inscription
POST   /auth/login             # Connexion
POST   /auth/refresh           # Rafraîchir token
POST   /auth/logout            # Déconnexion
POST   /auth/verify-email      # Vérifier email
```

### Clubs Endpoints

```http
GET    /clubs                  # Liste des clubs (avec filtres)
GET    /clubs/:id              # Détails d'un club
POST   /clubs                  # Créer un club (Admin)
PATCH  /clubs/:id              # Modifier un club (Admin)
DELETE /clubs/:id              # Supprimer un club (Admin)
GET    /clubs/stats            # Statistiques globales
GET    /clubs/:id/president    # Obtenir le président
POST   /clubs/:id/president    # Assigner un président
DELETE /clubs/:id/president    # Retirer le président
GET    /clubs/all-users        # Liste des utilisateurs
```

### Events Endpoints

```http
GET    /events                 # Liste des événements
GET    /events/:id             # Détails d'un événement
POST   /events                 # Créer un événement
PATCH  /events/:id             # Modifier un événement
DELETE /events/:id             # Supprimer un événement
POST   /events/:id/register    # S'inscrire
```

### Memberships Endpoints

```http
POST   /memberships/create-application  # Postuler
GET    /memberships/users/:userId/applications  # Candidatures
GET    /memberships/clubs/:clubId/members  # Membres
PATCH  /memberships/:id/role    # Changer rôle
DELETE /memberships/:id         # Retirer membre
```

### Transactions Endpoints

```http
GET    /transactions           # Liste des transactions
POST   /transactions           # Créer une transaction
GET    /transactions/export/pdf   # Export PDF
GET    /transactions/export/excel # Export Excel
```

### Notifications Endpoints

```http
GET    /notifications          # Notifications
PATCH  /notifications/:id/read # Marquer comme lue
GET    /notifications/sse      # Stream temps réel
```

### Payments Endpoints

```http
POST   /payments/create-intent # Créer PaymentIntent
POST   /payments/webhook       # Webhook Stripe
GET    /payments/:id           # Détails paiement
```

**Note** : Les routes protégées nécessitent un token JWT :

```http
Authorization: Bearer <access_token>
```

---

## 👨‍💻 Team

<div align="center">

### 🌟 Développé par une équipe de 4 développeurs passionnés

<table>
  <tr>
    <td align="center">
      <img src="https://ui-avatars.com/api/?name=Oussema+Guerami&background=3b82f6&color=fff&size=100" width="100px;" alt="Oussema Guerami"/>
      <br />
      <sub><b>Oussema Guerami</b></sub>
      <br />
      <sub>Full Stack Developer</sub>
    </td>
    <td align="center">
      <img src="https://ui-avatars.com/api/?name=Hiba+Chabbouh&background=ef4444&color=fff&size=100" width="100px;" alt="Hiba Chabbouh"/>
      <br />
      <sub><b>Hiba Chabbouh</b></sub>
      <br />
      <sub>Frontend Developer</sub>
    </td>
    <td align="center">
      <img src="https://ui-avatars.com/api/?name=Eya+Ben+Ameur&background=22c55e&color=fff&size=100" width="100px;" alt="Eya Ben Ameur"/>
      <br />
      <sub><b>Eya Ben Ameur</b></sub>
      <br />
      <sub>Backend Developer</sub>
    </td>
    <td align="center">
      <img src="https://ui-avatars.com/api/?name=Samar+Benhouidi&background=f59e0b&color=fff&size=100" width="100px;" alt="Samar Benhouidi"/>
      <br />
      <sub><b>Samar Benhouidi</b></sub>
      <br />
      <sub>Full Stack Developer</sub>
    </td>
  </tr>
</table>

</div>

---

## 📄 License

Ce projet est sous licence **MIT**.

---

## 🙏 Remerciements

- **Angular Team** pour le framework exceptionnel
- **NestJS Team** pour l'architecture backend robuste
- **Stripe** pour la solution de paiement sécurisée
- **Tous les contributeurs** open-source

---

## 📞 Contact

**Email :** clubmanagement25@gmail.com

**Repository :** [GitHub - ClubHub](https://github.com/your-username/clubhub)

---

<div align="center">

### ⭐ Si ce projet vous plaît, donnez-lui une étoile ! ⭐

**Fait avec ❤️ par l'équipe ClubHub**

*ClubHub - Simplifier la gestion des clubs universitaires* 🎓

</div>
