import React from 'react';
import { useNavigate } from 'react-router-dom';

const InstructionsPage = () => {
  const navigate = useNavigate();
  const onCoding = () => {
    navigate('/QuestionHub');
  };

  const instructions = [
    "The following coding competition can be played in THREE languages",
    "These rounds consists of 6 questions in the order of increasing marks. For first right submission, the first participant to submit will receive full marks. For next right submissions, following participants will receive (max-marks)-1, (max-marks)-2 and so on marks.",
    "The following contest will consist of two text boxes - a) Input textbox b) Output textbox. Participants are expected to put custom input in textbox and corresponding output will be generated.",
    "Based on output generated upon customized inputs provided, find the relation, and code it accordingly in the editor provided on the page.",
    "To run the code and check for semantics, Press run button",
    "To check Testcases passed and to do submission of the code, Press Submit button.",
    "Once pressed on the run button, you can authenticate the code in the custom input textbox and check the corresponding output to verify the validity of the code.",
    "After every submission, leaderboard will be updated. Users can check their rank on leaderboard page.",
    "Submissions done can be viewed on the submission page of the website."
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-6 bg-[#121417]">
      {/* Header with glow effect */}
      <div className="relative mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
          INSTRUCTIONS
        </h1>
        <div className="absolute -bottom-3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#86C232] to-transparent"></div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full md:w-[80%] lg:w-[70%] max-w-4xl mb-8">
        <div className="relative h-2 bg-[#2a2e32] rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-[#86C232] to-[#61892F] rounded-full"></div>
        </div>
      </div>
      
      {/* Instructions container */}
      <div className="w-full md:w-[80%] lg:w-[70%] max-w-4xl max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#86C232] scrollbar-track-[#1e2124] pr-2 pb-4">
        {instructions.map((instruction, index) => (
          <div 
            key={index}
            className="mb-6 rounded-lg border-l-4 border-[#86C232] bg-[#1A1D21] hover:bg-[#222629] transition-all duration-300 shadow-lg overflow-hidden group"
          >
            <div className="flex items-stretch">
              <div className="bg-[#1e1e1e] group-hover:bg-[#222] w-16 md:w-20 flex-shrink-0 flex items-center justify-center relative">
                <div className="text-[#86C232] font-bold text-xl md:text-2xl z-10">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-[#86C232] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-5 md:p-6 flex-grow">
                <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                  {instruction}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Button with improved styling */}
      <div className="mt-8 mb-4">
        <button 
          onClick={onCoding} 
          className="relative overflow-hidden bg-[#86C232] text-black font-bold py-3 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#86C232] focus:ring-opacity-50 group"
        >
          <span className="relative z-10">PROCEED</span>
          <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
          <span className="absolute bottom-0 left-0 w-0 h-1 bg-black group-hover:w-full transition-all duration-300 ease-in-out"></span>
        </button>
      </div>
      
      {/* Footer note */}
      <p className="text-gray-500 text-xs mt-6 text-center">
        Good luck and happy coding!
      </p>
    </div>
  );
};

export default InstructionsPage;