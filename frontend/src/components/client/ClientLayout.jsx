import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";

import ClientProfile from "../../pages/client/ClientProfile";

import "../../styles/client-profile-layout.css";

function ClientLayout() {
  const navigate =
    useNavigate();

  const username =
    localStorage.getItem(
      "username"
    ) || "Client";

  const [
    currentTime,
    setCurrentTime,
  ] = useState(
    new Date()
  );

  const [projects, setProjects] =
    useState([]);

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState("");

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    loadingProject,
    setLoadingProject,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    showProfile,
    setShowProfile,
  ] = useState(false);

  const [profile, setProfile] =
    useState(null);

  const [
    profilePhotoUrl,
    setProfilePhotoUrl,
  ] = useState("");

  useEffect(() => {
    loadProjects();

    loadProfile();

    const timer =
      setInterval(
        () => {
          setCurrentTime(
            new Date()
          );
        },
        60000
      );

    const handleProfileUpdate =
      () => {
        loadProfile();
      };

    window.addEventListener(
      "client-profile-updated",
      handleProfileUpdate
    );

    return () => {
      clearInterval(timer);

      window.removeEventListener(
        "client-profile-updated",
        handleProfileUpdate
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      if (profilePhotoUrl) {
        URL.revokeObjectURL(
          profilePhotoUrl
        );
      }
    };
  }, [profilePhotoUrl]);

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

  const getErrorMessage = (
    error,
    fallback
  ) => {
    if (
      typeof error.response?.data ===
      "string"
    ) {
      return error.response.data;
    }

    return (
      error.response?.data
        ?.message || fallback
    );
  };

  const loadProfile =
    async () => {
      try {
        const response =
          await api.get(
            "/client/profile"
          );

        const data =
          response.data;

        setProfile(data);

        if (
          data?.photoAvailable
        ) {
          await loadProfilePhoto();
        } else {
          clearProfilePhoto();
        }
      } catch (error) {
        console.error(
          "Unable to load client profile:",
          error
        );
      }
    };

  const clearProfilePhoto =
    () => {
      setProfilePhotoUrl(
        (currentUrl) => {
          if (currentUrl) {
            URL.revokeObjectURL(
              currentUrl
            );
          }

          return "";
        }
      );
    };

  const loadProfilePhoto =
    async () => {
      try {
        const response =
          await api.get(
            "/client/profile/photo",
            {
              responseType:
                "blob",
            }
          );

        const objectUrl =
          URL.createObjectURL(
            response.data
          );

        setProfilePhotoUrl(
          (currentUrl) => {
            if (currentUrl) {
              URL.revokeObjectURL(
                currentUrl
              );
            }

            return objectUrl;
          }
        );
      } catch (error) {
        console.error(
          "Unable to load client profile photo:",
          error
        );

        clearProfilePhoto();
      }
    };

  const loadProjects =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/client/projects"
          );

        const data =
          response.data || [];

        setProjects(data);

        if (data.length > 0) {
          const firstProjectId =
            data[0].projectId ??
            data[0].id;

          const id =
            String(
              firstProjectId
            );

          setSelectedProjectId(
            id
          );

          await loadDashboard(
            id
          );
        } else {
          setDashboard(null);
        }
      } catch (error) {
        console.error(
          "Unable to load client projects:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load your projects."
          )
        );
      } finally {
        setLoading(false);
      }
    };

  const loadDashboard =
    async (projectId) => {
      if (!projectId) {
        setDashboard(null);
        return;
      }

      try {
        setLoadingProject(true);
        setError("");

        const response =
          await api.get(
            `/client/projects/${projectId}/dashboard`
          );

        setDashboard(
          response.data
        );
      } catch (error) {
        console.error(
          "Unable to load project dashboard:",
          error
        );

        setDashboard(null);

        setError(
          getErrorMessage(
            error,
            "Unable to load project information."
          )
        );
      } finally {
        setLoadingProject(
          false
        );
      }
    };

  const handleProjectChange =
    async (event) => {
      const id =
        event.target.value;

      setSelectedProjectId(id);

      await loadDashboard(id);
    };

  const handlePortalNavigation =
    () => {
      setShowProfile(false);
    };

  const handleProfileOpen =
    () => {
      setShowProfile(true);
      setError("");
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

  const formatCurrency = (
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
      `${value}T00:00:00`
    ).toLocaleDateString(
      "en-GB"
    );
  };

  const getDisplayName =
    () => {
      return (
        profile?.fullName ||
        username
      );
    };

  const getProfileInitial =
    () => {
      return getDisplayName()
        .charAt(0)
        .toUpperCase();
    };

  if (loading) {
    return (
      <div className="client-full-loading">
        Loading client
        portal...
      </div>
    );
  }

  return (
    <div className="client-shell">
      <aside className="client-sidebar">
        <div className="client-brand">
          <div className="client-brand-mark">
            C
          </div>

          <div>
            <h2>CPMS</h2>

            <p>
              Client Portal
            </p>
          </div>
        </div>

        <div className="client-nav-label">
          Client Portal
        </div>

        <nav className="client-nav">
          <NavLink
            to="/client"
            end
            onClick={
              handlePortalNavigation
            }
          >
            <span className="client-nav-icon">
              OV
            </span>

            Overview
          </NavLink>

          <NavLink
            to="/client/project"
            onClick={
              handlePortalNavigation
            }
          >
            <span className="client-nav-icon">
              PR
            </span>

            Project Details
          </NavLink>

          <NavLink
            to="/client/payments"
            onClick={
              handlePortalNavigation
            }
          >
            <span className="client-nav-icon">
              PY
            </span>

            Payments
          </NavLink>

          <NavLink
            to="/client/photos"
            onClick={
              handlePortalNavigation
            }
          >
            <span className="client-nav-icon">
              PH
            </span>

            Site Photos
          </NavLink>

          <NavLink
            to="/client/documents"
            onClick={
              handlePortalNavigation
            }
          >
            <span className="client-nav-icon">
              DC
            </span>

            Documents
          </NavLink>

          <button
            type="button"
            className={
              showProfile
                ? "client-profile-nav-button active"
                : "client-profile-nav-button"
            }
            onClick={
              handleProfileOpen
            }
          >
            <span className="client-nav-icon">
              PF
            </span>

            My Profile
          </button>
        </nav>

        <div className="client-sidebar-footer">
          <button
            type="button"
            className="client-user-card client-user-card-button"
            onClick={
              handleProfileOpen
            }
          >
            <div className="client-user-avatar client-user-avatar-photo">
              {profilePhotoUrl ? (
                <img
                  src={
                    profilePhotoUrl
                  }
                  alt="Profile"
                />
              ) : (
                getProfileInitial()
              )}
            </div>

            <div>
              <strong>
                {getDisplayName()}
              </strong>

              <span>
                CLIENT
              </span>
            </div>
          </button>

          <button
            type="button"
            className="client-signout"
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

      <main className="client-main">
        {!showProfile && (
          <header className="client-topbar">
            <div>
              <p className="client-greeting">
                {getGreeting()},
              </p>

              <h1>
                {getDisplayName()}
              </h1>
            </div>

            {projects.length >
              0 && (
              <div className="client-project-selector">
                <label>
                  Current Project
                </label>

                <select
                  value={
                    selectedProjectId
                  }
                  onChange={
                    handleProjectChange
                  }
                >
                  {projects.map(
                    (project) => {
                      const id =
                        project.projectId ??
                        project.id;

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {
                            project.projectName
                          }
                        </option>
                      );
                    }
                  )}
                </select>
              </div>
            )}
          </header>
        )}

        {showProfile ? (
          <ClientProfile
            onBack={() =>
              setShowProfile(
                false
              )
            }
            onProfileUpdated={
              loadProfile
            }
          />
        ) : (
          <>
            {error && (
              <div className="client-alert-error">
                {error}
              </div>
            )}

            {projects.length ===
            0 ? (
              <div className="client-empty-card">
                <h2>
                  No projects
                  assigned
                </h2>

                <p>
                  There are
                  currently no
                  projects assigned
                  to your client
                  account.
                </p>
              </div>
            ) : (
              <Outlet
                context={{
                  selectedProjectId,
                  dashboard,
                  loadingProject,
                  formatCurrency,
                  formatDate,
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ClientLayout;