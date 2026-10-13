import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ContractorPortal() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState(null);

  const [dashboard, setDashboard] =
    useState(null);

  const [projects, setProjects] =
    useState([]);

  const [bills, setBills] =
    useState([]);

  const [payments, setPayments] =
    useState([]);

  const [
    materialRequests,
    setMaterialRequests,
  ] = useState([]);

  const [
    activeTab,
    setActiveTab,
  ] = useState("dashboard");

  const [loading, setLoading] =
    useState(true);

  const [
    submittingRequest,
    setSubmittingRequest,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const username =
    localStorage.getItem(
      "username"
    );

  const [materialForm, setMaterialForm] =
    useState({
      projectId: "",
      materialName: "",
      quantity: "",
      unit: "",
      purpose: "",
      notes: "",
    });

  useEffect(() => {
    loadPortalData();
  }, []);

  const getErrorMessage = (
    error,
    fallback
  ) => {
    const data =
      error.response?.data;

    if (
      typeof data === "string"
    ) {
      return data;
    }

    if (
      data?.message
    ) {
      return data.message;
    }

    return fallback;
  };

  const showSuccess = (
    message
  ) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 4000);
  };

  const loadPortalData =
    async () => {
      try {
        setLoading(true);
        setError("");

        const [
          profileResponse,
          dashboardResponse,
          projectsResponse,
          billsResponse,
          paymentsResponse,
          requestsResponse,
        ] = await Promise.all([
          api.get(
            "/contractor/profile"
          ),

          api.get(
            "/contractor/dashboard"
          ),

          api.get(
            "/contractor/projects"
          ),

          api.get(
            "/contractor/bills"
          ),

          api.get(
            "/contractor/payments"
          ),

          api.get(
            "/contractor/material-requests"
          ),
        ]);

        setProfile(
          profileResponse.data
        );

        setDashboard(
          dashboardResponse.data
        );

        setProjects(
          Array.isArray(
            projectsResponse.data
          )
            ? projectsResponse.data
            : []
        );

        setBills(
          Array.isArray(
            billsResponse.data
          )
            ? billsResponse.data
            : []
        );

        setPayments(
          Array.isArray(
            paymentsResponse.data
          )
            ? paymentsResponse.data
            : []
        );

        setMaterialRequests(
          Array.isArray(
            requestsResponse.data
          )
            ? requestsResponse.data
            : []
        );
      } catch (error) {
        console.error(
          "Contractor portal loading error:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load contractor portal."
          )
        );
      } finally {
        setLoading(false);
      }
    };

  const loadMaterialRequests =
    async () => {
      try {
        const response =
          await api.get(
            "/contractor/material-requests"
          );

        setMaterialRequests(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Unable to load material requests:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load material requests."
          )
        );
      }
    };

  const handleMaterialChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setMaterialForm({
        ...materialForm,
        [name]: value,
      });

      setError("");
    };

  const resetMaterialForm =
    () => {
      setMaterialForm({
        projectId: "",
        materialName: "",
        quantity: "",
        unit: "",
        purpose: "",
        notes: "",
      });
    };

  const handleMaterialSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setSuccess("");

      if (
        !materialForm.projectId
      ) {
        setError(
          "Please select a project."
        );
        return;
      }

      if (
        !materialForm.materialName.trim()
      ) {
        setError(
          "Material name is required."
        );
        return;
      }

      if (
        !materialForm.quantity ||
        Number(
          materialForm.quantity
        ) <= 0
      ) {
        setError(
          "Quantity must be greater than zero."
        );
        return;
      }

      if (
        !materialForm.unit.trim()
      ) {
        setError(
          "Unit is required."
        );
        return;
      }

      const requestData = {
        materialName:
          materialForm.materialName.trim(),

        quantity:
          Number(
            materialForm.quantity
          ),

        unit:
          materialForm.unit.trim(),

        purpose:
          materialForm.purpose.trim(),

        notes:
          materialForm.notes.trim(),
      };

      try {
        setSubmittingRequest(
          true
        );

        await api.post(
          `/contractor/projects/${materialForm.projectId}/material-requests`,
          requestData
        );

        showSuccess(
          "Material request submitted successfully."
        );

        resetMaterialForm();

        await loadMaterialRequests();

        setActiveTab(
          "material-requests"
        );
      } catch (error) {
        console.error(
          "Material request submit error:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to submit material request."
          )
        );
      } finally {
        setSubmittingRequest(
          false
        );
      }
    };

  const handleLogout = () => {
    localStorage.removeItem(
      "isAuthenticated"
    );

    localStorage.removeItem(
      "username"
    );

    localStorage.removeItem(
      "role"
    );

    localStorage.removeItem(
      "token"
    );

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  const formatMoney = (
    value
  ) => {
    const amount =
      Number(
        value || 0
      );

    return new Intl.NumberFormat(
      "en-LK",
      {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
      }
    ).format(
      amount
    );
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(
      value
    ).toLocaleDateString(
      "en-LK"
    );
  };

  const getStatusStyle =
    (status) => {
      const normalized =
        String(
          status || ""
        ).toUpperCase();

      if (
        normalized ===
        "APPROVED"
      ) {
        return {
          background: "#dcfce7",
          color: "#166534",
        };
      }

      if (
        normalized ===
        "REJECTED"
      ) {
        return {
          background: "#fee2e2",
          color: "#991b1b",
        };
      }

      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    };

  const sidebarButtonStyle =
    (tabName) => ({
      width: "100%",
      textAlign: "left",
      border: "none",
      cursor: "pointer",
      padding:
        "12px 16px",
      borderRadius: "6px",
      marginBottom: "4px",
      fontSize: "14px",
      color: "#e5e7eb",
      background:
        activeTab ===
        tabName
          ? "#2563eb"
          : "transparent",
    });

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
        }}
      >
        Loading contractor
        portal...
      </div>
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <h2>
            CPMS
          </h2>

          <p>
            Contractor Portal
          </p>
        </div>

        <nav className="nav-menu">
          <button
            type="button"
            style={
              sidebarButtonStyle(
                "dashboard"
              )
            }
            onClick={() =>
              setActiveTab(
                "dashboard"
              )
            }
          >
            Dashboard
          </button>

          <button
            type="button"
            style={
              sidebarButtonStyle(
                "projects"
              )
            }
            onClick={() =>
              setActiveTab(
                "projects"
              )
            }
          >
            My Projects
          </button>

          <button
            type="button"
            style={
              sidebarButtonStyle(
                "material-requests"
              )
            }
            onClick={() =>
              setActiveTab(
                "material-requests"
              )
            }
          >
            Material Requests
          </button>

          <button
            type="button"
            style={
              sidebarButtonStyle(
                "bills"
              )
            }
            onClick={() =>
              setActiveTab(
                "bills"
              )
            }
          >
            My Bills
          </button>

          <button
            type="button"
            style={
              sidebarButtonStyle(
                "payments"
              )
            }
            onClick={() =>
              setActiveTab(
                "payments"
              )
            }
          >
            My Payments
          </button>

          <button
            type="button"
            style={
              sidebarButtonStyle(
                "profile"
              )
            }
            onClick={() =>
              setActiveTab(
                "profile"
              )
            }
          >
            My Profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="logged-user">
            <p>
              {username ||
                "Contractor"}
            </p>

            <span>
              CONTRACTOR
            </span>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {error && (
          <div
            className="login-error"
            style={{
              marginBottom:
                "20px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding:
                "12px 16px",
              marginBottom:
                "20px",
              background:
                "#dcfce7",
              color:
                "#166534",
              borderRadius:
                "6px",
            }}
          >
            {success}
          </div>
        )}

        {activeTab ===
          "dashboard" && (
          <>
            <div className="page-header">
              <div>
                <h1>
                  Contractor
                  Dashboard
                </h1>

                <p>
                  Welcome{" "}
                  {profile?.name ||
                    username}
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={
                  loadPortalData
                }
              >
                Refresh
              </button>
            </div>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",

                gap:
                  "20px",

                marginBottom:
                  "25px",
              }}
            >
              <div className="form-card">
                <h3>
                  Projects
                </h3>

                <h2>
                  {dashboard?.totalProjects ??
                    0}
                </h2>
              </div>

              <div className="form-card">
                <h3>
                  Total Bills
                </h3>

                <h2>
                  {dashboard?.totalBills ??
                    0}
                </h2>
              </div>

              <div className="form-card">
                <h3>
                  Pending Material
                  Requests
                </h3>

                <h2>
                  {
                    materialRequests.filter(
                      (request) =>
                        request.status ===
                        "PENDING"
                    ).length
                  }
                </h2>
              </div>

              <div className="form-card">
                <h3>
                  Unpaid Bills
                </h3>

                <h2>
                  {dashboard?.unpaidBills ??
                    0}
                </h2>
              </div>

              <div className="form-card">
                <h3>
                  Net Payable
                </h3>

                <h2>
                  {formatMoney(
                    dashboard?.totalNetPayable
                  )}
                </h2>
              </div>

              <div className="form-card">
                <h3>
                  Total Paid
                </h3>

                <h2>
                  {formatMoney(
                    dashboard?.totalPaid
                  )}
                </h2>
              </div>

              <div className="form-card">
                <h3>
                  Outstanding
                </h3>

                <h2>
                  {formatMoney(
                    dashboard?.outstandingBalance
                  )}
                </h2>
              </div>
            </div>

            <div className="table-card">
              <h2>
                Recent Bills
              </h2>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      Bill No.
                    </th>

                    <th>
                      Project
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Net Payable
                    </th>

                    <th>
                      Balance
                    </th>

                    <th>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bills.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="6"
                      >
                        No bills
                        available.
                      </td>
                    </tr>
                  ) : (
                    bills
                      .slice(
                        0,
                        5
                      )
                      .map(
                        (
                          bill
                        ) => (
                          <tr
                            key={
                              bill.id
                            }
                          >
                            <td>
                              {bill.billNumber ||
                                "-"}
                            </td>

                            <td>
                              {bill.projectName ||
                                "-"}
                            </td>

                            <td>
                              {formatDate(
                                bill.billDate
                              )}
                            </td>

                            <td>
                              {formatMoney(
                                bill.netPayable
                              )}
                            </td>

                            <td>
                              {formatMoney(
                                bill.balanceAmount
                              )}
                            </td>

                            <td>
                              {bill.status ||
                                "-"}
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

        {activeTab ===
          "projects" && (
          <>
            <div className="page-header">
              <div>
                <h1>
                  My Projects
                </h1>

                <p>
                  Projects assigned
                  to your contractor
                  account.
                </p>
              </div>
            </div>

            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      Project
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Start Date
                    </th>

                    <th>
                      End Date
                    </th>

                    <th>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {projects.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="5"
                      >
                        No projects
                        found.
                      </td>
                    </tr>
                  ) : (
                    projects.map(
                      (
                        project
                      ) => (
                        <tr
                          key={
                            project.id
                          }
                        >
                          <td>
                            {project.projectName ||
                              "-"}
                          </td>

                          <td>
                            {project.location ||
                              "-"}
                          </td>

                          <td>
                            {formatDate(
                              project.startDate
                            )}
                          </td>

                          <td>
                            {formatDate(
                              project.endDate
                            )}
                          </td>

                          <td>
                            {project.status ||
                              "-"}
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

        {activeTab ===
          "material-requests" && (
          <>
            <div className="page-header">
              <div>
                <h1>
                  Material Requests
                </h1>

                <p>
                  Request materials
                  required for your
                  assigned sites.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={
                  loadMaterialRequests
                }
              >
                Refresh
              </button>
            </div>

            <div className="form-card">
              <h2>
                New Material Request
              </h2>

              {projects.length ===
              0 ? (
                <p>
                  No project is
                  currently available
                  for this contractor.
                </p>
              ) : (
                <form
                  className="client-form"
                  onSubmit={
                    handleMaterialSubmit
                  }
                >
                  <select
                    name="projectId"
                    value={
                      materialForm.projectId
                    }
                    onChange={
                      handleMaterialChange
                    }
                  >
                    <option value="">
                      Select Project /
                      Site *
                    </option>

                    {projects.map(
                      (
                        project
                      ) => (
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

                  <input
                    type="text"
                    name="materialName"
                    placeholder="Material Name *"
                    value={
                      materialForm.materialName
                    }
                    onChange={
                      handleMaterialChange
                    }
                    maxLength="150"
                  />

                  <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity *"
                    value={
                      materialForm.quantity
                    }
                    onChange={
                      handleMaterialChange
                    }
                    min="0.01"
                    step="0.01"
                  />

                  <select
                    name="unit"
                    value={
                      materialForm.unit
                    }
                    onChange={
                      handleMaterialChange
                    }
                  >
                    <option value="">
                      Select Unit *
                    </option>

                    <option value="Nos">
                      Nos
                    </option>

                    <option value="Kg">
                      Kg
                    </option>

                    <option value="Bags">
                      Bags
                    </option>

                    <option value="Boxes">
                      Boxes
                    </option>

                    <option value="Lengths">
                      Lengths
                    </option>

                    <option value="Meters">
                      Meters
                    </option>

                    <option value="Sqft">
                      Sqft
                    </option>

                    <option value="Liters">
                      Liters
                    </option>

                    <option value="m3">
                      m³
                    </option>

                    <option value="Sets">
                      Sets
                    </option>
                  </select>

                  <input
                    type="text"
                    name="purpose"
                    placeholder="Purpose / Required For"
                    value={
                      materialForm.purpose
                    }
                    onChange={
                      handleMaterialChange
                    }
                    maxLength="500"
                  />

                  <textarea
                    name="notes"
                    placeholder="Additional Notes"
                    value={
                      materialForm.notes
                    }
                    onChange={
                      handleMaterialChange
                    }
                    rows="4"
                  />

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      submittingRequest
                    }
                  >
                    {submittingRequest
                      ? "Submitting..."
                      : "Submit Material Request"}
                  </button>
                </form>
              )}
            </div>

            <div className="table-card">
              <h2>
                My Material Requests
              </h2>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      Date
                    </th>

                    <th>
                      Project
                    </th>

                    <th>
                      Material
                    </th>

                    <th>
                      Quantity
                    </th>

                    <th>
                      Purpose
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Reviewed By
                    </th>

                    <th>
                      Remarks
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {materialRequests.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="8"
                      >
                        No material
                        requests found.
                      </td>
                    </tr>
                  ) : (
                    materialRequests.map(
                      (
                        request
                      ) => (
                        <tr
                          key={
                            request.id
                          }
                        >
                          <td>
                            {formatDate(
                              request.requestDate
                            )}
                          </td>

                          <td>
                            {request.project
                              ?.projectName ||
                              "-"}
                          </td>

                          <td>
                            {request.materialName ||
                              "-"}
                          </td>

                          <td>
                            {request.quantity}{" "}
                            {request.unit}
                          </td>

                          <td>
                            {request.purpose ||
                              "-"}
                          </td>

                          <td>
                            <span
                              style={{
                                ...getStatusStyle(
                                  request.status
                                ),
                                padding:
                                  "5px 10px",
                                borderRadius:
                                  "999px",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  "700",
                              }}
                            >
                              {request.status ||
                                "PENDING"}
                            </span>
                          </td>

                          <td>
                            {request.reviewedBy ||
                              "-"}
                          </td>

                          <td>
                            {request.reviewRemarks ||
                              "-"}
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

        {activeTab ===
          "bills" && (
          <>
            <div className="page-header">
              <div>
                <h1>
                  My Bills
                </h1>

                <p>
                  Bill values,
                  deductions and
                  outstanding
                  balances.
                </p>
              </div>
            </div>

            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      Bill No.
                    </th>

                    <th>
                      Project
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Work
                    </th>

                    <th>
                      Gross
                    </th>

                    <th>
                      Retention
                    </th>

                    <th>
                      Advance
                    </th>

                    <th>
                      Other
                    </th>

                    <th>
                      Net
                    </th>

                    <th>
                      Paid
                    </th>

                    <th>
                      Balance
                    </th>

                    <th>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bills.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="12"
                      >
                        No bills found.
                      </td>
                    </tr>
                  ) : (
                    bills.map(
                      (
                        bill
                      ) => (
                        <tr
                          key={
                            bill.id
                          }
                        >
                          <td>
                            {bill.billNumber ||
                              "-"}
                          </td>

                          <td>
                            {bill.projectName ||
                              "-"}
                          </td>

                          <td>
                            {formatDate(
                              bill.billDate
                            )}
                          </td>

                          <td>
                            {bill.workDescription ||
                              "-"}
                          </td>

                          <td>
                            {formatMoney(
                              bill.grossAmount
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              bill.retention
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              bill.advanceRecovery
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              bill.otherDeductions
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              bill.netPayable
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              bill.paidAmount
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              bill.balanceAmount
                            )}
                          </td>

                          <td>
                            {bill.status ||
                              "-"}
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

        {activeTab ===
          "payments" && (
          <>
            <div className="page-header">
              <div>
                <h1>
                  My Payments
                </h1>

                <p>
                  Payment history
                  recorded against
                  your contractor
                  account.
                </p>
              </div>
            </div>

            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      Date
                    </th>

                    <th>
                      Project
                    </th>

                    <th>
                      Bill
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Method
                    </th>

                    <th>
                      Reference
                    </th>

                    <th>
                      Notes
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payments.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="7"
                      >
                        No payments
                        found.
                      </td>
                    </tr>
                  ) : (
                    payments.map(
                      (
                        payment
                      ) => (
                        <tr
                          key={
                            payment.id
                          }
                        >
                          <td>
                            {formatDate(
                              payment.paymentDate
                            )}
                          </td>

                          <td>
                            {payment.projectName ||
                              "-"}
                          </td>

                          <td>
                            {payment.billNumber ||
                              "-"}
                          </td>

                          <td>
                            {formatMoney(
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
                            {payment.notes ||
                              "-"}
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

        {activeTab ===
          "profile" && (
          <>
            <div className="page-header">
              <div>
                <h1>
                  My Profile
                </h1>

                <p>
                  Contractor account
                  and payment
                  information.
                </p>
              </div>
            </div>

            <div className="form-card">
              <table className="data-table">
                <tbody>
                  <tr>
                    <th>
                      Name
                    </th>

                    <td>
                      {profile?.name ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Type
                    </th>

                    <td>
                      {profile?.type ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Trade
                    </th>

                    <td>
                      {profile?.tradeType ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Phone
                    </th>

                    <td>
                      {profile?.phone ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Address
                    </th>

                    <td>
                      {profile?.address ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      NIC /
                      Registration
                    </th>

                    <td>
                      {profile?.nicOrRegistrationNo ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Bank
                    </th>

                    <td>
                      {profile?.bankName ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Account Name
                    </th>

                    <td>
                      {profile?.bankAccountName ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Account Number
                    </th>

                    <td>
                      {profile?.bankAccountNumber ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Username
                    </th>

                    <td>
                      {profile?.username ||
                        username ||
                        "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ContractorPortal;