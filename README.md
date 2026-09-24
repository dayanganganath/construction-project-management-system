# Construction Project Management System

A full-stack application for tracking construction clients, projects, BOQ items, expenses, payments, daily progress, and dashboard information. This is an active learning project.

![CI](https://github.com/dayanganganath/construction-project-management-system/actions/workflows/ci.yml/badge.svg)

## Current implementation

- React pages for dashboard, clients, projects, BOQ, expenses, payments, and daily progress
- Spring Boot controllers, services, repositories, and MySQL-backed models for the same workflows
- Client and project management, including project create/edit/delete forms
- GitHub Actions runs backend tests, frontend lint, and both builds on pushes and pull requests

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Vite, JavaScript, React Router, Axios |
| Backend | Java 17, Spring Boot, Spring Data JPA |
| Database | MySQL |
| Workflow | Maven, npm, GitHub Actions |

## Run locally

Prerequisites: Java 17, Node.js with npm, and a running MySQL server.

1. Create a MySQL database named `construction_management` (or point `DB_URL` to a database you have created).
2. Set these environment variables in your terminal before starting the backend:
   - `DB_USER` — your local MySQL username
   - `DB_PASSWORD` — your local MySQL password
   - `DB_URL` — optional; defaults to `jdbc:mysql://localhost:3306/construction_management`
3. Start the backend:
   - Windows PowerShell: `cd backend; .\mvnw.cmd spring-boot:run`
   - macOS/Linux: `cd backend && ./mvnw spring-boot:run`
4. In a second terminal, run `cd frontend && npm ci && npm run dev`.
5. Open the address printed by Vite (normally `http://localhost:5173`). The frontend currently expects the backend at `http://localhost:8080/api`.

Example for PowerShell (replace the placeholders locally; do not commit credentials):

```powershell
$env:DB_USER="your_mysql_username"
$env:DB_PASSWORD="your_mysql_password"
$env:DB_URL="jdbc:mysql://localhost:3306/construction_management"
cd backend
.\mvnw.cmd spring-boot:run
```

## Roadmap

- Expand backend unit tests and add frontend interaction tests
- Add authentication and role-based access
- Make API origin and URL configurable for deployment
- Add project screenshots and a live demo
- Keep generated dependency folders out of future commits (previously tracked node_modules files have been removed from the current branch)

> If a real database password was previously committed, change that password in MySQL. Editing the config does not erase it from Git history.
