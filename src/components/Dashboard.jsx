// components/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Card, Badge, Table } from "react-bootstrap";
import Answers from "./Answers";
import Notes from "./Notes";
import Exams from "./Exams";
import Questions from "./Questions";
import Payments from "./Payments";
import Booking from "./Booking"; 
import Settings from "./Settings";
import ApkUpload from "./ApkUpload"; // Import the new APK Upload component

const Dashboard = () => {
  const navigate = useNavigate();
  const userPhone = localStorage.getItem("userPhone");
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const stats = {
    totalUsers: 54,
    examsToday: 0,
    passRate: "0%",
    payments: 1,
    passVsFail: "100/0",
  };

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
    { key: "apk-upload", label: "APK Upload", icon: "cloud-upload" }, // New APK Upload menu item
    { key: "settings", label: "Settings", icon: "gear" },
  ];

  // Users Component (keeping this inline since it's simple)
  const Users = () => (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Users</h4>
        <Button variant="primary">
          <i className="bi bi-plus-circle me-2"></i>
          Add New User
        </Button>
      </div>
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-medium p-3">#</th>
                <th className="fw-medium p-3">Name</th>
                <th className="fw-medium p-3">Phone</th>
                <th className="fw-medium p-3">Email</th>
                <th className="fw-medium p-3">Status</th>
                <th className="fw-medium p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((user) => (
                <tr key={user}>
                  <td className="p-3">{user}</td>
                  <td className="p-3">User {user}</td>
                  <td className="p-3">+123456789{user}</td>
                  <td className="p-3">user{user}@example.com</td>
                  <td className="p-3">
                    <Badge bg="success" className="px-3 py-1">
                      Active
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm">
                        <i className="bi bi-eye me-1"></i>
                        View
                      </Button>
                      <Button variant="outline-warning" size="sm">
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-between align-items-center p-3 border-top">
            <div className="text-muted">Showing 5 of 54 users</div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" size="sm" disabled>
                « Previous
              </Button>
              <Button variant="outline-primary" size="sm" className="active">
                1
              </Button>
              <Button variant="outline-secondary" size="sm">
                2
              </Button>
              <Button variant="outline-secondary" size="sm">
                3
              </Button>
              <Button variant="outline-secondary" size="sm">
                Next »
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

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
        return <ApkUpload />; // Render APK Upload component
      case "settings":
        return <Settings />; // Use the imported Settings component
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
            <h4 className="mb-0 fw-bold">Admin Panel</h4>
          </Col>

          <Col xs={6} className="text-end">
            <span className="me-3 fw-medium">{userPhone || "Admin"}</span>
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

          {/* Footer - Only show on dashboard view */}
          {activeView === "dashboard" && (
            <div className="text-center mt-4 text-muted small p-4 border-top">
              © {new Date().getFullYear()} Shumba Wheels Admin Panel
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;