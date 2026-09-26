import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function Users() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "USER",
    active: true,
  });

  useEffect(() => {
    loadUsers();
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

  const loadUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error loading users:", error);
      showAlert("error", "Unable to load users.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      showAlert("error", "Username is required.");
      return false;
    }

    if (!editingId && !form.password.trim()) {
      showAlert("error", "Password is required.");
      return false;
    }

    if (form.password && form.password.length < 6) {
      showAlert("error", "Password must be at least 6 characters.");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      username: "",
      password: "",
      role: "USER",
      active: true,
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userData = {
      username: form.username.trim(),
      password: form.password,
      role: form.role,
      active: form.active,
    };

    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, userData);
        showAlert("success", "User updated successfully.");
      } else {
        await api.post("/users", userData);
        showAlert("success", "User created successfully.");
      }

      resetForm();
      loadUsers();
    } catch (error) {
      console.error("Error saving user:", error);

      showAlert(
        "error",
        error.response?.data?.message || "Unable to save user."
      );
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);

    setForm({
      username: user.username || "",
      password: "",
      role: user.role || "USER",
      active: user.active ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/users/${id}`);
      showAlert("success", "User deleted successfully.");
      loadUsers();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showAlert("error", "Unable to delete user.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage system users</p>
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
        <h2>{editingId ? "Edit User" : "Create User"}</h2>

        <form className="user-form" onSubmit={handleSubmit}>
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
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
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

          <button type="submit" className="primary-button">
            {editingId ? "Update User" : "Create User"}
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
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>{user.active ? "Active" : "Inactive"}</td>

                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(user.id)}
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

export default Users;