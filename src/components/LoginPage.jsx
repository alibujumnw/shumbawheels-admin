import React, { useState } from "react";
import { Container, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!phoneNumber.trim() || !password.trim()) {
      setError("Please enter both phone number and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.shumbawheels.co.zw/login", // Your endpoint
        {
          phone_number: phoneNumber.trim(),
          password: password.trim()
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 10000 // 10 second timeout
        }
      );

      // Check if login was successful
      if (response.data && response.data.success) {
        // Store authentication data
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userPhone", phoneNumber);
        localStorage.setItem("authToken", response.data.token || "");
        localStorage.setItem("userData", JSON.stringify(response.data.user || {}));
        
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError(response.data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError("Invalid phone number or password");
        } else if (err.response.status === 422) {
          setError("Validation error. Please check your inputs.");
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(`Error: ${err.response.data.message || "Login failed"}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError("No response from server. Please check your internet connection.");
      } else if (err.code === 'ECONNABORTED') {
        setError("Request timeout. Please try again.");
      } else {
        // Other errors
        setError("An error occurred. Please try again.");
        console.error("Login error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center vh-100 "
      style={{ backgroundColor: "#ffffff" }}
    >
      <Card
        style={{
          width: "420px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <Card.Body className="p-4">
          {/* Logo */}
          <div className="text-center mb-3">
            <img
              src="/logo.png"
              alt="Shumba Wheels"
              style={{ height: "70px" }}
            />
          </div>

          <h4 className="text-center fw-bold mb-4">Sign In</h4>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")} className="mb-3">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Button 
              type="submit" 
              className="w-100 mb-4" 
              disabled={loading}
              style={{ height: "45px" }}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Signing In...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </Form>

          {/* Download App */}
          <div className="text-center border-top pt-3">
            <p className="text-muted mb-2">Get the mobile app</p>
            <div className="d-flex justify-content-center gap-2">
              <Button size="sm" variant="dark" disabled={loading}>
                Direct Download
              </Button>
              <Button size="sm" variant="success" disabled={loading}>
                Google Play
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;