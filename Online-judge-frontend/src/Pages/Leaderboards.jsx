import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  // State for event and category selection
  const [eventName, setEventName] = useState("ReverseCoding");
  const [isJunior, setIsJunior] = useState(true);
  
  // State for leaderboard data
  const [data, setData] = useState([]);
  const [problems, setProblems] = useState([]);
  const [problemColumns, setProblemColumns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const rowsPerPage = 5;

  // Custom colors as CSS variables to replace arbitrary values
  const customStyles = {
    "--accent-green": "#86C232",
    "--accent-green-dark": "#689427",
    "--accent-green-light": "#A2D158"
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/leaderboard`, {
          params: { event_name: eventName, is_junior: isJunior },
          withCredentials: true,
        });

        setData(response.data.users);
        setProblems(response.data.problems);
        setProblemColumns(response.data.problem_columns);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Error fetching leaderboard");
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [eventName, isJunior]);

  const displayedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Format time to be more readable
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="w-11/12 max-w-6xl mx-auto text-gray-200 mt-8 mb-16" style={customStyles}>
      {/* Hexagon-inspired header */}
      <div className="relative flex items-center justify-center py-16 mb-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-lime-700 opacity-20 rotate-45"></div>
        <div className="relative z-10 text-center">
          <div className="uppercase tracking-widest text-sm text-lime-400 mb-2 font-mono">Competition Standings</div>
          <h1 className="text-5xl font-bold text-white mb-1">LEADERBOARD</h1>
          <div className="h-1 w-24 bg-lime-500 mx-auto mb-3"></div>
          <p className="text-gray-400">{eventName === "ReverseCoding" ? "Reverse Coding" : "Clash"} • {isJunior ? "Junior Division" : "Senior Division"}</p>
        </div>
      </div>

      {/* Control panel - Angled design */}
      <div className="relative mb-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gray-900 transform skew-y-3"></div>
        <div className="relative z-10 py-10 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Event selector */}
            <div className="w-full md:w-auto">
              <div className="mb-2 text-xs text-lime-400 uppercase tracking-wider">Select Event</div>
              <div className="flex">
                <button 
                  onClick={() => setEventName("ReverseCoding")}
                  className={`py-3 px-4 font-medium ${
                    eventName === "ReverseCoding" 
                      ? "bg-lime-800 text-white" 
                      : "bg-black text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  Reverse Coding
                </button>
                <button 
                  onClick={() => setEventName("Clash")}
                  className={`py-3 px-4 font-medium ${
                    eventName === "Clash" 
                      ? "bg-lime-800 text-white" 
                      : "bg-black text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  Clash
                </button>
              </div>
            </div>
            
            {/* Division selector */}
            <div className="w-full md:w-auto">
              <div className="mb-2 text-xs text-lime-400 uppercase tracking-wider">Select Division</div>
              <div className="flex">
                <button 
                  onClick={() => setIsJunior(true)}
                  className={`py-3 px-4 font-medium ${
                    isJunior 
                      ? "bg-lime-800 text-white" 
                      : "bg-black text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  Junior
                </button>
                <button 
                  onClick={() => setIsJunior(false)}
                  className={`py-3 px-4 font-medium ${
                    !isJunior 
                      ? "bg-lime-800 text-white" 
                      : "bg-black text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  Senior
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagonal-bordered table container */}
      <div className="relative bg-black p-1">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-0 w-2 h-2 bg-lime-500"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-lime-500"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-lime-500"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-lime-500"></div>
          
          <div className="absolute top-0 left-2 w-1/3 h-0.5 bg-lime-500"></div>
          <div className="absolute top-0 right-2 w-1/3 h-0.5 bg-lime-500"></div>
          <div className="absolute bottom-0 left-2 w-1/3 h-0.5 bg-lime-500"></div>
          <div className="absolute bottom-0 right-2 w-1/3 h-0.5 bg-lime-500"></div>
          
          <div className="absolute top-2 left-0 w-0.5 h-1/3 bg-lime-500"></div>
          <div className="absolute top-2 right-0 w-0.5 h-1/3 bg-lime-500"></div>
          <div className="absolute bottom-2 left-0 w-0.5 h-1/3 bg-lime-500"></div>
          <div className="absolute bottom-2 right-0 w-0.5 h-1/3 bg-lime-500"></div>
        </div>
        
        <div className="bg-gray-900 bg-opacity-90 p-6">
          {/* Table header with angled design */}
          <div className="relative mb-4">
            <div className="absolute top-0 left-0 w-full h-full bg-lime-900 bg-opacity-20 transform -skew-x-12"></div>
            <div className="relative flex justify-between items-center px-6 py-4">
              <h2 className="text-xl font-mono text-lime-400">RANKINGS</h2>
              {!loading && !error && data.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">LIVE</span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-t-2 border-b-2 border-lime-500 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-r-2 border-transparent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              </div>
              <p className="mt-4 text-gray-400 font-mono">LOADING DATA</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="inline-block p-3 rounded-full bg-gray-800 mb-4">
                <svg className="w-10 h-10 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-lg text-gray-300 mb-2">Connection Error</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          ) : displayedData.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-3 rounded-full bg-gray-800 mb-4">
                <svg className="w-10 h-10 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-lg text-gray-300 mb-2">No Data Available</p>
              <p className="text-sm text-gray-400">Check back soon for results</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-4 text-left font-mono text-xs text-lime-400 uppercase tracking-wider">#</th>
                    <th className="px-4 py-4 text-left font-mono text-xs text-lime-400 uppercase tracking-wider">Team</th>
                    {problemColumns.map((col, index) => (
                      <th key={index} className="px-4 py-4 text-center font-mono text-xs text-lime-400 uppercase tracking-wider">
                        P{index + 1}
                      </th>
                    ))}
                    <th className="px-4 py-4 text-center font-mono text-xs text-lime-400 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-4 text-center font-mono text-xs text-lime-400 uppercase tracking-wider">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lime-900 divide-opacity-30">
                  {displayedData.map((entry, index) => (
                    <tr key={index} className="group hover:bg-lime-900 hover:bg-opacity-10 transition-all duration-300">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center 
                                          ${entry.rank === 1 
                                            ? 'text-black font-bold bg-lime-400' 
                                            : entry.rank === 2 
                                              ? 'text-black font-bold bg-lime-300' 
                                              : entry.rank === 3 
                                                ? 'text-black font-bold bg-lime-200' 
                                                : 'text-lime-400 bg-transparent border border-lime-500'}`}>
                            {entry.rank}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-white group-hover:text-lime-400 transition-colors duration-200">
                          {entry.teamname}
                        </div>
                      </td>
                      {problemColumns.map((col, idx) => (
                        <td key={idx} className="px-4 py-4 text-center">
                          {entry[col] ? (
                            <div className="inline-block h-6 w-6 rounded-sm bg-lime-900 bg-opacity-40 text-lime-400">
                              {entry[col]}
                            </div>
                          ) : (
                            <div className="inline-block h-6 w-6 rounded-sm border border-gray-800 text-gray-700">-</div>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-4 text-center text-gray-400 font-mono">
                        {formatTime(entry.first_solve_time)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="font-bold text-lg text-lime-400">
                          {entry.total_score}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && !error && displayedData.length > 0 && (
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`relative overflow-hidden px-5 py-2 font-mono text-sm transition-colors duration-300 ${
                  currentPage === 1 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : 'bg-black hover:bg-lime-900 text-lime-400'
                }`}
              >
                <span className="relative z-10">&#8592; PREV</span>
                {currentPage !== 1 && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-lime-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                )}
              </button>
              
              <div className="flex items-center gap-3">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Adjust pageNum calculation for pagination with ellipsis
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center font-mono transition-colors duration-200 ${
                        currentPage === pageNum
                          ? 'bg-lime-500 text-black'
                          : 'bg-black border border-lime-900 text-lime-400 hover:bg-lime-900 hover:bg-opacity-30'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`relative overflow-hidden px-5 py-2 font-mono text-sm transition-colors duration-300 ${
                  currentPage === totalPages 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : 'bg-black hover:bg-lime-900 text-lime-400'
                }`}
              >
                <span className="relative z-10">NEXT &#8594;</span>
                {currentPage !== totalPages && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-lime-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats grid with geometric shapes */}
      {!loading && !error && data.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative bg-black border border-gray-800 p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-lime-900 opacity-20 transform rotate-45 translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-lime-500"></div>
            
            <div className="font-mono text-xs text-lime-400 uppercase tracking-wider mb-1">Top Performer</div>
            <div className="text-3xl font-bold text-white mt-2">{data[0]?.teamname || 'N/A'}</div>
            <div className="flex items-baseline mt-2">
              <span className="text-2xl font-bold text-lime-400">{data[0]?.total_score || 0}</span>
              <span className="ml-2 text-gray-400">points</span>
            </div>
          </div>
          
          <div className="relative bg-black border border-gray-800 p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-lime-900 opacity-20 transform rotate-45 translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-lime-500"></div>
            
            <div className="font-mono text-xs text-lime-400 uppercase tracking-wider mb-1">Teams Participating</div>
            <div className="text-3xl font-bold text-white mt-2">{data.length}</div>
            <div className="flex items-baseline mt-2">
              <span className="text-2xl font-bold text-lime-400">
                {Math.round(data.reduce((sum, team) => sum + team.total_score, 0) / data.length)}
              </span>
              <span className="ml-2 text-gray-400">avg. score</span>
            </div>
          </div>
          
          <div className="relative bg-black border border-gray-800 p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-lime-900 opacity-20 transform rotate-45 translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-lime-500"></div>
            
            <div className="font-mono text-xs text-lime-400 uppercase tracking-wider mb-1">Competition</div>
            <div className="text-3xl font-bold text-white mt-2">{eventName === "ReverseCoding" ? "Reverse Coding" : "Clash"}</div>
            <div className="flex items-baseline mt-2">
              <span className="text-2xl font-bold text-lime-400">{isJunior ? "Junior" : "Senior"}</span>
              <span className="ml-2 text-gray-400">division</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;