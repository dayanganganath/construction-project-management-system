import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function DailyProgress() {
  const [progressList, setProgressList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

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

  const showAlert = (type, message) => {
    setAlert({ type, message });

    setTimeout(() => {
      setAlert({
        type: "",
        message: "",
      });
    }, 3000);
  };

  const loadProgress = async () => {
    try {
      const response = await api.get("/progress");
      setProgressList(response.data);
    } catch (error) {
      console.error("Error loading progress:", error);
      showAlert("error", "Unable to load daily progress records.");
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

    if (!form.date) {
      showAlert("error", "Progress date is required.");
      return false;
    }

    if (!form.workDescription.trim()) {
      showAlert("error", "Work description is required.");
      return false;
    }

    if (
      form.progressPercentage === "" ||
      Number(form.progressPercentage) < 0 ||
      Number(form.progressPercentage) > 100
    ) {
      showAlert("error", "Progress percentage must be between 0 and 100.");
      return false;
    }

    if (
      form.workersCount !== "" &&
      Number(form.workersCount) < 0
    ) {
      showAlert("error", "Workers count cannot be negative.");
      return false;
    }

    return true;
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

    if (!validateForm()) {
      return;
    }

    const progressData = {
      date: form.date,
      workDescription: form.workDescription.trim(),
      progressPercentage: Number(form.progressPercentage),
      workersCount:
        form.workersCount === "" ? 0 : Number(form.workersCount),
      remarks: form.remarks.trim(),
      project: {
        id: Number(form.projectId),
      },
    };

    try {
      if (editingId) {
        await api.put(`/progress/${editingId}`, progressData);
        showAlert("success", "Daily progress updated successfully.");
      } else {
        await api.post("/progress", progressData);
        showAlert("success", "Daily progress added successfully.");
      }

      resetForm();
      loadProgress();
    } catch (error) {
      console.error("Error saving progress:", error);
      showAlert("error", "Unable to save daily progress. Please try again.");
    }
  };

  const handleEdit = (progress) => {
    setEditingId(progress.id);

    setForm({
      date: progress.date || "",
      workDescription: progress.workDescription || "",
      progressPercentage: progress.progressPercentage ?? "",
      workersCount: progress.workersCount ?? "",
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
      showAlert("success", "Daily progress deleted successfully.");
      loadProgress();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting progress:", error);
      showAlert("error", "Unable to delete daily progress.");
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
        <h2>{editingId ? "Edit Progress" : "Add Daily Progress"}</h2>

        <form className="progress-form" onSubmit={handleSubmit}>
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
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />

          <input
            type="text"
            name="workDescription"
            placeholder="Work Description *"
            value={form.workDescription}
            onChange={handleChange}
            maxLength="250"
          />

          <input
            type="number"
            name="progressPercentage"
            placeholder="Progress % *"
            min="0"
            max="100"
            value={form.progressPercentage}
            onChange={handleChange}
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
            maxLength="250"
          />

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
                  <td>{progress.date || "-"}</td>
                  <td>{progress.project?.projectName || "-"}</td>
                  <td>{progress.workDescription}</td>
                  <td>{progress.progressPercentage}%</td>
                  <td>{progress.workersCount ?? 0}</td>
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