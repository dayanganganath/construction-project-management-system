import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function ContractorLedger() {
  const [contractors, setContractors] = useState([]);
  const [contractorId, setContractorId] = useState("");
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    loadContractors();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });

    setTimeout(() => {
      setAlert({
        type: "",
        message: "",
      });
    }, 4000);
  };

  const loadContractors = async () => {
    try {
      const response = await api.get("/contractors");

      const activeContractors = response.data.filter(
        (contractor) => contractor.active !== false
      );

      setContractors(activeContractors);
    } catch (error) {
      console.error(
        "Error loading contractors:",
        error
      );

      showAlert(
        "error",
        "Unable to load contractors."
      );
    }
  };

  const loadLedger = async (id) => {
    if (!id) {
      setLedger(null);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get(
        `/contractor-ledger/${id}`
      );

      setLedger(response.data);
    } catch (error) {
      console.error(
        "Error loading contractor ledger:",
        error
      );

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to load contractor ledger."
      );

      setLedger(null);
    } finally {
      setLoading(false);
    }
  };

  const handleContractorChange = async (e) => {
    const value = e.target.value;

    setContractorId(value);

    await loadLedger(value);
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString(
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
          <h1>Contractor Ledger</h1>

          <p>
            Contractor-wise bills, payments,
            outstanding balances and history.
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
        <h2>Select Contractor</h2>

        <select
          value={contractorId}
          onChange={handleContractorChange}
          style={{
            minWidth: "320px",
          }}
        >
          <option value="">
            Select Contractor
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
      </div>

      {loading && (
        <div className="form-card">
          Loading contractor ledger...
        </div>
      )}

      {ledger && !loading && (
        <>
          <div className="form-card">
            <h2>
              {ledger.contractorName}
            </h2>

            <p>
              Type:{" "}
              <strong>
                {ledger.contractorType || "-"}
              </strong>
            </p>

            <p>
              Trade:{" "}
              <strong>
                {ledger.tradeType || "-"}
              </strong>
            </p>

            <p>
              Phone:{" "}
              <strong>
                {ledger.phone || "-"}
              </strong>
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div className="form-card">
              <h3>Total Bills</h3>
              <h2>{ledger.totalBills || 0}</h2>
            </div>

            <div className="form-card">
              <h3>Paid Bills</h3>
              <h2>{ledger.paidBills || 0}</h2>
            </div>

            <div className="form-card">
              <h3>Partially Paid</h3>
              <h2>
                {ledger.partiallyPaidBills || 0}
              </h2>
            </div>

            <div className="form-card">
              <h3>Unpaid Bills</h3>
              <h2>{ledger.unpaidBills || 0}</h2>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div className="form-card">
              <h3>Total Gross</h3>
              <h2>
                Rs.{" "}
                {formatAmount(
                  ledger.totalGrossAmount
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>Total Net Payable</h3>
              <h2>
                Rs.{" "}
                {formatAmount(
                  ledger.totalNetPayable
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>Paid Against Bills</h3>
              <h2>
                Rs.{" "}
                {formatAmount(
                  ledger.totalPaidAmount
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>Outstanding</h3>
              <h2>
                Rs.{" "}
                {formatAmount(
                  ledger.totalOutstanding
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>Total Payments</h3>
              <h2>
                Rs.{" "}
                {formatAmount(
                  ledger.totalPayments
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>Unallocated Payments</h3>
              <h2>
                Rs.{" "}
                {formatAmount(
                  ledger.unallocatedPayments
                )}
              </h2>
            </div>
          </div>

          <div className="table-card">
            <h2>Contractor Bills</h2>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Work</th>
                  <th>Gross</th>
                  <th>Net</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {ledger.bills?.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      No contractor bills found.
                    </td>
                  </tr>
                ) : (
                  ledger.bills?.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.billNumber}</td>
                      <td>{bill.billDate || "-"}</td>

                      <td>
                        {bill.projectName || "-"}
                        {bill.location
                          ? ` - ${bill.location}`
                          : ""}
                      </td>

                      <td>
                        {bill.workDescription || "-"}
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

                      <td>{bill.status || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-card">
            <h2>Payment History</h2>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Bill</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Notes</th>
                  <th>Slip</th>
                </tr>
              </thead>

              <tbody>
                {ledger.payments?.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  ledger.payments?.map(
                    (payment) => (
                      <tr key={payment.id}>
                        <td>
                          {payment.paymentDate ||
                            "-"}
                        </td>

                        <td>
                          {payment.projectName ||
                            "-"}
                          {payment.location
                            ? ` - ${payment.location}`
                            : ""}
                        </td>

                        <td>
                          {payment.billNumber ||
                            "Unallocated"}
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
                          {payment.notes || "-"}
                        </td>

                        <td>
                          {payment.slipFileName ||
                            "No slip"}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ContractorLedger;