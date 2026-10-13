import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function Contractors() {
  const [contractors, setContractors] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    selectedContractorId,
    setSelectedContractorId,
  ] = useState("");

  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState("");

  const [
    linkedAccount,
    setLinkedAccount,
  ] = useState(null);

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState("");

  const [
    assignedProjects,
    setAssignedProjects,
  ] = useState([]);

  const [
    loadingAccount,
    setLoadingAccount,
  ] = useState(false);

  const [
    loadingProjects,
    setLoadingProjects,
  ] = useState(false);

  const [
    assigningAccount,
    setAssigningAccount,
  ] = useState(false);

  const [
    assigningProject,
    setAssigningProject,
  ] = useState(false);

  const [alert, setAlert] =
    useState({
      type: "",
      message: "",
    });

  const [form, setForm] =
    useState({
      name: "",
      type: "SUBCONTRACTOR",
      tradeType: "",
      phone: "",
      address: "",
      nicOrRegistrationNo: "",
      bankName: "",
      bankAccountName: "",
      bankAccountNumber: "",
      active: true,
    });

  useEffect(() => {
    loadInitialData();
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
      error.response?.data?.message ||
      fallback
    );
  };

  const loadInitialData =
    async () => {
      await Promise.all([
        loadContractors(),
        loadUsers(),
        loadProjects(),
      ]);
    };

  const loadContractors =
    async () => {
      try {
        const response =
          await api.get(
            "/contractors"
          );

        setContractors(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          error
        );

        showAlert(
          "error",
          "Unable to load contractors."
        );
      }
    };

  const loadUsers =
    async () => {
      try {
        const response =
          await api.get(
            "/users"
          );

        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        setUsers(
          data.filter(
            (user) =>
              user.role ===
                "CONTRACTOR" &&
              user.active !==
                false
          )
        );
      } catch (error) {
        console.error(
          error
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
          error
        );

        showAlert(
          "error",
          "Unable to load projects."
        );
      }
    };

  const loadLinkedAccount =
    async (
      contractorId
    ) => {
      try {
        setLoadingAccount(
          true
        );

        const response =
          await api.get(
            `/contractors/${contractorId}/user`
          );

        setLinkedAccount(
          response.data
        );

        setSelectedUserId(
          response.data?.linked
            ? String(
                response.data.userId
              )
            : ""
        );
      } catch (error) {
        console.error(
          error
        );

        setLinkedAccount(
          null
        );
      } finally {
        setLoadingAccount(
          false
        );
      }
    };

  const loadAssignedProjects =
    async (
      contractorId
    ) => {
      try {
        setLoadingProjects(
          true
        );

        const response =
          await api.get(
            `/contractor-project-assignments/contractor/${contractorId}`
          );

        setAssignedProjects(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          error
        );

        setAssignedProjects(
          []
        );

        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to load contractor project assignments."
          )
        );
      } finally {
        setLoadingProjects(
          false
        );
      }
    };

  const handleChange = (
    e
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm({
      ...form,

      [name]:
        type ===
        "checkbox"
          ? checked
          : value,
    });
  };

  const validateForm =
    () => {
      if (
        !form.name.trim()
      ) {
        showAlert(
          "error",
          "Contractor name is required."
        );

        return false;
      }

      if (
        form.name
          .trim()
          .length < 2
      ) {
        showAlert(
          "error",
          "Contractor name must contain at least 2 characters."
        );

        return false;
      }

      return true;
    };

  const resetForm =
    () => {
      setForm({
        name: "",
        type:
          "SUBCONTRACTOR",
        tradeType: "",
        phone: "",
        address: "",
        nicOrRegistrationNo:
          "",
        bankName: "",
        bankAccountName:
          "",
        bankAccountNumber:
          "",
        active: true,
      });

      setEditingId(
        null
      );
    };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (
        !validateForm()
      ) {
        return;
      }

      const data = {
        name:
          form.name.trim(),

        type:
          form.type,

        tradeType:
          form.tradeType.trim(),

        phone:
          form.phone.trim(),

        address:
          form.address.trim(),

        nicOrRegistrationNo:
          form.nicOrRegistrationNo.trim(),

        bankName:
          form.bankName.trim(),

        bankAccountName:
          form.bankAccountName.trim(),

        bankAccountNumber:
          form.bankAccountNumber.trim(),

        active:
          form.active,
      };

      try {
        if (
          editingId
        ) {
          await api.put(
            `/contractors/${editingId}`,
            data
          );

          showAlert(
            "success",
            "Contractor updated successfully."
          );
        } else {
          await api.post(
            "/contractors",
            data
          );

          showAlert(
            "success",
            "Contractor added successfully."
          );
        }

        resetForm();

        await loadContractors();
      } catch (error) {
        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to save contractor."
          )
        );
      }
    };

  const handleEdit = (
    contractor
  ) => {
    setEditingId(
      contractor.id
    );

    setForm({
      name:
        contractor.name ||
        "",

      type:
        contractor.type ||
        "SUBCONTRACTOR",

      tradeType:
        contractor.tradeType ||
        "",

      phone:
        contractor.phone ||
        "",

      address:
        contractor.address ||
        "",

      nicOrRegistrationNo:
        contractor.nicOrRegistrationNo ||
        "",

      bankName:
        contractor.bankName ||
        "",

      bankAccountName:
        contractor.bankAccountName ||
        "",

      bankAccountNumber:
        contractor.bankAccountNumber ||
        "",

      active:
        contractor.active ??
        true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete =
    async (id) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this contractor?"
        )
      ) {
        return;
      }

      try {
        await api.delete(
          `/contractors/${id}`
        );

        showAlert(
          "success",
          "Contractor deleted successfully."
        );

        if (
          String(id) ===
          String(
            selectedContractorId
          )
        ) {
          setSelectedContractorId(
            ""
          );

          setLinkedAccount(
            null
          );

          setAssignedProjects(
            []
          );
        }

        await loadContractors();
      } catch (error) {
        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to delete contractor."
          )
        );
      }
    };

  const handleSelectedContractor =
    async (e) => {
      const contractorId =
        e.target.value;

      setSelectedContractorId(
        contractorId
      );

      setSelectedUserId(
        ""
      );

      setSelectedProjectId(
        ""
      );

      setLinkedAccount(
        null
      );

      setAssignedProjects(
        []
      );

      if (
        contractorId
      ) {
        await Promise.all([
          loadLinkedAccount(
            contractorId
          ),

          loadAssignedProjects(
            contractorId
          ),
        ]);
      }
    };

  const handleAssignAccount =
    async () => {
      if (
        !selectedContractorId ||
        !selectedUserId
      ) {
        showAlert(
          "error",
          "Please select contractor and user account."
        );

        return;
      }

      try {
        setAssigningAccount(
          true
        );

        const response =
          await api.put(
            `/contractors/${selectedContractorId}/user/${selectedUserId}`
          );

        setLinkedAccount(
          response.data
        );

        showAlert(
          "success",
          "Login account assigned successfully."
        );
      } catch (error) {
        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to assign login account."
          )
        );
      } finally {
        setAssigningAccount(
          false
        );
      }
    };

  const handleRemoveAccount =
    async () => {
      if (
        !window.confirm(
          "Remove contractor login account?"
        )
      ) {
        return;
      }

      try {
        await api.delete(
          `/contractors/${selectedContractorId}/user`
        );

        setSelectedUserId(
          ""
        );

        setLinkedAccount({
          linked: false,
        });

        showAlert(
          "success",
          "Login account removed."
        );
      } catch (error) {
        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to remove login account."
          )
        );
      }
    };

  const handleAssignProject =
    async () => {
      if (
        !selectedContractorId
      ) {
        showAlert(
          "error",
          "Please select a contractor."
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
        setAssigningProject(
          true
        );

        await api.post(
          "/contractor-project-assignments",
          null,
          {
            params: {
              contractorId:
                selectedContractorId,

              projectId:
                selectedProjectId,
            },
          }
        );

        setSelectedProjectId(
          ""
        );

        showAlert(
          "success",
          "Project assigned successfully."
        );

        await loadAssignedProjects(
          selectedContractorId
        );
      } catch (error) {
        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to assign project."
          )
        );
      } finally {
        setAssigningProject(
          false
        );
      }
    };

  const handleRemoveProject =
    async (
      projectId
    ) => {
      if (
        !window.confirm(
          "Remove this project from the contractor?"
        )
      ) {
        return;
      }

      try {
        await api.delete(
          "/contractor-project-assignments",
          {
            params: {
              contractorId:
                selectedContractorId,

              projectId:
                projectId,
            },
          }
        );

        showAlert(
          "success",
          "Project assignment removed."
        );

        await loadAssignedProjects(
          selectedContractorId
        );
      } catch (error) {
        showAlert(
          "error",
          getErrorMessage(
            error,
            "Unable to remove project assignment."
          )
        );
      }
    };

  const assignedProjectIds =
    assignedProjects.map(
      (assignment) =>
        String(
          assignment.projectId
        )
    );

  const availableProjects =
    projects.filter(
      (project) =>
        !assignedProjectIds.includes(
          String(
            project.id
          )
        )
    );

  const selectedContractor =
    contractors.find(
      (contractor) =>
        String(
          contractor.id
        ) ===
        String(
          selectedContractorId
        )
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Contractors &
            Subcontractors
          </h1>

          <p>
            Manage contractors,
            login accounts and
            project/site access.
          </p>
        </div>
      </div>

      <Alert
        type={
          alert.type
        }
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

      <div className="form-card">
        <h2>
          {editingId
            ? "Edit Contractor"
            : "Add New Contractor"}
        </h2>

        <form
          className="client-form"
          onSubmit={
            handleSubmit
          }
        >
          <input
            name="name"
            placeholder="Contractor / Subcontractor Name *"
            value={
              form.name
            }
            onChange={
              handleChange
            }
          />

          <select
            name="type"
            value={
              form.type
            }
            onChange={
              handleChange
            }
          >
            <option value="SUBCONTRACTOR">
              Subcontractor
            </option>

            <option value="CONTRACTOR">
              Contractor
            </option>
          </select>

          <input
            name="tradeType"
            placeholder="Trade / Work Type"
            value={
              form.tradeType
            }
            onChange={
              handleChange
            }
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={
              form.phone
            }
            onChange={
              handleChange
            }
          />

          <input
            name="nicOrRegistrationNo"
            placeholder="NIC / Registration No."
            value={
              form.nicOrRegistrationNo
            }
            onChange={
              handleChange
            }
          />

          <input
            name="address"
            placeholder="Address"
            value={
              form.address
            }
            onChange={
              handleChange
            }
          />

          <input
            name="bankName"
            placeholder="Bank Name"
            value={
              form.bankName
            }
            onChange={
              handleChange
            }
          />

          <input
            name="bankAccountName"
            placeholder="Bank Account Name"
            value={
              form.bankAccountName
            }
            onChange={
              handleChange
            }
          />

          <input
            name="bankAccountNumber"
            placeholder="Bank Account Number"
            value={
              form.bankAccountNumber
            }
            onChange={
              handleChange
            }
          />

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

            Active
          </label>

          <button
            className="primary-button"
            type="submit"
          >
            {editingId
              ? "Update Contractor"
              : "Add Contractor"}
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

      <div className="form-card">
        <h2>
          Contractor Access
        </h2>

        <p>
          Select a contractor to
          manage login and project
          access.
        </p>

        <select
          value={
            selectedContractorId
          }
          onChange={
            handleSelectedContractor
          }
          style={{
            marginTop:
              "15px",
          }}
        >
          <option value="">
            Select Contractor
          </option>

          {contractors.map(
            (
              contractor
            ) => (
              <option
                key={
                  contractor.id
                }
                value={
                  contractor.id
                }
              >
                {
                  contractor.name
                }{" "}
                -{" "}
                {
                  contractor.type
                }
              </option>
            )
          )}
        </select>
      </div>

      {selectedContractorId && (
        <>
          <div className="form-card">
            <h2>
              Login Account
            </h2>

            {loadingAccount ? (
              <p>
                Loading...
              </p>
            ) : (
              <>
                <select
                  value={
                    selectedUserId
                  }
                  onChange={(e) =>
                    setSelectedUserId(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select CONTRACTOR User
                  </option>

                  {users.map(
                    (
                      user
                    ) => (
                      <option
                        key={
                          user.id
                        }
                        value={
                          user.id
                        }
                      >
                        {
                          user.username
                        }
                      </option>
                    )
                  )}
                </select>

                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    handleAssignAccount
                  }
                  disabled={
                    !selectedUserId ||
                    assigningAccount
                  }
                  style={{
                    marginLeft:
                      "10px",
                  }}
                >
                  {assigningAccount
                    ? "Saving..."
                    : linkedAccount?.linked
                    ? "Change Account"
                    : "Assign Account"}
                </button>

                {linkedAccount?.linked && (
                  <div
                    style={{
                      marginTop:
                        "15px",
                    }}
                  >
                    <strong>
                      Current Login:
                    </strong>{" "}
                    {
                      linkedAccount.username
                    }

                    <button
                      type="button"
                      className="delete-button"
                      onClick={
                        handleRemoveAccount
                      }
                      style={{
                        marginLeft:
                          "15px",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="form-card">
            <h2>
              Project / Site
              Assignment
            </h2>

            <p>
              Contractor:{" "}
              <strong>
                {
                  selectedContractor
                    ?.name
                }
              </strong>
            </p>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "minmax(250px, 1fr) auto",

                gap:
                  "15px",

                marginTop:
                  "20px",
              }}
            >
              <select
                value={
                  selectedProjectId
                }
                onChange={(e) =>
                  setSelectedProjectId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Project /
                  Site
                </option>

                {availableProjects.map(
                  (
                    project
                  ) => (
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
                  !selectedProjectId ||
                  assigningProject
                }
              >
                {assigningProject
                  ? "Assigning..."
                  : "Assign Project"}
              </button>
            </div>
          </div>

          <div className="table-card">
            <h2>
              Assigned Projects
            </h2>

            {loadingProjects ? (
              <p>
                Loading
                assignments...
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
                      Assigned
                    </th>

                    <th>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {assignedProjects.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="5"
                      >
                        No projects
                        assigned.
                      </td>
                    </tr>
                  ) : (
                    assignedProjects.map(
                      (
                        assignment
                      ) => (
                        <tr
                          key={
                            assignment.id
                          }
                        >
                          <td>
                            {
                              assignment.projectName
                            }
                          </td>

                          <td>
                            {assignment.location ||
                              "-"}
                          </td>

                          <td>
                            {assignment.status ||
                              "-"}
                          </td>

                          <td>
                            {assignment.assignedDate ||
                              "-"}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                handleRemoveProject(
                                  assignment.projectId
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
        </>
      )}

      <div className="table-card">
        <h2>
          Contractor List
        </h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Trade</th>
              <th>Phone</th>
              <th>Status</th>
              <th>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {contractors.length ===
            0 ? (
              <tr>
                <td colSpan="7">
                  No contractors
                  found.
                </td>
              </tr>
            ) : (
              contractors.map(
                (
                  contractor
                ) => (
                  <tr
                    key={
                      contractor.id
                    }
                  >
                    <td>
                      {
                        contractor.id
                      }
                    </td>

                    <td>
                      {
                        contractor.name
                      }
                    </td>

                    <td>
                      {
                        contractor.type
                      }
                    </td>

                    <td>
                      {contractor.tradeType ||
                        "-"}
                    </td>

                    <td>
                      {contractor.phone ||
                        "-"}
                    </td>

                    <td>
                      {contractor.active
                        ? "Active"
                        : "Inactive"}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEdit(
                            contractor
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDelete(
                            contractor.id
                          )
                        }
                      >
                        Delete
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
  );
}

export default Contractors;