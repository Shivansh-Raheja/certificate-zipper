import React, { useState, useEffect, useCallback } from 'react';
import { ProgressBar } from 'react-bootstrap';

const Form = () => {
  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [date, setDate] = useState('');
  const [todate, setDateto] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(''); // New state for selected school
  const [uniqueSchools, setUniqueSchools] = useState([]); // State for unique schools
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [isComplete, setIsComplete] = useState(false); // New state for completion

  const fetchUniqueSchools = useCallback(async () => {
    try {
      const response = await fetch('https://certificate-downloader.onrender.com/unique-schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetId, sheetName })
      });

      const result = await response.json();
      if (response.ok) {
        setUniqueSchools(result.schools);
      } else {
        setStatusMessage('Working on the school filter!!!!');
      }
    } catch (error) {
      console.error('Working on the school filter!!!!', error);
      setStatusMessage('Working on the school filter!!!!');
    }
  }, [sheetId, sheetName]);

  useEffect(() => {
    if (sheetId && sheetName) {
      fetchUniqueSchools();
    }
  }, [sheetId, sheetName, fetchUniqueSchools]);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch('https://certificate-downloader.onrender.com/fetch-progress');
      const result = await response.json();
      console.log('Fetched Progress:', result.progress, 'Generated Count:', result.generatedCount);

      if (result.progress !== undefined) {
        if (result.progress === 100 && !isComplete) {
          setProgress(result.progress);
          setGeneratedCount(result.generatedCount);
          setIsComplete(true);
          setLoading(false);
          setStatusMessage('Certificates generation completed! You can now download the file.');
          console.log('Generation complete, loading set to false.');
        } else if (result.progress < 100) {
          setProgress(result.progress);
          setGeneratedCount(result.generatedCount);
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setLoading(false); // Ensure loading is reset on error
    }
  }, [isComplete]);

  useEffect(() => {
    if (!isComplete) {
      fetchProgress(); // Fetch progress if not complete
      const id = setInterval(fetchProgress, 3000); // Set polling interval
      setIntervalId(id);

      return () => clearInterval(id); // Clean up interval on unmount
    }
  }, [fetchProgress, isComplete]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset progress and generated count
    setProgress(0);
    setGeneratedCount(0);
    setLoading(true);
    setIsComplete(false); // Reset completion flag
    setStatusMessage('Generating certificates, please wait...');

    try {
      const response = await fetch('https://certificate-downloader.onrender.com/generate-certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetId,
          sheetName,
          date,
          todate,
          school: selectedSchool // Include selected school
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setStatusMessage('Certificates generation started successfully! Please wait until the process is complete.');
      } else {
        setStatusMessage(`Error: ${result.message}`);
        setLoading(false); // Make sure to reset loading on error
      }
    } catch (error) {
      setStatusMessage('An error occurred while generating certificates.');
      setLoading(false); // Make sure to reset loading on error
    }
  };

  const handleDownloadZip = async () => {
    try {
      const response = await fetch('https://certificate-downloader.onrender.com/download-file', {
        method: 'GET',
      });
  
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
  
        if (selectedSchool) {
          link.download = 'certificates.zip';
        } else {
          link.download = 'certificates.pdf';
        }
  
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
  
        setStatusMessage(selectedSchool ? 'Certificates ZIP downloaded successfully.' : 'Certificates PDF downloaded successfully.');
      } else {
        setStatusMessage('Error downloading the file.');
      }
    } catch (error) {
      setStatusMessage('Error downloading the file.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">GENIUSHUB CERTIFICATES DOWNLOADER</h2>
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
          <label>Start Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Completion Date</label>
          <input
            type="date"
            className="form-control"
            value={todate}
            onChange={(e) => setDateto(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Filter by School</label>
          <select
            className="form-control"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="">All Schools</option>
            {uniqueSchools.map((school, index) => (
              <option key={index} value={school}>{school}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Generating Certificates...' : 'Generate Certificates'}
        </button>
      </form>
      {statusMessage && (
        <div className="alert alert-info mt-4" role="alert">
          {statusMessage}
        </div>
      )}
      <div className="mt-4">
        <h4 style={{ fontWeight: 'bold' }}>Progress Bar</h4>
        <ProgressBar
          now={progress}
          label={`${progress}%`}
          style={{ height: '25px', backgroundColor: '#e9ecef', borderRadius: '5px' }}
        />
        <div
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            padding: '10px',
            border: '2px solid #007bff',
            borderRadius: '5px',
            display: 'inline-block',
            backgroundColor: '#f8f9fa',
            marginTop: '20px'
          }}
        >
          Certificates generated: {generatedCount}
        </div>
        <button
          className="btn btn-success btn-block mt-4"
          onClick={handleDownloadZip}
          disabled={loading || progress < 100} 
        >
          Download All Certificates
        </button>
      </div>
    </div>
  );
};

export default Form;
