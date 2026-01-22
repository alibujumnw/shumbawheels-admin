import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    pricing: {
      examPrice: 50,
      questionPrice: 5,
      subscriptionMonthly: 29.99
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      pricing: {
        ...settings.pricing,
        [name]: parseFloat(value) || 0
      }
    });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (settings.newPassword !== settings.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    console.log('Password change requested');
  };

  const handleChangeUserPassword = () => {
    console.log('Change user password flow');
  };

  const savePricingSettings = () => {
    console.log('Saving pricing settings:', settings.pricing);
  };

  return (
    <div className="p-4">
      <h4 className="fw-bold mb-4">Settings</h4>
      
      {/* System Settings Section */}
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h4 mb-2">System Settings</h2>
          <p className="text-muted mb-4">
            Manage application settings and user passwords
          </p>

          {/* Action Buttons */}
          <div className="d-flex gap-2 mb-4">
            <button 
              className="btn btn-secondary" 
              onClick={handleChangeUserPassword}
            >
              Change User Password
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => document.getElementById('pricing-settings')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Pricing Settings
            </button>
          </div>

          {/* Change Password Card */}
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="h5 mb-3">Change Your Password</h3>
              <form onSubmit={handleChangePassword}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="currentPassword"
                        name="currentPassword"
                        value={settings.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        name="newPassword"
                        value={settings.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={settings.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  Change Password
                </button>
              </form>
            </div>
          </div>

          {/* Pricing Settings Card */}
          <div id="pricing-settings" className="card">
            <div className="card-body">
              <h3 className="h5 mb-3">Pricing Settings</h3>
              
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="examPrice" className="form-label">
                      Exam Price ($)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        id="examPrice"
                        name="examPrice"
                        value={settings.pricing.examPrice}
                        onChange={handlePricingChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="questionPrice" className="form-label">
                      Question Price ($)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        id="questionPrice"
                        name="questionPrice"
                        value={settings.pricing.questionPrice}
                        onChange={handlePricingChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="subscriptionMonthly" className="form-label">
                      Monthly Subscription ($)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        id="subscriptionMonthly"
                        name="subscriptionMonthly"
                        value={settings.pricing.subscriptionMonthly}
                        onChange={handlePricingChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={savePricingSettings} 
                className="btn btn-primary"
              >
                Save Pricing Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;