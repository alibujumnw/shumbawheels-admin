import React, { useState, useEffect } from "react";
import { 
  Table, Form, Button, Badge, Pagination, Spinner, Alert, 
  Row, Col, Card, Modal, FloatingLabel, InputGroup 
} from "react-bootstrap";
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
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [perPage, setPerPage] = useState(10); // Users per page
  const itemsPerPage = 10;

  // New user form state
  const [newUser, setNewUser] = useState({
    firstname: '',
    lastname: '',
    phone_number: '',
    email: '',
    password: '',
    mac_address: '',
    role: 'user'
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token') || '';
  };

  // Fetch users data
  const fetchUsers = async (page = 1, search = "") => {
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

      const params = {
        page: page,
        per_page: perPage
      };

      // Add search parameter if provided
      if (search && search.trim() !== "") {
        params.search = search.trim();
      }

      const response = await axios.get('https://api.shumbawheels.co.zw/api/admin/users', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        params: params
      });

      console.log("API Response:", response.data);

      // Handle API response based on your data structure
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Your API returns data in a "data" array
        setUsers(response.data.data);
        
        // If your API provides pagination info in response
        // You may need to adjust this based on your actual API response
        if (response.data.meta) {
          setCurrentPage(response.data.meta.current_page || page);
          setTotalPages(response.data.meta.last_page || 1);
          setTotalUsers(response.data.meta.total || response.data.data.length);
          setPerPage(response.data.meta.per_page || perPage);
        } else if (response.data.pagination) {
          setCurrentPage(response.data.pagination.current_page || page);
          setTotalPages(response.data.pagination.total_pages || 1);
          setTotalUsers(response.data.pagination.total || response.data.data.length);
          setPerPage(response.data.pagination.per_page || perPage);
        } else {
          // Fallback if no pagination info - implement client-side pagination
          setTotalUsers(response.data.data.length);
          const totalPagesCount = Math.ceil(response.data.data.length / perPage);
          setTotalPages(totalPagesCount);
        }
      } else {
        setUsers([]);
        setError("Invalid data format received from server");
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

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, perPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to page 1 when searching
    setCurrentPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    fetchUsers(1);
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
        `https://api.shumbawheels.co.zw/api/admin/users/${userToDelete.id}`,
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
        
        // Close the modal
        setShowDeleteModal(false);
        setUserToDelete(null);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
        
        // Refresh users list
        fetchUsers(currentPage, searchQuery);
        
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
          setError(`Error: ${error.response.data?.message || "Failed to delete user"}`);
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

  // Handle form input changes for new user
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
    
    // Clear error for this field if user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!newUser.firstname.trim()) {
      errors.firstname = 'First name is required';
    }
    
    if (!newUser.lastname.trim()) {
      errors.lastname = 'Last name is required';
    }
    
    if (!newUser.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    } else if (!/^\+?[\d\s-]+$/.test(newUser.phone_number)) {
      errors.phone_number = 'Please enter a valid phone number';
    }
    
    if (newUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (newUser.password && newUser.password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add user submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setAddingUser(true);
      
      // Prepare user data
      const userData = {
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        phone_number: newUser.phone_number,
        email: newUser.email || null,
        password: newUser.password || undefined,
        mac_address: newUser.mac_address || null,
        role: newUser.role || 'user'
      };

      console.log('Sending user data:', userData);

      const response = await axios.post(
        'https://api.shumbawheels.co.zw/api/register',
        userData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Add User Response:', response.data);

      if (response.data.success) {
        setSuccessMessage(`User "${newUser.firstname} ${newUser.lastname}" created successfully!`);
        
        // Reset form
        setNewUser({
          firstname: '',
          lastname: '',
          phone_number: '',
          email: '',
          password: '',
          mac_address: '',
          role: 'user'
        });
        
        // Close modal
        setShowAddUserModal(false);
        setFormErrors({});
        
        // Refresh users list - go to first page to see new user
        setCurrentPage(1);
        fetchUsers(1, searchQuery);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        setError(response.data.message || 'Failed to create user. Please try again.');
      }
      
    } catch (error) {
      console.error('Error adding user:', error);
      
      if (error.response) {
        if (error.response.status === 422) {
          // Laravel validation errors
          const validationErrors = error.response.data.errors;
          const formattedErrors = {};
          
          Object.keys(validationErrors).forEach(key => {
            formattedErrors[key] = validationErrors[key][0];
          });
          
          setFormErrors(formattedErrors);
          setError('Please fix the form errors below.');
        } else if (error.response.status === 409) {
          setError('User with this phone number or email already exists.');
        } else {
          setError(error.response.data.message || `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('Failed to create user. Please try again.');
      }
    } finally {
      setAddingUser(false);
    }
  };

  // Get payment status badge
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

  // Format date
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

  // Get role badge
  const getRoleBadge = (role) => {
    if (!role) return <Badge bg="secondary">User</Badge>;
    
    const roleLower = role.toLowerCase();
    if (roleLower === 'admin' || roleLower === 'administrator') {
      return <Badge bg="danger">Admin</Badge>;
    } else if (roleLower === 'user' || roleLower === 'student') {
      return <Badge bg="success">User</Badge>;
    } else if (roleLower === 'staff') {
      return <Badge bg="info">Staff</Badge>;
    } else {
      return <Badge bg="secondary">{role}</Badge>;
    }
  };

  // Handle per page change
  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => setCurrentPage(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" />);
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" />);
      }
      items.push(
        <Pagination.Item 
          key={totalPages} 
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    return items;
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
              onClick={() => fetchUsers(currentPage, searchQuery)}
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
              <h3 className="fw-bold text-danger">
                {users.filter(u => u.role && u.role.toLowerCase() === 'admin').length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Paid Users</h6>
              <h3 className="fw-bold text-success">
                {users.filter(u => u.payment_status && u.payment_status.toLowerCase() === 'paid').length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Pending</h6>
              <h3 className="fw-bold text-warning">
                {users.filter(u => u.payment_status && u.payment_status.toLowerCase() === 'pending').length}
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
            onClick={() => fetchUsers(currentPage, searchQuery)}
            disabled={loading}
            className="me-2"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowAddUserModal(true)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Per Page Controls */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search users by name, email, phone, or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="py-2"
                  />
                  <Button 
                    type="submit" 
                    variant="primary"
                    className="px-4"
                  >
                    <i className="bi bi-search me-2"></i>
                    Search
                  </Button>
                  {searchQuery && (
                    <Button 
                      variant="outline-secondary"
                      onClick={handleClearSearch}
                    >
                      <i className="bi bi-x-lg"></i>
                    </Button>
                  )}
                </InputGroup>
              </Form>
            </Col>
            <Col md={4} className="mt-2 mt-md-0">
              <div className="d-flex align-items-center justify-content-end">
                <span className="me-2 text-muted">Show:</span>
                <Form.Select 
                  size="sm" 
                  style={{ width: '80px' }}
                  value={perPage}
                  onChange={handlePerPageChange}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Form.Select>
                <span className="ms-2 text-muted">per page</span>
              </div>
            </Col>
          </Row>
          {searchQuery && (
            <div className="text-muted small mt-2">
              <i className="bi bi-search me-1"></i>
              Showing results for "{searchQuery}" - Page {currentPage} of {totalPages}
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
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Contact Info</th>
                  <th className="p-3">Payment Status</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Registered</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
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
                            onClick={handleClearSearch}
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="p-3">
                        <small className="text-muted">#{user.id.substring(0, 8)}...</small>
                      </td>
                      <td className="p-3">
                        <div className="fw-medium">
                          {user.firstname} {user.lastname}
                        </div>
                        {user.mac_address && (
                          <small className="text-muted d-block">
                            MAC: {user.mac_address}
                          </small>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="mb-1">
                          <i className="bi bi-telephone me-1 text-muted"></i>
                          {user.phone_number}
                        </div>
                        <div>
                          <i className="bi bi-envelope me-1 text-muted"></i>
                          {user.email || <span className="text-muted">No email</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        {getPaymentStatusBadge(user.payment_status)}
                      </td>
                      <td className="p-3">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="p-3">
                        <small className="text-muted">
                          {formatDate(user.created_at)}
                        </small>
                      </td>
                      <td className="p-3">
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            title="View Details"
                            onClick={() => console.log('View user:', user.id)}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            title="Edit User"
                            onClick={() => console.log('Edit user:', user.id)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            title="Delete User"
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
      {users.length > 0 && totalPages > 1 && (
        <Card className="shadow-sm border-0 mt-4">
          <Card.Body>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="text-muted mb-3 mb-md-0">
                Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalUsers)} of {totalUsers} users
              </div>
              
              <Pagination className="mb-0">
                <Pagination.First 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => setCurrentPage(currentPage - 1)} 
                  disabled={currentPage === 1}
                />
                
                {renderPaginationItems()}
                
                <Pagination.Next 
                  onClick={() => setCurrentPage(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last 
                  onClick={() => setCurrentPage(totalPages)} 
                  disabled={currentPage === totalPages}
                />
              </Pagination>
              
              <div className="mt-3 mt-md-0">
                <Form.Select 
                  size="sm" 
                  style={{ width: '120px' }}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <option key={page} value={page}>
                      Page {page}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Add User Modal */}
      <Modal 
        show={showAddUserModal} 
        onHide={() => setShowAddUserModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddUser}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="py-2">
                <small>{error}</small>
              </Alert>
            )}
            
            <Row>
              <Col md={6}>
                <FloatingLabel controlId="firstname" label="First Name *" className="mb-3">
                  <Form.Control
                    type="text"
                    name="firstname"
                    placeholder="First Name"
                    value={newUser.firstname}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.firstname}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.firstname}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
              
              <Col md={6}>
                <FloatingLabel controlId="lastname" label="Last Name *" className="mb-3">
                  <Form.Control
                    type="text"
                    name="lastname"
                    placeholder="Last Name"
                    value={newUser.lastname}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.lastname}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.lastname}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FloatingLabel controlId="phone_number" label="Phone Number *" className="mb-3">
                  <Form.Control
                    type="tel"
                    name="phone_number"
                    placeholder="Phone Number"
                    value={newUser.phone_number}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.phone_number}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.phone_number}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
              
              <Col md={6}>
                <FloatingLabel controlId="email" label="Email (Optional)" className="mb-3">
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FloatingLabel controlId="password" label="Password (Optional)" className="mb-3">
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.password}
                  />
                  <Form.Text className="text-muted">
                    Minimum 4 characters. If empty, a random password will be generated.
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.password}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
              
              <Col md={6}>
                <FloatingLabel controlId="mac_address" label="MAC Address (Optional)" className="mb-3">
                  <Form.Control
                    type="text"
                    name="mac_address"
                    placeholder="MAC Address"
                    value={newUser.mac_address}
                    onChange={handleInputChange}
                  />
                </FloatingLabel>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FloatingLabel controlId="role" label="Role" className="mb-3">
                  <Form.Select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
            </Row>

            <div className="alert alert-info mt-3">
              <small>
                <i className="bi bi-info-circle me-2"></i>
                Fields marked with * are required. Phone number must be unique.
              </small>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowAddUserModal(false);
                setFormErrors({});
                setNewUser({
                  firstname: '',
                  lastname: '',
                  phone_number: '',
                  email: '',
                  password: '',
                  mac_address: '',
                  role: 'user'
                });
              }}
              disabled={addingUser}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={addingUser}
            >
              {addingUser ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating User...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-1"></i>
                  Create User
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

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
                  <strong>Email:</strong> {userToDelete.email || 'No email'}<br />
                  <strong>Phone:</strong> {userToDelete.phone_number}<br />
                  <strong>Role:</strong> {userToDelete.role}<br />
                  <strong>Status:</strong> {userToDelete.payment_status}<br />
                  <strong>Registered:</strong> {formatDate(userToDelete.created_at)}
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
