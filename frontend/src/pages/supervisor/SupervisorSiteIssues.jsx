import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

function SupervisorSiteIssues() {
  const {
    selectedProjectId,
  } = useOutletContext();

  const getToday = () => {
    const now = new Date();

    const year =
      now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const initialForm = {
    issueDate: getToday(),
    title: "",
    description: "",
    priority: "MEDIUM",
  };

  const [form, setForm] =
    useState(initialForm);

  const [issues, setIssues] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (selectedProjectId) {
      loadIssues();
    } else {
      setIssues([]);
    }
  }, [selectedProjectId]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          `/supervisor/projects/${selectedProjectId}/site-issues`
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

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (!selectedProjectId) {
        setError(
          "Please select a project."
        );

        return;
      }

      if (!form.issueDate) {
        setError(
          "Issue date is required."
        );

        return;
      }

      if (!form.title.trim()) {
        setError(
          "Issue title is required."
        );

        return;
      }

      if (
        !form.description.trim()
      ) {
        setError(
          "Issue description is required."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        await api.post(
          `/supervisor/projects/${selectedProjectId}/site-issues`,
          {
            issueDate:
              form.issueDate,

            title:
              form.title.trim(),

            description:
              form.description.trim(),

            priority:
              form.priority,
          }
        );

        setSuccess(
          "Site issue reported successfully."
        );

        setForm({
          ...initialForm,
          issueDate:
            getToday(),
        });

        await loadIssues();
      } catch (error) {
        console.error(
          "Error creating site issue:",
          error
        );

        setError(
          typeof error.response?.data ===
            "string"
            ? error.response.data
            : "Unable to create site issue."
        );
      } finally {
        setSaving(false);
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

  const openCount =
    issues.filter(
      (issue) =>
        issue.status === "OPEN"
    ).length;

  const inProgressCount =
    issues.filter(
      (issue) =>
        issue.status ===
        "IN_PROGRESS"
    ).length;

  const resolvedCount =
    issues.filter(
      (issue) =>
        issue.status ===
        "RESOLVED"
    ).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Site Issues
          </h1>

          <p>
            Report site problems,
            instructions and
            blockers for the
            selected project.
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
          Report New Issue
        </h2>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="progress-form">
            <div>
              <label>
                Issue Date
              </label>

              <input
                type="date"
                name="issueDate"
                value={
                  form.issueDate
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div>
              <label>
                Priority
              </label>

              <select
                name="priority"
                value={
                  form.priority
                }
                onChange={
                  handleChange
                }
              >
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
          </div>

          <div
            style={{
              marginTop:
                "15px",
            }}
          >
            <label>
              Issue Title
            </label>

            <input
              type="text"
              name="title"
              value={
                form.title
              }
              onChange={
                handleChange
              }
              placeholder="Example: Water leakage near slab edge"
            />
          </div>

          <div
            style={{
              marginTop:
                "15px",
            }}
          >
            <label>
              Description
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              placeholder="Describe the issue, location and required action..."
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={
              saving
            }
            style={{
              marginTop:
                "18px",
            }}
          >
            {saving
              ? "Submitting..."
              : "Report Issue"}
          </button>
        </form>
      </div>

      <div
        className="dashboard-grid"
        style={{
          marginTop:
            "24px",
        }}
      >
        <div className="dashboard-card red">
          <p>
            Open
          </p>

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

        <div className="dashboard-card">
          <p>
            Total Issues
          </p>

          <h2>
            {issues.length}
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
          Issue History
        </h2>

        {loading ? (
          <p>
            Loading site
            issues...
          </p>
        ) : issues.length ===
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
                    Management
                    Review
                  </th>
                </tr>
              </thead>

              <tbody>
                {issues.map(
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
                          {issue.title}
                        </strong>

                        <div
                          style={{
                            marginTop:
                              "6px",
                            maxWidth:
                              "420px",
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

                            <div
                              style={{
                                marginTop:
                                  "4px",
                              }}
                            >
                              {formatDate(
                                issue.reviewedDate
                              )}
                            </div>

                            {issue.resolutionNote && (
                              <div
                                style={{
                                  marginTop:
                                    "6px",
                                }}
                              >
                                {
                                  issue.resolutionNote
                                }
                              </div>
                            )}
                          </>
                        ) : (
                          "Awaiting management review"
                        )}
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

export default SupervisorSiteIssues;