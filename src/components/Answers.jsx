// components/Answers.jsx
import React, { useState } from "react";
import { Table, Button, Badge, Form, InputGroup } from "react-bootstrap";

const Answers = () => {
  const [answers] = useState([
    {
      id: "0199a8c6-a07b-70aa-86e9-319213df4bf4",
      question: "Which car has the right of way?",
      answer: "Car A",
      status: "active",
      correct: false,
    },
    {
      id: "0199a8c6-a07b-70aa-86e9-319213df4bf4",
      question: "Which car has the right of way?",
      answer: "Car B",
      status: "active",
      correct: true,
    },
    {
      id: "0199a8c6-16a0-7065-a566-a9c1e0491f20",
      question: "Which car gives right of way?",
      answer: "Car A",
      status: "active",
      correct: false,
    },
    {
      id: "0199a8c6-16a0-7065-a566-a9c1e0491f20",
      question: "Which car gives right of way?",
      answer: "Car B",
      status: "active",
      correct: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnswers = answers.filter(
    (answer) =>
      answer.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      answer.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      answer.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Answers</h4>
        <Button variant="primary">
          <i className="bi bi-plus-circle me-2"></i>
          Add New Answer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Search answers by name, question, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Answers Table */}
      <div className="bg-white rounded shadow-sm">
        <Table responsive hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="fw-medium p-3">Question</th>
              <th className="fw-medium p-3">Answer</th>
              <th className="fw-medium p-3" style={{ width: "100px" }}>
                Status
              </th>
              <th className="fw-medium p-3" style={{ width: "100px" }}>
                Correct
              </th>
              <th className="fw-medium p-3" style={{ width: "150px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAnswers.map((answer, index) => (
              <tr key={`${answer.id}-${index}`}>
                <td className="p-3">
                  <div>
                    <div className="fw-medium">{answer.question}</div>
                    <div className="text-muted small mt-1">
                      ID: {answer.id}
                    </div>
                  </div>
                </td>
                <td className="p-3 fw-medium">{answer.answer}</td>
                <td className="p-3">
                  <Badge bg="success" className="px-3 py-1">
                    {answer.status}
                  </Badge>
                </td>
                <td className="p-3">
                  {answer.correct ? (
                    <span className="text-success fw-bold">✓ Correct</span>
                  ) : (
                    <span className="text-danger fw-bold">× Incorrect</span>
                  )}
                </td>
                <td className="p-3">
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
            ))}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <div className="text-muted">
            Showing {filteredAnswers.length} of {answers.length} answers
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
              4
            </Button>
            <Button variant="outline-secondary" size="sm">
              5
            </Button>
            <Button variant="outline-secondary" size="sm">
              Next &gt;
            </Button>
          </div>
        </div>
        <div className="text-center p-3 border-top">
          <div className="text-muted small">Page 1 of 110</div>
        </div>
      </div>
    </div>
  );
};

export default Answers;