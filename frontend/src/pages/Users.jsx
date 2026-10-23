import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";
import Alert from "../components/Alert";

import "../styles/client-invite.css";

function Users() {
  const [users, setUsers] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState("");

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState("");

  const [
    assignments,
    setAssignments,
  ] = useState([]);

  const [
    loadingAssignments,
    setLoadingAssignments,
  ] = useState(false);

  const [assigning, setAssigning] =
    useState(false);

  const [
    inviteLoading,
    setInviteLoading,
  ] = useState(false);

  const [
    activationInvite,
    setActivationInvite,
  ] = useState(null);

  const [alert, setAlert] =
    useState({
      type: "",
      message: "",
    });

  const [form, setForm] =
    useState({
      username: "",
      password: "",
      role: "CLIENT",
      active: true,
    });

  const [
    inviteForm,
    setInviteForm,
  ] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadUsers();
    loadProjects();
  }, []);

  const showAlert = (
    type,
    message
  ) => {
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
        ?.message ||
      fallback
    );
  };

  const loadUsers =
    async () => {
      try {
        const response =
          await api.get(
            "/users"
          );

        setUsers(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Error loading users:",
          error
        );

        showAlert(
          "error",
          "Unable to load users."
        );
      }
    };

  const loadProjects =
    async () => {
      try {
        const response =
          await api.get(
            "/projects"
          );

        setProjects(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
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

  const loadAssignments =
    async (userId) => {
      if (!userId) {
        setAssignments([]);
        return;
      }

      try {
        setLoadingAssignments(
          true
        );

        const response =
          await api.get(
            `/user-project-assignments/user/${userId}`
          );

        setAssignments(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Error loading assignments:",
          error
        );

        setAssignments([]);

        showAlert(
          "error",
          "Unable to load project assignments."
        );
      } finally {
        setLoadingAssignments(
          false
        );
      }
    };

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleInviteChange = (
    event
  ) => {
    setInviteForm({
      ...inviteForm,
      [event.target.name]:
        event.target.value,
    });

    setActivationInvite(
      null
    );
  };

  const validateForm = () => {
    if (
      !form.username.trim()
    ) {
      showAlert(
        "error",
        "Username is required."
      );

      return false;
    }

    if (
      !editingId &&
      !form.password.trim()
    ) {
      showAlert(
        "error",
        "Password is required."
      );

      return false;
    }

    if (
      form.password &&
      form.password.length < 6
    ) {
      showAlert(
        "error",
        "Password must be at least 6 characters."
      );

      return false;
    }

    if (!form.role) {
      showAlert(
        "error",
        "User role is required."
      );

      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      username: "",
      password: "",
      role: "CLIENT",
      active: true,
    });

    setEditingId(null);
  };

  const resetInviteForm =
    () => {
      setInviteForm({
        username: "",
        fullName: "",
        email: "",
        phone: "",
      });
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      const userData = {
        username:
          form.username.trim(),

        password:
          form.password,

        role:
          form.role,

        active:
          form.active,
      };

      try {
        if (editingId) {
          await api.put(
            `/users/${editingId}`,
            userData
          );

          showAlert(
            "success",
            "User updated successfully."
          );
        } else {
          await api.post(
            "/users",
            userData
          );

          showAlert(
            "success",
            "User created successfully."
          );
        }

        resetForm();

        await loadUsers();
      } catch (error) {
        console.error(
          "Error saving user:",
          error
        );

        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to save user."
          )
        );
      }
    };

  const handleCreateInvite =
    async (event) => {
      event.preventDefault();

      if (
        !inviteForm.username.trim()
      ) {
        showAlert(
          "error",
          "Client username is required."
        );

        return;
      }

      if (
        !inviteForm.fullName.trim()
      ) {
        showAlert(
          "error",
          "Client full name is required."
        );

        return;
      }

      if (
        !inviteForm.email.trim()
      ) {
        showAlert(
          "error",
          "Client email is required."
        );

        return;
      }

      try {
        setInviteLoading(true);

        setActivationInvite(
          null
        );

        const response =
          await api.post(
            "/users/client-invites",
            {
              username:
                inviteForm.username
                  .trim(),

              fullName:
                inviteForm.fullName
                  .trim(),

              email:
                inviteForm.email
                  .trim(),

              phone:
                inviteForm.phone
                  .trim(),
            }
          );

        const invite =
          response.data;

        const activationUrl =
          `${window.location.origin}/login?activation=${encodeURIComponent(
            invite.token
          )}`;

        setActivationInvite({
          ...invite,
          activationUrl,
        });

        resetInviteForm();

        showAlert(
          "success",
          "Client invitation created successfully."
        );

        await loadUsers();
      } catch (error) {
        console.error(
          "Client invite error:",
          error
        );

        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to create client invitation."
          )
        );
      } finally {
        setInviteLoading(
          false
        );
      }
    };

  const handleRegenerateInvite =
    async (user) => {
      try {
        const response =
          await api.post(
            `/users/${user.id}/activation-invite`
          );

        const invite =
          response.data;

        const activationUrl =
          `${window.location.origin}/login?activation=${encodeURIComponent(
            invite.token
          )}`;

        setActivationInvite({
          ...invite,
          activationUrl,
        });

        showAlert(
          "success",
          "New activation invitation generated."
        );
      } catch (error) {
        console.error(
          "Invite regeneration error:",
          error
        );

        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to generate activation invitation."
          )
        );
      }
    };

  const copyActivationLink =
    async () => {
      if (
        !activationInvite
          ?.activationUrl
      ) {
        return;
      }

      try {
        await navigator.clipboard
          .writeText(
            activationInvite
              .activationUrl
          );

        showAlert(
          "success",
          "Activation link copied."
        );
      } catch {
        showAlert(
          "error",
          "Unable to copy activation link."
        );
      }
    };

  const handleEdit = (
    user
  ) => {
    setEditingId(
      user.id
    );

    setForm({
      username:
        user.username || "",

      password: "",

      role:
        user.role || "CLIENT",

      active:
        user.active ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete =
    async (id) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this user?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await api.delete(
          `/users/${id}`
        );

        if (
          String(
            selectedUserId
          ) === String(id)
        ) {
          setSelectedUserId(
            ""
          );

          setSelectedProjectId(
            ""
          );

          setAssignments([]);
        }

        if (
          String(
            editingId
          ) === String(id)
        ) {
          resetForm();
        }

        showAlert(
          "success",
          "User deleted successfully."
        );

        await loadUsers();
      } catch (error) {
        console.error(
          "Error deleting user:",
          error
        );

        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to delete user."
          )
        );
      }
    };

  const handleAssignmentUserChange =
    async (event) => {
      const userId =
        event.target.value;

      setSelectedUserId(
        userId
      );

      setSelectedProjectId(
        ""
      );

      await loadAssignments(
        userId
      );
    };

  const handleAssignProject =
    async () => {
      if (!selectedUserId) {
        showAlert(
          "error",
          "Please select a user."
        );

        return;
      }

      if (
        !selectedProjectId
      ) {
        showAlert(
          "error",
          "Please select a project."
        );

        return;
      }

      try {
        setAssigning(true);

        await api.post(
          "/user-project-assignments",
          null,
          {
            params: {
              userId:
                selectedUserId,

              projectId:
                selectedProjectId,
            },
          }
        );

        showAlert(
          "success",
          "Project assigned successfully."
        );

        setSelectedProjectId(
          ""
        );

        await loadAssignments(
          selectedUserId
        );
      } catch (error) {
        console.error(
          "Error assigning project:",
          error
        );

        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to assign project."
          )
        );
      } finally {
        setAssigning(false);
      }
    };

  const handleUnassignProject =
    async (projectId) => {
      const confirmed =
        window.confirm(
          "Remove this project from the selected user?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await api.delete(
          "/user-project-assignments",
          {
            params: {
              userId:
                selectedUserId,

              projectId,
            },
          }
        );

        showAlert(
          "success",
          "Project assignment removed."
        );

        await loadAssignments(
          selectedUserId
        );
      } catch (error) {
        console.error(
          "Error removing assignment:",
          error
        );

        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to remove project assignment."
          )
        );
      }
    };

  const selectedUser =
    users.find(
      (user) =>
        String(user.id) ===
        String(
          selectedUserId
        )
    ) || null;

  const assignedProjectIds =
    assignments.map(
      (assignment) =>
        String(
          assignment.projectId
        )
    );

  const availableProjects =
    projects.filter(
      (project) =>
        !assignedProjectIds
          .includes(
            String(
              project.id
            )
          )
    );

  const assignableUsers =
    users.filter(
      (user) =>
        user.active !== false &&
        (
          user.role ===
            "CLIENT" ||
          user.role ===
            "SUPERVISOR"
        )
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Users & Project Access
          </h1>

          <p>
            Manage system users,
            secure client invitations
            and project access.
          </p>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={
          alert.message
        }
        onClose={() =>
          setAlert({
            type: "",
            message: "",
          })
        }
      />

      <section className="client-invite-card">
        <div className="client-invite-heading">
          <div>
            <span>
              CLIENT ONBOARDING
            </span>

            <h2>
              Invite Client
            </h2>

            <p>
              Create an inactive
              client account and
              generate a secure
              one-time activation
              link.
            </p>
          </div>

          <div className="client-invite-security">
            Secure Activation
          </div>
        </div>

        <form
          className="client-invite-form"
          onSubmit={
            handleCreateInvite
          }
        >
          <div>
            <label>
              Username *
            </label>

            <input
              type="text"
              name="username"
              value={
                inviteForm.username
              }
              onChange={
                handleInviteChange
              }
              placeholder="client.username"
            />
          </div>

          <div>
            <label>
              Full Name *
            </label>

            <input
              type="text"
              name="fullName"
              value={
                inviteForm.fullName
              }
              onChange={
                handleInviteChange
              }
              placeholder="Client full name"
            />
          </div>

          <div>
            <label>
              Email *
            </label>

            <input
              type="email"
              name="email"
              value={
                inviteForm.email
              }
              onChange={
                handleInviteChange
              }
              placeholder="client@example.com"
            />
          </div>

          <div>
            <label>
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={
                inviteForm.phone
              }
              onChange={
                handleInviteChange
              }
              placeholder="0771234567"
            />
          </div>

          <div className="client-invite-action">
            <button
              type="submit"
              className="primary-button"
              disabled={
                inviteLoading
              }
            >
              {inviteLoading
                ? "Creating..."
                : "Create Client Invite"}
            </button>
          </div>
        </form>

        {activationInvite && (
          <div className="activation-result">
            <div>
              <span className="activation-result-label">
                ACTIVATION LINK
              </span>

              <h3>
                Invite Ready
              </h3>

              <p>
                Send this link only
                to{" "}
                <strong>
                  {activationInvite.username}
                </strong>
                .
              </p>
            </div>

            <div className="activation-link-row">
              <input
                type="text"
                readOnly
                value={
                  activationInvite.activationUrl
                }
              />

              <button
                type="button"
                onClick={
                  copyActivationLink
                }
              >
                Copy Link
              </button>
            </div>

            <div className="activation-meta">
              <span>
                Email:{" "}
                {activationInvite.email ||
                  "-"}
              </span>

              <span>
                Expires:{" "}
                {activationInvite.expiresAt
                  ? new Date(
                      activationInvite.expiresAt
                    ).toLocaleString()
                  : "-"}
              </span>
            </div>

            <p className="activation-warning">
              This raw activation
              token is shown only in
              this response. Create a
              new invite if the link
              is lost.
            </p>
          </div>
        )}
      </section>

      <div className="form-card">
        <h2>
          {editingId
            ? "Edit User"
            : "Create Regular User"}
        </h2>

        <form
          className="user-form"
          onSubmit={
            handleSubmit
          }
        >
          <input
            type="text"
            name="username"
            placeholder="Username *"
            value={
              form.username
            }
            onChange={
              handleChange
            }
          />

          <input
            type="password"
            name="password"
            placeholder={
              editingId
                ? "New Password (leave blank to keep current)"
                : "Password *"
            }
            value={
              form.password
            }
            onChange={
              handleChange
            }
          />

          <select
            name="role"
            value={form.role}
            onChange={
              handleChange
            }
          >
            <option value="ADMIN">
              Admin
            </option>

            <option value="MANAGER">
              Manager
            </option>

            <option value="SUPERVISOR">
              Supervisor
            </option>

            <option value="CLIENT">
              Client
            </option>

            <option value="CONTRACTOR">
              Contractor /
              Subcontractor
            </option>
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="active"
              checked={
                form.active
              }
              onChange={
                handleChange
              }
            />

            Active User
          </label>

          <button
            type="submit"
            className="primary-button"
          >
            {editingId
              ? "Update User"
              : "Create User"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-button"
              onClick={
                resetForm
              }
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="table-card">
        <h2>
          System Users
        </h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>
                Username
              </th>
              <th>Role</th>
              <th>Status</th>
              <th>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.length ===
            0 ? (
              <tr>
                <td colSpan="5">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map(
                (user) => (
                  <tr
                    key={
                      user.id
                    }
                  >
                    <td>
                      {user.id}
                    </td>

                    <td>
                      {
                        user.username
                      }
                    </td>

                    <td>
                      {user.role}
                    </td>

                    <td>
                      <span
                        className={
                          user.active
                            ? "user-status active"
                            : "user-status inactive"
                        }
                      >
                        {user.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="user-action-row">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEdit(
                              user
                            )
                          }
                        >
                          Edit
                        </button>

                        {user.role ===
                          "CLIENT" &&
                          user.active ===
                            false && (
                            <button
                              type="button"
                              className="invite-button"
                              onClick={() =>
                                handleRegenerateInvite(
                                  user
                                )
                              }
                            >
                              New Invite
                            </button>
                          )}

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              user.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="form-card">
        <h2>
          Project Assignment
        </h2>

        <p>
          Assign projects/sites to
          Clients and Supervisors.
          Contractor access is
          managed from the
          Contractors page.
        </p>

        <div className="assignment-grid">
          <select
            value={
              selectedUserId
            }
            onChange={
              handleAssignmentUserChange
            }
          >
            <option value="">
              Select User
            </option>

            {assignableUsers.map(
              (user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.username}
                  {" - "}
                  {user.role}
                </option>
              )
            )}
          </select>

          <select
            value={
              selectedProjectId
            }
            onChange={(event) =>
              setSelectedProjectId(
                event.target
                  .value
              )
            }
            disabled={
              !selectedUserId
            }
          >
            <option value="">
              Select Project / Site
            </option>

            {availableProjects.map(
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

          <button
            type="button"
            className="primary-button"
            onClick={
              handleAssignProject
            }
            disabled={
              !selectedUserId ||
              !selectedProjectId ||
              assigning
            }
          >
            {assigning
              ? "Assigning..."
              : "Assign Project"}
          </button>
        </div>

        {selectedUser && (
          <div className="selected-user-note">
            <strong>
              Selected User:
            </strong>{" "}
            {selectedUser.username} (
            {selectedUser.role})
          </div>
        )}
      </div>

      {selectedUserId && (
        <div className="table-card">
          <h2>
            Assigned Projects
          </h2>

          {loadingAssignments ? (
            <p>
              Loading assigned
              projects...
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    Project
                  </th>
                  <th>
                    Location
                  </th>
                  <th>
                    Status
                  </th>
                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {assignments.length ===
                0 ? (
                  <tr>
                    <td colSpan="4">
                      No projects
                      assigned.
                    </td>
                  </tr>
                ) : (
                  assignments.map(
                    (
                      assignment
                    ) => (
                      <tr
                        key={
                          assignment.id ||
                          `${assignment.userId}-${assignment.projectId}`
                        }
                      >
                        <td>
                          {assignment.projectName ||
                            assignment.project
                              ?.projectName ||
                            "-"}
                        </td>

                        <td>
                          {assignment.location ||
                            assignment.project
                              ?.location ||
                            "-"}
                        </td>

                        <td>
                          {assignment.status ||
                            assignment.project
                              ?.status ||
                            "-"}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleUnassignProject(
                                assignment.projectId ||
                                  assignment.project
                                    ?.id
                              )
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Users;