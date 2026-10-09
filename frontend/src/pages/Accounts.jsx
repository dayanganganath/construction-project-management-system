import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Accounts() {
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [summary, setSummary] = useState({
    transactionCount: 0,
    totalReceived: 0,
    totalSubcontractorPayments: 0,
    totalLabourPayments: 0,
    totalExpenses: 0,
    totalOutgoing: 0,
    netCashFlow: 0,
  });

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    projectId: "",
    type: "ALL",
    search: "",
  });

  useEffect(() => {
    loadProjects();
    loadRegister();
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
      const response =
        await api.get("/projects");

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

  const buildParams = (
    customFilters = filters
  ) => {
    const params = {};

    if (customFilters.from) {
      params.from =
        customFilters.from;
    }

    if (customFilters.to) {
      params.to =
        customFilters.to;
    }

    if (customFilters.projectId) {
      params.projectId =
        customFilters.projectId;
    }

    if (
      customFilters.type &&
      customFilters.type !== "ALL"
    ) {
      params.type =
        customFilters.type;
    }

    if (
      customFilters.search.trim()
    ) {
      params.search =
        customFilters.search.trim();
    }

    return params;
  };

  const loadRegister = async (
    customFilters = filters
  ) => {
    try {
      setLoading(true);

      const params =
        buildParams(customFilters);

      const [
        registerResponse,
        summaryResponse,
      ] = await Promise.all([
        api.get(
          "/accounts/payment-register",
          { params }
        ),

        api.get(
          "/accounts/summary",
          { params }
        ),
      ]);

      setTransactions(
        registerResponse.data || []
      );

      setSummary({
        transactionCount:
          summaryResponse.data
            ?.transactionCount || 0,

        totalReceived:
          summaryResponse.data
            ?.totalReceived || 0,

        totalSubcontractorPayments:
          summaryResponse.data
            ?.totalSubcontractorPayments ||
          0,

        totalLabourPayments:
          summaryResponse.data
            ?.totalLabourPayments || 0,

        totalExpenses:
          summaryResponse.data
            ?.totalExpenses || 0,

        totalOutgoing:
          summaryResponse.data
            ?.totalOutgoing || 0,

        netCashFlow:
          summaryResponse.data
            ?.netCashFlow || 0,
      });
    } catch (error) {
      console.error(
        "Error loading accounts:",
        error
      );

      showAlert(
        "error",
        "Unable to load payment register."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]:
        e.target.value,
    });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    loadRegister(filters);
  };

  const formatDateForInput = (
    date
  ) => {
    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getToday = () =>
    formatDateForInput(
      new Date()
    );

  const setThisWeek = () => {
    const today = new Date();

    const currentDay =
      today.getDay();

    const mondayOffset =
      currentDay === 0
        ? -6
        : 1 - currentDay;

    const monday =
      new Date(today);

    monday.setDate(
      today.getDate() +
        mondayOffset
    );

    const sunday =
      new Date(monday);

    sunday.setDate(
      monday.getDate() + 6
    );

    const updatedFilters = {
      ...filters,
      from:
        formatDateForInput(
          monday
        ),
      to:
        formatDateForInput(
          sunday
        ),
    };

    setFilters(
      updatedFilters
    );

    loadRegister(
      updatedFilters
    );
  };

  const setThisMonth = () => {
    const today = new Date();

    const firstDay =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

    const lastDay =
      new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

    const updatedFilters = {
      ...filters,
      from:
        formatDateForInput(
          firstDay
        ),
      to:
        formatDateForInput(
          lastDay
        ),
    };

    setFilters(
      updatedFilters
    );

    loadRegister(
      updatedFilters
    );
  };

  const clearFilters = () => {
    const cleared = {
      from: "",
      to: "",
      projectId: "",
      type: "ALL",
      search: "",
    };

    setFilters(cleared);
    loadRegister(cleared);
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

  const getTypeLabel = (
    sourceType
  ) => {
    switch (sourceType) {
      case "CLIENT_PAYMENT":
        return "Client Payment";

      case "SUBCONTRACTOR_PAYMENT":
        return "Subcontractor Payment";

      case "LABOUR_PAYMENT":
        return "Labour Payment";

      case "EXPENSE":
        return "Project Expense";

      default:
        return sourceType || "-";
    }
  };

  const selectedProjectName =
    useMemo(() => {
      if (!filters.projectId) {
        return "All Projects";
      }

      const project =
        projects.find(
          (item) =>
            String(item.id) ===
            String(
              filters.projectId
            )
        );

      return (
        project?.projectName ||
        "Selected Project"
      );
    }, [
      filters.projectId,
      projects,
    ]);

  const exportPDF = () => {
    if (
      transactions.length === 0
    ) {
      showAlert(
        "error",
        "There are no transactions to export."
      );

      return;
    }

    const doc =
      new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

    doc.setFontSize(16);

    doc.text(
      "Accounts - Payment Register",
      14,
      15
    );

    doc.setFontSize(9);

    doc.text(
      `Project: ${selectedProjectName}`,
      14,
      22
    );

    doc.text(
      `Period: ${
        filters.from ||
        "Beginning"
      } to ${
        filters.to ||
        getToday()
      }`,
      14,
      27
    );

    doc.text(
      `Type: ${
        filters.type === "ALL"
          ? "All Payment Types"
          : getTypeLabel(
              filters.type
            )
      }`,
      14,
      32
    );

    let summaryY = 39;

    if (filters.search) {
      doc.text(
        `Search: ${filters.search}`,
        14,
        37
      );

      summaryY = 44;
    }

    doc.text(
      `Received: Rs. ${formatAmount(
        summary.totalReceived
      )}`,
      14,
      summaryY
    );

    doc.text(
      `Subcontractors: Rs. ${formatAmount(
        summary.totalSubcontractorPayments
      )}`,
      60,
      summaryY
    );

    doc.text(
      `Labour: Rs. ${formatAmount(
        summary.totalLabourPayments
      )}`,
      120,
      summaryY
    );

    doc.text(
      `Expenses: Rs. ${formatAmount(
        summary.totalExpenses
      )}`,
      165,
      summaryY
    );

    doc.text(
      `Outgoing: Rs. ${formatAmount(
        summary.totalOutgoing
      )}`,
      215,
      summaryY
    );

    doc.text(
      `Net Cash Flow: Rs. ${formatAmount(
        summary.netCashFlow
      )}`,
      14,
      summaryY + 5
    );

    doc.text(
      `Transactions: ${
        summary.transactionCount ||
        0
      }`,
      80,
      summaryY + 5
    );

    const tableRows =
      transactions.map(
        (item) => [
          item.date || "-",

          item.projectName ||
            "-",

          getTypeLabel(
            item.sourceType
          ),

          item.partyName ||
            "-",

          item.description ||
            "-",

          item.paymentMethod ||
            "-",

          item.referenceNumber ||
            "-",

          item.direction ===
          "IN"
            ? `Rs. ${formatAmount(
                item.amount
              )}`
            : "-",

          item.direction ===
          "OUT"
            ? `Rs. ${formatAmount(
                item.amount
              )}`
            : "-",
        ]
      );

    autoTable(doc, {
      startY:
        summaryY + 12,

      head: [[
        "Date",
        "Project / Site",
        "Type",
        "Paid To / Received From",
        "Description",
        "Method",
        "Reference",
        "Money In",
        "Money Out",
      ]],

      body: tableRows,

      styles: {
        fontSize: 7,
        cellPadding: 2,
      },

      headStyles: {
        fontSize: 7,
      },
    });

    const fileName =
      `payment-register-${
        filters.from ||
        "all"
      }-${
        filters.to ||
        getToday()
      }.pdf`;

    doc.save(fileName);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Accounts / Payment Register
          </h1>

          <p>
            Review client receipts,
            subcontractor payments,
            labour payments and project
            expenses.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={exportPDF}
        >
          Download PDF
        </button>
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
          Filter Transactions
        </h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "15px",
          }}
        >
          <button
            type="button"
            className="primary-button"
            onClick={setThisWeek}
          >
            This Week
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={setThisMonth}
          >
            This Month
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <form
          className="client-form"
          onSubmit={applyFilters}
        >
          <div>
            <label>
              From Date
            </label>

            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={
                handleChange
              }
            />
          </div>

          <div>
            <label>
              To Date
            </label>

            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={
                handleChange
              }
            />
          </div>

          <select
            name="projectId"
            value={
              filters.projectId
            }
            onChange={
              handleChange
            }
          >
            <option value="">
              All Projects / Sites
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

          <select
            name="type"
            value={
              filters.type
            }
            onChange={
              handleChange
            }
          >
            <option value="ALL">
              All Payment Types
            </option>

            <option value="CLIENT_PAYMENT">
              Client Payments
            </option>

            <option value="SUBCONTRACTOR_PAYMENT">
              Subcontractor Payments
            </option>

            <option value="LABOUR_PAYMENT">
              Labour Payments
            </option>

            <option value="EXPENSE">
              Project Expenses
            </option>
          </select>

          <input
            type="text"
            name="search"
            placeholder="Search worker, contractor, project, reference..."
            value={
              filters.search
            }
            onChange={
              handleChange
            }
          />

          <button
            type="submit"
            className="primary-button"
          >
            Apply Filters
          </button>
        </form>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card green">
          <p>
            Total Received
          </p>

          <h2>
            Rs.{" "}
            {formatAmount(
              summary.totalReceived
            )}
          </h2>
        </div>

        <div className="dashboard-card purple">
          <p>
            Subcontractor Payments
          </p>

          <h2>
            Rs.{" "}
            {formatAmount(
              summary
                .totalSubcontractorPayments
            )}
          </h2>
        </div>

        <div className="dashboard-card orange">
          <p>
            Labour Payments
          </p>

          <h2>
            Rs.{" "}
            {formatAmount(
              summary
                .totalLabourPayments
            )}
          </h2>
        </div>

        <div className="dashboard-card cyan">
          <p>
            Project Expenses
          </p>

          <h2>
            Rs.{" "}
            {formatAmount(
              summary.totalExpenses
            )}
          </h2>
        </div>

        <div className="dashboard-card red">
          <p>
            Total Outgoing
          </p>

          <h2>
            Rs.{" "}
            {formatAmount(
              summary.totalOutgoing
            )}
          </h2>
        </div>

        <div className="dashboard-card navy">
          <p>
            Net Cash Flow
          </p>

          <h2>
            Rs.{" "}
            {formatAmount(
              summary.netCashFlow
            )}
          </h2>
        </div>
      </div>

      <div
        className="table-card"
        style={{
          marginTop: "24px",
        }}
      >
        <div
          style={{
            padding:
              "20px 20px 0",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
              }}
            >
              Payment Register
            </h2>

            <p>
              {transactions.length}{" "}
              transaction(s)
            </p>
          </div>

          {loading && (
            <span>
              Loading...
            </span>
          )}
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>
                Project / Site
              </th>
              <th>Type</th>
              <th>
                Paid To /
                Received From
              </th>
              <th>
                Description
              </th>
              <th>Method</th>
              <th>
                Reference
              </th>
              <th>
                Money In
              </th>
              <th>
                Money Out
              </th>
              <th>Slip</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
            transactions.length ===
              0 ? (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  No transactions
                  found for the
                  selected filters.
                </td>
              </tr>
            ) : (
              transactions.map(
                (
                  item,
                  index
                ) => (
                  <tr
                    key={`${item.sourceType}-${item.sourceId}-${index}`}
                  >
                    <td>
                      {item.date ||
                        "-"}
                    </td>

                    <td>
                      <strong>
                        {item.projectName ||
                          "-"}
                      </strong>

                      {item.location && (
                        <div
                          style={{
                            marginTop:
                              "4px",
                            fontSize:
                              "12px",
                            opacity:
                              0.7,
                          }}
                        >
                          {
                            item.location
                          }
                        </div>
                      )}
                    </td>

                    <td>
                      {getTypeLabel(
                        item.sourceType
                      )}
                    </td>

                    <td>
                      {item.partyName ||
                        "-"}
                    </td>

                    <td>
                      {item.description ||
                        "-"}
                    </td>

                    <td>
                      {item.paymentMethod ||
                        "-"}
                    </td>

                    <td>
                      {item.referenceNumber ||
                        "-"}
                    </td>

                    <td>
                      {item.direction ===
                      "IN"
                        ? `Rs. ${formatAmount(
                            item.amount
                          )}`
                        : "-"}
                    </td>

                    <td>
                      {item.direction ===
                      "OUT"
                        ? `Rs. ${formatAmount(
                            item.amount
                          )}`
                        : "-"}
                    </td>

                    <td>
                      {item.slipFileName ||
                        "-"}
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

export default Accounts;