import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

function LabourAttendance() {
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    projectId: "",
    workerId: "",
    attendanceType: "FULL_DAY",
    dailyRate: "",
    otAmount: "0",
    notes: "",
  });

  useEffect(() => {
    loadProjects();
    loadWorkers();
  }, []);

  useEffect(() => {
    if (formData.projectId) {
      loadProjectAttendance(formData.projectId);
    } else {
      setRecords([]);
    }
  }, [formData.projectId]);

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
      const response =
        await api.get("/projects");

      setProjects(
        response.data || []
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

  const loadWorkers = async () => {
    try {
      const response =
        await api.get("/workers/active");

      setWorkers(
        response.data || []
      );
    } catch (error) {
      console.error(
        "Error loading workers:",
        error
      );

      showAlert(
        "error",
        "Unable to load workers."
      );
    }
  };

  const loadProjectAttendance = async (
    projectId
  ) => {
    try {
      setLoading(true);

      const response =
        await api.get(
          `/labour-attendance/project/${projectId}`
        );

      const sorted = [
        ...(response.data || []),
      ].sort((a, b) => {
        const dateCompare =
          String(b.date || "").localeCompare(
            String(a.date || "")
          );

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return Number(b.id || 0) -
          Number(a.id || 0);
      });

      setRecords(sorted);
    } catch (error) {
      console.error(
        "Error loading attendance:",
        error
      );

      showAlert(
        "error",
        "Unable to load attendance records."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    if (name === "workerId") {
      const selectedWorker =
        workers.find(
          (worker) =>
            String(worker.id) ===
            String(value)
        );

      setFormData({
        ...formData,
        workerId: value,
        dailyRate:
          selectedWorker?.defaultDailyRate ??
          "",
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const calculatedTotal =
    useMemo(() => {
      const rate =
        Number(
          formData.dailyRate || 0
        );

      const ot =
        Number(
          formData.otAmount || 0
        );

      let baseAmount = 0;

      if (
        formData.attendanceType ===
        "FULL_DAY"
      ) {
        baseAmount = rate;
      }

      if (
        formData.attendanceType ===
        "HALF_DAY"
      ) {
        baseAmount =
          rate / 2;
      }

      if (
        formData.attendanceType ===
        "ABSENT"
      ) {
        baseAmount = 0;
      }

      return baseAmount + ot;
    }, [
      formData.dailyRate,
      formData.otAmount,
      formData.attendanceType,
    ]);

  const validateForm = () => {
    if (!formData.date) {
      showAlert(
        "error",
        "Date is required."
      );

      return false;
    }

    if (!formData.projectId) {
      showAlert(
        "error",
        "Please select a project / site."
      );

      return false;
    }

    if (!formData.workerId) {
      showAlert(
        "error",
        "Please select a worker."
      );

      return false;
    }

    if (
      formData.dailyRate === "" ||
      Number(
        formData.dailyRate
      ) < 0
    ) {
      showAlert(
        "error",
        "Please enter a valid daily rate."
      );

      return false;
    }

    if (
      Number(
        formData.otAmount || 0
      ) < 0
    ) {
      showAlert(
        "error",
        "OT amount cannot be negative."
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
      date: formData.date,

      attendanceType:
        formData.attendanceType,

      dailyRate:
        Number(
          formData.dailyRate
        ),

      otAmount:
        Number(
          formData.otAmount || 0
        ),

      notes:
        formData.notes.trim() ||
        null,

      worker: {
        id: Number(
          formData.workerId
        ),
      },

      project: {
        id: Number(
          formData.projectId
        ),
      },
    };

    try {
      setLoading(true);

      await api.post(
        "/labour-attendance",
        payload
      );

      showAlert(
        "success",
        "Attendance saved successfully."
      );

      setFormData({
        ...formData,
        workerId: "",
        attendanceType: "FULL_DAY",
        dailyRate: "",
        otAmount: "0",
        notes: "",
      });

      await loadProjectAttendance(
        formData.projectId
      );
    } catch (error) {
      console.error(
        "Error saving attendance:",
        error
      );

      showAlert(
        "error",
        typeof error.response?.data ===
          "string"
          ? error.response.data
          : "Unable to save attendance."
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

  const getAttendanceLabel = (
    type
  ) => {
    switch (type) {
      case "FULL_DAY":
        return "Full Day";

      case "HALF_DAY":
        return "Half Day";

      case "ABSENT":
        return "Absent";

      default:
        return type || "-";
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Labour Attendance
          </h1>

          <p>
            Record daily worker
            attendance, wages and OT by
            project / site.
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
          Add Daily Attendance
        </h2>

        <form
          className="client-form"
          onSubmit={handleSubmit}
        >
          <div>
            <label>
              Date *
            </label>

            <input
              type="date"
              name="date"
              value={
                formData.date
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div>
            <label>
              Project / Site *
            </label>

            <select
              name="projectId"
              value={
                formData.projectId
              }
              onChange={
                handleChange
              }
            >
              <option value="">
                Select Project / Site
              </option>

              {projects.map(
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
          </div>

          <div>
            <label>
              Worker *
            </label>

            <select
              name="workerId"
              value={
                formData.workerId
              }
              onChange={
                handleChange
              }
            >
              <option value="">
                Select Worker
              </option>

              {workers.map(
                (worker) => (
                  <option
                    key={
                      worker.id
                    }
                    value={
                      worker.id
                    }
                  >
                    {worker.name}

                    {worker.tradeType
                      ? ` - ${worker.tradeType}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label>
              Attendance Type *
            </label>

            <select
              name="attendanceType"
              value={
                formData.attendanceType
              }
              onChange={
                handleChange
              }
            >
              <option value="FULL_DAY">
                Full Day
              </option>

              <option value="HALF_DAY">
                Half Day
              </option>

              <option value="ABSENT">
                Absent
              </option>
            </select>
          </div>

          <div>
            <label>
              Daily Rate *
            </label>

            <input
              type="number"
              name="dailyRate"
              min="0"
              step="0.01"
              value={
                formData.dailyRate
              }
              onChange={
                handleChange
              }
              placeholder="Daily rate"
            />
          </div>

          <div>
            <label>
              OT Amount
            </label>

            <input
              type="number"
              name="otAmount"
              min="0"
              step="0.01"
              value={
                formData.otAmount
              }
              onChange={
                handleChange
              }
              placeholder="0"
            />
          </div>

          <div>
            <label>
              Total Earned
            </label>

            <input
              type="text"
              value={`Rs. ${formatAmount(
                calculatedTotal
              )}`}
              readOnly
            />
          </div>

          <div>
            <label>
              Notes
            </label>

            <input
              type="text"
              name="notes"
              value={
                formData.notes
              }
              onChange={
                handleChange
              }
              placeholder="Example: Block work / painting"
            />
          </div>

          <div>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              Save Attendance
            </button>
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
              Attendance History
            </h2>

            <p>
              {formData.projectId
                ? `${records.length} record(s)`
                : "Select a project to view records"}
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
              <th>Worker</th>
              <th>Trade</th>
              <th>
                Attendance
              </th>
              <th>
                Daily Rate
              </th>
              <th>OT</th>
              <th>
                Total Earned
              </th>
              <th>Notes</th>
            </tr>
          </thead>

          <tbody>
            {!formData.projectId ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  Select a project /
                  site first.
                </td>
              </tr>
            ) : !loading &&
              records.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  No attendance
                  records found.
                </td>
              </tr>
            ) : (
              records.map(
                (record) => (
                  <tr
                    key={
                      record.id
                    }
                  >
                    <td>
                      {record.date ||
                        "-"}
                    </td>

                    <td>
                      <strong>
                        {record.worker
                          ?.name ||
                          "-"}
                      </strong>
                    </td>

                    <td>
                      {record.worker
                        ?.tradeType ||
                        "-"}
                    </td>

                    <td>
                      {getAttendanceLabel(
                        record.attendanceType
                      )}
                    </td>

                    <td>
                      Rs.{" "}
                      {formatAmount(
                        record.dailyRate
                      )}
                    </td>

                    <td>
                      Rs.{" "}
                      {formatAmount(
                        record.otAmount
                      )}
                    </td>

                    <td>
                      <strong>
                        Rs.{" "}
                        {formatAmount(
                          record.totalEarned
                        )}
                      </strong>
                    </td>

                    <td>
                      {record.notes ||
                        "-"}
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

export default LabourAttendance;