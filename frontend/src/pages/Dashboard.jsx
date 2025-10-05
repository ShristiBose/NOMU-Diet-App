// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../index.css"; // global CSS

const Dashboard = () => {
  // Dummy data
  const [stats] = useState({
    totalUsers: 1200,
    activeUsers: 350,
    newSignups: 50,
  });

  const growthData = [
    { month: "Jan", users: 100 },
    { month: "Feb", users: 200 },
    { month: "Mar", users: 400 },
    { month: "Apr", users: 700 },
    { month: "May", users: 1200 },
  ];

  const conditionData = [
    { name: "Diabetes", value: 400 },
    { name: "Hypertension", value: 300 },
    { name: "Obesity", value: 500 },
  ];

  const COLORS = ["#16a34a", "#65a30d", "#facc15"];

  const reviews = [
    { user: "Alice", rating: 5, comment: "Great app!", date: "2025-10-01" },
    { user: "Bob", rating: 4, comment: "Very helpful.", date: "2025-10-02" },
    { user: "Charlie", rating: 5, comment: "Love the diet recommendations!", date: "2025-10-03" },
  ];

  return (
    <>
      <Navbar />

      <main className="user-main">
        {/* Stats Cards */}
        <div className="meal-grid">
          <div className="meal-card slide-in">
            <div className="meal-type">Total Users</div>
            <p className="text-xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="meal-card slide-in">
            <div className="meal-type">Active Users</div>
            <p className="text-xl font-bold">{stats.activeUsers}</p>
          </div>
          <div className="meal-card slide-in">
            <div className="meal-type">New Signups</div>
            <p className="text-xl font-bold">{stats.newSignups}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="dashboard-charts">
          <div className="line-chart-wrapper">
            <h2 className="section-title">User Growth</h2>
            <LineChart width={600} height={300} data={growthData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </div>

          <div className="pie-chart-wrapper">
            <h2 className="section-title">Condition Distribution</h2>
            <PieChart width={400} height={300}>
              <Pie
                data={conditionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {conditionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="user-section">
          <h2 className="section-title">Customer Reviews</h2>
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="meal-card slide-in"
              style={{ padding: "1rem", marginBottom: "1rem" }}
            >
              <p className="font-semibold">{rev.user} ({rev.rating}⭐)</p>
              <p>{rev.comment}</p>
              <p className="text-sm text-gray-500">{rev.date}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Dashboard;
