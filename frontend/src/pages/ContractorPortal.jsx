import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

import "../styles/contractor-portal-polish.css";

function ContractorPortal() {
  const navigate =
    useNavigate();

  const username =
    localStorage.getItem(
      "username"
    ) || "Contractor";

  const [
    currentTime,
    setCurrentTime,
  ] = useState(
    new Date()
  );

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

  const [documents, setDocuments] =
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

  const [
    downloadingDocumentId,
    setDownloadingDocumentId,
  ] = useState(null);

  const [
    downloadingPaymentId,
    setDownloadingPaymentId,
  ] = useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    materialForm,
    setMaterialForm,
  ] = useState({
    projectId: "",
    materialName: "",
    quantity: "",
    unit: "",
    purpose: "",
    notes: "",
  });

  useEffect(() => {
    loadPortalData();

    const timer =
      setInterval(
        () => {
          setCurrentTime(
            new Date()
          );
        },
        60000
      );

    return () => {
      clearInterval(timer);
    };
  }, []);

  const getGreeting = () => {
    const hour =
      currentTime.getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  };

  const getDisplayName = () => {
    return (
      profile?.name ||
      username
    );
  };

  const getInitial = () => {
    return getDisplayName()
      .charAt(0)
      .toUpperCase();
  };

  const getErrorMessage = (
    error,
    fallback
  ) => {
    const data =
      error.response?.data;

    if (
      typeof data ===
      "string"
    ) {
      return data;
    }

    return (
      data?.message ||
      fallback
    );
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
          documentsResponse,
        ] =
          await Promise.all([
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
            api.get(
              "/contractor/documents"
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

        setDocuments(
          Array.isArray(
            documentsResponse.data
          )
            ? documentsResponse.data
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
        setError("");

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
        setError(
          getErrorMessage(
            error,
            "Unable to load material requests."
          )
        );
      }
    };

  const loadDocuments =
    async () => {
      try {
        setError("");

        const response =
          await api.get(
            "/contractor/documents"
          );

        setDocuments(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to load project documents."
          )
        );
      }
    };

  const handleMaterialChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

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
    async (event) => {
      event.preventDefault();

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
        !materialForm
          .materialName
          .trim()
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

      try {
        setSubmittingRequest(
          true
        );

        await api.post(
          `/contractor/projects/${materialForm.projectId}/material-requests`,
          {
            materialName:
              materialForm
                .materialName
                .trim(),

            quantity:
              Number(
                materialForm.quantity
              ),

            unit:
              materialForm
                .unit
                .trim(),

            purpose:
              materialForm
                .purpose
                .trim(),

            notes:
              materialForm
                .notes
                .trim(),
          }
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

  const handleDocumentDownload =
    async (
      projectDocument
    ) => {
      try {
        setDownloadingDocumentId(
          projectDocument.id
        );

        setError("");

        const response =
          await api.get(
            `/contractor/documents/${projectDocument.id}/file`,
            {
              responseType:
                "blob",
            }
          );

        downloadBlob(
          response.data,
          projectDocument
            .originalFileName ||
            `project-document-${projectDocument.id}`
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to download document."
          )
        );
      } finally {
        setDownloadingDocumentId(
          null
        );
      }
    };

  const handlePaymentSlipDownload =
    async (payment) => {
      try {
        setDownloadingPaymentId(
          payment.id
        );

        setError("");

        const response =
          await api.get(
            `/contractor/payments/${payment.id}/slip`,
            {
              responseType:
                "blob",
            }
          );

        downloadBlob(
          response.data,
          payment.slipFileName ||
            `payment-slip-${payment.id}`
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to download payment slip."
          )
        );
      } finally {
        setDownloadingPaymentId(
          null
        );
      }
    };

  const downloadBlob = (
    data,
    fileName
  ) => {
    const blob =
      new Blob([data]);

    const blobUrl =
      window.URL.createObjectURL(
        blob
      );

    const link =
      window.document.createElement(
        "a"
      );

    link.href = blobUrl;
    link.download = fileName;

    window.document.body
      .appendChild(link);

    link.click();
    link.remove();

    window.URL.revokeObjectURL(
      blobUrl
    );
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
    return new Intl.NumberFormat(
      "en-LK",
      {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
      }
    ).format(
      Number(value || 0)
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
      "en-GB"
    );
  };

  const formatFileSize = (
    bytes
  ) => {
    const size =
      Number(bytes || 0);

    if (size <= 0) {
      return "-";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const getStatusClass = (
    status
  ) => {
    return String(
      status || "PENDING"
    )
      .toLowerCase()
      .replaceAll(
        "_",
        "-"
      );
  };

  const pendingRequests =
    materialRequests.filter(
      (request) =>
        String(
          request.status ||
            "PENDING"
        ).toUpperCase() ===
        "PENDING"
    ).length;

  const renderPageHeading = (
    eyebrow,
    title,
    description,
    action = null
  ) => (
    <div className="contractor-page-heading">
      <div>
        <span className="contractor-eyebrow">
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>
      </div>

      {action}
    </div>
  );

  if (loading) {
    return (
      <div className="contractor-full-loading">
        Loading contractor
        portal...
      </div>
    );
  }

  return (
    <div className="contractor-shell">
      <aside className="contractor-sidebar">
        <div className="contractor-brand">
          <div className="contractor-brand-mark">
            C
          </div>

          <div>
            <h2>
              CPMS
            </h2>

            <p>
              Contractor Portal
            </p>
          </div>
        </div>

        <div className="contractor-nav-label">
          Contractor Portal
        </div>

        <nav className="contractor-nav">
          {[
            [
              "dashboard",
              "DB",
              "Dashboard",
            ],
            [
              "projects",
              "PR",
              "My Projects",
            ],
            [
              "documents",
              "DC",
              "My Documents",
            ],
            [
              "material-requests",
              "MR",
              "Material Requests",
            ],
            [
              "bills",
              "BL",
              "My Bills",
            ],
            [
              "payments",
              "PY",
              "My Payments",
            ],
            [
              "profile",
              "PF",
              "My Profile",
            ],
          ].map(
            ([
              key,
              icon,
              label,
            ]) => (
              <button
                key={key}
                type="button"
                className={
                  activeTab === key
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActiveTab(key);
                  setError("");
                }}
              >
                <span className="contractor-nav-icon">
                  {icon}
                </span>

                {label}

                {key ===
                  "material-requests" &&
                  pendingRequests >
                    0 && (
                    <span className="contractor-nav-badge">
                      {
                        pendingRequests
                      }
                    </span>
                  )}
              </button>
            )
          )}
        </nav>

        <div className="contractor-sidebar-footer">
          <button
            type="button"
            className="contractor-user-card"
            onClick={() =>
              setActiveTab(
                "profile"
              )
            }
          >
            <div className="contractor-user-avatar">
              {getInitial()}
            </div>

            <div>
              <strong>
                {getDisplayName()}
              </strong>

              <span>
                CONTRACTOR
              </span>
            </div>
          </button>

          <button
            type="button"
            className="contractor-signout"
            onClick={
              handleLogout
            }
          >
            <span>
              Sign Out
            </span>

            <span>→</span>
          </button>
        </div>
      </aside>

      <main className="contractor-main">
        <header className="contractor-topbar">
          <div>
            <p className="contractor-greeting">
              {getGreeting()},
            </p>

            <h1>
              {getDisplayName()}
            </h1>

            <p className="contractor-topbar-subtitle">
              View projects,
              payments and site
              information.
            </p>
          </div>

          <button
            type="button"
            className="contractor-refresh-button"
            onClick={
              loadPortalData
            }
          >
            Refresh Data
          </button>
        </header>

        {error && (
          <div className="contractor-alert contractor-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="contractor-alert contractor-alert-success">
            {success}
          </div>
        )}

        {activeTab ===
          "dashboard" && (
          <div className="contractor-page">
            {renderPageHeading(
              "Overview",
              "Contractor Dashboard",
              "Financial and project overview for your contractor account."
            )}

            <div className="contractor-kpi-grid">
              <div className="contractor-kpi-card">
                <span>
                  Projects
                </span>

                <strong>
                  {dashboard?.totalProjects ??
                    0}
                </strong>

                <small>
                  Assigned projects
                </small>
              </div>

              <div className="contractor-kpi-card">
                <span>
                  Total Bills
                </span>

                <strong>
                  {dashboard?.totalBills ??
                    0}
                </strong>

                <small>
                  Recorded bills
                </small>
              </div>

              <div className="contractor-kpi-card">
                <span>
                  Unpaid Bills
                </span>

                <strong>
                  {dashboard?.unpaidBills ??
                    0}
                </strong>

                <small>
                  Bills outstanding
                </small>
              </div>

              <div className="contractor-kpi-card">
                <span>
                  Pending Requests
                </span>

                <strong>
                  {pendingRequests}
                </strong>

                <small>
                  Material requests
                </small>
              </div>
            </div>

            <div className="contractor-finance-grid">
              <div className="contractor-finance-card">
                <span>
                  Net Payable
                </span>

                <strong>
                  {formatMoney(
                    dashboard
                      ?.totalNetPayable
                  )}
                </strong>
              </div>

              <div className="contractor-finance-card paid">
                <span>
                  Total Paid
                </span>

                <strong>
                  {formatMoney(
                    dashboard
                      ?.totalPaid
                  )}
                </strong>
              </div>

              <div className="contractor-finance-card outstanding">
                <span>
                  Outstanding
                </span>

                <strong>
                  {formatMoney(
                    dashboard
                      ?.outstandingBalance
                  )}
                </strong>
              </div>
            </div>

            <section className="contractor-card">
              <div className="contractor-card-heading">
                <div>
                  <h3>
                    Recent Bills
                  </h3>

                  <p>
                    Latest bill and
                    outstanding
                    information.
                  </p>
                </div>
              </div>

              <div className="contractor-table-scroll">
                <table className="contractor-table">
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
                          className="contractor-empty-cell"
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
                          (bill) => (
                            <tr
                              key={
                                bill.id
                              }
                            >
                              <td>
                                <strong>
                                  {bill.billNumber ||
                                    "-"}
                                </strong>
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
                                <span
                                  className={`contractor-status ${getStatusClass(
                                    bill.status
                                  )}`}
                                >
                                  {bill.status ||
                                    "-"}
                                </span>
                              </td>
                            </tr>
                          )
                        )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab ===
          "projects" && (
          <div className="contractor-page">
            {renderPageHeading(
              "Projects",
              "My Projects",
              "Projects currently assigned to your contractor account."
            )}

            <section className="contractor-card">
              <div className="contractor-table-scroll">
                <table className="contractor-table">
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
                          className="contractor-empty-cell"
                        >
                          No projects
                          found.
                        </td>
                      </tr>
                    ) : (
                      projects.map(
                        (project) => (
                          <tr
                            key={
                              project.id
                            }
                          >
                            <td>
                              <strong>
                                {project.projectName ||
                                  "-"}
                              </strong>
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
                              <span
                                className={`contractor-status ${getStatusClass(
                                  project.status
                                )}`}
                              >
                                {project.status ||
                                  "-"}
                              </span>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab ===
          "documents" && (
          <div className="contractor-page">
            {renderPageHeading(
              "Project Files",
              "My Documents",
              "Drawings, approvals, reports and documents shared with you.",
              <button
                type="button"
                className="contractor-secondary-button"
                onClick={
                  loadDocuments
                }
              >
                Refresh
              </button>
            )}

            <section className="contractor-card">
              <div className="contractor-table-scroll">
                <table className="contractor-table contractor-wide-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>
                        Project
                      </th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>File</th>
                      <th>Size</th>
                      <th>
                        Description
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {documents.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="contractor-empty-cell"
                        >
                          No documents
                          have been
                          shared with
                          you.
                        </td>
                      </tr>
                    ) : (
                      documents.map(
                        (
                          document
                        ) => (
                          <tr
                            key={
                              document.id
                            }
                          >
                            <td>
                              {formatDate(
                                document.documentDate
                              )}
                            </td>

                            <td>
                              {document.projectName ||
                                "-"}
                            </td>

                            <td>
                              <strong>
                                {document.title ||
                                  "-"}
                              </strong>
                            </td>

                            <td>
                              <span className="contractor-file-type">
                                {document.documentType ||
                                  "OTHER"}
                              </span>
                            </td>

                            <td>
                              {document.originalFileName ||
                                "-"}
                            </td>

                            <td>
                              {formatFileSize(
                                document.fileSize
                              )}
                            </td>

                            <td>
                              {document.description ||
                                "-"}
                            </td>

                            <td>
                              <button
                                type="button"
                                className="contractor-download-button"
                                disabled={
                                  downloadingDocumentId ===
                                  document.id
                                }
                                onClick={() =>
                                  handleDocumentDownload(
                                    document
                                  )
                                }
                              >
                                {downloadingDocumentId ===
                                document.id
                                  ? "Downloading..."
                                  : "Download"}
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab ===
          "material-requests" && (
          <div className="contractor-page">
            {renderPageHeading(
              "Site Procurement",
              "Material Requests",
              "Request materials needed for your assigned construction sites.",
              <button
                type="button"
                className="contractor-secondary-button"
                onClick={
                  loadMaterialRequests
                }
              >
                Refresh
              </button>
            )}

            <section className="contractor-card">
              <div className="contractor-card-heading">
                <div>
                  <h3>
                    New Material
                    Request
                  </h3>

                  <p>
                    Submit a new
                    requirement for
                    an assigned site.
                  </p>
                </div>
              </div>

              <form
                className="contractor-form"
                onSubmit={
                  handleMaterialSubmit
                }
              >
                <div className="contractor-form-grid">
                  <div className="contractor-field">
                    <label>
                      Project *
                    </label>

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
                        Select project
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
                  </div>

                  <div className="contractor-field">
                    <label>
                      Material *
                    </label>

                    <input
                      type="text"
                      name="materialName"
                      value={
                        materialForm.materialName
                      }
                      onChange={
                        handleMaterialChange
                      }
                      placeholder="Example: Cement"
                    />
                  </div>

                  <div className="contractor-field">
                    <label>
                      Quantity *
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      min="0.01"
                      step="0.01"
                      value={
                        materialForm.quantity
                      }
                      onChange={
                        handleMaterialChange
                      }
                    />
                  </div>

                  <div className="contractor-field">
                    <label>
                      Unit *
                    </label>

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
                        Select unit
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
                  </div>
                </div>

                <div className="contractor-form-grid contractor-form-grid-two">
                  <div className="contractor-field">
                    <label>
                      Purpose
                    </label>

                    <input
                      type="text"
                      name="purpose"
                      value={
                        materialForm.purpose
                      }
                      onChange={
                        handleMaterialChange
                      }
                      placeholder="Required for..."
                    />
                  </div>

                  <div className="contractor-field">
                    <label>
                      Notes
                    </label>

                    <textarea
                      name="notes"
                      value={
                        materialForm.notes
                      }
                      onChange={
                        handleMaterialChange
                      }
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="contractor-form-actions">
                  <button
                    type="submit"
                    className="contractor-primary-button"
                    disabled={
                      submittingRequest
                    }
                  >
                    {submittingRequest
                      ? "Submitting..."
                      : "Submit Material Request"}
                  </button>
                </div>
              </form>
            </section>

            <section className="contractor-card">
              <div className="contractor-card-heading">
                <div>
                  <h3>
                    Request History
                  </h3>

                  <p>
                    Approval status
                    of submitted
                    requests.
                  </p>
                </div>
              </div>

              <div className="contractor-table-scroll">
                <table className="contractor-table contractor-wide-table">
                  <thead>
                    <tr>
                      <th>Date</th>
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
                      <th>Status</th>
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
                          className="contractor-empty-cell"
                        >
                          No material
                          requests.
                        </td>
                      </tr>
                    ) : (
                      materialRequests.map(
                        (request) => (
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
                                request.projectName ||
                                "-"}
                            </td>

                            <td>
                              <strong>
                                {request.materialName ||
                                  "-"}
                              </strong>
                            </td>

                            <td>
                              {request.quantity}{" "}
                              {
                                request.unit
                              }
                            </td>

                            <td>
                              {request.purpose ||
                                "-"}
                            </td>

                            <td>
                              <span
                                className={`contractor-status ${getStatusClass(
                                  request.status
                                )}`}
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
            </section>
          </div>
        )}

        {activeTab ===
          "bills" && (
          <div className="contractor-page">
            {renderPageHeading(
              "Finance",
              "My Bills",
              "Bill values, deductions, paid amounts and outstanding balances."
            )}

            <section className="contractor-card">
              <div className="contractor-table-scroll">
                <table className="contractor-table contractor-bill-table">
                  <thead>
                    <tr>
                      <th>
                        Bill No.
                      </th>
                      <th>
                        Project
                      </th>
                      <th>Date</th>
                      <th>Work</th>
                      <th>Gross</th>
                      <th>
                        Retention
                      </th>
                      <th>
                        Advance
                      </th>
                      <th>Other</th>
                      <th>Net</th>
                      <th>Paid</th>
                      <th>
                        Balance
                      </th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bills.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan="12"
                          className="contractor-empty-cell"
                        >
                          No bills
                          found.
                        </td>
                      </tr>
                    ) : (
                      bills.map(
                        (bill) => (
                          <tr
                            key={
                              bill.id
                            }
                          >
                            <td>
                              <strong>
                                {bill.billNumber ||
                                  "-"}
                              </strong>
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
                              <strong>
                                {formatMoney(
                                  bill.balanceAmount
                                )}
                              </strong>
                            </td>
                            <td>
                              <span
                                className={`contractor-status ${getStatusClass(
                                  bill.status
                                )}`}
                              >
                                {bill.status ||
                                  "-"}
                              </span>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab ===
          "payments" && (
          <div className="contractor-page">
            {renderPageHeading(
              "Finance",
              "My Payments",
              "Payment history and secure payment slip downloads."
            )}

            <section className="contractor-card">
              <div className="contractor-table-scroll">
                <table className="contractor-table contractor-wide-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>
                        Project
                      </th>
                      <th>Bill</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>
                        Reference
                      </th>
                      <th>Notes</th>
                      <th>Slip</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="contractor-empty-cell"
                        >
                          No payments
                          found.
                        </td>
                      </tr>
                    ) : (
                      payments.map(
                        (payment) => (
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
                              <strong className="contractor-money-positive">
                                {formatMoney(
                                  payment.amount
                                )}
                              </strong>
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
                            <td>
                              {payment.slipFileName ? (
                                <button
                                  type="button"
                                  className="contractor-download-button"
                                  disabled={
                                    downloadingPaymentId ===
                                    payment.id
                                  }
                                  onClick={() =>
                                    handlePaymentSlipDownload(
                                      payment
                                    )
                                  }
                                >
                                  {downloadingPaymentId ===
                                  payment.id
                                    ? "Downloading..."
                                    : "Download Slip"}
                                </button>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab ===
          "profile" && (
          <div className="contractor-page">
            {renderPageHeading(
              "Account",
              "My Profile",
              "Contractor business, contact and payment information."
            )}

            <div className="contractor-profile-grid">
              <section className="contractor-card contractor-profile-summary">
                <div className="contractor-profile-avatar">
                  {getInitial()}
                </div>

                <h3>
                  {profile?.name ||
                    username}
                </h3>

                <span>
                  CONTRACTOR
                </span>

                <p>
                  {profile?.tradeType ||
                    profile?.type ||
                    "Construction Contractor"}
                </p>
              </section>

              <section className="contractor-card">
                <div className="contractor-profile-details">
                  {[
                    [
                      "Name",
                      profile?.name,
                    ],
                    [
                      "Type",
                      profile?.type,
                    ],
                    [
                      "Trade",
                      profile?.tradeType,
                    ],
                    [
                      "Phone",
                      profile?.phone,
                    ],
                    [
                      "Address",
                      profile?.address,
                    ],
                    [
                      "NIC / Registration",
                      profile?.nicOrRegistrationNo,
                    ],
                    [
                      "Bank",
                      profile?.bankName,
                    ],
                    [
                      "Account Name",
                      profile?.bankAccountName,
                    ],
                    [
                      "Account Number",
                      profile?.bankAccountNumber,
                    ],
                    [
                      "Username",
                      profile?.username ||
                        username,
                    ],
                  ].map(
                    ([
                      label,
                      value,
                    ]) => (
                      <div
                        key={
                          label
                        }
                      >
                        <span>
                          {label}
                        </span>

                        <strong>
                          {value ||
                            "-"}
                        </strong>
                      </div>
                    )
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ContractorPortal;