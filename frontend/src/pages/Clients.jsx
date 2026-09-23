import { useEffect, useState } from "react";
import api from "../services/api";

function Clients() {
  const [clients, setClients] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, form);
        setEditingId(null);
      } else {
        await api.post("/clients", form);
      }

      setForm({
        name: "",
        phone: "",
        email: "",
        address: "",
      });

      loadClients();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleEdit = (client) => {
    setForm({
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
    });

    setEditingId(client.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/clients/${id}`);
      loadClients();
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);

    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>Manage project clients</p>
        </div>
      </div>

      <div className="form-card">
        <h2>{editingId ? "Edit Client" : "Add Client"}</h2>

        <form className="client-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Client Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />

          <button type="submit" className="primary-button">
            {editingId ? "Update Client" : "Add Client"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancelEdit}
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
                  <td>{client.phone}</td>
                  <td>{client.email}</td>
                  <td>{client.address}</td>

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