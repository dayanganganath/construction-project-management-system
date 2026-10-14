# Construction Project Management System

![Project Status](https://img.shields.io/badge/Development-88%25%20Complete-brightgreen)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-success)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Database](https://img.shields.io/badge/Database-MySQL-orange)
![Security](https://img.shields.io/badge/Security-JWT%20%2B%20Role%20Based-red)

> 🚧 **Overall Project Progress: 88% Complete**  
> Core modules are operational. Final contractor document access, full regression testing, deployment, and final documentation are still in progress.

A full-stack construction management platform built to manage project operations, finance, site progress, clients, contractors, labour, documents, and role-based portals in one centralized system.

---

## 🚀 Project Overview

The system is designed for real-world construction project workflows. It supports office management users together with client, supervisor, and contractor portals while keeping access to sensitive project and financial data separated by role.

The project follows a REST API based architecture with a Spring Boot backend, React frontend, MySQL database, JWT authentication, and role-based authorization.

---

## 👥 User Roles

The application currently supports:

- **ADMIN** – full administrative access and user management
- **MANAGER** – operational and financial management access
- **SUPERVISOR** – assigned-site access, daily progress, material requests, issues, photos, and documents
- **CLIENT** – assigned-project portal with approved progress, photos, documents, and payment information
- **CONTRACTOR** – assigned projects, bills, payments, material requests, profile, and secure payment slip access

---

## ✅ Implemented Modules

### Core Project Management
- Client management
- Project management
- BOQ management
- Daily progress tracking
- Project-wise dashboard filtering
- Project status monitoring

### Finance & Accounts
- Project expenses
- Client payments
- Financial summaries
- Accounts / payment register
- Site cost summary
- Site reports
- Contractor bills
- Contractor ledger
- Subcontractor payments
- Payment slip upload and PDF analysis
- Secure contractor payment slip download

### Contractor Management
- Contractor / subcontractor records
- Contractor login accounts
- Contractor-to-user account linking
- Direct contractor project assignments
- Contractor dashboard
- Contractor project list
- Contractor bills and payments
- Contractor material requests
- Contractor-linked user lifecycle handling

### Labour Management
- Worker management
- Labour attendance
- Labour payments
- Labour cost integration with accounts and site cost reporting

### Site Operations
- Material requests with approval / rejection workflow
- Site photos
- Site issues
- Daily site progress
- Project documents and drawings
- Supervisor project access control

### Portals
- Client portal
- Supervisor portal
- Contractor portal

### Notifications & Audit
- Management notifications
- Unread notification count
- Project-related notifications
- Audit logs for important management actions

### Security
- JWT authentication
- Stateless Spring Security
- Role-based API authorization
- CLIENT / SUPERVISOR / CONTRACTOR portal isolation
- ADMIN-only user management
- ADMIN / MANAGER operational endpoints
- Secure file access with ownership validation

---

## 🚧 Current Development

The current development focus is **contractor project document visibility**.

Work in progress:

- Separate `contractorVisible` document permission
- Admin / Manager contractor visibility control
- Assigned-project document filtering for contractors
- Secure contractor document download
- Contractor portal document UI

---

## 🛠 Tech Stack

### Backend
- Java 17
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Data JPA
- Spring Security
- JWT (`jjwt` 0.12.6)
- Apache PDFBox 3.0.8
- Lombok
- Maven

### Frontend
- React 19
- React Router
- Axios
- Vite
- JavaScript
- HTML / CSS
- jsPDF
- jsPDF AutoTable

### Database
- MySQL 8

### Development Tools
- Git
- GitHub
- Postman
- MySQL Workbench
- VS Code / IntelliJ IDEA
- PowerShell

---

## 🏗 Architecture

The backend follows a layered architecture:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Entity / Model
    ↓
MySQL Database
```

Frontend communication:

```text
React / Vite
    ↓ Axios + JWT
Spring Boot REST API
    ↓
Business Services
    ↓
MySQL Database
```

---

## 📁 Project Structure

```text
construction-project-management-system/
│
├── backend/
│   ├── src/main/java/com/skyward/projectmanagement/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   │
│   ├── src/main/resources/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   └── components/
│   ├── package.json
│   └── vite.config.*
│
└── README.md
```

---

## 🔐 Authentication & Authorization

Authentication uses JWT tokens. After login, the frontend stores the authenticated user's role and token and sends the token with protected API requests.

Role examples:

```text
/api/client/**      → CLIENT
/api/supervisor/**  → SUPERVISOR
/api/contractor/**  → CONTRACTOR
/api/users/**       → ADMIN
```

Management and finance endpoints are restricted to appropriate ADMIN / MANAGER roles.

---

## ▶️ Local Development

### Backend

The backend runs on port `9090`.

Required environment variables include the database password and JWT secret.

```powershell
cd backend
$env:JWT_SECRET="YOUR_JWT_SECRET"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=9090"
```

Expected backend URL:

```text
http://localhost:9090
```

### Frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Expected frontend URL:

```text
http://localhost:5173
```

---

## 🧪 Build Commands

Backend compile:

```powershell
cd backend
.\mvnw.cmd clean compile
```

Frontend production build:

```powershell
cd frontend
npm.cmd run build
```

---

## 🔒 Security Notes

- Secrets should be provided through environment variables and must not be committed to Git.
- Uploaded payment slips and project documents are served through protected endpoints rather than exposing raw server file paths.
- Contractor payment slip access validates ownership before returning a file.
- Client, supervisor, and contractor portals are restricted to assigned or authorized project data.

---

## 🗺 Remaining Roadmap

- [ ] Complete contractor project document access
- [ ] Contractor document tab and secure file download UI
- [ ] Final finance consistency verification
- [ ] Full API endpoint authorization audit
- [ ] Full role-based regression testing
- [ ] UI / UX polish and validation improvements
- [ ] Production deployment configuration
- [ ] Production database / environment configuration
- [ ] Final project documentation
- [ ] Project proposal, presentation, and system architecture diagrams

---

## 📊 Development Status

**Current estimated completion: 88%**

The application is already usable as a functional MVP. Most core operational, financial, site-management, authentication, and portal modules are implemented. Remaining work is focused mainly on final contractor features, testing, deployment, and documentation.

---

## 📌 Project Purpose

This project is being developed as a practical software engineering portfolio project demonstrating:

- Full-stack application development
- REST API design
- Relational database design
- Role-based security
- JWT authentication
- File upload and protected file delivery
- Construction workflow modelling
- Financial data handling
- Git / GitHub development workflow

---

## 📄 Status

This project is under active development and is not yet considered production-ready.
