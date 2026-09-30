import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function Contractors() {
  const [contractors, setContractors] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    name: "",
    type: "SUBCONTRACTOR",
    tradeType: "",
    phone: "",
    address: "",
    nicOrRegistrationNo: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    active: true,
  });

  useEffect(() => {
    loadContractors();
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
    }, 3000);
  };

  const loadContractors = async () => {
    try {
      const response = await api.get("/contractors");
      setContractors(response.data);
    } catch (error) {
      console.error("Error loading contractors:", error);
      showAlert("error", "Unable to load contractors.");
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
    if (!form.name.trim()) {
      showAlert("error", "Contractor name is required.");
      return false;
    }

    if (form.name.trim().length < 2) {
      showAlert(
        "error",
        "Contractor name must contain at least 2 characters."
      );
      return false;
    }

    if (!form.type) {
      showAlert("error", "Please select contractor type.");
      return false;
    }

    if (form.phone.trim()) {
      const phoneRegex = /^[0-9+\-\s]{7,15}$/;

      if (!phoneRegex.test(form.phone.trim())) {
        showAlert("error", "Please enter a valid phone number.");
        return false;
      }
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "SUBCONTRACTOR",
      tradeType: "",
      phone: "",
      address: "",
      nicOrRegistrationNo: "",
      bankName: "",
      bankAccountName: "",
      bankAccountNumber: "",
      active: true,
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const contractorData = {
      name: form.name.trim(),
      type: form.type,
      tradeType: form.tradeType.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      nicOrRegistrationNo: form.nicOrRegistrationNo.trim(),
      bankName: form.bankName.trim(),
      bankAccountName: form.bankAccountName.trim(),
      bankAccountNumber: form.bankAccountNumber.trim(),
      active: form.active,
    };

    try {
      if (editingId) {
        await api.put(`/contractors/${editingId}`, contractorData);

        showAlert(
          "success",
          "Contractor updated successfully."
        );
      } else {
        await api.post("/contractors", contractorData);

        showAlert(
          "success",
          "Contractor added successfully."
        );
      }

      resetForm();
      loadContractors();
    } catch (error) {
      console.error("Error saving contractor:", error);

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to save contractor. Please try again."
      );
    }
  };

  const handleEdit = (contractor) => {
    setEditingId(contractor.id);

    setForm({
      name: contractor.name || "",
      type: contractor.type || "SUBCONTRACTOR",
      tradeType: contractor.tradeType || "",
      phone: contractor.phone || "",
      address: contractor.address || "",
      nicOrRegistrationNo:
        contractor.nicOrRegistrationNo || "",
      bankName: contractor.bankName || "",
      bankAccountName:
        contractor.bankAccountName || "",
      bankAccountNumber:
        contractor.bankAccountNumber || "",
      active:
        contractor.active === undefined
          ? true
          : contractor.active,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contractor?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/contractors/${id}`);

      showAlert(
        "success",
        "Contractor deleted successfully."
      );

      loadContractors();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting contractor:", error);

      showAlert(
        "error",
        "Unable to delete this contractor. The contractor may be linked to bills or payments."
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Contractors & Subcontractors</h1>
          <p>
            Manage contractors, subcontractors and payment details
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
            ? "Edit Contractor"
            : "Add New Contractor"}
        </h2>

        <form
          className="client-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="name"
            placeholder="Contractor / Subcontractor Name *"
            value={form.name}
            onChange={handleChange}
            maxLength="120"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="SUBCONTRACTOR">
              Subcontractor
            </option>

            <option value="CONTRACTOR">
              Contractor
            </option>
          </select>

          <input
            type="text"
            name="tradeType"
            placeholder="Trade / Work Type"
            value={form.tradeType}
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
            type="text"
            name="nicOrRegistrationNo"
            placeholder="NIC / Registration No."
            value={form.nicOrRegistrationNo}
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

          <input
            type="text"
            name="bankName"
            placeholder="Bank Name"
            value={form.bankName}
            onChange={handleChange}
            maxLength="100"
          />

          <input
            type="text"
            name="bankAccountName"
            placeholder="Bank Account Name"
            value={form.bankAccountName}
            onChange={handleChange}
            maxLength="120"
          />

          <input
            type="text"
            name="bankAccountNumber"
            placeholder="Bank Account Number"
            value={form.bankAccountNumber}
            onChange={handleChange}
            maxLength="50"
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />

            Active
          </label>

          <button
            type="submit"
            className="primary-button"
          >
            {editingId
              ? "Update Contractor"
              : "Add Contractor"}
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
              <th>Type</th>
              <th>Trade</th>
              <th>Phone</th>
              <th>Bank</th>
              <th>Account No.</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {contractors.length === 0 ? (
              <tr>
                <td colSpan="9">
                  No contractors found.
                </td>
              </tr>
            ) : (
              contractors.map((contractor) => (
                <tr key={contractor.id}>
                  <td>{contractor.id}</td>

                  <td>{contractor.name}</td>

                  <td>{contractor.type}</td>

                  <td>
                    {contractor.tradeType || "-"}
                  </td>

                  <td>
                    {contractor.phone || "-"}
                  </td>

                  <td>
                    {contractor.bankName || "-"}
                  </td>

                  <td>
                    {contractor.bankAccountNumber || "-"}
                  </td>

                  <td>
                    {contractor.active
                      ? "Active"
                      : "Inactive"}
                  </td>

                  <td>
                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEdit(contractor)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(contractor.id)
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
    </div>
  );
}

export default Contractors;