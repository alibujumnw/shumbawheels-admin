import React, { useState, useEffect } from "react";
import { 
  Table, Button, Badge, Form, InputGroup, 
  Spinner, Alert, Card, Pagination, Modal,
  Row, Col, FloatingLabel
} from "react-bootstrap";
import axios from "axios";

const Questions = () => {
  const [allQuestions, setAllQuestions] = useState([]); // Store all questions
  const [displayedQuestions, setDisplayedQuestions] = useState([]); // Questions for current page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const perPage = 25; // Fixed at 25 questions per page
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);
  
  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    name: '',
    image_url: '',
    status: 'active'
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({});

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token') || '';
  };

  // Fetch all questions from API
  const fetchAllQuestions = async () => {
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

      const response = await axios.get('https://api.shumbawheels.co.zw/api/admin/get-questions', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("Questions API Response:", response.data);

      // Handle API response
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const questions = response.data.data;
        setAllQuestions(questions);
        setTotalQuestions(questions.length);
        
        // Calculate total pages
        const totalPagesCount = Math.ceil(questions.length / perPage);
        setTotalPages(totalPagesCount);
        
        // Update displayed questions for current page
        updateDisplayedQuestions(currentPage, questions);
        
      } else {
        setAllQuestions([]);
        setDisplayedQuestions([]);
        setError("Invalid data format received from server");
      }
      
    } catch (error) {
      console.error('Error fetching questions:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Session expired. Please login again.");
        } else if (error.response.status === 403) {
          setError("You don't have permission to view questions.");
        } else if (error.response.status === 404) {
          setError("Questions endpoint not found.");
        } else {
          setError(`Server error: ${error.response.status}. Please try again.`);
        }
      } else if (error.request) {
        setError("No response from server. Please check your internet connection.");
      } else {
        setError("Failed to load questions. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update displayed questions based on current page and search
  const updateDisplayedQuestions = (page, questions = allQuestions) => {
    // Filter by search query if provided
    let filteredQuestions = questions;
    if (searchQuery.trim() !== "") {
      filteredQuestions = questions.filter(question =>
        question.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (question.image_url && question.image_url.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    // Get questions for current page
    const pageQuestions = filteredQuestions.slice(startIndex, endIndex);
    setDisplayedQuestions(pageQuestions);
    
    // Update total questions count for filtered results
    const filteredTotal = filteredQuestions.length;
    setTotalQuestions(filteredTotal);
    
    // Update total pages for filtered results
    const totalPagesCount = Math.ceil(filteredTotal / perPage);
    setTotalPages(totalPagesCount || 1);
    
    // Adjust current page if it's out of bounds after filtering
    if (page > totalPagesCount && totalPagesCount > 0) {
      setCurrentPage(totalPagesCount);
    }
  };

  useEffect(() => {
    fetchAllQuestions();
  }, []);

  useEffect(() => {
    updateDisplayedQuestions(currentPage);
  }, [currentPage, searchQuery, allQuestions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateDisplayedQuestions(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    updateDisplayedQuestions(1);
  };

  const handleDeleteClick = (question) => {
    setSelectedQuestion(question);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuestion) return;

    try {
      setDeleting(true);
      const token = getToken();
      
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.delete(
        `https://api.shumbawheels.co.zw/api/admin/questions/${selectedQuestion.id}`,
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
        setSuccessMessage(`Question "${selectedQuestion.name}" deleted successfully.`);
        
        // Close the modal
        setShowDeleteModal(false);
        setSelectedQuestion(null);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
        
        // Refresh questions list
        await fetchAllQuestions();
        
      } else {
        setError(response.data.message || "Failed to delete question. Please try again.");
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Session expired. Please login again.");
        } else if (error.response.status === 403) {
          setError("You don't have permission to delete questions.");
        } else if (error.response.status === 404) {
          setError("Question not found.");
        } else {
          setError(`Error: ${error.response.data?.message || "Failed to delete question"}`);
        }
      } else if (error.request) {
        setError("No response from server. Please check your internet connection.");
      } else {
        setError("Failed to delete question. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // Handle form input changes for new question
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({
      ...newQuestion,
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
    
    if (!newQuestion.name.trim()) {
      errors.name = 'Question text is required';
    }
    
    if (!newQuestion.image_url.trim()) {
      errors.image_url = 'Image URL is required';
    } else if (!isValidUrl(newQuestion.image_url)) {
      errors.image_url = 'Please enter a valid URL';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Handle add question submission
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setAdding(true);
      
      const questionData = {
        name: newQuestion.name,
        image_url: newQuestion.image_url,
        status: newQuestion.status
      };

      console.log('Sending question data:', questionData);

      const token = getToken();
      const response = await axios.post(
        'https://api.shumbawheels.co.zw/api/admin/questions',
        questionData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Add Question Response:', response.data);

      if (response.data && response.data.success) {
        setSuccessMessage(`Question "${newQuestion.name}" created successfully!`);
        
        // Reset form
        setNewQuestion({
          name: '',
          image_url: '',
          status: 'active'
        });
        
        // Close modal
        setShowAddModal(false);
        setFormErrors({});
        
        // Refresh questions list
        await fetchAllQuestions();
        
        // Go to first page to see new question
        setCurrentPage(1);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        setError(response.data.message || 'Failed to create question. Please try again.');
      }
      
    } catch (error) {
      console.error('Error adding question:', error);
      
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
          setError('Question with this name already exists.');
        } else {
          setError(error.response.data.message || `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('Failed to create question. Please try again.');
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

  if (loading && displayedQuestions.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading questions...</p>
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
          <h2 className="fw-bold mb-1">Questions Management</h2>
          <p className="text-muted mb-0">View and manage all driving test questions</p>
        </div>
        <div>
          <Button 
            variant="outline-primary" 
            onClick={fetchAllQuestions}
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
            Add New Question
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
                placeholder="Search questions by name or image URL..."
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
              Showing {displayedQuestions.length} of {totalQuestions} questions (25 per page)
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

      {/* Questions Table */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="p-3" style={{ width: "50px" }}>#</th>
                  <th className="p-3">Question</th>
                  <th className="p-3">Image Preview</th>
                  <th className="p-3" style={{ width: "100px" }}>Status</th>
                  <th className="p-3" style={{ width: "150px" }}>Created</th>
                  <th className="p-3" style={{ width: "250px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="py-4">
                        <i className="bi bi-question-circle fs-1 text-muted"></i>
                        <p className="mt-3">
                          {searchQuery ? 'No questions match your search.' : 'No questions found.'}
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
                  displayedQuestions.map((question, index) => {
                    // Calculate the actual question number based on current page
                    const questionNumber = ((currentPage - 1) * perPage) + index + 1;
                    
                    return (
                      <tr key={question.id}>
                        <td className="p-3">
                          <small className="text-muted">{questionNumber}</small>
                        </td>
                        <td className="p-3">
                          <div className="fw-medium">{question.name}</div>
                          <small className="text-muted d-block mt-1">
                            ID: {question.id.substring(0, 8)}...
                          </small>
                        </td>
                        <td className="p-3">
                          {question.image_url ? (
                            <div className="d-flex align-items-center">
                              <img 
                                src={question.image_url} 
                                alt={question.name}
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover',
                                  borderRadius: '6px'
                                }}
                                className="me-2"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                                }}
                              />
                              <Button 
                                variant="outline-info" 
                                size="sm"
                                onClick={() => window.open(question.image_url, '_blank')}
                                title="View full image"
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                            </div>
                          ) : (
                            <Badge bg="secondary" className="px-3 py-1">
                              No Image
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {getStatusBadge(question.status)}
                        </td>
                        <td className="p-3">
                          <small className="text-muted">
                            {formatDate(question.created_at)}
                          </small>
                        </td>
                        <td className="p-3">
                          <div className="d-flex gap-2 flex-wrap">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => console.log('Edit question:', question.id)}
                              title="Edit question"
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => console.log('Add answers to:', question.id)}
                              title="Manage answers"
                            >
                              <i className="bi bi-plus-circle me-1"></i>
                              Answers
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteClick(question)}
                              disabled={deleting}
                              title="Delete question"
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
      {totalQuestions > perPage && (
        <Card className="shadow-sm border-0 mt-4">
          <Card.Body>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="text-muted mb-3 mb-md-0">
                Showing questions {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalQuestions)} of {totalQuestions}
                <span className="ms-2 text-info">(25 per page)</span>
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
              Pages: {Array.from({ length: totalPages }, (_, i) => i + 1).join(' | ')}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Add Question Modal */}
      <Modal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Question</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddQuestion}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="py-2">
                <small>{error}</small>
              </Alert>
            )}
            
            <FloatingLabel controlId="name" label="Question Text *" className="mb-3">
              <Form.Control
                type="text"
                name="name"
                placeholder="Question Text"
                value={newQuestion.name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
                required
                as="textarea"
                style={{ height: '100px' }}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Enter the question text that users will see
              </Form.Text>
            </FloatingLabel>

            <FloatingLabel controlId="image_url" label="Image URL *" className="mb-3">
              <Form.Control
                type="url"
                name="image_url"
                placeholder="Image URL"
                value={newQuestion.image_url}
                onChange={handleInputChange}
                isInvalid={!!formErrors.image_url}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.image_url}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Enter the full URL to the question image (e.g., https://api.shumbawheels.co.zw/uploads/image.png)
              </Form.Text>
            </FloatingLabel>

            <Row>
              <Col md={6}>
                <FloatingLabel controlId="status" label="Status" className="mb-3">
                  <Form.Select
                    name="status"
                    value={newQuestion.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
            </Row>

            <div className="alert alert-info mt-3">
              <small>
                <i className="bi bi-info-circle me-2"></i>
                Fields marked with * are required. Make sure the image URL is accessible.
              </small>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowAddModal(false);
                setFormErrors({});
                setNewQuestion({
                  name: '',
                  image_url: '',
                  status: 'active'
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
                  Create Question
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
          {selectedQuestion && (
            <>
              <p className="mb-3">
                Are you sure you want to delete the question <strong>"{selectedQuestion.name}"</strong>?
              </p>
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                This action cannot be undone. All associated answers will also be deleted.
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <strong>ID:</strong> {selectedQuestion.id}<br />
                  <strong>Status:</strong> {selectedQuestion.status}<br />
                  <strong>Created:</strong> {formatDate(selectedQuestion.created_at)}<br />
                  {selectedQuestion.image_url && (
                    <>
                      <strong>Image:</strong> 
                      <img 
                        src={selectedQuestion.image_url} 
                        alt="Question"
                        style={{ 
                          width: '100%', 
                          maxHeight: '150px',
                          objectFit: 'contain',
                          marginTop: '8px',
                          borderRadius: '6px'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x150?text=Image+Not+Found';
                        }}
                      />
                    </>
                  )}
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
              setSelectedQuestion(null);
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
              'Delete Question'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Questions;