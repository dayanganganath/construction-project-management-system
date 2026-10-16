# Construction Project Management System

![Project Status](https://img.shields.io/badge/Development-95%25%20Complete-brightgreen)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-success)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Database](https://img.shields.io/badge/Database-MySQL-orange)
![Security](https://img.shields.io/badge/Security-JWT%20%2B%20Role%20Based-red)

> 🚧 **Overall Project Progress: 95% Complete**  
> Core development, role-based portals, finance consistency, security checks, contractor document access, supervisor document management, and regression testing are completed. Remaining work is mainly focused on deployment readiness, production configuration, and final project documentation.

A full-stack construction management platform built to manage project operations, finance, site progress, clients, contractors, labour, documents, and role-based portals in one centralized system.

---

## 🚀 Project Overview

The Construction Project Management System is designed for real-world construction project workflows.

It provides centralized management for:

- Projects
- Clients
- Contractors
- Construction finance
- Site operations
- Labour
- Documents
- Material requests
- Progress tracking
- Project-related notifications
- Audit logs
- Role-based user portals

The application follows a REST API based architecture using a Spring Boot backend, React frontend, MySQL database, JWT authentication, and role-based authorization.

---

## 👥 User Roles

The system supports the following roles:

### ADMIN

Full administrative access including:

- User management
- Client management
- Project management
- Contractor management
- Financial management
- Project assignments
- System-wide operational access
- Audit logs
- Notifications

### MANAGER

Management-level operational and financial access including:

- Projects
- Clients
- BOQ
- Expenses
- Payments
- Contractors
- Contractor bills
- Labour
- Site operations
- Reports
- Documents
- Audit logs
- Notifications

### SUPERVISOR

Assigned-site access including:

- Assigned projects
- Daily progress
- Material requests
- Site issues
- Site photos
- Project documents
- Secure project document upload/download

### CLIENT

Assigned-project portal access including:

- Assigned projects
- Client dashboard
- Project progress
- Approved site photos
- Client-visible project documents
- Secure document downloads

Sensitive internal financial and contractor information is not exposed to client users.

### CONTRACTOR

Contractor portal access including:

- Assigned projects
- Contractor profile
- Bills
- Payments
- Financial dashboard
- Material requests
- Contractor-visible documents
- Secure document downloads
- Secure payment slip downloads

---

## ✅ Implemented Modules

## Core Project Management

- Client management
- Project management
- Project assignments
- BOQ management
- BOQ item management
- Daily progress tracking
- Project progress tracking
- Project-wise dashboard information
- Project status monitoring

---

## Finance & Accounts

- Project expenses
- Client payments
- Financial summary
- Accounts / payment register
- Site cost summary
- Site reports
- Contractor bills
- Contractor ledger
- Subcontractor payments
- Payment slip upload
- Payment slip PDF analysis
- Secure contractor payment slip download
- Contractor bill payment synchronization
- Contractor bill balance calculation
- Contractor bill payment status calculation
- Unallocated payment tracking
- Contractor finance consistency validation

Contractor finance logic maintains separate totals for:

```text
Total Net Payable
Total Paid Against Bills
Total Payment Transactions
Unallocated Payments
Outstanding Balance