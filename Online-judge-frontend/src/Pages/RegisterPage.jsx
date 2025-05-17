import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    is_junior: false,
    event_name: "Reverse Coding",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
  };

  const validateUsername = (username) => {
    // Alphanumeric, 3-20 characters
    const re = /^[a-zA-Z0-9]{3,20}$/;
    return re.test(username);
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    };

    if (!validateUsername(userData.username)) {
      newErrors.username = "Username must be 3-20 characters and alphanumeric";
    }

    if (!validateEmail(userData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validatePassword(userData.password)) {
      newErrors.password = "Password must be at least 8 characters with uppercase, lowercase, and number";
    }

    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const toggleEvent = () => {
    setUserData((prev) => ({
      ...prev,
      event_name: prev.event_name === "Reverse Coding" ? "Clash" : "Reverse Coding",
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, general: "" }));
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/users/register", {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        is_junior: userData.is_junior,
        event_name: userData.event_name,
      });

      if (response.status === 201) {
        setSuccess("Registration Successful! Now You can Log In");
        // Clear form
        setUserData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          is_junior: false,
          event_name: "Reverse Coding",
        });
      }
    } catch (err) {
      if (err.response) {
        // Handle specific error cases
        switch (err.response.status) {
          case 400:
            setErrors(prev => ({ ...prev, general: "Invalid input data" }));
            break;
          case 409:
            setErrors(prev => ({ ...prev, general: "Username or email already exists" }));
            break;
          case 500:
            setErrors(prev => ({ ...prev, general: "Server error. Please try again later" }));
            break;
          default:
            setErrors(prev => ({ ...prev, general: "Registration failed. Please try again" }));
        }
      } else if (err.request) {
        setErrors(prev => ({ ...prev, general: "Network error. Please check your connection" }));
      } else {
        setErrors(prev => ({ ...prev, general: "An unexpected error occurred" }));
      }
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
          onSubmit={handleRegister}
          className="backdrop-blur-lg bg-[#1A1D21]/80 rounded-lg shadow-xl overflow-hidden border border-gray-800"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#222629] to-[#1A1D21] p-6 border-b border-gray-800">
            <h1 className="text-3xl font-bold text-center text-white">
              <span className="text-[#86C232]">&lt;</span> REGISTER <span className="text-[#86C232]">/&gt;</span>
            </h1>
          </div>
          
          {/* Form body */}
          <div className="p-6 space-y-5">
            {errors.general && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm animate-pulse">
                {errors.general}
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
                  value={userData.username}
                  className={`w-full pl-10 pr-4 py-3 bg-[#222629] border ${errors.username ? 'border-red-500' : 'border-gray-700 focus:border-[#86C232]'} text-white rounded-md outline-none transition-colors duration-300`}
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Username"
                  required
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <input
                  onChange={handleChange}
                  value={userData.email}
                  className={`w-full pl-10 pr-4 py-3 bg-[#222629] border ${errors.email ? 'border-red-500' : 'border-gray-700 focus:border-[#86C232]'} text-white rounded-md outline-none transition-colors duration-300`}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input
                  onChange={handleChange}
                  value={userData.password}
                  className={`w-full pl-10 pr-4 py-3 bg-[#222629] border ${errors.password ? 'border-red-500' : 'border-gray-700 focus:border-[#86C232]'} text-white rounded-md outline-none transition-colors duration-300`}
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input
                  onChange={handleChange}
                  value={userData.confirmPassword}
                  className={`w-full pl-10 pr-4 py-3 bg-[#222629] border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700 focus:border-[#86C232]'} text-white rounded-md outline-none transition-colors duration-300`}
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            {/* Event Toggle */}
            <div className="pt-1 pb-1">
              <div className="flex items-center justify-between p-3 rounded-md bg-[#222629]/60">
                <span className={`text-base font-medium ${userData.event_name === "Reverse Coding" ? "text-[#86C232]" : "text-gray-400"}`}>
                  Reverse Coding
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={userData.event_name === "Clash"} 
                    onChange={toggleEvent} 
                  />
                  <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                  after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#86C232]"></div>
                </label>
                <span className={`text-base font-medium ${userData.event_name === "Clash" ? "text-[#86C232]" : "text-gray-400"}`}>
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
                    checked={userData.is_junior}
                    onChange={(e) => setUserData({ ...userData, is_junior: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`block ${userData.is_junior ? 'bg-[#86C232]' : 'bg-gray-700'} w-6 h-6 rounded-md transition-colors duration-300`}></div>
                  {userData.is_junior && (
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-sm">
                      <svg className="w-4 h-4 text-[#86C232]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-gray-300 text-sm font-medium">Is Junior?</span>
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
              ) : "REGISTER"}
            </button>
            
            {/* Team Registration Link */}
            <div className="pt-2 text-center">
              <p className="text-sm text-gray-400">
                Want to register as a team?{" "}
                <a 
                  href="/registerTeam" 
                  className="text-[#86C232] hover:text-[#a7e959] hover:underline transition-colors duration-300"
                >
                  Create a Team
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;