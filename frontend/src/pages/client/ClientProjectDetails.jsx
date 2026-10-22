import {
  useOutletContext,
} from "react-router-dom";

function ClientProjectDetails() {
  const {
    dashboard,
    loadingProject,
    formatDate,
  } = useOutletContext();

  if (loadingProject) {
    return (
      <div className="client-page-loading">
        Loading project
        details...
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="client-page">
      <div className="client-page-heading">
        <div>
          <span className="client-eyebrow">
            Project Information
          </span>

          <h2>
            Project Details
          </h2>

          <p>
            Contract and schedule
            information for your
            selected project.
          </p>
        </div>
      </div>

      <section className="client-card client-project-hero">
        <span className="client-status-pill">
          {dashboard.status ||
            "ONGOING"}
        </span>

        <h3>
          {dashboard.projectName}
        </h3>

        <p>
          {dashboard.description ||
            "No project description available."}
        </p>
      </section>

      <div className="client-detail-cards">
        <div className="client-detail-item">
          <span>
            Project Name
          </span>

          <strong>
            {dashboard.projectName ||
              "-"}
          </strong>
        </div>

        <div className="client-detail-item">
          <span>
            Location
          </span>

          <strong>
            {dashboard.location ||
              "-"}
          </strong>
        </div>

        <div className="client-detail-item">
          <span>
            Current Status
          </span>

          <strong>
            {dashboard.status ||
              "-"}
          </strong>
        </div>

        <div className="client-detail-item">
          <span>
            Start Date
          </span>

          <strong>
            {formatDate(
              dashboard.startDate
            )}
          </strong>
        </div>

        <div className="client-detail-item">
          <span>
            Expected Completion
          </span>

          <strong>
            {formatDate(
              dashboard.endDate
            )}
          </strong>
        </div>

        <div className="client-detail-item">
          <span>
            Total Project Days
          </span>

          <strong>
            {dashboard.totalProjectDays ??
              0}
          </strong>
        </div>

        <div className="client-detail-item">
          <span>
            Days Completed
          </span>

          <strong>
            {dashboard.daysCompleted ??
              0}
          </strong>
        </div>

        <div className="client-detail-item">
          <span>
            Days Remaining
          </span>

          <strong>
            {dashboard.daysRemaining ??
              0}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default ClientProjectDetails;