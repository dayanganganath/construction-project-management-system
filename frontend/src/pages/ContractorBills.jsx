import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function ContractorBills() {
  const [projects, setProjects] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [bills, setBills] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    billNumber: "",
    billDate: "",
    periodFrom: "",
    periodTo: "",
    workDescription: "",
    grossAmount: "",
    retention: "",
    advanceRecovery: "",
    otherDeductions: "",
    projectId: "",
    contractorId: "",
  });

  useEffect(() => {
    loadProjects();
    loadContractors();
    loadBills();
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

  const loadProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error loading projects:", error);
      showAlert("error", "Unable to load projects.");
    }
  };

  const loadContractors = async () => {
    try {
      const response = await api.get("/contractors");

      const activeContractors = response.data.filter(
        (contractor) => contractor.active !== false
      );

      setContractors(activeContractors);
    } catch (error) {
      console.error("Error loading contractors:", error);
      showAlert("error", "Unable to load contractors.");
    }
  };

  const loadBills = async () => {
    try {
      const response = await api.get("/contractor-bills");
      setBills(response.data);
    } catch (error) {
      console.error("Error loading contractor bills:", error);
      showAlert("error", "Unable to load contractor bills.");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const parseAmount = (value) => {
    const number = Number(value || 0);

    if (Number.isNaN(number)) {
      return 0;
    }

    return number;
  };

  const calculatedNetPayable = useMemo(() => {
    const gross = parseAmount(form.grossAmount);
    const retention = parseAmount(form.retention);
    const advance = parseAmount(form.advanceRecovery);
    const other = parseAmount(form.otherDeductions);

    return gross - retention - advance - other;
  }, [
    form.grossAmount,
    form.retention,
    form.advanceRecovery,
    form.otherDeductions,
  ]);

  const validateForm = () => {
    if (!form.billNumber.trim()) {
      showAlert("error", "Bill number is required.");
      return false;
    }

    if (!form.billDate) {
      showAlert("error", "Bill date is required.");
      return false;
    }

    if (!form.projectId) {
      showAlert("error", "Please select a project.");
      return false;
    }

    if (!form.contractorId) {
      showAlert("error", "Please select a contractor.");
      return false;
    }

    if (!form.grossAmount) {
      showAlert("error", "Gross amount is required.");
      return false;
    }

    if (parseAmount(form.grossAmount) <= 0) {
      showAlert("error", "Gross amount must be greater than zero.");
      return false;
    }

    if (calculatedNetPayable < 0) {
      showAlert(
        "error",
        "Deductions cannot be greater than the gross amount."
      );

      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      billNumber: "",
      billDate: "",
      periodFrom: "",
      periodTo: "",
      workDescription: "",
      grossAmount: "",
      retention: "",
      advanceRecovery: "",
      otherDeductions: "",
      projectId: "",
      contractorId: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const billData = {
      billNumber: form.billNumber.trim(),
      billDate: form.billDate,
      periodFrom: form.periodFrom || null,
      periodTo: form.periodTo || null,
      workDescription: form.workDescription.trim(),

      grossAmount: parseAmount(form.grossAmount),
      retention: parseAmount(form.retention),
      advanceRecovery: parseAmount(form.advanceRecovery),
      otherDeductions: parseAmount(form.otherDeductions),

      project: {
        id: Number(form.projectId),
      },

      contractor: {
        id: Number(form.contractorId),
      },
    };

    try {
      if (editingId) {
        await api.put(`/contractor-bills/${editingId}`, billData);

        showAlert(
          "success",
          "Contractor bill updated successfully."
        );
      } else {
        await api.post("/contractor-bills", billData);

        showAlert(
          "success",
          "Contractor bill added successfully."
        );
      }

      resetForm();
      loadBills();
    } catch (error) {
      console.error("Error saving contractor bill:", error);

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to save contractor bill."
      );
    }
  };

  const handleEdit = (bill) => {
    setEditingId(bill.id);

    setForm({
      billNumber: bill.billNumber || "",
      billDate: bill.billDate || "",
      periodFrom: bill.periodFrom || "",
      periodTo: bill.periodTo || "",
      workDescription: bill.workDescription || "",

      grossAmount:
        bill.grossAmount !== null &&
        bill.grossAmount !== undefined
          ? String(bill.grossAmount)
          : "",

      retention:
        bill.retention !== null &&
        bill.retention !== undefined
          ? String(bill.retention)
          : "",

      advanceRecovery:
        bill.advanceRecovery !== null &&
        bill.advanceRecovery !== undefined
          ? String(bill.advanceRecovery)
          : "",

      otherDeductions:
        bill.otherDeductions !== null &&
        bill.otherDeductions !== undefined
          ? String(bill.otherDeductions)
          : "",

      projectId:
        bill.project?.id !== undefined
          ? String(bill.project.id)
          : "",

      contractorId:
        bill.contractor?.id !== undefined
          ? String(bill.contractor.id)
          : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contractor bill?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/contractor-bills/${id}`);

      showAlert(
        "success",
        "Contractor bill deleted successfully."
      );

      loadBills();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting contractor bill:", error);

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to delete this contractor bill."
      );
    }
  };

  const formatAmount = (amount) => {
    const value = Number(amount || 0);

    return value.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Contractor Bills</h1>
          <p>
            Manage site-wise contractor and subcontractor bills,
            deductions, paid amounts and balances.
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
            ? "Edit Contractor Bill"
            : "Add Contractor Bill"}
        </h2>

        <form
          className="client-form"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="billNumber"
            placeholder="Bill Number *"
            value={form.billNumber}
            onChange={handleChange}
          />

          <input
            type="date"
            name="billDate"
            value={form.billDate}
            onChange={handleChange}
          />

          <input
            type="date"
            name="periodFrom"
            value={form.periodFrom}
            onChange={handleChange}
          />

          <input
            type="date"
            name="periodTo"
            value={form.periodTo}
            onChange={handleChange}
          />

          <select
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
          >
            <option value="">
              Select Project / Site *
            </option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.projectName}
                {project.location
                  ? ` - ${project.location}`
                  : ""}
              </option>
            ))}
          </select>

          <select
            name="contractorId"
            value={form.contractorId}
            onChange={handleChange}
          >
            <option value="">
              Select Contractor / Subcontractor *
            </option>

            {contractors.map((contractor) => (
              <option
                key={contractor.id}
                value={contractor.id}
              >
                {contractor.name}
                {contractor.tradeType
                  ? ` - ${contractor.tradeType}`
                  : ""}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="workDescription"
            placeholder="Work Description"
            value={form.workDescription}
            onChange={handleChange}
          />

          <input
            type="number"
            name="grossAmount"
            placeholder="Gross Amount *"
            value={form.grossAmount}
            onChange={handleChange}
            min="0"
            step="0.01"
          />

          <input
            type="number"
            name="retention"
            placeholder="Retention"
            value={form.retention}
            onChange={handleChange}
            min="0"
            step="0.01"
          />

          <input
            type="number"
            name="advanceRecovery"
            placeholder="Advance Recovery"
            value={form.advanceRecovery}
            onChange={handleChange}
            min="0"
            step="0.01"
          />

          <input
            type="number"
            name="otherDeductions"
            placeholder="Other Deductions"
            value={form.otherDeductions}
            onChange={handleChange}
            min="0"
            step="0.01"
          />

          <div>
            <label>Net Payable</label>

            <input
              type="text"
              value={`Rs. ${formatAmount(
                calculatedNetPayable
              )}`}
              readOnly
            />
          </div>

          <button
            type="submit"
            className="primary-button"
          >
            {editingId
              ? "Update Bill"
              : "Add Bill"}
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
        <h2>Contractor Bill Register</h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>Bill No.</th>
              <th>Date</th>
              <th>Project / Site</th>
              <th>Contractor</th>
              <th>Work</th>
              <th>Gross</th>
              <th>Retention</th>
              <th>Advance Recovery</th>
              <th>Other Deductions</th>
              <th>Net Payable</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {bills.length === 0 ? (
              <tr>
                <td colSpan="14">
                  No contractor bills found.
                </td>
              </tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill.id}>
                  <td>
                    {bill.billNumber || "-"}
                  </td>

                  <td>
                    {bill.billDate || "-"}
                  </td>

                  <td>
                    <strong>
                      {bill.project?.projectName ||
                        "-"}
                    </strong>

                    {bill.project?.location && (
                      <div>
                        {bill.project.location}
                      </div>
                    )}
                  </td>

                  <td>
                    {bill.contractor?.name ||
                      "-"}
                  </td>

                  <td>
                    {bill.workDescription ||
                      "-"}
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      bill.grossAmount
                    )}
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      bill.retention
                    )}
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      bill.advanceRecovery
                    )}
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      bill.otherDeductions
                    )}
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      bill.netPayable
                    )}
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      bill.paidAmount
                    )}
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      bill.balanceAmount
                    )}
                  </td>

                  <td>
                    {bill.status || "-"}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        handleEdit(bill)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(
                          bill.id
                        )
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

export default ContractorBills;