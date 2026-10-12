import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";

function SupervisorLayout() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] =
    useState("");
  const [selectedProject, setSelectedProject] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] =
    useState(false);

  const [error, setError] = useState("");

  const username =
    localStorage.getItem("username");

  const role =
    localStorage.getItem("role");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
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
        const firstId =
          data[0].projectId;

        setSelectedProjectId(
          String(firstId)
        );

        await loadProject(
          firstId
        );
      } else {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error(
        "Error loading supervisor projects:",
        error
      );

      setError(
        typeof error.response?.data ===
          "string"
          ? error.response.data
          : error.response?.data?.message ||
            "Unable to load assigned sites."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async (
    projectId
  ) => {
    if (!projectId) {
      setSelectedProject(null);
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
        response.data
      );
    } catch (error) {
      console.error(
        "Error loading site:",
        error
      );

      setSelectedProject(null);

      setError(
        typeof error.response?.data ===
          "string"
          ? error.response.data
          : error.response?.data?.message ||
            "Unable to load site details."
      );
    } finally {
      setLoadingProject(false);
    }
  };

  const handleProjectChange =
    async (e) => {
      const projectId =
        e.target.value;

      setSelectedProjectId(
        projectId
      );

      await loadProject(
        projectId
      );
    };

  const refreshSelectedProject =
    async () => {
      if (selectedProjectId) {
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading supervisor portal...
      </div>
    );
  }

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
        </nav>
        

        <div className="sidebar-footer">
          <div className="logged-user">
            <p>
              {username ||
                "Supervisor"}
            </p>

            <span>
              {role ||
                "SUPERVISOR"}
            </span>
          </div>

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

          {projects.length > 0 && (
            <select
              className="project-filter"
              value={
                selectedProjectId
              }
              onChange={
                handleProjectChange
              }
            >
              {projects.map(
                (project) => (
                  <option
                    key={
                      project.projectId
                    }
                    value={
                      project.projectId
                    }
                  >
                    {
                      project.projectName
                    }

                    {project.location
                      ? ` - ${project.location}`
                      : ""}
                  </option>
                )
              )}
            </select>
          )}
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="form-card">
            <h2>
              No Sites Assigned
            </h2>

            <p>
              No project/site is
              currently assigned to
              this supervisor account.
            </p>
          </div>
        ) : loadingProject ? (
          <div className="dashboard-loading">
            Loading site details...
          </div>
        ) : (
          <Outlet
            context={{
              selectedProjectId,
              selectedProject,
              refreshSelectedProject,
            }}
          />
        )}
      </main>
    </div>
  );
}

export default SupervisorLayout;