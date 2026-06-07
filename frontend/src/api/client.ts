export const API_BASE_URL = '/api';

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload document');
  }
  
  return response.json();
};

export const analyzeDocument = async (clauses: any[]) => {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clauses }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze document');
  }
  
  return response.json();
};

export const generateReport = async (analyzed_clauses: any[], executive_summary: any = {}) => {
  const response = await fetch(`${API_BASE_URL}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ analyzed_clauses, executive_summary }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate report');
  }
  
  return response.json();
};
