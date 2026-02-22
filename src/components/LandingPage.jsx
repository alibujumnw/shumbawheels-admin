// components/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Modal, Form, Spinner, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png"; 

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!phoneNumber.trim() || !password.trim()) {
      setError("Please enter both phone number and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.shumbawheels.co.zw/api/login",
        {
          phone_number: phoneNumber.trim(),
          password: password.trim()
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 10000
        }
      );

      const responseData = response.data;
      
      const isSuccess = 
        responseData.success === true || 
        responseData.success === "true" ||
        responseData.status === "success" ||
        responseData.status === 200 ||
        response.status === 200;
      
      if (isSuccess) {
        const token = responseData.token || responseData.access_token || "";
        const userData = responseData.user || responseData.data || {};
        
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userPhone", phoneNumber.trim());
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        
        login(userData, phoneNumber.trim(), token);
        setShowLogin(false);
        navigate("/dashboard", { replace: true });
        
      } else {
        setError(responseData.message || responseData.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid phone number or password");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (err.request) {
        setError("No response from server. Please check your internet connection.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadApp = async () => {
    setDownloading(true);
    setError("");
    
    try {
      // First, try to get download info from API
      try {
        const response = await axios.get(
          "https://api.shumbawheels.co.zw/api/download-app",
          {
            timeout: 10000,
            headers: { "Accept": "application/json" }
          }
        );

        if (response.data.download_url) {
          setDownloadInfo({
            download_url: response.data.download_url,
            version: response.data.version || "Unknown",
            file_size: response.data.file_size || 0,
            created_at: response.data.created_at
          });

          // Open download URL in new tab
          window.open(response.data.download_url, '_blank');
        } else {
          // If no download_url, show demo download (for testing)
          handleDemoDownload();
        }
      } catch (apiError) {
        console.log("API error, using demo download:", apiError);
        // If API fails, use demo download (for testing)
        handleDemoDownload();
      }
    } catch (err) {
      setError("Failed to download app. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Demo download function (remove this in production)
  const handleDemoDownload = () => {
    // Create a dummy text file for demo
    const content = "This is a demo APK download. In production, this would be the actual APK file.";
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shumba-wheels-demo.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setDownloadInfo({
      version: "1.0.0",
      file_size: 1024 * 1024 * 15, // 15MB demo size
      created_at: new Date().toISOString()
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const testimonials = [
    {
      name: "Tatenda M.",
      text: "Shumba Wheels made learning to drive so easy! My instructor was patient and professional. Passed my test first time!",
      rating: 5,
      image: "/testimonial1.jpg"
    },
    {
      name: "Sarah C.",
      text: "The oral lessons were perfect for me. The instructors explain everything clearly and make you feel confident behind the wheel.",
      rating: 5,
      image: "/testimonial2.jpg"
    },
    {
      name: "Brian K.",
      text: "Best driving school in Zimbabwe! The booking system is convenient and the prices are affordable. Highly recommended!",
      rating: 5,
      image: "/testimonial3.jpg"
    }
  ];

  const features = [
    {
      icon: "bi-chat-dots",
      title: "Oral Lessons",
      description: "Specialized oral instruction for learners who prefer verbal guidance and explanation"
    },
    {
      icon: "bi-telephone",
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your driving needs"
    },
    {
      icon: "bi-calendar-check",
      title: "Flexible Booking",
      description: "Book your lessons online at your convenience"
    },
    {
      icon: "bi-phone",
      title: "Mobile App",
      description: "Access study materials and track progress on our mobile app"
    }
  ];

  const pricingPlans = [
    {
      name: "Oral Lessons",
      price: "$15",
      period: "1 Month",
      features: ["Practical lessons", "Basic theory", "Study materials", "Instructor support"],
      color: "primary"
    },
    {
      name: "Car Booking",
      price: "$40",
      period: "20 lessons",
      features: ["20 practical lessons", "Test preparation"],
      popular: true,
      color: "danger"
    },
    {
      name: "Application Package",
      price: "$5",
      period: "All lessons",
      features: ["Practical lessons", "Full theory course", "Study materials", "Test preparation", "Mock tests", "Guaranteed test booking"],
      color: "primary"
    }
  ];

  return (
    <>
      {/* Navigation */}
      <Navbar bg="white" expand="lg" fixed="top" className="py-3 shadow-sm">
        <Container>
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <span className="fw-bold fs-3 text-primary">SHUMBA</span>
            <span className="fw-bold fs-3 text-danger ms-2">WHEELS</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link 
                onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} 
                className="text-dark"
                style={{ cursor: 'pointer' }}
              >
                Features
              </Nav.Link>
              <Nav.Link 
                onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }} 
                className="text-dark"
                style={{ cursor: 'pointer' }}
              >
                Pricing
              </Nav.Link>
              <Nav.Link 
                onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }} 
                className="text-dark"
                style={{ cursor: 'pointer' }}
              >
                Testimonials
              </Nav.Link>
              <Nav.Link 
                onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} 
                className="text-dark"
                style={{ cursor: 'pointer' }}
              >
                Contact
              </Nav.Link>
              
              {/* Download App Button - Prominent in Navigation */}
              <Button 
                variant="primary" 
                className="ms-3 px-4 fw-bold"
                onClick={handleDownloadApp}
                disabled={downloading}
                style={{ 
                  borderRadius: '50px',
                  boxShadow: '0 4px 10px rgba(13, 110, 253, 0.3)'
                }}
              >
                {downloading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-download me-2"></i>
                    Download App
                  </>
                )}
              </Button>
              
              <Button 
                variant="danger" 
                className="ms-2 px-4"
                onClick={() => setShowLogin(true)}
                style={{ borderRadius: '50px' }}
              >
                Admin Login
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="hero-section" style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        paddingTop: '100px',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="display-3 fw-bold mb-4">
                <span className="text-primary">Drive</span>{' '}
                <span className="text-danger">with Confidence</span>
              </h1>
              <p className="lead mb-4 text-secondary">
                Zimbabwe's premier driving school offering specialized oral lessons 
                for learners who prefer verbal instruction. Join thousands of successful 
                drivers who passed with Shumba Wheels.
              </p>
              
              {/* App Info Display */}
              {downloadInfo && (
                <div className="mt-4 p-3 bg-white rounded shadow-sm d-inline-block">
                  <small className="text-muted d-block">
                    <i className="bi bi-info-circle text-primary me-2"></i>
                    Latest Version: {downloadInfo.version} | Size: {formatFileSize(downloadInfo.file_size)}
                  </small>
                </div>
              )}
            </Col>
            <Col lg={6} className="text-center">
              <img 
                src={logo} 
                alt="Driving School" 
                className="img-fluid rounded-3 shadow-lg"
                style={{ maxHeight: '500px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = logo; {/*chech the correct image link */}
                }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Rest of your sections remain exactly the same */}
      {/* Features Section */}
      <section id="features" className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              <span className="text-primary">Why Choose</span>{' '}
              <span className="text-danger">Shumba Wheels?</span>
            </h2>
            <p className="lead text-secondary">We specialize in oral lessons for all learning styles</p>
          </div>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index}>
                <Card className="h-100 border-0 shadow-sm text-center p-4">
                  <Card.Body>
                    <div className="display-1 text-primary mb-3">
                      <i className={`bi ${feature.icon}`}></i>
                    </div>
                    <h4 className="fw-bold mb-3 text-danger">{feature.title}</h4>
                    <p className="text-secondary">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              <span className="text-primary">Simple,</span>{' '}
              <span className="text-danger">Transparent Pricing</span>
            </h2>
            <p className="lead text-secondary">Choose the package that suits your learning needs</p>
          </div>
          <Row className="g-4 justify-content-center">
            {pricingPlans.map((plan, index) => (
              <Col md={4} key={index}>
                <Card className={`h-100 border-0 shadow ${plan.popular ? 'popular-plan' : ''}`} 
                  style={plan.popular ? { transform: 'scale(1.05)', border: '2px solid #dc3545' } : {}}>
                  {plan.popular && (
                    <div className="position-absolute top-0 start-50 translate-middle badge bg-danger text-white">
                      Most Popular
                    </div>
                  )}
                  <Card.Body className="p-4">
                    <h3 className="fw-bold text-center mb-3" style={{ color: plan.popular ? '#dc3545' : '#0d6efd' }}>
                      {plan.name}
                    </h3>
                    <div className="text-center mb-4">
                      <span className="display-4 fw-bold text-primary">{plan.price}</span>
                      <span className="text-secondary">/{plan.period}</span>
                    </div>
                    <ul className="list-unstyled">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="mb-3">
                          <i className="bi bi-check-circle-fill text-danger me-2"></i>
                          <span className="text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant={plan.popular ? "danger" : "outline-primary"} 
                      className="w-100 mt-3 py-2 fw-bold"
                      onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                    >
                      Enroll Now
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              <span className="text-primary">What Our</span>{' '}
              <span className="text-danger">Students Say</span>
            </h2>
            <p className="lead text-secondary">Join hundreds of satisfied drivers</p>
          </div>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="border-0 shadow-lg">
                <Card.Body className="p-5">
                  <div className="text-center">
                    <img 
                      src={testimonials[activeTestimonial].image}
                      alt={testimonials[activeTestimonial].name}
                      className="rounded-circle mb-4 border border-3 border-primary"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${testimonials[activeTestimonial].name.replace(' ', '+')}&background=0d6efd&color=fff&size=100`;
                      }}
                    />
                    <div className="mb-3">
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-danger me-1"></i>
                      ))}
                    </div>
                    <p className="lead mb-4 text-secondary">"{testimonials[activeTestimonial].text}"</p>
                    <h5 className="fw-bold text-primary">{testimonials[activeTestimonial].name}</h5>
                    
                    {/* Dots */}
                    <div className="mt-4">
                      {testimonials.map((_, index) => (
                        <Button
                          key={index}
                          variant="link"
                          className={`p-1 mx-1 ${index === activeTestimonial ? 'text-danger' : 'text-secondary'}`}
                          onClick={() => setActiveTestimonial(index)}
                        >
                          <i className={`bi bi-circle-fill fs-6`}></i>
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h2 className="display-5 fw-bold mb-4">
                <span className="text-primary">Ready to Start</span>{' '}
                <span className="text-danger">Your Journey?</span>
              </h2>
              <p className="lead text-secondary mb-4">
                Contact us today to book your first lesson. Our friendly team is ready to help you become a confident driver.
              </p>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center">
                  <div className="bg-primary rounded-circle p-3 me-3">
                    <i className="bi bi-telephone-fill text-white"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1 text-primary">Call Us</h6>
                    <p className="mb-0 text-secondary">+263 77 266 9449</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-danger rounded-circle p-3 me-3">
                    <i className="bi bi-envelope-fill text-white"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1 text-danger">Email Us</h6>
                    <p className="mb-0 text-secondary">mashirijona@gmail.com</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-primary rounded-circle p-3 me-3">
                    <i className="bi bi-geo-alt-fill text-white"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1 text-primary">Visit Us</h6>
                    <p className="mb-0 text-secondary">3199 Makwasha Township, Zvishavana</p>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-lg">
                <Card.Body className="p-4">
                  <h4 className="fw-bold mb-4">
                    <span className="text-primary">Send us</span>{' '}
                    <span className="text-danger">a message</span>
                  </h4>
                  <Form onSubmit={(e) => e.preventDefault()}>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Control type="text" placeholder="Your Name" className="border-secondary" />
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Control type="email" placeholder="Your Email" className="border-secondary" />
                      </Col>
                      <Col xs={12} className="mb-3">
                        <Form.Control type="tel" placeholder="Phone Number" className="border-secondary" />
                      </Col>
                      <Col xs={12} className="mb-3">
                        <Form.Control as="textarea" rows={4} placeholder="Your Message" className="border-secondary" />
                      </Col>
                      <Col xs={12}>
                        <Button variant="danger" type="submit" className="w-100 py-2 fw-bold">
                          Send Message
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-5">
        <Container>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <h5 className="fw-bold mb-3">
                <span className="text-white">SHUMBA</span>{' '}
                <span className="text-danger">WHEELS</span>
              </h5>
              <p className="text-white-50">
                Zimbabwe's premier driving school specializing in oral lessons for all learning styles.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="text-white"><i className="bi bi-facebook fs-5"></i></a>
                <a href="#" className="text-white"><i className="bi bi-instagram fs-5"></i></a>
                <a href="https://wa.me/263772669449" className="text-white" target="_blank" rel="noopener noreferrer"><i className="bi bi-whatsapp fs-5"></i></a>
              </div>
            </Col>
            <Col md={2} className="mb-4 mb-md-0">
              <h6 className="fw-bold mb-3 text-white">Quick Links</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a 
                    href="#features" 
                    className="text-white-50 text-decoration-none"
                    onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}
                    style={{ cursor: 'pointer' }}
                  >
                    Features
                  </a>
                </li>
                <li className="mb-2">
                  <a 
                    href="#pricing" 
                    className="text-white-50 text-decoration-none"
                    onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}
                    style={{ cursor: 'pointer' }}
                  >
                    Pricing
                  </a>
                </li>
                <li className="mb-2">
                  <a 
                    href="#testimonials" 
                    className="text-white-50 text-decoration-none"
                    onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}
                    style={{ cursor: 'pointer' }}
                  >
                    Testimonials
                  </a>
                </li>
                <li className="mb-2">
                  <a 
                    href="#contact" 
                    className="text-white-50 text-decoration-none"
                    onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                    style={{ cursor: 'pointer' }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </Col>
            <Col md={3} className="mb-4 mb-md-0">
              <h6 className="fw-bold mb-3 text-white">Our Services</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><span className="text-white-50">Oral Lessons</span></li>
                <li className="mb-2"><span className="text-white-50">Practical Training</span></li>
                <li className="mb-2"><span className="text-white-50">Theory Classes</span></li>
                <li className="mb-2"><span className="text-white-50">Test Preparation</span></li>
              </ul>
            </Col>
            <Col md={3}>
              <h6 className="fw-bold mb-3 text-white">Download App</h6>
              <Button 
                variant="danger" 
                className="w-100 mb-2"
                onClick={handleDownloadApp}
                disabled={downloading}
              >
                <i className="bi bi-android2 me-2"></i>
                {downloading ? 'Preparing...' : 'Android App'}
              </Button>
              <Button 
                variant="outline-light" 
                className="w-100"
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-google-play me-2"></i>
                Google Play
              </Button>
            </Col>
          </Row>
          <hr className="my-4 bg-white-50" />
          <div className="text-center text-white-50">
            <small>&copy; {new Date().getFullYear()} Shumba Wheels Driving School. All rights reserved.</small>
          </div>
        </Container>
      </footer>

      {/* Login Modal */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            <span className="text-primary">Admin</span>{' '}
            <span className="text-danger">Login</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label className="text-primary">Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
                autoFocus
                className="border-secondary"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-danger">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="border-secondary"
              />
            </Form.Group>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-100 py-2 fw-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Logging in...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .popular-plan {
          transition: transform 0.3s ease;
        }
        .popular-plan:hover {
          transform: scale(1.07);
        }
        .hero-section {
          position: relative;
          overflow: hidden;
        }
        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('/pattern.png') repeat;
          opacity: 0.05;
        }
        .text-white-50 {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        .bg-white-50 {
          background-color: rgba(255, 255, 255, 0.2);
        }
        .nav-link {
          transition: color 0.3s ease;
          cursor: pointer;
        }
        .nav-link:hover {
          color: #dc3545 !important;
        }
      `}</style>
    </>
  );
};

export default LandingPage;