import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/supervisor-forms-polish.css";

function SupervisorProgress() {
  const {
    selectedProjectId,
    selectedProject,
    refreshSelectedProject,
  } = useOutletContext();

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

  const initialForm = {
    date: getToday(),
    workDescription: "",
    progressPercentage: "",
    workersCount: "",
    remarks: "",
    tomorrowPlan: "",
    issuesBlockers: "",
  };

  const [form, setForm] =
    useState(initialForm);

  const [history, setHistory] =
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
      loadHistory();
    } else {
      setHistory([]);
    }
  }, [selectedProjectId]);

  const loadHistory =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/supervisor/projects/${selectedProjectId}/progress`
          );

        const sorted = [
          ...(response.data || []),
        ].sort((a, b) => {
          const dateCompare =
            String(
              b.date || ""
            ).localeCompare(
              String(
                a.date || ""
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

        setHistory(sorted);
      } catch (error) {
        console.error(
          "Error loading progress:",
          error
        );

        setError(
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to load progress history."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleChange = (
    event
  ) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        !form.workDescription
          .trim()
      ) {
        setError(
          "Today's work description is required."
        );

        return;
      }

      const progress =
        Number(
          form.progressPercentage
        );

      if (
        form.progressPercentage ===
          "" ||
        progress < 0 ||
        progress > 100
      ) {
        setError(
          "Progress must be between 0 and 100."
        );

        return;
      }

      const workers =
        Number(
          form.workersCount
        );

      if (
        form.workersCount ===
          "" ||
        workers < 0
      ) {
        setError(
          "Please enter a valid workers count."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        await api.post(
          `/supervisor/projects/${selectedProjectId}/progress`,
          {
            date: form.date,

            workDescription:
              form.workDescription
                .trim(),

            progressPercentage:
              progress,

            workersCount:
              workers,

            remarks:
              form.remarks.trim(),

            tomorrowPlan:
              form.tomorrowPlan
                .trim(),

            issuesBlockers:
              form.issuesBlockers
                .trim(),
          }
        );

        setSuccess(
          "Daily progress saved successfully."
        );

        setForm({
          ...initialForm,
          date: getToday(),
        });

        await loadHistory();

        await refreshSelectedProject();
      } catch (error) {
        console.error(
          "Error saving progress:",
          error
        );

        setError(
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to save daily progress."
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

  const currentProgress =
    Number(
      selectedProject
        ?.latestProgressPercentage ??
        0
    );

  return (
    <div className="supervisor-page">
      <div className="supervisor-page-heading">
        <div>
          <span className="supervisor-eyebrow">
            Site Reporting
          </span>

          <h2>
            Daily Progress
          </h2>

          <p>
            Record today's work,
            workforce, progress and
            upcoming site activities.
          </p>
        </div>

        <div className="supervisor-mini-status">
          <span>
            Current Progress
          </span>

          <strong>
            {currentProgress}%
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

      <section className="supervisor-form-card">
        <div className="supervisor-form-card-heading">
          <div>
            <h3>
              Add Daily Progress
            </h3>

            <p>
              Complete the daily
              site report for the
              selected project.
            </p>
          </div>

          <span className="supervisor-form-badge">
            Daily Report
          </span>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="supervisor-form-grid supervisor-form-grid-three">
            <div className="supervisor-field">
              <label>
                Report Date
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="supervisor-field">
              <label>
                Progress %
              </label>

              <input
                type="number"
                name="progressPercentage"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={
                  form.progressPercentage
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="supervisor-field">
              <label>
                Workers on Site
              </label>

              <input
                type="number"
                name="workersCount"
                min="0"
                placeholder="Enter worker count"
                value={
                  form.workersCount
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </div>

          <div className="supervisor-field supervisor-field-full">
            <label>
              Today's Work *
            </label>

            <textarea
              name="workDescription"
              value={
                form.workDescription
              }
              onChange={
                handleChange
              }
              placeholder="Describe work completed today..."
            />
          </div>

          <div className="supervisor-form-grid supervisor-form-grid-two">
            <div className="supervisor-field">
              <label>
                Tomorrow Plan
              </label>

              <textarea
                name="tomorrowPlan"
                value={
                  form.tomorrowPlan
                }
                onChange={
                  handleChange
                }
                placeholder="Planned work for tomorrow..."
              />
            </div>

            <div className="supervisor-field">
              <label>
                Issues / Blockers
              </label>

              <textarea
                name="issuesBlockers"
                value={
                  form.issuesBlockers
                }
                onChange={
                  handleChange
                }
                placeholder="Delays, shortages or blockers..."
              />
            </div>
          </div>

          <div className="supervisor-field supervisor-field-full">
            <label>
              Remarks
            </label>

            <textarea
              name="remarks"
              value={
                form.remarks
              }
              onChange={
                handleChange
              }
              placeholder="Additional notes or remarks..."
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
                ? "Saving..."
                : "Save Daily Progress"}
            </button>
          </div>
        </form>
      </section>

      <section className="supervisor-form-card">
        <div className="supervisor-form-card-heading">
          <div>
            <h3>
              Progress History
            </h3>

            <p>
              Previous daily site
              reports for this
              project.
            </p>
          </div>

          {!loading && (
            <span className="supervisor-count-badge">
              {history.length} reports
            </span>
          )}
        </div>

        {loading ? (
          <div className="supervisor-table-loading">
            Loading progress
            history...
          </div>
        ) : history.length ===
          0 ? (
          <div className="supervisor-table-empty">
            <h4>
              No progress records
            </h4>

            <p>
              Daily progress
              reports will appear
              here after submission.
            </p>
          </div>
        ) : (
          <div className="supervisor-table-scroll">
            <table className="supervisor-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Work</th>
                  <th>Progress</th>
                  <th>Workers</th>
                  <th>
                    Tomorrow Plan
                  </th>
                  <th>
                    Issues / Blockers
                  </th>
                </tr>
              </thead>

              <tbody>
                {history.map(
                  (item) => (
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
                        <strong className="supervisor-table-primary">
                          {item.workDescription ||
                            "-"}
                        </strong>
                      </td>

                      <td>
                        <span className="supervisor-progress-chip">
                          {item.progressPercentage ??
                            0}
                          %
                        </span>
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
                        {item.issuesBlockers ? (
                          <span className="supervisor-issue-text">
                            {
                              item.issuesBlockers
                            }
                          </span>
                        ) : (
                          "-"
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

export default SupervisorProgress;