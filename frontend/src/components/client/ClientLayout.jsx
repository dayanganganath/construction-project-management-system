import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";

function ClientLayout() {
  const navigate =
    useNavigate();

  const username =
    localStorage.getItem(
      "username"
    ) || "Client";

  const [
    currentTime,
    setCurrentTime,
  ] = useState(
    new Date()
  );

  const [projects, setProjects] =
    useState([]);

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState("");

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    loadingProject,
    setLoadingProject,
  ] = useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadProjects();

    const timer = setInterval(
      () => {
        setCurrentTime(
          new Date()
        );
      },
      60000
    );

    return () => {
      clearInterval(timer);
    };
  }, []);

  const getGreeting = () => {
    const hour =
      currentTime.getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  };

  const getErrorMessage = (
    error,
    fallback
  ) => {
    if (
      typeof error.response?.data ===
      "string"
    ) {
      return error.response.data;
    }

    return (
      error.response?.data
        ?.message || fallback
    );
  };

  const loadProjects =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/client/projects"
          );

        const data =
          response.data || [];

        setProjects(data);

        if (data.length > 0) {
          const firstProjectId =
            data[0].projectId ??
            data[0].id;

          const id = String(
            firstProjectId
          );

          setSelectedProjectId(
            id
          );

          await loadDashboard(
            id
          );
        } else {
          setDashboard(null);
        }
      } catch (error) {
        console.error(
          "Unable to load client projects:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load your projects."
          )
        );
      } finally {
        setLoading(false);
      }
    };

  const loadDashboard =
    async (projectId) => {
      if (!projectId) {
        setDashboard(null);
        return;
      }

      try {
        setLoadingProject(true);
        setError("");

        const response =
          await api.get(
            `/client/projects/${projectId}/dashboard`
          );

        setDashboard(
          response.data
        );
      } catch (error) {
        console.error(
          "Unable to load project dashboard:",
          error
        );

        setDashboard(null);

        setError(
          getErrorMessage(
            error,
            "Unable to load project information."
          )
        );
      } finally {
        setLoadingProject(false);
      }
    };

  const handleProjectChange =
    async (event) => {
      const id =
        event.target.value;

      setSelectedProjectId(id);

      await loadDashboard(id);
    };

  const handleLogout = () => {
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
  };

  const formatCurrency = (
    value
  ) => {
    return new Intl.NumberFormat(
      "en-LK",
      {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
      }
    ).format(
      Number(value || 0)
    );
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString(
      "en-GB"
    );
  };

  if (loading) {
    return (
      <div className="client-full-loading">
        Loading client
        portal...
      </div>
    );
  }

  return (
    <div className="client-shell">
      <aside className="client-sidebar">
        <div className="client-brand">
          <div className="client-brand-mark">
            C
          </div>

          <div>
            <h2>CPMS</h2>
            <p>
              Client Portal
            </p>
          </div>
        </div>

        <div className="client-nav-label">
          Client Portal
        </div>

        <nav className="client-nav">
          <NavLink
            to="/client"
            end
          >
            <span className="client-nav-icon">
              OV
            </span>
            Overview
          </NavLink>

          <NavLink
            to="/client/project"
          >
            <span className="client-nav-icon">
              PR
            </span>
            Project Details
          </NavLink>

          <NavLink
            to="/client/payments"
          >
            <span className="client-nav-icon">
              PY
            </span>
            Payments
          </NavLink>

          <NavLink
            to="/client/photos"
          >
            <span className="client-nav-icon">
              PH
            </span>
            Site Photos
          </NavLink>

          <NavLink
            to="/client/documents"
          >
            <span className="client-nav-icon">
              DC
            </span>
            Documents
          </NavLink>
        </nav>

        <div className="client-sidebar-footer">
          <div className="client-user-card">
            <div className="client-user-avatar">
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {username}
              </strong>

              <span>
                CLIENT
              </span>
            </div>
          </div>

          <button
            type="button"
            className="client-signout"
            onClick={
              handleLogout
            }
          >
            <span>
              Sign Out
            </span>

            <span>→</span>
          </button>
        </div>
      </aside>

      <main className="client-main">
        <header className="client-topbar">
          <div>
            <p className="client-greeting">
              {getGreeting()},
            </p>

            <h1>
              {username}
            </h1>
          </div>

          {projects.length >
            0 && (
            <div className="client-project-selector">
              <label>
                Current Project
              </label>

              <select
                value={
                  selectedProjectId
                }
                onChange={
                  handleProjectChange
                }
              >
                {projects.map(
                  (project) => {
                    const id =
                      project.projectId ??
                      project.id;

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {
                          project.projectName
                        }
                      </option>
                    );
                  }
                )}
              </select>
            </div>
          )}
        </header>

        {error && (
          <div className="client-alert-error">
            {error}
          </div>
        )}

        {projects.length ===
        0 ? (
          <div className="client-empty-card">
            <h2>
              No projects assigned
            </h2>

            <p>
              There are currently
              no projects assigned
              to your client
              account.
            </p>
          </div>
        ) : (
          <Outlet
            context={{
              selectedProjectId,
              dashboard,
              loadingProject,
              formatCurrency,
              formatDate,
            }}
          />
        )}
      </main>
    </div>
  );
}

export default ClientLayout;