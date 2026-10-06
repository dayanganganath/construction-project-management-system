import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function SubcontractorPayments() {
  const [projects, setProjects] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);

  const [selectedSlip, setSelectedSlip] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingBills, setLoadingBills] = useState(false);

  const [analysis, setAnalysis] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    projectId: "",
    contractorId: "",
    contractorBillId: "",
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

  /*
   * Project or subcontractor changes:
   * reload related bills.
   */
  useEffect(() => {
    if (form.projectId && form.contractorId) {
      loadBills(
        form.projectId,
        form.contractorId
      );
    } else {
      setBills([]);

      setForm((previous) => ({
        ...previous,
        contractorBillId: "",
      }));
    }
  }, [form.projectId, form.contractorId]);

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

  const loadProjects = async () => {
    try {
      const response = await api.get("/projects");

      setProjects(response.data);
    } catch (error) {
      console.error(
        "Error loading projects:",
        error
      );

      showAlert(
        "error",
        "Unable to load projects."
      );
    }
  };

  const loadContractors = async () => {
    try {
      const response = await api.get("/contractors");

      const subcontractors = response.data.filter(
        (contractor) =>
          contractor.type === "SUBCONTRACTOR" &&
          contractor.active !== false
      );

      setContractors(subcontractors);
    } catch (error) {
      console.error(
        "Error loading contractors:",
        error
      );

      showAlert(
        "error",
        "Unable to load subcontractors."
      );
    }
  };

  const loadPayments = async () => {
    try {
      const response = await api.get(
        "/subcontractor-payments"
      );

      setPayments(response.data);
    } catch (error) {
      console.error(
        "Error loading payments:",
        error
      );

      showAlert(
        "error",
        "Unable to load subcontractor payments."
      );
    }
  };

  const loadBills = async (
    projectId,
    contractorId
  ) => {
    try {
      setLoadingBills(true);

      const response = await api.get(
        `/contractor-bills/contractor/${contractorId}`
      );

      /*
       * Contractor endpoint may return bills
       * from several projects.
       *
       * Keep only bills for selected project.
       * Also hide fully paid bills.
       */
      const filteredBills = response.data.filter(
        (bill) =>
          String(bill.project?.id) ===
            String(projectId) &&
          bill.status !== "PAID"
      );

      setBills(filteredBills);

      /*
       * If currently selected bill is no longer
       * available, clear it.
       */
      setForm((previous) => {
        const selectedStillExists =
          filteredBills.some(
            (bill) =>
              String(bill.id) ===
              String(previous.contractorBillId)
          );

        return {
          ...previous,

          contractorBillId:
            selectedStillExists
              ? previous.contractorBillId
              : "",
        };
      });
    } catch (error) {
      console.error(
        "Error loading contractor bills:",
        error
      );

      setBills([]);

      showAlert(
        "error",
        "Unable to load contractor bills."
      );
    } finally {
      setLoadingBills(false);
    }
  };

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    /*
     * Changing project or contractor should
     * clear old bill selection.
     */
    if (
      name === "projectId" ||
      name === "contractorId"
    ) {
      setForm({
        ...form,
        [name]: value,
        contractorBillId: "",
      });

      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSlipChange = (e) => {
    const file =
      e.target.files?.[0] || null;

    setSelectedSlip(file);
    setAnalysis(null);

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      showAlert(
        "error",
        "Automatic analysis currently supports PDF files only."
      );

      setSelectedSlip(null);
      e.target.value = "";
    }
  };

  const analyzeSlip = async () => {
    if (!selectedSlip) {
      showAlert(
        "error",
        "Please select a payment slip PDF first."
      );

      return;
    }

    const formData = new FormData();

    formData.append(
      "file",
      selectedSlip
    );

    try {
      setAnalyzing(true);
      setAnalysis(null);

      const response = await api.post(
        "/subcontractor-payments/analyze-upload",
        formData
      );

      const extractedData =
        response.data.extractedData || {};

      const contractorMatch =
        response.data.contractorMatch || {};

      setAnalysis({
        fileName:
          response.data.fileName,

        extractedData,

        contractorMatch,
      });

      setForm((previousForm) => ({
        ...previousForm,

        amount:
          extractedData.amount != null
            ? String(extractedData.amount)
            : previousForm.amount,

        paymentDate:
          extractedData.date ||
          previousForm.paymentDate,

        referenceNumber:
          extractedData.referenceNumber ||
          previousForm.referenceNumber,

        contractorId:
          contractorMatch.contractor?.id
            ? String(
                contractorMatch.contractor.id
              )
            : previousForm.contractorId,

        contractorBillId: "",
      }));

      await loadContractors();

      if (contractorMatch.matched) {
        showAlert(
          "success",
          `Slip analyzed. Subcontractor detected: ${
            contractorMatch.contractor?.name ||
            ""
          }`
        );
      } else {
        showAlert(
          "error",
          "Subcontractor was not detected. Payment has been assigned to Other / Unmatched. You can select the correct subcontractor manually."
        );
      }
    } catch (error) {
      console.error(
        "Error analyzing slip:",
        error
      );

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to analyze payment slip."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedBill =
    bills.find(
      (bill) =>
        String(bill.id) ===
        String(form.contractorBillId)
    ) || null;

  const validateForm = () => {
    if (!selectedSlip) {
      showAlert(
        "error",
        "Please upload the payment slip first."
      );

      return false;
    }

    if (!form.projectId) {
      showAlert(
        "error",
        "Please select the project / site."
      );

      return false;
    }

    if (!form.contractorId) {
      showAlert(
        "error",
        "Please select the subcontractor."
      );

      return false;
    }

    if (!form.amount) {
      showAlert(
        "error",
        "Payment amount is required."
      );

      return false;
    }

    const amount =
      Number(form.amount);

    if (
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      showAlert(
        "error",
        "Payment amount must be greater than zero."
      );

      return false;
    }

    if (!form.paymentDate) {
      showAlert(
        "error",
        "Payment date is required."
      );

      return false;
    }

    /*
     * Avoid accidental bill overpayment.
     */
    if (
      selectedBill &&
      Number(form.amount) >
        Number(
          selectedBill.balanceAmount || 0
        )
    ) {
      showAlert(
        "error",
        `Payment amount cannot exceed the selected bill balance of Rs. ${formatAmount(
          selectedBill.balanceAmount
        )}.`
      );

      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      projectId: "",
      contractorId: "",
      contractorBillId: "",
      amount: "",
      paymentDate: "",
      paymentMethod: "BANK_TRANSFER",
      referenceNumber: "",
      notes: "",
    });

    setSelectedSlip(null);
    setAnalysis(null);
    setBills([]);

    const fileInput =
      document.getElementById(
        "payment-slip-input"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const uploadSlipToPayment =
    async (paymentId) => {
      if (!selectedSlip) {
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedSlip
      );

      await api.post(
        `/subcontractor-payments/${paymentId}/upload-slip`,
        formData
      );
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentData = {
      amount: Number(
        form.amount
      ),

      paymentDate:
        form.paymentDate,

      paymentMethod:
        form.paymentMethod,

      referenceNumber:
        form.referenceNumber.trim(),

      notes:
        form.notes.trim(),

      project: {
        id: Number(
          form.projectId
        ),
      },

      contractor: {
        id: Number(
          form.contractorId
        ),
      },

      /*
       * Bill is optional.
       *
       * If selected, backend will update:
       * paidAmount
       * balanceAmount
       * status
       */
      contractorBill:
        form.contractorBillId
          ? {
              id: Number(
                form.contractorBillId
              ),
            }
          : null,
    };

    try {
      setSaving(true);

      const response =
        await api.post(
          "/subcontractor-payments",
          paymentData
        );

      const payment =
        response.data;

      await uploadSlipToPayment(
        payment.id
      );

      showAlert(
        "success",
        form.contractorBillId
          ? "Payment saved and contractor bill updated successfully."
          : "Payment saved successfully."
      );

      resetForm();

      await loadPayments();
    } catch (error) {
      console.error(
        "Error saving payment:",
        error
      );

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to save payment."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
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
      console.error(
        "Error deleting payment:",
        error
      );

      showAlert(
        "error",
        "Unable to delete payment."
      );
    }
  };

  const formatAmount = (amount) => {
    const value =
      Number(amount || 0);

    return value.toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Subcontractor Payments
          </h1>

          <p>
            Upload payment slip,
            detect payment details and
            link payments to contractor bills.
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
          1. Upload Payment Slip
        </h2>

        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            id="payment-slip-input"
            type="file"
            accept=".pdf"
            onChange={
              handleSlipChange
            }
          />

          <button
            type="button"
            className="primary-button"
            onClick={analyzeSlip}
            disabled={
              !selectedSlip ||
              analyzing
            }
          >
            {analyzing
              ? "Analyzing..."
              : "Analyze Slip"}
          </button>
        </div>

        {selectedSlip && (
          <p
            style={{
              marginTop: "10px",
            }}
          >
            Selected:{" "}
            <strong>
              {selectedSlip.name}
            </strong>
          </p>
        )}
      </div>

      {analysis && (
        <div className="form-card">
          <h2>
            2. Detected Details
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <strong>Amount</strong>

              <p>
                {analysis.extractedData
                  ?.amount != null
                  ? `Rs. ${formatAmount(
                      analysis.extractedData.amount
                    )}`
                  : "Not detected"}
              </p>
            </div>

            <div>
              <strong>Date</strong>

              <p>
                {analysis.extractedData
                  ?.date ||
                  "Not detected"}
              </p>
            </div>

            <div>
              <strong>
                Reference
              </strong>

              <p>
                {analysis.extractedData
                  ?.referenceNumber ||
                  "Not detected"}
              </p>
            </div>

            <div>
              <strong>
                Beneficiary
              </strong>

              <p>
                {analysis.extractedData
                  ?.beneficiaryName ||
                  "Not detected"}
              </p>
            </div>

            <div>
              <strong>
                Account Number
              </strong>

              <p>
                {analysis.extractedData
                  ?.accountNumber ||
                  "Not detected"}
              </p>
            </div>

            <div>
              <strong>Bank</strong>

              <p>
                {analysis.extractedData
                  ?.bankName ||
                  "Not detected"}
              </p>
            </div>

            <div>
              <strong>
                Assigned Subcontractor
              </strong>

              <p>
                {analysis.contractorMatch
                  ?.contractor
                  ?.name ||
                  "Other / Unmatched"}
              </p>
            </div>

            <div>
              <strong>
                Match Status
              </strong>

              <p>
                {analysis.contractorMatch
                  ?.matched
                  ? "Matched"
                  : "Unmatched"}
              </p>
            </div>

            <div>
              <strong>
                Confidence
              </strong>

              <p>
                {analysis.contractorMatch
                  ?.confidence ||
                  "UNMATCHED"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="form-card">
        <h2>
          3. Review & Confirm
        </h2>

        <form
          className="client-form"
          onSubmit={handleSubmit}
        >
          <select
            name="projectId"
            value={
              form.projectId
            }
            onChange={
              handleChange
            }
          >
            <option value="">
              Select Project / Site *
            </option>

            {projects.map(
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

          <select
            name="contractorId"
            value={
              form.contractorId
            }
            onChange={
              handleChange
            }
          >
            <option value="">
              Select Subcontractor *
            </option>

            {contractors.map(
              (contractor) => (
                <option
                  key={contractor.id}
                  value={contractor.id}
                >
                  {contractor.name}

                  {contractor.tradeType
                    ? ` - ${contractor.tradeType}`
                    : ""}
                </option>
              )
            )}
          </select>

          <select
            name="contractorBillId"
            value={
              form.contractorBillId
            }
            onChange={
              handleChange
            }
            disabled={
              !form.projectId ||
              !form.contractorId ||
              loadingBills
            }
          >
            <option value="">
              {loadingBills
                ? "Loading Bills..."
                : "No Bill / Select Bill"}
            </option>

            {bills.map(
              (bill) => (
                <option
                  key={bill.id}
                  value={bill.id}
                >
                  {bill.billNumber}
                  {" - "}
                  Balance Rs.{" "}
                  {formatAmount(
                    bill.balanceAmount
                  )}
                </option>
              )
            )}
          </select>

          {form.projectId &&
            form.contractorId &&
            !loadingBills &&
            bills.length === 0 && (
              <div>
                No unpaid or partially-paid bills found
                for this project and subcontractor.
              </div>
            )}

          {selectedBill && (
            <div
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <strong>
                Selected Bill:{" "}
                {selectedBill.billNumber}
              </strong>

              <div>
                Work:{" "}
                {selectedBill.workDescription ||
                  "-"}
              </div>

              <div>
                Net Payable: Rs.{" "}
                {formatAmount(
                  selectedBill.netPayable
                )}
              </div>

              <div>
                Already Paid: Rs.{" "}
                {formatAmount(
                  selectedBill.paidAmount
                )}
              </div>

              <div>
                Current Balance: Rs.{" "}
                {formatAmount(
                  selectedBill.balanceAmount
                )}
              </div>

              <div>
                Status:{" "}
                {selectedBill.status ||
                  "-"}
              </div>
            </div>
          )}

          <input
            type="number"
            name="amount"
            placeholder="Amount *"
            value={
              form.amount
            }
            onChange={
              handleChange
            }
            min="0"
            step="0.01"
          />

          <input
            type="date"
            name="paymentDate"
            value={
              form.paymentDate
            }
            onChange={
              handleChange
            }
          />

          <select
            name="paymentMethod"
            value={
              form.paymentMethod
            }
            onChange={
              handleChange
            }
          >
            <option value="BANK_TRANSFER">
              Bank Transfer
            </option>

            <option value="ONLINE_TRANSFER">
              Online Transfer
            </option>

            <option value="CASH">
              Cash
            </option>

            <option value="CHEQUE">
              Cheque
            </option>

            <option value="OTHER">
              Other
            </option>
          </select>

          <input
            type="text"
            name="referenceNumber"
            placeholder="Reference Number"
            value={
              form.referenceNumber
            }
            onChange={
              handleChange
            }
          />

          <input
            type="text"
            name="notes"
            placeholder="Description / Notes"
            value={
              form.notes
            }
            onChange={
              handleChange
            }
          />

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Confirm & Save Payment"}
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={resetForm}
          >
            Clear
          </button>
        </form>
      </div>

      <div className="table-card">
        <h2>
          Payment History
        </h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Project</th>
              <th>Subcontractor</th>
              <th>Bill</th>
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
                <td colSpan="10">
                  No subcontractor payments found.
                </td>
              </tr>
            ) : (
              payments.map(
                (payment) => (
                  <tr
                    key={payment.id}
                  >
                    <td>
                      {payment.id}
                    </td>

                    <td>
                      {payment.paymentDate ||
                        "-"}
                    </td>

                    <td>
                      {payment.project
                        ?.projectName ||
                        "-"}
                    </td>

                    <td>
                      {payment.contractor
                        ?.name ||
                        "-"}
                    </td>

                    <td>
                      {payment.contractorBill
                        ?.billNumber ||
                        "-"}
                    </td>

                    <td>
                      Rs.{" "}
                      {formatAmount(
                        payment.amount
                      )}
                    </td>

                    <td>
                      {payment.paymentMethod ||
                        "-"}
                    </td>

                    <td>
                      {payment.referenceNumber ||
                        "-"}
                    </td>

                    <td>
                      {payment.slipFileName ||
                        "No slip"}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDelete(
                            payment.id
                          )
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubcontractorPayments;