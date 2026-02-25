import React, { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone_number: '',
    role: 'user',
    payment_status: 'pending',
    mac_address: '',
    security_question: '',
    answer: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getUsers();
      setUsers(response.data.data || response.data); // Handle both structures
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, formData);
      } else {
        await adminService.createUser(formData);
      }
      
      setShowForm(false);
      setEditingUser(null);
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        phone_number: '',
        role: 'user',
        payment_status: 'pending',
        mac_address: '',
        security_question: '',
        answer: ''
      });
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(`Failed to ${editingUser ? 'update' : 'create'} user: ` + (err.response?.data?.message || err.message));
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      role: user.role || 'user',
      payment_status: user.payment_status || 'pending',
      mac_address: user.mac_address || '',
      security_question: user.security_question || '',
      answer: user.answer || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setLoading(true);
    try {
      await adminService.deleteUser(userId);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      phone_number: '',
      role: 'user',
      payment_status: 'pending',
      mac_address: '',
      security_question: '',
      answer: ''
    });
    setError('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentStatusBadge = (status) => {
    const statusColors = {
      paid: 'success',
      unpaid: 'danger',
      pending: 'warning'
    };
    return `bg-${statusColors[status] || 'secondary'}`;
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? 'bg-danger' : 'bg-primary';
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>User Management</h3>
        <button 
          className="btn btn-success btn-lg fw-bold shadow-sm"
          onClick={() => setShowForm(true)}
          disabled={loading}
          style={{ minWidth: '140px' }}
        >
          <i className="fas fa-plus-circle me-2"></i>
          Add New User
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* User Form Modal */}
      {showForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className={`fas ${editingUser ? 'fa-edit' : 'fa-user-plus'} me-2`}></i>
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={resetForm}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstname" className="form-label fw-bold">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstname"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastname" className="form-label fw-bold">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastname"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label fw-bold">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone_number" className="form-label fw-bold">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        required
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="role" className="form-label fw-bold">Role *</label>
                      <select
                        className="form-control"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="payment_status" className="form-label fw-bold">Payment Status *</label>
                      <select
                        className="form-control"
                        id="payment_status"
                        name="payment_status"
                        value={formData.payment_status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="mac_address" className="form-label fw-bold">MAC Address</label>
                    <input
                      type="text"
                      className="form-control"
                      id="mac_address"
                      name="mac_address"
                      value={formData.mac_address}
                      onChange={handleInputChange}
                      placeholder="00:1A:2B:3C:4D:5E"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="security_question" className="form-label fw-bold">Security Question</label>
                    <input
                      type="text"
                      className="form-control"
                      id="security_question"
                      name="security_question"
                      value={formData.security_question}
                      onChange={handleInputChange}
                      placeholder="What is your mother's maiden name?"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="answer" className="form-label fw-bold">Security Answer</label>
                    <input
                      type="text"
                      className="form-control"
                      id="answer"
                      name="answer"
                      value={formData.answer}
                      onChange={handleInputChange}
                      placeholder="Answer to security question"
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button 
                    type="button" 
                    className="btn btn-secondary fw-bold px-4" 
                    onClick={resetForm}
                  >
                    <i className="fas fa-times-circle me-2"></i>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`btn ${editingUser ? 'btn-warning' : 'btn-success'} fw-bold px-4 text-white`} 
                    disabled={loading}
                    style={editingUser ? {} : { backgroundColor: '#28a745', borderColor: '#28a745' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className={`fas ${editingUser ? 'fa-save' : 'fa-user-plus'} me-2`}></i>
                        {editingUser ? 'Update User' : 'Create User'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white py-3">
          <h5 className="mb-0">
            <i className="fas fa-users me-2"></i>
            Users List
          </h5>
        </div>
        <div className="card-body">
          {loading && !showForm ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading users...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Payment Status</th>
                    <th>MAC Address</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="fw-bold">
                        {user.firstname} {user.lastname}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone_number}</td>
                      <td>
                        <span className={`badge ${getRoleBadge(user.role)} px-3 py-2 fw-bold`}>
                          <i className={`fas ${user.role === 'admin' ? 'fa-crown' : 'fa-user'} me-1`}></i>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getPaymentStatusBadge(user.payment_status)} px-3 py-2 fw-bold`}>
                          <i className={`fas ${
                            user.payment_status === 'paid' ? 'fa-check-circle' : 
                            user.payment_status === 'unpaid' ? 'fa-times-circle' : 'fa-clock'
                          } me-1`}></i>
                          {user.payment_status}
                        </span>
                      </td>
                      <td>
                        <code className="bg-light p-1 rounded">{user.mac_address || '—'}</code>
                      </td>
                      <td>
                        <span className="badge bg-secondary bg-opacity-25 text-dark p-2">
                          <i className="fas fa-calendar-alt me-1"></i>
                          {formatDate(user.created_at)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-warning btn-sm fw-bold text-white"
                            onClick={() => handleEdit(user)}
                            disabled={loading}
                            title="Edit User"
                            style={{ minWidth: '65px' }}
                          >
                            <i className="fas fa-pencil-alt me-1"></i>
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm fw-bold"
                            onClick={() => handleDelete(user.id)}
                            disabled={loading}
                            title="Delete User"
                            style={{ minWidth: '75px' }}
                          >
                            <i className="fas fa-trash me-1"></i>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && !loading && (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="text-muted">
                          <i className="fas fa-users-slash fa-3x mb-3"></i>
                          <h5>No users found</h5>
                          <p>Click the "Add New User" button to create your first user.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;