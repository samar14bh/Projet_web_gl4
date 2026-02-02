# 🎓 Club Management Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Angular](https://img.shields.io/badge/Angular-20-red.svg)
![NestJS](https://img.shields.io/badge/NestJS-11-ea2845.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**A comprehensive platform for managing university clubs, events, and student memberships**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Documentation](#-documentation) • [Screenshots](#-screenshots)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **Club Management Platform** is a full-stack web application designed to streamline the administration and participation in university clubs. It provides a comprehensive solution for club management, event organization, membership tracking, and financial reporting.

### 🎯 Key Objectives

- **Centralized Management**: Single platform for all club-related activities
- **Student Engagement**: Easy discovery and joining of clubs
- **Administrative Control**: Powerful tools for club administrators
- **Financial Transparency**: Built-in transaction tracking and reporting
- **Event Management**: Complete event lifecycle management with QR code registration

---

## ✨ Features

### 👥 User Management

- **Multi-Role System**: Admin, President, HR, Member roles
- **Authentication & Authorization**: JWT-based secure authentication
- **Profile Management**: Complete user profile with customizable information
- **Email Verification**: Secure account activation

### 🏢 Club Management

- **Club CRUD Operations**: Create, read, update, and delete clubs
- **Rich Media Support**: Logo and cover image uploads
- **Category Organization**: Clubs organized by categories (Technology, Sport, Culture, etc.)
- **Membership Management**: Track active and inactive members
- **President Assignment**: Dedicated interface for assigning club presidents
- **Public/Private Clubs**: Control club visibility

### 📅 Event Management

- **Event Creation**: Rich event creation with detailed information
- **QR Code Registration**: Automatic QR code generation for event check-ins
- **Capacity Management**: Set and track event capacity
- **Registration Tracking**: Monitor attendee registrations
- **Event Analytics**: Comprehensive event statistics

### 💰 Financial Management

- **Transaction Tracking**: Record revenue and expenses
- **PDF Export**: Professional financial reports with charts
- **Excel Export**: Export transactions for external analysis
- **Revenue Analytics**: Visual representation of club finances
- **Membership Fees**: Automated fee tracking

### 🔔 Notifications System

- **Real-time Updates**: SSE-based instant notifications
- **Multi-type Notifications**: Event, application, payment notifications
- **Read/Unread Tracking**: Mark notifications as read
- **Notification Center**: Centralized notification management

### 📊 Analytics & Reporting

- **Dashboard Overview**: Key metrics and statistics
- **Club Statistics**: Members, events, revenue tracking
- **Visual Charts**: Interactive data visualization
- **Export Capabilities**: PDF and Excel report generation

### 🎨 User Interface

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Mobile-first responsive design
- **Dark Mode Support**: Eye-friendly dark theme
- **Accessibility**: WCAG 2.1 compliant
- **Intuitive Navigation**: Easy-to-use interface

---

## 🛠 Tech Stack

### Frontend

```
Angular 20              - Modern web framework
TypeScript 5.0          - Type-safe programming
RxJS                    - Reactive programming
Signals                 - State management
Standalone Components   - Modern Angular architecture
TailwindCSS            - Utility-first CSS framework
Bootstrap Icons        - Icon library
jsPDF                  - PDF generation
xlsx                   - Excel file handling
Chart.js               - Data visualization
```

### Backend

```
NestJS 11              - Progressive Node.js framework
TypeScript 5.0         - Type-safe programming
TypeORM                - Object-Relational Mapping
MySQL                  - Relational database
JWT                    - Authentication
Passport               - Authentication middleware
Multer                 - File upload handling
class-validator        - Input validation
bcrypt                 - Password hashing
```

### DevOps & Tools

```
Git                    - Version control
npm                    - Package management
Angular CLI            - Development tooling
ESLint                 - Code linting
Prettier               - Code formatting
```

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Angular    │  │   RxJS       │  │   Signals    │ │
│  │   Components │  │   Observables│  │   State      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  API Gateway Layer                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │         RESTful API (NestJS Controllers)         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Business Logic Layer                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Services │  │ Guards   │  │ Pipes    │             │
│  │ (NestJS) │  │ (Auth)   │  │ (Valid.) │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Data Access Layer                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │            TypeORM Repositories                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Database Layer                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              MySQL Database                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Database Schema (Simplified)

```sql
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│    Users    │──┬───│ Memberships  │───┬──│    Clubs    │
└─────────────┘  │   └──────────────┘   │  └─────────────┘
                 │                      │
                 │   ┌──────────────┐   │
                 └───│ Applications │───┘
                     └──────────────┘
                     
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Events    │──────│Registration  │──────│    Users    │
└─────────────┘      └──────────────┘      └─────────────┘

┌─────────────┐      ┌──────────────┐
│    Clubs    │──────│ Transactions │
└─────────────┘      └──────────────┘

┌─────────────┐      ┌──────────────┐
│    Users    │──────│Notifications │
└─────────────┘      └──────────────┘
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MySQL** >= 8.x
- **Git**

### Clone Repository

```bash
git clone https://github.com/your-username/club-management-platform.git
cd club-management-platform
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure database in .env
# DB_HOST=localhost
# DB_PORT=3306
# DB_USERNAME=root
# DB_PASSWORD=your_password
# DB_DATABASE=club_management

# Run database migrations
npm run migration:run

# Seed database (optional)
npm run seed

# Start development server
npm run start:dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp src/environments/environment.example.ts src/environments/environment.ts

# Configure API URL in environment.ts
# apiUrl: 'http://localhost:3000/api'

# Start development server
npm start
```

Frontend will run on `http://localhost:4200`

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=club_management

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Application
PORT=3000
NODE_ENV=development

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DEST=./uploads
```

#### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  uploadUrl: 'http://localhost:3000/uploads',
};
```

---

## 📖 Usage

### Admin Access

1. Navigate to `http://localhost:4200/login`
2. Login with admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

### Create a Club

1. Navigate to **Admin > Manage Clubs**
2. Click **"Create Club"** button
3. Fill in club details:
   - Name, slug, description
   - Contact email
   - Category selection
   - Membership fee
   - Upload logo and cover image
4. Click **"Create Club"**

### Assign President

1. Go to **Manage Clubs**
2. Click the **purple badge icon** on a club card
3. Select a user from the dropdown
4. Click **"Assign"**

### Create Event

1. Navigate to **Events > Create Event**
2. Fill in event details
3. Set capacity and registration deadline
4. Click **"Create Event"**
5. QR code is automatically generated

### Generate Financial Report

1. Go to **Finance > Transactions**
2. Click **"Export PDF"** or **"Export Excel"**
3. Report is downloaded automatically

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <token>
```

### Main Endpoints

#### Authentication

```http
POST   /auth/register          # Register new user
POST   /auth/login             # Login
POST   /auth/refresh           # Refresh token
POST   /auth/logout            # Logout
```

#### Clubs

```http
GET    /clubs                  # Get all clubs (paginated)
GET    /clubs/:id              # Get club by ID
POST   /clubs                  # Create club (Admin only)
PATCH  /clubs/:id              # Update club (Admin only)
DELETE /clubs/:id              # Delete club (Admin only)
GET    /clubs/:id/members      # Get club members
GET    /clubs/:id/president    # Get club president
POST   /clubs/:id/president    # Assign president
DELETE /clubs/:id/president    # Remove president
GET    /clubs/stats            # Get clubs statistics
```

#### Events

```http
GET    /events                 # Get all events
GET    /events/:id             # Get event by ID
POST   /events                 # Create event
PATCH  /events/:id             # Update event
DELETE /events/:id             # Delete event
POST   /events/:id/register    # Register for event
GET    /events/:id/qr-code     # Get event QR code
```

#### Transactions

```http
GET    /transactions           # Get all transactions
POST   /transactions           # Create transaction
GET    /transactions/export/pdf   # Export PDF
GET    /transactions/export/excel # Export Excel
```

#### Notifications

```http
GET    /notifications          # Get user notifications
PATCH  /notifications/:id/read # Mark as read
GET    /notifications/sse      # SSE stream
```

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Club Management
![Club Management](docs/screenshots/clubs.png)

### Event Creation
![Event Creation](docs/screenshots/event-create.png)

### Financial Reports
![Financial Reports](docs/screenshots/finance.png)

### President Assignment
![President Assignment](docs/screenshots/president.png)

---

## 📁 Project Structure

```
club-management-platform/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── clubs/             # Clubs module
│   │   ├── events/            # Events module
│   │   ├── memberships/       # Memberships module
│   │   ├── transactions/      # Transactions module
│   │   ├── notifications/     # Notifications module
│   │   ├── users/             # Users module
│   │   ├── common/            # Shared utilities
│   │   │   ├── enums/         # Enums (roles, status)
│   │   │   ├── guards/        # Auth guards
│   │   │   └── decorators/    # Custom decorators
│   │   └── main.ts            # Application entry point
│   ├── uploads/               # File uploads
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── Core/
│   │   │   │   ├── models/    # TypeScript interfaces
│   │   │   │   ├── services/  # API services
│   │   │   │   └── guards/    # Route guards
│   │   │   ├── features/
│   │   │   │   ├── admin/     # Admin pages
│   │   │   │   │   ├── manage-clubs/
│   │   │   │   │   ├── finances/
│   │   │   │   │   └── events-manager/
│   │   │   │   ├── student/   # Student pages
│   │   │   │   └── auth/      # Authentication pages
│   │   │   ├── shared/
│   │   │   │   └── components/ # Reusable components
│   │   │   └── app.component.ts
│   │   ├── assets/            # Static assets
│   │   └── environments/      # Environment configs
│   └── package.json
│
├── docs/                      # Documentation
├── README.md
└── LICENSE
```

---

## 🧪 Testing

### Backend Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run e2e

# Test coverage
npm run test:coverage
```

---

## 🚢 Deployment

### Production Build

#### Backend

```bash
cd backend
npm run build
npm run start:prod
```

#### Frontend

```bash
cd frontend
npm run build --configuration=production
```

The build artifacts will be in `frontend/dist/`.

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Stop containers
docker-compose down
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Style

- Follow [Angular Style Guide](https://angular.io/guide/styleguide)
- Follow [NestJS Best Practices](https://docs.nestjs.com/)
- Use **Prettier** for code formatting
- Use **ESLint** for code linting

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:

- Clear bug description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details

---

## 💡 Feature Requests

Have an idea? Open an issue with:

- Feature description
- Use case / user story
- Proposed solution
- Additional context

---

## 📝 Changelog

### Version 1.0.0 (2026-01-19)

**Added:**
- Club management system
- Event management with QR codes
- Financial tracking and reporting
- Notification system (SSE)
- President assignment interface
- Multi-role user system
- PDF/Excel export functionality

---

## 👨‍💻 Authors

- **Your Name** - *Initial work* - [GitHub](https://github.com/your-username)

See also the list of [contributors](https://github.com/your-username/club-management-platform/contributors).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- NestJS Team for the powerful backend framework
- All contributors who helped with testing and feedback
- University administration for project support

---

## 📞 Contact

**Project Link:** [https://github.com/your-username/club-management-platform](https://github.com/your-username/club-management-platform)

**Email:** your.email@example.com

---

<div align="center">

**⭐ Star this repo if you find it helpful! ⭐**

Made with ❤️ by [Your Name]

</div>
