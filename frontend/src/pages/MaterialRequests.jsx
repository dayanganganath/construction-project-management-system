import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function MaterialRequests() {
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [filters, setFilters] = useState({
    projectId: "",
    status: "ALL",
    search: "",
  });

  const [reviewForm, setReviewForm] = useState({
    requestId: null,
    materialName: "",
    status: "APPROVED",
    remarks: "",
  });

  useEffect(() => {
    loadProjects();
    loadRequests();
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
      const response = await api.get("/projects");
      setProjects(response.data || []);
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

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/material-requests"
      );

      setRequests(
        response.data || []
      );
    } catch (error) {
      console.error(
        "Error loading material requests:",
        error
      );

      showAlert(
        "error",
        typeof error.response?.data === "string"
          ? error.response.data
          : "Unable to load material requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return [...requests]
      .filter((request) => {
        if (
          filters.projectId &&
          String(request.project?.id) !==
            String(filters.projectId)
        ) {
          return false;
        }

        if (
          filters.status !== "ALL" &&
          request.status !== filters.status
        ) {
          return false;
        }

        if (filters.search.trim()) {
          const keyword = filters.search
            .trim()
            .toLowerCase();

          const searchableText = [
            request.materialName,
            request.purpose,
            request.notes,
            request.requestedBy,
            request.project?.projectName,
            request.project?.location,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!searchableText.includes(keyword)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const dateCompare = String(
          b.requestDate || ""
        ).localeCompare(
          String(a.requestDate || "")
        );

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return Number(b.id || 0) -
          Number(a.id || 0);
      });
  }, [requests, filters]);

  const pendingCount = useMemo(
    () =>
      filteredRequests.filter(
        (request) =>
          request.status === "PENDING"
      ).length,
    [filteredRequests]
  );

  const approvedCount = useMemo(
    () =>
      filteredRequests.filter(
        (request) =>
          request.status === "APPROVED"
      ).length,
    [filteredRequests]
  );

  const rejectedCount = useMemo(
    () =>
      filteredRequests.filter(
        (request) =>
          request.status === "REJECTED"
      ).length,
    [filteredRequests]
  );

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      projectId: "",
      status: "ALL",
      search: "",
    });
  };

  const openReview = (
    request,
    status
  ) => {
    setReviewingId(request.id);

    setReviewForm({
      requestId: request.id,
      materialName:
        request.materialName || "",
      status,
      remarks:
        request.reviewRemarks || "",
    });

    setAlert({
      type: "",
      message: "",
    });
  };

  const cancelReview = () => {
    setReviewingId(null);

    setReviewForm({
      requestId: null,
      materialName: "",
      status: "APPROVED",
      remarks: "",
    });
  };

  const handleReviewChange = (e) => {
    setReviewForm({
      ...reviewForm,
      [e.target.name]:
        e.target.value,
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!reviewForm.requestId) {
      return;
    }

    try {
      setLoading(true);

      await api.put(
        `/material-requests/${reviewForm.requestId}/review`,
        {
          status:
            reviewForm.status,
          remarks:
            reviewForm.remarks.trim() ||
            null,
        }
      );

      showAlert(
        "success",
        reviewForm.status === "APPROVED"
          ? "Material request approved successfully."
          : "Material request rejected successfully."
      );

      cancelReview();

      await loadRequests();
    } catch (error) {
      console.error(
        "Error reviewing material request:",
        error
      );

      showAlert(
        "error",
        typeof error.response?.data === "string"
          ? error.response.data
          : "Unable to review material request."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Material Requests
          </h1>

          <p>
            Review and manage material
            requests submitted from
            project sites.
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
          Filter Requests
        </h2>

        <div className="client-form">
          <div>
            <label>
              Project / Site
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
                All Projects / Sites
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
          </div>

          <div>
            <label>
              Status
            </label>

            <select
              name="status"
              value={filters.status}
              onChange={
                handleFilterChange
              }
            >
              <option value="ALL">
                All Statuses
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="APPROVED">
                Approved
              </option>

              <option value="REJECTED">
                Rejected
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
              placeholder="Material, site, supervisor..."
              value={filters.search}
              onChange={
                handleFilterChange
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "end",
            }}
          >
            <button
              type="button"
              className="cancel-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{
          marginTop: "24px",
        }}
      >
        <div className="dashboard-card orange">
          <p>
            Pending
          </p>

          <h2>
            {pendingCount}
          </h2>
        </div>

        <div className="dashboard-card green">
          <p>
            Approved
          </p>

          <h2>
            {approvedCount}
          </h2>
        </div>

        <div className="dashboard-card red">
          <p>
            Rejected
          </p>

          <h2>
            {rejectedCount}
          </h2>
        </div>

        <div className="dashboard-card blue">
          <p>
            Total Requests
          </p>

          <h2>
            {filteredRequests.length}
          </h2>
        </div>
      </div>

      {reviewingId && (
        <div
          className="form-card"
          style={{
            marginTop: "24px",
          }}
        >
          <h2>
            Review Material Request
          </h2>

          <p>
            <strong>
              Material:
            </strong>{" "}
            {reviewForm.materialName}
          </p>

          <form
            onSubmit={submitReview}
          >
            <div className="client-form">
              <div>
                <label>
                  Decision
                </label>

                <select
                  name="status"
                  value={
                    reviewForm.status
                  }
                  onChange={
                    handleReviewChange
                  }
                >
                  <option value="APPROVED">
                    Approve
                  </option>

                  <option value="REJECTED">
                    Reject
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
                Review Remarks
              </label>

              <textarea
                name="remarks"
                value={
                  reviewForm.remarks
                }
                onChange={
                  handleReviewChange
                }
                placeholder="Approval note, reason for rejection, supplier instruction, etc..."
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Confirm Review"}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={
                  cancelReview
                }
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div
        className="table-card"
        style={{
          marginTop: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <div>
            <h2>
              Material Request Register
            </h2>

            <p>
              {filteredRequests.length}{" "}
              request(s)
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
                Requested By
              </th>
              <th>
                Status
              </th>
              <th>
                Review
              </th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
            filteredRequests.length ===
              0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  No material requests
                  found.
                </td>
              </tr>
            ) : (
              filteredRequests.map(
                (request) => (
                  <tr
                    key={request.id}
                  >
                    <td>
                      {formatDate(
                        request.requestDate
                      )}
                    </td>

                    <td>
                      <strong>
                        {request.project
                          ?.projectName ||
                          "-"}
                      </strong>

                      {request.project
                        ?.location && (
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
                            request
                              .project
                              .location
                          }
                        </div>
                      )}
                    </td>

                    <td>
                      <strong>
                        {request.materialName ||
                          "-"}
                      </strong>
                    </td>

                    <td>
                      {request.quantity ??
                        0}{" "}
                      {request.unit ||
                        ""}
                    </td>

                    <td>
                      {request.purpose ||
                        request.notes ||
                        "-"}
                    </td>

                    <td>
                      {request.requestedBy ||
                        "-"}
                    </td>

                    <td>
                      <strong>
                        {request.status ||
                          "PENDING"}
                      </strong>

                      {request.reviewedBy && (
                        <div
                          style={{
                            fontSize:
                              "12px",
                            marginTop:
                              "4px",
                          }}
                        >
                          Reviewed by{" "}
                          {
                            request.reviewedBy
                          }
                        </div>
                      )}

                      {request.reviewRemarks && (
                        <div
                          style={{
                            fontSize:
                              "12px",
                            marginTop:
                              "4px",
                          }}
                        >
                          {
                            request.reviewRemarks
                          }
                        </div>
                      )}
                    </td>

                    <td>
                      {request.status ===
                      "PENDING" ? (
                        <div
                          style={{
                            display:
                              "flex",
                            gap: "8px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() =>
                              openReview(
                                request,
                                "APPROVED"
                              )
                            }
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                              openReview(
                                request,
                                "REJECTED"
                              )
                            }
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        "Reviewed"
                      )}
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

export default MaterialRequests;