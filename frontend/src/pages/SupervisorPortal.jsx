import { useEffect, useState } from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

function SupervisorPortal() {
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
        const firstProjectId =
          data[0].projectId;

        setSelectedProjectId(
          firstProjectId
        );

        setSelectedProject(
          data[0]
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
        error.response?.data?.message ||
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
        "Error loading project:",
        error
      );

      setSelectedProject(null);

      setError(
        error.response?.data?.message ||
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

    navigate("/login");
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(
      value
    ).toLocaleDateString();
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
              Supervisor Dashboard
            </h1>

            <p>
              View assigned sites,
              latest progress and
              site activity.
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
            <span>{error}</span>
          </div>
        )}

        {projects.length ===
        0 ? (
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
          selectedProject && (
            <>
              <div className="selected-project-info">
                <h2>
                  {
                    selectedProject.projectName
                  }
                </h2>

                <p>
                  {selectedProject.description ||
                    "No project description available."}
                </p>

                <div className="project-info-details">
                  <p>
                    <strong>
                      Location:
                    </strong>{" "}
                    {selectedProject.location ||
                      "-"}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    {selectedProject.status ||
                      "-"}
                  </p>

                  <p>
                    <strong>
                      Start Date:
                    </strong>{" "}
                    {formatDate(
                      selectedProject.startDate
                    )}
                  </p>

                  <p>
                    <strong>
                      End Date:
                    </strong>{" "}
                    {formatDate(
                      selectedProject.endDate
                    )}
                  </p>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="dashboard-card blue">
                  <p>
                    Latest Progress
                  </p>

                  <h2>
                    {selectedProject.latestProgressPercentage ??
                      0}
                    %
                  </h2>
                </div>

                <div className="dashboard-card green">
                  <p>
                    Workers on Site
                  </p>

                  <h2>
                    {selectedProject.latestWorkersCount ??
                      0}
                  </h2>
                </div>

                <div className="dashboard-card orange">
                  <p>
                    Last Update
                  </p>

                  <h2 className="date-value">
                    {formatDate(
                      selectedProject.latestProgressDate
                    )}
                  </h2>
                </div>

                <div className="dashboard-card purple">
                  <p>
                    Site Status
                  </p>

                  <h2>
                    {selectedProject.status ||
                      "-"}
                  </h2>
                </div>
              </div>

              <div
                className="form-card"
                style={{
                  marginTop:
                    "24px",
                }}
              >
                <h2>
                  Latest Work
                </h2>

                <p>
                  {selectedProject.latestWorkDescription ||
                    "No daily progress record available."}
                </p>
              </div>

              <div className="form-card">
                <h2>
                  Latest Remarks
                </h2>

                <p>
                  {selectedProject.latestRemarks ||
                    "No remarks available."}
                </p>
              </div>

              <div className="form-card">
                <h2>
                  Supervisor Actions
                </h2>

                <p>
                  Daily progress entry,
                  worker attendance,
                  material requests,
                  site issues,
                  photos and tomorrow
                  planning will be
                  added in the next
                  phase.
                </p>
              </div>
            </>
          )
        )}
      </main>
    </div>
  );
}

export default SupervisorPortal;