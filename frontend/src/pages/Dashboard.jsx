// src/pages/Dashboard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard({ userRole, onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  const renderRoleSpecificContent = () => {
    switch (userRole) {
      case "donor":
        return (
          <div className="role-content">
            <h2>🍱 Donor Dashboard</h2>
            <div className="dashboard-cards">
              <div className="card">
                <h3>Donate Food</h3>
                <p>Submit your food donation details</p>
                <button className="card-btn">Start Donation</button>
              </div>
              <div className="card">
                <h3>My Donations</h3>
                <p>View your donation history</p>
                <button className="card-btn">View History</button>
              </div>
              <div className="card">
                <h3>Impact</h3>
                <p>See how your donations helped</p>
                <button className="card-btn">View Impact</button>
              </div>
            </div>
          </div>
        );
      
      case "receiver":
        return (
          <div className="role-content">
            <h2>🧑‍🍳 Receiver Dashboard</h2>
            <div className="dashboard-cards">
              <div className="card">
                <h3>Available Donations</h3>
                <p>Browse available food donations</p>
                <button className="card-btn">Browse</button>
              </div>
              <div className="card">
                <h3>My Requests</h3>
                <p>Track your food requests</p>
                <button className="card-btn">View Requests</button>
              </div>
              <div className="card">
                <h3>Profile</h3>
                <p>Update your organization details</p>
                <button className="card-btn">Edit Profile</button>
              </div>
            </div>
          </div>
        );
      
      case "admin":
        return (
          <div className="role-content">
            <h2>🛡️ Admin Dashboard</h2>
            <div className="dashboard-cards">
              <div className="card">
                <h3>Manage Users</h3>
                <p>View and manage all users</p>
                <button className="card-btn">User Management</button>
              </div>
              <div className="card">
                <h3>All Donations</h3>
                <p>Monitor all donations</p>
                <button className="card-btn">View All</button>
              </div>
              <div className="card">
                <h3>Reports</h3>
                <p>Generate system reports</p>
                <button className="card-btn">Generate</button>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="role-content">
            <h2>Welcome!</h2>
            <p>Please select a role to continue.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>FoodShare Platform</h1>
        </div>
        <div className="nav-user">
          <span className="user-role">Role: {userRole || "Guest"}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>
      
      <div className="dashboard-main">
        <aside className="sidebar">
          <div className="user-info">
            <div className="avatar">
              {userRole ? userRole.charAt(0).toUpperCase() : "U"}
            </div>
            <h3>Welcome User!</h3>
            <p>{userRole || "User"} Account</p>
          </div>
          
          <ul className="sidebar-menu">
            <li className="active">Dashboard</li>
            <li>Profile</li>
            <li>Settings</li>
            <li>Help</li>
          </ul>
        </aside>
        
        <main className="dashboard-content">
          {renderRoleSpecificContent()}
          
          <div className="welcome-section">
            <h3>Welcome to FoodShare Platform</h3>
            <p>
              {userRole === "donor" 
                ? "Thank you for helping reduce food waste and feed those in need. Your donations make a difference in people's lives."
                : userRole === "receiver"
                ? "Find food donations to support your organization. We're here to help you access the resources you need."
                : userRole === "admin"
                ? "Manage the platform and ensure smooth operations. Monitor activities and help maintain the system."
                : "Welcome to our food sharing platform. Please login to access your dashboard."}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;