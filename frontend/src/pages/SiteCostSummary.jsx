import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function SiteCostSummary() {
  const [projects, setProjects] =
    useState([]);

  const [projectId, setProjectId] =
    useState("");

  const [summary, setSummary] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [alert, setAlert] =
    useState({
      type: "",
      message: "",
    });

  useEffect(() => {
    loadProjects();
  }, []);

  const showAlert = (
    type,
    message
  ) => {
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

  const loadProjects =
    async () => {
      try {
        const response =
          await api.get(
            "/projects"
          );

        setProjects(
          response.data || []
        );
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

  const fetchSummary =
    async (id) => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);

        const response =
          await api.get(
            `/site-cost-summary/project/${id}`
          );

        setSummary(
          response.data
        );
      } catch (error) {
        console.error(
          "Error loading site cost summary:",
          error
        );

        showAlert(
          "error",
          error.response?.data
            ?.message ||
            "Unable to load site cost summary."
        );

        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

  const loadSummary =
    async () => {
      if (!projectId) {
        showAlert(
          "error",
          "Please select a project / site."
        );

        return;
      }

      await fetchSummary(
        projectId
      );
    };

  const handleProjectChange =
    async (e) => {
      const value =
        e.target.value;

      setProjectId(value);
      setSummary(null);

      if (value) {
        await fetchSummary(
          value
        );
      }
    };

  const formatAmount = (
    amount
  ) => {
    return Number(
      amount || 0
    ).toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const moneyCard = (
    title,
    value,
    className = "blue"
  ) => (
    <div
      className={`dashboard-card ${className}`}
    >
      <p>{title}</p>

      <h2>
        Rs.{" "}
        {formatAmount(
          value
        )}
      </h2>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Site Cost Summary
          </h1>

          <p>
            Project-wise contractor,
            subcontractor, labour,
            expense and cash position.
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
          Select Project / Site
        </h2>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems:
              "center",
          }}
        >
          <select
            value={projectId}
            onChange={
              handleProjectChange
            }
            style={{
              minWidth:
                "300px",
              maxWidth:
                "500px",
            }}
          >
            <option value="">
              Select Project /
              Site
            </option>

            {projects.map(
              (project) => (
                <option
                  key={
                    project.id
                  }
                  value={
                    project.id
                  }
                >
                  {
                    project.projectName
                  }

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
              loadSummary
            }
            disabled={
              !projectId ||
              loading
            }
          >
            {loading
              ? "Loading..."
              : "Refresh Summary"}
          </button>
        </div>
      </div>

      {summary && (
        <>
          <div className="selected-project-info">
            <h2>
              {
                summary.projectName
              }
            </h2>

            <p>
              {summary.location ||
                "No location"}
            </p>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card blue">
              <p>
                Total Contractor Bills
              </p>

              <h2>
                {summary.totalContractorBills ||
                  0}
              </h2>
            </div>

            <div className="dashboard-card green">
              <p>
                Paid Bills
              </p>

              <h2>
                {summary.paidBills ||
                  0}
              </h2>
            </div>

            <div className="dashboard-card orange">
              <p>
                Partially Paid
              </p>

              <h2>
                {summary.partiallyPaidBills ||
                  0}
              </h2>
            </div>

            <div className="dashboard-card red">
              <p>
                Unpaid Bills
              </p>

              <h2>
                {summary.unpaidBills ||
                  0}
              </h2>
            </div>
          </div>

          <div
            className="dashboard-grid"
            style={{
              marginTop: "20px",
            }}
          >
            {moneyCard(
              "Contractor Gross Amount",
              summary.contractorGrossAmount,
              "blue"
            )}

            {moneyCard(
              "Contractor Net Payable",
              summary.contractorNetPayable,
              "purple"
            )}

            {moneyCard(
              "Contractor Paid Amount",
              summary.contractorPaidAmount,
              "green"
            )}

            {moneyCard(
              "Contractor Outstanding",
              summary.contractorOutstandingAmount,
              "red"
            )}
          </div>

          <div
            className="dashboard-grid"
            style={{
              marginTop: "20px",
            }}
          >
            {moneyCard(
              "Client Payments",
              summary.clientPayments,
              "green"
            )}

            {moneyCard(
              "Subcontractor Payments",
              summary.subcontractorPayments,
              "purple"
            )}

            {moneyCard(
              "Labour Payments",
              summary.labourPayments,
              "orange"
            )}

            {moneyCard(
              "Project Expenses",
              summary.projectExpenses,
              "cyan"
            )}

            {moneyCard(
              "Total Outgoing",
              summary.totalOutgoing,
              "red"
            )}

            {moneyCard(
              "Net Cash Position",
              summary.netCashPosition,
              "navy"
            )}
          </div>

          <div
            className="table-card"
            style={{
              marginTop: "24px",
            }}
          >
            <h2>
              Financial Summary
            </h2>

            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    Item
                  </th>

                  <th>
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    Contractor Gross
                    Amount
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary
                        .contractorGrossAmount
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Contractor Net
                    Payable
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary
                        .contractorNetPayable
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Contractor Paid
                    Amount
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary
                        .contractorPaidAmount
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Contractor
                    Outstanding
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary
                        .contractorOutstandingAmount
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Client Payments
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary
                        .clientPayments
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Subcontractor
                    Payments
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary
                        .subcontractorPayments
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Labour Payments
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary
                        .labourPayments
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Project Expenses
                  </td>

                  <td>
                    Rs.{" "}
                    {formatAmount(
                      summary
                        .projectExpenses
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>
                      Total Outgoing
                    </strong>
                  </td>

                  <td>
                    <strong>
                      Rs.{" "}
                      {formatAmount(
                        summary
                          .totalOutgoing
                      )}
                    </strong>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>
                      Net Cash
                      Position
                    </strong>
                  </td>

                  <td>
                    <strong>
                      Rs.{" "}
                      {formatAmount(
                        summary
                          .netCashPosition
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