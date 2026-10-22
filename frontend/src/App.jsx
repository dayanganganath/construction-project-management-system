import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  Navigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import api from "./services/api";

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

import Workers from "./pages/Workers";
import LabourAttendance from "./pages/LabourAttendance";
import LabourPayments from "./pages/LabourPayments";

import MaterialRequests from "./pages/MaterialRequests";
import SitePhotos from "./pages/SitePhotos";
import SiteIssues from "./pages/SiteIssues";
import ProjectDocuments from "./pages/ProjectDocuments";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";

import ClientPortal from "./pages/ClientPortal";
import ContractorPortal from "./pages/ContractorPortal";

import SupervisorLayout from "./components/supervisor/SupervisorLayout";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import SupervisorProgress from "./pages/supervisor/SupervisorProgress";
import SupervisorMaterialRequests from "./pages/supervisor/SupervisorMaterialRequests";
import SupervisorSitePhotos from "./pages/supervisor/SupervisorSitePhotos";
import SupervisorSiteIssues from "./pages/supervisor/SupervisorSiteIssues";
import SupervisorDocuments from "./pages/supervisor/SupervisorDocuments";

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";
import "./styles/sidebar-polish.css";

function logoutAndGoToLogin(
  navigate
) {
  localStorage.removeItem(
    "isAuthenticated"
  );

  localStorage.removeItem(
    "username"
  );

  localStorage.removeItem(
    "role"
  );

  localStorage.removeItem(
    "token"
  );

  navigate(
    "/login",
    {
      replace: true,
    }
  );
}

function NavigationItem({
  to,
  label,
  code,
  end = false,
  badge = null,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className="cpms-nav-item"
    >
      <span className="cpms-nav-icon">
        {code}
      </span>

      <span className="cpms-nav-label">
        {label}
      </span>

      {badge !== null &&
        Number(badge) > 0 && (
          <span className="cpms-nav-badge">
            {Number(badge) > 99
              ? "99+"
              : badge}
          </span>
        )}
    </NavLink>
  );
}

function NavigationSection({
  title,
  children,
}) {
  return (
    <div className="cpms-nav-section">
      <div className="cpms-nav-section-title">
        {title}
      </div>

      <div className="cpms-nav-section-links">
        {children}
      </div>
    </div>
  );
}

function AdminLayout() {
  const navigate =
    useNavigate();

  const role =
    localStorage.getItem(
      "role"
    );

  const username =
    localStorage.getItem(
      "username"
    );

  const [
    unreadNotificationCount,
    setUnreadNotificationCount,
  ] = useState(0);

  useEffect(() => {
    loadUnreadNotificationCount();

    const handleUpdate =
      () => {
        loadUnreadNotificationCount();
      };

    window.addEventListener(
      "notifications-updated",
      handleUpdate
    );

    const interval =
      setInterval(
        () => {
          loadUnreadNotificationCount();
        },
        30000
      );

    return () => {
      window.removeEventListener(
        "notifications-updated",
        handleUpdate
      );

      clearInterval(
        interval
      );
    };
  }, []);

  const loadUnreadNotificationCount =
    async () => {
      try {
        const response =
          await api.get(
            "/notifications/unread-count"
          );

        setUnreadNotificationCount(
          Number(
            response.data
              ?.count || 0
          )
        );
      } catch (error) {
        console.error(
          "Unable to load notification count:",
          error
        );

        setUnreadNotificationCount(
          0
        );
      }
    };

  const handleLogout =
    () => {
      logoutAndGoToLogin(
        navigate
      );
    };

  return (
    <div className="app-layout">
      <aside className="sidebar cpms-sidebar">
        <div className="cpms-sidebar-header">
          <div className="cpms-brand-mark">
            C
          </div>

          <div className="cpms-brand-copy">
            <h2>
              CPMS
            </h2>

            <p>
              Construction Management
            </p>
          </div>
        </div>

        <div className="cpms-sidebar-divider" />

        <nav className="nav-menu cpms-nav-scroll">
          <NavigationSection
            title="Overview"
          >
            <NavigationItem
              to="/"
              label="Dashboard"
              code="DB"
              end
            />

            <NavigationItem
              to="/notifications"
              label="Notifications"
              code="NT"
              badge={
                unreadNotificationCount
              }
            />

            <NavigationItem
              to="/audit-logs"
              label="Audit Logs"
              code="AL"
            />
          </NavigationSection>

          <NavigationSection
            title="Project Management"
          >
            <NavigationItem
              to="/clients"
              label="Clients"
              code="CL"
            />

            <NavigationItem
              to="/projects"
              label="Projects"
              code="PR"
            />

            <NavigationItem
              to="/boq"
              label="BOQ"
              code="BQ"
            />

            <NavigationItem
              to="/progress"
              label="Daily Progress"
              code="DP"
            />

            <NavigationItem
              to="/site-report"
              label="Site Report"
              code="SR"
            />
          </NavigationSection>

          <NavigationSection
            title="Finance"
          >
            <NavigationItem
              to="/expenses"
              label="Expenses"
              code="EX"
            />

            <NavigationItem
              to="/payments"
              label="Client Payments"
              code="CP"
            />

            <NavigationItem
              to="/accounts"
              label="Payment Register"
              code="AC"
            />

            <NavigationItem
              to="/site-cost-summary"
              label="Site Cost Summary"
              code="CS"
            />
          </NavigationSection>

          <NavigationSection
            title="Contractors"
          >
            <NavigationItem
              to="/contractors"
              label="Contractors"
              code="CT"
            />

            <NavigationItem
              to="/contractor-bills"
              label="Contractor Bills"
              code="CB"
            />

            <NavigationItem
              to="/contractor-ledger"
              label="Contractor Ledger"
              code="LG"
            />

            <NavigationItem
              to="/subcontractor-payments"
              label="Contractor Payments"
              code="SP"
            />
          </NavigationSection>

          <NavigationSection
            title="Workforce"
          >
            <NavigationItem
              to="/workers"
              label="Workers"
              code="WK"
            />

            <NavigationItem
              to="/labour-attendance"
              label="Labour Attendance"
              code="AT"
            />

            <NavigationItem
              to="/labour-payments"
              label="Labour Payments"
              code="LP"
            />
          </NavigationSection>

          <NavigationSection
            title="Site Operations"
          >
            <NavigationItem
              to="/material-requests"
              label="Material Requests"
              code="MR"
            />

            <NavigationItem
              to="/site-photos"
              label="Site Photos"
              code="PH"
            />

            <NavigationItem
              to="/site-issues"
              label="Site Issues"
              code="IS"
            />

            <NavigationItem
              to="/documents"
              label="Documents"
              code="DC"
            />
          </NavigationSection>

          {role === "ADMIN" && (
            <NavigationSection
              title="System"
            >
              <NavigationItem
                to="/users"
                label="User Management"
                code="US"
              />
            </NavigationSection>
          )}
        </nav>

        <div className="cpms-sidebar-footer">
          <div className="cpms-user-card">
            <div className="cpms-user-avatar">
              {username
                ? username
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>

            <div className="cpms-user-info">
              <strong>
                {username ||
                  "User"}
              </strong>

              <span>
                {role ||
                  "USER"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="cpms-logout-button"
            onClick={
              handleLogout
            }
          >
            <span>
              Sign Out
            </span>

            <span>
              →
            </span>
          </button>
        </div>
      </aside>

      <main className="main-content cpms-main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard />
            }
          />

          <Route
            path="/notifications"
            element={
              <Notifications />
            }
          />

          <Route
            path="/audit-logs"
            element={
              <AuditLogs />
            }
          />

          <Route
            path="/clients"
            element={
              <Clients />
            }
          />

          <Route
            path="/projects"
            element={
              <Projects />
            }
          />

          <Route
            path="/boq"
            element={
              <Boq />
            }
          />

          <Route
            path="/expenses"
            element={
              <Expenses />
            }
          />

          <Route
            path="/payments"
            element={
              <Payments />
            }
          />

          <Route
            path="/contractors"
            element={
              <Contractors />
            }
          />

          <Route
            path="/contractor-bills"
            element={
              <ContractorBills />
            }
          />

          <Route
            path="/contractor-ledger"
            element={
              <ContractorLedger />
            }
          />

          <Route
            path="/subcontractor-payments"
            element={
              <SubcontractorPayments />
            }
          />

          <Route
            path="/workers"
            element={
              <Workers />
            }
          />

          <Route
            path="/labour-attendance"
            element={
              <LabourAttendance />
            }
          />

          <Route
            path="/labour-payments"
            element={
              <LabourPayments />
            }
          />

          <Route
            path="/material-requests"
            element={
              <MaterialRequests />
            }
          />

          <Route
            path="/site-photos"
            element={
              <SitePhotos />
            }
          />

          <Route
            path="/site-issues"
            element={
              <SiteIssues />
            }
          />

          <Route
            path="/documents"
            element={
              <ProjectDocuments />
            }
          />

          <Route
            path="/accounts"
            element={
              <Accounts />
            }
          />

          <Route
            path="/site-cost-summary"
            element={
              <SiteCostSummary />
            }
          />

          <Route
            path="/site-report"
            element={
              <SiteReport />
            }
          />

          <Route
            path="/progress"
            element={
              <DailyProgress />
            }
          />

          <Route
            path="/users"
            element={
              role ===
              "ADMIN" ? (
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
    localStorage.getItem(
      "role"
    );

  if (
    role === "CLIENT"
  ) {
    return (
      <Routes>
        <Route
          path="/client"
          element={
            <ClientPortal />
          }
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

  if (
    role ===
    "SUPERVISOR"
  ) {
    return (
      <Routes>
        <Route
          path="/supervisor"
          element={
            <SupervisorLayout />
          }
        >
          <Route
            index
            element={
              <SupervisorDashboard />
            }
          />

          <Route
            path="progress"
            element={
              <SupervisorProgress />
            }
          />

          <Route
            path="material-requests"
            element={
              <SupervisorMaterialRequests />
            }
          />

          <Route
            path="site-photos"
            element={
              <SupervisorSitePhotos />
            }
          />

          <Route
            path="site-issues"
            element={
              <SupervisorSiteIssues />
            }
          />

          <Route
            path="documents"
            element={
              <SupervisorDocuments />
            }
          />
        </Route>

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
    role ===
    "CONTRACTOR"
  ) {
    return (
      <Routes>
        <Route
          path="/contractor"
          element={
            <ContractorPortal />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/contractor"
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
    return (
      <AdminLayout />
    );
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
          element={
            <Login />
          }
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