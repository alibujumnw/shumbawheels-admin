// components/Users.jsx github
import React, { useState, useEffect } from "react";
import { Table, Form, Button, Badge, Pagination, Spinner, Alert } from "react-bootstrap";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken');
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = getToken();
      
      if (!token) {
        setError("Authentication required. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.shumbawheels.co.zw/api/admin/users', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      
      // Handle different response structures
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data.data && Array.isArray(data.data)) {
        setUsers(data.data);
      } else if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        // If response is an object with user data as properties
        const usersArray = Object.values(data).filter(item => 
          item && typeof item === 'object' && (item.firstname || item.first_name || item.email)
        );
        if (usersArray.length > 0) {
          setUsers(usersArray);
        } else {
          setUsers([]);
        }
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const searchLower = searchQuery.toLowerCase();
    
    return (
      (user.firstname && user.firstname.toLowerCase().includes(searchLower)) ||
      (user.lastname && user.lastname.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.phone && user.phone.includes(searchQuery)) ||
      (user.mac_address && user.mac_address.toLowerCase().includes(searchLower)) ||
      (user.macAddress && user.macAddress.toLowerCase().includes(searchLower)) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower))
    );
  });

  // Pagination logic
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPaymentStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Unknown</Badge>;
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('paid') || statusLower === 'paid') {
      return <Badge bg="success">Paid</Badge>;
    } else if (statusLower.includes('pending') || statusLower === 'pending') {
      return <Badge bg="warning">Pending</Badge>;
    } else if (statusLower.includes('active') || statusLower === 'active') {
      return <Badge bg="success">Active</Badge>;
    } else if (statusLower.includes('inactive') || statusLower === 'inactive') {
      return <Badge bg="secondary">Inactive</Badge>;
    } else {
      return <Badge bg="secondary">{status}</Badge>;
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

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="danger">
          {error}
          <div className="mt-2">
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="me-2"
              onClick={fetchUsers}
            >
              Retry
            </Button>
            {error.includes("login") && (
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => window.location.href = '/login'}
              >
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
      <div className="mb-4">
        <h2 className="fw-bold">Users</h2>
        <p className="text-muted">Manage system users and their permissions</p>
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </Button>
          </div>
          <div className="text-muted small">
            Total Users: {users.length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Search users by name, email, phone, or MAC address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-2"
          />
        </Form.Group>
        <div className="text-muted small mt-2">
          Showing {currentUsers.length} of {filteredUsers.length} filtered users (Total: {users.length})
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive">
        <Table bordered hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Firstname</th>
              <th>Lastname</th>
              <th>Payment Status</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Role</th>
              <th>MAC Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  {searchQuery ? 'No users match your search.' : 'No users found.'}
                </td>
              </tr>
            ) : (
              currentUsers.map((user, index) => (
                <tr key={user.id || user.user_id || index}>
                  <td className="text-muted">{indexOfFirstUser + index + 1}</td>
                  <td className="fw-medium">
                    {user.firstname || user.first_name || 'N/A'}
                  </td>
                  <td>{user.lastname || user.last_name || 'N/A'}</td>
                  <td>
                    {getPaymentStatusBadge(user.paymentStatus || user.payment_status || user.status)}
                  </td>
                  <td>
                    <small>{user.email || 'N/A'}</small>
                  </td>
                  <td>{user.phone || user.phone_number || 'N/A'}</td>
                  <td>
                    {getRoleBadge(user.role || user.user_type)}
                  </td>
                  <td>
                    <small className="text-muted">
                      {user.mac_address || user.macAddress || user.mac || 'N/A'}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm">
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
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted small">
            Page {currentPage} of {totalPages}
          </div>
          <Pagination>
            <Pagination.Prev 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left"></i> Previous
            </Pagination.Prev>
            
            {[...Array(totalPages)].map((_, index) => {
              // Show limited page numbers for better UX
              if (totalPages <= 7 || 
                  index === 0 || 
                  index === totalPages - 1 || 
                  (index >= currentPage - 2 && index <= currentPage + 2)) {
                return (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                );
              }
              return null;
            })}
            
            <Pagination.Next 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              Next <i className="bi bi-chevron-right"></i>
            </Pagination.Next>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Users;