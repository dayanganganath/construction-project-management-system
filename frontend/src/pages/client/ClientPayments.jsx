import {
  useOutletContext,
} from "react-router-dom";

function ClientPayments() {
  const {
    dashboard,
    loadingProject,
    formatCurrency,
  } = useOutletContext();

  if (loadingProject) {
    return (
      <div className="client-page-loading">
        Loading payment
        information...
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const projectValue =
    Number(
      dashboard.projectValue ||
        0
    );

  const totalPaid =
    Number(
      dashboard.totalPaid ||
        0
    );

  const balance =
    Number(
      dashboard.paymentBalance ??
        projectValue -
          totalPaid
    );

  const percentage =
    projectValue > 0
      ? Math.min(
          100,
          Math.round(
            (totalPaid /
              projectValue) *
              100
          )
        )
      : 0;

  return (
    <div className="client-page">
      <div className="client-page-heading">
        <div>
          <span className="client-eyebrow">
            Financial Overview
          </span>

          <h2>
            Payments
          </h2>

          <p>
            View the overall client
            payment position for
            your selected project.
          </p>
        </div>
      </div>

      <div className="client-kpi-grid client-payment-kpis">
        <div className="client-kpi-card">
          <span>
            Project Value
          </span>

          <strong>
            {formatCurrency(
              projectValue
            )}
          </strong>
        </div>

        <div className="client-kpi-card">
          <span>
            Total Paid
          </span>

          <strong>
            {formatCurrency(
              totalPaid
            )}
          </strong>
        </div>

        <div className="client-kpi-card">
          <span>
            Balance
          </span>

          <strong>
            {formatCurrency(
              balance
            )}
          </strong>
        </div>

        <div className="client-kpi-card">
          <span>
            Payment Progress
          </span>

          <strong>
            {percentage}%
          </strong>
        </div>
      </div>

      <section className="client-card client-payment-card">
        <div className="client-card-heading">
          <div>
            <h3>
              Payment Progress
            </h3>

            <p>
              Amount paid against
              the total project
              value
            </p>
          </div>

          <strong>
            {percentage}%
          </strong>
        </div>

        <div className="client-payment-track">
          <div
            className="client-payment-value"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <div className="client-payment-breakdown">
          <div>
            <span>
              Paid
            </span>

            <strong>
              {formatCurrency(
                totalPaid
              )}
            </strong>
          </div>

          <div>
            <span>
              Remaining
            </span>

            <strong>
              {formatCurrency(
                balance
              )}
            </strong>
          </div>
        </div>
      </section>

      <div className="client-info-note">
        This page displays the
        client-visible project
        payment summary. Internal
        company costs, contractor
        rates and profit
        information are not shown
        in the client portal.
      </div>
    </div>
  );
}

export default ClientPayments;