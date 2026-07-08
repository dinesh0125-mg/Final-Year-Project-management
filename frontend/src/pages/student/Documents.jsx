import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { documentAPI, projectAPI } from '../../api/api';
import './StudentDashboard.css';
import { FiFile, FiDownload, FiUploadCloud, FiX, FiTrash2 } from 'react-icons/fi';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  
  const [uploadData, setUploadData] = useState({
    title: '',
    document_type: 'PROPOSAL',
    version: '1.0',
    remarks: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      const projRes = await projectAPI.list();
      const projs = Array.isArray(projRes.data?.data) ? projRes.data.data : (projRes.data?.data?.results || []);
      if (projs.length > 0) setProject(projs[0]);

      const docRes = await documentAPI.list();
      const docs = Array.isArray(docRes.data?.data) ? docRes.data.data : (docRes.data?.data?.results || []);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!project) {
      setError("You don't have an active project to upload documents for.");
      return;
    }
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('project', project.id);
    formData.append('title', uploadData.title);
    formData.append('document_type', uploadData.document_type);
    formData.append('version', uploadData.version);
    formData.append('remarks', uploadData.remarks);
    formData.append('file', selectedFile);

    try {
      await documentAPI.upload(formData);
      setShowUpload(false);
      setSelectedFile(null);
      setUploadData({ title: '', document_type: 'PROPOSAL', version: '1.0', remarks: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await documentAPI.delete(id);
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete document');
      }
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading documents...</p></div>;

  return (
    <div className="dashboard-page">
      <Helmet><title>Documents - ProjectHub</title></Helmet>
      
      <div className="dashboard-header-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Documents</h1>
          <p>Manage and upload your project files.</p>
        </div>
        <Button variant="primary" onClick={() => setShowUpload(!showUpload)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {showUpload ? <FiX /> : <FiUploadCloud />} {showUpload ? 'Cancel' : 'Upload File'}
          </span>
        </Button>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showUpload && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Upload Document</h3>
            <form onSubmit={handleUpload} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <Input label="Document Title" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} required />
              <div className="input-group">
                <label className="input-label">Document Type</label>
                <select className="input-field" value={uploadData.document_type} onChange={e => setUploadData({...uploadData, document_type: e.target.value})} required>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="SRS">SRS</option>
                  <option value="DESIGN">Design Document</option>
                  <option value="PROGRESS">Progress Report</option>
                  <option value="PRESENTATION">Presentation</option>
                  <option value="CODE">Source Code</option>
                  <option value="FINAL">Final Report</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <Input label="Version" value={uploadData.version} onChange={e => setUploadData({...uploadData, version: e.target.value})} required />
              <Input label="Remarks (Optional)" value={uploadData.remarks} onChange={e => setUploadData({...uploadData, remarks: e.target.value})} />
              
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Select File</label>
                <input type="file" className="input-field" onChange={handleFileChange} required />
              </div>
              
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <Button type="submit" variant="primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <Card>
          <div style={{ padding: '1rem', overflowX: 'auto' }}>
            {documents.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No documents uploaded yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem' }}>File Name</th>
                    <th style={{ padding: '1rem' }}>Type</th>
                    <th style={{ padding: '1rem' }}>Version</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, idx) => (
                    <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.1 }} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                        <FiFile style={{ color: 'var(--primary)' }} /> {doc.title}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{doc.document_type}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>v{doc.version}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`milestone-badge ${doc.status?.toLowerCase().replace('_', '-')}`}>{doc.status}</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <a href={doc.file} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm"><FiDownload /></Button>
                          </a>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)} style={{color: 'var(--danger)'}}>
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Documents;
