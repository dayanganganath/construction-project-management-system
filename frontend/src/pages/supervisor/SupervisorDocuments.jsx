import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

function SupervisorDocuments() {
  const {
    selectedProjectId,
  } = useOutletContext();

  const getToday = () => {
    const now = new Date();

    const year =
      now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
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

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [downloadingId, setDownloadingId] =
    useState(null);

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

  const loadDocuments = async () => {
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
        typeof error.response?.data ===
          "string"
          ? error.response.data
          : "Unable to load project documents."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setError("");
    setSuccess("");
  };

  const handleFileChange = (e) => {
    const file =
      e.target.files?.[0] ||
      null;

    setForm({
      ...form,
      file,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (!selectedProjectId) {
        setError(
          "Please select a project."
        );

        return;
      }

      if (!form.title.trim()) {
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
          typeof error.response?.data ===
            "string"
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
            .createElement(
              "a"
            );

        link.href = url;

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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Documents / Drawings
          </h1>

          <p>
            Upload and manage
            project drawings,
            reports, BOQs and site
            documents.
          </p>
        </div>
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
          Upload Document
        </h2>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="progress-form">
            <div>
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

            <div>
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

          <div
            style={{
              marginTop: "15px",
            }}
          >
            <label>
              Title
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

          <div
            style={{
              marginTop: "15px",
            }}
          >
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
              placeholder="Add document details, revision, instructions, etc..."
            />
          </div>

          <div
            style={{
              marginTop: "15px",
            }}
          >
            <label>
              File
            </label>

            <input
              id="project-document-file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.dwg,.dxf"
              onChange={
                handleFileChange
              }
            />

            <p
              style={{
                marginTop: "6px",
                fontSize: "12px",
                opacity: 0.7,
              }}
            >
              Maximum file size:
              25 MB
            </p>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={
              saving
            }
            style={{
              marginTop: "18px",
            }}
          >
            {saving
              ? "Uploading..."
              : "Upload Document"}
          </button>
        </form>
      </div>

      <div
        className="form-card"
        style={{
          marginTop: "24px",
        }}
      >
        <h2>
          Document History
        </h2>

        {loading ? (
          <p>
            Loading documents...
          </p>
        ) : documents.length ===
          0 ? (
          <p>
            No project documents
            found.
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

                  <th>Title</th>

                  <th>Type</th>

                  <th>File</th>

                  <th>Size</th>

                  <th>
                    Uploaded By
                  </th>

                  <th>
                    Client Visible
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
                          ? "Yes"
                          : "No"}
                      </td>

                      <td>
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

export default SupervisorDocuments;