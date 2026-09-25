import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function Clients() {
  const [clients, setClients] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
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

  const loadClients = async () => {
    try {
      const response = await api.get("/clients");
      setClients(response.data);
    } catch (error) {
      console.error("Error loading clients:", error);
      showAlert("error", "Unable to load clients.");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      showAlert("error", "Client name is required.");
      return false;
    }

    if (form.name.trim().length < 2) {
      showAlert("error", "Client name must contain at least 2 characters.");
      return false;
    }

    if (form.phone.trim()) {
      const phoneRegex = /^[0-9+\-\s]{7,15}$/;

      if (!phoneRegex.test(form.phone.trim())) {
        showAlert("error", "Please enter a valid phone number.");
        return false;
      }
    }

    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(form.email.trim())) {
        showAlert("error", "Please enter a valid email address.");
        return false;
      }
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const clientData = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    };

    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, clientData);
        showAlert("success", "Client updated successfully.");
      } else {
        await api.post("/clients", clientData);
        showAlert("success", "Client added successfully.");
      }

      resetForm();
      loadClients();
    } catch (error) {
      console.error("Error saving client:", error);
      showAlert("error", "Unable to save client. Please try again.");
    }
  };

  const handleEdit = (client) => {
    setEditingId(client.id);

    setForm({
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/clients/${id}`);

      showAlert("success", "Client deleted successfully.");
      loadClients();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting client:", error);

      showAlert(
        "error",
        "Unable to delete this client. The client may be linked to a project."
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>Manage construction project clients</p>
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
        <h2>{editingId ? "Edit Client" : "Add New Client"}</h2>

        <form className="client-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Client Name *"
            value={form.name}
            onChange={handleChange}
            maxLength="100"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            maxLength="15"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            maxLength="100"
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            maxLength="200"
          />

          <button type="submit" className="primary-button">
            {editingId ? "Update Client" : "Add Client"}
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
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan="6">No clients found.</td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.name}</td>
                  <td>{client.phone || "-"}</td>
                  <td>{client.email || "-"}</td>
                  <td>{client.address || "-"}</td>

                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(client)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(client.id)}
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

export default Clients;