import { useEffect, useState } from "react";
import api from "../services/api";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    projectName: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "ONGOING",
    budget: "",
    clientId: "",
  });

  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error loading projects:", error);
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

  const resetForm = () => {
    setForm({
      projectName: "",
      location: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "ONGOING",
      budget: "",
      clientId: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectData = {
      projectName: form.projectName,
      location: form.location,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      budget: Number(form.budget),
      client: {
        id: Number(form.clientId),
      },
    };

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, projectData);
      } else {
        await api.post("/projects", projectData);
      }

      resetForm();
      loadProjects();
    } catch (error) {
      console.error("Error saving project:", error);
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
      status: project.status || "ONGOING",
      budget: project.budget || "",
      clientId: project.client?.id || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
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

      <div className="form-card">
        <h2>{editingId ? "Edit Project" : "Add Project"}</h2>

        <form className="project-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="projectName"
            placeholder="Project Name"
            value={form.projectName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
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
            <option value="ONGOING">Ongoing</option>
            <option value="PLANNED">Planned</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>

          <input
            type="number"
            name="budget"
            placeholder="Budget"
            value={form.budget}
            onChange={handleChange}
            required
          />

          <select
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            required
          >
            <option value="">Select Client</option>

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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="7">No projects found.</td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.id}</td>
                  <td>{project.projectName}</td>
                  <td>{project.client?.name}</td>
                  <td>{project.location}</td>
                  <td>{project.status}</td>
                  <td>{money(project.budget)}</td>

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