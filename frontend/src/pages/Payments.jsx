import { useEffect, useState } from "react";
import api from "../services/api";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    amount: "",
    paymentDate: "",
    paymentMethod: "Bank Transfer",
    referenceNumber: "",
    notes: "",
    projectId: "",
  });

  useEffect(() => {
    loadPayments();
    loadProjects();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await api.get("/payments");
      setPayments(response.data);
    } catch (error) {
      console.error("Error loading payments:", error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      amount: "",
      paymentDate: "",
      paymentMethod: "Bank Transfer",
      referenceNumber: "",
      notes: "",
      projectId: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const paymentData = {
      amount: Number(form.amount),
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      referenceNumber: form.referenceNumber,
      notes: form.notes,
      project: {
        id: Number(form.projectId),
      },
    };

    try {
      if (editingId) {
        await api.put(`/payments/${editingId}`, paymentData);
      } else {
        await api.post("/payments", paymentData);
      }

      resetForm();
      loadPayments();
    } catch (error) {
      console.error("Error saving payment:", error);
    }
  };

  const handleEdit = (payment) => {
    setEditingId(payment.id);

    setForm({
      amount: payment.amount || "",
      paymentDate: payment.paymentDate || "",
      paymentMethod: payment.paymentMethod || "Bank Transfer",
      referenceNumber: payment.referenceNumber || "",
      notes: payment.notes || "",
      projectId: payment.project?.id || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/payments/${id}`);
      loadPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  const money = (value) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Track client payments for each project</p>
        </div>
      </div>

      <div className="form-card">
        <h2>{editingId ? "Edit Payment" : "Add Payment"}</h2>

        <form className="payment-form" onSubmit={handleSubmit}>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="paymentDate"
            value={form.paymentDate}
            onChange={handleChange}
            required
          />

          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Card">Card</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="text"
            name="referenceNumber"
            placeholder="Reference Number"
            value={form.referenceNumber}
            onChange={handleChange}
          />

          <input
            type="text"
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
          />

          <select
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            required
          >
            <option value="">Select Project</option>

            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>

          <button type="submit" className="primary-button">
            {editingId ? "Update Payment" : "Add Payment"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Project</th>
              <th>Date</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="7">No payments found.</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.project?.projectName}</td>
                  <td>{payment.paymentDate}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>{payment.referenceNumber || "-"}</td>
                  <td>{money(payment.amount)}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(payment)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(payment.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payments;