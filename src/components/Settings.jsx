// components/Settings.jsx
import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Alert, InputGroup } from "react-bootstrap";

const Settings = () => {
  const [settings, setSettings] = useState({
    appName: "Shumba Wheels",
    supportEmail: "support@shumbawheels.co.zw",
    supportPhone: "+263 123 456 789",
    maintenanceMode: false,
    examTimeLimit: 30, // minutes
    passPercentage: 80,
    maxAttempts: 3,
    currency: "USD",
  });

  const [bookingPrices, setBookingPrices] = useState({
    oralLesson: 0,
    lessonBooking: 0,
    vehicleBooking: 0,
  });

  const [saving, setSaving] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [priceSaveSuccess, setPriceSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [priceErrors, setPriceErrors] = useState({});

  // Fetch initial booking prices on component mount
  useEffect(() => {
    fetchBookingPrices();
  }, []);

  const fetchBookingPrices = async () => {
    try {
      // Simulate API call to fetch prices
      // const response = await fetch('https://api.shumbawheels.co.zw/api/admin/booking-prices');
      // const data = await response.json();
      
      // Mock data - replace with actual API response
      const mockPrices = {
        oralLesson: 15,
        lessonBooking: 25,
        vehicleBooking: 50,
      };
      
      setBookingPrices(mockPrices);
    } catch (error) {
      console.error('Error fetching booking prices:', error);
      // Keep default values if fetch fails
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers and one decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    
    // Ensure only one decimal point and max 2 decimal places
    let finalValue = numericValue;
    if (parts.length > 2) {
      finalValue = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      finalValue = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    setBookingPrices((prev) => ({
      ...prev,
      [name]: finalValue === '' ? '' : parseFloat(finalValue) || 0,
    }));
    
    // Clear error for this field
    if (priceErrors[name]) {
      setPriceErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!settings.appName.trim()) {
      newErrors.appName = "App name is required";
    }
    
    if (!settings.supportEmail.trim()) {
      newErrors.supportEmail = "Support email is required";
    } else if (!/\S+@\S+\.\S+/.test(settings.supportEmail)) {
      newErrors.supportEmail = "Email is invalid";
    }
    
    if (!settings.supportPhone.trim()) {
      newErrors.supportPhone = "Support phone is required";
    }
    
    if (settings.examTimeLimit < 10 || settings.examTimeLimit > 120) {
      newErrors.examTimeLimit = "Time limit must be between 10 and 120 minutes";
    }
    
    if (settings.passPercentage < 50 || settings.passPercentage > 100) {
      newErrors.passPercentage = "Pass percentage must be between 50% and 100%";
    }
    
    if (settings.maxAttempts < 1 || settings.maxAttempts > 10) {
      newErrors.maxAttempts = "Max attempts must be between 1 and 10";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePriceForm = () => {
    const newErrors = {};
    
    if (bookingPrices.oralLesson < 0) {
      newErrors.oralLesson = "Oral lesson price cannot be negative";
    }
    
    if (bookingPrices.lessonBooking < 0) {
      newErrors.lessonBooking = "Lesson booking price cannot be negative";
    }
    
    if (bookingPrices.vehicleBooking < 0) {
      newErrors.vehicleBooking = "Vehicle booking price cannot be negative";
    }
    
    if (bookingPrices.oralLesson === '' || isNaN(bookingPrices.oralLesson)) {
      newErrors.oralLesson = "Oral lesson price must be a valid number";
    }
    
    if (bookingPrices.lessonBooking === '' || isNaN(bookingPrices.lessonBooking)) {
      newErrors.lessonBooking = "Lesson booking price must be a valid number";
    }
    
    if (bookingPrices.vehicleBooking === '' || isNaN(bookingPrices.vehicleBooking)) {
      newErrors.vehicleBooking = "Vehicle booking price must be a valid number";
    }
    
    setPriceErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would normally make an API call to save settings
      // await fetch('https://api.shumbawheels.co.zw/api/admin/settings', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(settings)
      // });
      
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrors({ submit: "Failed to save settings. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePriceForm()) {
      return;
    }
    
    setSavingPrices(true);
    setPriceSaveSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would normally make an API call to save booking prices
      // await fetch('https://api.shumbawheels.co.zw/api/admin/booking-prices', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(bookingPrices)
      // });
      
      setPriceSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setPriceSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving booking prices:', error);
      setPriceErrors({ submit: "Failed to save booking prices. Please try again." });
    } finally {
      setSavingPrices(false);
    }
  };

  const handleReset = () => {
    setSettings({
      appName: "Shumba Wheels",
      supportEmail: "support@shumbawheels.co.zw",
      supportPhone: "+263 123 456 789",
      maintenanceMode: false,
      examTimeLimit: 30,
      passPercentage: 80,
      maxAttempts: 3,
      currency: "USD",
    });
    setErrors({});
    setSaveSuccess(false);
  };

  const handlePriceReset = () => {
    setBookingPrices({
      oralLesson: 15,
      lessonBooking: 25,
      vehicleBooking: 50,
    });
    setPriceErrors({});
    setPriceSaveSuccess(false);
  };

  // Get currency symbol based on selected currency
  const getCurrencySymbol = () => {
    switch(settings.currency) {
      case 'USD': return '$';
      case 'ZAR': return 'R';
      case 'ZWL': return 'ZWL$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  const currencySymbol = getCurrencySymbol();

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">System Settings</h4>
          <p className="text-muted mb-0">Configure application settings and preferences</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={handleReset}
            disabled={saving}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setSaveSuccess(false)}>
          <i className="bi bi-check-circle me-2"></i>
          Settings saved successfully!
        </Alert>
      )}

      {priceSaveSuccess && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setPriceSaveSuccess(false)}>
          <i className="bi bi-check-circle me-2"></i>
          Booking prices updated successfully!
        </Alert>
      )}

      {errors.submit && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-circle me-2"></i>
          {errors.submit}
        </Alert>
      )}

      {priceErrors.submit && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-circle me-2"></i>
          {priceErrors.submit}
        </Alert>
      )}

      {/* Booking Prices Section */}
      <Card className="shadow-sm border-primary mb-4">
        <Card.Body>
          <Card.Title className="text-primary mb-4">
            <i className="bi bi-currency-dollar me-2"></i>
            Booking Prices
          </Card.Title>
          
          <Form onSubmit={handlePriceSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Oral Lesson Price</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>{currencySymbol}</InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="oralLesson"
                      value={bookingPrices.oralLesson}
                      onChange={handlePriceChange}
                      isInvalid={!!priceErrors.oralLesson}
                      placeholder="Enter price"
                    />
                  </InputGroup>
                  <Form.Control.Feedback type="invalid">
                    {priceErrors.oralLesson}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Price for oral theory lessons
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Lesson Booking Price</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>{currencySymbol}</InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="lessonBooking"
                      value={bookingPrices.lessonBooking}
                      onChange={handlePriceChange}
                      isInvalid={!!priceErrors.lessonBooking}
                      placeholder="Enter price"
                    />
                  </InputGroup>
                  <Form.Control.Feedback type="invalid">
                    {priceErrors.lessonBooking}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Price for practical driving lessons
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle Booking Price</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>{currencySymbol}</InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="vehicleBooking"
                      value={bookingPrices.vehicleBooking}
                      onChange={handlePriceChange}
                      isInvalid={!!priceErrors.vehicleBooking}
                      placeholder="Enter price"
                    />
                  </InputGroup>
                  <Form.Control.Feedback type="invalid">
                    {priceErrors.vehicleBooking}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Price for vehicle rental/exam use
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={handlePriceReset}
                disabled={savingPrices}
              >
                Reset Prices
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={savingPrices}
              >
                {savingPrices ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving Prices...
                  </>
                ) : (
                  <>
                    <i className="bi bi-currency-dollar me-2"></i>
                    Update Booking Prices
                  </>
                )}
              </Button>
            </div>
          </Form>

          <div className="mt-4 pt-3 border-top">
            <h6 className="fw-semibold mb-3">Current Price Summary</h6>
            <Row>
              <Col md={4}>
                <Card className="text-center border-0 bg-light">
                  <Card.Body>
                    <h6 className="text-muted">Oral Lesson</h6>
                    <h4 className="fw-bold text-primary">
                      {currencySymbol}{bookingPrices.oralLesson}
                    </h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center border-0 bg-light">
                  <Card.Body>
                    <h6 className="text-muted">Lesson Booking</h6>
                    <h4 className="fw-bold text-success">
                      {currencySymbol}{bookingPrices.lessonBooking}
                    </h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center border-0 bg-light">
                  <Card.Body>
                    <h6 className="text-muted">Vehicle Booking</h6>
                    <h4 className="fw-bold text-warning">
                      {currencySymbol}{bookingPrices.vehicleBooking}
                    </h4>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* General Settings */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <Card.Title className="mb-4">
                  <i className="bi bi-gear me-2"></i>
                  General Settings
                </Card.Title>
                
                <Form.Group className="mb-3">
                  <Form.Label>Application Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="appName"
                    value={settings.appName}
                    onChange={handleChange}
                    isInvalid={!!errors.appName}
                    placeholder="Enter application name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.appName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Support Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="supportEmail"
                    value={settings.supportEmail}
                    onChange={handleChange}
                    isInvalid={!!errors.supportEmail}
                    placeholder="Enter support email"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.supportEmail}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Support Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="supportPhone"
                    value={settings.supportPhone}
                    onChange={handleChange}
                    isInvalid={!!errors.supportPhone}
                    placeholder="Enter support phone number"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.supportPhone}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Currency</Form.Label>
                  <Form.Select
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                  >
                    <option value="USD">US Dollar ($)</option>
                    <option value="ZAR">South African Rand (R)</option>
                    <option value="ZWL">Zimbabwean Dollar (ZWL)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    This affects all price displays including booking prices
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="maintenanceMode"
                    name="maintenanceMode"
                    label="Maintenance Mode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    When enabled, users will see a maintenance message instead of the app
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Exam Settings */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <Card.Title className="mb-4">
                  <i className="bi bi-clipboard-check me-2"></i>
                  Exam Settings
                </Card.Title>
                
                <Form.Group className="mb-3">
                  <Form.Label>
                    Exam Time Limit (minutes)
                    <span className="text-muted ms-1">• Current: {settings.examTimeLimit} min</span>
                  </Form.Label>
                  <Form.Range
                    name="examTimeLimit"
                    min="10"
                    max="120"
                    step="5"
                    value={settings.examTimeLimit}
                    onChange={handleChange}
                    className="mb-2"
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>10 min</span>
                    <span>120 min</span>
                  </div>
                  {errors.examTimeLimit && (
                    <Form.Text className="text-danger">
                      {errors.examTimeLimit}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Pass Percentage
                    <span className="text-muted ms-1">• Current: {settings.passPercentage}%</span>
                  </Form.Label>
                  <Form.Range
                    name="passPercentage"
                    min="50"
                    max="100"
                    step="5"
                    value={settings.passPercentage}
                    onChange={handleChange}
                    className="mb-2"
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  {errors.passPercentage && (
                    <Form.Text className="text-danger">
                      {errors.passPercentage}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Maximum Exam Attempts</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxAttempts"
                    min="1"
                    max="10"
                    value={settings.maxAttempts}
                    onChange={handleChange}
                    isInvalid={!!errors.maxAttempts}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.maxAttempts}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Number of times a user can attempt the exam
                  </Form.Text>
                </Form.Group>

                <div className="mt-4 pt-3 border-top">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Quick Actions</Form.Label>
                    <div className="d-flex gap-2 mt-2">
                      <Button variant="outline-info" size="sm">
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Reset All Scores
                      </Button>
                      <Button variant="outline-warning" size="sm">
                        <i className="bi bi-archive me-1"></i>
                        Archive Old Exams
                      </Button>
                    </div>
                  </Form.Group>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Danger Zone */}
        <Card className="shadow-sm border-danger mb-4">
          <Card.Body>
            <Card.Title className="text-danger mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Danger Zone
            </Card.Title>
            
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">Delete All Data</h6>
                <p className="text-muted mb-0">
                  Permanently delete all user data, exams, and records. This action cannot be undone.
                </p>
              </div>
              <Button variant="outline-danger" size="sm">
                <i className="bi bi-trash me-1"></i>
                Delete All Data
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Save Button */}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button 
            variant="secondary" 
            onClick={handleReset}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Settings;