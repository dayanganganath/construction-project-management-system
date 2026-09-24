import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import Login from "./pages/Login";
import { clearCredentials } from "./services/api";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Boq from "./pages/Boq";
import Expenses from "./pages/Expenses";
import Payments from "./pages/Payments";
import DailyProgress from "./pages/DailyProgress";


function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Login onLogin={setUser} />;

  const isAdmin = user.role === "ADMIN";

  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="brand">
            <h2>CPMS</h2>
            <p>Construction Management</p>
          </div>

          <div className="account-panel">
            <span>{user.username} · {user.role}</span>
            <button type="button" onClick={() => { clearCredentials(); setUser(null); }}>
              Sign out
            </button>
          </div>

          <nav className="nav-menu">
            <NavLink to="/" end>
              Dashboard
            </NavLink>

            {isAdmin && <NavLink to="/clients">
              Clients
            </NavLink>}

            {isAdmin && <NavLink to="/projects">
              Projects
            </NavLink>}

            {isAdmin && <NavLink to="/boq">
              BOQ
            </NavLink>}

            {isAdmin && <NavLink to="/expenses">
              Expenses
            </NavLink>}

            {isAdmin && <NavLink to="/payments">
              Payments
            </NavLink>}

            {isAdmin && <NavLink to="/progress">
              Daily Progress
            </NavLink>}
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            {isAdmin && <Route path="/clients" element={<Clients />} />}

            {isAdmin && <Route path="/projects" element={<Projects />} />}

            {isAdmin && <Route path="/boq" element={<Boq />} />}

            {isAdmin && <Route path="/expenses" element={<Expenses />} />}

            {isAdmin && <Route path="/payments" element={<Payments />} />}

            {isAdmin && <Route path="/progress" element={<DailyProgress />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
