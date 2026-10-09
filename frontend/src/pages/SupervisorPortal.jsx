import { useEffect, useState } from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

function SupervisorPortal() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] =
    useState("");
  const [selectedProject, setSelectedProject] =
    useState(null);

  const [progressHistory, setProgressHistory] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] =
    useState(false);
  const [savingProgress, setSavingProgress] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const username =
    localStorage.getItem("username");

  const role =
    localStorage.getItem("role");

  const getToday = () => {
    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        now.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const initialProgressForm = {
    date: getToday(),
    workDescription: "",
    progressPercentage: "",
    workersCount: "",
    remarks: "",
    tomorrowPlan: "",
    issuesBlockers: "",
  };

  const [progressForm, setProgressForm] =
    useState(initialProgressForm);

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
          String(firstProjectId)
        );

        setSelectedProject(
          data[0]
        );

        await loadProgressHistory(
          firstProjectId
        );
      } else {
        setSelectedProject(null);
        setProgressHistory([]);
      }
    } catch (error) {
      console.error(
        "Error loading supervisor projects:",
        error
      );

      setError(
        error.response?.data ||
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
      setProgressHistory([]);
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

      await loadProgressHistory(
        projectId
      );
    } catch (error) {
      console.error(
        "Error loading project:",
        error
      );

      setSelectedProject(null);
      setProgressHistory([]);

      setError(
        error.response?.data ||
          error.response?.data?.message ||
          "Unable to load site details."
      );
    } finally {
      setLoadingProject(false);
    }
  };

  const loadProgressHistory =
    async (projectId) => {
      try {
        const response =
          await api.get(
            `/supervisor/projects/${projectId}/progress`
          );

        const data =
          response.data || [];

        const sortedData = [
          ...data,
        ].sort((a, b) => {
          const dateCompare =
            new Date(b.date) -
            new Date(a.date);

          if (dateCompare !== 0) {
            return dateCompare;
          }

          return (
            (b.id || 0) -
            (a.id || 0)
          );
        });

        setProgressHistory(
          sortedData
        );
      } catch (error) {
        console.error(
          "Error loading progress history:",
          error
        );

        setProgressHistory([]);
      }
    };

  const handleProjectChange =
    async (e) => {
      const projectId =
        e.target.value;

      setSelectedProjectId(
        projectId
      );

      setSuccess("");

      await loadProject(
        projectId
      );
    };

  const handleProgressChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setProgressForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );

      setError("");
      setSuccess("");
    };

  const validateProgressForm =
    () => {
      if (
        !selectedProjectId
      ) {
        return "Please select a project.";
      }

      if (
        !progressForm.date
      ) {
        return "Date is required.";
      }

      if (
        !progressForm.workDescription.trim()
      ) {
        return "Today's work description is required.";
      }

      const progress =
        Number(
          progressForm
            .progressPercentage
        );

      if (
        progressForm
          .progressPercentage ===
          ""
      ) {
        return "Progress percentage is required.";
      }

      if (
        Number.isNaN(progress) ||
        progress < 0 ||
        progress > 100
      ) {
        return "Progress percentage must be between 0 and 100.";
      }

      const workers =
        Number(
          progressForm
            .workersCount
        );

      if (
        progressForm
          .workersCount ===
          ""
      ) {
        return "Workers count is required.";
      }

      if (
        Number.isNaN(workers) ||
        workers < 0
      ) {
        return "Workers count cannot be negative.";
      }

      return null;
    };

  const handleProgressSubmit =
    async (e) => {
      e.preventDefault();

      const validationError =
        validateProgressForm();

      if (validationError) {
        setError(
          validationError
        );
        return;
      }

      try {
        setSavingProgress(true);
        setError("");
        setSuccess("");

        const payload = {
          date:
            progressForm.date,

          workDescription:
            progressForm
              .workDescription
              .trim(),

          progressPercentage:
            Number(
              progressForm
                .progressPercentage
            ),

          workersCount:
            Number(
              progressForm
                .workersCount
            ),

          remarks:
            progressForm
              .remarks
              .trim(),

          tomorrowPlan:
            progressForm
              .tomorrowPlan
              .trim(),

          issuesBlockers:
            progressForm
              .issuesBlockers
              .trim(),
        };

        await api.post(
          `/supervisor/projects/${selectedProjectId}/progress`,
          payload
        );

        setSuccess(
          "Daily progress saved successfully."
        );

        setProgressForm({
          ...initialProgressForm,
          date: getToday(),
        });

        await loadProject(
          selectedProjectId
        );
      } catch (error) {
        console.error(
          "Error saving progress:",
          error
        );

        setError(
          typeof error.response?.data ===
            "string"
            ? error.response.data
            : error.response?.data?.message ||
                "Unable to save daily progress."
        );
      } finally {
        setSavingProgress(false);
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

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(
      `${value}T00:00:00`
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
              submit daily progress
              and track site activity.
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

        {success && (
          <div className="alert alert-success">
            <span>
              {success}
            </span>
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
                  Add Daily Progress
                </h2>

                <form
                  onSubmit={
                    handleProgressSubmit
                  }
                >
                  <div className="progress-form">
                    <input
                      type="date"
                      name="date"
                      value={
                        progressForm.date
                      }
                      onChange={
                        handleProgressChange
                      }
                    />

                    <input
                      type="number"
                      name="progressPercentage"
                      min="0"
                      max="100"
                      placeholder="Progress % *"
                      value={
                        progressForm.progressPercentage
                      }
                      onChange={
                        handleProgressChange
                      }
                    />

                    <input
                      type="number"
                      name="workersCount"
                      min="0"
                      placeholder="Workers Count *"
                      value={
                        progressForm.workersCount
                      }
                      onChange={
                        handleProgressChange
                      }
                    />
                  </div>

                  <div
                    style={{
                      marginTop:
                        "15px",
                    }}
                  >
                    <label>
                      Today&apos;s Work *
                    </label>

                    <textarea
                      name="workDescription"
                      placeholder="Describe work completed today..."
                      value={
                        progressForm.workDescription
                      }
                      onChange={
                        handleProgressChange
                      }
                    />
                  </div>

                  <div
                    style={{
                      marginTop:
                        "15px",
                    }}
                  >
                    <label>
                      Remarks
                    </label>

                    <textarea
                      name="remarks"
                      placeholder="Site remarks, notes or observations..."
                      value={
                        progressForm.remarks
                      }
                      onChange={
                        handleProgressChange
                      }
                    />
                  </div>

                  <div
                    style={{
                      marginTop:
                        "15px",
                    }}
                  >
                    <label>
                      Tomorrow Plan
                    </label>

                    <textarea
                      name="tomorrowPlan"
                      placeholder="Planned work for tomorrow..."
                      value={
                        progressForm.tomorrowPlan
                      }
                      onChange={
                        handleProgressChange
                      }
                    />
                  </div>

                  <div
                    style={{
                      marginTop:
                        "15px",
                    }}
                  >
                    <label>
                      Issues / Blockers
                    </label>

                    <textarea
                      name="issuesBlockers"
                      placeholder="Material delays, design issues, access problems, weather impact, etc..."
                      value={
                        progressForm.issuesBlockers
                      }
                      onChange={
                        handleProgressChange
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      savingProgress
                    }
                    style={{
                      marginTop:
                        "18px",
                    }}
                  >
                    {savingProgress
                      ? "Saving..."
                      : "Save Daily Progress"}
                  </button>
                </form>
              </div>

              <div className="form-card">
                <h2>
                  Recent Progress History
                </h2>

                {progressHistory.length ===
                0 ? (
                  <p>
                    No progress records
                    available.
                  </p>
                ) : (
                  <div className="table-card">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>
                            Date
                          </th>

                          <th>
                            Work
                          </th>

                          <th>
                            Progress
                          </th>

                          <th>
                            Workers
                          </th>

                          <th>
                            Tomorrow Plan
                          </th>

                          <th>
                            Issues /
                            Blockers
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {progressHistory
                          .slice(
                            0,
                            10
                          )
                          .map(
                            (
                              item
                            ) => (
                              <tr
                                key={
                                  item.id
                                }
                              >
                                <td>
                                  {formatDate(
                                    item.date
                                  )}
                                </td>

                                <td>
                                  {item.workDescription ||
                                    "-"}
                                </td>

                                <td>
                                  {item.progressPercentage ??
                                    0}
                                  %
                                </td>

                                <td>
                                  {item.workersCount ??
                                    0}
                                </td>

                                <td>
                                  {item.tomorrowPlan ||
                                    "-"}
                                </td>

                                <td>
                                  {item.issuesBlockers ||
                                    "-"}
                                </td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )
        )}
      </main>
    </div>
  );
}

export default SupervisorPortal;