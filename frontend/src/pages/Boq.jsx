import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function Boq() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    itemDescription: "",
    specification: "",
    quantity: "",
    unit: "",
    rate: "",
    projectId: "",
  });

  useEffect(() => {
    loadItems();
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

  const loadItems = async () => {
    try {
      const response = await api.get("/boq-items");
      setItems(response.data);
    } catch (error) {
      console.error("Error loading BOQ items:", error);
      showAlert("error", "Unable to load BOQ items.");
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

  const calculatedTotal = useMemo(() => {
    const quantity = Number(form.quantity) || 0;
    const rate = Number(form.rate) || 0;

    return quantity * rate;
  }, [form.quantity, form.rate]);

  const validateForm = () => {
    if (!form.projectId) {
      showAlert("error", "Please select a project.");
      return false;
    }

    if (!form.itemDescription.trim()) {
      showAlert("error", "Item description is required.");
      return false;
    }

    if (form.quantity === "" || Number(form.quantity) <= 0) {
      showAlert("error", "Quantity must be greater than 0.");
      return false;
    }

    if (!form.unit.trim()) {
      showAlert("error", "Unit is required.");
      return false;
    }

    if (form.rate === "" || Number(form.rate) < 0) {
      showAlert("error", "Please enter a valid rate.");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      itemDescription: "",
      specification: "",
      quantity: "",
      unit: "",
      rate: "",
      projectId: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const boqData = {
      itemDescription: form.itemDescription.trim(),
      specification: form.specification.trim(),
      quantity: Number(form.quantity),
      unit: form.unit.trim(),
      rate: Number(form.rate),
      project: {
        id: Number(form.projectId),
      },
    };

    try {
      if (editingId) {
        await api.put(`/boq-items/${editingId}`, boqData);
        showAlert("success", "BOQ item updated successfully.");
      } else {
        await api.post("/boq-items", boqData);
        showAlert("success", "BOQ item added successfully.");
      }

      resetForm();
      loadItems();
    } catch (error) {
      console.error("Error saving BOQ item:", error);
      showAlert("error", "Unable to save BOQ item. Please try again.");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      itemDescription: item.itemDescription || "",
      specification: item.specification || "",
      quantity: item.quantity || "",
      unit: item.unit || "",
      rate: item.rate || "",
      projectId: item.project?.id || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this BOQ item?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/boq-items/${id}`);
      showAlert("success", "BOQ item deleted successfully.");
      loadItems();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting BOQ item:", error);
      showAlert("error", "Unable to delete BOQ item.");
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
          <h1>BOQ</h1>
          <p>Manage project Bill of Quantities</p>
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
        <h2>{editingId ? "Edit BOQ Item" : "Add BOQ Item"}</h2>

        <form className="boq-form" onSubmit={handleSubmit}>
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

          <input
            type="text"
            name="itemDescription"
            placeholder="Item Description *"
            value={form.itemDescription}
            onChange={handleChange}
            maxLength="200"
          />

          <input
            type="text"
            name="specification"
            placeholder="Specification"
            value={form.specification}
            onChange={handleChange}
            maxLength="250"
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity *"
            min="0"
            step="0.01"
            value={form.quantity}
            onChange={handleChange}
          />

          <input
            type="text"
            name="unit"
            placeholder="Unit *"
            value={form.unit}
            onChange={handleChange}
            maxLength="20"
          />

          <input
            type="number"
            name="rate"
            placeholder="Rate *"
            min="0"
            step="0.01"
            value={form.rate}
            onChange={handleChange}
          />

          <div className="boq-total-preview">
            <span>Calculated Total</span>
            <strong>{money(calculatedTotal)}</strong>
          </div>

          <button type="submit" className="primary-button">
            {editingId ? "Update BOQ Item" : "Add BOQ Item"}
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
              <th>Description</th>
              <th>Project</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="8">No BOQ items found.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.itemDescription}</td>
                  <td>{item.project?.projectName || "-"}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>{money(item.rate)}</td>
                  <td>{money(item.total)}</td>

                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(item.id)}
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

export default Boq;