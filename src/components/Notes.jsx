// components/Notes.jsx
import React, { useState } from "react";
import { Table, Button, Badge, Form, InputGroup, Card } from "react-bootstrap";

const Notes = () => {
  const [notes] = useState([]); // Empty array for now as per screenshot
  const [searchQuery, setSearchQuery] = useState("");

  // Categories for notes
  const categories = [
    "Traffic Signs",
    "Road Rules",
    "Safety Procedures",
    "Vehicle Maintenance",
    "Driving Techniques",
  ];

  // Lessons for notes
  const lessons = [
    "Lesson 1: Introduction",
    "Lesson 2: Traffic Signs",
    "Lesson 3: Road Markings",
    "Lesson 4: Right of Way",
    "Lesson 5: Parking Rules",
    "Lesson 6: Highway Driving",
    "Lesson 7: Night Driving",
    "Lesson 8: Adverse Conditions",
  ];

  const filteredNotes = notes.filter(
    (note) =>
      note.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Notes Management</h4>
        <Button variant="primary">
          <i className="bi bi-plus-circle me-2"></i>
          Add Note
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Search notes by description or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Notes Table */}
      <div className="bg-white rounded shadow-sm">
        <Table responsive hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="fw-medium p-3">Category</th>
              <th className="fw-medium p-3">Lesson</th>
              <th className="fw-medium p-3">Description</th>
              <th className="fw-medium p-3">Content</th>
              <th className="fw-medium p-3" style={{ width: "100px" }}>
                Status
              </th>
              <th className="fw-medium p-3" style={{ width: "200px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-5">
                  <div className="text-muted mb-3">
                    <i className="bi bi-journal-text fs-1"></i>
                  </div>
                  <h5 className="fw-medium">No notes available</h5>
                  <p className="text-muted mb-4">
                    Create your first note using the "Add Note" button above.
                  </p>
                </td>
              </tr>
            ) : (
              filteredNotes.map((note, index) => (
                <tr key={index}>
                  <td className="p-3">
                    <Badge bg="info" className="px-3 py-1">
                      {note.category}
                    </Badge>
                  </td>
                  <td className="p-3 fw-medium">{note.lesson}</td>
                  <td className="p-3">{note.description}</td>
                  <td className="p-3">
                    <div className="text-truncate" style={{ maxWidth: "200px" }}>
                      {note.content}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge bg={note.status === "active" ? "success" : "warning"} className="px-3 py-1">
                      {note.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm">
                        <i className="bi bi-eye me-1"></i>
                        View
                      </Button>
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
            Showing {filteredNotes.length} of {notes.length} notes
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
      </div>

      {/* Add Note Modal Trigger (Optional - can be implemented later) */}
      <div className="mt-4">
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center">
            <h5 className="fw-bold mb-3">Quick Actions</h5>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="outline-primary">
                <i className="bi bi-download me-2"></i>
                Export Notes
              </Button>
              <Button variant="outline-success">
                <i className="bi bi-upload me-2"></i>
                Import Notes
              </Button>
              <Button variant="outline-info">
                <i className="bi bi-printer me-2"></i>
                Print Notes
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Notes;