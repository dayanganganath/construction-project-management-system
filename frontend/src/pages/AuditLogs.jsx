import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

function AuditLogs() {
  const [
    logs,
    setLogs,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    moduleFilter,
    setModuleFilter,
  ] = useState("ALL");

  const [
    search,
    setSearch,
  ] = useState("");

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/audit-logs"
          );

        setLogs(
          response.data || []
        );
      } catch (error) {
        console.error(
          "Error loading audit logs:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load audit logs."
          )
        );
      } finally {
        setLoading(false);
      }
    };

  const getErrorMessage =
    (
      error,
      fallback
    ) => {
      if (
        typeof error.response
          ?.data === "string"
      ) {
        return error.response.data;
      }

      return (
        error.response?.data
          ?.message ||
        fallback
      );
    };

  const formatDateTime =
    (value) => {
      if (!value) {
        return "-";
      }

      const date =
        new Date(value);

      return date.toLocaleString(
        "en-LK"
      );
    };

  const formatText =
    (value) => {
      if (!value) {
        return "-";
      }

      return value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );
    };

  const getProjectName =
    (log) => {
      return (
        log.project?.projectName ||
        log.project?.name ||
        "-"
      );
    };

  const modules =
    useMemo(() => {
      const values =
        logs
          .map(
            (log) =>
              log.module
          )
          .filter(Boolean);

      return [
        ...new Set(values),
      ];
    }, [logs]);

  const filteredLogs =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return logs.filter(
        (log) => {
          const matchesModule =
            moduleFilter === "ALL" ||
            log.module ===
              moduleFilter;

          if (
            !matchesModule
          ) {
            return false;
          }

          if (
            !searchValue
          ) {
            return true;
          }

          const combined =
            [
              log.username,
              log.role,
              log.module,
              log.action,
              log.description,
              log.referenceType,
              log.referenceId,
              getProjectName(
                log
              ),
            ]
              .filter(
                (value) =>
                  value !==
                    null &&
                  value !==
                    undefined
              )
              .join(" ")
              .toLowerCase();

          return combined.includes(
            searchValue
          );
        }
      );
    }, [
      logs,
      moduleFilter,
      search,
    ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Audit Logs
          </h1>

          <p>
            Review important
            system activities
            performed by users.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={
            loadAuditLogs
          }
          disabled={
            loading
          }
        >
          {loading
            ? "Loading..."
            : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div
        className="dashboard-grid"
        style={{
          marginBottom: "24px",
        }}
      >
        <div className="dashboard-card blue">
          <p>
            Total Logs
          </p>

          <h2>
            {logs.length}
          </h2>
        </div>

        <div className="dashboard-card purple">
          <p>
            Modules
          </p>

          <h2>
            {modules.length}
          </h2>
        </div>

        <div className="dashboard-card green">
          <p>
            Filtered Results
          </p>

          <h2>
            {
              filteredLogs.length
            }
          </h2>
        </div>
      </div>

      <div className="form-card">
        <h2>
          Filter Audit Logs
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <label>
              Module
            </label>

            <select
              value={
                moduleFilter
              }
              onChange={(
                event
              ) =>
                setModuleFilter(
                  event.target
                    .value
                )
              }
            >
              <option value="ALL">
                All Modules
              </option>

              {modules.map(
                (module) => (
                  <option
                    key={
                      module
                    }
                    value={
                      module
                    }
                  >
                    {formatText(
                      module
                    )}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label>
              Search
            </label>

            <input
              type="text"
              placeholder="Search user, action, project..."
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="table-card">
        <h2>
          Activity History
        </h2>

        {loading ? (
          <div className="dashboard-loading">
            Loading audit
            logs...
          </div>
        ) : filteredLogs
            .length === 0 ? (
          <div
            style={{
              padding: "24px",
            }}
          >
            No audit logs
            found.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  Date / Time
                </th>

                <th>
                  User
                </th>

                <th>
                  Role
                </th>

                <th>
                  Module
                </th>

                <th>
                  Action
                </th>

                <th>
                  Project
                </th>

                <th>
                  Description
                </th>

                <th>
                  Reference
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map(
                (log) => (
                  <tr
                    key={
                      log.id
                    }
                  >
                    <td>
                      {formatDateTime(
                        log.createdAt
                      )}
                    </td>

                    <td>
                      {log.username ||
                        "-"}
                    </td>

                    <td>
                      {log.role ||
                        "-"}
                    </td>

                    <td>
                      {formatText(
                        log.module
                      )}
                    </td>

                    <td>
                      {formatText(
                        log.action
                      )}
                    </td>

                    <td>
                      {getProjectName(
                        log
                      )}
                    </td>

                    <td
                      style={{
                        minWidth:
                          "260px",
                        whiteSpace:
                          "normal",
                      }}
                    >
                      {log.description ||
                        "-"}
                    </td>

                    <td>
                      {log.referenceType
                        ? `${formatText(
                            log.referenceType
                          )} #${
                            log.referenceId ??
                            "-"
                          }`
                        : "-"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AuditLogs;