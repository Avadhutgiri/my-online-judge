import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'; // Import js-cookie
import image from "../Pages/pageassets/image.png";

// Custom Result Card component with improved styling
const ResultCard = ({ fieldName, fieldValue }) => {
  return (
    <div className="bg-black rounded-lg p-6 shadow-lg border-l-4 border-green-500 hover:shadow-green-900/30 hover:translate-y-1 transition-all duration-300 w-full">
      <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wide mb-1">{fieldName}</h3>
      <div className="text-3xl font-bold text-white">{fieldValue}</div>
    </div>
  );
};

const ResultPage = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve event_name and category from cookies
  // console.log('Cookies:', Cookies.get());
  // const eventName = Cookies.get('event_name');
  // const category = Cookies.get('category');

  // Log event_name and category to the console
  // useEffect(() => {
  //   // console.log('Event Name:', eventName);
  //   // console.log('Category:', category);
  // }, [eventName, category]);

  // Theme colors
  const THEME = {
    primary: '#86C232',
    primaryDark: '#689427',
    primaryLight: '#A2D158',
    dark: '#222629',
    darkGrey: '#474B4F',
    mediumGrey: '#6B6E70',
    lightGrey: '#B2B5B7'
  };

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
          <div className="w-16 h-16 border-4 border-black border-t-green-500 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-l-green-300 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
        <p className="mt-6 text-green-500 font-mono tracking-widest text-sm">LOADING RESULTS</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
        <div className="bg-black p-8 rounded-lg shadow-lg border-l-4 border-red-500 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-900 p-3 rounded-full">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
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
      {/* Hexagon-inspired header with gradient background */}
      <div className="relative mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-900"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500 rotate-45 transform-gpu"></div>
          <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-green-500 rotate-12 transform-gpu"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-green-700 -rotate-12 transform-gpu"></div>
        </div>
        
        <div className="relative pt-16 pb-12 text-center px-4">
          <div className="inline-block mb-4 px-3 py-1 bg-black bg-opacity-50 rounded-full">
            <span className="text-sm text-green-400 font-mono tracking-widest">COMPETITION RESULTS</span>
          </div>
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
            {eventName} RESULTS
          </h1>
          <div className="h-1 w-24 bg-green-500 mx-auto my-4"></div>
          <p className="text-gray-400 font-medium">
            {category}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Team info card */}
        <div className="bg-black rounded-xl shadow-xl overflow-hidden mb-10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row">
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
                {result.is_junior ? "Junior Division" : "Senior Division"}
              </div>
            </div>
            
            <div className="flex-1 p-8 flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-gray-300 mb-6">Performance Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rank</span>
                  <span className="text-2xl font-bold text-white">{result.rank}</span>
                </div>
                <div className="h-1 w-full bg-gray-700">
                  <div className="h-full bg-green-500" style={{ width: `${100 - Math.min(result.rank/10 * 100, 100)}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <span className="text-gray-400">Score</span>
                  <span className="text-2xl font-bold text-white">{result.total_score}</span>
                </div>
                <div className="h-1 w-full bg-gray-700">
                  <div className="h-full bg-green-500" style={{ width: `${Math.min(result.total_score, 100)}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <span className="text-gray-400">Accuracy</span>
                  <span className="text-2xl font-bold text-white">{result.accuracy}%</span>
                </div>
                <div className="h-1 w-full bg-gray-700">
                  <div className="h-full bg-green-500" style={{ width: `${result.accuracy}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailed stats grid */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-xl font-bold text-gray-300 mb-6">Detailed Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {resultData.map(item => (
              <ResultCard key={item.id} fieldName={item.fieldName} fieldValue={item.fieldValue} />
            ))}
          </div>
          
          {/* Submission breakdown */}
          <div className="mt-10 bg-black rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Submission Breakdown</h3>
            <div className="flex flex-col md:flex-row gap-6">
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
    </div>
  );
};

export default ResultPage;