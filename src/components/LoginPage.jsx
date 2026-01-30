import React, { useState } from "react";
import { Container, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
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
        
        // Store authentication data - ALWAYS store
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userPhone", phoneNumber.trim());
        localStorage.setItem("authToken", responseData.token || responseData.access_token || "");
        localStorage.setItem("userData", JSON.stringify(responseData.user || responseData.data || {}));
         
        // Force a small delay to ensure localStorage is set
        setTimeout(() => {
          console.log("🔄 Redirecting to /dashboard");
          navigate("/dashboard", { replace: true });
        }, 100);
        
      } else {
        console.warn("⚠️ API returned non-success response:", responseData);
        setError(responseData.message || responseData.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("🔥 Error during login:", err);
      
      // Handle different types of errors
      if (err.response) {
        console.error("📡 Server Response Error:");
        console.error("- Status:", err.response.status);
        console.error("- Data:", err.response.data);
        console.error("- Headers:", err.response.headers);
        
        if (err.response.status === 401) {
          setError("Invalid phone number or password");
        } else if (err.response.status === 422) {
          // Show validation errors if available
          const errors = err.response.data.errors;
          if (errors) {
            const errorMsg = Object.values(errors).flat().join(', ');
            setError(`Validation errors: ${errorMsg}`);
          } else {
            setError("Validation error. Please check your inputs.");
          }
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(`Error ${err.response.status}: ${err.response.data.message || "Login failed"}`);
        }
      } else if (err.request) {
        console.error("📡 No response received:", err.request);
        setError("No response from server. Please check your internet connection.");
      } else if (err.code === 'ECONNABORTED') {
        setError("Request timeout. Please try again.");
      } else {
        console.error("❌ Other error:", err.message);
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle APK download
  const handleDownloadApp = async () => {
    setDownloading(true);
    
    try {
      // Create a temporary link element to trigger download
      const downloadUrl = "https://api.shumbawheels.co.zw/api/download-app";
      
      // Method 1: Direct window.open (simplest)
      window.open(downloadUrl, "_blank");
      
      // Method 2: Using fetch and creating blob (more control)
      // const response = await fetch(downloadUrl);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = 'shumba-wheels.apk'; // Default filename
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      // window.URL.revokeObjectURL(url);
      
      console.log("📱 APK download initiated");
    } catch (err) {
      console.error("❌ Error downloading APK:", err);
      setError("Failed to download app. Please try again later.");
    } finally {
      setDownloading(false);
    }
  };

  // Google Play Store link (update with your actual Play Store URL)
  const googlePlayUrl = "https://play.google.com/store/apps/details?id=com.shumbawheels.app";

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center vh-100"
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
              <strong>Error:</strong> {error}
            </Alert>
          )}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter Phone Number (e.g., +263771234567)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
              <Form.Text className="text-muted">
                Use your registered phone number
              </Form.Text>
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
              variant="primary"
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
              <Button 
                size="sm" 
                variant="dark" 
                onClick={handleDownloadApp}
                disabled={loading || downloading}
              >
                {downloading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-1"
                    />
                    Downloading...
                  </>
                ) : (
                  "Direct Download"
                )}
              </Button>
              <Button 
                size="sm" 
                variant="success" 
                href={googlePlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                disabled={loading}
              >
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