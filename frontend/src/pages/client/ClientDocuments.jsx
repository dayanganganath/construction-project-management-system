import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

function ClientDocuments() {
  const {
    selectedProjectId,
    formatDate,
  } = useOutletContext();

  const [
    documents,
    setDocuments,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    downloadingId,
    setDownloadingId,
  ] = useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (selectedProjectId) {
      loadDocuments();
    }
  }, [selectedProjectId]);

  const loadDocuments =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/client/projects/${selectedProjectId}/documents`
          );

        setDocuments(
          response.data || []
        );
      } catch (error) {
        console.error(
          "Unable to load documents:",
          error
        );

        setDocuments([]);

        setError(
          "Unable to load project documents."
        );
      } finally {
        setLoading(false);
      }
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

    return `${(
      kb / 1024
    ).toFixed(2)} MB`;
  };

  const formatDocumentType = (
    type
  ) => {
    if (!type) {
      return "Other";
    }

    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
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
            `/client/projects/${selectedProjectId}/documents/${document.id}/file`,
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
          window.document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          document.originalFileName ||
          `document-${document.id}`;

        window.document.body.appendChild(
          link
        );

        link.click();
        link.remove();

        URL.revokeObjectURL(
          url
        );
      } catch (error) {
        console.error(
          "Unable to download document:",
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

  return (
    <div className="client-page">
      <div className="client-page-heading">
        <div>
          <span className="client-eyebrow">
            Shared Files
          </span>

          <h2>
            Project Documents
          </h2>

          <p>
            Approved drawings,
            reports and other
            project documents
            shared with you.
          </p>
        </div>

        {!loading && (
          <span className="client-count-badge">
            {documents.length} files
          </span>
        )}
      </div>

      {error && (
        <div className="client-alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="client-page-loading">
          Loading documents...
        </div>
      ) : documents.length ===
        0 ? (
        <div className="client-empty-card">
          <h3>
            No documents available
          </h3>

          <p>
            Approved client
            documents will appear
            here.
          </p>
        </div>
      ) : (
        <div className="client-documents-card">
          <div className="client-table-scroll">
            <table className="client-documents-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Document</th>
                  <th>Type</th>
                  <th>File</th>
                  <th>Size</th>
                  <th>Action</th>
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
                          <small>
                            {
                              document.description
                            }
                          </small>
                        )}
                      </td>

                      <td>
                        {formatDocumentType(
                          document.documentType
                        )}
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
                        <button
                          type="button"
                          className="client-download-button"
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
        </div>
      )}
    </div>
  );
}

export default ClientDocuments;