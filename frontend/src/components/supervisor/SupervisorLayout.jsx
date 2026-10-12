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

function SupervisorLayout() {
  const navigate = useNavigate();

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

  const username =
    localStorage.getItem(
      "username"
    );

  useEffect(() => {
    loadProjects();
  }, []);

  const getProjectId = (
    project
  ) => {
    return (
      project?.projectId ??
      project?.id ??
      ""
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
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to load assigned projects."
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
        setLoadingProject(
          true
        );

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
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to load project details."
        );
      } finally {
        setLoadingProject(
          false
        );
      }
    };

  const handleProjectChange =
    async (e) => {
      const value =
        e.target.value;

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
            to="/supervisor"
            end
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/supervisor/progress"
          >
            Daily Progress
          </NavLink>

          <NavLink
            to="/supervisor/material-requests"
          >
            Material Requests
          </NavLink>

          <NavLink
            to="/supervisor/site-photos"
          >
            Site Photos
          </NavLink>

          <NavLink
  to="/supervisor/site-issues"
>
  Site Issues
</NavLink>
        </nav>

        <div className="sidebar-footer">
          {username && (
            <div className="logged-user">
              <p>
                {username}
              </p>

              <span>
                SUPERVISOR
              </span>
            </div>
          )}

          <button
            type="button"
            className="logout-button"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1>
              Supervisor Portal
            </h1>

            <p>
              Manage your assigned
              construction sites.
            </p>
          </div>

          <div>
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
                  No assigned projects
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

                        {project.location
                          ? ` - ${project.location}`
                          : ""}
                      </option>
                    );
                  }
                )
              )}
            </select>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="form-card">
            <p>
              Loading assigned
              projects...
            </p>
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