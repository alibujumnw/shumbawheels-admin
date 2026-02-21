// components/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Container, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
        // Get token from response
        const token = responseData.token || responseData.access_token || "";
        const userData = responseData.user || responseData.data || {};
        
        // Store authentication data
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userPhone", phoneNumber.trim());
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        
        // Update auth context
        login(userData, phoneNumber.trim(), token);
        
        // Navigate to dashboard
        navigate("/dashboard", { replace: true });
        
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

  // Function to fetch download info from API
  const fetchDownloadInfo = async () => {
    try {
      const response = await axios.get(
        "https://api.shumbawheels.co.zw/api/download-app",
        {
          timeout: 10000,
          headers: {
            "Accept": "application/json"
          }
        }
      );

      if (response.data.download_url) {
        setDownloadInfo({
          download_url: response.data.download_url,
          version: response.data.version || "Unknown",
          file_size: response.data.file_size || 0,
          created_at: response.data.created_at
        });
        return response.data;
      } else {
        throw new Error("No download URL received from server");
      }
    } catch (err) {
      console.error("❌ Error fetching download info:", err);
      throw err;
    }
  };

  // Function to handle APK download
  const handleDownloadApp = async () => {
    setDownloading(true);
    setError("");
    
    try {
      // Step 1: Get the download info from the API
      const downloadData = await fetchDownloadInfo();
      
      if (downloadData.download_url) {
        console.log("📱 Got download URL:", downloadData.download_url);
        console.log("📦 Version:", downloadData.version);
        console.log("💾 File size:", downloadData.file_size);
        
        // Step 2: Create a hidden link and trigger download
        const link = document.createElement('a');
        link.href = downloadData.download_url;
        link.download = `shumba-wheels-v${downloadData.version || '1.0'}.apk`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Optional: Show success toast/message
        // You could add a toast notification here
        console.log("✅ Download initiated successfully");
        
        // Update download info state
        setDownloadInfo({
          download_url: downloadData.download_url,
          version: downloadData.version,
          file_size: downloadData.file_size,
          created_at: downloadData.created_at
        });
      }
    } catch (err) {
      console.error("❌ Error downloading APK:", err);
      
      // Handle different types of errors
      if (err.response) {
        if (err.response.status === 404) {
          setError("App file not found on server. Please contact support.");
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(`Failed to download: ${err.response.data.message || "Server error"}`);
        }
      } else if (err.request) {
        setError("No response from server. Please check your internet connection.");
      } else if (err.message.includes("No download URL")) {
        setError("Download link is currently unavailable. Please try again later.");
      } else {
        setError("Failed to download app. Please try again.");
      }
    } finally {
      setDownloading(false);
    }
  };

  // Function to pre-fetch download info when component mounts or button is hovered
  const preFetchDownloadInfo = async () => {
    // Only fetch if we haven't already fetched
    if (!downloadInfo) {
      try {
        await fetchDownloadInfo();
      } catch (err) {
        // Silently fail - we'll handle errors when user actually clicks download
        console.log("⚠️ Pre-fetch failed, will retry on click");
      }
    }
  };

  // Google Play Store link (update with your actual Play Store URL)
  const googlePlayUrl = "https://play.google.com/store/apps/details?id=com.shumbawheels.app";

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

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
            
            {/* Download Info Display */}
            {downloadInfo && (
              <div className="mb-2 p-2 bg-light rounded">
                <small className="text-muted d-block">
                  Version: {downloadInfo.version}
                </small>
                <small className="text-muted d-block">
                  Size: {formatFileSize(downloadInfo.file_size)}
                </small>
                {downloadInfo.created_at && (
                  <small className="text-muted d-block">
                    Updated: {new Date(downloadInfo.created_at).toLocaleDateString()}
                  </small>
                )}
              </div>
            )}
            
            <div className="d-flex justify-content-center gap-2">
              <Button 
                size="sm" 
                variant="dark" 
                onClick={handleDownloadApp}
                disabled={loading || downloading}
                onMouseEnter={preFetchDownloadInfo} // Pre-fetch on hover
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
                    Preparing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-download me-1"></i>
                    Direct Download
                  </>
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
                <i className="bi bi-google-play me-1"></i>
                Google Play
              </Button>
            </div>
            
            <small className="text-muted mt-2 d-block">
              <i className="bi bi-info-circle me-1"></i>
              Direct download works on Android devices
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;