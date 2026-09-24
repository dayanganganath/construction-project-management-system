import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectInfo, setProjectInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalClients: 0,
    totalProjects: 0,
    ongoingProjects: 0,
    totalProjectValue: 0,
    totalPayments: 0,
    totalExpenses: 0,
    cashBalance: 0,

    projectBudget: 0,
    boqTotal: 0,
    totalPaid: 0,
    remainingBalance: 0,
    currentCashBalance: 0,
    latestProgressPercentage: 0,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        loadProjects(),
        loadOverallDashboard(),
      ]);
    } catch (error) {
      console.error("Initial dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const loadOverallDashboard = async () => {
    try {
      const response = await api.get("/dashboard/summary");

      setSummary({
        totalClients: response.data.totalClients || 0,
        totalProjects: response.data.totalProjects || 0,
        ongoingProjects: response.data.ongoingProjects || 0,
        totalProjectValue: response.data.totalProjectValue || 0,
        totalPayments: response.data.totalPayments || 0,
        totalExpenses: response.data.totalExpenses || 0,
        cashBalance: response.data.cashBalance || 0,

        projectBudget: 0,
        boqTotal: 0,
        totalPaid: 0,
        remainingBalance: 0,
        currentCashBalance: 0,
        latestProgressPercentage: 0,
        startDate: "",
        endDate: "",
      });

      setProjectInfo(null);
    } catch (error) {
      console.error("Overall dashboard load error:", error);
    }
  };

  const loadProjectDashboard = async (projectId) => {
    try {
      setLoading(true);

      const [projectResponse, financialResponse] =
        await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/financial-summary`),
        ]);

      setProjectInfo(projectResponse.data);

      setSummary((previousSummary) => ({
        ...previousSummary,

        projectBudget:
          financialResponse.data.projectBudget || 0,

        boqTotal:
          financialResponse.data.boqTotal || 0,

        totalPaid:
          financialResponse.data.totalPaid || 0,

        remainingBalance:
          financialResponse.data.remainingBalance || 0,

        totalExpenses:
          financialResponse.data.totalExpenses || 0,

        currentCashBalance:
          financialResponse.data.currentCashBalance || 0,

        latestProgressPercentage:
          financialResponse.data.latestProgressPercentage || 0,

        startDate:
          financialResponse.data.startDate || "",

        endDate:
          financialResponse.data.endDate || "",
      }));
    } catch (error) {
      console.error("Project dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;

    setSelectedProject(projectId);

    if (projectId === "") {
      try {
        setLoading(true);
        await loadOverallDashboard();
      } finally {
        setLoading(false);
      }
    } else {
      await loadProjectDashboard(projectId);
    }
  };

  const money = (value) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Construction Project Management System</p>
        </div>

        <select
          className="project-filter"
          value={selectedProject}
          onChange={handleProjectChange}
        >
          <option value="">All Projects</option>

          {projects.map((project) => (
            <option
              key={project.id}
              value={project.id}
            >
              {project.projectName}
            </option>
          ))}
        </select>
      </div>

      {selectedProject === "" ? (
        <div className="dashboard-grid">

          <div className="dashboard-card blue">
            <p>Total Clients</p>
            <h2>{summary.totalClients}</h2>
          </div>

          <div className="dashboard-card purple">
            <p>Total Projects</p>
            <h2>{summary.totalProjects}</h2>
          </div>

          <div className="dashboard-card orange">
            <p>Ongoing Projects</p>
            <h2>{summary.ongoingProjects}</h2>
          </div>

          <div className="dashboard-card cyan">
            <p>Total Project Value</p>
            <h2>
              {money(summary.totalProjectValue)}
            </h2>
          </div>

          <div className="dashboard-card green">
            <p>Total Payments</p>
            <h2>
              {money(summary.totalPayments)}
            </h2>
          </div>

          <div className="dashboard-card red">
            <p>Total Expenses</p>
            <h2>
              {money(summary.totalExpenses)}
            </h2>
          </div>

          <div className="dashboard-card navy">
            <p>Cash Balance</p>
            <h2>
              {money(summary.cashBalance)}
            </h2>
          </div>

        </div>
      ) : (
        <>
          {projectInfo && (
            <div className="selected-project-info">

              <div>
                <h2>
                  {projectInfo.projectName}
                </h2>

                {projectInfo.description && (
                  <p>
                    {projectInfo.description}
                  </p>
                )}
              </div>

              <div className="project-info-details">

                <p>
                  <strong>Client:</strong>{" "}
                  {projectInfo.client?.name || "-"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {projectInfo.location || "-"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {projectInfo.status || "-"}
                </p>

              </div>

            </div>
          )}

          <div className="dashboard-grid">

            <div className="dashboard-card cyan">
              <p>Project Budget</p>
              <h2>
                {money(summary.projectBudget)}
              </h2>
            </div>

            <div className="dashboard-card purple">
              <p>BOQ Total</p>
              <h2>
                {money(summary.boqTotal)}
              </h2>
            </div>

            <div className="dashboard-card green">
              <p>Total Paid</p>
              <h2>
                {money(summary.totalPaid)}
              </h2>
            </div>

            <div className="dashboard-card orange">
              <p>Client Balance</p>
              <h2>
                {money(summary.remainingBalance)}
              </h2>
            </div>

            <div className="dashboard-card red">
              <p>Total Expenses</p>
              <h2>
                {money(summary.totalExpenses)}
              </h2>
            </div>

            <div className="dashboard-card navy">
              <p>Current Cash Balance</p>
              <h2>
                {money(summary.currentCashBalance)}
              </h2>
            </div>

            <div className="dashboard-card blue">
              <p>Latest Progress</p>
              <h2>
                {summary.latestProgressPercentage || 0}%
              </h2>
            </div>

            <div className="dashboard-card cyan">
              <p>Start Date</p>
              <h2 className="date-value">
                {summary.startDate || "-"}
              </h2>
            </div>

            <div className="dashboard-card orange">
              <p>End Date</p>
              <h2 className="date-value">
                {summary.endDate || "-"}
              </h2>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;