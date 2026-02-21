// components/ApkUpload.jsx
import React, { useState } from "react";
import { Card, Form, Button, Alert, ProgressBar, Table, Badge, Row, Col } from "react-bootstrap";

const ApkUpload = () => {
  const [apkFile, setApkFile] = useState(null);
  const [version, setVersion] = useState("");
  const [filenameInput, setFilenameInput] = useState("");
  const [status, setStatus] = useState("active");
  const [downloadsInput, setDownloadsInput] = useState(0);
  const [sizeInput, setSizeInput] = useState(0); // in MB
  const [changelog, setChangelog] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadedApks, setUploadedApks] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isApk = file.name.toLowerCase().endsWith('.apk') || file.type === 'application/vnd.android.package-archive';
    if (file && isApk) {
      setApkFile(file);
      setFilenameInput(file.name);
      const sizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));
      setSizeInput(sizeMB);
    } else {
      alert("Please select a valid APK file");
      e.target.value = "";
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();

    setUploadError("");

    if (!apkFile) {
      setUploadError('Please select an APK file');
      return;
    }

    if (!version.trim()) {
      setUploadError('Please enter version number');
      return;
    }

    if (!filenameInput.trim()) {
      setUploadError('Filename is required');
      return;
    }

    if (!['active', 'inactive'].includes(status)) {
      setUploadError('Status must be active or inactive');
      return;
    }

    if (isNaN(downloadsInput) || downloadsInput < 0) {
      setUploadError('Downloads must be 0 or greater');
      return;
    }

    if (isNaN(sizeInput) || sizeInput < 0) {
      setUploadError('Size must be 0 or greater');
      return;
    }

    const formData = new FormData();
    formData.append('version', version);
    formData.append('file_path', apkFile);
    formData.append('filename', filenameInput);
    formData.append('status', status);
    formData.append('downloads', String(parseInt(downloadsInput, 10)));
    formData.append('size', String(parseFloat(sizeInput)));

    setIsUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.shumbawheels.co.zw/api/admin/upload-apk', true);
    const token = localStorage.getItem('token') || '';
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
        } catch (err) {
        }

        const newApk = {
          id: uploadedApks.length + 1,
          filename: filenameInput,
          version: version,
          size: `${sizeInput} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          downloads: parseInt(downloadsInput, 10) || 0,
          status: status
        };

        setUploadedApks([newApk, ...uploadedApks]);
        setApkFile(null);
        setVersion("");
        setFilenameInput("");
        setDownloadsInput(0);
        setSizeInput(0);
        setChangelog("");

        alert('APK uploaded successfully!');
      } else {
        setUploadError(`Upload failed: ${xhr.statusText || xhr.status}`);
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadError('Network error during upload');
    };

    xhr.send(formData);
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
                  <Form.Label>Filename *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Filename (e.g., app-v1.2.0.apk)"
                    value={filenameInput}
                    onChange={(e) => setFilenameInput(e.target.value)}
                    disabled={isUploading}
                  />
                </Form.Group>
                <Form.Group className="mt-2">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select value={status} onChange={(e) => setStatus(e.target.value)} disabled={isUploading}>
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Downloads *</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={downloadsInput}
                    onChange={(e) => setDownloadsInput(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    disabled={isUploading}
                  />
                  <Form.Text className="text-muted">Number of times this APK has been downloaded</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Size (MB) *</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    step="0.01"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    disabled={isUploading}
                  />
                  <Form.Text className="text-muted">Numeric size in megabytes (e.g., 25.4)</Form.Text>
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

            {uploadError && (
              <Alert variant="danger" className="mb-3">
                {uploadError}
              </Alert>
            )}

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