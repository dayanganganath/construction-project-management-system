import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/supervisor-forms-polish.css";
import "../../styles/supervisor-documents-polish.css";

function SupervisorDocuments() {
  const {
    selectedProjectId,
  } = useOutletContext();

  const getToday = () => {
    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        now.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const initialForm = {
    documentDate: getToday(),
    title: "",
    description: "",
    documentType: "DRAWING",
    file: null,
  };

  const [form, setForm] =
    useState(initialForm);

  const [
    documents,
    setDocuments,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    downloadingId,
    setDownloadingId,
  ] = useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (selectedProjectId) {
      loadDocuments();
    } else {
      setDocuments([]);
    }
  }, [selectedProjectId]);

  const loadDocuments =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/supervisor/projects/${selectedProjectId}/documents`
          );

        setDocuments(
          response.data || []
        );
      } catch (error) {
        console.error(
          "Error loading project documents:",
          error
        );

        setError(
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to load project documents."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setForm({
        ...form,
        [name]: value,
      });

      setError("");
      setSuccess("");
    };

  const handleFileChange =
    (event) => {
      const file =
        event.target
          .files?.[0] ||
        null;

      setForm({
        ...form,
        file,
      });

      setError("");
      setSuccess("");
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!selectedProjectId) {
        setError(
          "Please select a project."
        );

        return;
      }

      if (
        !form.title.trim()
      ) {
        setError(
          "Document title is required."
        );

        return;
      }

      if (!form.file) {
        setError(
          "Please select a document file."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const data =
          new FormData();

        data.append(
          "documentDate",
          form.documentDate
        );

        data.append(
          "title",
          form.title.trim()
        );

        data.append(
          "description",
          form.description.trim()
        );

        data.append(
          "documentType",
          form.documentType
        );

        data.append(
          "file",
          form.file
        );

        await api.post(
          `/supervisor/projects/${selectedProjectId}/documents`,
          data,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        setSuccess(
          "Document uploaded successfully."
        );

        setForm({
          ...initialForm,
          documentDate:
            getToday(),
        });

        const fileInput =
          document.getElementById(
            "project-document-file"
          );

        if (fileInput) {
          fileInput.value = "";
        }

        await loadDocuments();
      } catch (error) {
        console.error(
          "Error uploading document:",
          error
        );

        setError(
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to upload document."
        );
      } finally {
        setSaving(false);
      }
    };

  const downloadDocument =
    async (document) => {
      try {
        setDownloadingId(
          document.id
        );

        setError("");

        const response =
          await api.get(
            `/supervisor/projects/${selectedProjectId}/documents/${document.id}/file`,
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
            .createElement("a");

        link.href = url;

        link.download =
          document.originalFileName ||
          `document-${document.id}`;

        window.document.body
          .appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);
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
    ).toLocaleDateString(
      "en-GB"
    );
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

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const kb =
      bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(
        1
      )} KB`;
    }

    const mb =
      kb / 1024;

    return `${mb.toFixed(
      2
    )} MB`;
  };

  const getTypeClass = (
    type
  ) => {
    return String(
      type || "OTHER"
    )
      .toLowerCase()
      .replaceAll(
        "_",
        "-"
      );
  };

  const visibleCount =
    documents.filter(
      (document) =>
        Boolean(
          document.clientVisible
        )
    ).length;

  const drawingCount =
    documents.filter(
      (document) =>
        String(
          document.documentType
        ).toUpperCase() ===
        "DRAWING"
    ).length;

  return (
    <div className="supervisor-page">
      <div className="supervisor-page-heading">
        <div>
          <span className="supervisor-eyebrow">
            Project Files
          </span>

          <h2>
            Documents / Drawings
          </h2>

          <p>
            Upload and manage
            drawings, reports,
            approvals, BOQs and
            other project files.
          </p>
        </div>

        <div className="supervisor-mini-status">
          <span>
            Total Documents
          </span>

          <strong>
            {documents.length}
          </strong>
        </div>
      </div>

      {error && (
        <div className="supervisor-form-alert supervisor-form-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="supervisor-form-alert supervisor-form-alert-success">
          {success}
        </div>
      )}

      <div className="supervisor-document-summary-grid">
        <div className="supervisor-document-summary-card">
          <span>
            Total Documents
          </span>

          <strong>
            {documents.length}
          </strong>

          <small>
            Project files
          </small>
        </div>

        <div className="supervisor-document-summary-card">
          <span>
            Drawings
          </span>

          <strong>
            {drawingCount}
          </strong>

          <small>
            Drawing files
          </small>
        </div>

        <div className="supervisor-document-summary-card">
          <span>
            Client Visible
          </span>

          <strong>
            {visibleCount}
          </strong>

          <small>
            Shared with client
          </small>
        </div>
      </div>

      <section className="supervisor-form-card">
        <div className="supervisor-form-card-heading">
          <div>
            <h3>
              Upload Document
            </h3>

            <p>
              Add a new project
              drawing or document.
            </p>
          </div>

          <span className="supervisor-form-badge">
            New File
          </span>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="supervisor-form-grid supervisor-form-grid-two">
            <div className="supervisor-field">
              <label>
                Document Date
              </label>

              <input
                type="date"
                name="documentDate"
                value={
                  form.documentDate
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="supervisor-field">
              <label>
                Document Type
              </label>

              <select
                name="documentType"
                value={
                  form.documentType
                }
                onChange={
                  handleChange
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
            </div>
          </div>

          <div className="supervisor-field supervisor-field-full">
            <label>
              Document Title *
            </label>

            <input
              type="text"
              name="title"
              value={
                form.title
              }
              onChange={
                handleChange
              }
              placeholder="Example: Ground Floor Electrical Layout"
            />
          </div>

          <div className="supervisor-field supervisor-field-full">
            <label>
              Description
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              placeholder="Revision details, instructions or additional information..."
            />
          </div>

          <div className="supervisor-field supervisor-field-full">
            <label>
              Document File *
            </label>

            <input
              id="project-document-file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.dwg,.dxf"
              onChange={
                handleFileChange
              }
            />

            <span className="supervisor-file-hint">
              PDF, Word, Excel,
              Images, DWG or DXF.
              Maximum file size:
              25 MB.
            </span>
          </div>

          <div className="supervisor-form-actions">
            <button
              type="submit"
              className="supervisor-primary-button"
              disabled={
                saving ||
                !selectedProjectId
              }
            >
              {saving
                ? "Uploading..."
                : "Upload Document"}
            </button>
          </div>
        </form>
      </section>

      <section className="supervisor-form-card">
        <div className="supervisor-form-card-heading">
          <div>
            <h3>
              Document History
            </h3>

            <p>
              Review and download
              previously uploaded
              project files.
            </p>
          </div>

          {!loading && (
            <span className="supervisor-count-badge">
              {documents.length} files
            </span>
          )}
        </div>

        {loading ? (
          <div className="supervisor-table-loading">
            Loading documents...
          </div>
        ) : documents.length ===
          0 ? (
          <div className="supervisor-table-empty">
            <h4>
              No project documents
            </h4>

            <p>
              Uploaded documents
              and drawings will
              appear here.
            </p>
          </div>
        ) : (
          <div className="supervisor-table-scroll">
            <table className="supervisor-table supervisor-document-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Document</th>
                  <th>Type</th>
                  <th>File</th>
                  <th>Size</th>
                  <th>
                    Uploaded By
                  </th>
                  <th>
                    Visibility
                  </th>
                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {documents.map(
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
                        <strong className="supervisor-table-primary">
                          {document.title ||
                            "-"}
                        </strong>

                        {document.description && (
                          <div className="supervisor-document-description">
                            {
                              document.description
                            }
                          </div>
                        )}
                      </td>

                      <td>
                        <span
                          className={`supervisor-document-type ${getTypeClass(
                            document.documentType
                          )}`}
                        >
                          {document.documentType ||
                            "OTHER"}
                        </span>
                      </td>

                      <td>
                        <div className="supervisor-document-file-name">
                          <span className="supervisor-document-file-icon">
                            FL
                          </span>

                          <span>
                            {document.originalFileName ||
                              "-"}
                          </span>
                        </div>
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
                        <span
                          className={
                            document.clientVisible
                              ? "supervisor-document-visibility visible"
                              : "supervisor-document-visibility internal"
                          }
                        >
                          {document.clientVisible
                            ? "Client Visible"
                            : "Internal"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="supervisor-download-button"
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
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default SupervisorDocuments;