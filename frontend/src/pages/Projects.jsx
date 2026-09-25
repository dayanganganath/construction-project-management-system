import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    projectName: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "PLANNED",
    budget: "",
    clientId: "",
  });

  useEffect(() => {
    loadProjects();
    loadClients();
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

  const loadProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error loading projects:", error);
      showAlert("error", "Unable to load projects.");
    }
  };

  const loadClients = async () => {
    try {
      const response = await api.get("/clients");
      setClients(response.data);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!form.projectName.trim()) {
      showAlert("error", "Project name is required.");
      return false;
    }

    if (!form.clientId) {
      showAlert("error", "Please select a client.");
      return false;
    }

    if (!form.startDate) {
      showAlert("error", "Start date is required.");
      return false;
    }

    if (form.endDate && form.endDate < form.startDate) {
      showAlert(
        "error",
        "End date cannot be earlier than the start date."
      );
      return false;
    }

    if (form.budget === "") {
      showAlert("error", "Project budget is required.");
      return false;
    }

    if (Number(form.budget) < 0) {
      showAlert("error", "Project budget cannot be negative.");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      projectName: "",
      location: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "PLANNED",
      budget: "",
      clientId: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const projectData = {
      projectName: form.projectName.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      startDate: form.startDate,
      endDate: form.endDate || null,
      status: form.status,
      budget: Number(form.budget),
      client: {
        id: Number(form.clientId),
      },
    };

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, projectData);
        showAlert("success", "Project updated successfully.");
      } else {
        await api.post("/projects", projectData);
        showAlert("success", "Project added successfully.");
      }

      resetForm();
      loadProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      showAlert("error", "Unable to save project. Please try again.");
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);

    setForm({
      projectName: project.projectName || "",
      location: project.location || "",
      description: project.description || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      status: project.status || "PLANNED",
      budget: project.budget || "",
      clientId: project.client?.id || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/projects/${id}`);

      showAlert("success", "Project deleted successfully.");
      loadProjects();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting project:", error);

      showAlert(
        "error",
        "Unable to delete this project. It may contain BOQ, payment, expense, or progress records."
      );
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
          <h1>Projects</h1>
          <p>Manage construction projects</p>
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
        <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>

        <form className="project-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="projectName"
            placeholder="Project Name *"
            value={form.projectName}
            onChange={handleChange}
            maxLength="150"
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            maxLength="150"
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            maxLength="250"
          />

          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
          />

          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="PLANNED">Planned</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>

          <input
            type="number"
            name="budget"
            placeholder="Project Budget *"
            min="0"
            step="0.01"
            value={form.budget}
            onChange={handleChange}
          />

          <select
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
          >
            <option value="">Select Client *</option>

            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <button type="submit" className="primary-button">
            {editingId ? "Update Project" : "Add Project"}
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
              <th>Client</th>
              <th>Location</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="9">No projects found.</td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.id}</td>
                  <td>{project.projectName}</td>
                  <td>{project.client?.name || "-"}</td>
                  <td>{project.location || "-"}</td>
                  <td>{project.status}</td>
                  <td>{money(project.budget)}</td>
                  <td>{project.startDate || "-"}</td>
                  <td>{project.endDate || "-"}</td>

                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(project)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(project.id)}
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

export default Projects;