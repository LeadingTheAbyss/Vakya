import { useState } from 'react';
import { UploadCloud, FileType, FileText } from 'lucide-react';
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
    // Simulate upload -> navigate to repository or analysis view
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      navigate('/app/repository');
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-header">
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
        
        <button className="btn btn-primary" onClick={() => navigate('/app/repository')}>
          Browse Files
        </button>
      </div>

      <div className="upload-features">
        <div className="uf-card">
          <FileText size={20} className="uf-icon" />
          <div className="uf-text">
            <h4>Smart OCR Included</h4>
            <span>Automatically extracts text from poor quality scans.</span>
          </div>
        </div>
        <div className="uf-card">
          <FileType size={20} className="uf-icon" />
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
