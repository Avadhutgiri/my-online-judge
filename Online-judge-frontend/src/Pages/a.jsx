import React, { useState, useEffect } from 'react';
import axios from 'axios';
import image from "../Pages/pageassets/image.png";

// Custom Result Card component with improved styling
const ResultCard = ({ fieldName, fieldValue }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-green-500 hover:shadow-green-900/30 hover:translate-y-1 transition-all duration-300 w-full">
      <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wide mb-1">{fieldName}</h3>
      <div className="text-3xl font-bold text-white">{fieldValue}</div>
    </div>
  );
};

const ResultPage = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/result`, {
          withCredentials: true,
        });

        setResult(response.data.team);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Error fetching result");
        setLoading(false);
      }
    };

    fetchResult();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-800 border-t-green-500 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-l-green-300 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
        <p className="mt-6 text-green-500 font-mono tracking-widest text-sm">LOADING RESULTS</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg border-l-4 border-red-500 max-w-md w-full">
          <h2 className="text-xl font-bold text-white text-center mb-2">Connection Error</h2>
          <p className="text-center text-gray-400">{error}</p>
          <button 
            className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Extract event_name and category dynamically from API response
  const eventName = result?.event_name || "Unknown Event";
  const category = result?.is_junior ? "Junior Division" : "Senior Division";

  const resultData = [
    { id: 1, fieldName: "Rank", fieldValue: result.rank },
    { id: 2, fieldName: "Score", fieldValue: result.total_score },
    { id: 3, fieldName: "Submissions", fieldValue: `${result.correct_submission}/${result.correct_submission + result.wrong_submission}` },
    { id: 4, fieldName: "Accuracy", fieldValue: `${result.accuracy}%` }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-400 mb-2">{eventName} Results</h1>
        <p className="text-lg text-gray-400">{category}</p>
        <div className="h-1 w-24 bg-green-500 mx-auto mt-4"></div>
      </div>

      {/* Team Info Card */}
      <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-12 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Team Logo and Name */}
          <div className="flex-1 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-700">
            <div className="h-32 w-32 rounded-full bg-gray-700 p-2 mb-6 flex items-center justify-center">
              <img 
                className="h-full w-full object-contain rounded-full" 
                src={image} 
                alt={result.team_name} 
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">{result.team_name}</h2>
            <div className="bg-green-600 py-2 px-6 rounded-full text-white font-medium">
              {category}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-gray-300 mb-6">Performance Summary</h3>
            <div className="space-y-4">
              {resultData.map(item => (
                <ResultCard key={item.id} fieldName={item.fieldName} fieldValue={item.fieldValue} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-xl font-bold text-gray-300 mb-6">Detailed Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resultData.map(item => (
            <ResultCard key={item.id} fieldName={item.fieldName} fieldValue={item.fieldValue} />
          ))}
        </div>
      </div>

      {/* Submission Breakdown */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-xl font-bold text-gray-300 mb-6">Submission Breakdown</h2>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Correct Submissions */}
            <div className="flex-1">
              <div className="flex items-end gap-4 mb-2">
                <div className="text-4xl font-bold text-green-500">{result.correct_submission}</div>
                <div className="text-gray-400 pb-1">Correct</div>
              </div>
              <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ 
                  width: `${result.correct_submission / (result.correct_submission + result.wrong_submission) * 100}%` 
                }}></div>
              </div>
            </div>

            {/* Incorrect Submissions */}
            <div className="flex-1">
              <div className="flex items-end gap-4 mb-2">
                <div className="text-4xl font-bold text-red-500">{result.wrong_submission}</div>
                <div className="text-gray-400 pb-1">Incorrect</div>
              </div>
              <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ 
                  width: `${result.wrong_submission / (result.correct_submission + result.wrong_submission) * 100}%` 
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;