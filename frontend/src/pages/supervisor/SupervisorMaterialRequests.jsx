import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

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
    }
  }, [selectedProjectId]);

  const loadRequests =
    async () => {
      try {
        setLoading(true);

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
          "Unable to load material requests."
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
          typeof error.response?.data ===
            "string"
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
    ).toLocaleDateString();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Material Requests
          </h1>

          <p>
            Submit and track site
            material requirements.
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
          New Material Request
        </h2>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="progress-form">
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

            <input
              type="text"
              name="materialName"
              placeholder="Material Name *"
              value={
                form.materialName
              }
              onChange={
                handleChange
              }
            />

            <input
              type="number"
              name="quantity"
              min="0.01"
              step="0.01"
              placeholder="Quantity *"
              value={
                form.quantity
              }
              onChange={
                handleChange
              }
            />

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
                Select Unit *
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

          <div style={{
            marginTop: "15px",
          }}>
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

          <div style={{
            marginTop: "15px",
          }}>
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

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
            style={{
              marginTop: "18px",
            }}
          >
            {saving
              ? "Submitting..."
              : "Submit Request"}
          </button>
        </form>
      </div>

      <div className="form-card">
        <h2>
          Request History
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : requests.length ===
          0 ? (
          <p>
            No material requests
            found.
          </p>
        ) : (
          <div className="table-card">
            <table className="data-table">
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
                        <strong>
                          {request.materialName}
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
                        {request.status ||
                          "PENDING"}
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
      </div>
    </div>
  );
}

export default SupervisorMaterialRequests;