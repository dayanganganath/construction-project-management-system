import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function LabourPayments() {
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [filters, setFilters] = useState({
    projectId: "",
    workerId: "",
  });

  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    projectId: "",
    workerId: "",
    amount: "",
    paymentMethod: "CASH",
    status: "PAID",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    loadProjects();
    loadWorkers();
    loadPayments();
  }, []);

  const showAlert = (type, message) => {
    setAlert({
      type,
      message,
    });

    setTimeout(() => {
      setAlert({
        type: "",
        message: "",
      });
    }, 4000);
  };

  const loadProjects = async () => {
    try {
      const response = await api.get("/projects");

      setProjects(
        response.data || []
      );
    } catch (error) {
      console.error(
        "Error loading projects:",
        error
      );

      showAlert(
        "error",
        "Unable to load projects."
      );
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await api.get("/workers");

      setWorkers(
        response.data || []
      );
    } catch (error) {
      console.error(
        "Error loading workers:",
        error
      );

      showAlert(
        "error",
        "Unable to load workers."
      );
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);

      const response =
        await api.get("/labour-payments");

      setPayments(
        response.data || []
      );
    } catch (error) {
      console.error(
        "Error loading labour payments:",
        error
      );

      showAlert(
        "error",
        "Unable to load labour payments."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      paymentDate: new Date()
        .toISOString()
        .split("T")[0],

      projectId: "",
      workerId: "",
      amount: "",
      paymentMethod: "CASH",
      status: "PAID",
      reference: "",
      notes: "",
    });
  };

  const validateForm = () => {
    if (!formData.paymentDate) {
      showAlert(
        "error",
        "Payment date is required."
      );

      return false;
    }

    if (!formData.projectId) {
      showAlert(
        "error",
        "Please select a project / site."
      );

      return false;
    }

    if (!formData.workerId) {
      showAlert(
        "error",
        "Please select a worker."
      );

      return false;
    }

    if (
      formData.amount === "" ||
      Number(formData.amount) <= 0
    ) {
      showAlert(
        "error",
        "Payment amount must be greater than zero."
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      paymentDate:
        formData.paymentDate,

      amount:
        Number(formData.amount),

      paymentMethod:
        formData.paymentMethod,

      status:
        formData.status,

      reference:
        formData.reference.trim() ||
        null,

      notes:
        formData.notes.trim() ||
        null,

      worker: {
        id: Number(
          formData.workerId
        ),
      },

      project: {
        id: Number(
          formData.projectId
        ),
      },
    };

    try {
      setLoading(true);

      await api.post(
        "/labour-payments",
        payload
      );

      showAlert(
        "success",
        "Labour payment saved successfully."
      );

      resetForm();

      await loadPayments();
    } catch (error) {
      console.error(
        "Error saving labour payment:",
        error
      );

      showAlert(
        "error",
        typeof error.response?.data ===
          "string"
          ? error.response.data
          : "Unable to save labour payment."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments =
    useMemo(() => {
      return [...payments]
        .filter((payment) => {
          if (
            filters.projectId &&
            String(
              payment.project?.id
            ) !==
              String(
                filters.projectId
              )
          ) {
            return false;
          }

          if (
            filters.workerId &&
            String(
              payment.worker?.id
            ) !==
              String(
                filters.workerId
              )
          ) {
            return false;
          }

          return true;
        })
        .sort((a, b) => {
          const dateCompare =
            String(
              b.paymentDate || ""
            ).localeCompare(
              String(
                a.paymentDate || ""
              )
            );

          if (dateCompare !== 0) {
            return dateCompare;
          }

          return Number(
            b.id || 0
          ) -
            Number(
              a.id || 0
            );
        });
    }, [
      payments,
      filters.projectId,
      filters.workerId,
    ]);

  const totalPaid =
    useMemo(() => {
      return filteredPayments
        .filter(
          (payment) =>
            payment.status === "PAID"
        )
        .reduce(
          (total, payment) =>
            total +
            Number(
              payment.amount || 0
            ),
          0
        );
    }, [filteredPayments]);

  const totalPending =
    useMemo(() => {
      return filteredPayments
        .filter(
          (payment) =>
            payment.status ===
            "PENDING"
        )
        .reduce(
          (total, payment) =>
            total +
            Number(
              payment.amount || 0
            ),
          0
        );
    }, [filteredPayments]);

  const formatAmount = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const clearFilters = () => {
    setFilters({
      projectId: "",
      workerId: "",
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Labour Payments
          </h1>

          <p>
            Record daily worker
            payments by project /
            site and track paid or
            pending amounts.
          </p>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() =>
          setAlert({
            type: "",
            message: "",
          })
        }
      />

      <div className="form-card">
        <h2>
          Add Labour Payment
        </h2>

        <form
          className="client-form"
          onSubmit={handleSubmit}
        >
          <div>
            <label>
              Payment Date *
            </label>

            <input
              type="date"
              name="paymentDate"
              value={
                formData.paymentDate
              }
              onChange={
                handleFormChange
              }
            />
          </div>

          <div>
            <label>
              Project / Site *
            </label>

            <select
              name="projectId"
              value={
                formData.projectId
              }
              onChange={
                handleFormChange
              }
            >
              <option value="">
                Select Project /
                Site
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
              Worker *
            </label>

            <select
              name="workerId"
              value={
                formData.workerId
              }
              onChange={
                handleFormChange
              }
            >
              <option value="">
                Select Worker
              </option>

              {workers
                .filter(
                  (worker) =>
                    worker.active !==
                    false
                )
                .map(
                  (worker) => (
                    <option
                      key={
                        worker.id
                      }
                      value={
                        worker.id
                      }
                    >
                      {worker.name}

                      {worker.tradeType
                        ? ` - ${worker.tradeType}`
                        : ""}
                    </option>
                  )
                )}
            </select>
          </div>

          <div>
            <label>
              Amount *
            </label>

            <input
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              value={
                formData.amount
              }
              onChange={
                handleFormChange
              }
              placeholder="Example: 4000"
            />
          </div>

          <div>
            <label>
              Payment Method *
            </label>

            <select
              name="paymentMethod"
              value={
                formData.paymentMethod
              }
              onChange={
                handleFormChange
              }
            >
              <option value="CASH">
                Cash
              </option>

              <option value="BANK">
                Bank
              </option>
            </select>
          </div>

          <div>
            <label>
              Status *
            </label>

            <select
              name="status"
              value={
                formData.status
              }
              onChange={
                handleFormChange
              }
            >
              <option value="PAID">
                Paid
              </option>

              <option value="PENDING">
                Pending
              </option>
            </select>
          </div>

          <div>
            <label>
              Reference
            </label>

            <input
              type="text"
              name="reference"
              value={
                formData.reference
              }
              onChange={
                handleFormChange
              }
              placeholder="Cash voucher / bank ref"
            />
          </div>

          <div>
            <label>
              Notes
            </label>

            <input
              type="text"
              name="notes"
              value={
                formData.notes
              }
              onChange={
                handleFormChange
              }
              placeholder="Payment note"
            />
          </div>

          <div>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              Save Payment
            </button>
          </div>
        </form>
      </div>

      <div
        className="form-card"
        style={{
          marginTop: "24px",
        }}
      >
        <h2>
          Filter Labour Payments
        </h2>

        <div
          className="client-form"
        >
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
                All Projects /
                Sites
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
              Worker
            </label>

            <select
              name="workerId"
              value={
                filters.workerId
              }
              onChange={
                handleFilterChange
              }
            >
              <option value="">
                All Workers
              </option>

              {workers.map(
                (worker) => (
                  <option
                    key={
                      worker.id
                    }
                    value={
                      worker.id
                    }
                  >
                    {worker.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "end",
            }}
          >
            <button
              type="button"
              className="cancel-button"
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{
          marginTop: "24px",
        }}
      >
        <div className="dashboard-card green">
          <p>
            Total Paid
          </p>

          <h2>
            Rs.{" "}
            {formatAmount(
              totalPaid
            )}
          </h2>
        </div>

        <div className="dashboard-card orange">
          <p>
            Total Pending
          </p>

          <h2>
            Rs.{" "}
            {formatAmount(
              totalPending
            )}
          </h2>
        </div>

        <div className="dashboard-card blue">
          <p>
            Records
          </p>

          <h2>
            {
              filteredPayments.length
            }
          </h2>
        </div>
      </div>

      <div
        className="table-card"
        style={{
          marginTop: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: "15px",
            marginBottom:
              "15px",
          }}
        >
          <div>
            <h2>
              Payment History
            </h2>

            <p>
              {
                filteredPayments.length
              }{" "}
              payment(s)
            </p>
          </div>

          {loading && (
            <span>
              Loading...
            </span>
          )}
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>
                Project / Site
              </th>
              <th>Worker</th>
              <th>Trade</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>
                Reference
              </th>
              <th>Notes</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
            filteredPayments.length ===
              0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  No labour payments
                  found.
                </td>
              </tr>
            ) : (
              filteredPayments.map(
                (payment) => (
                  <tr
                    key={
                      payment.id
                    }
                  >
                    <td>
                      {payment.paymentDate ||
                        "-"}
                    </td>

                    <td>
                      <strong>
                        {payment.project
                          ?.projectName ||
                          "-"}
                      </strong>

                      {payment.project
                        ?.location && (
                        <div
                          style={{
                            marginTop:
                              "4px",
                            fontSize:
                              "12px",
                            opacity:
                              0.7,
                          }}
                        >
                          {
                            payment
                              .project
                              .location
                          }
                        </div>
                      )}
                    </td>

                    <td>
                      <strong>
                        {payment.worker
                          ?.name ||
                          "-"}
                      </strong>
                    </td>

                    <td>
                      {payment.worker
                        ?.tradeType ||
                        "-"}
                    </td>

                    <td>
                      Rs.{" "}
                      {formatAmount(
                        payment.amount
                      )}
                    </td>

                    <td>
                      {payment.paymentMethod ||
                        "-"}
                    </td>

                    <td>
                      {payment.status ||
                        "-"}
                    </td>

                    <td>
                      {payment.reference ||
                        "-"}
                    </td>

                    <td>
                      {payment.notes ||
                        "-"}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LabourPayments;