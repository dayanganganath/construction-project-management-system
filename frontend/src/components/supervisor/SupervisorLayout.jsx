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

import "../../styles/supervisor-portal-polish.css";

function SupervisorLayout() {
  const navigate =
    useNavigate();

  const username =
    localStorage.getItem(
      "username"
    ) || "Supervisor";

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

  const [
    selectedProject,
    setSelectedProject,
  ] = useState(null);

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

    const timer =
      setInterval(
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

  const getProjectId = (
    project
  ) => {
    return (
      project?.projectId ??
      project?.id ??
      ""
    );
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
            "/supervisor/projects"
          );

        const data =
          response.data || [];

        setProjects(data);

        if (data.length > 0) {
          const firstProjectId =
            String(
              getProjectId(
                data[0]
              )
            );

          if (
            !firstProjectId ||
            firstProjectId ===
              "undefined" ||
            firstProjectId ===
              "null"
          ) {
            setError(
              "Assigned project ID was not found."
            );

            setSelectedProjectId(
              ""
            );

            setSelectedProject(
              null
            );

            return;
          }

          setSelectedProjectId(
            firstProjectId
          );

          await loadProject(
            firstProjectId
          );
        } else {
          setSelectedProjectId(
            ""
          );

          setSelectedProject(
            null
          );
        }
      } catch (error) {
        console.error(
          "Error loading supervisor projects:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load assigned projects."
          )
        );
      } finally {
        setLoading(false);
      }
    };

  const loadProject =
    async (projectId) => {
      if (!projectId) {
        setSelectedProject(
          null
        );

        return;
      }

      try {
        setLoadingProject(true);
        setError("");

        const response =
          await api.get(
            `/supervisor/projects/${projectId}`
          );

        setSelectedProject(
          response.data || null
        );
      } catch (error) {
        console.error(
          "Error loading project:",
          error
        );

        setSelectedProject(
          null
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load project details."
          )
        );
      } finally {
        setLoadingProject(
          false
        );
      }
    };

  const handleProjectChange =
    async (event) => {
      const value =
        event.target.value;

      setSelectedProjectId(
        value
      );

      if (value) {
        await loadProject(
          value
        );
      } else {
        setSelectedProject(
          null
        );
      }
    };

  const refreshSelectedProject =
    async () => {
      if (
        selectedProjectId
      ) {
        await loadProject(
          selectedProjectId
        );
      }
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

  return (
    <div className="supervisor-shell">
      <aside className="supervisor-sidebar">
        <div className="supervisor-brand">
          <div className="supervisor-brand-mark">
            C
          </div>

          <div>
            <h2>CPMS</h2>

            <p>
              Supervisor Portal
            </p>
          </div>
        </div>

        <div className="supervisor-nav-label">
          Site Management
        </div>

        <nav className="supervisor-nav">
          <NavLink
            to="/supervisor"
            end
          >
            <span className="supervisor-nav-icon">
              DB
            </span>

            Dashboard
          </NavLink>

          <NavLink
            to="/supervisor/progress"
          >
            <span className="supervisor-nav-icon">
              DP
            </span>

            Daily Progress
          </NavLink>

          <NavLink
            to="/supervisor/material-requests"
          >
            <span className="supervisor-nav-icon">
              MR
            </span>

            Material Requests
          </NavLink>

          <NavLink
            to="/supervisor/site-photos"
          >
            <span className="supervisor-nav-icon">
              PH
            </span>

            Site Photos
          </NavLink>

          <NavLink
            to="/supervisor/site-issues"
          >
            <span className="supervisor-nav-icon">
              IS
            </span>

            Site Issues
          </NavLink>

          <NavLink
            to="/supervisor/documents"
          >
            <span className="supervisor-nav-icon">
              DC
            </span>

            Documents
          </NavLink>
        </nav>

        <div className="supervisor-sidebar-footer">
          <div className="supervisor-user-card">
            <div className="supervisor-user-avatar">
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {username}
              </strong>

              <span>
                SUPERVISOR
              </span>
            </div>
          </div>

          <button
            type="button"
            className="supervisor-signout"
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

      <main className="supervisor-main">
        <header className="supervisor-topbar">
          <div>
            <p className="supervisor-greeting">
              {getGreeting()},
            </p>

            <h1>
              {username}
            </h1>

            <p className="supervisor-topbar-subtitle">
              Manage your assigned
              construction site
              activities.
            </p>
          </div>

          <div className="supervisor-project-selector">
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
              disabled={
                loading ||
                projects.length ===
                  0
              }
            >
              {projects.length ===
              0 ? (
                <option value="">
                  No assigned
                  projects
                </option>
              ) : (
                projects.map(
                  (project) => {
                    const projectId =
                      getProjectId(
                        project
                      );

                    return (
                      <option
                        key={
                          projectId
                        }
                        value={
                          projectId
                        }
                      >
                        {project.projectName ||
                          project.name ||
                          `Project ${projectId}`}
                      </option>
                    );
                  }
                )
              )}
            </select>
          </div>
        </header>

        {error && (
          <div className="supervisor-alert-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="supervisor-page-loading">
            Loading assigned
            projects...
          </div>
        ) : (
          <Outlet
            context={{
              projects,
              selectedProjectId,
              selectedProject,
              loadingProject,
              refreshSelectedProject,
            }}
          />
        )}
      </main>
    </div>
  );
}

export default SupervisorLayout;