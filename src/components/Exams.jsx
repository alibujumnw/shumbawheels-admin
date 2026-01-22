// components/Exams.jsx
import React, { useState } from "react";
import { Table, Button, Badge, Form, InputGroup, Card, Alert, Row, Col } from "react-bootstrap"; // Added Row, Col here

const Exams = () => {
  const [exams] = useState([]); // Empty array for now as per screenshot
  const [searchQuery, setSearchQuery] = useState("");

  // Sample exam names for reference
  const examNames = [
    "Road Rules Test 1",
    "Traffic Signs Quiz",
    "Driving Theory Exam",
    "Final Driving Test",
    "Practice Exam 1",
    "Practice Exam 2",
    "Night Driving Assessment",
    "Highway Rules Test",
  ];

  // Status options
  const statusOptions = [
    { value: "passed", label: "Passed", variant: "success" },
    { value: "failed", label: "Failed", variant: "danger" },
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "in-progress", label: "In Progress", variant: "info" },
  ];

  const filteredExams = exams.filter((exam) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Check if query is a number (for score filtering)
    if (!isNaN(query) && query.trim() !== '') {
      const scoreThreshold = parseInt(query);
      return exam.score >= scoreThreshold;
    }
    
    // Otherwise search in text fields
    return (
      exam.studentName?.toLowerCase().includes(query) ||
      exam.email?.toLowerCase().includes(query) ||
      exam.examName?.toLowerCase().includes(query) ||
      exam.status?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Exams Management</h4>
          <p className="text-muted mb-0">View all exam results - Read only access</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary">
            <i className="bi bi-download me-2"></i>
            Export Results
          </Button>
          <Button variant="outline-success">
            <i className="bi bi-bar-chart me-2"></i>
            View Analytics
          </Button>
        </div>
      </div>

      {/* Search Bar with Tip */}
      <div className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Search by student name, email, exam name, or enter score (e.g., 85 for scores ≥85)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        <div className="mt-2">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Tip: Enter a number to find all exams with that score or higher
          </small>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-primary fw-bold">0</h1>
              <p className="text-muted mb-0">Total Exams</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-success fw-bold">0</h1>
              <p className="text-muted mb-0">Passed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-danger fw-bold">0</h1>
              <p className="text-muted mb-0">Failed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-warning fw-bold">0%</h1>
              <p className="text-muted mb-0">Pass Rate</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Exams Table */}
      <div className="bg-white rounded shadow-sm">
        <Table responsive hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="fw-medium p-3">Student Name</th>
              <th className="fw-medium p-3">Email</th>
              <th className="fw-medium p-3">Exam Name</th>
              <th className="fw-medium p-3">Score</th>
              <th className="fw-medium p-3">Date Taken</th>
              <th className="fw-medium p-3" style={{ width: "120px" }}>
                Status
              </th>
              <th className="fw-medium p-3" style={{ width: "150px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredExams.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-5">
                  <div className="text-muted mb-3">
                    <i className="bi bi-clipboard-data fs-1"></i>
                  </div>
                  <h5 className="fw-medium">No exams available</h5>
                  <p className="text-muted mb-4">
                    No exam results found. Exam data will appear here when available.
                  </p>
                  <Button variant="outline-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Sample Exam Data
                  </Button>
                </td>
              </tr>
            ) : (
              filteredExams.map((exam, index) => (
                <tr key={index}>
                  <td className="p-3 fw-medium">{exam.studentName}</td>
                  <td className="p-3">{exam.email}</td>
                  <td className="p-3">
                    <div className="fw-medium">{exam.examName}</div>
                  </td>
                  <td className="p-3">
                    <div className="d-flex align-items-center">
                      <span className="fw-bold me-2">{exam.score}%</span>
                      {exam.score >= 70 ? (
                        <i className="bi bi-arrow-up-circle text-success"></i>
                      ) : (
                        <i className="bi bi-arrow-down-circle text-danger"></i>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {new Date(exam.dateTaken).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="p-3">
                    <Badge 
                      bg={exam.status === 'passed' ? 'success' : 
                          exam.status === 'failed' ? 'danger' : 
                          exam.status === 'pending' ? 'warning' : 'info'} 
                      className="px-3 py-1"
                    >
                      {exam.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm">
                        <i className="bi bi-eye me-1"></i>
                        View
                      </Button>
                      <Button variant="outline-info" size="sm">
                        <i className="bi bi-printer me-1"></i>
                        Print
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Pagination and Info */}
        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <div className="text-muted">
            Showing {filteredExams.length} of {exams.length} exams
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" disabled>
              &lt; Previous
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
              Next &gt;
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <Alert variant="info" className="mt-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-info-circle fs-4 me-3"></i>
          <div>
            <h6 className="alert-heading mb-1">Exam Management Information</h6>
            <p className="mb-0 small">
              This section provides read-only access to all exam results. For detailed analytics, 
              use the "View Analytics" button. Export functionality is available for reporting purposes.
            </p>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default Exams;