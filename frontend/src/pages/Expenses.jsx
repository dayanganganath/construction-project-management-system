import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

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

  const showAlert = (type, message) => {
    setAlert({ type, message });

    setTimeout(() => {
      setAlert({
        type: "",
        message: "",
      });
    }, 3000);
  };

  const loadExpenses = async () => {
    try {
      const response = await api.get("/expenses");
      setExpenses(response.data);
    } catch (error) {
      console.error("Error loading expenses:", error);
      showAlert("error", "Unable to load expenses.");
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

  const validateForm = () => {
    if (!form.projectId) {
      showAlert("error", "Please select a project.");
      return false;
    }

    if (!form.description.trim()) {
      showAlert("error", "Expense description is required.");
      return false;
    }

    if (form.amount === "" || Number(form.amount) <= 0) {
      showAlert("error", "Expense amount must be greater than 0.");
      return false;
    }

    if (!form.date) {
      showAlert("error", "Expense date is required.");
      return false;
    }

    return true;
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

    if (!validateForm()) {
      return;
    }

    const expenseData = {
      expenseType: form.expenseType,
      description: form.description.trim(),
      amount: Number(form.amount),
      date: form.date,
      project: {
        id: Number(form.projectId),
      },
    };

    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, expenseData);
        showAlert("success", "Expense updated successfully.");
      } else {
        await api.post("/expenses", expenseData);
        showAlert("success", "Expense added successfully.");
      }

      resetForm();
      loadExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
      showAlert("error", "Unable to save expense. Please try again.");
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
      showAlert("success", "Expense deleted successfully.");
      loadExpenses();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      showAlert("error", "Unable to delete expense.");
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
          <p>Track project expenses and site costs</p>
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
        <h2>{editingId ? "Edit Expense" : "Add Expense"}</h2>

        <form className="expense-form" onSubmit={handleSubmit}>
          <select
            name="expenseType"
            value={form.expenseType}
            onChange={handleChange}
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
            placeholder="Expense Description *"
            value={form.description}
            onChange={handleChange}
            maxLength="200"
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount *"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />

          <select
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
          >
            <option value="">Select Project *</option>

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
                  <td>{expense.project?.projectName || "-"}</td>
                  <td>{expense.date || "-"}</td>
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