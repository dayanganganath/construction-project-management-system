import { useEffect, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function Workers() {
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    phone: "",
    tradeType: "",
    defaultDailyRate: "",
    active: true,
  });

  useEffect(() => {
    loadWorkers();
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

  const loadWorkers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/workers");

      setWorkers(response.data || []);
    } catch (error) {
      console.error(
        "Error loading workers:",
        error
      );

      showAlert(
        "error",
        "Unable to load workers."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      nic: "",
      phone: "",
      tradeType: "",
      defaultDailyRate: "",
      active: true,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showAlert(
        "error",
        "Worker name is required."
      );

      return false;
    }

    if (
      formData.defaultDailyRate === "" ||
      Number(
        formData.defaultDailyRate
      ) < 0
    ) {
      showAlert(
        "error",
        "Please enter a valid daily rate."
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),

      nic:
        formData.nic.trim() || null,

      phone:
        formData.phone.trim() || null,

      tradeType:
        formData.tradeType.trim() ||
        null,

      defaultDailyRate:
        Number(
          formData.defaultDailyRate
        ),

      active: formData.active,
    };

    try {
      setLoading(true);

      if (editingId) {
        await api.put(
          `/workers/${editingId}`,
          payload
        );

        showAlert(
          "success",
          "Worker updated successfully."
        );
      } else {
        await api.post(
          "/workers",
          payload
        );

        showAlert(
          "success",
          "Worker added successfully."
        );
      }

      resetForm();

      await loadWorkers();
    } catch (error) {
      console.error(
        "Error saving worker:",
        error
      );

      showAlert(
        "error",
        typeof error.response?.data ===
          "string"
          ? error.response.data
          : "Unable to save worker."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (worker) => {
    setEditingId(worker.id);

    setFormData({
      name: worker.name || "",
      nic: worker.nic || "",
      phone: worker.phone || "",
      tradeType:
        worker.tradeType || "",
      defaultDailyRate:
        worker.defaultDailyRate ??
        "",
      active:
        worker.active !== false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDeactivate = async (
    worker
  ) => {
    const confirmed =
      window.confirm(
        `Deactivate ${worker.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      await api.delete(
        `/workers/${worker.id}`
      );

      showAlert(
        "success",
        "Worker deactivated successfully."
      );

      if (editingId === worker.id) {
        resetForm();
      }

      await loadWorkers();
    } catch (error) {
      console.error(
        "Error deactivating worker:",
        error
      );

      showAlert(
        "error",
        typeof error.response?.data ===
          "string"
          ? error.response.data
          : "Unable to deactivate worker."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Workers
          </h1>

          <p>
            Manage daily-paid
            workers, trades and
            default wage rates.
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
          {editingId
            ? "Edit Worker"
            : "Add Worker"}
        </h2>

        <form
          className="client-form"
          onSubmit={handleSubmit}
        >
          <div>
            <label>
              Worker Name *
            </label>

            <input
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              placeholder="Example: Sunil Perera"
            />
          </div>

          <div>
            <label>
              NIC
            </label>

            <input
              type="text"
              name="nic"
              value={
                formData.nic
              }
              onChange={
                handleChange
              }
              placeholder="NIC number"
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
                formData.phone
              }
              onChange={
                handleChange
              }
              placeholder="07XXXXXXXX"
            />
          </div>

          <div>
            <label>
              Trade Type
            </label>

            <select
              name="tradeType"
              value={
                formData.tradeType
              }
              onChange={
                handleChange
              }
            >
              <option value="">
                Select Trade
              </option>

              <option value="MASON">
                Mason
              </option>

              <option value="HELPER">
                Helper
              </option>

              <option value="CARPENTER">
                Carpenter
              </option>

              <option value="PAINTER">
                Painter
              </option>

              <option value="PLUMBER">
                Plumber
              </option>

              <option value="ELECTRICIAN">
                Electrician
              </option>

              <option value="TILER">
                Tiler
              </option>

              <option value="STEEL_FIXER">
                Steel Fixer
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>
          </div>

          <div>
            <label>
              Default Daily Rate *
            </label>

            <input
              type="number"
              name="defaultDailyRate"
              min="0"
              step="0.01"
              value={
                formData.defaultDailyRate
              }
              onChange={
                handleChange
              }
              placeholder="Example: 3500"
            />
          </div>

          {editingId && (
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                }}
              >
                <input
                  type="checkbox"
                  name="active"
                  checked={
                    formData.active
                  }
                  onChange={
                    handleChange
                  }
                />

                Active Worker
              </label>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems:
                "end",
            }}
          >
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {editingId
                ? "Update Worker"
                : "Add Worker"}
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
          </div>
        </form>
      </div>

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
            alignItems:
              "center",
            gap: "15px",
            marginBottom:
              "15px",
          }}
        >
          <div>
            <h2>
              Worker List
            </h2>

            <p>
              {workers.length} worker(s)
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
              <th>Name</th>
              <th>Trade</th>
              <th>NIC</th>
              <th>Phone</th>
              <th>
                Daily Rate
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
            workers.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  No workers found.
                </td>
              </tr>
            ) : (
              workers.map(
                (worker) => (
                  <tr
                    key={
                      worker.id
                    }
                  >
                    <td>
                      <strong>
                        {
                          worker.name
                        }
                      </strong>
                    </td>

                    <td>
                      {worker.tradeType ||
                        "-"}
                    </td>

                    <td>
                      {worker.nic ||
                        "-"}
                    </td>

                    <td>
                      {worker.phone ||
                        "-"}
                    </td>

                    <td>
                      Rs.{" "}
                      {formatAmount(
                        worker.defaultDailyRate
                      )}
                    </td>

                    <td>
                      {worker.active
                        ? "Active"
                        : "Inactive"}
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
                          onClick={() =>
                            handleEdit(
                              worker
                            )
                          }
                        >
                          Edit
                        </button>

                        {worker.active && (
                          <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                              handleDeactivate(
                                worker
                              )
                            }
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
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

export default Workers;