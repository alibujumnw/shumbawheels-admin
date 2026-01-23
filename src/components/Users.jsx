// components/Users.jsx
import React, { useState, useEffect } from "react";
import { Table, Form, Button, Badge, Pagination, Spinner, Alert, Row, Col, Card, Modal } from "react-bootstrap";
import axios from "axios";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const itemsPerPage = 10;

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token') || '';
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      
      const token = getToken();
      
      if (!token) {
        setError("Authentication required. Please login again.");
        setLoading(false);
        return;
      }

      const response = await axios.get('https://api.shumbawheels.co.zw/api/admin/users', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        params: {
          page: page,
          per_page: itemsPerPage
        }
      });

      console.log("API Response:", response.data);

      // Handle API response based on your data structure
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
        
        // If API provides pagination info
        if (response.data.meta) {
          setCurrentPage(response.data.meta.current_page || page);
          setTotalPages(response.data.meta.last_page || 1);
          setTotalUsers(response.data.meta.total || response.data.data.length);
        } else if (response.data.pagination) {
          setCurrentPage(response.data.pagination.current_page || page);
          setTotalPages(response.data.pagination.total_pages || 1);
          setTotalUsers(response.data.pagination.total || response.data.data.length);
        } else {
          // Fallback if no pagination info
          setTotalUsers(response.data.data.length);
          setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
        }
      } else {
        // Handle different response structure
        const data = response.data;
        
        if (Array.isArray(data)) {
          setUsers(data);
          setTotalUsers(data.length);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        } else if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
          setTotalUsers(data.data.length);
          setTotalPages(Math.ceil(data.data.length / itemsPerPage));
        } else {
          setUsers([]);
          setError("Invalid data format received from server");
        }
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Session expired. Please login again.");
        } else if (error.response.status === 403) {
          setError("You don't have permission to view users.");
        } else if (error.response.status === 404) {
          setError("Users endpoint not found.");
        } else {
          setError(`Server error: ${error.response.status}. Please try again.`);
        }
      } else if (error.request) {
        setError("No response from server. Please check your internet connection.");
      } else {
        setError("Failed to load users. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      const token = getToken();
      
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.delete(
        `https://api.shumbawheels.co.zw/api/admin/delete-user/${userToDelete.id}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("Delete Response:", response.data);

      if (response.data && response.data.success) {
        setSuccessMessage(`User "${userToDelete.firstname} ${userToDelete.lastname}" deleted successfully.`);
        
        // Remove the user from the local state
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
        
        // Update total users count
        setTotalUsers(prev => prev - 1);
        
        // Close the modal
        setShowDeleteModal(false);
        setUserToDelete(null);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        setError(response.data.message || "Failed to delete user. Please try again.");
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Session expired. Please login again.");
        } else if (error.response.status === 403) {
          setError("You don't have permission to delete users.");
        } else if (error.response.status === 404) {
          setError("User not found.");
        } else {
          setError(`Error: ${error.response.data.message || "Failed to delete user"}`);
        }
      } else if (error.request) {
        setError("No response from server. Please check your internet connection.");
      } else {
        setError("Failed to delete user. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // Filter users based on search (client-side filtering as fallback)
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const searchLower = searchQuery.toLowerCase();
    
    return (
      (user.firstname && user.firstname.toLowerCase().includes(searchLower)) ||
      (user.lastname && user.lastname.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.phone_number && user.phone_number.includes(searchQuery)) ||
      (user.payment_status && user.payment_status.toLowerCase().includes(searchLower)) ||
      (user.role && user.role.toLowerCase().includes(searchLower)) ||
      (user.mac_address && user.mac_address.toLowerCase().includes(searchLower))
    );
  });

  const getPaymentStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Unknown</Badge>;
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'paid') {
      return <Badge bg="success">Paid</Badge>;
    } else if (statusLower === 'pending') {
      return <Badge bg="warning">Pending</Badge>;
    } else if (statusLower === 'active') {
      return <Badge bg="success">Active</Badge>;
    } else if (statusLower === 'inactive') {
      return <Badge bg="secondary">Inactive</Badge>;
    } else {
      return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    try {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return iso;
    }
  };

  const getRoleBadge = (role) => {
    if (!role) return <Badge bg="secondary">User</Badge>;
    
    const roleLower = role.toLowerCase();
    if (roleLower === 'admin' || roleLower === 'administrator') {
      return <Badge bg="primary">Admin</Badge>;
    } else if (roleLower === 'user' || roleLower === 'student') {
      return <Badge bg="success">User</Badge>;
    } else {
      return <Badge bg="secondary">{role}</Badge>;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // If you want server-side search, you can modify the API call here
    // For now, using client-side filtering
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="p-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Users</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-danger" 
              onClick={() => fetchUsers(currentPage)}
            >
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Success Alert */}
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage("")}>
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      {/* Header Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Total Users</h6>
              <h3 className="fw-bold text-primary">{totalUsers}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Admins</h6>
              <h3 className="fw-bold text-info">
                {users.filter(u => u.role === 'admin').length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Paid Users</h6>
              <h3 className="fw-bold text-success">
                {users.filter(u => u.payment_status === 'paid').length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Pending</h6>
              <h3 className="fw-bold text-warning">
                {users.filter(u => u.payment_status === 'pending').length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Users Management</h2>
          <p className="text-muted mb-0">View and manage all system users</p>
        </div>
        <div>
          <Button 
            variant="outline-primary" 
            onClick={() => fetchUsers(currentPage)}
            disabled={loading}
            className="me-2"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="primary">
            <i className="bi bi-plus-circle me-1"></i>
            Add User
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={8}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Search users by name, email, phone, or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 py-2"
                >
                  <i className="bi bi-search me-2"></i>
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
          {searchQuery && (
            <div className="text-muted small mt-2">
              Found {filteredUsers.length} users matching "{searchQuery}"
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="py-4">
                        <i className="bi bi-people fs-1 text-muted"></i>
                        <p className="mt-3">
                          {searchQuery ? 'No users match your search.' : 'No users found.'}
                        </p>
                        {searchQuery && (
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td className="p-3">
                        <small className="text-muted">#{user.id.substring(0, 8)}...</small>
                      </td>
                      <td className="p-3">
                        <div className="fw-medium">
                          {user.firstname} {user.lastname}
                        </div>
                      </td>
                      <td className="p-3">
                        <small>{user.email}</small>
                      </td>
                      <td className="p-3">{user.phone_number}</td>
                      <td className="p-3">
                        {getPaymentStatusBadge(user.payment_status)}
                      </td>
                      <td className="p-3">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="p-3">
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm" title="View">
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button variant="outline-warning" size="sm" title="Edit">
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            title="Delete"
                            onClick={() => handleDeleteClick(user)}
                            disabled={deleting}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Pagination */}
      {filteredUsers.length > 0 && totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted small">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <Pagination>
            <Pagination.First 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => setCurrentPage(currentPage - 1)} 
              disabled={currentPage === 1}
            />
            
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }
              
              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}
            
            <Pagination.Next 
              onClick={() => setCurrentPage(currentPage + 1)} 
              disabled={currentPage === totalPages}
            />
            <Pagination.Last 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <>
              <p className="mb-3">
                Are you sure you want to delete the user <strong>{userToDelete.firstname} {userToDelete.lastname}</strong>?
              </p>
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                This action cannot be undone. All user data will be permanently deleted.
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Email:</strong> {userToDelete.email}<br />
                  <strong>Phone:</strong> {userToDelete.phone_number}<br />
                  <strong>Role:</strong> {userToDelete.role}<br />
                  <strong>Status:</strong> {userToDelete.payment_status}
                </small>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowDeleteModal(false);
              setUserToDelete(null);
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete User'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;