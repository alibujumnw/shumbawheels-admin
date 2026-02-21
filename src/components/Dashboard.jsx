// components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Card, Badge, Table } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import Users from "./Users";
import Answers from "./Answers";
import Notes from "./Notes";
import Exams from "./Exams";
import Questions from "./Questions";
import Payments from "./Payments";
import Booking from "./Booking"; 
import Settings from "./Settings";
import ApkUpload from "./ApkUpload";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");

  // Redirect if not authenticated (additional safety)
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const [stats, setStats] = useState({
    totalUsers: 54,
    examsToday: 0,
    passRate: "0%",
    payments: 1,
    passVsFail: "100/0",
  });

  useEffect(() => {
    const token = user?.token || 
                  localStorage.getItem("token") ||
                  localStorage.getItem("userToken") ||
                  localStorage.getItem("authToken");
    
    if (!token) return;
    
    // Fetch payments count
    fetch("https://api.shumbawheels.co.zw/api/admin/count-payments", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.data !== "undefined") {
          setStats((s) => ({ ...s, payments: data.data }));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch payments count", err);
      });

    // Fetch total users count
    fetch("https://api.shumbawheels.co.zw/api/admin/count-clients", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.data !== "undefined") {
          setStats((s) => ({ ...s, totalUsers: data.data }));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch total users", err);
      });
  }, [user]); // Re-run when user changes

  // Show loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const monthlyExams = [
    { month: "Jan", count: 14 },
    { month: "Feb", count: 15 },
    { month: "Mar", count: 16 },
    { month: "Apr", count: 17 },
    { month: "May", count: 18 },
    { month: "Jun", count: 19 },
    { month: "Jul", count: 20 },
    { month: "Aug", count: 21 },
    { month: "Sep", count: 22 },
    { month: "Oct", count: 23 },
    { month: "Nov", count: 24 },
    { month: "Dec", count: 25 },
  ];

  // Updated menu items for sidebar including APK Upload
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: "speedometer2" },
    { key: "users", label: "Users", icon: "people" },
    { key: "questions", label: "Questions", icon: "question-circle" },
    { key: "answers", label: "Answers", icon: "check-circle" },
    { key: "notes", label: "Notes", icon: "journal-text" },
    { key: "exams", label: "Exams", icon: "clipboard-data" },
    { key: "payments", label: "Payment History", icon: "credit-card" },
    { key: "booking", label: "Booking", icon: "calendar-check" },
    { key: "apk-upload", label: "APK Upload", icon: "cloud-upload" },
    { key: "settings", label: "Settings", icon: "gear" },
  ];

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case "users":
        return <Users />;
      case "questions":
        return <Questions />;
      case "answers":
        return <Answers />;
      case "notes":
        return <Notes />;
      case "exams":
        return <Exams />;
      case "payments":
        return <Payments />;
      case "booking":
        return <Booking />;
      case "apk-upload":
        return <ApkUpload />;
      case "settings":
        return <Settings />;
      case "dashboard":
      default:
        return (
          <>
            {/* Stats */}
            <Row className="g-4 mb-4 px-4 pt-4">
              {[
                ["Total Users", stats.totalUsers, "primary", "people-fill"],
                ["Exams Today", stats.examsToday, "info", "clipboard-data"],
                ["Pass Rate", stats.passRate, "success", "trophy"],
                ["Payments", stats.payments, "warning", "credit-card"],
              ].map(([label, value, color, icon]) => (
                <Col md={3} key={label}>
                  <Card className="shadow-sm border-0 h-100 text-center">
                    <Card.Body>
                      <i className={`bi bi-${icon} fs-2 text-${color}`}></i>
                      <h6 className="text-muted mt-2">{label}</h6>
                      <h3 className="fw-bold">{value}</h3>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pass vs Fail */}
            <div className="px-4 mb-4">
              <Card className="shadow-sm border-0">
                <Card.Body className="text-center">
                  <h5 className="fw-bold mb-3">Pass vs Fail</h5>
                  <h1 className="text-success fw-bold">{stats.passVsFail}</h1>
                  <Badge bg="success" className="me-2">
                    Pass 100%
                  </Badge>
                  <Badge bg="danger">Fail 0%</Badge>
                </Card.Body>
              </Card>
            </div>

            {/* Exams Table */}
            <div className="px-4">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="fw-bold mb-3">Monthly Exams</h5>
                  <Table bordered responsive className="text-center">
                    <thead>
                      <tr>
                        {monthlyExams.map((e) => (
                          <th key={e.month}>{e.month}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {monthlyExams.map((e) => (
                          <td key={e.month}>{e.count}</td>
                        ))}
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* ================= HEADER ================= */}
      <div className="bg-white shadow-sm px-4 py-3">
        <Row className="align-items-center">
          <Col xs={6} className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="me-3"
            >
              <i className="bi bi-list"></i>
            </Button>
            <h4 className="mb-0 fw-bold">Shumba Wheels Admin Panel</h4>
          </Col>

          <Col xs={6} className="text-end">
            <span className="me-3 fw-medium">{user?.phone || "Admin"}</span>
            <Button variant="outline-danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Col>
        </Row>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-grow-1 d-flex" style={{ width: "100vw" }}>
        {/* Sidebar */}
        {showSidebar && (
          <div
            style={{
              width: "240px",
              backgroundColor: "#212529",
              color: "#fff",
            }}
            className="p-3"
          >
            <h6 className="mb-4 text-white">Menu</h6>
            {menuItems.map((item) => (
              <Button
                key={item.key}
                variant={activeView === item.key ? "primary" : "outline-light"}
                className="w-100 text-start mb-2 d-flex align-items-center"
                onClick={() => setActiveView(item.key)}
              >
                <i className={`bi bi-${item.icon} me-2`}></i>
                {item.label}
              </Button>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className="flex-grow-1"
          style={{ overflowY: "auto", height: "calc(100vh - 70px)" }}
        >
          {renderContent()}

          {/* Footer */}
          <div className="text-center mt-4 text-muted small p-4 border-top">
            © {new Date().getFullYear()} Shumba Wheels Admin Panel
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;