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
    setAlert({ type, message });

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
      console.error(error);

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
        "Site report load error:",
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

  const handleProjectChange = async (e) => {
    const value = e.target.value;

    setProjectId(value);
    await loadReport(value);
  };

  const formatAmount = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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

    const pageWidth =
      doc.internal.pageSize.getWidth();

    /*
     * COMPANY HEADER
     */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text(
      "SKYWARD ENGINEERING (PVT) LTD",
      pageWidth / 2,
      16,
      {
        align: "center",
      }
    );

    doc.setFontSize(10);
    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "Construction Project Management System",
      pageWidth / 2,
      23,
      {
        align: "center",
      }
    );

    doc.setLineWidth(0.4);

    doc.line(
      14,
      28,
      pageWidth - 14,
      28
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(15);

    doc.text(
      "SITE PROGRESS & COST REPORT",
      pageWidth / 2,
      38,
      {
        align: "center",
      }
    );

    /*
     * PROJECT INFORMATION
     */

    autoTable(doc, {
      startY: 45,

      body: [
        [
          "Project",
          report.projectName || "-",
        ],
        [
          "Location",
          report.location || "-",
        ],
        [
          "Status",
          report.status || "-",
        ],
        [
          "Start Date",
          report.startDate || "-",
        ],
        [
          "End Date",
          report.endDate || "-",
        ],
        [
          "Report Date",
          new Date().toLocaleDateString(
            "en-LK"
          ),
        ],
      ],

      theme: "grid",

      styles: {
        fontSize: 9,
      },

      columnStyles: {
        0: {
          fontStyle: "bold",
          cellWidth: 42,
        },
      },
    });

    /*
     * FINANCIAL SUMMARY
     */

    let nextY =
      doc.lastAutoTable.finalY + 9;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(12);

    doc.text(
      "Financial Summary",
      14,
      nextY
    );

    autoTable(doc, {
      startY: nextY + 4,

      head: [
        [
          "Description",
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

      theme: "grid",

      styles: {
        fontSize: 8.5,
      },

      columnStyles: {
        1: {
          halign: "right",
        },
      },
    });

    /*
     * BILL STATUS SUMMARY
     */

    nextY =
      doc.lastAutoTable.finalY + 9;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(12);

    doc.text(
      "Contractor Bill Summary",
      14,
      nextY
    );

    autoTable(doc, {
      startY: nextY + 4,

      head: [
        [
          "Total Bills",
          "Paid",
          "Partially Paid",
          "Unpaid",
        ],
      ],

      body: [
        [
          financial.totalContractorBills ||
            0,

          financial.paidBills ||
            0,

          financial.partiallyPaidBills ||
            0,

          financial.unpaidBills ||
            0,
        ],
      ],

      theme: "grid",

      styles: {
        fontSize: 9,
        halign: "center",
      },
    });

    /*
     * PROGRESS SUMMARY
     */

    nextY =
      doc.lastAutoTable.finalY + 9;

    doc.setFontSize(12);

    doc.text(
      "Latest Site Progress",
      14,
      nextY
    );

    autoTable(doc, {
      startY: nextY + 4,

      body: [
        [
          "Progress Date",
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
          report.latestWorkersCount ??
            0,
        ],
        [
          "Work Description",
          report.latestWorkDescription ||
            "-",
        ],
        [
          "Remarks",
          report.latestRemarks ||
            "-",
        ],
        [
          "Total Progress Entries",
          report.totalProgressEntries ||
            0,
        ],
      ],

      theme: "grid",

      styles: {
        fontSize: 8.5,
      },

      columnStyles: {
        0: {
          fontStyle: "bold",
          cellWidth: 45,
        },
      },
    });

    /*
     * PAYMENT REGISTER
     */

    if (
      transactions &&
      transactions.length > 0
    ) {
      nextY =
        doc.lastAutoTable.finalY + 10;

      doc.setFontSize(12);

      doc.text(
        "Payment Register",
        14,
        nextY
      );

      autoTable(doc, {
        startY: nextY + 4,

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

        theme: "grid",

        styles: {
          fontSize: 6.8,
        },

        headStyles: {
          fontSize: 6.8,
        },

        columnStyles: {
          5: {
            halign: "right",
          },

          6: {
            halign: "right",
          },
        },

        margin: {
          left: 8,
          right: 8,
        },
      });
    }

    /*
     * FOOTER / PAGE NUMBER
     */

    const totalPages =
      doc.internal.getNumberOfPages();

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      doc.setPage(page);

      const height =
        doc.internal.pageSize.getHeight();

      doc.setFontSize(7);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        "Generated by CPMS - Skyward Engineering (Pvt) Ltd",
        14,
        height - 8
      );

      doc.text(
        `Page ${page} of ${totalPages}`,
        pageWidth - 14,
        height - 8,
        {
          align: "right",
        }
      );
    }

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
      `${safeProjectName}_professional_site_report.pdf`
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Site Report</h1>

          <p>
            Professional project cost,
            payment and progress report.
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
            alignItems: "center",
            flexWrap: "wrap",
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
            disabled={
              !report || loading
            }
            onClick={
              downloadPdf
            }
          >
            Download Professional PDF
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
                Project Period:{" "}
                <strong>
                  {report.startDate ||
                    "-"}
                  {" to "}
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
                      Description
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
            </div>
          </>
        )}
    </div>
  );
}

export default SiteReport;