import React, { useState, useEffect } from 'react';
import './Form.css';
import { ProgressBar } from 'react-bootstrap'; // Ensure react-bootstrap is installed

const Form = () => {
  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [webinarName, setWebinarName] = useState('');
  const [date, setDate] = useState('');
  const [organizedBy, setOrganizedBy] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0); // New state to track generated count

  useEffect(() => {
    const interval = setInterval(() => {
      fetchProgress();
    }, 3000); // Fetch progress every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('http://localhost:3000/fetch-progress');
      const result = await response.json();
      if (result.progress !== undefined) {
        setProgress(result.progress);
        setGeneratedCount(result.generatedCount); // Set the generated count from the backend
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatusMessage('Generating and sending certificates, please wait...');

    try {
      const response = await fetch('http://localhost:3000/generate-certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetId,
          sheetName,
          webinarName,
          date,
          organizedBy,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setStatusMessage('Certificates generation started successfully!');
        // Progress will be updated automatically
      } else {
        setStatusMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      setStatusMessage('An error occurred while generating certificates.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">LUNEBLAZE CERTIFICATES GENERATOR</h2>
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Google Sheets ID</label>
          <input
            type="text"
            className="form-control"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Sheet Name</label>
          <input
            type="text"
            className="form-control"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Webinar Name</label>
          <input
            type="text"
            className="form-control"
            value={webinarName}
            onChange={(e) => setWebinarName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Organized By</label>
          <input
            type="text"
            className="form-control"
            value={organizedBy}
            onChange={(e) => setOrganizedBy(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Generating and Sending Certificates...' : 'Generate and Send Certificates'}
        </button>
      </form>
      {statusMessage && (
        <div className="alert alert-info mt-4" role="alert">
          {statusMessage}
        </div>
      )}
      <div className="mt-4">
        <h4>Progress Bar </h4>
        <ProgressBar
          now={progress}
          label={`${progress}%`}
        />
        <div 
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            padding: '10px',
            border: '2px solid #007bff', // Bootstrap primary color
            borderRadius: '5px',
            display: 'inline-block',
            backgroundColor: '#f8f9fa',
            marginTop: '20px'
          }}
        >
          Certificates generated and Sent: {generatedCount}
        </div>
      </div>
    </div>
  );
};

export default Form;
