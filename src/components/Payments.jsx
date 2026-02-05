// components/Payments.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Form, InputGroup, Card, Row, Col, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get token from localStorage or sessionStorage
  const getAuthToken = () => {
    // Try to get token from localStorage first
    const token = localStorage.getItem("auth_token") || 
                  localStorage.getItem("token") ||
                  sessionStorage.getItem("auth_token") ||
                  sessionStorage.getItem("token");
    
    return token ? `Bearer ${token}` : null;
  };

  // Fetch payments from API with authentication
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        
        // Get the auth token
        const authToken = getAuthToken();
        
        if (!authToken) {
          setError("Authentication required. Please login first.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "https://api.shumbawheels.co.zw/api/admin/get-payments",
          {
            headers: {
              "Authorization": authToken,
              "Accept": "application/json",
              "Content-Type": "application/json"
            }
          }
        );
        
        // Check the response structure
        console.log("API Response:", response.data);
        
        // Handle different response structures
        if (response.data && Array.isArray(response.data)) {
          // If the response is already an array
          setPayments(response.data);
        } else if (response.data && response.data.data) {
          // If response has a data property
          setPayments(Array.isArray(response.data.data) ? response.data.data : []);
        } else if (response.data) {
          // Fallback - try to parse as array
          setPayments(Array.isArray(response.data) ? response.data : []);
        } else {
          setPayments([]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching payments:", err);
        
        // Handle specific error cases
        if (err.response) {
          if (err.response.status === 401) {
            setError("Authentication failed. Please login again.");
          } else if (err.response.status === 403) {
            setError("You don't have permission to view payments.");
          } else if (err.response.status === 404) {
            setError("Payments endpoint not found.");
          } else if (err.response.data && err.response.data.message) {
            setError(err.response.data.message);
          } else {
            setError(`Server error: ${err.response.status}`);
          }
        } else if (err.request) {
          setError("No response from server. Please check your connection.");
        } else {
          setError("Failed to load payments. Please try again.");
        }
        
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Function to refresh payments
  const refreshPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authToken = getAuthToken();
      
      if (!authToken) {
        setError("Authentication required. Please login first.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "https://api.shumbawheels.co.zw/api/admin/get-payments",
        {
          headers: {
            "Authorization": authToken,
            "Accept": "application/json"
          }
        }
      );
      
      // Handle response as above
      if (response.data && Array.isArray(response.data)) {
        setPayments(response.data);
      } else if (response.data && response.data.data) {
        setPayments(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setPayments([]);
      }
      
    } catch (err) {
      console.error("Error refreshing payments:", err);
      setError("Failed to refresh payments.");
    } finally {
      setLoading(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Format payment method for display
  const formatPaymentMethod = (method) => {
    if (!method) return "Unknown";
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  // Format purpose for display
  const formatPurpose = (purpose) => {
    if (!purpose) return "Unknown";
    return purpose.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get status badge color
  const getStatusColor = (status) => {
    if (!status) return "secondary";
    
    switch(status.toLowerCase()) {
      case 'paid':
      case 'approved':
      case 'success':
      case 'completed':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'failed':
      case 'rejected':
      case 'cancelled':
      case 'declined':
        return 'danger';
      default:
        return 'info';
    }
  };

  // Calculate statistics
  const totalPayments = payments.length;
  const approvedPayments = payments.filter(p => 
    ['paid', 'approved', 'success', 'completed'].includes(p.status?.toLowerCase())
  ).length;
  const pendingPayments = payments.filter(p => 
    ['pending', 'processing'].includes(p.status?.toLowerCase())
  ).length;
  const totalAmount = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  // Calculate payment methods summary
  const paymentMethodsSummary = payments.reduce((acc, payment) => {
    const method = payment.payment_method?.toLowerCase() || 'unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  // Filter payments based on search query
  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const searchableFields = [
      payment.payment_method || '',
      payment.purpose || '',
      payment.status || '',
      payment.amount ? payment.amount.toString() : '',
      payment.id || '',
      // Add user-related fields if they exist in your data
      payment.user_name || '',
      payment.user_email || '',
      payment.reference || ''
    ];
    
    return searchableFields.some(field => 
      field.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Payments</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={refreshPayments}>
              Retry
            </Button>
            {error.includes("Authentication") && (
              <Button variant="primary" onClick={() => window.location.href = '/login'}>
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
          <Button variant="outline-secondary" onClick={refreshPayments}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
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
            placeholder="Search payments by method, purpose, status, amount, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button 
              variant="outline-secondary" 
              onClick={() => setSearchQuery("")}
            >
              Clear
            </Button>
          )}
        </InputGroup>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded shadow-sm">
        {filteredPayments.length === 0 ? (
          <div className="p-5 text-center">
            <i className="bi bi-receipt-cutoff display-4 text-muted"></i>
            <h5 className="mt-3">
              {searchQuery ? "No matching payments found" : "No payment records available"}
            </h5>
            <p className="text-muted">
              {searchQuery ? "Try a different search term" : "Start by adding a payment"}
            </p>
            {!searchQuery && (
              <Button variant="primary" className="mt-2">
                <i className="bi bi-plus-circle me-2"></i>
                Add First Payment
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-medium p-3">ID</th>
                  <th className="fw-medium p-3">Payment Method</th>
                  <th className="fw-medium p-3">Amount</th>
                  <th className="fw-medium p-3">Purpose</th>
                  <th className="fw-medium p-3">Status</th>
                  <th className="fw-medium p-3">Date Created</th>
                  <th className="fw-medium p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="p-3 align-middle">
                      <small className="text-muted" title={payment.id}>
                        {payment.id ? `${payment.id.substring(0, 8)}...` : 'N/A'}
                      </small>
                    </td>
                    <td className="p-3 align-middle">
                      <Badge bg="info" className="px-3 py-1">
                        {formatPaymentMethod(payment.payment_method)}
                      </Badge>
                    </td>
                    <td className="p-3 align-middle">
                      <span className="fw-bold text-success">
                        ${(parseFloat(payment.amount) || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3 align-middle">
                      <Badge bg="secondary" className="px-3 py-1">
                        {formatPurpose(payment.purpose)}
                      </Badge>
                    </td>
                    <td className="p-3 align-middle">
                      <Badge 
                        bg={getStatusColor(payment.status)} 
                        className="px-3 py-1"
                      >
                        {payment.status ? 
                          payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 
                          'Unknown'
                        }
                      </Badge>
                    </td>
                    <td className="p-3 align-middle">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="p-3 align-middle">
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          title="View details"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        {!['paid', 'approved', 'success', 'completed'].includes(payment.status?.toLowerCase()) && (
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            title="Approve payment"
                          >
                            <i className="bi bi-check-circle"></i>
                          </Button>
                        )}
                        <Button 
                          variant="outline-danger" 
                          size="sm"
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

            {/* Pagination and Info */}
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <div className="text-muted">
                Showing {filteredPayments.length} of {payments.length} payments
                {searchQuery && ` (filtered)`}
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
          </>
        )}
      </div>

      {/* Payment Methods Summary */}
      {Object.keys(paymentMethodsSummary).length > 0 && (
        <Card className="border-0 shadow-sm mt-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">Payment Methods Summary</h5>
            <Row>
              {Object.entries(paymentMethodsSummary).map(([method, count]) => (
                <Col md={4} key={method} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                    <span className="fw-medium">
                      {formatPaymentMethod(method)}
                    </span>
                    <Badge bg={count > 0 ? "info" : "secondary"}>
                      {count} transaction{count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Payments;