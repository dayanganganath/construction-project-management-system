import {
  useOutletContext,
} from "react-router-dom";

function SupervisorDashboard() {
  const {
    selectedProject,
    loadingProject,
  } = useOutletContext();

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

  if (loadingProject) {
    return (
      <div className="supervisor-page-loading">
        Loading project
        dashboard...
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="supervisor-empty-card">
        <h3>
          No project selected
        </h3>

        <p>
          Select an assigned
          project to view the site
          dashboard.
        </p>
      </div>
    );
  }

  const progress =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          selectedProject
            .latestProgressPercentage ??
            0
        )
      )
    );

  return (
    <div className="supervisor-page">
      <div className="supervisor-page-heading">
        <div>
          <span className="supervisor-eyebrow">
            Site Overview
          </span>

          <h2>
            Site Dashboard
          </h2>

          <p>
            Current project status,
            workforce and latest
            construction progress.
          </p>
        </div>

        <span className="supervisor-status-pill">
          {selectedProject.status ||
            "ONGOING"}
        </span>
      </div>

      <section className="supervisor-project-hero">
        <div>
          <span className="supervisor-project-label">
            Current Project
          </span>

          <h3>
            {
              selectedProject.projectName
            }
          </h3>

          <p>
            {selectedProject.description ||
              "No project description available."}
          </p>
        </div>

        <div className="supervisor-project-details">
          <div>
            <span>
              Location
            </span>

            <strong>
              {selectedProject.location ||
                "-"}
            </strong>
          </div>

          <div>
            <span>
              Start Date
            </span>

            <strong>
              {formatDate(
                selectedProject.startDate
              )}
            </strong>
          </div>

          <div>
            <span>
              End Date
            </span>

            <strong>
              {formatDate(
                selectedProject.endDate
              )}
            </strong>
          </div>
        </div>
      </section>

      <div className="supervisor-kpi-grid">
        <div className="supervisor-kpi-card">
          <span>
            Latest Progress
          </span>

          <strong>
            {progress}%
          </strong>

          <small>
            Physical completion
          </small>
        </div>

        <div className="supervisor-kpi-card">
          <span>
            Workers on Site
          </span>

          <strong>
            {selectedProject
              .latestWorkersCount ??
              0}
          </strong>

          <small>
            Latest workforce count
          </small>
        </div>

        <div className="supervisor-kpi-card">
          <span>
            Last Update
          </span>

          <strong className="supervisor-kpi-date">
            {formatDate(
              selectedProject
                .latestProgressDate
            )}
          </strong>

          <small>
            Latest daily report
          </small>
        </div>

        <div className="supervisor-kpi-card">
          <span>
            Site Status
          </span>

          <strong className="supervisor-kpi-status">
            {selectedProject.status ||
              "-"}
          </strong>

          <small>
            Project status
          </small>
        </div>
      </div>

      <section className="supervisor-card supervisor-progress-card">
        <div className="supervisor-card-heading">
          <div>
            <h3>
              Construction Progress
            </h3>

            <p>
              Latest recorded
              physical progress
            </p>
          </div>

          <strong>
            {progress}%
          </strong>
        </div>

        <div className="supervisor-progress-track">
          <div
            className="supervisor-progress-value"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="supervisor-progress-meta">
          <span>
            0%
          </span>

          <span>
            100%
          </span>
        </div>
      </section>

      <div className="supervisor-dashboard-grid">
        <section className="supervisor-card">
          <div className="supervisor-card-heading">
            <div>
              <h3>
                Latest Work
              </h3>

              <p>
                Most recent site
                activity
              </p>
            </div>
          </div>

          <div className="supervisor-latest-content">
            <div className="supervisor-latest-icon">
              WK
            </div>

            <div>
              <h4>
                {selectedProject
                  .latestWorkDescription ||
                  "No daily progress record available."}
              </h4>

              <p>
                Last updated{" "}
                {formatDate(
                  selectedProject
                    .latestProgressDate
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="supervisor-card">
          <div className="supervisor-card-heading">
            <div>
              <h3>
                Latest Remarks
              </h3>

              <p>
                Notes from the
                latest progress
                update
              </p>
            </div>
          </div>

          <div className="supervisor-remarks">
            {selectedProject
              .latestRemarks ||
              "No remarks available."}
          </div>
        </section>
      </div>
    </div>
  );
}

export default SupervisorDashboard;