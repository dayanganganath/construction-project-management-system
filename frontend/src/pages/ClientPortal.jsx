import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ClientPortal() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/client/projects");

      const data = response.data || [];

      setProjects(data);

      if (data.length > 0) {
        setSelectedProjectId(data[0].projectId);
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error("Error loading client projects:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your projects."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async (projectId) => {
    if (!projectId) {
      setSelectedProject(null);
      return;
    }

    try {
      setLoadingProject(true);
      setError("");

      const response = await api.get(
        `/client/projects/${projectId}`
      );

      setSelectedProject(response.data);
    } catch (error) {
      console.error("Error loading project:", error);

      setSelectedProject(null);

      setError(
        error.response?.data?.message ||
          "Unable to load project details."
      );
    } finally {
      setLoadingProject(false);
    }
  };

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;

    setSelectedProjectId(projectId);

    await loadProject(projectId);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");

    navigate("/login");
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return "LKR 0.00";
    }

    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <p>Loading client portal...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f6f8",
      }}
    >
      <header
        style={{
          background: "#ffffff",
          padding: "18px 30px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
            }}
          >
            CPMS Client Portal
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#666",
            }}
          >
            Skyward Engineering Project Management
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <div
            style={{
              textAlign: "right",
            }}
          >
            <strong>{username}</strong>

            <div
              style={{
                fontSize: "12px",
                color: "#666",
              }}
            >
              {role}
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "30px",
        }}
      >
        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <h1
            style={{
              marginBottom: "5px",
            }}
          >
            My Project
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            View the latest information about your assigned project.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="form-card">
            <h3>No Projects Assigned</h3>

            <p>
              There are currently no projects assigned to your account.
            </p>
          </div>
        ) : (
          <>
            <div className="form-card">
              <label>
                <strong>Select Project</strong>
              </label>

              <select
                value={selectedProjectId}
                onChange={handleProjectChange}
                style={{
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                {projects.map((project) => (
                  <option
                    key={project.projectId}
                    value={project.projectId}
                  >
                    {project.projectName}
                    {project.location
                      ? ` - ${project.location}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {loadingProject ? (
              <div className="form-card">
                <p>Loading project...</p>
              </div>
            ) : (
              selectedProject && (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    <div className="form-card">
                      <h3>Project Status</h3>

                      <h2>
                        {selectedProject.status || "-"}
                      </h2>
                    </div>

                    <div className="form-card">
                      <h3>Project Value</h3>

                      <h2>
                        {formatCurrency(
                          selectedProject.projectValue
                        )}
                      </h2>
                    </div>

                    <div className="form-card">
                      <h3>Start Date</h3>

                      <h2>
                        {formatDate(
                          selectedProject.startDate
                        )}
                      </h2>
                    </div>

                    <div className="form-card">
                      <h3>Expected Completion</h3>

                      <h2>
                        {formatDate(
                          selectedProject.endDate
                        )}
                      </h2>
                    </div>
                  </div>

                  <div className="form-card">
                    <h2>
                      {selectedProject.projectName}
                    </h2>

                    <p>
                      <strong>Location:</strong>{" "}
                      {selectedProject.location || "-"}
                    </p>

                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedProject.description ||
                        "No description available."}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: "15px",
                      marginTop: "20px",
                    }}
                  >
                    <div className="form-card">
                      <h3>Physical Progress</h3>

                      <p>
                        Progress tracking will appear here.
                      </p>
                    </div>

                    <div className="form-card">
                      <h3>Payment Summary</h3>

                      <p>
                        Client payment information will appear here.
                      </p>
                    </div>

                    <div className="form-card">
                      <h3>Latest Site Update</h3>

                      <p>
                        Latest daily progress will appear here.
                      </p>
                    </div>

                    <div className="form-card">
                      <h3>Weather</h3>

                      <p>
                        Site weather information will appear here.
                      </p>
                    </div>
                  </div>
                </>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ClientPortal;