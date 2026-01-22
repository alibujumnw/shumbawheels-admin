// components/Payments.jsx
import React, { useState } from "react";
import { Table, Button, Badge, Form, InputGroup, Card, Row, Col } from "react-bootstrap";

const Payments = () => {
  const [payments] = useState([
    {
      id: 1,
      studentName: "Unknown User (ID: )",
      email: "N/A",
      paymentMethod: "Ecocash",
      amount: 2.00,
      purpose: "Application_fee",
      status: "paid",
      dateCreated: "2025-11-11T23:13:45"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  // Calculate statistics
  const totalPayments = payments.length;
  const approvedPayments = payments.filter(p => p.status === 'paid' || p.status === 'approved').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      payment.studentName?.toLowerCase().includes(query) ||
      payment.email?.toLowerCase().includes(query) ||
      payment.paymentMethod?.toLowerCase().includes(query) ||
      payment.purpose?.toLowerCase().includes(query) ||
      payment.status?.toLowerCase().includes(query) ||
      payment.amount.toString().includes(query)
    );
  });

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Payments Management</h4>
          <p className="text-muted mb-0">View all payment transactions</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary">
            <i className="bi bi-plus-circle me-2"></i>
            Add Payment
          </Button>
          <Button variant="outline-success">
            <i className="bi bi-download me-2"></i>
            Export
          </Button>
        </div>
      </div>

      {/* Payment Statistics */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Payment Statistics</h5>
          <Row className="text-center">
            <Col md={3}>
              <div className="p-3">
                <h1 className="text-primary fw-bold">{totalPayments}</h1>
                <p className="text-muted mb-0">Total Payments</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3">
                <h1 className="text-success fw-bold">{approvedPayments}</h1>
                <p className="text-muted mb-0">Approved</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3">
                <h1 className="text-warning fw-bold">{pendingPayments}</h1>
                <p className="text-muted mb-0">Pending</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3">
                <h1 className="text-info fw-bold">${totalAmount.toFixed(2)}</h1>
                <p className="text-muted mb-0">Total Amount</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Search Bar */}
      <div className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Search by student name, email, payment method, purpose, status, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded shadow-sm">
        <Table responsive hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="fw-medium p-3">Student Name</th>
              <th className="fw-medium p-3">Email</th>
              <th className="fw-medium p-3">Payment Method</th>
              <th className="fw-medium p-3">Amount</th>
              <th className="fw-medium p-3">Purpose</th>
              <th className="fw-medium p-3" style={{ width: "100px" }}>
                Status
              </th>
              <th className="fw-medium p-3">Date Created</th>
              <th className="fw-medium p-3" style={{ width: "150px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id}>
                <td className="p-3 fw-medium">{payment.studentName}</td>
                <td className="p-3">{payment.email}</td>
                <td className="p-3">
                  <Badge bg="info" className="px-3 py-1">
                    {payment.paymentMethod}
                  </Badge>
                </td>
                <td className="p-3">
                  <span className="fw-bold text-success">
                    ${payment.amount.toFixed(2)}
                  </span>
                </td>
                <td className="p-3">
                  <Badge bg="secondary" className="px-3 py-1">
                    {payment.purpose}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge 
                    bg={payment.status === 'paid' ? 'success' : 
                        payment.status === 'pending' ? 'warning' : 
                        'info'} 
                    className="px-3 py-1"
                  >
                    {payment.status}
                  </Badge>
                </td>
                <td className="p-3">
                  {new Date(payment.dateCreated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </td>
                <td className="p-3">
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                      <i className="bi bi-eye me-1"></i>
                      View
                    </Button>
                    <Button variant="outline-success" size="sm">
                      <i className="bi bi-check-circle me-1"></i>
                      Approve
                    </Button>
                    <Button variant="outline-danger" size="sm">
                      <i className="bi bi-x-circle me-1"></i>
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pagination and Info */}
        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <div className="text-muted">
            Showing {filteredPayments.length} of {payments.length} payments
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

      {/* Payment Methods Summary */}
      <Card className="border-0 shadow-sm mt-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Payment Methods Summary</h5>
          <Row>
            <Col md={4}>
              <div className="d-flex justify-content-between align-items-center p-3 border rounded mb-2">
                <span className="fw-medium">Ecocash</span>
                <Badge bg="info">1 transaction</Badge>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex justify-content-between align-items-center p-3 border rounded mb-2">
                <span className="fw-medium">Credit Card</span>
                <Badge bg="secondary">0 transactions</Badge>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex justify-content-between align-items-center p-3 border rounded mb-2">
                <span className="fw-medium">Bank Transfer</span>
                <Badge bg="secondary">0 transactions</Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Payments;