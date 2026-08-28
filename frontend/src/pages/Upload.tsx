import { useState } from 'react';
import { UploadCloud, FileType, FileText, Sparkles, ShieldCheck, Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      navigate('/app/analysis/new', { state: { file: e.dataTransfer.files[0] } });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      navigate('/app/analysis/new', { state: { file: e.target.files[0] } });
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-header">
        <span className="upload-eyebrow">
          <Sparkles size={12} /> Multi-Agent Legal Analysis
        </span>
        <h1>Start Your Analysis</h1>
        <p>Upload a contract to let the Sentinel agents detect hidden risks.</p>
      </div>

      <div
        className={`upload-dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-glow" />
        <div className="upload-icon-wrap">
          <UploadCloud size={32} />
        </div>
        <h3>Drag & Drop your contract here</h3>
        <p>Supports PDF, DOCX, and Scanned Images (up to 50MB)</p>

        <div className="upload-divider">
          <span>OR</span>
        </div>

        <label className="btn btn-primary upload-browse-btn" style={{ cursor: 'pointer' }}>
          Browse Files
          <input
            type="file"
            hidden
            accept=".pdf,.doc,.docx,image/*"
            onChange={handleFileChange}
          />
        </label>

        <div className="upload-trust-row">
          <span className="upload-trust-item"><Lock size={13} /> End-to-end encrypted</span>
          <span className="upload-trust-item"><ShieldCheck size={13} /> Local inference</span>
          <span className="upload-trust-item"><Zap size={13} /> Results in seconds</span>
        </div>
      </div>

      <div className="upload-features">
        <div className="uf-card">
          <div className="uf-icon-wrap">
            <FileText size={18} className="uf-icon" />
          </div>
          <div className="uf-text">
            <h4>Smart OCR Included</h4>
            <span>Automatically extracts text from poor quality scans.</span>
          </div>
        </div>
        <div className="uf-card">
          <div className="uf-icon-wrap">
            <FileType size={18} className="uf-icon" />
          </div>
          <div className="uf-text">
            <h4>Bilingual Support</h4>
            <span>Process contracts in both English and Hindi seamlessly.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
