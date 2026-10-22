import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/supervisor-site-polish.css";

function SupervisorSiteIssues() {
  const {
    selectedProjectId,
  } = useOutletContext();

  const getToday = () => {
    const now =
      new Date();

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

  const loadIssues =
    async () => {
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
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to load site issues."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setForm({
        ...form,
        [name]: value,
      });

      setError("");
      setSuccess("");
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

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
          typeof error.response
            ?.data === "string"
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
    ).toLocaleDateString(
      "en-GB"
    );
  };

  const getPriorityClass = (
    priority
  ) => {
    return String(
      priority || "MEDIUM"
    ).toLowerCase();
  };

  const getStatusClass = (
    status
  ) => {
    return String(
      status || "OPEN"
    )
      .toLowerCase()
      .replaceAll(
        "_",
        "-"
      );
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
    <div className="supervisor-page">
      <div className="supervisor-page-heading">
        <div>
          <span className="supervisor-eyebrow">
            Site Management
          </span>

          <h2>
            Site Issues
          </h2>

          <p>
            Report construction
            problems, blockers and
            site instructions for
            management review.
          </p>
        </div>

        <div className="supervisor-mini-status">
          <span>
            Open Issues
          </span>

          <strong>
            {openCount}
          </strong>
        </div>
      </div>

      {error && (
        <div className="supervisor-form-alert supervisor-form-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="supervisor-form-alert supervisor-form-alert-success">
          {success}
        </div>
      )}

      <div className="supervisor-issue-summary-grid">
        <div className="supervisor-issue-summary-card open">
          <span>
            Open
          </span>

          <strong>
            {openCount}
          </strong>
        </div>

        <div className="supervisor-issue-summary-card progress">
          <span>
            In Progress
          </span>

          <strong>
            {inProgressCount}
          </strong>
        </div>

        <div className="supervisor-issue-summary-card resolved">
          <span>
            Resolved
          </span>

          <strong>
            {resolvedCount}
          </strong>
        </div>

        <div className="supervisor-issue-summary-card total">
          <span>
            Total Issues
          </span>

          <strong>
            {issues.length}
          </strong>
        </div>
      </div>

      <section className="supervisor-form-card">
        <div className="supervisor-form-card-heading">
          <div>
            <h3>
              Report New Issue
            </h3>

            <p>
              Record an issue or
              blocker requiring
              management attention.
            </p>
          </div>

          <span className="supervisor-form-badge">
            New Issue
          </span>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="supervisor-form-grid supervisor-form-grid-two">
            <div className="supervisor-field">
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

            <div className="supervisor-field">
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

          <div className="supervisor-field supervisor-field-full">
            <label>
              Issue Title *
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

          <div className="supervisor-field supervisor-field-full">
            <label>
              Description *
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              placeholder="Describe the issue, exact location and required action..."
            />
          </div>

          <div className="supervisor-form-actions">
            <button
              type="submit"
              className="supervisor-primary-button"
              disabled={
                saving ||
                !selectedProjectId
              }
            >
              {saving
                ? "Submitting..."
                : "Report Site Issue"}
            </button>
          </div>
        </form>
      </section>

      <section className="supervisor-form-card">
        <div className="supervisor-form-card-heading">
          <div>
            <h3>
              Issue History
            </h3>

            <p>
              Track management
              action and issue
              resolution status.
            </p>
          </div>

          {!loading && (
            <span className="supervisor-count-badge">
              {issues.length} issues
            </span>
          )}
        </div>

        {loading ? (
          <div className="supervisor-table-loading">
            Loading site issues...
          </div>
        ) : issues.length ===
          0 ? (
          <div className="supervisor-table-empty">
            <h4>
              No site issues
            </h4>

            <p>
              Reported issues will
              appear here.
            </p>
          </div>
        ) : (
          <div className="supervisor-table-scroll">
            <table className="supervisor-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>
                    Reported By
                  </th>
                  <th>
                    Management Review
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
                        <strong className="supervisor-table-primary">
                          {issue.title}
                        </strong>

                        <div className="supervisor-issue-description">
                          {
                            issue.description
                          }
                        </div>
                      </td>

                      <td>
                        <span
                          className={`supervisor-priority-badge ${getPriorityClass(
                            issue.priority
                          )}`}
                        >
                          {issue.priority ||
                            "MEDIUM"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`supervisor-status-badge ${getStatusClass(
                            issue.status
                          )}`}
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
                          <div className="supervisor-review-info">
                            <strong>
                              {
                                issue.reviewedBy
                              }
                            </strong>

                            <span>
                              {formatDate(
                                issue.reviewedDate
                              )}
                            </span>

                            {issue.resolutionNote && (
                              <p>
                                {
                                  issue.resolutionNote
                                }
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="supervisor-awaiting-review">
                            Awaiting management
                            review
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default SupervisorSiteIssues;