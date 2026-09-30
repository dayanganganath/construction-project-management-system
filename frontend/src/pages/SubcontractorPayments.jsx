import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function SubcontractorPayments() {
  const [projects, setProjects] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [payments, setPayments] = useState([]);

  const [selectedSlip, setSelectedSlip] = useState(null);
  const [uploadingPaymentId, setUploadingPaymentId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    projectId: "",
    contractorId: "",
    amount: "",
    paymentDate: "",
    paymentMethod: "BANK_TRANSFER",
    referenceNumber: "",
    notes: "",
  });

  useEffect(() => {
    loadProjects();
    loadContractors();
    loadPayments();
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

      const subcontractors = response.data.filter(
        (item) =>
          item.type === "SUBCONTRACTOR" &&
          item.active !== false
      );

      setContractors(subcontractors);
    } catch (error) {
      console.error("Error loading contractors:", error);
      showAlert("error", "Unable to load subcontractors.");
    }
  };

  const loadPayments = async () => {
    try {
      const response = await api.get(
        "/subcontractor-payments"
      );

      setPayments(response.data);
    } catch (error) {
      console.error("Error loading payments:", error);
      showAlert(
        "error",
        "Unable to load subcontractor payments."
      );
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

    if (!form.contractorId) {
      showAlert(
        "error",
        "Please select a subcontractor."
      );
      return false;
    }

    if (!form.amount) {
      showAlert("error", "Payment amount is required.");
      return false;
    }

    const amount = Number(form.amount);

    if (Number.isNaN(amount) || amount <= 0) {
      showAlert(
        "error",
        "Payment amount must be greater than zero."
      );
      return false;
    }

    if (!form.paymentDate) {
      showAlert("error", "Payment date is required.");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      projectId: "",
      contractorId: "",
      amount: "",
      paymentDate: "",
      paymentMethod: "BANK_TRANSFER",
      referenceNumber: "",
      notes: "",
    });

    setSelectedSlip(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentData = {
      amount: Number(form.amount),
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      referenceNumber:
        form.referenceNumber.trim(),
      notes: form.notes.trim(),

      project: {
        id: Number(form.projectId),
      },

      contractor: {
        id: Number(form.contractorId),
      },
    };

    try {
      const response = await api.post(
        "/subcontractor-payments",
        paymentData
      );

      const createdPayment = response.data;

      if (selectedSlip) {
        await uploadSlip(
          createdPayment.id,
          selectedSlip,
          false
        );
      }

      showAlert(
        "success",
        selectedSlip
          ? "Payment and payment slip saved successfully."
          : "Payment saved successfully."
      );

      resetForm();
      loadPayments();
    } catch (error) {
      console.error("Error saving payment:", error);

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to save payment."
      );
    }
  };

  const uploadSlip = async (
    paymentId,
    file,
    showSuccess = true
  ) => {
    if (!file) {
      showAlert(
        "error",
        "Please select a PDF or image file."
      );
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      file.type &&
      !allowedTypes.includes(file.type)
    ) {
      showAlert(
        "error",
        "Only PDF, JPG, PNG or WEBP files are allowed."
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingPaymentId(paymentId);

      await api.post(
        `/subcontractor-payments/${paymentId}/upload-slip`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (showSuccess) {
        showAlert(
          "success",
          "Payment slip uploaded successfully."
        );
      }

      loadPayments();
    } catch (error) {
      console.error(
        "Error uploading payment slip:",
        error
      );

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to upload payment slip."
      );

      throw error;
    } finally {
      setUploadingPaymentId(null);
    }
  };

  const handleExistingSlipUpload = async (
    paymentId,
    e
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      await uploadSlip(paymentId, file, true);
    } catch {
      // Alert is already shown inside uploadSlip
    }

    e.target.value = "";
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/subcontractor-payments/${id}`
      );

      showAlert(
        "success",
        "Payment deleted successfully."
      );

      loadPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);

      showAlert(
        "error",
        "Unable to delete this payment."
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
          <h1>Subcontractor Payments</h1>
          <p>
            Record subcontractor payments and upload
            payment slips
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
        <h2>Add Subcontractor Payment</h2>

        <form
          className="client-form"
          onSubmit={handleSubmit}
        >
          <select
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
          >
            <option value="">
              Select Project *
            </option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.projectName}
              </option>
            ))}
          </select>

          <select
            name="contractorId"
            value={form.contractorId}
            onChange={handleChange}
          >
            <option value="">
              Select Subcontractor *
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
            type="number"
            name="amount"
            placeholder="Payment Amount *"
            value={form.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
          />

          <input
            type="date"
            name="paymentDate"
            value={form.paymentDate}
            onChange={handleChange}
          />

          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="BANK_TRANSFER">
              Bank Transfer
            </option>

            <option value="CASH">
              Cash
            </option>

            <option value="CHEQUE">
              Cheque
            </option>

            <option value="ONLINE_TRANSFER">
              Online Transfer
            </option>

            <option value="OTHER">
              Other
            </option>
          </select>

          <input
            type="text"
            name="referenceNumber"
            placeholder="Reference Number"
            value={form.referenceNumber}
            onChange={handleChange}
            maxLength="100"
          />

          <input
            type="text"
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
            maxLength="250"
          />

          <div>
            <label>
              Payment Slip
            </label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) =>
                setSelectedSlip(
                  e.target.files?.[0] || null
                )
              }
            />
          </div>

          <button
            type="submit"
            className="primary-button"
          >
            Save Payment
          </button>
        </form>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Project</th>
              <th>Subcontractor</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Slip</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="9">
                  No subcontractor payments found.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>

                  <td>
                    {payment.paymentDate || "-"}
                  </td>

                  <td>
                    {payment.project?.projectName ||
                      "-"}
                  </td>

                  <td>
                    {payment.contractor?.name || "-"}
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(payment.amount)}
                  </td>

                  <td>
                    {payment.paymentMethod || "-"}
                  </td>

                  <td>
                    {payment.referenceNumber || "-"}
                  </td>

                  <td>
                    {payment.slipFileName ? (
                      <span>
                        {payment.slipFileName}
                      </span>
                    ) : (
                      <span>No slip</span>
                    )}
                  </td>

                  <td>
                    <label
                      className="edit-button"
                      style={{
                        display: "inline-block",
                        cursor: "pointer",
                      }}
                    >
                      {uploadingPaymentId ===
                      payment.id
                        ? "Uploading..."
                        : payment.slipFileName
                        ? "Replace Slip"
                        : "Upload Slip"}

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        style={{
                          display: "none",
                        }}
                        disabled={
                          uploadingPaymentId ===
                          payment.id
                        }
                        onChange={(e) =>
                          handleExistingSlipUpload(
                            payment.id,
                            e
                          )
                        }
                      />
                    </label>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(payment.id)
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

export default SubcontractorPayments;