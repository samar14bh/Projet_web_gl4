# 🎓 ClubHub

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Angular](https://img.shields.io/badge/Angular-20-red.svg)
![NestJS](https://img.shields.io/badge/NestJS-11-ea2845.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**The ultimate platform for managing university clubs, events, and student engagement**

*Developed by a team of 4 passionate developers* 🚀

[Features](#-features-détaillées) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Configuration](#️-configuration)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features Détaillées](#-features-détaillées)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Team](#-team)
- [License](#-license)

---

## 🌟 Overview

**ClubHub** est une plateforme web complète développée pour révolutionner la gestion des clubs universitaires. Notre solution offre un écosystème complet pour les administrateurs, les présidents de clubs et les étudiants, facilitant la création, la gestion et la participation aux activités extra-scolaires.

### 🎯 Objectifs du Projet

- **Centralisation** : Une seule plateforme pour toutes les activités des clubs
- **Engagement Étudiant** : Faciliter la découverte et l'adhésion aux clubs
- **Transparence Financière** : Suivi précis des transactions et génération de rapports
- **Automatisation** : QR codes pour l'enregistrement aux événements
- **Communication** : Système de notifications en temps réel

### 💡 Problèmes Résolus

✅ **Gestion manuelle dispersée** → Plateforme centralisée et automatisée  
✅ **Manque de visibilité des clubs** → Interface attractive avec recherche et filtres  
✅ **Suivi financier complexe** → Rapports PDF/Excel automatiques  
✅ **Enregistrement manuel aux événements** → QR codes instantanés  
✅ **Communication inefficace** → Notifications temps réel (SSE)

---

## ✨ Features Détaillées

### 🔐 1. Système d'Authentification Sécurisé

Notre système d'authentification utilise les meilleures pratiques de sécurité :

#### 🔑 **Fonctionnalités Clés**

- **JWT (JSON Web Tokens)** : Authentification stateless et sécurisée
  - Access Token (1h de validité)
  - Refresh Token (7 jours de validité)
  - Rotation automatique des tokens
  
- **Hashage des Mots de Passe** : bcrypt avec salt rounds (10)
  - Protection contre les attaques par force brute
  - Mots de passe jamais stockés en clair
  
- **Vérification Email** : Token unique de 24h
  - Envoi automatique d'email de confirmation
  - Protection contre les inscriptions frauduleuses
  
- **Système de Rôles** : Contrôle d'accès granulaire
  - **Admin** : Accès complet à toutes les fonctionnalités
  - **President** : Gestion complète de son club
  - **RH** : Gestion des membres et candidatures
  - **Member** : Accès de base aux fonctionnalités membres

#### 💼 **Cas d'Usage**

```
Étudiant → S'inscrit → Reçoit email → Vérifie compte → Explore clubs → 
Postule → Président approuve → Devient membre → Accède aux événements
```

---

### 🏢 2. Gestion Complète des Clubs

Un système de gestion de clubs puissant et intuitif.

#### 📊 **Tableau de Bord Administrateur**

**Vue d'ensemble en temps réel :**
- 📈 **Statistiques globales** : Total clubs, actifs, inactifs, total membres
- 🎯 **Filtres avancés** :
  - Par statut (Tous / Actifs / Inactifs)
  - Par catégorie (Technologie, Sport, Culture, Environnement, Social)
  - Recherche textuelle (nom, description)
  - Tri (nom, membres, événements, date de création)
- 📄 **Pagination** : Navigation fluide avec 12 clubs par page
- ⚡ **Actions rapides** sur chaque club :
  - 👁️ Voir détails
  - ✏️ Modifier
  - 👤 Gérer administrateur
  - 🔄 Activer/Désactiver
  - 🗑️ Supprimer

#### ➕ **Création de Club**

**Formulaire complet avec validation en temps réel :**

1. **Informations de Base** :
   ```
   - Nom du club (min 3 caractères)
   - Slug URL (minuscules, chiffres, tirets uniquement)
   - Description détaillée (min 10 caractères)
   - Email de contact (validation regex)
   ```

2. **Catégorisation** :
   ```
   - Sélection de catégorie (5 options)
   - Définit l'icône et la couleur du club
   ```

3. **Paramètres Financiers** :
   ```
   - Montant cotisation annuelle (TND)
   - Cotisation gratuite : 0 TND
   - Validation : montant ≥ 0
   ```

4. **Visibilité** :
   ```
   - Public : Visible par tous les étudiants
   - Privé : Adhésion sur invitation
   ```

5. **Médias** :
   ```
   - Logo (PNG/JPG/JPEG, max 2MB)
   - Image de couverture (PNG/JPG/JPEG, max 5MB)
   - Preview instantané avant upload
   - Stockage sécurisé : /uploads/clubs/
   - URLs complètes dans la BDD
   ```

6. **Date de Création** :
   ```
   - Sélection via date picker
   - Format ISO 8601 pour la BDD
   ```

**Validation Multi-Niveaux :**
- ✅ Frontend : Validation instantanée (Angular)
- ✅ Backend : Validation stricte (class-validator)
- ✅ Database : Contraintes d'intégrité (MySQL)

#### ✏️ **Modification de Club**

**Formulaire pré-rempli intelligent :**
- Toutes les données du club chargées automatiquement
- Preview des images existantes
- Possibilité de changer les images (optionnel)
- Mise à jour partielle supportée
- Validation identique à la création

#### 👤 **Gestion des Présidents**

**Interface dédiée pour assigner les administrateurs de clubs :**

**Modal "Administrateur" :**
```
┌─────────────────────────────────────────┐
│  Administrateur du Club Robotique       │
├─────────────────────────────────────────┤
│                                          │
│  📌 Président Actuel                    │
│  ┌────────────────────────────────────┐ │
│  │ 👤 Ahmed Ben Ali                   │ │
│  │ 📧 ahmed.benali@example.com        │ │
│  │ 📅 Depuis le 15/09/2025            │ │
│  │                    [Supprimer] ❌  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ➕ Assigner un Nouveau Président       │
│  ┌────────────────────────────────────┐ │
│  │ [Sélectionnez un utilisateur ▼]   │ │
│  │                     [Assigner] ✅  │ │
│  └────────────────────────────────────┘ │
│                                          │
│                       [Fermer]           │
└─────────────────────────────────────────┘
```

**Fonctionnalités :**
- Liste déroulante de **tous les utilisateurs** de la plateforme
- Changement de président en un clic
- Suppression du président actuel possible
- Mise à jour automatique du rôle dans `memberships`
- Si l'utilisateur n'est pas membre → création automatique de membership
- Si déjà membre → mise à jour du rôle vers PRESIDENT

**Logique Métier :**
```
1. Admin clique sur "Administrateur" (icône badge violet)
2. Modal s'ouvre
3. Affichage du président actuel (s'il existe)
4. Liste de tous les utilisateurs chargée depuis la BDD
5. Admin sélectionne un utilisateur
6. Clic sur "Assigner"
7. Backend :
   - Supprime l'ancien président
   - Crée/modifie le membership du nouvel utilisateur
   - Role = PRESIDENT
8. Confirmation + Rechargement des données
```

---

### 📅 3. Gestion des Événements

Un système complet pour créer, gérer et suivre les événements des clubs.

#### 🎫 **Création d'Événement**

**Formulaire riche avec toutes les informations nécessaires :**

1. **Informations de Base** :
   ```
   - Titre de l'événement
   - Description détaillée (éditeur riche)
   - Type d'événement (Conférence, Atelier, Compétition, etc.)
   - Lieu (adresse complète)
   ```

2. **Planification** :
   ```
   - Date de début (date + heure)
   - Date de fin (date + heure)
   - Durée calculée automatiquement
   - Validation : date fin > date début
   ```

3. **Capacité et Inscription** :
   ```
   - Capacité maximale (nombre de places)
   - Date limite d'inscription
   - Places restantes calculées en temps réel
   - Badge "Complet" automatique
   ```

4. **Visibilité** :
   ```
   - Public : Tous les étudiants peuvent s'inscrire
   - Privé : Membres du club uniquement
   ```

5. **Image de Couverture** :
   ```
   - Upload d'image attractive
   - Dimensions recommandées : 1200x600px
   - Preview avant publication
   ```

#### 📱 **QR Code Automatique**

**Génération instantanée pour chaque événement :**

```
Événement créé → QR Code généré automatiquement →
Contient : {eventId, clubId, timestamp}
```

**Utilisation :**
1. Étudiant s'inscrit à l'événement en ligne
2. Reçoit confirmation par email
3. Le jour J : présente son QR code (sur téléphone)
4. Organisateur scanne avec l'app mobile/web
5. Validation instantanée de la présence
6. Statistiques de présence en temps réel

**Avantages :**
- ✅ Pas de liste papier
- ✅ Pas d'erreur de saisie manuelle
- ✅ Validation instantanée
- ✅ Statistiques précises
- ✅ Détection des doublons

#### 📊 **Suivi des Inscriptions**

**Dashboard événement en temps réel :**
```
┌─────────────────────────────────────────┐
│  📊 Statistiques de l'Événement         │
├─────────────────────────────────────────┤
│  👥 Inscrits : 87 / 100                 │
│  ██████████████████░░ 87%               │
│                                          │
│  ✅ Présents : 62                       │
│  ⏳ En attente : 25                     │
│  ❌ Absents : 0                         │
│                                          │
│  📈 Taux de présence : 71.3%            │
└─────────────────────────────────────────┘
```

**Liste des Inscrits :**
- Recherche et filtres (nom, statut)
- Export Excel/PDF des inscrits
- Envoi d'emails groupés
- QR codes individuels téléchargeables

---

### 💰 4. Gestion Financière Avancée

Un système complet de suivi financier avec rapports professionnels.

#### 💵 **Enregistrement des Transactions**

**Formulaire de transaction avec validation :**

1. **Type de Transaction** :
   ```
   📈 REVENU :
   - Cotisations membres
   - Subventions
   - Sponsors
   - Ventes (merchandising, billets)
   - Dons
   
   📉 DÉPENSE :
   - Équipement
   - Location de salle
   - Marketing
   - Fournitures
   - Déplacements
   - Nourriture/Boissons
   ```

2. **Détails** :
   ```
   - Montant (TND, validation : > 0)
   - Description détaillée
   - Date de la transaction
   - Catégorie (pré-définies)
   - Pièce jointe (reçu/facture)
   ```

3. **Validation et Traçabilité** :
   ```
   - Qui : Enregistrée par (userId)
   - Quand : Timestamp automatique
   - Quoi : Type + montant + description
   - Preuve : Document attaché
   ```

#### 📊 **Rapports Financiers PDF**

**Génération automatique de rapports professionnels :**

**Contenu du Rapport :**
```
┌─────────────────────────────────────────┐
│   RAPPORT FINANCIER - Club Robotique   │
│   Période : 01/01/2026 - 31/01/2026    │
├─────────────────────────────────────────┤
│                                          │
│  💰 RÉSUMÉ FINANCIER                    │
│  ├─ Total Revenus    : 5,250.00 TND    │
│  ├─ Total Dépenses   : 3,180.00 TND    │
│  └─ Solde Net        : 2,070.00 TND    │
│                                          │
│  📈 GRAPHIQUE (Camembert)               │
│  [Répartition Revenus vs Dépenses]     │
│                                          │
│  📋 TABLEAU DES TRANSACTIONS            │
│  ┌────────┬──────────┬─────────┬──────┐│
│  │ Date   │ Type     │ Montant │ Desc ││
│  ├────────┼──────────┼─────────┼──────┤│
│  │15/01   │ Revenu   │ 500 TND │ ... ││
│  │18/01   │ Dépense  │-120 TND │ ... ││
│  │...     │ ...      │ ...     │ ... ││
│  └────────┴──────────┴─────────┴──────┘│
│                                          │
│  ✅ Généré le : 02/02/2026 18:30       │
└─────────────────────────────────────────┘
```

**Technologie utilisée :**
- **jsPDF** : Génération de PDF côté client
- **jsPDF-AutoTable** : Tableaux formatés automatiquement
- **Chart.js** : Graphiques convertis en images
- Téléchargement automatique
- Nom du fichier : `rapport-financier-{clubName}-{date}.pdf`

#### 📊 **Export Excel**

**Export des transactions au format XLSX :**

**Colonnes :**
```
| ID | Date | Type | Catégorie | Montant | Description | Solde Cumulé |
```

**Fonctionnalités Excel :**
- ✅ Formules automatiques (SUM, AVERAGE)
- ✅ Formatage conditionnel (rouge/vert)
- ✅ Filtres sur toutes les colonnes
- ✅ Tri personnalisable
- ✅ Graphiques intégrés
- ✅ Compatible Excel, LibreOffice, Google Sheets

**Technologie :** Bibliothèque XLSX (SheetJS)

#### 📈 **Visualisation des Données**

**Dashboard financier interactif :**

```
Graphique en Ligne : Évolution du solde
Graphique Camembert : Répartition dépenses par catégorie
Graphique Barres : Revenus vs Dépenses par mois
KPI Cards : Revenus totaux, Dépenses totales, Solde, Moyenne mensuelle
```

---

### 🔔 5. Système de Notifications en Temps Réel

Un système de notifications moderne utilisant Server-Sent Events (SSE).

#### ⚡ **Architecture SSE**

**Pourquoi SSE et pas WebSocket ?**
- ✅ Plus léger (HTTP standard)
- ✅ Reconnexion automatique
- ✅ Unidirectionnel (serveur → client)
- ✅ Parfait pour les notifications

**Flux de Communication :**
```
Backend (NestJS) ──SSE──> Frontend (Angular)
    │                            │
    │ 1. Connexion /sse         │
    │ 2. Stream ouvert          │
    │ 3. Événements push        │
    │ 4. Auto-reconnect         │
    └───────────────────────────┘
```

#### 📬 **Types de Notifications**

1. **Événements** :
   ```
   🎉 Nouvel événement créé
   📅 Rappel : Événement dans 24h
   ✅ Inscription confirmée
   ❌ Événement annulé
   📊 Événement terminé - statistiques disponibles
   ```

2. **Candidatures** :
   ```
   📝 Nouvelle candidature reçue (pour Président/RH)
   ✅ Candidature approuvée
   ❌ Candidature rejetée
   📋 Candidature en attente de traitement
   ```

3. **Paiements** :
   ```
   💳 Paiement reçu
   ⏳ Paiement en attente
   ❌ Paiement échoué
   ✅ Cotisation à jour
   ⚠️ Cotisation expirée
   ```

4. **Système** :
   ```
   👤 Nouveau membre dans votre club
   🎯 Rôle modifié
   📢 Annonce importante
   🔔 Message du président
   ```

#### 🎨 **Interface Utilisateur**

**Badge de Notifications :**
```
🔔 (3) ← Nombre de non-lues en rouge
```

**Centre de Notifications :**
```
┌─────────────────────────────────────────┐
│  🔔 Notifications (3 non lues)          │
├─────────────────────────────────────────┤
│  🎉 Nouvel événement : Hackathon 2026   │
│     Il y a 5 minutes                 ⚪ │
├─────────────────────────────────────────┤
│  ✅ Candidature approuvée               │
│     Il y a 1 heure                   ✓  │
├─────────────────────────────────────────┤
│  📝 3 nouvelles candidatures            │
│     Il y a 2 heures                  ⚪ │
└─────────────────────────────────────────┘
           [Tout marquer comme lu]
```

**Fonctionnalités :**
- Badge en temps réel (sans rechargement)
- Son de notification (optionnel)
- Clic sur notification → redirection vers la page concernée
- Marquer comme lu individuellement
- Marquer toutes comme lues
- Suppression automatique après 30 jours

---

### 📝 6. Système de Candidatures

Processus complet de candidature pour rejoindre un club.

#### 📋 **Formulaire de Candidature**

**Questions détaillées pour évaluer les candidats :**

1. **Motivations** :
   ```
   ❓ Pourquoi voulez-vous rejoindre ce club ?
   ❓ Quels sont vos objectifs au sein du club ?
   ❓ Qu'attendez-vous de cette expérience ?
   ```

2. **Expérience** :
   ```
   ❓ Avez-vous été membre d'autres clubs ? Lesquels ?
   ❓ Compétences pertinentes
   ❓ Projets antérieurs
   ```

3. **Disponibilité** :
   ```
   ❓ Disponibilité hebdomadaire (heures)
   ❓ Jours disponibles
   ❓ Contraintes éventuelles
   ```

4. **Informations de Contact** :
   ```
   📞 Numéro de téléphone
   📧 Email (pré-rempli)
   ```

5. **Commentaires Additionnels** :
   ```
   💬 Espace libre pour informations supplémentaires
   ```

#### 🔍 **Traitement des Candidatures (Président/RH)**

**Dashboard des Candidatures :**
```
┌─────────────────────────────────────────┐
│  📋 Candidatures en Attente (12)        │
├─────────────────────────────────────────┤
│  Filtres : [Toutes] [En attente] [...] │
├─────────────────────────────────────────┤
│                                          │
│  👤 Sarah Ben Ahmed                     │
│  📧 sarah.ahmed@example.com             │
│  📅 Postulé le : 28/01/2026             │
│  💬 "Passionnée par la robotique..."    │
│                                          │
│     [Voir Détails] [✅ Approuver] [❌]  │
├─────────────────────────────────────────┤
│  [Liste des autres candidatures...]     │
└─────────────────────────────────────────┘
```

**Actions Possibles :**
1. **Approuver** :
   - Création automatique du membership (role: MEMBER)
   - Envoi email de bienvenue
   - Notification au candidat
   - Ajout à la liste des membres

2. **Rejeter** :
   - Message de refus (optionnel)
   - Notification au candidat
   - Conservation de la candidature (historique)

3. **Demander Plus d'Infos** :
   - Envoyer un message au candidat
   - Statut : "En attente d'informations"

**Vue Détaillée :**
- Toutes les réponses du formulaire
- Profil complet du candidat
- Historique (candidatures précédentes)
- Notes internes (visibles uniquement par les admins)

---

### 🎨 7. Interface Utilisateur Moderne

Design professionnel et expérience utilisateur exceptionnelle.

#### 🖌️ **Design System**

**Palette de Couleurs :**
```css
Primary (Bleu)    : #3b82f6 (Actions principales)
Success (Vert)    : #22c55e (Confirmations)
Warning (Orange)  : #f59e0b (Avertissements)
Danger (Rouge)    : #ef4444 (Suppressions, erreurs)
Info (Cyan)       : #06b6d4 (Informations)
Gray Scale        : #1e293b → #f8fafc (Textes, fonds)
```

**Typographie :**
```
Font Family : 'Inter', sans-serif
Titres      : 600 (Semi-bold)
Corps       : 400 (Regular)
Emphasis    : 500 (Medium)
```

**Spacing System (Multiple de 4px) :**
```
xs  : 4px
sm  : 8px
md  : 16px
lg  : 24px
xl  : 32px
2xl : 48px
```

#### 📱 **Responsive Design**

**Breakpoints :**
```
Mobile    : < 640px
Tablet    : 640px - 1024px
Desktop   : > 1024px
```

**Adaptations :**
- Grilles flexibles (CSS Grid + Flexbox)
- Navigation mobile avec menu hamburger
- Tableaux scrollables sur mobile
- Modals plein écran sur mobile
- Touch-friendly (boutons minimum 44x44px)

#### 🎯 **Components Réutilisables**

**Bibliothèque de Composants :**
1. **Buttons** :
   ```
   - Primary, Secondary, Ghost, Danger
   - Avec/sans icônes
   - Loading state
   - Disabled state
   ```

2. **Modals** :
   ```
   - Small (400px), Medium (600px), Large (900px)
   - Header avec titre
   - Body scrollable
   - Footer avec actions
   - Backdrop cliquable
   - Animation fade-in
   ```

3. **Forms** :
   ```
   - Input text, number, email, date
   - Textarea
   - Select dropdown
   - Checkbox, Radio
   - File upload avec drag & drop
   - Validation en temps réel
   - Messages d'erreur
   ```

4. **Cards** :
   ```
   - Club cards avec image
   - Event cards avec badge
   - Stat cards (KPI)
   - Hover effects
   ```

5. **Tables** :
   ```
   - Tri sur colonnes
   - Pagination
   - Recherche inline
   - Actions sur lignes
   - Export CSV/Excel
   ```

6. **Notifications** :
   ```
   - Toast (coin supérieur droit)
   - Banner (haut de page)
   - Inline alerts
   - Auto-dismiss (5s)
   ```

#### ♿ **Accessibilité**

**Standards WCAG 2.1 Level AA :**
- ✅ Contraste minimum 4.5:1
- ✅ Navigation au clavier (Tab, Enter, Esc)
- ✅ Screen reader compatible
- ✅ ARIA labels
- ✅ Focus visible
- ✅ Textes alternatifs (images)

---

### 🔒 8. Sécurité

Mesures de sécurité robustes à tous les niveaux.

#### 🛡️ **Authentification et Autorisation**

**JWT (JSON Web Tokens) :**
```
Access Token :
- Durée : 1 heure
- Contenu : { userId, email, role }
- Stockage : LocalStorage (Frontend)

Refresh Token :
- Durée : 7 jours
- Stockage : Cookie HTTP-only
- Rotation automatique
```

**Guards (Protection des Routes) :**
```typescript
@UseGuards(JwtAuthGuard)        // Nécessite authentification
@UseGuards(RolesGuard)          // Nécessite rôle spécifique
@Roles('ADMIN', 'PRESIDENT')    // Accès limité
```

**Exemple de Protection :**
```
Route : DELETE /clubs/:id
Guards : [JwtAuthGuard, RolesGuard]
Roles : ['ADMIN']
→ Seuls les admins authentifiés peuvent supprimer un club
```

#### 🔐 **Protection des Données**

**Hashage des Mots de Passe :**
```typescript
// bcrypt avec 10 salt rounds
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// Vérification
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
```

**Validation des Entrées :**
```typescript
// class-validator (Backend)
@IsEmail()
@IsNotEmpty()
@MinLength(8)
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
```

**Protection CSRF :**
- Tokens CSRF pour les formulaires
- SameSite cookies
- Origin verification

**SQL Injection Prevention :**
- Requêtes paramétrées (TypeORM)
- Pas de concaténation SQL brute
- Validation des paramètres

**XSS Prevention :**
- Sanitization des inputs
- Content Security Policy (CSP)
- Escapement automatique (Angular)

#### 📁 **Upload de Fichiers Sécurisé**

**Validation :**
```typescript
// Type MIME vérification
allowed: ['image/jpeg', 'image/png', 'image/jpg']

// Taille maximum
fileSize: 5 * 1024 * 1024 // 5MB

// Extension vérification
const ext = path.extname(file.originalname);
if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
  throw new Error('Type de fichier non autorisé');
}
```

**Stockage :**
```
uploads/
├── clubs/
│   ├── logo-1234567890.jpg
│   └── coverImage-9876543210.jpg
├── events/
└── users/
```

**Noms de Fichiers Uniques :**
```typescript
const filename = `${fieldname}-${Date.now()}-${Math.random()}.${ext}`;
// Exemple : logo-1738351234567-0.847382.jpg
```

---

### 📧 9. Système d'Emails

Envoi d'emails automatiques via SMTP.

#### 📬 **Types d'Emails**

1. **Vérification de Compte** :
   ```
   Sujet : Vérifiez votre compte ClubHub
   Contenu :
   - Lien de vérification (token unique 24h)
   - Instructions
   - Support contact
   ```

2. **Bienvenue** :
   ```
   Sujet : Bienvenue dans {Club Name} !
   Contenu :
   - Message de bienvenue personnalisé
   - Prochaines étapes
   - Liens utiles
   ```

3. **Confirmation d'Événement** :
   ```
   Sujet : Inscription confirmée : {Event Name}
   Contenu :
   - Détails de l'événement
   - QR code personnel
   - Lieu et horaires
   - Contact organisateur
   ```

4. **Rappels** :
   ```
   Sujet : Rappel : {Event Name} demain !
   Contenu :
   - Rappel 24h avant l'événement
   - Détails pratiques
   - QR code
   ```

5. **Notifications de Candidature** :
   ```
   Sujet : Candidature approuvée / rejetée
   Contenu :
   - Décision
   - Message du président
   - Prochaines étapes
   ```

#### ⚙️ **Configuration SMTP**

**Gmail Configuration :**
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=clubmanagement25@gmail.com
MAIL_PASSWORD=rkarcmhhizwmnupo  # App Password
MAIL_FROM=ClubHub <clubmanagement25@gmail.com>
```

**Templates d'Emails :**
- Design responsive (mobile-friendly)
- Logo ClubHub
- Boutons CTA (Call To Action)
- Footer avec liens
- Personnalisation avec variables

---

### 💳 10. Intégration Stripe (Paiements)

Système de paiement en ligne sécurisé via Stripe.

#### 💰 **Cas d'Usage**

1. **Cotisations Annuelles** :
   ```
   Étudiant → Postule à un club → Candidature approuvée →
   Paiement cotisation (Stripe) → Membre actif
   ```

2. **Billets d'Événements** :
   ```
   Événement payant → Inscription → Paiement Stripe →
   Confirmation + QR code → Accès événement
   ```

3. **Merchandising** :
   ```
   Boutique club → Sélection produit → Paiement Stripe →
   Confirmation commande
   ```

#### 🔧 **Configuration Stripe**

**Clés API :**
```env
STRIPE_PUBLISHABLE_KEY=pk_test_51SrrUyDSM3h3CrrP...
STRIPE_SECRET_KEY=sk_test_51SrrUyDSM3h3CrrPLVhr...
STRIPE_WEBHOOK_SECRET=whsec_test_51SrrUy...
```

**Flux de Paiement :**
```
1. Frontend : Création de PaymentIntent (montant, devise)
2. Stripe : Génération de client_secret
3. Frontend : Affichage formulaire Stripe (carte)
4. Utilisateur : Saisie infos carte
5. Stripe : Validation et traitement
6. Webhook : Notification backend (payment_intent.succeeded)
7. Backend : Mise à jour statut paiement + création membership
8. Email : Confirmation envoyée à l'utilisateur
```

**Webhooks Gérés :**
- `payment_intent.succeeded` : Paiement réussi
- `payment_intent.payment_failed` : Paiement échoué
- `charge.refunded` : Remboursement

**Sécurité :**
- ✅ Pas de carte stockée sur nos serveurs
- ✅ Stripe.js (PCI-DSS compliant)
- ✅ Signature webhook vérifiée
- ✅ Mode test pour développement

---

## 🛠 Tech Stack

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Angular** | 20 | Framework principal |
| **TypeScript** | 5.0 | Langage de programmation |
| **RxJS** | 7.x | Programmation réactive |
| **Signals** | - | Gestion d'état moderne |
| **TailwindCSS** | 3.x | Styling utility-first |
| **Bootstrap Icons** | 1.x | Bibliothèque d'icônes |
| **jsPDF** | 2.x | Génération PDF |
| **jsPDF-AutoTable** | 3.x | Tableaux dans PDF |
| **xlsx** | 0.18 | Export Excel |
| **Chart.js** | 4.x | Graphiques et visualisations |

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **NestJS** | 11 | Framework backend |
| **TypeScript** | 5.0 | Langage de programmation |
| **TypeORM** | 0.3 | ORM pour MySQL |
| **MySQL** | 8.0 | Base de données |
| **Passport** | 0.7 | Authentification |
| **JWT** | 9.x | Tokens d'authentification |
| **bcrypt** | 5.x | Hashage de mots de passe |
| **class-validator** | 0.14 | Validation de données |
| **class-transformer** | 0.5 | Transformation de données |
| **Multer** | 1.x | Upload de fichiers |
| **Nodemailer** | 6.x | Envoi d'emails |
| **Stripe** | 14.x | Paiements en ligne |

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

Créez un fichier `.env` à la racine du dossier `backend` :

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DB_HOST=localhost                    # Hôte MySQL (localhost ou IP)
DB_PORT=3306                         # Port MySQL (défaut: 3306)
DB_USERNAME=root                     # Nom d'utilisateur MySQL
DB_PASSWORD=your_mysql_password      # ⚠️ CHANGEZ : Mot de passe MySQL
DB_DATABASE=club_management          # Nom de la base de données

# ===========================================
# APPLICATION
# ===========================================
PORT=3000                            # Port du serveur backend
NODE_ENV=development                 # Environnement (development/production)
FRONTEND_URL=http://localhost:4200   # URL du frontend

# ===========================================
# JWT (JSON WEB TOKENS)
# ===========================================
# ⚠️ CHANGEZ CES VALEURS EN PRODUCTION !
JWT_SECRET=3f1b8e2a-5c4e-4d2e-9f6a-8f4e2a1b2c3d
JWT_EXPIRES_IN=3600                  # Durée access token (secondes) = 1h
JWT_REFRESH_SECRET=4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a
JWT_REFRESH_EXPIRES_IN=604800        # Durée refresh token (secondes) = 7j

# ===========================================
# EMAIL CONFIGURATION (SMTP)
# ===========================================
MAIL_HOST=smtp.gmail.com             # Serveur SMTP
MAIL_PORT=587                        # Port SMTP (587 pour TLS)
MAIL_USER=your_email@gmail.com       # ⚠️ CHANGEZ : Email expéditeur
MAIL_PASSWORD=your_app_password      # ⚠️ CHANGEZ : Mot de passe d'application Gmail
MAIL_FROM=ClubHub <your_email@gmail.com>

# Comment obtenir un mot de passe d'application Gmail :
# 1. Activez la validation en 2 étapes sur votre compte Google
# 2. Allez dans : https://myaccount.google.com/apppasswords
# 3. Générez un mot de passe pour "Application"
# 4. Copiez le mot de passe généré (16 caractères)

# ===========================================
# STRIPE (PAIEMENTS)
# ===========================================
# Obtenez vos clés sur : https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_...   # ⚠️ CHANGEZ : Clé publique Stripe
STRIPE_SECRET_KEY=sk_test_...        # ⚠️ CHANGEZ : Clé secrète Stripe
STRIPE_WEBHOOK_SECRET=whsec_...      # ⚠️ CHANGEZ : Secret webhook Stripe
```

### Frontend - Fichier `environment.ts`

Créez/modifiez `frontend/src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  uploadUrl: 'http://localhost:3000/uploads',
  stripePublishableKey: 'pk_test_51SrrUyDSM3h3CrrPieY7s9OuqGSYwjI6DWP1DxPk8Z4mH3xiL8vPtxj7ZS4PVmYLu4APGFcfXhsjgD2HgIHck9ZR00V1o2RZ4i',
};
```

---

## 🏃 Démarrage

### 1. Démarrer le Backend

```bash
cd backend

# Créer la base de données (si elle n'existe pas)
mysql -u root -p
CREATE DATABASE club_management;
exit;

# Lancer les migrations
npm run migration:run

# Démarrer le serveur
npm run start:dev
```

Le backend sera accessible sur : `http://localhost:3000`  
API : `http://localhost:3000/api`  
Swagger : `http://localhost:3000/api/docs`

### 2. Démarrer le Frontend

```bash
cd frontend

# Démarrer le serveur de développement
npm start
```

Le frontend sera accessible sur : `http://localhost:4200`

### 3. Accès à l'Application

**Compte Admin par défaut :**
- Email : `admin@example.com`
- Mot de passe : `admin123`

---

## 📖 Usage Guide

### 🎯 Pour les Administrateurs

#### Créer un Club

1. Connectez-vous en tant qu'admin
2. Allez dans **Admin > Manage Clubs**
3. Cliquez sur **"Créer un club"**
4. Remplissez le formulaire :
   - Nom, slug, description
   - Sélectionnez une catégorie
   - Définissez la cotisation
   - Uploadez logo et image de couverture
5. Cliquez sur **"Créer le club"**

#### Assigner un Président

1. Dans **Manage Clubs**, trouvez le club
2. Cliquez sur l'icône **badge violet** (👤)
3. Sélectionnez un utilisateur dans la liste
4. Cliquez sur **"Assigner"**
5. Le président reçoit automatiquement les droits

#### Gérer les Finances

1. Allez dans **Finance > Transactions**
2. Cliquez sur **"Nouvelle Transaction"**
3. Choisissez le type (Revenu/Dépense)
4. Remplissez les détails
5. Enregistrez
6. Exportez en PDF ou Excel si nécessaire

### 👥 Pour les Présidents de Club

#### Gérer les Candidatures

1. Connectez-vous avec votre compte
2. Allez dans **Mon Club > Candidatures**
3. Consultez la liste des candidatures en attente
4. Pour chaque candidature :
   - Cliquez sur **"Voir Détails"**
   - Lisez les motivations et compétences
   - Cliquez sur **"Approuver"** ou **"Rejeter"**
5. Le candidat reçoit une notification automatique

#### Créer un Événement

1. Allez dans **Événements > Créer**
2. Remplissez les informations :
   - Titre, description, lieu
   - Date et heure de début/fin
   - Capacité maximale
   - Date limite d'inscription
3. Uploadez une image attractive
4. Publiez l'événement
5. Le QR code est généré automatiquement

#### Suivre les Inscriptions

1. Ouvrez votre événement
2. Consultez le dashboard :
   - Nombre d'inscrits
   - Places restantes
   - Liste des participants
3. Le jour J : scannez les QR codes avec l'application mobile
4. Consultez les statistiques de présence

### 🎓 Pour les Étudiants

#### Rejoindre un Club

1. Créez un compte et vérifiez votre email
2. Explorez les clubs disponibles
3. Cliquez sur un club qui vous intéresse
4. Lisez la description et les activités
5. Cliquez sur **"Postuler"**
6. Remplissez le formulaire de candidature
7. Attendez l'approbation du président
8. Recevez une notification de confirmation
9. Payez la cotisation (si applicable)
10. Accédez aux événements du club

#### S'inscrire à un Événement

1. Parcourez les événements disponibles
2. Cliquez sur un événement
3. Vérifiez les détails (date, lieu, places)
4. Cliquez sur **"S'inscrire"**
5. Confirmez votre inscription
6. Recevez un email avec le QR code
7. Présentez le QR code le jour J

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentification

Toutes les routes protégées nécessitent un token JWT dans le header :

```http
Authorization: Bearer <access_token>
```

### Endpoints Principaux

#### 🔐 Authentication

```http
POST   /auth/register          # Inscription
POST   /auth/login             # Connexion
POST   /auth/refresh           # Rafraîchir le token
POST   /auth/logout            # Déconnexion
POST   /auth/verify-email      # Vérifier l'email
```

#### 🏢 Clubs

```http
GET    /clubs                  # Liste paginée des clubs
GET    /clubs/:id              # Détails d'un club
POST   /clubs                  # Créer un club (Admin)
PATCH  /clubs/:id              # Modifier un club (Admin)
DELETE /clubs/:id              # Supprimer un club (Admin)
GET    /clubs/stats            # Statistiques globales
GET    /clubs/:id/members      # Membres d'un club
GET    /clubs/:id/president    # Président du club
POST   /clubs/:id/president    # Assigner un président (Admin)
DELETE /clubs/:id/president    # Retirer le président (Admin)
GET    /clubs/all-users        # Liste de tous les utilisateurs
```

#### 📅 Events

```http
GET    /events                 # Liste des événements
GET    /events/:id             # Détails d'un événement
POST   /events                 # Créer un événement (President)
PATCH  /events/:id             # Modifier un événement (President)
DELETE /events/:id             # Supprimer un événement (President)
POST   /events/:id/register    # S'inscrire à un événement
GET    /events/:id/registrations # Liste des inscrits
GET    /events/:id/qr-code     # Télécharger le QR code
```

#### 👥 Memberships

```http
POST   /memberships/create-application  # Postuler à un club
GET    /memberships/users/:userId/applications  # Candidatures d'un utilisateur
GET    /memberships/clubs/:clubId/members  # Membres d'un club
PATCH  /memberships/:id/role    # Changer le rôle d'un membre
DELETE /memberships/:id         # Retirer un membre
DELETE /memberships/applications/:id  # Annuler une candidature
```

#### 💰 Transactions

```http
GET    /transactions           # Liste des transactions
POST   /transactions           # Créer une transaction
GET    /transactions/export/pdf   # Exporter en PDF
GET    /transactions/export/excel # Exporter en Excel
```

#### 🔔 Notifications

```http
GET    /notifications          # Notifications de l'utilisateur
PATCH  /notifications/:id/read # Marquer comme lue
GET    /notifications/sse      # Stream SSE (temps réel)
DELETE /notifications/:id      # Supprimer une notification
```

#### 💳 Payments

```http
POST   /payments/create-intent # Créer un PaymentIntent Stripe
POST   /payments/webhook       # Webhook Stripe
GET    /payments/:id           # Détails d'un paiement
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

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- **Angular Team** pour le framework exceptionnel
- **NestJS Team** pour l'architecture backend robuste
- **Stripe** pour la solution de paiement sécurisée
- **Tous les contributeurs** open-source des bibliothèques utilisées
- **Notre université** pour le support et les ressources

---

## 📞 Contact

**Email du Projet :** clubmanagement25@gmail.com

**Repository :** [GitHub - ClubHub](https://github.com/your-username/clubhub)

---

<div align="center">

### ⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile ! ⭐

**Fait avec ❤️ par l'équipe ClubHub**

---

*ClubHub - Simplifier la gestion des clubs universitaires* 🎓

</div>
