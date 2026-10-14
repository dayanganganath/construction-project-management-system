import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

function ProjectDocuments() {
  const [documents, setDocuments] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    updatingClientId,
    setUpdatingClientId,
  ] = useState(null);

  const [
    updatingContractorId,
    setUpdatingContractorId,
  ] = useState(null);

  const [
    downloadingId,
    setDownloadingId,
  ] = useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [filters, setFilters] =
    useState({
      projectId: "",
      documentType: "ALL",
      visibility: "ALL",
      search: "",
    });

  useEffect(() => {
    loadProjects();
    loadDocuments();
  }, []);

  const loadProjects = async () => {
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
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/project-documents"
        );

      setDocuments(
        response.data || []
      );
    } catch (error) {
      console.error(
        "Error loading documents:",
        error
      );

      setError(
        typeof error.response?.data ===
          "string"
          ? error.response.data
          : error.response?.data
              ?.message ||
            "Unable to load project documents."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e
  ) => {
    setFilters({
      ...filters,
      [e.target.name]:
        e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      projectId: "",
      documentType: "ALL",
      visibility: "ALL",
      search: "",
    });
  };

  const filteredDocuments =
    useMemo(() => {
      return [...documents]
        .filter((document) => {
          if (
            filters.projectId &&
            String(
              document.project?.id
            ) !==
              String(
                filters.projectId
              )
          ) {
            return false;
          }

          if (
            filters.documentType !==
              "ALL" &&
            document.documentType !==
              filters.documentType
          ) {
            return false;
          }

          if (
            filters.visibility ===
              "CLIENT" &&
            !document.clientVisible
          ) {
            return false;
          }

          if (
            filters.visibility ===
              "CONTRACTOR" &&
            !document.contractorVisible
          ) {
            return false;
          }

          if (
            filters.visibility ===
              "INTERNAL" &&
            (
              document.clientVisible ||
              document.contractorVisible
            )
          ) {
            return false;
          }

          if (
            filters.search.trim()
          ) {
            const keyword =
              filters.search
                .trim()
                .toLowerCase();

            const searchableText = [
              document.title,
              document.description,
              document.originalFileName,
              document.uploadedBy,
              document.project?.projectName,
              document.project?.location,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            if (
              !searchableText.includes(
                keyword
              )
            ) {
              return false;
            }
          }

          return true;
        })
        .sort((a, b) => {
          const dateCompare =
            String(
              b.documentDate || ""
            ).localeCompare(
              String(
                a.documentDate || ""
              )
            );

          if (
            dateCompare !== 0
          ) {
            return dateCompare;
          }

          return (
            Number(b.id || 0) -
            Number(a.id || 0)
          );
        });
    }, [
      documents,
      filters,
    ]);

  const clientVisibleCount =
    filteredDocuments.filter(
      (document) =>
        document.clientVisible
    ).length;

  const contractorVisibleCount =
    filteredDocuments.filter(
      (document) =>
        document.contractorVisible
    ).length;

  const internalCount =
    filteredDocuments.filter(
      (document) =>
        !document.clientVisible &&
        !document.contractorVisible
    ).length;

  const updateClientVisibility =
    async (document) => {
      try {
        setUpdatingClientId(
          document.id
        );

        setError("");
        setSuccess("");

        const newValue =
          !document.clientVisible;

        await api.put(
          `/project-documents/${document.id}/client-visible`,
          {
            clientVisible:
              newValue,
          }
        );

        setDocuments(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                document.id
                  ? {
                      ...item,
                      clientVisible:
                        newValue,
                    }
                  : item
            )
        );

        setSuccess(
          newValue
            ? "Document is now visible to the client."
            : "Document removed from client view."
        );
      } catch (error) {
        console.error(
          "Error updating client visibility:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to update client visibility."
        );
      } finally {
        setUpdatingClientId(
          null
        );
      }
    };

  const updateContractorVisibility =
    async (document) => {
      try {
        setUpdatingContractorId(
          document.id
        );

        setError("");
        setSuccess("");

        const newValue =
          !document.contractorVisible;

        await api.put(
          `/project-documents/${document.id}/contractor-visible`,
          {
            contractorVisible:
              newValue,
          }
        );

        setDocuments(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                document.id
                  ? {
                      ...item,
                      contractorVisible:
                        newValue,
                    }
                  : item
            )
        );

        setSuccess(
          newValue
            ? "Document is now visible to contractors."
            : "Document removed from contractor view."
        );
      } catch (error) {
        console.error(
          "Error updating contractor visibility:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to update contractor visibility."
        );
      } finally {
        setUpdatingContractorId(
          null
        );
      }
    };

  const downloadDocument =
    async (document) => {
      try {
        setDownloadingId(
          document.id
        );

        const response =
          await api.get(
            `/project-documents/${document.id}/file`,
            {
              responseType:
                "blob",
            }
          );

        const url =
          URL.createObjectURL(
            response.data
          );

        const link =
          window.document
            .createElement(
              "a"
            );

        link.href =
          url;

        link.download =
          document.originalFileName ||
          `document-${document.id}`;

        window.document.body
          .appendChild(
            link
          );

        link.click();

        link.remove();

        URL.revokeObjectURL(
          url
        );
      } catch (error) {
        console.error(
          "Error downloading document:",
          error
        );

        setError(
          "Unable to download document."
        );
      } finally {
        setDownloadingId(
          null
        );
      }
    };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString();
  };

  const formatFileSize = (
    bytes
  ) => {
    if (
      bytes === null ||
      bytes === undefined
    ) {
      return "-";
    }

    if (
      bytes < 1024
    ) {
      return `${bytes} B`;
    }

    const kb =
      bytes / 1024;

    if (
      kb < 1024
    ) {
      return `${kb.toFixed(
        1
      )} KB`;
    }

    return `${(
      kb / 1024
    ).toFixed(
      2
    )} MB`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Project Documents
          </h1>

          <p>
            Review drawings,
            BOQs, reports and
            control client /
            contractor visibility.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={
            loadDocuments
          }
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="form-card">
        <h2>
          Filter Documents
        </h2>

        <div className="client-form">
          <div>
            <label>
              Project
            </label>

            <select
              name="projectId"
              value={
                filters.projectId
              }
              onChange={
                handleFilterChange
              }
            >
              <option value="">
                All Projects
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

          <div>
            <label>
              Document Type
            </label>

            <select
              name="documentType"
              value={
                filters.documentType
              }
              onChange={
                handleFilterChange
              }
            >
              <option value="ALL">
                All Types
              </option>

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
          </div>

          <div>
            <label>
              Visibility
            </label>

            <select
              name="visibility"
              value={
                filters.visibility
              }
              onChange={
                handleFilterChange
              }
            >
              <option value="ALL">
                All
              </option>

              <option value="CLIENT">
                Client Visible
              </option>

              <option value="CONTRACTOR">
                Contractor Visible
              </option>

              <option value="INTERNAL">
                Internal Only
              </option>
            </select>
          </div>

          <div>
            <label>
              Search
            </label>

            <input
              type="text"
              name="search"
              value={
                filters.search
              }
              onChange={
                handleFilterChange
              }
              placeholder="Title, file, project..."
            />
          </div>
        </div>

        <button
          type="button"
          className="cancel-button"
          onClick={
            clearFilters
          }
          style={{
            marginTop:
              "15px",
          }}
        >
          Clear Filters
        </button>
      </div>

      <div
        className="dashboard-grid"
        style={{
          marginTop:
            "24px",
        }}
      >
        <div className="dashboard-card blue">
          <p>
            Total Documents
          </p>

          <h2>
            {
              filteredDocuments.length
            }
          </h2>
        </div>

        <div className="dashboard-card green">
          <p>
            Client Visible
          </p>

          <h2>
            {
              clientVisibleCount
            }
          </h2>
        </div>

        <div className="dashboard-card blue">
          <p>
            Contractor Visible
          </p>

          <h2>
            {
              contractorVisibleCount
            }
          </h2>
        </div>

        <div className="dashboard-card orange">
          <p>
            Internal Only
          </p>

          <h2>
            {
              internalCount
            }
          </h2>
        </div>
      </div>

      <div
        className="form-card"
        style={{
          marginTop:
            "24px",
        }}
      >
        <h2>
          Document Register
        </h2>

        {loading ? (
          <p>
            Loading documents...
          </p>
        ) : filteredDocuments
            .length === 0 ? (
          <p>
            No documents found.
          </p>
        ) : (
          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Document</th>
                  <th>Type</th>
                  <th>File</th>
                  <th>Size</th>
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
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map(
                  (document) => (
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
                        <strong>
                          {document.project
                            ?.projectName ||
                            "-"}
                        </strong>

                        {document.project
                          ?.location && (
                          <div
                            style={{
                              fontSize:
                                "12px",
                              marginTop:
                                "4px",
                            }}
                          >
                            {
                              document
                                .project
                                .location
                            }
                          </div>
                        )}
                      </td>

                      <td>
                        <strong>
                          {document.title ||
                            "-"}
                        </strong>

                        {document.description && (
                          <div
                            style={{
                              marginTop:
                                "5px",
                              maxWidth:
                                "320px",
                            }}
                          >
                            {
                              document.description
                            }
                          </div>
                        )}
                      </td>

                      <td>
                        {document.documentType ||
                          "OTHER"}
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
                        {document.uploadedBy ||
                          "-"}
                      </td>

                      <td>
                        {document.clientVisible
                          ? "Visible"
                          : "Hidden"}
                      </td>

                      <td>
                        {document.contractorVisible
                          ? "Visible"
                          : "Hidden"}
                      </td>

                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "8px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="primary-button"
                            disabled={
                              downloadingId ===
                              document.id
                            }
                            onClick={() =>
                              downloadDocument(
                                document
                              )
                            }
                          >
                            {downloadingId ===
                            document.id
                              ? "Downloading..."
                              : "Download"}
                          </button>

                          <button
                            type="button"
                            className={
                              document.clientVisible
                                ? "cancel-button"
                                : "primary-button"
                            }
                            disabled={
                              updatingClientId ===
                              document.id
                            }
                            onClick={() =>
                              updateClientVisibility(
                                document
                              )
                            }
                          >
                            {updatingClientId ===
                            document.id
                              ? "Updating..."
                              : document.clientVisible
                              ? "Hide from Client"
                              : "Show to Client"}
                          </button>

                          <button
                            type="button"
                            className={
                              document.contractorVisible
                                ? "cancel-button"
                                : "primary-button"
                            }
                            disabled={
                              updatingContractorId ===
                              document.id
                            }
                            onClick={() =>
                              updateContractorVisibility(
                                document
                              )
                            }
                          >
                            {updatingContractorId ===
                            document.id
                              ? "Updating..."
                              : document.contractorVisible
                              ? "Hide from Contractor"
                              : "Show to Contractor"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDocuments;