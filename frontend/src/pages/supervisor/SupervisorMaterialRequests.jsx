import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/supervisor-forms-polish.css";

function SupervisorMaterialRequests() {
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
    requestDate: getToday(),
    materialName: "",
    quantity: "",
    unit: "",
    purpose: "",
    notes: "",
  };

  const [form, setForm] =
    useState(initialForm);

  const [requests, setRequests] =
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
      loadRequests();
    } else {
      setRequests([]);
    }
  }, [selectedProjectId]);

  const loadRequests =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/supervisor/projects/${selectedProjectId}/material-requests`
          );

        const sorted = [
          ...(response.data || []),
        ].sort((a, b) => {
          const dateCompare =
            String(
              b.requestDate || ""
            ).localeCompare(
              String(
                a.requestDate ||
                  ""
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

        setRequests(sorted);
      } catch (error) {
        console.error(
          "Error loading material requests:",
          error
        );

        setError(
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to load material requests."
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
        !form.materialName
          .trim()
      ) {
        setError(
          "Material name is required."
        );

        return;
      }

      if (
        !form.quantity ||
        Number(
          form.quantity
        ) <= 0
      ) {
        setError(
          "Quantity must be greater than zero."
        );

        return;
      }

      if (
        !form.unit.trim()
      ) {
        setError(
          "Unit is required."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        await api.post(
          `/supervisor/projects/${selectedProjectId}/material-requests`,
          {
            requestDate:
              form.requestDate,

            materialName:
              form.materialName
                .trim(),

            quantity:
              Number(
                form.quantity
              ),

            unit:
              form.unit,

            purpose:
              form.purpose
                .trim() ||
              null,

            notes:
              form.notes
                .trim() ||
              null,
          }
        );

        setSuccess(
          "Material request submitted successfully."
        );

        setForm({
          ...initialForm,
          requestDate:
            getToday(),
        });

        await loadRequests();
      } catch (error) {
        console.error(
          "Error saving material request:",
          error
        );

        setError(
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to submit material request."
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

  const getStatusClass = (
    status
  ) => {
    const value =
      String(
        status || "PENDING"
      ).toUpperCase();

    if (
      value === "APPROVED"
    ) {
      return "approved";
    }

    if (
      value === "REJECTED"
    ) {
      return "rejected";
    }

    return "pending";
  };

  const pendingCount =
    requests.filter(
      (request) =>
        String(
          request.status ||
            "PENDING"
        ).toUpperCase() ===
        "PENDING"
    ).length;

  return (
    <div className="supervisor-page">
      <div className="supervisor-page-heading">
        <div>
          <span className="supervisor-eyebrow">
            Site Procurement
          </span>

          <h2>
            Material Requests
          </h2>

          <p>
            Submit site material
            requirements and track
            their approval status.
          </p>
        </div>

        <div className="supervisor-mini-status">
          <span>
            Pending
          </span>

          <strong>
            {pendingCount}
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
              New Material Request
            </h3>

            <p>
              Request materials
              required for current
              site activities.
            </p>
          </div>

          <span className="supervisor-form-badge">
            New Request
          </span>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="supervisor-form-grid supervisor-form-grid-four">
            <div className="supervisor-field">
              <label>
                Request Date
              </label>

              <input
                type="date"
                name="requestDate"
                value={
                  form.requestDate
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="supervisor-field">
              <label>
                Material Name *
              </label>

              <input
                type="text"
                name="materialName"
                placeholder="Example: Cement"
                value={
                  form.materialName
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="supervisor-field">
              <label>
                Quantity *
              </label>

              <input
                type="number"
                name="quantity"
                min="0.01"
                step="0.01"
                placeholder="Enter quantity"
                value={
                  form.quantity
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="supervisor-field">
              <label>
                Unit *
              </label>

              <select
                name="unit"
                value={
                  form.unit
                }
                onChange={
                  handleChange
                }
              >
                <option value="">
                  Select unit
                </option>

                <option value="BAG">
                  Bag
                </option>

                <option value="KG">
                  Kg
                </option>

                <option value="TON">
                  Ton
                </option>

                <option value="M3">
                  m³
                </option>

                <option value="SQFT">
                  Sq.ft
                </option>

                <option value="LFT">
                  L.ft
                </option>

                <option value="NOS">
                  Nos
                </option>

                <option value="PCS">
                  Pieces
                </option>

                <option value="LITER">
                  Liter
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>
          </div>

          <div className="supervisor-form-grid supervisor-form-grid-two">
            <div className="supervisor-field">
              <label>
                Purpose
              </label>

              <textarea
                name="purpose"
                value={
                  form.purpose
                }
                onChange={
                  handleChange
                }
                placeholder="Example: Ground floor plastering"
              />
            </div>

            <div className="supervisor-field">
              <label>
                Notes
              </label>

              <textarea
                name="notes"
                value={
                  form.notes
                }
                onChange={
                  handleChange
                }
                placeholder="Urgency, specification or delivery notes..."
              />
            </div>
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
                : "Submit Material Request"}
            </button>
          </div>
        </form>
      </section>

      <section className="supervisor-form-card">
        <div className="supervisor-form-card-heading">
          <div>
            <h3>
              Request History
            </h3>

            <p>
              Track previously
              submitted material
              requests and approvals.
            </p>
          </div>

          {!loading && (
            <span className="supervisor-count-badge">
              {requests.length} requests
            </span>
          )}
        </div>

        {loading ? (
          <div className="supervisor-table-loading">
            Loading material
            requests...
          </div>
        ) : requests.length ===
          0 ? (
          <div className="supervisor-table-empty">
            <h4>
              No material requests
            </h4>

            <p>
              Submitted material
              requests will appear
              here.
            </p>
          </div>
        ) : (
          <div className="supervisor-table-scroll">
            <table className="supervisor-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>
                    Material
                  </th>
                  <th>
                    Quantity
                  </th>
                  <th>
                    Purpose
                  </th>
                  <th>Status</th>
                  <th>
                    Reviewed By
                  </th>
                  <th>
                    Review Remarks
                  </th>
                </tr>
              </thead>

              <tbody>
                {requests.map(
                  (request) => (
                    <tr
                      key={
                        request.id
                      }
                    >
                      <td>
                        {formatDate(
                          request.requestDate
                        )}
                      </td>

                      <td>
                        <strong className="supervisor-table-primary">
                          {
                            request.materialName
                          }
                        </strong>
                      </td>

                      <td>
                        {request.quantity}{" "}
                        {request.unit}
                      </td>

                      <td>
                        {request.purpose ||
                          "-"}
                      </td>

                      <td>
                        <span
                          className={`supervisor-request-status ${getStatusClass(
                            request.status
                          )}`}
                        >
                          {request.status ||
                            "PENDING"}
                        </span>
                      </td>

                      <td>
                        {request.reviewedBy ||
                          "-"}
                      </td>

                      <td>
                        {request.reviewRemarks ||
                          "-"}
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

export default SupervisorMaterialRequests;