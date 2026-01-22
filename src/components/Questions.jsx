// components/Questions.jsx
import React, { useState } from "react";
import { Table, Button, Badge, Form, InputGroup } from "react-bootstrap";

const Questions = () => {
  const [questions] = useState([
    {
      id: 1,
      text: "Which car has the right of way?",
      imageStatus: "active",
      status: "active",
    },
    {
      id: 2,
      text: "Which car gives right of way?",
      imageStatus: "active",
      status: "active",
    },
    {
      id: 3,
      text: "Which car should stop? (A traffic circle)",
      imageStatus: "active",
      status: "active",
    },
    {
      id: 4,
      text: "Which car gives right of way?",
      imageStatus: "active",
      status: "active",
    },
    {
      id: 5,
      text: "Which car gives right of way?",
      imageStatus: "active",
      status: "active",
    },
    {
      id: 6,
      text: "The sign indicates:",
      imageStatus: "active",
      status: "active",
    },
    {
      id: 7,
      text: "When approaching this sign, I should:",
      imageStatus: "active",
      status: "active",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuestions = questions.filter((question) =>
    question.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Questions</h4>
        <Button variant="primary">
          <i className="bi bi-plus-circle me-2"></i>
          Add New Question
        </Button>
      </div>

      <div className="mb-4">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Search questions by name or image URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="bg-white rounded shadow-sm">
        <Table responsive hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="fw-medium" style={{ width: "50px" }}>
                #
              </th>
              <th className="fw-medium">Name</th>
              <th className="fw-medium" style={{ width: "120px" }}>
                Image
              </th>
              <th className="fw-medium" style={{ width: "120px" }}>
                Status
              </th>
              <th className="fw-medium" style={{ width: "200px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((question, index) => (
              <tr key={question.id}>
                <td className="align-middle text-muted">{index + 1}</td>
                <td className="align-middle">
                  <div className="fw-medium">{question.text}</div>
                </td>
                <td className="align-middle">
                  <Badge bg="success" className="px-3 py-1">
                    {question.imageStatus}
                  </Badge>
                </td>
                <td className="align-middle">
                  <Badge bg="info" className="px-3 py-1">
                    {question.status}
                  </Badge>
                </td>
                <td className="align-middle">
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </Button>
                    <Button variant="outline-success" size="sm">
                      <i className="bi bi-plus-circle me-1"></i>
                      Add Answers
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

        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <div className="text-muted">
            Showing {filteredQuestions.length} of {questions.length} questions
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" disabled>
              « Previous
            </Button>
            <Button variant="outline-primary" size="sm" className="active">
              1
            </Button>
            <Button variant="outline-secondary" size="sm">
              2
            </Button>
            <span className="mx-2">...</span>
            <Button variant="outline-secondary" size="sm">
              32
            </Button>
            <Button variant="outline-secondary" size="sm">
              Next »
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questions;