import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function SiteCostSummary() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
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

  const loadSummary = async () => {
    if (!projectId) {
      showAlert(
        "error",
        "Please select a project / site."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await api.get(
        `/site-cost-summary/project/${projectId}`
      );

      setSummary(response.data);
    } catch (error) {
      console.error(
        "Error loading site cost summary:",
        error
      );

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to load site cost summary."
      );

      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = async (e) => {
    const value = e.target.value;

    setProjectId(value);
    setSummary(null);

    if (!value) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.get(
        `/site-cost-summary/project/${value}`
      );

      setSummary(response.data);
    } catch (error) {
      console.error(
        "Error loading summary:",
        error
      );

      showAlert(
        "error",
        "Unable to load site cost summary."
      );
    } finally {
      setLoading(false);
    }
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
          <h1>Site Cost Summary</h1>

          <p>
            Project-wise contractor bills,
            payments, expenses and cash position.
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
        <h2>Select Project / Site</h2>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <select
            value={projectId}
            onChange={handleProjectChange}
            style={{
              minWidth: "300px",
            }}
          >
            <option value="">
              Select Project / Site
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

          <button
            type="button"
            className="primary-button"
            onClick={loadSummary}
            disabled={!projectId || loading}
          >
            {loading
              ? "Loading..."
              : "Refresh Summary"}
          </button>
        </div>
      </div>

      {summary && (
        <>
          <div className="form-card">
            <h2>
              {summary.projectName}
            </h2>

            <p>
              {summary.location || "No location"}
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
              <h3>Total Contractor Bills</h3>

              <h2>
                {summary.totalContractorBills || 0}
              </h2>
            </div>

            <div className="form-card">
              <h3>Paid Bills</h3>

              <h2>
                {summary.paidBills || 0}
              </h2>
            </div>

            <div className="form-card">
              <h3>Partially Paid</h3>

              <h2>
                {summary.partiallyPaidBills || 0}
              </h2>
            </div>

            <div className="form-card">
              <h3>Unpaid Bills</h3>

              <h2>
                {summary.unpaidBills || 0}
              </h2>
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
              <h3>
                Contractor Gross Amount
              </h3>

              <h2>
                Rs.{" "}
                {formatAmount(
                  summary.contractorGrossAmount
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>
                Contractor Net Payable
              </h3>

              <h2>
                Rs.{" "}
                {formatAmount(
                  summary.contractorNetPayable
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>
                Contractor Paid Amount
              </h3>

              <h2>
                Rs.{" "}
                {formatAmount(
                  summary.contractorPaidAmount
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>
                Contractor Outstanding
              </h3>

              <h2>
                Rs.{" "}
                {formatAmount(
                  summary.contractorOutstandingAmount
                )}
              </h2>
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
              <h3>Client Payments</h3>

              <h2>
                Rs.{" "}
                {formatAmount(
                  summary.clientPayments
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>
                Subcontractor Payments
              </h3>

              <h2>
                Rs.{" "}
                {formatAmount(
                  summary.subcontractorPayments
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>Project Expenses</h3>

              <h2>
                Rs.{" "}
                {formatAmount(
                  summary.projectExpenses
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>Total Outgoing</h3>

              <h2>
                Rs.{" "}
                {formatAmount(
                  summary.totalOutgoing
                )}
              </h2>
            </div>

            <div className="form-card">
              <h3>Net Cash Position</h3>

              <h2>
                Rs.{" "}
                {formatAmount(
                  summary.netCashPosition
                )}
              </h2>
            </div>
          </div>

          <div className="table-card">
            <h2>Financial Summary</h2>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    Contractor Gross Amount
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary.contractorGrossAmount
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Contractor Net Payable
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary.contractorNetPayable
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Contractor Paid Amount
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary.contractorPaidAmount
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Contractor Outstanding
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary.contractorOutstandingAmount
                    )}
                  </td>
                </tr>

                <tr>
                  <td>Client Payments</td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary.clientPayments
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Subcontractor Payments
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary.subcontractorPayments
                    )}
                  </td>
                </tr>

                <tr>
                  <td>Project Expenses</td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary.projectExpenses
                    )}
                  </td>
                </tr>

                <tr>
                  <td>Total Outgoing</td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary.totalOutgoing
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>
                      Net Cash Position
                    </strong>
                  </td>

                  <td>
                    <strong>
                      Rs.{" "}
                      {formatAmount(
                        summary.netCashPosition
                      )}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default SiteCostSummary;