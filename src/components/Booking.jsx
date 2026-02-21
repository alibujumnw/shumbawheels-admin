// components/Booking.jsx
import React, { useState, useEffect } from "react";
import { 
  Table, Button, Badge, Form, InputGroup, Card, 
  Row, Col, Spinner, Alert, Modal 
} from "react-bootstrap";
import axios from "axios";

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    status: "available",
    description: "",
    booking_date: ""
  });

  // Get token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem("authToken") || 
                  sessionStorage.getItem("authToken");
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

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/admin/get-bookings");
      
      console.log("Bookings API Response:", response.data);
      
      // Handle the response structure { data: [...] }
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setBookings(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Fallback: if response is directly an array
        setBookings(response.data);
      } else {
        console.warn("Unexpected response structure:", response.data);
        setBookings([]);
      }

    } catch (err) {
      console.error("Error fetching bookings:", err);
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError("Session expired. Please login again.");
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
            break;
          case 403:
            setError("You don't have permission to view bookings.");
            break;
          case 404:
            setError("Bookings endpoint not found.");
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
      
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh bookings
  const refreshBookings = () => {
    fetchBookings();
  };

  // Handle edit booking
  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      name: booking.name || "",
      price: booking.price || "",
      status: booking.status || "available",
      description: booking.description || "",
      booking_date: booking.booking_date || ""
    });
    setShowEditModal(true);
  };

  // Handle save edited booking
  const handleSaveEdit = async () => {
    if (!selectedBooking) return;
    
    try {
      const response = await api.put(`/admin/bookings/${selectedBooking.id}`, formData);
      
      if (response.data.success || response.data.message) {
        alert("Booking updated successfully!");
        setShowEditModal(false);
        refreshBookings();
      }
    } catch (err) {
      alert("Failed to update booking: " + (err.response?.data?.message || err.message));
    }
  };

  // Handle delete booking
  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    
    try {
      const response = await api.delete(`/admin/bookings/${bookingId}`);
      
      if (response.data.success || response.data.message) {
        alert("Booking deleted successfully!");
        refreshBookings();
      }
    } catch (err) {
      alert("Failed to delete booking: " + (err.response?.data?.message || err.message));
    }
  };

  // Handle add new booking
  const handleAddNew = () => {
    setFormData({
      name: "",
      price: "",
      status: "available",
      description: "",
      booking_date: new Date().toISOString().split('T')[0] // Today's date
    });
    setShowAddModal(true);
  };

  // Handle save new booking
  const handleSaveNew = async () => {
    try {
      const response = await api.post("/admin/bookings", formData);
      
      if (response.data.success || response.data.message) {
        alert("Booking created successfully!");
        setShowAddModal(false);
        refreshBookings();
      }
    } catch (err) {
      alert("Failed to create booking: " + (err.response?.data?.message || err.message));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
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

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = (status || "").toLowerCase();
    
    const statusConfig = {
      available: { variant: "success", label: "Available" },
      booked: { variant: "warning", label: "Booked" },
      confirmed: { variant: "primary", label: "Confirmed" },
      cancelled: { variant: "danger", label: "Cancelled" },
      pending: { variant: "secondary", label: "Pending" },
      completed: { variant: "info", label: "Completed" }
    };

    const config = statusConfig[statusLower] || { variant: "secondary", label: status || "Unknown" };
    
    return (
      <Badge bg={config.variant} className="px-3 py-1">
        {config.label}
      </Badge>
    );
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const searchString = [
      booking.name || "",
      booking.description || "",
      booking.status || "",
      booking.price || "",
      booking.booking_date || ""
    ].join(" ").toLowerCase();
    
    return searchString.includes(query);
  });

  // Calculate statistics
  const stats = {
    total: bookings.length,
    available: bookings.filter(b => b.status?.toLowerCase() === "available").length,
    booked: bookings.filter(b => b.status?.toLowerCase() === "booked").length,
    totalRevenue: bookings.reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0)
  };

  if (loading) {
    return (
      <div className="p-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading bookings...</p>
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
            <Button variant="outline-danger" onClick={refreshBookings}>
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
          <h4 className="fw-bold mb-1">Bookings Management</h4>
          <p className="text-muted mb-0">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={handleAddNew}>
            <i className="bi bi-plus-circle me-2"></i>
            Add New Booking
          </Button>
          <Button variant="outline-secondary" onClick={refreshBookings}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-primary fw-bold">{stats.total}</h1>
              <p className="text-muted mb-0">Total Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-success fw-bold">{stats.available}</h1>
              <p className="text-muted mb-0">Available</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-warning fw-bold">{stats.booked}</h1>
              <p className="text-muted mb-0">Booked</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-info fw-bold">{formatCurrency(stats.totalRevenue)}</h1>
              <p className="text-muted mb-0">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search Bar */}
      <div className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Search bookings by name, description, status, or price..."
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

      {/* Bookings Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredBookings.length === 0 ? (
            <div className="p-5 text-center">
              <i className="bi bi-calendar-event display-4 text-muted"></i>
              <h5 className="mt-3">No bookings found</h5>
              <p className="text-muted">
                {searchQuery ? "Try a different search" : "No booking records available"}
              </p>
              {!searchQuery && (
                <Button variant="primary" onClick={handleAddNew} className="mt-3">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create First Booking
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="fw-medium p-3">#</th>
                    <th className="fw-medium p-3">Name</th>
                    <th className="fw-medium p-3">Price</th>
                    <th className="fw-medium p-3">Status</th>
                    <th className="fw-medium p-3">Description</th>
                    <th className="fw-medium p-3">Booking Date</th>
                    <th className="fw-medium p-3">Created</th>
                    <th className="fw-medium p-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <tr key={booking.id}>
                      <td className="p-3 align-middle">{index + 1}</td>
                      <td className="p-3 align-middle fw-medium">{booking.name || "N/A"}</td>
                      <td className="p-3 align-middle fw-bold">
                        <span className="text-success">
                          {formatCurrency(booking.price)}
                        </span>
                      </td>
                      <td className="p-3 align-middle">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="p-3 align-middle">
                        <div className="text-truncate" style={{ maxWidth: "200px" }} title={booking.description}>
                          {booking.description || "No description"}
                        </div>
                      </td>
                      <td className="p-3 align-middle">
                        {formatDate(booking.booking_date)}
                      </td>
                      <td className="p-3 align-middle">
                        <small className="text-muted">
                          {formatDate(booking.created_at)}
                        </small>
                      </td>
                      <td className="p-3 align-middle text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleEdit(booking)}
                            title="Edit booking"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(booking.id)}
                            title="Delete booking"
                          >
                            <i className="bi bi-trash"></i>
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

      {/* Quick Actions */}
      <div className="mt-4">
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <h5 className="fw-bold mb-3">Quick Actions</h5>
            <div className="d-flex flex-wrap gap-3">
              <Button variant="outline-primary" onClick={handleAddNew}>
                <i className="bi bi-calendar-plus me-2"></i>
                Schedule New Booking
              </Button>
              <Button variant="outline-success" onClick={refreshBookings}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh List
              </Button>
              <Button variant="outline-info" onClick={() => window.print()}>
                <i className="bi bi-printer me-2"></i>
                Print Schedule
              </Button>
              <Button variant="outline-secondary" onClick={() => {
                // Export functionality (simplified)
                const dataStr = JSON.stringify(bookings, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = `bookings-${new Date().toISOString().split('T')[0]}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}>
                <i className="bi bi-download me-2"></i>
                Export Bookings
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Edit Booking Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter booking name"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                step="0.01"
                min="0"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Booking Date</Form.Label>
              <Form.Control
                type="date"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Booking Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter booking name"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Price ($) *</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                step="0.01"
                min="0"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description (optional)"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Booking Date *</Form.Label>
              <Form.Control
                type="date"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveNew}>
            Create Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Booking;