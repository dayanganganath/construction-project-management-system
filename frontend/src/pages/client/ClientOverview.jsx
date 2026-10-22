import {
  useOutletContext,
} from "react-router-dom";

function ClientOverview() {
  const {
    dashboard,
    loadingProject,
    formatCurrency,
    formatDate,
  } = useOutletContext();

  if (loadingProject) {
    return (
      <div className="client-page-loading">
        Loading project
        overview...
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const physicalProgress =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          dashboard.physicalProgress ||
            0
        )
      )
    );

  const projectValue =
    Number(
      dashboard.projectValue ||
        0
    );

  const totalPaid =
    Number(
      dashboard.totalPaid ||
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

  return (
    <div className="client-page">
      <div className="client-page-heading">
        <div>
          <span className="client-eyebrow">
            Project Overview
          </span>

          <h2>
            {dashboard.projectName}
          </h2>

          <p>
            A quick view of your
            project's current
            construction,
            financial and schedule
            status.
          </p>
        </div>

        <span className="client-status-pill">
          {dashboard.status ||
            "ONGOING"}
        </span>
      </div>

      <div className="client-kpi-grid">
        <div className="client-kpi-card">
          <span>
            Project Value
          </span>

          <strong>
            {formatCurrency(
              dashboard.projectValue
            )}
          </strong>

          <small>
            Contract value
          </small>
        </div>

        <div className="client-kpi-card">
          <span>
            Physical Progress
          </span>

          <strong>
            {physicalProgress}%
          </strong>

          <small>
            Construction progress
          </small>
        </div>

        <div className="client-kpi-card">
          <span>
            Client Payments
          </span>

          <strong>
            {paymentPercentage}%
          </strong>

          <small>
            Of project value paid
          </small>
        </div>

        <div className="client-kpi-card">
          <span>
            Days Remaining
          </span>

          <strong>
            {dashboard.daysRemaining ??
              0}
          </strong>

          <small>
            Project schedule
          </small>
        </div>
      </div>

      <div className="client-overview-grid">
        <section className="client-card client-progress-card">
          <div className="client-card-heading">
            <div>
              <h3>
                Construction
                Progress
              </h3>

              <p>
                Current physical
                completion
              </p>
            </div>

            <strong>
              {physicalProgress}%
            </strong>
          </div>

          <div className="client-progress-track">
            <div
              className="client-progress-value"
              style={{
                width: `${physicalProgress}%`,
              }}
            />
          </div>

          <div className="client-progress-meta">
            <span>
              Start{" "}
              {formatDate(
                dashboard.startDate
              )}
            </span>

            <span>
              Target{" "}
              {formatDate(
                dashboard.endDate
              )}
            </span>
          </div>
        </section>

        <section className="client-card">
          <div className="client-card-heading">
            <div>
              <h3>
                Latest Site Update
              </h3>

              <p>
                Most recent
                progress record
              </p>
            </div>
          </div>

          {dashboard.latestProgressDate ? (
            <div className="client-latest-update">
              <div className="client-update-date">
                {formatDate(
                  dashboard.latestProgressDate
                )}
              </div>

              <h4>
                {dashboard.latestWorkDescription ||
                  "Site progress updated"}
              </h4>

              <p>
                {dashboard.latestRemarks ||
                  "No additional remarks provided."}
              </p>

              <div className="client-update-workers">
                Workers on site:{" "}
                <strong>
                  {dashboard.latestWorkersCount ??
                    0}
                </strong>
              </div>
            </div>
          ) : (
            <p className="client-muted">
              No daily progress
              records are available
              yet.
            </p>
          )}
        </section>
      </div>

      <section className="client-card client-health-card">
        <div className="client-card-heading">
          <div>
            <h3>
              Project Health
            </h3>

            <p>
              Current high-level
              project indicators
            </p>
          </div>
        </div>

        <div className="client-health-grid">
          <div>
            <span>
              Construction
            </span>

            <strong>
              {physicalProgress}%
            </strong>
          </div>

          <div>
            <span>
              Payments
            </span>

            <strong>
              {paymentPercentage}%
            </strong>
          </div>

          <div>
            <span>
              Schedule
            </span>

            <strong>
              {Number(
                dashboard.daysRemaining ||
                  0
              ) > 0
                ? "ONGOING"
                : "END DATE REACHED"}
            </strong>
          </div>

          <div>
            <span>
              Status
            </span>

            <strong>
              {dashboard.status ||
                "-"}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ClientOverview;