import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QuestionHub = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme colors
  const THEME = {
    primary: '#86C232',       // Main green
    primaryDark: '#689427',   // Darker green
    primaryLight: '#A2D158',  // Lighter green
    dark: '#222629',          // Near black
    darkGrey: '#474B4F',      // Dark grey
    mediumGrey: '#6B6E70',    // Medium grey
    lightGrey: '#D3D6D8'      // Light grey
  };

  useEffect(() => {
    // Retrieve user info from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/"); // Redirect to login if user is not found
      return;
    }

    // Fetch questions from the backend
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/problems", {
          withCredentials: true,
        });
        
        // Fetch stats for each problem
        const questionsWithStats = await Promise.all(
          response.data.map(async (question) => {
            try {
              const statsResponse = await axios.get(
                `http://localhost:5000/api/problems/stats/${question.id}`,
                { withCredentials: true }
              );
              
              // Merge stats with question data
              return {
                ...question,
                total_submissions: statsResponse.data.data.total_submissions || 0,
                correct_submissions: statsResponse.data.data.correct_submissions || 0,
                wrong_submissions: statsResponse.data.data.wrong_submissions || 0,
                success_rate: statsResponse.data.data.success_rate || "0%"
              };
            } catch (err) {
              console.error(`Failed to fetch stats for problem ${question.id}:`, err);
              // Return question with default stats if stats fetch fails
              return {
                ...question,
                total_submissions: 0,
                correct_submissions: 0,
                wrong_submissions: 0,
                success_rate: "0%"
              };
            }
          })
        );
        
        setQuestions(questionsWithStats);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load questions");
        setQuestions([]);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [navigate]);

  const handleQuestionClick = (id) => {
    navigate(`/coding/problem/${id}`);
  };

  // Difficulty color mapping within our theme
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-500"; // Using Tailwind's green-500
      case "medium":
        return "bg-gray-500";  // Using grey
      case "hard":
        return "bg-gray-700";  // Using dark grey
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] w-full bg-gray-900">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-green-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-green-500 font-mono tracking-wider text-sm">LOADING QUESTIONS</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] w-full bg-gray-900 p-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-green-500 max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            className="w-full bg-gray-700 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-[85vh] p-6 w-full">
      {/* Header with green underline */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Question Hub</h1>
        <div className="h-1 w-24 bg-green-500 mx-auto mt-3"></div>
        <p className="text-gray-400 mt-4">Select a problem to start coding</p>
      </div>

      {questions.length > 0 ? (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((question) => {
              // Extract accuracy from the success_rate (remove the % sign)
              const accuracyPercentage = parseInt(question.success_rate) || 0;
              
              const difficulty = question.difficulty || "Medium";
              const difficultyColor = getDifficultyColor(difficulty);

              return (
                <div
                  key={question.id}
                  onClick={() => handleQuestionClick(question.id)}
                  className="bg-black rounded-lg overflow-hidden shadow-lg hover:shadow-green-900/20 hover:translate-y-1 transition-all duration-300 cursor-pointer border border-gray-700"
                  >
                  <div className="p-6">
                    {/* Question title and difficulty badge */}
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-white">{question.title}</h2>
                      <span className={`text-xs font-medium py-1 px-2 rounded-full text-white ${difficultyColor}`}>
                        {difficulty}
                      </span>
                    </div>
                    
                    {/* Question details */}
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                      {question.description || "Solve this coding challenge to test your skills."}
                    </p>
                    
                    {/* Statistics */}
                    <div className="space-y-3">
                      {/* Accuracy bar */}
                      <div>
                        <div className="flex justify-between items-center mb-1 text-xs">
                          <span className="text-gray-400">Accuracy</span>
                          <span className="text-green-400">{question.success_rate}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${accuracyPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Submissions count */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Submissions</span>
                        <div className="flex items-center">
                          <span className="text-green-400 mr-1">{question.correct_submissions}</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-gray-400 ml-1">{question.total_submissions}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="bg-gray-900/40 p-3 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {question.points || 100} points
                    </span>
                    <button className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded transition-colors duration-200">
                      Solve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-lg max-w-md mx-auto">
          <div className="inline-block p-3 rounded-full bg-gray-700 mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Questions Available</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            There are currently no questions available in this category.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionHub;