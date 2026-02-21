// components/Payments.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Form, InputGroup, Card, Row, Col, Spinner, Alert, Modal } from "react-bootstrap";
import axios from "axios";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Get token from localStorage - based on your login implementation
  const getAuthToken = () => {
    // You're storing token as "authToken" in localStorage
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      console.warn("No authToken found in localStorage. Checking other keys...");
      // Fallback to other possible keys
      return localStorage.getItem("token") || 
             sessionStorage.getItem("authToken") ||
             sessionStorage.getItem("token");
    }
    
    return token;
  };

  // Create axios instance with default headers
  const api = axios.create({
    baseURL: "https://api.shumbawheels.co.zw/api",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  });

  // Add request interceptor to add token
  api.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Fetch payments from API
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/admin/get-payments");
      
      console.log("API Response:", response.data);
      
      // Based on your earlier example, the API returns ["data", [...]]
      // Let's handle this specific structure
      if (Array.isArray(response.data) && response.data.length >= 2) {
        // Check if first element is "data" string
        if (response.data[0] === "data" && Array.isArray(response.data[1])) {
          setPayments(response.data[1] || []);
        } else {
          // If not "data", assume the whole array is payments
          setPayments(response.data);
        }
      } 
      // Handle Laravel standard response { data: [...] }
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setPayments(response.data.data);
      }
      // Handle direct array
      else if (Array.isArray(response.data)) {
        setPayments(response.data);
      }
      // Handle object with payments property
      else if (response.data && response.data.payments && Array.isArray(response.data.payments)) {
        setPayments(response.data.payments);
      }
      else {
        console.warn("Unexpected response structure:", response.data);
        setPayments([]);
      }

    } catch (err) {
      console.error("Error fetching payments:", err);
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError("Session expired. Please login again.");
            // Redirect to login after 2 seconds
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
            break;
          case 403:
            setError("You don't have permission to view payments.");
            break;
          case 404:
            setError("Payments endpoint not found.");
            break;
          case 500:
            setError("Server error. Please try again later.");
            break;
          default:
            if (err.response.data && err.response.data.message) {
              setError(err.response.data.message);
            } else {
              setError(`Error ${err.response.status}: ${err.response.statusText}`);
            }
        }
      } else if (err.request) {
        setError("No response from server. Check your internet connection.");
      } else {
        setError("Error: " + err.message);
      }
      
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh payments
  const refreshPayments = () => {
    fetchPayments();
  };

  // Handle payment approval
  const handleApprove = async (paymentId) => {
    if (!window.confirm("Are you sure you want to approve this payment?")) return;
    
    try {
      const response = await api.put(`/admin/payments/${paymentId}/approve`);
      
      if (response.data.success) {
        alert("Payment approved successfully!");
        refreshPayments();
      }
    } catch (err) {
      alert("Failed to approve payment: " + (err.response?.data?.message || err.message));
    }
  };

  // Handle payment rejection
  const handleReject = async (paymentId) => {
    if (!window.confirm("Are you sure you want to reject this payment?")) return;
    
    try {
      const response = await api.put(`/admin/payments/${paymentId}/reject`);
      
      if (response.data.success) {
        alert("Payment rejected successfully!");
        refreshPayments();
      }
    } catch (err) {
      alert("Failed to reject payment: " + (err.response?.data?.message || err.message));
    }
  };

  // Handle view payment details
  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(num);
  };

  // Format status
  const getStatusBadge = (status) => {
    const statusLower = (status || "").toLowerCase();
    
    const statusConfig = {
      paid: { variant: "success", label: "Paid" },
      approved: { variant: "success", label: "Approved" },
      success: { variant: "success", label: "Success" },
      completed: { variant: "success", label: "Completed" },
      pending: { variant: "warning", label: "Pending" },
      processing: { variant: "warning", label: "Processing" },
      failed: { variant: "danger", label: "Failed" },
      rejected: { variant: "danger", label: "Rejected" },
      cancelled: { variant: "danger", label: "Cancelled" }
    };

    const config = statusConfig[statusLower] || { variant: "secondary", label: status || "Unknown" };
    
    return (
      <Badge bg={config.variant} className="px-3 py-1">
        {config.label}
      </Badge>
    );
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const searchString = [
      payment.id || "",
      payment.payment_method || "",
      payment.purpose || "",
      payment.status || "",
      payment.amount || "",
      payment.reference || "",
      payment.created_at || ""
    ].join(" ").toLowerCase();
    
    return searchString.includes(query);
  });

  // Calculate statistics
  const stats = {
    total: payments.length,
    approved: payments.filter(p => ["paid", "approved", "success", "completed"].includes(p.status?.toLowerCase())).length,
    pending: payments.filter(p => ["pending", "processing"].includes(p.status?.toLowerCase())).length,
    totalAmount: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  };

  // Group by payment method
  const paymentMethods = payments.reduce((acc, payment) => {
    const method = payment.payment_method?.toLowerCase() || "unknown";
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex gap-2 mt-3">
            <Button variant="outline-danger" onClick={refreshPayments}>
              Retry
            </Button>
            {error.includes("login") && (
              <Button variant="primary" onClick={() => window.location.href = "/login"}>
                Go to Login
              </Button>
            )}
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Payments Management</h4>
          <p className="text-muted mb-0">
            {payments.length} payment{payments.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={refreshPayments}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
          <Button variant="outline-success">
            <i className="bi bi-download me-2"></i>
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-primary display-6 fw-bold">{stats.total}</div>
              <div className="text-muted">Total Payments</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-success display-6 fw-bold">{stats.approved}</div>
              <div className="text-muted">Approved</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-warning display-6 fw-bold">{stats.pending}</div>
              <div className="text-muted">Pending</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-info display-6 fw-bold">
                {formatCurrency(stats.totalAmount)}
              </div>
              <div className="text-muted">Total Amount</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search */}
      <div className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button variant="outline-secondary" onClick={() => setSearchQuery("")}>
              Clear
            </Button>
          )}
        </InputGroup>
      </div>

      {/* Payments Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="p-5 text-center">
              <i className="bi bi-receipt display-4 text-muted"></i>
              <h5 className="mt-3">No payments found</h5>
              <p className="text-muted">
                {searchQuery ? "Try a different search" : "No payment records available"}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="fw-medium p-3">ID</th>
                    <th className="fw-medium p-3">Method</th>
                    <th className="fw-medium p-3">Amount</th>
                    <th className="fw-medium p-3">Purpose</th>
                    <th className="fw-medium p-3">Status</th>
                    <th className="fw-medium p-3">Date</th>
                    <th className="fw-medium p-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="p-3 align-middle">
                        <small className="text-muted font-monospace">
                          {payment.id?.substring(0, 8)}...
                        </small>
                      </td>
                      <td className="p-3 align-middle">
                        <Badge bg="info" className="px-3 py-1">
                          {payment.payment_method ? 
                            payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1) : 
                            "N/A"
                          }
                        </Badge>
                      </td>
                      <td className="p-3 align-middle fw-bold">
                        <span className="text-success">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                      <td className="p-3 align-middle">
                        <Badge bg="secondary" className="px-3 py-1">
                          {payment.purpose ? 
                            payment.purpose.split("_").map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(" ") : 
                            "N/A"
                          }
                        </Badge>
                      </td>
                      <td className="p-3 align-middle">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="p-3 align-middle">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="p-3 align-middle text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleView(payment)}
                            title="View details"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          {!["paid", "approved", "success", "completed"].includes(
                            payment.status?.toLowerCase()
                          ) && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleApprove(payment.id)}
                              title="Approve payment"
                            >
                              <i className="bi bi-check-circle"></i>
                            </Button>
                          )}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleReject(payment.id)}
                            title="Reject payment"
                          >
                            <i className="bi bi-x-circle"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Payment Methods Summary */}
      {Object.keys(paymentMethods).length > 0 && (
        <Card className="border-0 shadow-sm mt-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">Payment Methods</h5>
            <Row>
              {Object.entries(paymentMethods).map(([method, count]) => (
                <Col md={3} key={method} className="mb-2">
                  <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                    <span className="fw-medium">
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </span>
                    <Badge bg="info" pill>
                      {count}
                    </Badge>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* View Payment Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <label className="text-muted small">Payment ID</label>
                  <div className="fw-medium">{selectedPayment.id}</div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">Amount</label>
                  <div className="fw-bold fs-5 text-success">
                    {formatCurrency(selectedPayment.amount)}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">Status</label>
                  <div>{getStatusBadge(selectedPayment.status)}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <label className="text-muted small">Payment Method</label>
                  <div className="fw-medium">
                    {selectedPayment.payment_method?.toUpperCase() || "N/A"}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">Purpose</label>
                  <div className="fw-medium">
                    {selectedPayment.purpose?.replace(/_/g, " ")?.toUpperCase() || "N/A"}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">Date Created</label>
                  <div>{formatDate(selectedPayment.created_at)}</div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">Last Updated</label>
                  <div>{formatDate(selectedPayment.updated_at)}</div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Payments;