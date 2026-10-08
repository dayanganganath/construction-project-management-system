import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function Users() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [assignments, setAssignments] = useState([]);

  const [loadingAssignments, setLoadingAssignments] =
    useState(false);

  const [assigning, setAssigning] = useState(false);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "CLIENT",
    active: true,
  });

  useEffect(() => {
    loadUsers();
    loadProjects();
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

  const loadUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error loading users:", error);

      showAlert(
        "error",
        "Unable to load users."
      );
    }
  };

  const loadProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error loading projects:", error);

      showAlert(
        "error",
        "Unable to load projects."
      );
    }
  };

  const loadAssignments = async (userId) => {
    if (!userId) {
      setAssignments([]);
      return;
    }

    try {
      setLoadingAssignments(true);

      const response = await api.get(
        `/user-project-assignments/user/${userId}`
      );

      setAssignments(response.data);
    } catch (error) {
      console.error(
        "Error loading assignments:",
        error
      );

      setAssignments([]);

      showAlert(
        "error",
        "Unable to load project assignments."
      );
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      showAlert(
        "error",
        "Username is required."
      );

      return false;
    }

    if (
      !editingId &&
      !form.password.trim()
    ) {
      showAlert(
        "error",
        "Password is required."
      );

      return false;
    }

    if (
      form.password &&
      form.password.length < 6
    ) {
      showAlert(
        "error",
        "Password must be at least 6 characters."
      );

      return false;
    }

    if (!form.role) {
      showAlert(
        "error",
        "User role is required."
      );

      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      username: "",
      password: "",
      role: "CLIENT",
      active: true,
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userData = {
      username: form.username.trim(),
      password: form.password,
      role: form.role,
      active: form.active,
    };

    try {
      if (editingId) {
        await api.put(
          `/users/${editingId}`,
          userData
        );

        showAlert(
          "success",
          "User updated successfully."
        );
      } else {
        await api.post(
          "/users",
          userData
        );

        showAlert(
          "success",
          "User created successfully."
        );
      }

      resetForm();
      await loadUsers();
    } catch (error) {
      console.error(
        "Error saving user:",
        error
      );

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to save user."
      );
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);

    setForm({
      username: user.username || "",
      password: "",
      role: user.role || "CLIENT",
      active: user.active ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this user?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);

      if (
        String(selectedUserId) ===
        String(id)
      ) {
        setSelectedUserId("");
        setSelectedProjectId("");
        setAssignments([]);
      }

      if (
        String(editingId) ===
        String(id)
      ) {
        resetForm();
      }

      showAlert(
        "success",
        "User deleted successfully."
      );

      await loadUsers();
    } catch (error) {
      console.error(
        "Error deleting user:",
        error
      );

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to delete user."
      );
    }
  };

  const handleAssignmentUserChange =
    async (e) => {
      const userId = e.target.value;

      setSelectedUserId(userId);
      setSelectedProjectId("");

      await loadAssignments(userId);
    };

  const handleAssignProject = async () => {
    if (!selectedUserId) {
      showAlert(
        "error",
        "Please select a user."
      );

      return;
    }

    if (!selectedProjectId) {
      showAlert(
        "error",
        "Please select a project."
      );

      return;
    }

    try {
      setAssigning(true);

      await api.post(
        "/user-project-assignments",
        null,
        {
          params: {
            userId: selectedUserId,
            projectId: selectedProjectId,
          },
        }
      );

      showAlert(
        "success",
        "Project assigned successfully."
      );

      setSelectedProjectId("");

      await loadAssignments(
        selectedUserId
      );
    } catch (error) {
      console.error(
        "Error assigning project:",
        error
      );

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to assign project."
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignProject =
    async (projectId) => {
      const confirmed =
        window.confirm(
          "Remove this project from the selected user?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await api.delete(
          "/user-project-assignments",
          {
            params: {
              userId: selectedUserId,
              projectId: projectId,
            },
          }
        );

        showAlert(
          "success",
          "Project assignment removed."
        );

        await loadAssignments(
          selectedUserId
        );
      } catch (error) {
        console.error(
          "Error removing assignment:",
          error
        );

        showAlert(
          "error",
          error.response?.data?.message ||
            "Unable to remove project assignment."
        );
      }
    };

  const selectedUser =
    users.find(
      (user) =>
        String(user.id) ===
        String(selectedUserId)
    ) || null;

  const assignedProjectIds =
    assignments.map((assignment) =>
      String(assignment.projectId)
    );

  const availableProjects =
    projects.filter(
      (project) =>
        !assignedProjectIds.includes(
          String(project.id)
        )
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Users & Project Access
          </h1>

          <p>
            Manage system users,
            roles and project assignments.
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
          {editingId
            ? "Edit User"
            : "Create User"}
        </h2>

        <form
          className="user-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="username"
            placeholder="Username *"
            value={form.username}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder={
              editingId
                ? "New Password (leave blank to keep current)"
                : "Password *"
            }
            value={form.password}
            onChange={handleChange}
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="ADMIN">
              Admin
            </option>

            <option value="MANAGER">
              Manager
            </option>

            <option value="SUPERVISOR">
              Supervisor
            </option>

            <option value="CLIENT">
              Client
            </option>

            <option value="SUBCONTRACTOR">
              Subcontractor
            </option>
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />

            Active User
          </label>

          <button
            type="submit"
            className="primary-button"
          >
            {editingId
              ? "Update User"
              : "Create User"}
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
        <h2>System Users</h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.id}
                  </td>

                  <td>
                    {user.username}
                  </td>

                  <td>
                    {user.role}
                  </td>

                  <td>
                    {user.active
                      ? "Active"
                      : "Inactive"}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        handleEdit(user)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(user.id)
                      }
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

      <div className="form-card">
        <h2>
          Project Assignment
        </h2>

        <p>
          Assign projects/sites to
          Clients, Supervisors and
          Subcontractors.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <select
            value={selectedUserId}
            onChange={
              handleAssignmentUserChange
            }
          >
            <option value="">
              Select User
            </option>

            {users
              .filter(
                (user) =>
                  user.active !== false
              )
              .map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.username}
                  {" - "}
                  {user.role}
                </option>
              ))}
          </select>

          <select
            value={selectedProjectId}
            onChange={(e) =>
              setSelectedProjectId(
                e.target.value
              )
            }
            disabled={!selectedUserId}
          >
            <option value="">
              Select Project / Site
            </option>

            {availableProjects.map(
              (project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.projectName}

                  {project.location
                    ? ` - ${project.location}`
                    : ""}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            className="primary-button"
            onClick={
              handleAssignProject
            }
            disabled={
              !selectedUserId ||
              !selectedProjectId ||
              assigning
            }
          >
            {assigning
              ? "Assigning..."
              : "Assign Project"}
          </button>
        </div>

        {selectedUser && (
          <div
            style={{
              marginTop: "20px",
            }}
          >
            <strong>
              Selected User:
            </strong>{" "}
            {selectedUser.username}{" "}
            ({selectedUser.role})
          </div>
        )}
      </div>

      {selectedUserId && (
        <div className="table-card">
          <h2>
            Assigned Projects
          </h2>

          {loadingAssignments ? (
            <p>
              Loading assigned
              projects...
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    Project
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {assignments.length ===
                0 ? (
                  <tr>
                    <td colSpan="4">
                      No projects
                      assigned to
                      this user.
                    </td>
                  </tr>
                ) : (
                  assignments.map(
                    (assignment) => (
                      <tr
                        key={
                          assignment.assignmentId
                        }
                      >
                        <td>
                          {assignment.projectName ||
                            "-"}
                        </td>

                        <td>
                          {assignment.location ||
                            "-"}
                        </td>

                        <td>
                          {assignment.status ||
                            "-"}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleUnassignProject(
                                assignment.projectId
                              )
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Users;