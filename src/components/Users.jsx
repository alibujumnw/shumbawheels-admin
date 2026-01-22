// components/Users.jsx
import React, { useState } from "react";
import { Table, Form, Button, Badge, Pagination } from "react-bootstrap";

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample user data
  const users = [
    { id: 1, firstname: "user1", lastname: "user1", paymentStatus: "paid", email: "ali@gmail.com", phone: "1234567890", role: "admin", macAddress: "1234::1223::1233" },
    { id: 2, firstname: "admin", lastname: "admin", paymentStatus: "paid", email: "admin@gmail.com", phone: "0777112233", role: "admin", macAddress: "1234::1223::1233" },
    { id: 3, firstname: "albert", lastname: "manyawi", paymentStatus: "pending", email: "12345678909@example.com", phone: "12345678909", role: "user", macAddress: "AA:BB:CC:DD:EE:FF" },
    { id: 4, firstname: "Nokutenda", lastname: "bosha", paymentStatus: "pending", email: "0779707567@example.com", phone: "0779707567", role: "user", macAddress: "00-1B-44-11-3A-B7" },
    { id: 5, firstname: "Nokutenda", lastname: "bosha", paymentStatus: "pending", email: "0779707566@example.com", phone: "0779707566", role: "user", macAddress: "00-1B-44-11-3A-B7" },
    { id: 6, firstname: "Nokutenda", lastname: "bosha", paymentStatus: "pending", email: "0779707565@example.com", phone: "0779707565", role: "user", macAddress: "00-1B-44-11-3A-B7" },
    { id: 7, firstname: "John", lastname: "Doe", paymentStatus: "paid", email: "john@example.com", phone: "0777123456", role: "user", macAddress: "11-22-33-44-55-66" },
    { id: 8, firstname: "Jane", lastname: "Smith", paymentStatus: "pending", email: "jane@example.com", phone: "0777654321", role: "user", macAddress: "AA-BB-CC-DD-EE-FF" },
  ];

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery) ||
    user.macAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold">Users</h2>
        <p className="text-muted">Manage system users and their permissions</p>
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
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive">
        <Table bordered hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Firstname</th>
              <th>Lastname</th>
              <th>Payment Status</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Role</th>
              <th>Mac Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="fw-medium">{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>
                  <Badge bg={user.paymentStatus === "paid" ? "success" : "warning"}>
                    {user.paymentStatus}
                  </Badge>
                </td>
                <td>
                  <small>{user.email}</small>
                </td>
                <td>{user.phone}</td>
                <td>
                  <Badge bg={user.role === "admin" ? "primary" : "secondary"}>
                    {user.role}
                  </Badge>
                </td>
                <td>
                  <small className="text-muted">{user.macAddress}</small>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline-danger" size="sm">
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="text-muted small">
          Page 1 of 3
        </div>
        <Pagination>
          <Pagination.Prev disabled>Previous</Pagination.Prev>
          <Pagination.Item active>1</Pagination.Item>
          <Pagination.Item>2</Pagination.Item>
          <Pagination.Item>3</Pagination.Item>
          <Pagination.Next>Next</Pagination.Next>
        </Pagination>
      </div>
    </div>
  );
};

export default Users;