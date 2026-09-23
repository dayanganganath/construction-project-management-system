import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [summary, setSummary] = useState({
    totalClients: 0,
    totalProjects: 0,
    ongoingProjects: 0,
    totalProjectValue: 0,
    totalPayments: 0,
    totalExpenses: 0,
    cashBalance: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get("/dashboard/summary");
      setSummary(response.data);
    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  };

  const money = (value) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const cards = [
  ["Total Clients", summary.totalClients, "blue"],
  ["Total Projects", summary.totalProjects, "purple"],
  ["Ongoing Projects", summary.ongoingProjects, "orange"],
  ["Project Value", money(summary.totalProjectValue), "cyan"],
  ["Total Payments", money(summary.totalPayments), "green"],
  ["Total Expenses", money(summary.totalExpenses), "red"],
  ["Cash Balance", money(summary.cashBalance), "navy"],
];

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Construction Project Management System</p>
      </div>

      <div className="dashboard-grid">
  {cards.map(([title, value, color]) => (
    <div className={`dashboard-card ${color}`} key={title}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  ))}
</div>
    </div>
  );
}

export default Dashboard;