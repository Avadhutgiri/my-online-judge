import React from 'react';

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[8000] bg-black bg-opacity-70">
      <div className="bg-[#1A1A1A] rounded-lg p-6 max-w-3xl w-full shadow-lg"> {/* Background and rounded corners */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">Instructions</h2> {/* Title matching InstructionsPage */}
        
        <div className="w-full h-[450px] overflow-y-auto"> {/* Container for content */}
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center border-[2px] border-solid border-[#86C232] max-sm:p-4">
            <div className="bg-[#86C232] w-full md:w-[10%] h-12 md:h-24 flex items-center justify-center md:mr-4 text-lg text-black font-bold">
              01
            </div>
            <p className="text-gray-300 md:pt-6 pb-4 md:pb-6 text-sm md:text-base max-sm:pt-4">
            The following coding competition can be played in THREE languages
            </p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center border-[2px] border-solid border-[#86C232] max-sm:p-4">
            <div className="bg-[#86C232] w-full md:w-[29%] h-12 md:h-28 flex items-center justify-center md:mr-4 text-lg text-black font-bold">
              02
            </div>
            <p className="text-gray-300 md:pt-6 pb-4 md:pb-6 text-sm md:text-base max-sm:pt-4">
            These rounds consists of 6 questions of in the order of increasing marks. For first right submission, the first participant to submit will receive full marks. For next right submissions, following participants will receive (max-marks)-1, (max-marks)-2 and so on marks.
            </p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center border-[2px] border-solid border-[#86C232] max-sm:p-4">
            <div className="bg-[#86C232] w-full md:w-[21%] h-14 md:h-28 flex items-center justify-center md:mr-4 text-lg text-black font-bold">
              03
            </div>
            <p className="text-gray-300 md:pt-6 pb-4 md:pb-6 text-sm md:text-base max-sm:pt-4">
            The following contest will consist of two text boxes -a) Input textbox b) Output textbox. Participants are expected to put custom input in textbox and corresponding output will be generated.
            </p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center border-[2px] border-solid border-[#86C232] max-sm:p-4">
            <div className="bg-[#86C232] w-full md:w-[16%] h-12 md:h-24 flex items-center justify-center md:mr-4 text-lg text-black font-bold">
              04
            </div>
            <p className="text-gray-300 md:pt-6 pb-4 md:pb-6 text-sm md:text-base max-sm:pt-4">
            Based on output generated upon customized inputs provided, find the relation, and code it accordingly in the editor provided on the page.
            </p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center border-[2px] border-solid border-[#86C232] max-sm:p-4">
            <div className="bg-[#86C232] w-full md:w-[10%] h-12 md:h-24 flex items-center justify-center md:mr-4 text-lg text-black font-bold">
              05
            </div>
            <p className="text-gray-300 md:pt-6 pb-4 md:pb-6 text-sm md:text-base max-sm:pt-4">
            To run the code and check for semantics , Press run button
            </p>
          </div>
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center border-[2px] border-solid border-[#86C232] max-sm:p-4">
            <div className="bg-[#86C232] w-full md:w-[10%] h-12 md:h-24 flex items-center justify-center md:mr-4 text-lg text-black font-bold">
              06
            </div>
            <p className="text-gray-300 md:pt-6 pb-4 md:pb-6 text-sm md:text-base max-sm:pt-4">
            To check Testcases passed and to do submission of the code , Press Submit button.
            </p>
          </div>
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center border-[2px] border-solid border-[#86C232] max-sm:p-4">
            <div className="bg-[#86C232] w-full md:w-[18.5%] h-12 md:h-24 flex items-center justify-center md:mr-4 text-lg text-black font-bold">
              07
            </div>
            <p className="text-gray-300 md:pt-6 pb-4 md:pb-6 text-sm md:text-base max-sm:pt-4">
            Once pressed on the run button, you can authenticate the code in the custom input textbox and check the corresponding output to verify the validity of the code.
            </p>
          </div>
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center border-[2px] border-solid border-[#86C232] max-sm:p-4">
            <div className="bg-[#86C232] w-full md:w-[12%] h-12 md:h-24 flex items-center justify-center md:mr-4 text-lg text-black font-bold">
              08
            </div>
            <p className="text-gray-300 md:pt-6 pb-4 md:pb-6 text-sm md:text-base max-sm:pt-4">
            After every submission, leaderboard will be updated. Users can check their rank on leaderboard page.
            </p>
          </div>
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center border-[2px] border-solid border-[#86C232] max-sm:p-4">
            <div className="bg-[#86C232] w-full md:w-[10%] h-12 md:h-24 flex items-center justify-center md:mr-4 text-lg text-black font-bold">
              09
            </div>
            <p className="text-gray-300 md:pt-6 pb-4 md:pb-6 text-sm md:text-base max-sm:pt-4">
            Submissions done can be viewed on the submission page of the website.
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-[#86C232] text-black font-bold py-3 px-6 rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
