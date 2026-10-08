import { useEffect, useState } from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

function ClientPortal() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] =
    useState("");
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [loadingProject, setLoadingProject] =
    useState(false);

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
          "/client/projects"
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

        await loadDashboard(
          firstProjectId
        );
      } else {
        setDashboard(null);
      }
    } catch (error) {
      console.error(
        "Error loading projects:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load your projects."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (
    projectId
  ) => {
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
        "Error loading dashboard:",
        error
      );

      setDashboard(null);

      setError(
        error.response?.data?.message ||
          "Unable to load project dashboard."
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

      await loadDashboard(
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

  const formatCurrency = (
    value
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "LKR 0.00";
    }

    return new Intl.NumberFormat(
      "en-LK",
      {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
      }
    ).format(value);
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

  const physicalProgress =
    Number(
      dashboard?.physicalProgress ||
        0
    );

  const safePhysicalProgress =
    Math.min(
      100,
      Math.max(
        0,
        physicalProgress
      )
    );

  const projectValue =
    Number(
      dashboard?.projectValue ||
        0
    );

  const totalPaid =
    Number(
      dashboard?.totalPaid ||
        0
    );

  const paymentPercentage =
    projectValue > 0
      ? Math.min(
          100,
          Math.round(
            (totalPaid /
              projectValue) *
              100
          )
        )
      : 0;

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading client portal...
      </div>
    );
  }

  return (
    <div className="app-layout client-portal">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <h2>CPMS</h2>

          <p>
            Construction Management
          </p>
        </div>

        <nav className="nav-menu">
          <NavLink
            to="/client"
            end
          >
            Dashboard
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="logged-user">
            <p>
              {username || "Client"}
            </p>

            <span>
              {role || "CLIENT"}
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

      {/* MAIN CONTENT */}

      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1>
              Client Dashboard
            </h1>

            <p>
              View project progress,
              payments and latest site
              information.
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
              No Projects Assigned
            </h2>

            <p>
              There are currently no
              projects assigned to your
              account.
            </p>
          </div>
        ) : loadingProject ? (
          <div className="dashboard-loading">
            Loading project
            information...
          </div>
        ) : dashboard ? (
          <>
            {/* PROJECT INFO */}

            <div className="selected-project-info">
              <div>
                <h2>
                  {
                    dashboard.projectName
                  }
                </h2>

                <p>
                  {dashboard.description ||
                    "No project description available."}
                </p>
              </div>

              <div className="project-info-details">
                <p>
                  <strong>
                    Location:
                  </strong>{" "}
                  {dashboard.location ||
                    "-"}
                </p>

                <p>
                  <strong>
                    Status:
                  </strong>{" "}
                  {dashboard.status ||
                    "-"}
                </p>

                <p>
                  <strong>
                    Start Date:
                  </strong>{" "}
                  {formatDate(
                    dashboard.startDate
                  )}
                </p>

                <p>
                  <strong>
                    Expected Completion:
                  </strong>{" "}
                  {formatDate(
                    dashboard.endDate
                  )}
                </p>
              </div>
            </div>

            {/* MAIN SUMMARY CARDS */}

            <div className="client-summary-grid">
              <div className="client-summary-card blue">
                <p>
                  Project Status
                </p>

                <h2>
                  {dashboard.status ||
                    "-"}
                </h2>
              </div>

              <div className="client-summary-card purple">
                <p>
                  Project Value
                </p>

                <h2>
                  {formatCurrency(
                    dashboard.projectValue
                  )}
                </h2>
              </div>

              <div className="client-summary-card green">
                <p>
                  Physical Progress
                </p>

                <h2>
                  {
                    safePhysicalProgress
                  }
                  %
                </h2>

                <div className="client-progress-track">
                  <div
                    className="client-progress-fill physical"
                    style={{
                      width: `${safePhysicalProgress}%`,
                    }}
                  />
                </div>
              </div>

              <div className="client-summary-card orange">
                <p>
                  Days Remaining
                </p>

                <h2>
                  {dashboard.daysRemaining ??
                    0}
                </h2>

                <span className="client-card-note">
                  of{" "}
                  {dashboard.totalProjectDays ??
                    0}{" "}
                  project days
                </span>
              </div>
            </div>

            {/* SECOND ROW */}

            <div className="client-detail-grid">
              {/* PAYMENT */}

              <div className="form-card client-section-card">
                <h2>
                  Payment Summary
                </h2>

                <div className="client-payment-row">
                  <span>
                    Project Value
                  </span>

                  <strong>
                    {formatCurrency(
                      dashboard.projectValue
                    )}
                  </strong>
                </div>

                <div className="client-payment-row">
                  <span>
                    Total Paid
                  </span>

                  <strong>
                    {formatCurrency(
                      dashboard.totalPaid
                    )}
                  </strong>
                </div>

                <div className="client-payment-row">
                  <span>
                    Balance
                  </span>

                  <strong>
                    {formatCurrency(
                      dashboard.paymentBalance
                    )}
                  </strong>
                </div>

                <div className="client-progress-track large">
                  <div
                    className="client-progress-fill payment"
                    style={{
                      width: `${paymentPercentage}%`,
                    }}
                  />
                </div>

                <p className="client-muted-text">
                  {paymentPercentage}% of
                  project value paid.
                </p>
              </div>

              {/* PROJECT TIME */}

              <div className="form-card client-section-card">
                <h2>
                  Project Time
                </h2>

                <div className="client-stat-row">
                  <span>
                    Total Project Days
                  </span>

                  <strong>
                    {dashboard.totalProjectDays ??
                      0}
                  </strong>
                </div>

                <div className="client-stat-row">
                  <span>
                    Days Completed
                  </span>

                  <strong>
                    {dashboard.daysCompleted ??
                      0}
                  </strong>
                </div>

                <div className="client-stat-row">
                  <span>
                    Days Remaining
                  </span>

                  <strong>
                    {dashboard.daysRemaining ??
                      0}
                  </strong>
                </div>
              </div>

              {/* LATEST SITE UPDATE */}

              <div className="form-card client-section-card">
                <h2>
                  Latest Site Update
                </h2>

                {dashboard.latestProgressDate ? (
                  <>
                    <div className="client-stat-row">
                      <span>
                        Date
                      </span>

                      <strong>
                        {formatDate(
                          dashboard.latestProgressDate
                        )}
                      </strong>
                    </div>

                    <div className="client-site-update">
                      <p>
                        <strong>
                          Work:
                        </strong>
                      </p>

                      <p>
                        {dashboard.latestWorkDescription ||
                          "-"}
                      </p>
                    </div>

                    <div className="client-stat-row">
                      <span>
                        Workers
                      </span>

                      <strong>
                        {dashboard.latestWorkersCount ??
                          0}
                      </strong>
                    </div>

                    <div className="client-site-update">
                      <p>
                        <strong>
                          Remarks:
                        </strong>
                      </p>

                      <p>
                        {dashboard.latestRemarks ||
                          "No remarks."}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="client-muted-text">
                    No daily progress
                    record available yet.
                  </p>
                )}
              </div>
            </div>

            {/* PROJECT HEALTH */}

            <div className="form-card client-health-card">
              <div>
                <h2>
                  Project Health
                </h2>

                <p>
                  Current project
                  overview
                </p>
              </div>

              <div className="client-health-grid">
                <div>
                  <span>
                    Construction
                  </span>

                  <strong>
                    {
                      safePhysicalProgress
                    }
                    %
                  </strong>
                </div>

                <div>
                  <span>
                    Client Payments
                  </span>

                  <strong>
                    {
                      paymentPercentage
                    }
                    %
                  </strong>
                </div>

                <div>
                  <span>
                    Schedule
                  </span>

                  <strong>
                    {dashboard.daysRemaining >
                    0
                      ? "ONGOING"
                      : "END DATE REACHED"}
                  </strong>
                </div>

                <div>
                  <span>
                    Project Status
                  </span>

                  <strong>
                    {dashboard.status ||
                      "-"}
                  </strong>
                </div>
              </div>
            </div>

            {/* FUTURE WEATHER */}

            <div className="form-card">
              <h2>
                Site Weather
              </h2>

              <p className="client-muted-text">
                Weather, rain
                probability and site
                forecast will be added
                in the next phase.
              </p>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default ClientPortal;