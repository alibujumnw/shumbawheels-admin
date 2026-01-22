// components/Booking.jsx
import React, { useState } from "react";
import { Table, Button, Badge, Form, InputGroup, Card } from "react-bootstrap";

const Booking = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      name: "albert",
      price: 10.00,
      status: "available",
      description: "test",
      bookingDate: "2025-10-20"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      booking.name?.toLowerCase().includes(query) ||
      booking.description?.toLowerCase().includes(query) ||
      booking.status?.toLowerCase().includes(query)
    );
  });

  // Calculate statistics
  const totalBookings = bookings.length;
  const availableBookings = bookings.filter(b => b.status === 'available').length;
  const bookedBookings = bookings.filter(b => b.status === 'booked').length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.price, 0);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Bookings Management</h4>
          <p className="text-muted mb-0">Manage all booking appointments and schedules</p>
        </div>
        <Button variant="primary">
          <i className="bi bi-plus-circle me-2"></i>
          Add New Booking
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-primary fw-bold">{totalBookings}</h1>
              <p className="text-muted mb-0">Total Bookings</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-success fw-bold">{availableBookings}</h1>
              <p className="text-muted mb-0">Available</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-warning fw-bold">{bookedBookings}</h1>
              <p className="text-muted mb-0">Booked</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h1 className="text-info fw-bold">${totalRevenue.toFixed(2)}</h1>
              <p className="text-muted mb-0">Total Revenue</p>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Search bookings by name, description, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded shadow-sm">
        <Table responsive hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="fw-medium p-3" style={{ width: "50px" }}>#</th>
              <th className="fw-medium p-3">Name</th>
              <th className="fw-medium p-3">Price</th>
              <th className="fw-medium p-3" style={{ width: "120px" }}>Status</th>
              <th className="fw-medium p-3">Description</th>
              <th className="fw-medium p-3">Booking Date</th>
              <th className="fw-medium p-3" style={{ width: "150px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-5">
                  <div className="text-muted mb-3">
                    <i className="bi bi-calendar-event fs-1"></i>
                  </div>
                  <h5 className="fw-medium">No bookings available</h5>
                  <p className="text-muted mb-4">
                    Create your first booking using the "Add New Booking" button above.
                  </p>
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking, index) => (
                <tr key={booking.id}>
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 fw-medium">{booking.name}</td>
                  <td className="p-3">
                    <span className="fw-bold text-success">
                      ${booking.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge 
                      bg={booking.status === 'available' ? 'success' : 
                          booking.status === 'booked' ? 'warning' : 
                          booking.status === 'cancelled' ? 'danger' : 'info'} 
                      className="px-3 py-1"
                    >
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="text-truncate" style={{ maxWidth: "200px" }}>
                      {booking.description}
                    </div>
                  </td>
                  <td className="p-3">
                    {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </td>
                  <td className="p-3">
                    <div className="d-flex gap-2">
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
              ))
            )}
          </tbody>
        </Table>

        {/* Pagination and Info */}
        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <div className="text-muted">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" disabled>
              &lt; Previous
            </Button>
            <Button variant="outline-primary" size="sm" className="active">
              1
            </Button>
            <Button variant="outline-secondary" size="sm" disabled>
              Next &gt;
            </Button>
          </div>
        </div>
        <div className="text-center p-3 border-top">
          <div className="text-muted small">Page 1 of 1</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4">
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <h5 className="fw-bold mb-3">Quick Actions</h5>
            <div className="d-flex flex-wrap gap-3">
              <Button variant="outline-primary">
                <i className="bi bi-calendar-plus me-2"></i>
                Schedule New Booking
              </Button>
              <Button variant="outline-success">
                <i className="bi bi-calendar-check me-2"></i>
                View Calendar
              </Button>
              <Button variant="outline-info">
                <i className="bi bi-printer me-2"></i>
                Print Schedule
              </Button>
              <Button variant="outline-secondary">
                <i className="bi bi-download me-2"></i>
                Export Bookings
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Booking;