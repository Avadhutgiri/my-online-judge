import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [logData, setLogData] = useState({ email: "", password: "", event_name: "Reverse Coding" });
  const [teamLogin, setTeamLogin] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const addData = (e) => {
    setLogData({ ...logData, [e.target.name]: e.target.value });
  };

  const toggleEvent = () => {
    setLogData((prev) => ({
      ...prev,
      event_name: prev.event_name === "Reverse Coding" ? "Clash" : "Reverse Coding",
    }));
  };
  
  const navigateToRegister = () => {
    navigate("/register");
  };


  const logUser = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        username: logData.email,
        password: logData.password,
        team_login: teamLogin,
        team_name: teamLogin ? teamName : undefined,
        event_name: logData.event_name,
      }, {
        withCredentials: true,
      });

      // Store token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Dispatch a custom event to notify other components about the login
      window.dispatchEvent(new Event("storage"));
      
      // Navigate to instructions page
      navigate("/instructions");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
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
          onSubmit={logUser}
          className="backdrop-blur-lg bg-[#1A1D21]/80 rounded-lg shadow-xl overflow-hidden border border-gray-800"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#222629] to-[#1A1D21] p-6 border-b border-gray-800">
            <h1 className="text-3xl font-bold text-center text-white">
              <span className="text-[#86C232]">&lt;</span> LOGIN <span className="text-[#86C232]">/&gt;</span>
            </h1>
          </div>
          
          {/* Form body */}
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm animate-pulse">
                {error}
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
                  onChange={addData}
                  value={logData.email}
                  className="w-full pl-10 pr-4 py-3 bg-[#222629] border border-gray-700 focus:border-[#86C232] text-white rounded-md outline-none transition-colors duration-300"
                  name="email"
                  type="text"
                  placeholder="Username"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input
                  onChange={addData}
                  value={logData.password}
                  className="w-full pl-10 pr-4 py-3 bg-[#222629] border border-gray-700 focus:border-[#86C232] text-white rounded-md outline-none transition-colors duration-300"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                />
              </div>
              
              {teamLogin && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <input
                    onChange={(e) => setTeamName(e.target.value)}
                    value={teamName}
                    className="w-full pl-10 pr-4 py-3 bg-[#222629] border border-gray-700 focus:border-[#86C232] text-white rounded-md outline-none transition-colors duration-300"
                    name="teamName"
                    type="text"
                    placeholder="Team Name"
                    required
                  />
                </div>
              )}
            </div>
            
            {/* Event Toggle */}
            <div className="pt-2 pb-2">
              <div className="flex items-center justify-between p-3 rounded-md bg-[#222629]/60">
                <span className={`text-base font-medium ${logData.event_name === "Reverse Coding" ? "text-[#86C232]" : "text-gray-400"}`}>
                  Reverse Coding
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={logData.event_name === "Clash"} onChange={toggleEvent} />
                  <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                  after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#86C232]"></div>
                </label>
                <span className={`text-base font-medium ${logData.event_name === "Clash" ? "text-[#86C232]" : "text-gray-400"}`}>
                  Clash
                </span>
              </div>
            </div>
            
            {/* Team Login Checkbox */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer space-x-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={teamLogin}
                    onChange={(e) => setTeamLogin(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block ${teamLogin ? 'bg-[#86C232]' : 'bg-gray-700'} w-6 h-6 rounded-md transition-colors duration-300`}></div>
                  {teamLogin && (
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-sm">
                      <svg className="w-4 h-4 text-[#86C232]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-gray-300 text-sm font-medium">Login as a Team</span>
              </label>
            </div>
            
            {/* Login Button */}
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
              ) : "LOGIN"}
            </button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={navigateToRegister}
                className="w-full py-3 px-4 bg-[#222629] hover:bg-[#2C3033] text-[#86C232] font-bold rounded-md transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#86C232] focus:ring-opacity-50"
              >
                REGISTER
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;