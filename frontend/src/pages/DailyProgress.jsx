import { useEffect, useState } from "react";
import api from "../services/api";

function DailyProgress() {
  const [progressList, setProgressList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    date: "",
    workDescription: "",
    progressPercentage: "",
    workersCount: "",
    remarks: "",
    projectId: "",
  });

  useEffect(() => {
    loadProgress();
    loadProjects();
  }, []);

  const loadProgress = async () => {
    try {
      const response = await api.get("/progress");
      setProgressList(response.data);
    } catch (error) {
      console.error("Error loading progress:", error);
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
      date: "",
      workDescription: "",
      progressPercentage: "",
      workersCount: "",
      remarks: "",
      projectId: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const progressData = {
      date: form.date,
      workDescription: form.workDescription,
      progressPercentage: Number(form.progressPercentage),
      workersCount: Number(form.workersCount),
      remarks: form.remarks,
      project: {
        id: Number(form.projectId),
      },
    };

    try {
      if (editingId) {
        await api.put(`/progress/${editingId}`, progressData);
      } else {
        await api.post("/progress", progressData);
      }

      resetForm();
      loadProgress();
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleEdit = (progress) => {
    setEditingId(progress.id);

    setForm({
      date: progress.date || "",
      workDescription: progress.workDescription || "",
      progressPercentage: progress.progressPercentage || "",
      workersCount: progress.workersCount || "",
      remarks: progress.remarks || "",
      projectId: progress.project?.id || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this progress record?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/progress/${id}`);
      loadProgress();
    } catch (error) {
      console.error("Error deleting progress:", error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Daily Progress</h1>
          <p>Track daily site progress for each project</p>
        </div>
      </div>

      <div className="form-card">
        <h2>{editingId ? "Edit Progress" : "Add Daily Progress"}</h2>

        <form className="progress-form" onSubmit={handleSubmit}>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="workDescription"
            placeholder="Work Description"
            value={form.workDescription}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="progressPercentage"
            placeholder="Progress %"
            min="0"
            max="100"
            value={form.progressPercentage}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="workersCount"
            placeholder="Workers Count"
            min="0"
            value={form.workersCount}
            onChange={handleChange}
          />

          <input
            type="text"
            name="remarks"
            placeholder="Remarks"
            value={form.remarks}
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
            {editingId ? "Update Progress" : "Add Progress"}
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
              <th>Date</th>
              <th>Project</th>
              <th>Work Description</th>
              <th>Progress</th>
              <th>Workers</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {progressList.length === 0 ? (
              <tr>
                <td colSpan="8">No progress records found.</td>
              </tr>
            ) : (
              progressList.map((progress) => (
                <tr key={progress.id}>
                  <td>{progress.id}</td>
                  <td>{progress.date}</td>
                  <td>{progress.project?.projectName}</td>
                  <td>{progress.workDescription}</td>
                  <td>{progress.progressPercentage}%</td>
                  <td>{progress.workersCount}</td>
                  <td>{progress.remarks || "-"}</td>

                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(progress)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(progress.id)}
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

export default DailyProgress;