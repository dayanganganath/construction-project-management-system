import { useEffect, useState } from "react";
import api from "../services/api";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    expenseType: "MATERIAL",
    description: "",
    amount: "",
    date: "",
    projectId: "",
  });

  useEffect(() => {
    loadExpenses();
    loadProjects();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await api.get("/expenses");
      setExpenses(response.data);
    } catch (error) {
      console.error("Error loading expenses:", error);
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
      expenseType: "MATERIAL",
      description: "",
      amount: "",
      date: "",
      projectId: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expenseData = {
      expenseType: form.expenseType,
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
      project: {
        id: Number(form.projectId),
      },
    };

    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, expenseData);
      } else {
        await api.post("/expenses", expenseData);
      }

      resetForm();
      loadExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);

    setForm({
      expenseType: expense.expenseType || "MATERIAL",
      description: expense.description || "",
      amount: expense.amount || "",
      date: expense.date || "",
      projectId: expense.project?.id || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/expenses/${id}`);
      loadExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
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
          <h1>Expenses</h1>
          <p>Track project costs and site expenses</p>
        </div>
      </div>

      <div className="form-card">
        <h2>{editingId ? "Edit Expense" : "Add Expense"}</h2>

        <form className="expense-form" onSubmit={handleSubmit}>
          <select
            name="expenseType"
            value={form.expenseType}
            onChange={handleChange}
            required
          >
            <option value="MATERIAL">Material</option>
            <option value="LABOUR">Labour</option>
            <option value="TRANSPORT">Transport</option>
            <option value="TOOLS">Tools</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />

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
            name="date"
            value={form.date}
            onChange={handleChange}
            required
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
            {editingId ? "Update Expense" : "Add Expense"}
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
              <th>Type</th>
              <th>Description</th>
              <th>Project</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="7">No expenses found.</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.id}</td>
                  <td>{expense.expenseType}</td>
                  <td>{expense.description}</td>
                  <td>{expense.project?.projectName}</td>
                  <td>{expense.date}</td>
                  <td>{money(expense.amount)}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(expense)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(expense.id)}
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

export default Expenses;