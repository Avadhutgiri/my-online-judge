import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import Modal from './Modal';  

export default function Submissions() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/submissions');
      setSubmissions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch submissions');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: 'Team',
      selector: (row) => row.Team?.team_name || 'Unknown',
      sortable: true,
      cell: (row) => <div style={{ color: 'white' }}>{row.Team?.team_name || 'Unknown'}</div>,
    },
    {
      name: 'Problem',
      selector: (row) => row.Problem?.title || 'Unknown',
      sortable: true,
      cell: (row) => <div style={{ color: 'white' }}>{row.problemTitle}</div>,
    },
    {
      name: 'Language',
      selector: () => 'N/A',
      sortable: false,
      cell: () => <div style={{ color: 'white' }}>N/A</div>,
    },
    {
      name: 'Status',
      selector: (row) => row.result,
      sortable: true,
      cell: (row) => (
        <div className={`w-6 h-6 ${getStatusColor(row.result)} text-white text-[100] flex items-center justify-center rounded`}>
          {row.result}
        </div>
      ),
    },
    {
      name: 'Time',
      selector: (row) => row.execution_time,
      sortable: true,
      cell: (row) => <div style={{ color: 'white' }}>{row.execution_time ? `${row.execution_time} ms` : 'N/A'}</div>,
    },
    {
      name: 'Memory',
      selector: (row) => row.memory_usage,
      sortable: true,
      cell: (row) => <div style={{ color: 'white' }}>{row.memory_usage ? `${row.memory_usage} KB` : 'N/A'}</div>,
    },
    {
      name: 'Submitted At',
      selector: (row) => row.submitted_at,
      sortable: true,
      cell: (row) => <div style={{ color: 'white' }}>{row.submitted_at ? new Date(row.submitted_at).toLocaleString() : 'N/A'}</div>,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            setSelectedRow({ ...row, decodedCode: row.code ? atob(row.code) : '' });
            setShowModal(true);
          }}
        >
          View
        </button>
      ),
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'ac':
        return 'bg-green-500';
      case 'wrong answer':
      case 'wa':
        return 'bg-red-500';
      case 'time limit exceeded':
      case 'tle':
        return 'bg-yellow-500';
      case 'memory limit exceeded':
      case 'mle':
        return 'bg-orange-500';
      case 'runtime error':
      case 're':
        return 'bg-purple-500';
      case 'compilation error':
      case 'ce':
        return 'bg-pink-500';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  const customStyles = {
    rows: {
      style: {
        backgroundColor: '#032e66', 
      },
    },
    headRow: {
      style: {
        backgroundColor: '#201658',
        color: 'white',
        fontSize: '1.1em',
      },
    },
    pagination: {
      style: {
        backgroundColor: '#201658',
        color: 'white',
      },
      pageButtonsStyle: {
        backgroundColor: '#201658',
        color: 'white',
        fill: 'white',
        ':hover': {
          backgroundColor: '#ffffff',
          color: '#201658',
          fill: '#201658',
        },
        ':focus': {
          outline: 'none',
          backgroundColor: '#ffffff',
          color: '#201658',
          fill: '#201658',
        },
      },
    }
  };

  if (loading) {
    return <div className="text-white text-center">Loading submissions...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <React.Fragment>
      <div className="max-w-full mx-auto rounded-lg border-2 border-[#86C232]">
        <DataTable
          columns={columns}
          data={submissions}
          pagination
          selectableRowsHighlight
          highlightOnHover={false}
          customStyles={customStyles}
          className="data-table"
        />
      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} selectedRow={selectedRow} />}
    </React.Fragment>
  );
}
