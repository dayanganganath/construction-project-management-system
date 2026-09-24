# Construction Project Management System

A full-stack application for tracking construction clients, projects, BOQ items, expenses, payments, daily progress, and dashboard information. This is an active learning project.

![CI](https://github.com/dayanganganath/construction-project-management-system/actions/workflows/ci.yml/badge.svg)

## Current implementation

- React pages for dashboard, clients, projects, BOQ, expenses, payments, and daily progress
- Spring Boot controllers, services, repositories, and MySQL-backed models for the same workflows
- Client and project management, including project create/edit/delete forms
- Local sign-in with separate Admin and Viewer roles. Viewers can read the API and dashboard; only Admins can change records.
- GitHub Actions runs backend tests, frontend lint, and both builds on pushes and pull requests

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Vite, JavaScript, React Router, Axios |
| Backend | Java 17, Spring Boot, Spring Security, Spring Data JPA |
| Database | MySQL |
| Workflow | Maven, npm, GitHub Actions |

## Run locally

Prerequisites: Java 17, Node.js with npm, and a running MySQL server.

### Docker Compose (recommended for local practice)

1. Install Docker Desktop and open it.
2. Copy `.env.example` to `.env` in the project root. Replace the example passwords with different passwords of your own. Never commit `.env`.
3. From the project root run `docker compose up --build -d`.
4. Open `http://localhost:5173` and sign in with the Admin or Viewer account from your `.env`.
5. Check container output with `docker compose logs -f backend`. Stop with `docker compose down`.

The MySQL database is stored in the `mysql_data` Docker volume, so `docker compose down` keeps your records. `docker compose down -v` **deletes the volume and its data**. To use MySQL Workbench, connect to `127.0.0.1:3307` with your `DB_USER` and `DB_PASSWORD`. The app's API is available locally on port 8080.

### Manual setup

1. Create a MySQL database named `construction_management` (or point `DB_URL` to a database you have created).
2. Set these environment variables in your terminal before starting the backend:
   - `DB_USER` — your local MySQL username
   - `DB_PASSWORD` — your local MySQL password
   - `DB_URL` — optional; defaults to `jdbc:mysql://localhost:3306/construction_management`
   - `APP_ADMIN_USERNAME` and `APP_ADMIN_PASSWORD` — credentials for the write-enabled account
   - `APP_VIEWER_USERNAME` and `APP_VIEWER_PASSWORD` — credentials for the read-only account
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
$env:APP_ADMIN_USERNAME="admin-local"
$env:APP_ADMIN_PASSWORD="choose-a-strong-unique-password"
$env:APP_VIEWER_USERNAME="viewer-local"
$env:APP_VIEWER_PASSWORD="choose-a-different-strong-password"
cd backend
.\mvnw.cmd spring-boot:run
```

## Roadmap

- Expand backend unit tests and add frontend interaction tests
- Replace local in-memory accounts and HTTP Basic with database-backed authentication for deployment
- Make API origin and URL configurable for deployment
- Add project screenshots and a live demo
- Keep generated dependency folders out of future commits (previously tracked node_modules files have been removed from the current branch)

> If a real database password was previously committed, change that password in MySQL. Editing the config does not erase it from Git history.

The current sign-in is intended for local development. It keeps account passwords in server memory and browser memory for the current page only; refreshing the page signs you out. Do not expose this HTTP Basic setup on the public internet. Use HTTPS and a suitable production authentication design before deployment.
