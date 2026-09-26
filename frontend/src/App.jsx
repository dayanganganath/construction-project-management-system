import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Boq from "./pages/Boq";
import Expenses from "./pages/Expenses";
import Payments from "./pages/Payments";
import DailyProgress from "./pages/DailyProgress";
import Login from "./pages/Login";

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function ProtectedLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");

    navigate("/login");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <h2>CPMS</h2>
          <p>Construction Management</p>
        </div>

        <nav className="nav-menu">
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/clients">
            Clients
          </NavLink>

          <NavLink to="/projects">
            Projects
          </NavLink>

          <NavLink to="/boq">
            BOQ
          </NavLink>

          <NavLink to="/expenses">
            Expenses
          </NavLink>

          <NavLink to="/payments">
            Payments
          </NavLink>

          <NavLink to="/progress">
            Daily Progress
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/clients"
            element={<Clients />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/boq"
            element={<Boq />}
          />

          <Route
            path="/expenses"
            element={<Expenses />}
          />

          <Route
            path="/payments"
            element={<Payments />}
          />

          <Route
            path="/progress"
            element={<DailyProgress />}
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;