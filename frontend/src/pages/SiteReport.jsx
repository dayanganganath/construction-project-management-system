import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import api from "../services/api";
import Alert from "../components/Alert";

function SiteReport() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [report, setReport] = useState(null);
  const [transactions, setTransactions] = useState([]);
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

  const loadReport = async (id) => {
    if (!id) {
      setReport(null);
      setTransactions([]);
      return;
    }

    try {
      setLoading(true);

      const [
        reportResponse,
        accountsResponse,
      ] = await Promise.all([
        api.get(
          `/site-report/project/${id}`
        ),

        api.get(
          "/accounts/payment-register",
          {
            params: {
              projectId: id,
            },
          }
        ),
      ]);

      setReport(reportResponse.data);
      setTransactions(
        accountsResponse.data
      );
    } catch (error) {
      console.error(
        "Error loading site report:",
        error
      );

      showAlert(
        "error",
        error.response?.data?.message ||
          "Unable to load site report."
      );

      setReport(null);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = async (
    e
  ) => {
    const value = e.target.value;

    setProjectId(value);

    await loadReport(value);
  };

  const formatAmount = (amount) => {
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

  const downloadPdf = () => {
    if (!report) {
      showAlert(
        "error",
        "Please select a project first."
      );

      return;
    }

    const financial =
      report.financialSummary || {};

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    /*
     * -------------------------
     * REPORT HEADER
     * -------------------------
     */

    doc.setFontSize(18);

    doc.text(
      "Construction Project Site Report",
      14,
      18
    );

    doc.setFontSize(11);

    doc.text(
      `Project: ${
        report.projectName || "-"
      }`,
      14,
      29
    );

    doc.text(
      `Location: ${
        report.location || "-"
      }`,
      14,
      36
    );

    doc.text(
      `Status: ${
        report.status || "-"
      }`,
      14,
      43
    );

    doc.text(
      `Start Date: ${
        report.startDate || "-"
      }`,
      14,
      50
    );

    doc.text(
      `End Date: ${
        report.endDate || "-"
      }`,
      14,
      57
    );

    doc.text(
      `Generated Date: ${new Date().toLocaleDateString(
        "en-LK"
      )}`,
      14,
      64
    );

    /*
     * -------------------------
     * FINANCIAL SUMMARY
     * -------------------------
     */

    autoTable(doc, {
      startY: 73,

      head: [
        [
          "Financial Item",
          "Amount (LKR)",
        ],
      ],

      body: [
        [
          "Contractor Gross Amount",
          formatAmount(
            financial.contractorGrossAmount
          ),
        ],
        [
          "Contractor Net Payable",
          formatAmount(
            financial.contractorNetPayable
          ),
        ],
        [
          "Contractor Paid Amount",
          formatAmount(
            financial.contractorPaidAmount
          ),
        ],
        [
          "Contractor Outstanding",
          formatAmount(
            financial.contractorOutstandingAmount
          ),
        ],
        [
          "Client Payments",
          formatAmount(
            financial.clientPayments
          ),
        ],
        [
          "Subcontractor Payments",
          formatAmount(
            financial.subcontractorPayments
          ),
        ],
        [
          "Project Expenses",
          formatAmount(
            financial.projectExpenses
          ),
        ],
        [
          "Total Outgoing",
          formatAmount(
            financial.totalOutgoing
          ),
        ],
        [
          "Net Cash Position",
          formatAmount(
            financial.netCashPosition
          ),
        ],
      ],

      styles: {
        fontSize: 9,
      },
    });

    /*
     * -------------------------
     * PROGRESS SUMMARY
     * -------------------------
     */

    let nextY =
      doc.lastAutoTable.finalY + 10;

    doc.setFontSize(13);

    doc.text(
      "Latest Site Progress",
      14,
      nextY
    );

    nextY += 8;

    doc.setFontSize(10);

    const progressData = [
      [
        "Date",
        report.latestProgressDate ||
          "-",
      ],
      [
        "Progress",
        `${
          report.latestProgressPercentage ??
          0
        }%`,
      ],
      [
        "Workers",
        String(
          report.latestWorkersCount ??
            0
        ),
      ],
      [
        "Work Description",
        report.latestWorkDescription ||
          "-",
      ],
      [
        "Remarks",
        report.latestRemarks || "-",
      ],
      [
        "Total Progress Entries",
        String(
          report.totalProgressEntries ||
            0
        ),
      ],
    ];

    autoTable(doc, {
      startY: nextY,

      head: [
        [
          "Progress Item",
          "Details",
        ],
      ],

      body: progressData,

      styles: {
        fontSize: 9,
      },
    });

    /*
     * -------------------------
     * TRANSACTION REGISTER
     * -------------------------
     */

    if (
      transactions &&
      transactions.length > 0
    ) {
      autoTable(doc, {
        startY:
          doc.lastAutoTable.finalY +
          10,

        head: [
          [
            "Date",
            "Type",
            "Party",
            "Description",
            "Reference",
            "Money In",
            "Money Out",
          ],
        ],

        body: transactions.map(
          (transaction) => [
            transaction.date || "-",

            transaction.sourceType ||
              "-",

            transaction.partyName ||
              "-",

            transaction.description ||
              "-",

            transaction.referenceNumber ||
              "-",

            transaction.direction ===
            "IN"
              ? formatAmount(
                  transaction.amount
                )
              : "-",

            transaction.direction ===
            "OUT"
              ? formatAmount(
                  transaction.amount
                )
              : "-",
          ]
        ),

        styles: {
          fontSize: 7,
        },

        headStyles: {
          fontSize: 7,
        },

        margin: {
          left: 10,
          right: 10,
        },
      });
    }

    /*
     * -------------------------
     * PAGE NUMBERS
     * -------------------------
     */

    const pageCount =
      doc.internal.getNumberOfPages();

    for (
      let i = 1;
      i <= pageCount;
      i++
    ) {
      doc.setPage(i);

      doc.setFontSize(8);

      doc.text(
        `Page ${i} of ${pageCount}`,
        170,
        290
      );
    }

    /*
     * -------------------------
     * SAVE PDF
     * -------------------------
     */

    const safeProjectName = (
      report.projectName ||
      "site"
    )
      .replace(
        /[^a-z0-9]/gi,
        "_"
      )
      .toLowerCase();

    doc.save(
      `${safeProjectName}_site_report.pdf`
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Site Report
          </h1>

          <p>
            Project financial summary,
            progress and transaction report.
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
            gap: "15px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <select
            value={projectId}
            onChange={
              handleProjectChange
            }
            style={{
              minWidth: "320px",
            }}
          >
            <option value="">
              Select Project / Site
            </option>

            {projects.map(
              (project) => (
                <option
                  key={project.id}
                  value={project.id}
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
            onClick={downloadPdf}
            disabled={
              !report || loading
            }
          >
            Download PDF
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={
              !projectId ||
              loading
            }
            onClick={() =>
              loadReport(
                projectId
              )
            }
          >
            {loading
              ? "Loading..."
              : "Refresh Report"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="form-card">
          Loading site report...
        </div>
      )}

      {report &&
        !loading && (
          <>
            <div className="form-card">
              <h2>
                {
                  report.projectName
                }
              </h2>

              <p>
                Location:{" "}
                <strong>
                  {report.location ||
                    "-"}
                </strong>
              </p>

              <p>
                Status:{" "}
                <strong>
                  {report.status ||
                    "-"}
                </strong>
              </p>

              <p>
                Start Date:{" "}
                <strong>
                  {report.startDate ||
                    "-"}
                </strong>
              </p>

              <p>
                End Date:{" "}
                <strong>
                  {report.endDate ||
                    "-"}
                </strong>
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom:
                  "20px",
              }}
            >
              <div className="form-card">
                <h3>
                  Client Payments
                </h3>

                <h2>
                  Rs.{" "}
                  {formatAmount(
                    report
                      .financialSummary
                      ?.clientPayments
                  )}
                </h2>
              </div>

              <div className="form-card">
                <h3>
                  Total Outgoing
                </h3>

                <h2>
                  Rs.{" "}
                  {formatAmount(
                    report
                      .financialSummary
                      ?.totalOutgoing
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
                    report
                      .financialSummary
                      ?.contractorOutstandingAmount
                  )}
                </h2>
              </div>

              <div className="form-card">
                <h3>
                  Net Cash Position
                </h3>

                <h2>
                  Rs.{" "}
                  {formatAmount(
                    report
                      .financialSummary
                      ?.netCashPosition
                  )}
                </h2>
              </div>

              <div className="form-card">
                <h3>
                  Latest Progress
                </h3>

                <h2>
                  {report.latestProgressPercentage ??
                    0}
                  %
                </h2>
              </div>
            </div>

            <div className="table-card">
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
                        report
                          .financialSummary
                          ?.contractorGrossAmount
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
                        report
                          .financialSummary
                          ?.contractorNetPayable
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Contractor Paid
                    </td>

                    <td>
                      Rs.{" "}
                      {formatAmount(
                        report
                          .financialSummary
                          ?.contractorPaidAmount
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
                        report
                          .financialSummary
                          ?.contractorOutstandingAmount
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
                        report
                          .financialSummary
                          ?.clientPayments
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
                        report
                          .financialSummary
                          ?.subcontractorPayments
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
                        report
                          .financialSummary
                          ?.projectExpenses
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Total Outgoing
                    </td>

                    <td>
                      Rs.{" "}
                      {formatAmount(
                        report
                          .financialSummary
                          ?.totalOutgoing
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
                          report
                            .financialSummary
                            ?.netCashPosition
                        )}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="form-card">
              <h2>
                Latest Site Progress
              </h2>

              <p>
                Date:{" "}
                <strong>
                  {report.latestProgressDate ||
                    "-"}
                </strong>
              </p>

              <p>
                Progress:{" "}
                <strong>
                  {report.latestProgressPercentage ??
                    0}
                  %
                </strong>
              </p>

              <p>
                Workers:{" "}
                <strong>
                  {report.latestWorkersCount ??
                    0}
                </strong>
              </p>

              <p>
                Work Description:{" "}
                <strong>
                  {report.latestWorkDescription ||
                    "-"}
                </strong>
              </p>

              <p>
                Remarks:{" "}
                <strong>
                  {report.latestRemarks ||
                    "-"}
                </strong>
              </p>

              <p>
                Total Progress Entries:{" "}
                <strong>
                  {report.totalProgressEntries ||
                    0}
                </strong>
              </p>
            </div>

            <div className="table-card">
              <h2>
                Site Payment Register
              </h2>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      Date
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Paid To /
                      Received From
                    </th>

                    <th>
                      Description
                    </th>

                    <th>
                      Reference
                    </th>

                    <th>
                      Money In
                    </th>

                    <th>
                      Money Out
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="7"
                      >
                        No transactions
                        found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map(
                      (
                        transaction,
                        index
                      ) => (
                        <tr
                          key={`${transaction.sourceType}-${transaction.sourceId}-${index}`}
                        >
                          <td>
                            {transaction.date ||
                              "-"}
                          </td>

                          <td>
                            {transaction.sourceType ||
                              "-"}
                          </td>

                          <td>
                            {transaction.partyName ||
                              "-"}
                          </td>

                          <td>
                            {transaction.description ||
                              "-"}
                          </td>

                          <td>
                            {transaction.referenceNumber ||
                              "-"}
                          </td>

                          <td>
                            {transaction.direction ===
                            "IN"
                              ? `Rs. ${formatAmount(
                                  transaction.amount
                                )}`
                              : "-"}
                          </td>

                          <td>
                            {transaction.direction ===
                            "OUT"
                              ? `Rs. ${formatAmount(
                                  transaction.amount
                                )}`
                              : "-"}
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

export default SiteReport;