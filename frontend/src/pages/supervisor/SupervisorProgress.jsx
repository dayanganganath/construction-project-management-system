import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

function SupervisorProgress() {
  const {
    selectedProjectId,
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
    }
  }, [selectedProjectId]);

  const loadHistory =
    async () => {
      try {
        setLoading(true);

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
          "Unable to load progress history."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

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
        form.workersCount === "" ||
        workers < 0
      ) {
        setError(
          "Please enter a valid workers count."
        );
        return;
      }

      try {
        setSaving(true);

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
          typeof error.response?.data ===
            "string"
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
    ).toLocaleDateString();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Daily Progress
          </h1>

          <p>
            Submit and review daily
            site progress.
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
          Add Daily Progress
        </h2>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="progress-form">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={
                handleChange
              }
            />

            <input
              type="number"
              name="progressPercentage"
              min="0"
              max="100"
              placeholder="Progress % *"
              value={
                form.progressPercentage
              }
              onChange={
                handleChange
              }
            />

            <input
              type="number"
              name="workersCount"
              min="0"
              placeholder="Workers Count *"
              value={
                form.workersCount
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div style={{
            marginTop: "15px",
          }}>
            <label>
              Today&apos;s Work *
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

          <div style={{
            marginTop: "15px",
          }}>
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
            />
          </div>

          <div style={{
            marginTop: "15px",
          }}>
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
            />
          </div>

          <div style={{
            marginTop: "15px",
          }}>
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
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
            style={{
              marginTop: "18px",
            }}
          >
            {saving
              ? "Saving..."
              : "Save Daily Progress"}
          </button>
        </form>
      </div>

      <div className="form-card">
        <h2>
          Progress History
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : history.length === 0 ? (
          <p>
            No progress records.
          </p>
        ) : (
          <div className="table-card">
            <table className="data-table">
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
    </div>
  );
}

export default SupervisorProgress;