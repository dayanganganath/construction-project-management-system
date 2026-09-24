import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function Boq() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);

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

  const loadItems = async () => {
    try {
      const response = await api.get("/boq-items");
      setItems(response.data);
    } catch (error) {
      console.error("Error loading BOQ items:", error);
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
    const quantity = Number(form.quantity || 0);
    const rate = Number(form.rate || 0);

    return quantity * rate;
  }, [form.quantity, form.rate]);

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

    const data = {
      itemDescription: form.itemDescription,
      specification: form.specification,
      quantity: Number(form.quantity),
      unit: form.unit,
      rate: Number(form.rate),
      project: {
        id: Number(form.projectId),
      },
    };

    try {
      if (editingId) {
        await api.put(`/boq-items/${editingId}`, data);
      } else {
        await api.post("/boq-items", data);
      }

      resetForm();
      loadItems();
    } catch (error) {
      console.error("Error saving BOQ item:", error);
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
      loadItems();
    } catch (error) {
      console.error("Error deleting BOQ item:", error);
    }
  };

  const money = (value) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>BOQ</h1>
          <p>Manage project BOQ items</p>
        </div>
      </div>

      <div className="form-card">
        <h2>{editingId ? "Edit BOQ Item" : "Add BOQ Item"}</h2>

        <form className="boq-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="itemDescription"
            placeholder="Item Description"
            value={form.itemDescription}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="specification"
            placeholder="Specification"
            value={form.specification}
            onChange={handleChange}
          />

          <input
            type="number"
            step="0.01"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="unit"
            placeholder="Unit - sqft / m2 / No."
            value={form.unit}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            step="0.01"
            name="rate"
            placeholder="Rate"
            value={form.rate}
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
                  <td>
                    <strong>{item.itemDescription}</strong>
                    <br />
                    <small>{item.specification}</small>
                  </td>
                  <td>{item.project?.projectName}</td>
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