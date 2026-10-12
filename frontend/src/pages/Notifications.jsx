import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

function Notifications() {
  const navigate = useNavigate();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processingId,
    setProcessingId,
  ] = useState(null);

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/notifications"
          );

        setNotifications(
          response.data || []
        );
      } catch (error) {
        console.error(
          "Error loading notifications:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load notifications."
          )
        );
      } finally {
        setLoading(false);
      }
    };

  const markAsRead =
    async (
      notification,
      openPage = false
    ) => {
      try {
        setProcessingId(
          notification.id
        );

        setError("");

        if (
          !notification.readStatus
        ) {
          await api.put(
            `/notifications/${notification.id}/read`
          );

          setNotifications(
            (current) =>
              current.map(
                (item) =>
                  item.id ===
                  notification.id
                    ? {
                        ...item,
                        readStatus:
                          true,
                      }
                    : item
              )
          );

          notifyBadgeUpdate();
        }

        if (openPage) {
          navigateToReference(
            notification
          );
        }
      } catch (error) {
        console.error(
          "Error marking notification as read:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to update notification."
          )
        );
      } finally {
        setProcessingId(null);
      }
    };

  const markAllAsRead =
    async () => {
      try {
        setMarkingAll(true);
        setError("");

        await api.put(
          "/notifications/read-all"
        );

        setNotifications(
          (current) =>
            current.map(
              (item) => ({
                ...item,
                readStatus: true,
              })
            )
        );

        notifyBadgeUpdate();
      } catch (error) {
        console.error(
          "Error marking all notifications as read:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to mark all notifications as read."
          )
        );
      } finally {
        setMarkingAll(false);
      }
    };

  const notifyBadgeUpdate = () => {
    window.dispatchEvent(
      new Event(
        "notifications-updated"
      )
    );
  };

  const navigateToReference =
    (notification) => {
      switch (
        notification.referenceType
      ) {
        case "MATERIAL_REQUEST":
          navigate(
            "/material-requests"
          );
          break;

        case "SITE_ISSUE":
          navigate(
            "/site-issues"
          );
          break;

        case "PROJECT_DOCUMENT":
          navigate(
            "/documents"
          );
          break;

        case "SITE_PHOTO":
          navigate(
            "/site-photos"
          );
          break;

        default:
          navigate("/");
      }
    };

  const filteredNotifications =
    useMemo(() => {
      if (filter === "UNREAD") {
        return notifications.filter(
          (notification) =>
            !notification.readStatus
        );
      }

      if (filter === "READ") {
        return notifications.filter(
          (notification) =>
            notification.readStatus
        );
      }

      return notifications;
    }, [
      notifications,
      filter,
    ]);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.readStatus
    ).length;

  const readCount =
    notifications.filter(
      (notification) =>
        notification.readStatus
    ).length;

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

  const formatType =
    (type) => {
      if (!type) {
        return "General";
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

  const getProjectName =
    (notification) => {
      return (
        notification.project
          ?.projectName ||
        "-"
      );
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Notifications
          </h1>

          <p>
            Review recent project
            activities and requests.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={
            markAllAsRead
          }
          disabled={
            markingAll ||
            unreadCount === 0
          }
        >
          {markingAll
            ? "Updating..."
            : "Mark All as Read"}
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
            Total
          </p>

          <h2>
            {
              notifications.length
            }
          </h2>
        </div>

        <div className="dashboard-card orange">
          <p>
            Unread
          </p>

          <h2>
            {unreadCount}
          </h2>
        </div>

        <div className="dashboard-card green">
          <p>
            Read
          </p>

          <h2>
            {readCount}
          </h2>
        </div>
      </div>

      <div className="form-card">
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            className={
              filter === "ALL"
                ? "primary-button"
                : "cancel-button"
            }
            onClick={() =>
              setFilter("ALL")
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              filter === "UNREAD"
                ? "primary-button"
                : "cancel-button"
            }
            onClick={() =>
              setFilter(
                "UNREAD"
              )
            }
          >
            Unread
          </button>

          <button
            type="button"
            className={
              filter === "READ"
                ? "primary-button"
                : "cancel-button"
            }
            onClick={() =>
              setFilter("READ")
            }
          >
            Read
          </button>
        </div>

        {loading ? (
          <p>
            Loading
            notifications...
          </p>
        ) : filteredNotifications
            .length === 0 ? (
          <p>
            No notifications
            found.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "12px",
            }}
          >
            {filteredNotifications.map(
              (notification) => (
                <div
                  key={
                    notification.id
                  }
                  style={{
                    padding: "18px",
                    border:
                      notification.readStatus
                        ? "1px solid #e5e7eb"
                        : "2px solid #2563eb",
                    borderRadius:
                      "12px",
                    background:
                      notification.readStatus
                        ? "#ffffff"
                        : "#eff6ff",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap: "20px",
                      alignItems:
                        "flex-start",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          gap: "8px",
                          alignItems:
                            "center",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                          }}
                        >
                          {
                            notification.title
                          }
                        </h3>

                        {!notification.readStatus && (
                          <span
                            style={{
                              background:
                                "#2563eb",
                              color:
                                "#ffffff",
                              padding:
                                "3px 8px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "11px",
                              fontWeight:
                                "700",
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>

                      <p
                        style={{
                          marginTop:
                            "10px",
                          marginBottom:
                            "10px",
                        }}
                      >
                        {
                          notification.message
                        }
                      </p>

                      <div
                        style={{
                          display:
                            "flex",
                          gap: "16px",
                          flexWrap:
                            "wrap",
                          fontSize:
                            "13px",
                          color:
                            "#6b7280",
                        }}
                      >
                        <span>
                          Type:{" "}
                          {formatType(
                            notification.type
                          )}
                        </span>

                        <span>
                          Project:{" "}
                          {getProjectName(
                            notification
                          )}
                        </span>

                        <span>
                          By:{" "}
                          {notification.createdBy ||
                            "-"}
                        </span>

                        <span>
                          {formatDateTime(
                            notification.createdAt
                          )}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "8px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      {!notification.readStatus && (
                        <button
                          type="button"
                          className="cancel-button"
                          disabled={
                            processingId ===
                            notification.id
                          }
                          onClick={() =>
                            markAsRead(
                              notification
                            )
                          }
                        >
                          Mark Read
                        </button>
                      )}

                      <button
                        type="button"
                        className="primary-button"
                        disabled={
                          processingId ===
                          notification.id
                        }
                        onClick={() =>
                          markAsRead(
                            notification,
                            true
                          )
                        }
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;