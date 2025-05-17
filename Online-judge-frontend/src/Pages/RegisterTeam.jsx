import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterTeam = () => {
  const [teamData, setTeamData] = useState({
    username1: "",
    username2: "",
    team_name: "",
    event_name: "Reverse Coding",
    is_junior: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setTeamData({ ...teamData, [e.target.name]: e.target.value });
  };

  const toggleEvent = () => {
    setTeamData((prev) => ({
      ...prev,
      event_name: prev.event_name === "Reverse Coding" ? "Clash" : "Reverse Coding",
    }));
  };

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await axios.post("http://localhost:5000/api/users/registerTeam", teamData);

      setSuccess("Team registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Team registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] w-full flex justify-center items-center bg-[#121417] p-4">
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -top-6 -left-6 w-16 h-16 border-t-2 border-l-2 border-[#86C232] opacity-70"></div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 border-b-2 border-r-2 border-[#86C232] opacity-70"></div>
        
        <form 
          onSubmit={handleRegisterTeam}
          className="backdrop-blur-lg bg-[#1A1D21]/80 rounded-lg shadow-xl overflow-hidden border border-gray-800"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#222629] to-[#1A1D21] p-6 border-b border-gray-800">
            <h1 className="text-3xl font-bold text-center text-white">
              <span className="text-[#86C232]">&lt;</span> CREATE TEAM <span className="text-[#86C232]">/&gt;</span>
            </h1>
          </div>
          
          {/* Form body */}
          <div className="p-6 space-y-5">
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm animate-pulse">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-900/30 border border-green-500/50 text-green-400 px-4 py-3 rounded-md text-sm animate-pulse">
                {success}
              </div>
            )}
            
            {/* Input fields */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input
                  onChange={handleChange}
                  value={teamData.username1}
                  className="w-full pl-10 pr-4 py-3 bg-[#222629] border border-gray-700 focus:border-[#86C232] text-white rounded-md outline-none transition-colors duration-300"
                  id="username1"
                  name="username1"
                  type="text"
                  placeholder="First User's Username"
                  required
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input
                  onChange={handleChange}
                  value={teamData.username2}
                  className="w-full pl-10 pr-4 py-3 bg-[#222629] border border-gray-700 focus:border-[#86C232] text-white rounded-md outline-none transition-colors duration-300"
                  id="username2"
                  name="username2"
                  type="text"
                  placeholder="Second User's Username"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <input
                  onChange={handleChange}
                  value={teamData.team_name}
                  className="w-full pl-10 pr-4 py-3 bg-[#222629] border border-gray-700 focus:border-[#86C232] text-white rounded-md outline-none transition-colors duration-300"
                  id="team_name"
                  name="team_name"
                  type="text"
                  placeholder="Team Name"
                  required
                />
              </div>
            </div>
            
            {/* Event Toggle */}
            <div className="pt-1 pb-1">
              <div className="flex items-center justify-between p-3 rounded-md bg-[#222629]/60">
                <span className={`text-base font-medium ${teamData.event_name === "Reverse Coding" ? "text-[#86C232]" : "text-gray-400"}`}>
                  Reverse Coding
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={teamData.event_name === "Clash"} 
                    onChange={toggleEvent} 
                  />
                  <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                  after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#86C232]"></div>
                </label>
                <span className={`text-base font-medium ${teamData.event_name === "Clash" ? "text-[#86C232]" : "text-gray-400"}`}>
                  Clash
                </span>
              </div>
            </div>
            
            {/* Junior Checkbox */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer space-x-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={teamData.is_junior}
                    onChange={(e) => setTeamData({ ...teamData, is_junior: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`block ${teamData.is_junior ? 'bg-[#86C232]' : 'bg-gray-700'} w-6 h-6 rounded-md transition-colors duration-300`}></div>
                  {teamData.is_junior && (
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-sm">
                      <svg className="w-4 h-4 text-[#86C232]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-gray-300 text-sm font-medium">Is Junior Team?</span>
              </label>
            </div>
            
            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#86C232] hover:bg-[#7BB62C]'} text-black font-bold rounded-md transition-colors duration-300 shadow-md relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#86C232] focus:ring-opacity-50 flex justify-center items-center`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "REGISTER TEAM"}
            </button>
            
            {/* Individual Registration Link */}
            <div className="pt-2 text-center">
              <p className="text-sm text-gray-400">
                Want to register as an individual?{" "}
                <a 
                  href="/register" 
                  className="text-[#86C232] hover:text-[#a7e959] hover:underline transition-colors duration-300"
                >
                  Register Here
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterTeam;