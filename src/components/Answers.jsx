import React, { useState, useEffect } from "react";
import { 
  Table, Button, Badge, Form, InputGroup, 
  Spinner, Alert, Card, Pagination, Modal,
  Row, Col, FloatingLabel
} from "react-bootstrap";
import axios from "axios";

const Answers = () => {
  const [allAnswers, setAllAnswers] = useState([]); // Store all answers
  const [displayedAnswers, setDisplayedAnswers] = useState([]); // Answers for current page
  const [questions, setQuestions] = useState({}); // Store question data by ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const perPage = 30; // Fixed at 30 answers per page
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);
  
  // New answer form state
  const [newAnswer, setNewAnswer] = useState({
    question_id: '',
    name: '',
    status: 'active',
    is_correct: '0'
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({});

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token') || '';
  };

  // Fetch all answers from API
  const fetchAllAnswers = async () => {
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

      const response = await axios.get('https://api.shumbawheels.co.zw/api/admin/get-answers', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("Answers API Response:", response.data);

      // Handle API response
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const answers = response.data.data;
        setAllAnswers(answers);
        setTotalAnswers(answers.length);
        
        // Calculate total pages
        const totalPagesCount = Math.ceil(answers.length / perPage);
        setTotalPages(totalPagesCount);
        
        // Update displayed answers for current page
        updateDisplayedAnswers(currentPage, answers);
        
        // Fetch questions to get question names
        fetchQuestionsForAnswers(answers);
        
      } else {
        setAllAnswers([]);
        setDisplayedAnswers([]);
        setError("Invalid data format received from server");
      }
      
    } catch (error) {
      console.error('Error fetching answers:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Session expired. Please login again.");
        } else if (error.response.status === 403) {
          setError("You don't have permission to view answers.");
        } else if (error.response.status === 404) {
          setError("Answers endpoint not found.");
        } else {
          setError(`Server error: ${error.response.status}. Please try again.`);
        }
      } else if (error.request) {
        setError("No response from server. Please check your internet connection.");
      } else {
        setError("Failed to load answers. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions to get question names
  const fetchQuestionsForAnswers = async (answers) => {
    try {
      const token = getToken();
      if (!token) return;

      // Extract unique question IDs from answers
      const uniqueQuestionIds = [...new Set(answers.map(answer => answer.question_id))];
      
      if (uniqueQuestionIds.length === 0) return;

      // Fetch questions in batches if needed
      const questionsMap = {};
      
      // You might need to adjust this based on your API
      // For now, let's fetch all questions
      const questionsResponse = await axios.get('https://api.shumbawheels.co.zw/api/admin/get-questions', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (questionsResponse.data && questionsResponse.data.data && Array.isArray(questionsResponse.data.data)) {
        questionsResponse.data.data.forEach(question => {
          questionsMap[question.id] = question.name;
        });
        
        setQuestions(questionsMap);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Don't set error here - we can still display answers without question names
    }
  };

  // Update displayed answers based on current page and search
  const updateDisplayedAnswers = (page, answers = allAnswers) => {
    // Filter by search query if provided
    let filteredAnswers = answers;
    if (searchQuery.trim() !== "") {
      filteredAnswers = answers.filter(answer => {
        const answerText = answer.name || '';
        const questionText = questions[answer.question_id] || '';
        const statusText = answer.status || '';
        
        return (
          answerText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          statusText.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    // Get answers for current page
    const pageAnswers = filteredAnswers.slice(startIndex, endIndex);
    setDisplayedAnswers(pageAnswers);
    
    // Update total answers count for filtered results
    const filteredTotal = filteredAnswers.length;
    setTotalAnswers(filteredTotal);
    
    // Update total pages for filtered results
    const totalPagesCount = Math.ceil(filteredTotal / perPage);
    setTotalPages(totalPagesCount || 1);
    
    // Adjust current page if it's out of bounds after filtering
    if (page > totalPagesCount && totalPagesCount > 0) {
      setCurrentPage(totalPagesCount);
    }
  };

  useEffect(() => {
    fetchAllAnswers();
  }, []);

  useEffect(() => {
    updateDisplayedAnswers(currentPage);
  }, [currentPage, searchQuery, allAnswers, questions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateDisplayedAnswers(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    updateDisplayedAnswers(1);
  };

  const handleDeleteClick = (answer) => {
    setSelectedAnswer(answer);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAnswer) return;

    try {
      setDeleting(true);
      const token = getToken();
      
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.delete(
        `https://api.shumbawheels.co.zw/api/admin/answers/${selectedAnswer.id}`,
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
        setSuccessMessage(`Answer "${selectedAnswer.name}" deleted successfully.`);
        
        // Close the modal
        setShowDeleteModal(false);
        setSelectedAnswer(null);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
        
        // Refresh answers list
        await fetchAllAnswers();
        
      } else {
        setError(response.data.message || "Failed to delete answer. Please try again.");
      }
    } catch (error) {
      console.error('Error deleting answer:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Session expired. Please login again.");
        } else if (error.response.status === 403) {
          setError("You don't have permission to delete answers.");
        } else if (error.response.status === 404) {
          setError("Answer not found.");
        } else {
          setError(`Error: ${error.response.data?.message || "Failed to delete answer"}`);
        }
      } else if (error.request) {
        setError("No response from server. Please check your internet connection.");
      } else {
        setError("Failed to delete answer. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // Handle form input changes for new answer
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAnswer({
      ...newAnswer,
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
    
    if (!newAnswer.question_id.trim()) {
      errors.question_id = 'Question is required';
    }
    
    if (!newAnswer.name.trim()) {
      errors.name = 'Answer text is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add answer submission
  const handleAddAnswer = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setAdding(true);
      
      const answerData = {
        question_id: newAnswer.question_id,
        name: newAnswer.name,
        status: newAnswer.status,
        is_correct: newAnswer.is_correct
      };

      console.log('Sending answer data:', answerData);

      const token = getToken();
      const response = await axios.post(
        'https://api.shumbawheels.co.zw/api/admin/answers',
        answerData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Add Answer Response:', response.data);

      if (response.data && response.data.success) {
        setSuccessMessage(`Answer "${newAnswer.name}" created successfully!`);
        
        // Reset form
        setNewAnswer({
          question_id: '',
          name: '',
          status: 'active',
          is_correct: '0'
        });
        
        // Close modal
        setShowAddModal(false);
        setFormErrors({});
        
        // Refresh answers list
        await fetchAllAnswers();
        
        // Go to first page to see new answer
        setCurrentPage(1);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        setError(response.data.message || 'Failed to create answer. Please try again.');
      }
      
    } catch (error) {
      console.error('Error adding answer:', error);
      
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
          setError('Answer with this text already exists for this question.');
        } else {
          setError(error.response.data.message || `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('Failed to create answer. Please try again.');
      }
    } finally {
      setAdding(false);
    }
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
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

  // Get status badge
  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Unknown</Badge>;
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') {
      return <Badge bg="success">Active</Badge>;
    } else if (statusLower === 'inactive') {
      return <Badge bg="secondary">Inactive</Badge>;
    } else if (statusLower === 'draft') {
      return <Badge bg="warning">Draft</Badge>;
    } else {
      return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Get correct badge
  const getCorrectBadge = (isCorrect) => {
    if (isCorrect === '1' || isCorrect === 1 || isCorrect === true) {
      return <span className="text-success fw-bold">✓ Correct</span>;
    } else {
      return <span className="text-danger fw-bold">× Incorrect</span>;
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
        day: 'numeric'
      });
    } catch (e) {
      return iso;
    }
  };

  if (loading && displayedAnswers.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading answers...</p>
        </div>
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

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Answers Management</h2>
          <p className="text-muted mb-0">View and manage all question answers</p>
        </div>
        <div>
          <Button 
            variant="outline-primary" 
            onClick={fetchAllAnswers}
            disabled={loading}
            className="me-2"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Add New Answer
          </Button>
        </div>
      </div>

      {/* Search Controls */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search answers by text, question, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2"
              />
              <Button 
                type="submit" 
                variant="primary"
                className="px-4"
              >
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
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              Showing {displayedAnswers.length} of {totalAnswers} answers (30 per page)
            </div>
            {searchQuery && (
              <div className="text-muted small">
                <i className="bi bi-search me-1"></i>
                Search results for "{searchQuery}" - Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Answers Table */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="p-3" style={{ width: "50px" }}>#</th>
                  <th className="p-3">Question</th>
                  <th className="p-3">Answer</th>
                  <th className="p-3" style={{ width: "100px" }}>Status</th>
                  <th className="p-3" style={{ width: "120px" }}>Correct</th>
                  <th className="p-3" style={{ width: "150px" }}>Created</th>
                  <th className="p-3" style={{ width: "200px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedAnswers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="py-4">
                        <i className="bi bi-chat-left-text fs-1 text-muted"></i>
                        <p className="mt-3">
                          {searchQuery ? 'No answers match your search.' : 'No answers found.'}
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
                  displayedAnswers.map((answer, index) => {
                    // Calculate the actual answer number based on current page
                    const answerNumber = ((currentPage - 1) * perPage) + index + 1;
                    const questionName = questions[answer.question_id] || `Question ID: ${answer.question_id.substring(0, 8)}...`;
                    
                    return (
                      <tr key={answer.id}>
                        <td className="p-3">
                          <small className="text-muted">{answerNumber}</small>
                        </td>
                        <td className="p-3">
                          <div className="fw-medium">{questionName}</div>
                          <small className="text-muted d-block mt-1">
                            QID: {answer.question_id.substring(0, 8)}...
                          </small>
                        </td>
                        <td className="p-3 fw-medium">{answer.name}</td>
                        <td className="p-3">
                          {getStatusBadge(answer.status)}
                        </td>
                        <td className="p-3">
                          {getCorrectBadge(answer.is_correct)}
                        </td>
                        <td className="p-3">
                          <small className="text-muted">
                            {formatDate(answer.created_at)}
                          </small>
                        </td>
                        <td className="p-3">
                          <div className="d-flex gap-2 flex-wrap">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => console.log('Edit answer:', answer.id)}
                              title="Edit answer"
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteClick(answer)}
                              disabled={deleting}
                              title="Delete answer"
                            >
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Pagination */}
      {totalAnswers > perPage && (
        <Card className="shadow-sm border-0 mt-4">
          <Card.Body>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="text-muted mb-3 mb-md-0">
                Showing answers {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalAnswers)} of {totalAnswers}
                <span className="ms-2 text-info">(30 per page)</span>
              </div>
              
              <Pagination className="mb-0">
                <Pagination.First 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                  title="First page"
                />
                <Pagination.Prev 
                  onClick={() => setCurrentPage(currentPage - 1)} 
                  disabled={currentPage === 1}
                  title="Previous page"
                />
                
                {renderPaginationItems()}
                
                <Pagination.Next 
                  onClick={() => setCurrentPage(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  title="Next page"
                />
                <Pagination.Last 
                  onClick={() => setCurrentPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  title="Last page"
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
            <div className="text-center text-muted small mt-3">
              Pages: {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).join(' | ')}
              {totalPages > 10 && ' | ...'}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Add Answer Modal */}
      <Modal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Answer</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddAnswer}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="py-2">
                <small>{error}</small>
              </Alert>
            )}
            
            <FloatingLabel controlId="question_id" label="Question *" className="mb-3">
              <Form.Control
                type="text"
                name="question_id"
                placeholder="Question ID"
                value={newAnswer.question_id}
                onChange={handleInputChange}
                isInvalid={!!formErrors.question_id}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.question_id}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Enter the Question ID from the questions list
              </Form.Text>
            </FloatingLabel>

            <FloatingLabel controlId="name" label="Answer Text *" className="mb-3">
              <Form.Control
                type="text"
                name="name"
                placeholder="Answer Text"
                value={newAnswer.name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Enter the answer text that users will see
              </Form.Text>
            </FloatingLabel>

            <Row>
              <Col md={6}>
                <FloatingLabel controlId="status" label="Status" className="mb-3">
                  <Form.Select
                    name="status"
                    value={newAnswer.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="is_correct" label="Correct Answer" className="mb-3">
                  <Form.Select
                    name="is_correct"
                    value={newAnswer.is_correct}
                    onChange={handleInputChange}
                  >
                    <option value="0">Incorrect</option>
                    <option value="1">Correct</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
            </Row>

            <div className="alert alert-info mt-3">
              <small>
                <i className="bi bi-info-circle me-2"></i>
                Fields marked with * are required. Only one correct answer per question is allowed.
              </small>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowAddModal(false);
                setFormErrors({});
                setNewAnswer({
                  question_id: '',
                  name: '',
                  status: 'active',
                  is_correct: '0'
                });
              }}
              disabled={adding}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={adding}
            >
              {adding ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-1"></i>
                  Create Answer
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
          {selectedAnswer && (
            <>
              <p className="mb-3">
                Are you sure you want to delete the answer <strong>"{selectedAnswer.name}"</strong>?
              </p>
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                This action cannot be undone.
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Question:</strong> {questions[selectedAnswer.question_id] || selectedAnswer.question_id}<br />
                  <strong>Answer ID:</strong> {selectedAnswer.id}<br />
                  <strong>Status:</strong> {selectedAnswer.status}<br />
                  <strong>Correct:</strong> {selectedAnswer.is_correct === '1' ? 'Yes' : 'No'}<br />
                  <strong>Created:</strong> {formatDate(selectedAnswer.created_at)}
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
              setSelectedAnswer(null);
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
              'Delete Answer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Answers;