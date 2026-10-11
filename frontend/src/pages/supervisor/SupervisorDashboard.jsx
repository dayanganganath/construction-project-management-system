import { useOutletContext } from "react-router-dom";

function SupervisorDashboard() {
  const {
    selectedProject,
  } = useOutletContext();

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

  if (!selectedProject) {
    return null;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Site Dashboard
          </h1>

          <p>
            Current site overview and
            latest progress information.
          </p>
        </div>
      </div>

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
            {selectedProject
              .latestProgressPercentage ??
              0}
            %
          </h2>
        </div>

        <div className="dashboard-card green">
          <p>
            Workers on Site
          </p>

          <h2>
            {selectedProject
              .latestWorkersCount ??
              0}
          </h2>
        </div>

        <div className="dashboard-card orange">
          <p>
            Last Update
          </p>

          <h2 className="date-value">
            {formatDate(
              selectedProject
                .latestProgressDate
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
          marginTop: "24px",
        }}
      >
        <h2>
          Latest Work
        </h2>

        <p>
          {selectedProject
            .latestWorkDescription ||
            "No daily progress record available."}
        </p>
      </div>

      <div className="form-card">
        <h2>
          Latest Remarks
        </h2>

        <p>
          {selectedProject
            .latestRemarks ||
            "No remarks available."}
        </p>
      </div>
    </div>
  );
}

export default SupervisorDashboard;