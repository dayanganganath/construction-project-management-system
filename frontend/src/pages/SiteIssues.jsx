import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

function SiteIssues() {
  const [issues, setIssues] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [reviewingId, setReviewingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [filters, setFilters] =
    useState({
      projectId: "",
      status: "ALL",
      priority: "ALL",
      search: "",
    });

  const [reviewForm, setReviewForm] =
    useState({
      issueId: null,
      title: "",
      status: "IN_PROGRESS",
      resolutionNote: "",
    });

  useEffect(() => {
    loadProjects();
    loadIssues();
  }, []);

  const loadProjects = async () => {
    try {
      const response =
        await api.get(
          "/projects"
        );

      setProjects(
        response.data || []
      );
    } catch (error) {
      console.error(
        "Error loading projects:",
        error
      );
    }
  };

  const loadIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/site-issues"
        );

      setIssues(
        response.data || []
      );
    } catch (error) {
      console.error(
        "Error loading site issues:",
        error
      );

      setError(
        typeof error.response?.data ===
          "string"
          ? error.response.data
          : "Unable to load site issues."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e
  ) => {
    setFilters({
      ...filters,
      [e.target.name]:
        e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      projectId: "",
      status: "ALL",
      priority: "ALL",
      search: "",
    });
  };

  const filteredIssues =
    useMemo(() => {
      return [...issues]
        .filter((issue) => {
          if (
            filters.projectId &&
            String(
              issue.project?.id
            ) !==
              String(
                filters.projectId
              )
          ) {
            return false;
          }

          if (
            filters.status !==
              "ALL" &&
            issue.status !==
              filters.status
          ) {
            return false;
          }

          if (
            filters.priority !==
              "ALL" &&
            issue.priority !==
              filters.priority
          ) {
            return false;
          }

          if (
            filters.search.trim()
          ) {
            const keyword =
              filters.search
                .trim()
                .toLowerCase();

            const text = [
              issue.title,
              issue.description,
              issue.reportedBy,
              issue.reviewedBy,
              issue.resolutionNote,
              issue.project?.projectName,
              issue.project?.location,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            if (
              !text.includes(
                keyword
              )
            ) {
              return false;
            }
          }

          return true;
        })
        .sort((a, b) => {
          const dateCompare =
            String(
              b.issueDate || ""
            ).localeCompare(
              String(
                a.issueDate || ""
              )
            );

          if (
            dateCompare !== 0
          ) {
            return dateCompare;
          }

          return (
            Number(b.id || 0) -
            Number(a.id || 0)
          );
        });
    }, [issues, filters]);

  const openCount =
    filteredIssues.filter(
      (issue) =>
        issue.status === "OPEN"
    ).length;

  const inProgressCount =
    filteredIssues.filter(
      (issue) =>
        issue.status ===
        "IN_PROGRESS"
    ).length;

  const resolvedCount =
    filteredIssues.filter(
      (issue) =>
        issue.status ===
        "RESOLVED"
    ).length;

  const criticalCount =
    filteredIssues.filter(
      (issue) =>
        issue.priority ===
        "CRITICAL"
    ).length;

  const openReview = (
    issue,
    status
  ) => {
    setReviewingId(
      issue.id
    );

    setReviewForm({
      issueId: issue.id,
      title: issue.title || "",
      status,
      resolutionNote:
        issue.resolutionNote || "",
    });

    setError("");
    setSuccess("");
  };

  const cancelReview = () => {
    setReviewingId(null);

    setReviewForm({
      issueId: null,
      title: "",
      status: "IN_PROGRESS",
      resolutionNote: "",
    });
  };

  const handleReviewChange = (
    e
  ) => {
    setReviewForm({
      ...reviewForm,
      [e.target.name]:
        e.target.value,
    });
  };

  const submitReview =
    async (e) => {
      e.preventDefault();

      if (
        !reviewForm.issueId
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccess("");

        await api.put(
          `/site-issues/${reviewForm.issueId}/review`,
          {
            status:
              reviewForm.status,
            resolutionNote:
              reviewForm.resolutionNote
                .trim() ||
              null,
          }
        );

        setSuccess(
          `Issue updated to ${reviewForm.status}.`
        );

        cancelReview();

        await loadIssues();
      } catch (error) {
        console.error(
          "Error reviewing site issue:",
          error
        );

        setError(
          typeof error.response?.data ===
            "string"
            ? error.response.data
            : "Unable to update site issue."
        );
      } finally {
        setLoading(false);
      }
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

  const getPriorityStyle = (
    priority
  ) => {
    switch (priority) {
      case "CRITICAL":
        return {
          background:
            "#fee2e2",
          color:
            "#991b1b",
        };

      case "HIGH":
        return {
          background:
            "#ffedd5",
          color:
            "#9a3412",
        };

      case "MEDIUM":
        return {
          background:
            "#fef3c7",
          color:
            "#92400e",
        };

      default:
        return {
          background:
            "#e0f2fe",
          color:
            "#075985",
        };
    }
  };

  const getStatusStyle = (
    status
  ) => {
    switch (status) {
      case "RESOLVED":
        return {
          background:
            "#dcfce7",
          color:
            "#166534",
        };

      case "IN_PROGRESS":
        return {
          background:
            "#dbeafe",
          color:
            "#1e40af",
        };

      default:
        return {
          background:
            "#fee2e2",
          color:
            "#991b1b",
        };
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Site Issues
          </h1>

          <p>
            Review site problems,
            instructions and
            blockers reported by
            supervisors.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="form-card">
        <h2>
          Filter Site Issues
        </h2>

        <div className="client-form">
          <div>
            <label>
              Project / Site
            </label>

            <select
              name="projectId"
              value={
                filters.projectId
              }
              onChange={
                handleFilterChange
              }
            >
              <option value="">
                All Projects
              </option>

              {projects.map(
                (project) => (
                  <option
                    key={
                      project.id
                    }
                    value={
                      project.id
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
          </div>

          <div>
            <label>
              Status
            </label>

            <select
              name="status"
              value={
                filters.status
              }
              onChange={
                handleFilterChange
              }
            >
              <option value="ALL">
                All Statuses
              </option>

              <option value="OPEN">
                Open
              </option>

              <option value="IN_PROGRESS">
                In Progress
              </option>

              <option value="RESOLVED">
                Resolved
              </option>
            </select>
          </div>

          <div>
            <label>
              Priority
            </label>

            <select
              name="priority"
              value={
                filters.priority
              }
              onChange={
                handleFilterChange
              }
            >
              <option value="ALL">
                All Priorities
              </option>

              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="CRITICAL">
                Critical
              </option>
            </select>
          </div>

          <div>
            <label>
              Search
            </label>

            <input
              type="text"
              name="search"
              value={
                filters.search
              }
              onChange={
                handleFilterChange
              }
              placeholder="Issue, site, supervisor..."
            />
          </div>
        </div>

        <button
          type="button"
          className="cancel-button"
          onClick={
            clearFilters
          }
          style={{
            marginTop:
              "15px",
          }}
        >
          Clear Filters
        </button>
      </div>

      <div
        className="dashboard-grid"
        style={{
          marginTop:
            "24px",
        }}
      >
        <div className="dashboard-card red">
          <p>Open</p>

          <h2>
            {openCount}
          </h2>
        </div>

        <div className="dashboard-card blue">
          <p>
            In Progress
          </p>

          <h2>
            {
              inProgressCount
            }
          </h2>
        </div>

        <div className="dashboard-card green">
          <p>
            Resolved
          </p>

          <h2>
            {resolvedCount}
          </h2>
        </div>

        <div className="dashboard-card orange">
          <p>
            Critical
          </p>

          <h2>
            {criticalCount}
          </h2>
        </div>
      </div>

      {reviewingId && (
        <div
          className="form-card"
          style={{
            marginTop:
              "24px",
          }}
        >
          <h2>
            Review Site Issue
          </h2>

          <p>
            <strong>
              Issue:
            </strong>{" "}
            {
              reviewForm.title
            }
          </p>

          <form
            onSubmit={
              submitReview
            }
          >
            <div
              style={{
                maxWidth:
                  "400px",
                marginTop:
                  "15px",
              }}
            >
              <label>
                Status
              </label>

              <select
                name="status"
                value={
                  reviewForm.status
                }
                onChange={
                  handleReviewChange
                }
              >
                <option value="OPEN">
                  Open
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="RESOLVED">
                  Resolved
                </option>
              </select>
            </div>

            <div
              style={{
                marginTop:
                  "15px",
              }}
            >
              <label>
                Management /
                Resolution Note
              </label>

              <textarea
                name="resolutionNote"
                value={
                  reviewForm.resolutionNote
                }
                onChange={
                  handleReviewChange
                }
                placeholder="Example: Waterproofing team instructed to inspect and rectify tomorrow..."
              />
            </div>

            <div
              style={{
                display:
                  "flex",
                gap:
                  "10px",
                marginTop:
                  "18px",
              }}
            >
              <button
                type="submit"
                className="primary-button"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Saving..."
                  : "Save Review"}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={
                  cancelReview
                }
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div
        className="form-card"
        style={{
          marginTop:
            "24px",
        }}
      >
        <h2>
          Site Issue Register
        </h2>

        <p>
          {
            filteredIssues.length
          }{" "}
          issue(s)
        </p>

        {loading &&
        !reviewingId ? (
          <p>
            Loading site
            issues...
          </p>
        ) : filteredIssues.length ===
          0 ? (
          <p>
            No site issues
            found.
          </p>
        ) : (
          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    Date
                  </th>

                  <th>
                    Project
                  </th>

                  <th>
                    Issue
                  </th>

                  <th>
                    Priority
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Reported By
                  </th>

                  <th>
                    Review
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredIssues.map(
                  (issue) => (
                    <tr
                      key={
                        issue.id
                      }
                    >
                      <td>
                        {formatDate(
                          issue.issueDate
                        )}
                      </td>

                      <td>
                        <strong>
                          {issue.project
                            ?.projectName ||
                            "-"}
                        </strong>

                        {issue.project
                          ?.location && (
                          <div
                            style={{
                              marginTop:
                                "4px",
                              fontSize:
                                "12px",
                            }}
                          >
                            {
                              issue
                                .project
                                .location
                            }
                          </div>
                        )}
                      </td>

                      <td>
                        <strong>
                          {
                            issue.title
                          }
                        </strong>

                        <div
                          style={{
                            marginTop:
                              "6px",
                            maxWidth:
                              "350px",
                          }}
                        >
                          {
                            issue.description
                          }
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display:
                              "inline-block",
                            padding:
                              "5px 9px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "12px",
                            fontWeight:
                              "700",

                            ...getPriorityStyle(
                              issue.priority
                            ),
                          }}
                        >
                          {issue.priority ||
                            "MEDIUM"}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            display:
                              "inline-block",
                            padding:
                              "5px 9px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "12px",
                            fontWeight:
                              "700",

                            ...getStatusStyle(
                              issue.status
                            ),
                          }}
                        >
                          {issue.status ||
                            "OPEN"}
                        </span>
                      </td>

                      <td>
                        {issue.reportedBy ||
                          "-"}
                      </td>

                      <td>
                        {issue.reviewedBy ? (
                          <>
                            <div>
                              <strong>
                                {
                                  issue.reviewedBy
                                }
                              </strong>
                            </div>

                            <div>
                              {formatDate(
                                issue.reviewedDate
                              )}
                            </div>

                            {issue.resolutionNote && (
                              <div
                                style={{
                                  marginTop:
                                    "6px",
                                  maxWidth:
                                    "300px",
                                }}
                              >
                                {
                                  issue.resolutionNote
                                }
                              </div>
                            )}
                          </>
                        ) : (
                          "Not reviewed yet"
                        )}
                      </td>

                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "8px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          {issue.status ===
                            "OPEN" && (
                            <button
                              type="button"
                              className="primary-button"
                              onClick={() =>
                                openReview(
                                  issue,
                                  "IN_PROGRESS"
                                )
                              }
                            >
                              Start
                            </button>
                          )}

                          {issue.status !==
                            "RESOLVED" && (
                            <button
                              type="button"
                              className="primary-button"
                              onClick={() =>
                                openReview(
                                  issue,
                                  "RESOLVED"
                                )
                              }
                            >
                              Resolve
                            </button>
                          )}

                          {issue.status ===
                            "RESOLVED" && (
                            <span>
                              Resolved
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SiteIssues;