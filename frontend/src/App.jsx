import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Boq from "./pages/Boq";
import Expenses from "./pages/Expenses";
import Payments from "./pages/Payments";
import DailyProgress from "./pages/DailyProgress";
import Users from "./pages/Users";
import Login from "./pages/Login";

import Contractors from "./pages/Contractors";
import ContractorBills from "./pages/ContractorBills";
import ContractorLedger from "./pages/ContractorLedger";
import SubcontractorPayments from "./pages/SubcontractorPayments";
import Accounts from "./pages/Accounts";
import SiteCostSummary from "./pages/SiteCostSummary";
import SiteReport from "./pages/SiteReport";

import ClientPortal from "./pages/ClientPortal";
import SupervisorPortal from "./pages/SupervisorPortal";

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function logoutAndGoToLogin(navigate) {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("token");

  navigate("/login", {
    replace: true,
  });
}

function AdminLayout() {
  const navigate = useNavigate();

  const role =
    localStorage.getItem("role");

  const username =
    localStorage.getItem("username");

  const handleLogout = () => {
    logoutAndGoToLogin(navigate);
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <h2>CPMS</h2>
          <p>
            Construction Management
          </p>
        </div>

        <nav className="nav-menu">
          <NavLink
            to="/"
            end
          >
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
            Client Payments
          </NavLink>

          <NavLink to="/contractors">
            Contractors
          </NavLink>

          <NavLink to="/contractor-bills">
            Contractor Bills
          </NavLink>

          <NavLink to="/contractor-ledger">
            Contractor Ledger
          </NavLink>

          <NavLink to="/subcontractor-payments">
            Subcontractor Payments
          </NavLink>

          <NavLink to="/accounts">
            Accounts / Payment Register
          </NavLink>

          <NavLink to="/site-cost-summary">
            Site Cost Summary
          </NavLink>

          <NavLink to="/site-report">
            Site Report
          </NavLink>

          <NavLink to="/progress">
            Daily Progress
          </NavLink>

          {role === "ADMIN" && (
            <NavLink to="/users">
              Users
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          {username && (
            <div className="logged-user">
              <p>{username}</p>
              <span>{role}</span>
            </div>
          )}

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
            path="/contractors"
            element={<Contractors />}
          />

          <Route
            path="/contractor-bills"
            element={<ContractorBills />}
          />

          <Route
            path="/contractor-ledger"
            element={<ContractorLedger />}
          />

          <Route
            path="/subcontractor-payments"
            element={
              <SubcontractorPayments />
            }
          />

          <Route
            path="/accounts"
            element={<Accounts />}
          />

          <Route
            path="/site-cost-summary"
            element={
              <SiteCostSummary />
            }
          />

          <Route
            path="/site-report"
            element={<SiteReport />}
          />

          <Route
            path="/progress"
            element={<DailyProgress />}
          />

          <Route
            path="/users"
            element={
              role === "ADMIN" ? (
                <Users />
              ) : (
                <Navigate
                  to="/"
                  replace
                />
              )
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function RoleBasedProtectedArea() {
  const role =
    localStorage.getItem("role");

  if (role === "CLIENT") {
    return (
      <Routes>
        <Route
          path="/client"
          element={<ClientPortal />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/client"
              replace
            />
          }
        />
      </Routes>
    );
  }

  if (role === "SUPERVISOR") {
    return (
      <Routes>
        <Route
          path="/supervisor"
          element={
            <SupervisorPortal />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/supervisor"
              replace
            />
          }
        />
      </Routes>
    );
  }

  if (
    role === "ADMIN" ||
    role === "MANAGER"
  ) {
    return <AdminLayout />;
  }

  return (
    <Navigate
      to="/login"
      replace
    />
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
              <RoleBasedProtectedArea />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;