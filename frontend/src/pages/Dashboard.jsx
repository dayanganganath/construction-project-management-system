import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../styles/dashboard-polish.css";

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
      console.error(
        "Initial dashboard load error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response =
        await api.get("/projects");

      setProjects(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error loading projects:",
        error
      );
    }
  };

  const loadOverallDashboard = async () => {
    try {
      const response =
        await api.get(
          "/dashboard/summary"
        );

      setSummary({
        totalClients:
          response.data.totalClients || 0,

        totalProjects:
          response.data.totalProjects || 0,

        ongoingProjects:
          response.data.ongoingProjects || 0,

        totalProjectValue:
          response.data.totalProjectValue || 0,

        totalPayments:
          response.data.totalPayments || 0,

        totalExpenses:
          response.data.totalExpenses || 0,

        cashBalance:
          response.data.cashBalance || 0,

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
      console.error(
        "Overall dashboard load error:",
        error
      );
    }
  };

  const loadProjectDashboard =
    async (projectId) => {
      try {
        setLoading(true);

        const [
          projectResponse,
          financialResponse,
        ] =
          await Promise.all([
            api.get(
              `/projects/${projectId}`
            ),

            api.get(
              `/projects/${projectId}/financial-summary`
            ),
          ]);

        setProjectInfo(
          projectResponse.data
        );

        setSummary(
          (previousSummary) => ({
            ...previousSummary,

            projectBudget:
              financialResponse.data
                .projectBudget || 0,

            boqTotal:
              financialResponse.data
                .boqTotal || 0,

            totalPaid:
              financialResponse.data
                .totalPaid || 0,

            remainingBalance:
              financialResponse.data
                .remainingBalance || 0,

            totalExpenses:
              financialResponse.data
                .totalExpenses || 0,

            currentCashBalance:
              financialResponse.data
                .currentCashBalance || 0,

            latestProgressPercentage:
              financialResponse.data
                .latestProgressPercentage ||
              0,

            startDate:
              financialResponse.data
                .startDate || "",

            endDate:
              financialResponse.data
                .endDate || "",
          })
        );
      } catch (error) {
        console.error(
          "Project dashboard load error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  const handleProjectChange =
    async (event) => {
      const projectId =
        event.target.value;

      setSelectedProject(
        projectId
      );

      if (projectId === "") {
        try {
          setLoading(true);

          await loadOverallDashboard();
        } finally {
          setLoading(false);
        }

        return;
      }

      await loadProjectDashboard(
        projectId
      );
    };

  const money = (value) =>
    new Intl.NumberFormat(
      "en-LK",
      {
        style: "currency",
        currency: "LKR",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(value) || 0
    );

  const number = (value) =>
    new Intl.NumberFormat(
      "en-LK"
    ).format(
      Number(value) || 0
    );

  const progress = useMemo(
    () =>
      Math.min(
        100,
        Math.max(
          0,
          Number(
            summary.latestProgressPercentage
          ) || 0
        )
      ),
    [
      summary.latestProgressPercentage,
    ]
  );

  const paymentPercentage =
    useMemo(() => {
      const budget =
        Number(
          summary.projectBudget
        ) || 0;

      const paid =
        Number(
          summary.totalPaid
        ) || 0;

      if (budget <= 0) {
        return 0;
      }

      return Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (paid / budget) * 100
          )
        )
      );
    }, [
      summary.projectBudget,
      summary.totalPaid,
    ]);

  if (loading) {
    return (
      <div className="dashboard-polish-loading">
        <div className="dashboard-polish-spinner" />

        <h3>
          Loading dashboard
        </h3>

        <p>
          Preparing the latest
          project information...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-polish-page">
      <section className="dashboard-polish-hero">
        <div className="dashboard-polish-heading">
          <span className="dashboard-polish-eyebrow">
            CPMS Overview
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Monitor projects,
            financial performance
            and site operations from
            one place.
          </p>
        </div>

        <div className="dashboard-polish-filter-wrap">
          <label
            htmlFor="dashboard-project-filter"
          >
            Project View
          </label>

          <select
            id="dashboard-project-filter"
            className="dashboard-polish-project-filter"
            value={
              selectedProject
            }
            onChange={
              handleProjectChange
            }
          >
            <option value="">
              All Projects
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
                </option>
              )
            )}
          </select>
        </div>
      </section>

      {selectedProject === "" ? (
        <>
          <section className="dashboard-polish-section-heading">
            <div>
              <span>
                Portfolio Overview
              </span>

              <h2>
                Business at a
                glance
              </h2>
            </div>

            <p>
              Current totals across
              all construction
              projects.
            </p>
          </section>

          <section className="dashboard-polish-kpi-grid">
            <MetricCard
              label="Total Clients"
              value={number(
                summary.totalClients
              )}
              note="Registered clients"
              tone="blue"
            />

            <MetricCard
              label="Total Projects"
              value={number(
                summary.totalProjects
              )}
              note="All managed projects"
              tone="purple"
            />

            <MetricCard
              label="Ongoing Projects"
              value={number(
                summary.ongoingProjects
              )}
              note="Currently active"
              tone="orange"
            />

            <MetricCard
              label="Total Project Value"
              value={money(
                summary.totalProjectValue
              )}
              note="Combined project value"
              tone="cyan"
              large
            />

            <MetricCard
              label="Client Payments"
              value={money(
                summary.totalPayments
              )}
              note="Total received"
              tone="green"
              large
            />

            <MetricCard
              label="Total Expenses"
              value={money(
                summary.totalExpenses
              )}
              note="Recorded expenses"
              tone="red"
              large
            />

            <MetricCard
              label="Cash Balance"
              value={money(
                summary.cashBalance
              )}
              note="Current cash position"
              tone="navy"
              large
            />
          </section>

          <section className="dashboard-polish-overview-grid">
            <div className="dashboard-polish-panel dashboard-polish-panel-wide">
              <div className="dashboard-polish-panel-header">
                <div>
                  <span>
                    System Status
                  </span>

                  <h3>
                    Portfolio
                    snapshot
                  </h3>
                </div>

                <div className="dashboard-polish-status-pill">
                  Live
                </div>
              </div>

              <div className="dashboard-polish-snapshot-grid">
                <SnapshotItem
                  label="Active project ratio"
                  value={
                    summary.totalProjects >
                    0
                      ? `${Math.round(
                          (summary.ongoingProjects /
                            summary.totalProjects) *
                            100
                        )}%`
                      : "0%"
                  }
                />

                <SnapshotItem
                  label="Total projects"
                  value={number(
                    summary.totalProjects
                  )}
                />

                <SnapshotItem
                  label="Total clients"
                  value={number(
                    summary.totalClients
                  )}
                />

                <SnapshotItem
                  label="Cash position"
                  value={
                    Number(
                      summary.cashBalance
                    ) >= 0
                      ? "Positive"
                      : "Negative"
                  }
                />
              </div>
            </div>

            <div className="dashboard-polish-panel">
              <div className="dashboard-polish-panel-header">
                <div>
                  <span>
                    Quick View
                  </span>

                  <h3>
                    Financial
                    position
                  </h3>
                </div>
              </div>

              <div className="dashboard-polish-finance-list">
                <FinanceRow
                  label="Payments"
                  value={money(
                    summary.totalPayments
                  )}
                  tone="positive"
                />

                <FinanceRow
                  label="Expenses"
                  value={money(
                    summary.totalExpenses
                  )}
                  tone="negative"
                />

                <FinanceRow
                  label="Balance"
                  value={money(
                    summary.cashBalance
                  )}
                  tone="primary"
                  strong
                />
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {projectInfo && (
            <section className="dashboard-polish-project-card">
              <div className="dashboard-polish-project-top">
                <div>
                  <span className="dashboard-polish-eyebrow">
                    Selected Project
                  </span>

                  <h2>
                    {
                      projectInfo.projectName
                    }
                  </h2>

                  <p>
                    {projectInfo.description ||
                      "Project overview and financial performance."}
                  </p>
                </div>

                <span className="dashboard-polish-project-status">
                  {projectInfo.status ||
                    "N/A"}
                </span>
              </div>

              <div className="dashboard-polish-project-meta">
                <ProjectMeta
                  label="Client"
                  value={
                    projectInfo.client
                      ?.name || "-"
                  }
                />

                <ProjectMeta
                  label="Location"
                  value={
                    projectInfo.location ||
                    "-"
                  }
                />

                <ProjectMeta
                  label="Start Date"
                  value={
                    summary.startDate ||
                    "-"
                  }
                />

                <ProjectMeta
                  label="End Date"
                  value={
                    summary.endDate ||
                    "-"
                  }
                />
              </div>
            </section>
          )}

          <section className="dashboard-polish-section-heading">
            <div>
              <span>
                Project Financials
              </span>

              <h2>
                Current project
                position
              </h2>
            </div>

            <p>
              Budget, payments,
              expenses and progress
              for the selected
              project.
            </p>
          </section>

          <section className="dashboard-polish-kpi-grid dashboard-polish-project-kpis">
            <MetricCard
              label="Project Budget"
              value={money(
                summary.projectBudget
              )}
              note="Approved project value"
              tone="cyan"
              large
            />

            <MetricCard
              label="BOQ Total"
              value={money(
                summary.boqTotal
              )}
              note="Bill of quantities"
              tone="purple"
              large
            />

            <MetricCard
              label="Total Paid"
              value={money(
                summary.totalPaid
              )}
              note="Client payments"
              tone="green"
              large
            />

            <MetricCard
              label="Client Balance"
              value={money(
                summary.remainingBalance
              )}
              note="Outstanding balance"
              tone="orange"
              large
            />

            <MetricCard
              label="Total Expenses"
              value={money(
                summary.totalExpenses
              )}
              note="Project expenses"
              tone="red"
              large
            />

            <MetricCard
              label="Cash Balance"
              value={money(
                summary.currentCashBalance
              )}
              note="Current cash position"
              tone="navy"
              large
            />
          </section>

          <section className="dashboard-polish-overview-grid">
            <div className="dashboard-polish-panel">
              <div className="dashboard-polish-panel-header">
                <div>
                  <span>
                    Site Progress
                  </span>

                  <h3>
                    Physical
                    completion
                  </h3>
                </div>

                <strong className="dashboard-polish-percentage">
                  {progress}%
                </strong>
              </div>

              <ProgressBar
                value={progress}
                label={`${progress}% completed`}
              />

              <div className="dashboard-polish-progress-note">
                Latest recorded
                project progress
              </div>
            </div>

            <div className="dashboard-polish-panel">
              <div className="dashboard-polish-panel-header">
                <div>
                  <span>
                    Client Payments
                  </span>

                  <h3>
                    Payment
                    progress
                  </h3>
                </div>

                <strong className="dashboard-polish-percentage dashboard-polish-percentage-green">
                  {paymentPercentage}%
                </strong>
              </div>

              <ProgressBar
                value={
                  paymentPercentage
                }
                label={`${paymentPercentage}% of project budget received`}
                green
              />

              <div className="dashboard-polish-progress-note">
                {money(
                  summary.totalPaid
                )}{" "}
                received from{" "}
                {money(
                  summary.projectBudget
                )}
              </div>
            </div>

            <div className="dashboard-polish-panel">
              <div className="dashboard-polish-panel-header">
                <div>
                  <span>
                    Timeline
                  </span>

                  <h3>
                    Project dates
                  </h3>
                </div>
              </div>

              <div className="dashboard-polish-timeline">
                <div>
                  <span>
                    Start
                  </span>

                  <strong>
                    {summary.startDate ||
                      "-"}
                  </strong>
                </div>

                <div className="dashboard-polish-timeline-line" />

                <div>
                  <span>
                    End
                  </span>

                  <strong>
                    {summary.endDate ||
                      "-"}
                  </strong>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  tone,
  large = false,
}) {
  return (
    <article
      className={`dashboard-polish-metric dashboard-polish-${tone}`}
    >
      <div
        className={`dashboard-polish-metric-icon dashboard-polish-metric-icon-${tone}`}
      >
        <span />
      </div>

      <div className="dashboard-polish-metric-content">
        <p>
          {label}
        </p>

        <h3
          className={
            large
              ? "dashboard-polish-value-large"
              : ""
          }
        >
          {value}
        </h3>

        <span>
          {note}
        </span>
      </div>
    </article>
  );
}

function SnapshotItem({
  label,
  value,
}) {
  return (
    <div className="dashboard-polish-snapshot-item">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function FinanceRow({
  label,
  value,
  tone,
  strong = false,
}) {
  return (
    <div
      className={`dashboard-polish-finance-row dashboard-polish-finance-${tone}`}
    >
      <span>
        {label}
      </span>

      <strong
        className={
          strong
            ? "dashboard-polish-finance-strong"
            : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}

function ProjectMeta({
  label,
  value,
}) {
  return (
    <div className="dashboard-polish-project-meta-item">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function ProgressBar({
  value,
  label,
  green = false,
}) {
  return (
    <div className="dashboard-polish-progress-wrap">
      <div className="dashboard-polish-progress-track">
        <div
          className={`dashboard-polish-progress-fill ${
            green
              ? "dashboard-polish-progress-green"
              : ""
          }`}
          style={{
            width: `${value}%`,
          }}
        />
      </div>

      <span>
        {label}
      </span>
    </div>
  );
}

export default Dashboard;