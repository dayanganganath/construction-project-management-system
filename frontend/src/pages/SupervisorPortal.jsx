import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

function SupervisorPortal() {
  const navigate =
    useNavigate();

  const [projects, setProjects] =
    useState([]);

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState("");

  const [
    selectedProject,
    setSelectedProject,
  ] = useState(null);

  const [
    progressHistory,
    setProgressHistory,
  ] = useState([]);

  const [
    materialRequests,
    setMaterialRequests,
  ] = useState([]);

  const [
    documents,
    setDocuments,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    loadingProject,
    setLoadingProject,
  ] = useState(false);

  const [
    savingProgress,
    setSavingProgress,
  ] = useState(false);

  const [
    savingMaterial,
    setSavingMaterial,
  ] = useState(false);

  const [
    savingDocument,
    setSavingDocument,
  ] = useState(false);

  const [
    downloadingDocumentId,
    setDownloadingDocumentId,
  ] = useState(null);

  const [
    activeSection,
    setActiveSection,
  ] = useState("dashboard");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const username =
    localStorage.getItem(
      "username"
    );

  const role =
    localStorage.getItem(
      "role"
    );

  const getToday = () => {
    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      );

    return `${year}-${month}-${day}`;
  };

  const initialProgressForm = {
    date: getToday(),
    workDescription: "",
    progressPercentage: "",
    workersCount: "",
    remarks: "",
    tomorrowPlan: "",
    issuesBlockers: "",
  };

  const initialMaterialForm = {
    requestDate: getToday(),
    materialName: "",
    quantity: "",
    unit: "",
    purpose: "",
    notes: "",
  };

  const initialDocumentForm = {
    title: "",
    description: "",
    documentType: "DRAWING",
    file: null,
  };

  const [
    progressForm,
    setProgressForm,
  ] = useState(
    initialProgressForm
  );

  const [
    materialForm,
    setMaterialForm,
  ] = useState(
    initialMaterialForm
  );

  const [
    documentForm,
    setDocumentForm,
  ] = useState(
    initialDocumentForm
  );

  useEffect(() => {
    loadProjects();
  }, []);

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

    if (
      data?.message
    ) {
      return data.message;
    }

    if (
      data?.error
    ) {
      return data.error;
    }

    return fallback;
  };

  const showSuccess = (
    message
  ) => {
    setSuccess(
      message
    );

    setTimeout(() => {
      setSuccess("");
    }, 4000);
  };

  const loadProjects =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/supervisor/projects"
          );

        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        setProjects(
          data
        );

        if (
          data.length > 0
        ) {
          const firstProjectId =
            data[0].projectId;

          setSelectedProjectId(
            String(
              firstProjectId
            )
          );

          setSelectedProject(
            data[0]
          );

          await Promise.all([
            loadProgressHistory(
              firstProjectId
            ),

            loadMaterialRequests(
              firstProjectId
            ),

            loadDocuments(
              firstProjectId
            ),
          ]);
        } else {
          setSelectedProject(
            null
          );

          setProgressHistory(
            []
          );

          setMaterialRequests(
            []
          );

          setDocuments(
            []
          );
        }
      } catch (error) {
        console.error(
          "Error loading supervisor projects:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load assigned sites."
          )
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  const loadProject =
    async (
      projectId
    ) => {
      if (
        !projectId
      ) {
        setSelectedProject(
          null
        );

        setProgressHistory(
          []
        );

        setMaterialRequests(
          []
        );

        setDocuments(
          []
        );

        return;
      }

      try {
        setLoadingProject(
          true
        );

        setError("");

        const response =
          await api.get(
            `/supervisor/projects/${projectId}`
          );

        setSelectedProject(
          response.data
        );

        await Promise.all([
          loadProgressHistory(
            projectId
          ),

          loadMaterialRequests(
            projectId
          ),

          loadDocuments(
            projectId
          ),
        ]);
      } catch (error) {
        console.error(
          "Error loading project:",
          error
        );

        setSelectedProject(
          null
        );

        setProgressHistory(
          []
        );

        setMaterialRequests(
          []
        );

        setDocuments(
          []
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load site details."
          )
        );
      } finally {
        setLoadingProject(
          false
        );
      }
    };

  const loadProgressHistory =
    async (
      projectId
    ) => {
      try {
        const response =
          await api.get(
            `/supervisor/projects/${projectId}/progress`
          );

        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        const sortedData =
          [
            ...data,
          ].sort(
            (
              a,
              b
            ) => {
              const dateCompare =
                new Date(
                  b.date
                ) -
                new Date(
                  a.date
                );

              if (
                dateCompare !==
                0
              ) {
                return dateCompare;
              }

              return (
                Number(
                  b.id ||
                    0
                ) -
                Number(
                  a.id ||
                    0
                )
              );
            }
          );

        setProgressHistory(
          sortedData
        );
      } catch (error) {
        console.error(
          "Error loading progress history:",
          error
        );

        setProgressHistory(
          []
        );
      }
    };

  const loadMaterialRequests =
    async (
      projectId
    ) => {
      try {
        const response =
          await api.get(
            `/supervisor/projects/${projectId}/material-requests`
          );

        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        const sortedData =
          [
            ...data,
          ].sort(
            (
              a,
              b
            ) => {
              const dateCompare =
                String(
                  b.requestDate ||
                    ""
                ).localeCompare(
                  String(
                    a.requestDate ||
                      ""
                  )
                );

              if (
                dateCompare !==
                  0
              ) {
                return dateCompare;
              }

              return (
                Number(
                  b.id ||
                    0
                ) -
                Number(
                  a.id ||
                    0
                )
              );
            }
          );

        setMaterialRequests(
          sortedData
        );
      } catch (error) {
        console.error(
          "Error loading material requests:",
          error
        );

        setMaterialRequests(
          []
        );
      }
    };

  const loadDocuments =
    async (
      projectId
    ) => {
      try {
        const response =
          await api.get(
            `/supervisor/projects/${projectId}/documents`
          );

        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        const sortedData =
          [
            ...data,
          ].sort(
            (
              a,
              b
            ) => {
              const dateCompare =
                String(
                  b.documentDate ||
                    ""
                ).localeCompare(
                  String(
                    a.documentDate ||
                      ""
                  )
                );

              if (
                dateCompare !==
                  0
              ) {
                return dateCompare;
              }

              return (
                Number(
                  b.id ||
                    0
                ) -
                Number(
                  a.id ||
                    0
                )
              );
            }
          );

        setDocuments(
          sortedData
        );
      } catch (error) {
        console.error(
          "Error loading documents:",
          error
        );

        setDocuments(
          []
        );
      }
    };

  const handleProjectChange =
    async (
      e
    ) => {
      const projectId =
        e.target.value;

      setSelectedProjectId(
        projectId
      );

      setSuccess("");
      setError("");

      await loadProject(
        projectId
      );
    };

  const handleProgressChange =
    (
      e
    ) => {
      const {
        name,
        value,
      } =
        e.target;

      setProgressForm(
        (
          previous
        ) => ({
          ...previous,
          [name]:
            value,
        })
      );

      setError("");
      setSuccess("");
    };

  const handleMaterialChange =
    (
      e
    ) => {
      const {
        name,
        value,
      } =
        e.target;

      setMaterialForm(
        (
          previous
        ) => ({
          ...previous,
          [name]:
            value,
        })
      );

      setError("");
      setSuccess("");
    };

  const handleDocumentChange =
    (
      e
    ) => {
      const {
        name,
        value,
        files,
      } =
        e.target;

      if (
        name ===
        "file"
      ) {
        setDocumentForm(
          (
            previous
          ) => ({
            ...previous,
            file:
              files?.[0] ||
              null,
          })
        );
      } else {
        setDocumentForm(
          (
            previous
          ) => ({
            ...previous,
            [name]:
              value,
          })
        );
      }

      setError("");
      setSuccess("");
    };

  const validateProgressForm =
    () => {
      if (
        !selectedProjectId
      ) {
        return "Please select a project.";
      }

      if (
        !progressForm.date
      ) {
        return "Date is required.";
      }

      if (
        !progressForm
          .workDescription
          .trim()
      ) {
        return "Today's work description is required.";
      }

      const progress =
        Number(
          progressForm
            .progressPercentage
        );

      if (
        progressForm
          .progressPercentage ===
        ""
      ) {
        return "Progress percentage is required.";
      }

      if (
        Number.isNaN(
          progress
        ) ||
        progress < 0 ||
        progress > 100
      ) {
        return "Progress percentage must be between 0 and 100.";
      }

      const workers =
        Number(
          progressForm
            .workersCount
        );

      if (
        progressForm
          .workersCount ===
        ""
      ) {
        return "Workers count is required.";
      }

      if (
        Number.isNaN(
          workers
        ) ||
        workers < 0
      ) {
        return "Workers count cannot be negative.";
      }

      return null;
    };

  const validateMaterialForm =
    () => {
      if (
        !selectedProjectId
      ) {
        return "Please select a project.";
      }

      if (
        !materialForm
          .requestDate
      ) {
        return "Request date is required.";
      }

      if (
        !materialForm
          .materialName
          .trim()
      ) {
        return "Material name is required.";
      }

      const quantity =
        Number(
          materialForm.quantity
        );

      if (
        materialForm.quantity ===
          "" ||
        Number.isNaN(
          quantity
        ) ||
        quantity <= 0
      ) {
        return "Quantity must be greater than zero.";
      }

      if (
        !materialForm.unit
          .trim()
      ) {
        return "Unit is required.";
      }

      return null;
    };

  const validateDocumentForm =
    () => {
      if (
        !selectedProjectId
      ) {
        return "Please select a project.";
      }

      if (
        !documentForm.title
          .trim()
      ) {
        return "Document title is required.";
      }

      if (
        !documentForm
          .documentType
      ) {
        return "Document type is required.";
      }

      if (
        !documentForm.file
      ) {
        return "Please select a file.";
      }

      const maxSize =
        25 *
        1024 *
        1024;

      if (
        documentForm.file
          .size >
        maxSize
      ) {
        return "File size must be 25 MB or less.";
      }

      return null;
    };

  const handleProgressSubmit =
    async (
      e
    ) => {
      e.preventDefault();

      const validationError =
        validateProgressForm();

      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }

      try {
        setSavingProgress(
          true
        );

        setError("");
        setSuccess("");

        const payload = {
          date:
            progressForm.date,

          workDescription:
            progressForm
              .workDescription
              .trim(),

          progressPercentage:
            Number(
              progressForm
                .progressPercentage
            ),

          workersCount:
            Number(
              progressForm
                .workersCount
            ),

          remarks:
            progressForm
              .remarks
              .trim(),

          tomorrowPlan:
            progressForm
              .tomorrowPlan
              .trim(),

          issuesBlockers:
            progressForm
              .issuesBlockers
              .trim(),
        };

        await api.post(
          `/supervisor/projects/${selectedProjectId}/progress`,
          payload
        );

        showSuccess(
          "Daily progress saved successfully."
        );

        setProgressForm({
          ...initialProgressForm,
          date:
            getToday(),
        });

        await loadProject(
          selectedProjectId
        );
      } catch (error) {
        console.error(
          "Error saving progress:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to save daily progress."
          )
        );
      } finally {
        setSavingProgress(
          false
        );
      }
    };

  const handleMaterialSubmit =
    async (
      e
    ) => {
      e.preventDefault();

      const validationError =
        validateMaterialForm();

      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }

      const payload = {
        requestDate:
          materialForm
            .requestDate,

        materialName:
          materialForm
            .materialName
            .trim(),

        quantity:
          Number(
            materialForm
              .quantity
          ),

        unit:
          materialForm
            .unit
            .trim(),

        purpose:
          materialForm
            .purpose
            .trim() ||
          null,

        notes:
          materialForm
            .notes
            .trim() ||
          null,
      };

      try {
        setSavingMaterial(
          true
        );

        setError("");
        setSuccess("");

        await api.post(
          `/supervisor/projects/${selectedProjectId}/material-requests`,
          payload
        );

        showSuccess(
          "Material request submitted successfully."
        );

        setMaterialForm({
          ...initialMaterialForm,
          requestDate:
            getToday(),
        });

        await loadMaterialRequests(
          selectedProjectId
        );
      } catch (error) {
        console.error(
          "Error saving material request:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to submit material request."
          )
        );
      } finally {
        setSavingMaterial(
          false
        );
      }
    };

  const handleDocumentSubmit =
    async (
      e
    ) => {
      e.preventDefault();

      const validationError =
        validateDocumentForm();

      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }

      try {
        setSavingDocument(
          true
        );

        setError("");
        setSuccess("");

        const formData =
          new FormData();

        formData.append(
          "title",
          documentForm.title
            .trim()
        );

        formData.append(
          "description",
          documentForm.description
            .trim()
        );

        formData.append(
          "documentType",
          documentForm.documentType
        );

        formData.append(
          "file",
          documentForm.file
        );

        await api.post(
          `/supervisor/projects/${selectedProjectId}/documents`,
          formData
        );

        showSuccess(
          "Project document uploaded successfully."
        );

        setDocumentForm({
          ...initialDocumentForm,
        });

        const fileInput =
          window.document.getElementById(
            "supervisor-document-file"
          );

        if (
          fileInput
        ) {
          fileInput.value =
            "";
        }

        await loadDocuments(
          selectedProjectId
        );
      } catch (error) {
        console.error(
          "Error uploading document:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to upload project document."
          )
        );
      } finally {
        setSavingDocument(
          false
        );
      }
    };

  const downloadDocument =
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
            `/supervisor/projects/${selectedProjectId}/documents/${projectDocument.id}/file`,
            {
              responseType:
                "blob",
            }
          );

        const blob =
          new Blob([
            response.data,
          ]);

        const url =
          window.URL
            .createObjectURL(
              blob
            );

        const link =
          window.document
            .createElement(
              "a"
            );

        link.href =
          url;

        link.download =
          projectDocument
            .originalFileName ||
          `document-${projectDocument.id}`;

        window.document.body
          .appendChild(
            link
          );

        link.click();

        link.remove();

        window.URL
          .revokeObjectURL(
            url
          );
      } catch (error) {
        console.error(
          "Error downloading document:",
          error
        );

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

  const handleLogout =
    () => {
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
          replace:
            true,
        }
      );
    };

  const formatDate =
    (
      value
    ) => {
      if (
        !value
      ) {
        return "-";
      }

      return new Date(
        `${value}T00:00:00`
      ).toLocaleDateString(
        "en-LK"
      );
    };

  const formatFileSize =
    (
      bytes
    ) => {
      const size =
        Number(
          bytes ||
            0
        );

      if (
        size <=
        0
      ) {
        return "-";
      }

      if (
        size <
        1024
      ) {
        return `${size} B`;
      }

      if (
        size <
        1024 *
          1024
      ) {
        return `${(
          size /
          1024
        ).toFixed(
          1
        )} KB`;
      }

      return `${(
        size /
        (1024 *
          1024)
      ).toFixed(
        1
      )} MB`;
    };

  const getStatusLabel =
    (
      status
    ) => {
      if (
        status ===
        "APPROVED"
      ) {
        return "Approved";
      }

      if (
        status ===
        "REJECTED"
      ) {
        return "Rejected";
      }

      return "Pending";
    };

  const menuButtonStyle =
    (
      section
    ) => ({
      width: "100%",
      textAlign:
        "left",
      border:
        "none",
      borderRadius:
        "6px",
      padding:
        "12px 16px",
      marginBottom:
        "5px",
      cursor:
        "pointer",
      color:
        "#e5e7eb",
      background:
        activeSection ===
        section
          ? "#2563eb"
          : "transparent",
    });

  if (
    loading
  ) {
    return (
      <div className="dashboard-loading">
        Loading supervisor
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
            Construction
            Management
          </p>
        </div>

        <nav className="nav-menu">
          <NavLink
            to="/supervisor"
            end
            style={{
              display:
                "none",
            }}
          >
            Dashboard
          </NavLink>

          <button
            type="button"
            style={
              menuButtonStyle(
                "dashboard"
              )
            }
            onClick={() =>
              setActiveSection(
                "dashboard"
              )
            }
          >
            Dashboard
          </button>

          <button
            type="button"
            style={
              menuButtonStyle(
                "progress"
              )
            }
            onClick={() =>
              setActiveSection(
                "progress"
              )
            }
          >
            Daily Progress
          </button>

          <button
            type="button"
            style={
              menuButtonStyle(
                "materials"
              )
            }
            onClick={() =>
              setActiveSection(
                "materials"
              )
            }
          >
            Material Requests
          </button>

          <button
            type="button"
            style={
              menuButtonStyle(
                "documents"
              )
            }
            onClick={() =>
              setActiveSection(
                "documents"
              )
            }
          >
            Project Documents
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="logged-user">
            <p>
              {username ||
                "Supervisor"}
            </p>

            <span>
              {role ||
                "SUPERVISOR"}
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
        <div className="dashboard-header">
          <div>
            <h1>
              Supervisor
              Dashboard
            </h1>

            <p>
              Manage assigned
              sites, progress,
              material requests
              and project
              documents.
            </p>
          </div>

          {projects.length >
            0 && (
            <select
              className="project-filter"
              value={
                selectedProjectId
              }
              onChange={
                handleProjectChange
              }
            >
              {projects.map(
                (
                  project
                ) => (
                  <option
                    key={
                      project.projectId
                    }
                    value={
                      project.projectId
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
          )}
        </div>

        {error && (
          <div
            className="alert alert-error"
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
            className="alert alert-success"
            style={{
              marginBottom:
                "20px",
            }}
          >
            {success}
          </div>
        )}

        {projects.length ===
        0 ? (
          <div className="form-card">
            <h2>
              No Assigned
              Projects
            </h2>

            <p>
              No project is
              currently assigned
              to your supervisor
              account.
            </p>
          </div>
        ) : loadingProject ? (
          <div className="form-card">
            Loading project...
          </div>
        ) : (
          <>
            {activeSection ===
              "dashboard" && (
              <>
                <div
                  className="dashboard-grid"
                  style={{
                    marginBottom:
                      "24px",
                  }}
                >
                  <div className="dashboard-card blue">
                    <p>
                      Project
                    </p>

                    <h2>
                      {selectedProject
                        ?.projectName ||
                        "-"}
                    </h2>
                  </div>

                  <div className="dashboard-card green">
                    <p>
                      Progress
                    </p>

                    <h2>
                      {selectedProject
                        ?.latestProgressPercentage ??
                        0}
                      %
                    </h2>
                  </div>

                  <div className="dashboard-card orange">
                    <p>
                      Workers
                    </p>

                    <h2>
                      {selectedProject
                        ?.latestWorkersCount ??
                        0}
                    </h2>
                  </div>

                  <div className="dashboard-card blue">
                    <p>
                      Documents
                    </p>

                    <h2>
                      {
                        documents.length
                      }
                    </h2>
                  </div>
                </div>

                <div className="form-card">
                  <h2>
                    Site Overview
                  </h2>

                  <table className="data-table">
                    <tbody>
                      <tr>
                        <th>
                          Project
                        </th>

                        <td>
                          {selectedProject
                            ?.projectName ||
                            "-"}
                        </td>
                      </tr>

                      <tr>
                        <th>
                          Location
                        </th>

                        <td>
                          {selectedProject
                            ?.location ||
                            "-"}
                        </td>
                      </tr>

                      <tr>
                        <th>
                          Status
                        </th>

                        <td>
                          {selectedProject
                            ?.status ||
                            "-"}
                        </td>
                      </tr>

                      <tr>
                        <th>
                          Start Date
                        </th>

                        <td>
                          {formatDate(
                            selectedProject
                              ?.startDate
                          )}
                        </td>
                      </tr>

                      <tr>
                        <th>
                          End Date
                        </th>

                        <td>
                          {formatDate(
                            selectedProject
                              ?.endDate
                          )}
                        </td>
                      </tr>

                      <tr>
                        <th>
                          Latest Work
                        </th>

                        <td>
                          {selectedProject
                            ?.latestWorkDescription ||
                            "-"}
                        </td>
                      </tr>

                      <tr>
                        <th>
                          Latest Remarks
                        </th>

                        <td>
                          {selectedProject
                            ?.latestRemarks ||
                            "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeSection ===
              "progress" && (
              <>
                <div className="form-card">
                  <h2>
                    Add Daily
                    Progress
                  </h2>

                  <form
                    className="client-form"
                    onSubmit={
                      handleProgressSubmit
                    }
                  >
                    <input
                      type="date"
                      name="date"
                      value={
                        progressForm.date
                      }
                      onChange={
                        handleProgressChange
                      }
                    />

                    <textarea
                      name="workDescription"
                      placeholder="Today's work description *"
                      value={
                        progressForm
                          .workDescription
                      }
                      onChange={
                        handleProgressChange
                      }
                      rows="4"
                    />

                    <input
                      type="number"
                      name="progressPercentage"
                      placeholder="Progress % *"
                      min="0"
                      max="100"
                      step="0.01"
                      value={
                        progressForm
                          .progressPercentage
                      }
                      onChange={
                        handleProgressChange
                      }
                    />

                    <input
                      type="number"
                      name="workersCount"
                      placeholder="Workers Count *"
                      min="0"
                      value={
                        progressForm
                          .workersCount
                      }
                      onChange={
                        handleProgressChange
                      }
                    />

                    <textarea
                      name="remarks"
                      placeholder="Remarks"
                      value={
                        progressForm
                          .remarks
                      }
                      onChange={
                        handleProgressChange
                      }
                      rows="3"
                    />

                    <textarea
                      name="tomorrowPlan"
                      placeholder="Tomorrow Plan"
                      value={
                        progressForm
                          .tomorrowPlan
                      }
                      onChange={
                        handleProgressChange
                      }
                      rows="3"
                    />

                    <textarea
                      name="issuesBlockers"
                      placeholder="Issues / Blockers"
                      value={
                        progressForm
                          .issuesBlockers
                      }
                      onChange={
                        handleProgressChange
                      }
                      rows="3"
                    />

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={
                        savingProgress
                      }
                    >
                      {savingProgress
                        ? "Saving..."
                        : "Save Progress"}
                    </button>
                  </form>
                </div>

                <div className="table-card">
                  <h2>
                    Progress History
                  </h2>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>
                          Date
                        </th>

                        <th>
                          Work
                        </th>

                        <th>
                          Progress
                        </th>

                        <th>
                          Workers
                        </th>

                        <th>
                          Remarks
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {progressHistory.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="5"
                          >
                            No progress
                            records found.
                          </td>
                        </tr>
                      ) : (
                        progressHistory.map(
                          (
                            item
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td>
                                {formatDate(
                                  item.date
                                )}
                              </td>

                              <td>
                                {item.workDescription ||
                                  "-"}
                              </td>

                              <td>
                                {item.progressPercentage ??
                                  0}
                                %
                              </td>

                              <td>
                                {item.workersCount ??
                                  0}
                              </td>

                              <td>
                                {item.remarks ||
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

            {activeSection ===
              "materials" && (
              <>
                <div className="form-card">
                  <h2>
                    New Material
                    Request
                  </h2>

                  <form
                    className="client-form"
                    onSubmit={
                      handleMaterialSubmit
                    }
                  >
                    <input
                      type="date"
                      name="requestDate"
                      value={
                        materialForm
                          .requestDate
                      }
                      onChange={
                        handleMaterialChange
                      }
                    />

                    <input
                      type="text"
                      name="materialName"
                      placeholder="Material Name *"
                      value={
                        materialForm
                          .materialName
                      }
                      onChange={
                        handleMaterialChange
                      }
                    />

                    <input
                      type="number"
                      name="quantity"
                      placeholder="Quantity *"
                      min="0.01"
                      step="0.01"
                      value={
                        materialForm
                          .quantity
                      }
                      onChange={
                        handleMaterialChange
                      }
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
                      placeholder="Purpose"
                      value={
                        materialForm
                          .purpose
                      }
                      onChange={
                        handleMaterialChange
                      }
                    />

                    <textarea
                      name="notes"
                      placeholder="Notes"
                      value={
                        materialForm
                          .notes
                      }
                      onChange={
                        handleMaterialChange
                      }
                      rows="3"
                    />

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={
                        savingMaterial
                      }
                    >
                      {savingMaterial
                        ? "Submitting..."
                        : "Submit Request"}
                    </button>
                  </form>
                </div>

                <div className="table-card">
                  <h2>
                    Material Requests
                  </h2>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>
                          Date
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
                          Remarks
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {materialRequests.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="6"
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
                                {getStatusLabel(
                                  request.status
                                )}
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

            {activeSection ===
              "documents" && (
              <>
                <div className="form-card">
                  <h2>
                    Upload Project
                    Document
                  </h2>

                  <p>
                    Upload drawings,
                    BOQs, reports,
                    approvals or other
                    project files.
                  </p>

                  <form
                    className="client-form"
                    onSubmit={
                      handleDocumentSubmit
                    }
                  >
                    <input
                      type="text"
                      name="title"
                      placeholder="Document Title *"
                      value={
                        documentForm.title
                      }
                      onChange={
                        handleDocumentChange
                      }
                    />

                    <select
                      name="documentType"
                      value={
                        documentForm
                          .documentType
                      }
                      onChange={
                        handleDocumentChange
                      }
                    >
                      <option value="DRAWING">
                        Drawing
                      </option>

                      <option value="BOQ">
                        BOQ
                      </option>

                      <option value="METHOD_STATEMENT">
                        Method Statement
                      </option>

                      <option value="APPROVAL">
                        Approval
                      </option>

                      <option value="REPORT">
                        Report
                      </option>

                      <option value="CONTRACT">
                        Contract
                      </option>

                      <option value="INVOICE">
                        Invoice
                      </option>

                      <option value="SITE_INSTRUCTION">
                        Site Instruction
                      </option>

                      <option value="OTHER">
                        Other
                      </option>
                    </select>

                    <textarea
                      name="description"
                      placeholder="Description"
                      value={
                        documentForm
                          .description
                      }
                      onChange={
                        handleDocumentChange
                      }
                      rows="3"
                    />

                    <input
                      id="supervisor-document-file"
                      type="file"
                      name="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg,.dxf"
                      onChange={
                        handleDocumentChange
                      }
                    />

                    {documentForm.file && (
                      <p>
                        Selected:{" "}
                        <strong>
                          {
                            documentForm
                              .file
                              .name
                          }
                        </strong>
                      </p>
                    )}

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={
                        savingDocument
                      }
                    >
                      {savingDocument
                        ? "Uploading..."
                        : "Upload Document"}
                    </button>
                  </form>
                </div>

                <div className="table-card">
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap:
                        "10px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <h2>
                      Project Documents
                    </h2>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        loadDocuments(
                          selectedProjectId
                        )
                      }
                    >
                      Refresh
                    </button>
                  </div>

                  <div
                    style={{
                      overflowX:
                        "auto",
                    }}
                  >
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>
                            Date
                          </th>

                          <th>
                            Title
                          </th>

                          <th>
                            Type
                          </th>

                          <th>
                            File
                          </th>

                          <th>
                            Size
                          </th>

                          <th>
                            Uploaded By
                          </th>

                          <th>
                            Client
                          </th>

                          <th>
                            Contractor
                          </th>

                          <th>
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {documents.length ===
                        0 ? (
                          <tr>
                            <td
                              colSpan="9"
                            >
                              No documents
                              found.
                            </td>
                          </tr>
                        ) : (
                          documents.map(
                            (
                              projectDocument
                            ) => (
                              <tr
                                key={
                                  projectDocument.id
                                }
                              >
                                <td>
                                  {formatDate(
                                    projectDocument
                                      .documentDate
                                  )}
                                </td>

                                <td>
                                  <strong>
                                    {projectDocument.title ||
                                      "-"}
                                  </strong>

                                  {projectDocument.description && (
                                    <div
                                      style={{
                                        marginTop:
                                          "4px",
                                        fontSize:
                                          "12px",
                                      }}
                                    >
                                      {
                                        projectDocument.description
                                      }
                                    </div>
                                  )}
                                </td>

                                <td>
                                  {projectDocument.documentType ||
                                    "-"}
                                </td>

                                <td>
                                  {projectDocument.originalFileName ||
                                    "-"}
                                </td>

                                <td>
                                  {formatFileSize(
                                    projectDocument.fileSize
                                  )}
                                </td>

                                <td>
                                  {projectDocument.uploadedBy ||
                                    "-"}
                                </td>

                                <td>
                                  {projectDocument.clientVisible
                                    ? "Visible"
                                    : "Hidden"}
                                </td>

                                <td>
                                  {projectDocument.contractorVisible
                                    ? "Visible"
                                    : "Hidden"}
                                </td>

                                <td>
                                  <button
                                    type="button"
                                    className="primary-button"
                                    disabled={
                                      downloadingDocumentId ===
                                      projectDocument.id
                                    }
                                    onClick={() =>
                                      downloadDocument(
                                        projectDocument
                                      )
                                    }
                                  >
                                    {downloadingDocumentId ===
                                    projectDocument.id
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
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default SupervisorPortal;