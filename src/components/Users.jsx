// components/Users.jsx
import React, { useState, useEffect } from "react";
import { 
  Table, Form, Button, Badge, Pagination, Spinner, Alert, 
  Row, Col, Card, Modal, FloatingLabel 
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
  const itemsPerPage = 10;

  // Track if we're doing server-side or client-side search
  const [isSearching, setIsSearching] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, [currentPage]); // Only fetch when page changes

  const fetchData = () => {
    if (isSearching && searchQuery) {
      fetchUsersWithSearch(currentPage, searchQuery);
    } else {
      fetchUsers(currentPage);
    }
  };

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
        per_page: itemsPerPage
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

  // Separate function for search to handle debouncing if needed
  const fetchUsersWithSearch = async (page = 1, search = "") => {
    await fetchUsers(page, search);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to page 1 when searching
    setCurrentPage(1);
    
    // Fetch users with search query
    if (searchQuery.trim() !== "") {
      setIsSearching(true);
      fetchUsersWithSearch(1, searchQuery);
    } else {
      // If search is cleared, fetch all users
      setIsSearching(false);
      fetchUsers(1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
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

      // Use POST method for deletion (as API expects POST)
      const response = await axios.post(
        `https://api.shumbawheels.co.zw/api/admin/delete-user/${userToDelete.id}`,
        {}, // Empty body
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
        
        // Close the modal first
        setShowDeleteModal(false);
        setUserToDelete(null);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
        
        // REFRESH DATA FROM SERVER INSTEAD OF JUST FILTERING LOCALLY
        // Check if we need to go to previous page
        const wasLastUserOnPage = users.length === 1;
        
        if (wasLastUserOnPage && currentPage > 1) {
          // If it was the last user on the page, go to previous page
          setCurrentPage(currentPage - 1);
        } else {
          // Otherwise, refresh current page data by fetching it directly
          if (isSearching && searchQuery) {
            await fetchUsersWithSearch(currentPage, searchQuery);
          } else {
            await fetchUsers(currentPage);
          }
        }
        
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
        } else if (error.response.status === 405) {
          // Method Not Allowed - try different approach
          setError("Delete method not allowed. Trying alternative...");
          
          // Try alternative delete methods
          await tryAlternativeDeleteMethods();
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

  // Refresh current page data
  const refreshCurrentPage = () => {
    if (isSearching && searchQuery) {
      fetchUsersWithSearch(currentPage, searchQuery);
    } else {
      fetchUsers(currentPage);
    }
  };

  // Alternative delete methods if POST doesn't work
  const tryAlternativeDeleteMethods = async () => {
    const token = getToken();
    if (!token) return;

    const alternatives = [
      {
        method: 'POST',
        url: `https://api.shumbawheels.co.zw/api/admin/users/${userToDelete.id}/delete`,
        data: {}
      },
      {
        method: 'DELETE',
        url: `https://api.shumbawheels.co.zw/api/admin/users/${userToDelete.id}`,
        data: {}
      },
      {
        method: 'POST',
        url: `https://api.shumbawheels.co.zw/api/admin/users/${userToDelete.id}`,
        data: { _method: 'DELETE' } // Laravel method spoofing
      }
    ];

    for (const alt of alternatives) {
      try {
        console.log(`Trying alternative: ${alt.method} ${alt.url}`);
        const response = await axios({
          method: alt.method,
          url: alt.url,
          data: alt.data,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.success) {
          setSuccessMessage(`User "${userToDelete.firstname} ${userToDelete.lastname}" deleted successfully.`);
          setShowDeleteModal(false);
          setUserToDelete(null);
          
          // Refresh data from server
          if (isSearching && searchQuery) {
            await fetchUsersWithSearch(currentPage, searchQuery);
          } else {
            await fetchUsers(currentPage);
          }
          return;
        }
      } catch (err) {
        console.log(`Alternative ${alt.method} failed:`, err.message);
      }
    }
    
    setError("All delete methods failed. Please check API documentation.");
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
        if (isSearching && searchQuery) {
          fetchUsersWithSearch(1, searchQuery);
        } else {
          fetchUsers(1);
        }
        
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
              onClick={() => fetchData()}
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
            onClick={refreshCurrentPage}
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
              <Col md={2}>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 py-2"
                >
                  <i className="bi bi-search me-2"></i>
                  Search
                </Button>
              </Col>
              <Col md={2}>
                <Button 
                  type="button" 
                  variant="outline-secondary" 
                  className="w-100 py-2"
                  onClick={handleClearSearch}
                  disabled={!searchQuery && !isSearching}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>
          {searchQuery && (
            <div className="text-muted small mt-2">
              {isSearching ? (
                <>Searching for "{searchQuery}"... Showing page {currentPage} of {totalPages}</>
              ) : (
                <>Found {filteredUsers.length} users matching "{searchQuery}"</>
              )}
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
                  users.map((user, index) => (
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
      {users.length > 0 && totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted small">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
            {isSearching && searchQuery && ` matching "${searchQuery}"`}
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