# 🎓 ClubHub

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Angular](https://img.shields.io/badge/Angular-20-red.svg)
![NestJS](https://img.shields.io/badge/NestJS-11-ea2845.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**The Complete Platform for University Club Management**

*Developed by a team of 4 passionate developers* 🚀

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

**ClubHub** is a modern web platform that centralizes university club management. It enables administrators to create and manage clubs, presidents to organize events and manage their members, and students to easily discover and join clubs that interest them.

### 🎯 Objectives

- **Centralization**: All club activities on a single platform
- **Automation**: Real-time notifications, automatic reports
- **Transparency**: Financial tracking and detailed statistics
- **Engagement**: Modern and intuitive interface for students

---

## ✨ Features

### 🔐 1. Authentication & Security

**Robust JWT-based authentication system:**
- Registration with mandatory email verification
- Secure login with tokens (Access Token 1h, Refresh Token 7d)
- Passwords hashed with bcrypt (10 salt rounds)
- Role system: Admin, President, HR, Member
- Route protection based on roles

**Enhanced Security:**
- CSRF and XSS protection
- Strict input validation (frontend + backend)
- SQL Injection prevention with TypeORM
- Secure file upload with type and size validation

---

### 🏢 2. Club Management

**For Administrators:**
- Club creation with complete form (name, description, category, membership fee)
- Logo and cover image upload (max 5MB)
- Club modification and deletion
- Club activation/deactivation
- Dashboard with global statistics (total clubs, active, members)
- Advanced filters by status, category, text search
- Customizable sorting and pagination

**President Management:**
- Dedicated interface to assign a president to each club
- Selection from all platform users
- One-click president change
- Current president removal possible
- Automatic role updates in the database

**Club Categories:**
- Technology, Sport, Culture, Environment, Social
- Each category with distinctive icon and color
- Quick filtering by category

---

### 📅 3. Event Management

**Complete Event Creation:**
- Detailed information (title, description, location, dates)
- Maximum capacity definition
- Registration deadline
- Cover image upload
- Public or member-only events
- Real-time tracking of available spots

**Registrations:**
- Simple and fast online registration
- Automatic reminder 24h before the event
- Exportable participant list (PDF/Excel)
- Dashboard with attendance rate and statistics

---

### 💰 4. Financial Management

**Transaction Recording:**
- Two types: Revenue (fees, sponsors, grants) and Expenses (equipment, rental, travel)
- Form with amount, description, category, date
- Upload supporting documents (receipts, invoices)
- Complete history of all transactions

**Automatic Financial Reports:**
- **Professional PDF Export** with:
  - Financial summary (total revenue, total expenses, balance)
  - Charts (pie chart revenue vs expenses)
  - Detailed transaction table
  - Club logo and selected period
- **Excel Export** for in-depth analysis
- Interactive charts with Chart.js
- Automatic calculation of totals and averages

**Financial Dashboards:**
- Club finances overview
- Balance evolution over time
- Expense breakdown by category
- Visual KPIs (Key Performance Indicators)

---

### 🔔 5. Real-Time Notifications

**SSE (Server-Sent Events) System:**
- Instant notifications without page reload
- Lighter than WebSocket, automatic reconnection
- Badge with number of unread notifications

**Notification Types:**
- **Events**: New event, 24h reminder, cancellation
- **Applications**: New application (for President/HR), application status (for student)
- **Payments**: Payment confirmation, expired membership
- **System**: New member, role change, important announcements

**Intuitive Interface:**
- Notification center with chronological list
- Mark as read individually or all at once
- Click on notification → redirect to related page
- Notification sound (optional)

---

### 📝 6. Application System

**For Students:**
- Detailed application form to apply to a club
- Questions about motivations, experiences, skills, availability
- Application status tracking (pending, approved, rejected)
- Automatic decision notifications

**For Presidents/HR:**
- Pending applications dashboard
- Detailed consultation of each application
- One-click approval or rejection
- Personalized message upon rejection
- Automatic membership creation upon approval
- History of all applications

---

### 💳 7. Online Payments (Stripe)

**Complete Stripe Integration:**
- Secure payment of annual membership fees
- Payment for paid event tickets
- Stripe.js interface (PCI-DSS compliant)
- Webhooks for automatic payment confirmation
- Refund support

**Payment Flow:**
1. Student selects a paid club/event
2. Redirect to Stripe payment page
3. Secure card information entry
4. Stripe processing
5. Automatic confirmation and membership/registration activation
6. Confirmation email sent

---

### 📧 8. Automated Email System

**Transactional emails with professional templates:**
- **Account Verification**: Unique verification link (24h)
- **Welcome**: Personalized welcome message upon approval
- **Event Confirmation**: Details
- **Reminders**: 24h notification before the event
- **Applications**: Decision notification (approved/rejected)
- **Payments**: Transaction confirmation

**SMTP Configuration:**
- Support for Gmail, Outlook, custom SMTP servers
- Responsive HTML templates (mobile-friendly)
- Customizable variables (name, club, date, etc.)

---

### 📊 9. Statistics and Analytics

**Administrator Dashboard:**
- Global overview (total clubs, members, events)
- Statistics per club (active members, organized events, revenue)
- Evolution charts over time
- Most popular clubs (top 5)
- Event participation rate

**President Dashboard:**
- Detailed statistics of their club
- Number of active members
- Application approval rate
- Revenue and expenses
- Upcoming and past events
- Event performance (attendance rate)

---

### 🎨 10. Modern User Interface

**Professional and intuitive design:**
- Consistent design system (colors, typography, spacing)
- Responsive interface (mobile, tablet, desktop)
- Smooth animations and micro-interactions
- Reusable components (buttons, modals, cards, forms)
- WCAG 2.1 Level AA accessibility
- Complete keyboard navigation
- Dark mode support (optional)

**UI Technologies:**
- TailwindCSS for utility-first styling
- Bootstrap Icons for icons
- Angular Signals for reactivity
- RxJS for reactive programming

---

## 📸 Screenshots

### Administrator Dashboard
![Dashboard](https://i.imgur.com/XXXXXXX.png)
*Overview with global statistics and charts*

> 📝 **Note**: Replace `https://i.imgur.com/XXXXXXX.png` with your actual screenshot URL

### Club Management
![Club Management](https://i.imgur.com/YYYYYYY.png)
*Club list with filters, search and quick actions*

### Club Creation Form
![Create Club](https://i.imgur.com/ZZZZZZZ.png)
*Complete form with logo and cover image upload*

### President Management
![President Management](https://i.imgur.com/AAAAAAA.png)
*President assignment interface with user list*

### Event Creation
![Create Event](https://i.imgur.com/BBBBBBB.png)
*Event form*

### Applications List
![Applications](https://i.imgur.com/CCCCCCC.png)
*Applications dashboard with approval/rejection actions*

### Financial PDF Report
![Financial Report](https://i.imgur.com/DDDDDDD.png)
*Professional PDF report with charts and tables*

### Real-Time Notifications
![Notifications](https://i.imgur.com/EEEEEEE.png)
*Notification center with real-time badge*

### Club Profile
![Club Profile](https://i.imgur.com/FFFFFFF.png)
*Detailed club page with statistics*

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Usage |
|------------|---------|-------|
| **Angular** | 20 | Main framework |
| **TypeScript** | 5.0 | Programming language |
| **RxJS** | 7.x | Reactive programming |
| **Signals** | - | Modern state management |
| **TailwindCSS** | 3.x | Styling |
| **Bootstrap Icons** | 1.x | Icons |
| **jsPDF** | 2.x | PDF generation |
| **jsPDF-AutoTable** | 3.x | PDF tables |
| **xlsx** | 0.18 | Excel export |
| **Chart.js** | 4.x | Charts |

### Backend

| Technology | Version | Usage |
|------------|---------|-------|
| **NestJS** | 11 | Backend framework |
| **TypeScript** | 5.0 | Language |
| **TypeORM** | 0.3 | ORM |
| **MySQL** | 8.0 | Database |
| **Passport** | 0.7 | Authentication |
| **JWT** | 9.x | Tokens |
| **bcrypt** | 5.x | Hashing |
| **class-validator** | 0.14 | Validation |
| **Multer** | 1.x | File upload |
| **Nodemailer** | 6.x | Emails |
| **Stripe** | 14.x | Payments |

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MySQL** >= 8.x

### Clone the Repository

```bash
git clone https://github.com/your-username/clubhub.git
cd clubhub
```

### Backend Installation

```bash
cd backend
npm install
```

### Frontend Installation

```bash
cd frontend
npm install
```

---

## ⚙️ Configuration

### Backend - `.env` File

Create a `.env` file in the `backend` folder:

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DB_HOST=localhost                    # MySQL host
DB_PORT=3306                         # MySQL port
DB_USERNAME=root                     # MySQL username
DB_PASSWORD=your_password            # ⚠️ CHANGE: MySQL password
DB_DATABASE=club_management          # Database name

# ===========================================
# APPLICATION
# ===========================================
PORT=3000                            # Backend server port
NODE_ENV=development                 # Environment
FRONTEND_URL=http://localhost:4200   # Frontend URL

# ===========================================
# JWT (JSON WEB TOKENS)
# ===========================================
# ⚠️ CHANGE THESE VALUES IN PRODUCTION!
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=3600                  # 1 hour in seconds
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=604800        # 7 days in seconds

# ===========================================
# EMAIL CONFIGURATION
# ===========================================
MAIL_HOST=smtp.gmail.com             # SMTP server
MAIL_PORT=587                        # SMTP port
MAIL_USER=your_email@gmail.com       # ⚠️ CHANGE: Sender email
MAIL_PASSWORD=your_app_password      # ⚠️ CHANGE: Gmail app password
MAIL_FROM=ClubHub <your_email@gmail.com>

# How to get a Gmail app password:
# 1. Enable 2-step verification
# 2. Go to: https://myaccount.google.com/apppasswords
# 3. Generate a password for "Application"
# 4. Copy the password (16 characters)

# ===========================================
# STRIPE (PAYMENTS)
# ===========================================
# Get your keys at: https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_...   # ⚠️ CHANGE: Publishable key
STRIPE_SECRET_KEY=sk_test_...        # ⚠️ CHANGE: Secret key
STRIPE_WEBHOOK_SECRET=whsec_...      # ⚠️ CHANGE: Webhook secret
```

### Frontend - `environment.ts` File

Create/modify `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  uploadUrl: 'http://localhost:3000/uploads',
  stripePublishableKey: 'pk_test_...', // ⚠️ CHANGE
};
```

---

## 🏃 Getting Started

### Backend

```bash
cd backend

# Create the database
mysql -u root -p
CREATE DATABASE club_management;
exit;

# Run migrations
npm run migration:run

# Start the server
npm run start:dev
```

Backend accessible at: `http://localhost:3000`

### Frontend

```bash
cd frontend

# Start the server
npm start
```

Frontend accessible at: `http://localhost:4200`

### Default Admin Account

- **Email**: `admin@example.com`
- **Password**: `admin123`

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

```http
POST   /auth/register          # Registration
POST   /auth/login             # Login
POST   /auth/refresh           # Refresh token
POST   /auth/logout            # Logout
POST   /auth/verify-email      # Verify email
```

### Clubs Endpoints

```http
GET    /clubs                  # List clubs (with filters)
GET    /clubs/:id              # Club details
POST   /clubs                  # Create club (Admin)
PATCH  /clubs/:id              # Update club (Admin)
DELETE /clubs/:id              # Delete club (Admin)
GET    /clubs/stats            # Global statistics
GET    /clubs/:id/president    # Get president
POST   /clubs/:id/president    # Assign president
DELETE /clubs/:id/president    # Remove president
GET    /clubs/all-users        # User list
```

### Events Endpoints

```http
GET    /events                 # Event list
GET    /events/:id             # Event details
POST   /events                 # Create event
PATCH  /events/:id             # Update event
DELETE /events/:id             # Delete event
POST   /events/:id/register    # Register
```

### Memberships Endpoints

```http
POST   /memberships/create-application  # Apply
GET    /memberships/users/:userId/applications  # Applications
GET    /memberships/clubs/:clubId/members  # Members
PATCH  /memberships/:id/role    # Change role
DELETE /memberships/:id         # Remove member
```

### Transactions Endpoints

```http
GET    /transactions           # Transaction list
POST   /transactions           # Create transaction
GET    /transactions/export/pdf   # PDF export
GET    /transactions/export/excel # Excel export
```

### Notifications Endpoints

```http
GET    /notifications          # Notifications
PATCH  /notifications/:id/read # Mark as read
GET    /notifications/sse      # Real-time stream
```

### Payments Endpoints

```http
POST   /payments/create-intent # Create PaymentIntent
POST   /payments/webhook       # Stripe webhook
GET    /payments/:id           # Payment details
```

**Note**: Protected routes require a JWT token:

```http
Authorization: Bearer <access_token>
```

---

## 👨‍💻 Team

<div align="center">

### 🌟 Developed by a team of 4 passionate developers

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

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- **Angular Team** for the exceptional framework
- **NestJS Team** for the robust backend architecture
- **Stripe** for the secure payment solution
- **All open-source contributors**

---

## 📞 Contact

**Email:** clubmanagement25@gmail.com

**Repository:** [GitHub - ClubHub](https://github.com/your-username/clubhub)

---

## 📝 How to Add Your Screenshots

To add your screenshots, follow these simple steps:

### Option 1: Using Imgur (Recommended)
1. Go to https://imgur.com
2. Click **"New post"**
3. Upload your screenshot
4. Right-click on the uploaded image → **"Copy image address"**
5. Replace the example URL in the README

### Option 2: Using GitHub Issues
1. Go to your repository on GitHub
2. Create a new Issue (you can close it later)
3. Drag and drop your image into the comment box
4. GitHub will generate a URL automatically
5. Copy the URL and paste it in the README

### Example:
```markdown
![Dashboard](https://i.imgur.com/abc123.png)
```

Replace `abc123` with your actual image ID from Imgur or the full GitHub URL.

---

<div align="center">

### ⭐ If you like this project, give it a star! ⭐

**Made with ❤️ by the ClubHub Team**

*ClubHub - Simplifying University Club Management* 🎓

</div>
