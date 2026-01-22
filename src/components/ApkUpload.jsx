// components/ApkUpload.jsx
import React, { useState } from "react";
import { Card, Form, Button, Alert, ProgressBar, Table, Badge, Row, Col } from "react-bootstrap";

const ApkUpload = () => {
  const [apkFile, setApkFile] = useState(null);
  const [version, setVersion] = useState("");
  const [changelog, setChangelog] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedApks, setUploadedApks] = useState([
    {
      id: 1,
      filename: "app-v1.2.0.apk",
      version: "1.2.0",
      size: "25.4 MB",
      uploadDate: "2024-01-15",
      downloads: 154,
      status: "active"
    },
    {
      id: 2,
      filename: "app-v1.1.5.apk",
      version: "1.1.5",
      size: "24.8 MB",
      uploadDate: "2024-01-10",
      downloads: 89,
      status: "archived"
    }
  ]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/vnd.android.package-archive") {
      setApkFile(file);
    } else {
      alert("Please select a valid APK file");
      e.target.value = "";
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    
    if (!apkFile) {
      alert("Please select an APK file");
      return;
    }
    
    if (!version.trim()) {
      alert("Please enter version number");
      return;
    }

    // Simulate upload process
    setIsUploading(true);
    setUploadProgress(0);
    
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setIsUploading(false);
          
          // Add new APK to the list
          const newApk = {
            id: uploadedApks.length + 1,
            filename: apkFile.name,
            version: version,
            size: `${(apkFile.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadDate: new Date().toISOString().split('T')[0],
            downloads: 0,
            status: "active"
          };
          
          setUploadedApks([newApk, ...uploadedApks]);
          setApkFile(null);
          setVersion("");
          setChangelog("");
          
          alert("APK uploaded successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this APK?")) {
      setUploadedApks(uploadedApks.filter(apk => apk.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setUploadedApks(uploadedApks.map(apk => 
      apk.id === id 
        ? { ...apk, status: apk.status === "active" ? "archived" : "active" }
        : apk
    ));
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">APK Upload</h4>
        <Button 
          variant="outline-primary" 
          onClick={() => document.getElementById('upload-form').scrollIntoView({ behavior: 'smooth' })}
        >
          <i className="bi bi-cloud-upload me-2"></i>
          Upload New APK
        </Button>
      </div>

      {/* Upload Form */}
      <Card className="shadow-sm border-0 mb-4" id="upload-form">
        <Card.Body>
          <h5 className="fw-bold mb-4">Upload New APK Version</h5>
          <Form onSubmit={handleUpload}>
            <Form.Group className="mb-3">
              <Form.Label>Select APK File *</Form.Label>
              <Form.Control
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Form.Text className="text-muted">
                Only .apk files are allowed. Maximum size: 100MB
              </Form.Text>
              {apkFile && (
                <Alert variant="info" className="mt-2 py-2">
                  <i className="bi bi-file-earmark-binary me-2"></i>
                  Selected: {apkFile.name} ({(apkFile.size / (1024 * 1024)).toFixed(1)} MB)
                </Alert>
              )}
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Version Number *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 1.2.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    disabled={isUploading}
                  />
                  <Form.Text className="text-muted">
                    Use semantic versioning (e.g., 1.2.0)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>File Size</Form.Label>
                  <Form.Control
                    type="text"
                    value={apkFile ? `${(apkFile.size / (1024 * 1024)).toFixed(1)} MB` : "N/A"}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Changelog</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter changes in this version..."
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                disabled={isUploading}
              />
            </Form.Group>

            {isUploading && (
              <div className="mb-3">
                <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
                <div className="text-center mt-2">
                  <small className="text-muted">Uploading... Please wait</small>
                </div>
              </div>
            )}

            <Button 
              variant="primary" 
              type="submit" 
              disabled={isUploading}
              className="px-4"
            >
              {isUploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  Upload APK
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Uploaded APKs List */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h5 className="fw-bold mb-4">Uploaded APKs</h5>
          {uploadedApks.length === 0 ? (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              No APKs uploaded yet. Upload your first APK above.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead className="bg-light">
                <tr>
                  <th>Filename</th>
                  <th>Version</th>
                  <th>Size</th>
                  <th>Upload Date</th>
                  <th>Downloads</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadedApks.map((apk) => (
                  <tr key={apk.id}>
                    <td>
                      <i className="bi bi-android2 text-success me-2"></i>
                      {apk.filename}
                    </td>
                    <td>
                      <Badge bg="primary">{apk.version}</Badge>
                    </td>
                    <td>{apk.size}</td>
                    <td>{apk.uploadDate}</td>
                    <td>
                      <Badge bg="info">{apk.downloads}</Badge>
                    </td>
                    <td>
                      <Badge bg={apk.status === "active" ? "success" : "secondary"}>
                        {apk.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-success"
                          size="sm"
                          title="Download"
                        >
                          <i className="bi bi-download"></i>
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleToggleStatus(apk.id)}
                          title={apk.status === "active" ? "Archive" : "Activate"}
                        >
                          <i className={apk.status === "active" ? "bi bi-archive" : "bi bi-check-circle"}></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(apk.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ApkUpload;