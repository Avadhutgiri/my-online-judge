import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import CodeEditorWindow from "./CodeEditorWindow";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";
import Submissions from "./Submissions";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";
import Collapse from "@mui/material/Collapse";

const Layout = () => {
  const { id } = useParams();

  // API & Problem state
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Code editing & submission states
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [testInput, setTestInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [testOutput, setTestOutput] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [testProcessing, setTestProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Test case animation states
  const [testCaseResults, setTestCaseResults] = useState([]);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [testCaseCount, setTestCaseCount] = useState(5); // Default to 5 test cases

  // Editor theme & language states
  const [theme, setTheme] = useState({ value: "cobalt", label: "Cobalt" });
  const [language, setLanguage] = useState(languageOptions[0]);

  // Console visibility & tab states
  const [activeTab, setActiveTab] = useState("description");

  // Submission history state
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Keypress hooks for Ctrl+Enter
  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  // Fetch the problem details
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/problems/${id}`, {
        withCredentials: true,
      })
      .then((response) => {
        setProblem(response.data);
        // If the problem defines a test case count, use it
        if (response.data.test_case_count) {
          setTestCaseCount(response.data.test_case_count);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error fetching problem");
        setProblem(null);
        setLoading(false);
      });
  }, [id]);

  // Load default theme
  useEffect(() => {
    defineTheme("oceanic-next").then(() =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  // Fetch submission history when the submissions tab is active
  useEffect(() => {
    if (activeTab === "submissions") {
      fetchSubmissionHistory();
    }
  }, [activeTab]);

  // Encode code & input to base64
  const encodeBase64 = (text) => btoa(unescape(encodeURIComponent(text)));

  // Decode base64 encoded text
  const decodeBase64 = (text) => decodeURIComponent(escape(atob(text)));

  // Fetch submission history
  const fetchSubmissionHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/submissions/history/${id}`,
        {
          withCredentials: true,
        }
      );
      setSubmissionHistory(response.data);
    } catch (error) {
      toast.error("Error fetching submission history!");
    }
  };

  const handleRunUserCode = async () => {
    setProcessing(true);
    // Clear any previous submission results when running code
    setSubmissionResult(null);
    setTestCaseResults([]);
    setAnimationComplete(false);

    const formData = {
      problem_id: id,
      code: encodeBase64(code),
      customTestcase: customInput ? customInput : null,
      language: language.value,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/submissions/run",
        formData,
        {
          withCredentials: true,
        }
      );

      toast.success("Code execution started...");

      // 🚀 Delay polling for 2 seconds to allow backend processing
      setTimeout(() => {
        pollForResult(
          response.data.submission_id,
          setOutputDetails,
          setProcessing,
          "Code Execution Completed!",
          false
        );
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error running code!");
      setProcessing(false);
    }
  };

  const handleSubmitCode = async () => {
    setSubmitting(true);
    // Clear any previous output details
    setOutputDetails(null);
    // Reset test case animations
    setTestCaseResults([]);
    setAnimationComplete(false);

    const submissionData = {
      problem_id: id,
      code: encodeBase64(code),
      language: language.value,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/submissions/submit",
        submissionData,
        {
          withCredentials: true,
        }
      );

      toast.success("Solution submitted successfully!");

      setTimeout(() => {
        pollForResult(
          response.data.submission_id,
          setSubmissionResult,
          setSubmitting,
          "Submission Completed!",
          true
        );
      }, 2000);
    } catch (error) {
      toast.error("Error submitting solution!");
      setSubmitting(false);
    }
  };

  const handleSystemRun = async () => {
    setTestProcessing(true);

    const formData = {
      problem_id: id,
      customTestcase: testInput ? testInput : null,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/submissions/runSystem",
        formData,
        {
          withCredentials: true,
        }
      );

      toast.success("System test execution started...");

      setTimeout(() => {
        pollForResult(
          response.data.submission_id,
          setTestOutput,
          setTestProcessing,
          "System Test Completed!",
          false
        );
      }, 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error running system test!"
      );
      setTestProcessing(false);
    }
  };

  const pollForResult = async (
    submission_id,
    setOutput,
    setProcessingState,
    successMessage,
    isSubmission,
    attempts = 5
  ) => {
    try {
      let response = await axios.get(
        `http://localhost:5000/polling/${submission_id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "Pending") {
        // Keep polling until we get a final result
        setTimeout(
          () =>
            pollForResult(
              submission_id,
              setOutput,
              setProcessingState,
              successMessage,
              isSubmission,
              attempts - 1
            ),
          2000
        );
      } else {
        if (isSubmission) {
          const result = {
            status: response.data.status || "",
            message: response.data.message || "",
            failed_test_case: response.data.failed_test_case || null,
            test_case_results: response.data.test_case_results || [],
            isSubmission: true,
          };

          setOutput(result);

          // Animate test cases (use received `test_case_results` if available)
          if (
            response.data.test_case_results &&
            Array.isArray(response.data.test_case_results)
          ) {
            animateTestCaseResults(response.data.test_case_results);
          } else if (response.data.status === "Accepted") {
            // If no detailed results but status is Accepted, simulate all passing
            animateTestCaseResults(Array(testCaseCount).fill("Accepted"));
          } else if (
            response.data.failed_test_case !== null &&
            response.data.failed_test_case !== undefined
          ) {
            // If we have a failed test case number, simulate it correctly
            const failedIndex = parseInt(
              response.data.failed_test_case.match(/\d+/)?.[0],
              10
            );

            const simulatedResults = Array.from(
              { length: testCaseCount },
              (_, idx) =>
                idx + 1 < failedIndex
                  ? "Accepted"
                  : idx + 1 === failedIndex
                  ? "Wrong Answer"
                  : null
            );

            animateTestCaseResults(simulatedResults);
          } else {
            // Fallback case (if nothing was provided)
            setAnimationComplete(true);
          }
        } else {
          // For regular runs, display user output
          setOutput({
            user_output: response.data.user_output || "",
            expected_output: response.data.expected_output || "",
            message: response.data.message || "",
            status: response.data.status || "",
            isSubmission: false,
          });
        }

        // Stop processing
        setProcessingState(false);
        toast.success(successMessage);
      }
    } catch (err) {
      if (err.response?.status === 404 && attempts > 0) {
        setTimeout(
          () =>
            pollForResult(
              submission_id,
              setOutput,
              setProcessingState,
              successMessage,
              isSubmission,
              attempts - 1
            ),
          2000
        );
      } else {
        console.error("Polling error:", err.response);
        toast.error("Error fetching result!");
        setProcessingState(false);
        setAnimationComplete(true);
      }
    }
  };

  // Function to animate test case results
  const animateTestCaseResults = (results) => {
    setTestCaseResults([]);
    setAnimationComplete(false);

    if (!results || results.length === 0) {
      setAnimationComplete(true);
      return;
    }

    // Animate test cases one by one
    const animateTestCase = (index = 0) => {
      if (index >= results.length) {
        setAnimationComplete(true);
        return;
      }

      setTestCaseResults((prev) => [
        ...prev,
        {
          id: index + 1,
          status: results[index] || "Pending",
        },
      ]);

      // Delay between animations
      setTimeout(() => animateTestCase(index + 1), 800);
    };

    // Start animation
    animateTestCase();
  };

  // Language & theme changes
  const onSelectChange = (selectedLang) => {
    setLanguage(selectedLang);
    setCode(""); // Reset code on language change
  };

  const handleThemeChange = (th) => {
    if (["light", "vs-dark"].includes(th.value)) {
      setTheme(th);
    } else {
      defineTheme(th.value).then(() => setTheme(th));
    }
  };

  // Get test case status icon and color
  const getTestCaseStatusInfo = (status) => {
    if (!status) return { icon: "⬜", color: "text-gray-400" };

    switch (status) {
      case "Accepted":
        return { icon: "✅", color: "text-green-500" };
      case "Wrong Answer":
        return { icon: "❌", color: "text-red-500" };
      case "Time Limit Exceeded":
        return { icon: "⏱️", color: "text-yellow-500" };
      case "Runtime Error":
        return { icon: "💥", color: "text-orange-500" };
      case "Compilation Error":
        return { icon: "🔧", color: "text-purple-500" };
      case "Memory Limit Exceeded":
        return { icon: "📈", color: "text-blue-500" };
      default:
        return { icon: "⬜", color: "text-gray-400" };
    }
  };

  // Format output for display
  const formatOutputForDisplay = (details) => {
    if (!details) return "Output will appear here...";

    // Handle submission results differently
    if (details.isSubmission) {
      let output = [];

      // Include status information
      if (details.status) {
        output.push(`Status: ${details.status}`);
      }

      // Include any message from the backend
      if (details.message) {
        output.push(`Message: ${details.message}`);
      }

      // Include failed test case information if available
      if (details.failed_test_case) {
        output.push(`Failed Test Case: ${details.failed_test_case}`);
      }

      return output.join("\n");
    }

    // For regular run results, just show the output
    return details.user_output || "No output generated.";
  };

  // Loading states & error handling
  if (loading) {
    return <div className="text-white text-center">Loading problem...</div>;
  }
  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }
  if (!problem) {
    return <div className="text-white text-center">Problem not found.</div>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row h-[85%] w-full mt-[-5%] m-2 font-serif">
        {/* Left Panel - Problem Details & Tabs */}
        <div className="w-full lg:w-1/2 p-4">
          {/* Tab Buttons */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab("description")}
              className={classnames(
                "px-4 py-2 border border-[#86C232] rounded font-bold text-black bg-[#86C232] hover:bg-transparent hover:text-[#86C232]",
                activeTab === "description" ? "bg-[#86C232]" : ""
              )}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("samples")}
              className={classnames(
                "px-4 py-2 border border-[#86C232] rounded font-bold text-black bg-[#86C232] hover:bg-transparent hover:text-[#86C232]",
                activeTab === "samples" ? "bg-[#86C232]" : ""
              )}
            >
              Samples
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={classnames(
                "px-4 py-2 border border-[#86C232] rounded font-bold text-black bg-[#86C232] hover:bg-transparent hover:text-[#86C232]",
                activeTab === "submissions" ? "bg-[#86C232]" : ""
              )}
            >
              Submissions
            </button>
          </div>

          {activeTab === "description" && (
            <div>
              {/* Title */}
              <h1 className="text-xl font-bold text-white">{problem.title}</h1>
              {/* Description */}
              <p className="text-white mt-2">{problem.description}</p>

              {/* Input Format */}
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-white">
                  Input Format
                </h2>
                <p className="bg-[#262626] p-4 rounded text-white">
                  {problem.input_format}
                </p>
              </div>

              {/* Output Format */}
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-white">
                  Output Format
                </h2>
                <p className="bg-[#262626] p-4 rounded text-white">
                  {problem.output_format}
                </p>
              </div>

              {/* Constraints */}
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-white">
                  Constraints
                </h2>
                <p className="bg-[#262626] p-4 rounded text-white">
                  {problem.constraints}
                </p>
              </div>
            </div>
          )}

          {activeTab === "samples" && (
            <div className="bg-[#262626] p-4 rounded text-white mt-4 h-[50vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-white mb-2">Samples</h2>
              {problem.samples?.length > 0 ? (
                problem.samples.map((sample, index) => (
                  <div
                    key={index}
                    className="bg-[#1e1e1e] p-4 rounded text-white mt-2"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <strong>Input:</strong>
                        <pre className="bg-black p-2 rounded overflow-x-auto">
                          {sample.input}
                        </pre>
                      </div>
                      <div className="flex-1">
                        <strong>Output:</strong>
                        <pre className="bg-black p-2 rounded overflow-x-auto">
                          {sample.output}
                        </pre>
                      </div>
                    </div>
                    {sample.explanation && (
                      <p className="text-gray-300 mt-1">{sample.explanation}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-white">No samples available.</p>
              )}
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="bg-[#262626] p-4 rounded text-white mt-4 h-[50vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-white mb-2">
                Submissions
              </h2>
              {submissionHistory.length > 0 ? (
                submissionHistory.map((submission, index) => (
                  <div
                    key={index}
                    className="bg-[#1e1e1e] p-4 rounded text-white mt-2 cursor-pointer"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        Language: {submission.language}
                      </span>
                      <span className="text-sm text-gray-400">
                        Status: {submission.result}
                      </span>
                      <span className="text-sm text-gray-400">
                        Time:{" "}
                        {new Date(submission.submitted_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white">No submissions available.</p>
              )}
            </div>
          )}

          {/* Test Input/Output Box below tabs - Side by side */}
          <div className="mt-4 bg-[#262626] p-4 rounded">
            <div className="text-white text-lg mb-2 text-center">
              Test Your Solution
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Input Field */}
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Input</h3>
                <textarea
                  className="w-full h-24 bg-[#1e1e1e] text-white p-2 rounded resize-none"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter your test input here..."
                  disabled={testProcessing}
                ></textarea>
              </div>

              {/* Output Display */}
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">
                  Expected Output
                </h3>
                <div className="w-full h-24 bg-[#1e1e1e] text-white p-2 rounded overflow-auto">
                  {testProcessing ? (
                    <p className="text-yellow-400">Processing system test...</p>
                  ) : testOutput ? (
                    <pre>
                      {testOutput.expected_output ||
                        "No expected output available."}
                    </pre>
                  ) : (
                    <p className="text-gray-400">
                      Expected output will appear here...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Run System Test Button */}
            <div className="mt-4">
              <button
                className="btn-primary bg-[#86C232] hover:bg-[#61892F] text-white font-bold py-2 rounded w-full"
                onClick={handleSystemRun}
                disabled={testProcessing} // Disable while processing
              >
                {testProcessing ? "Processing..." : "Run System Test"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor & Console */}
        <div className="w-full lg:w-1/2 p-4">
          <div className="flex justify-between mb-4">
            <LanguagesDropdown
              onSelectChange={onSelectChange}
              language={language}
            />
            <ThemeDropdown
              handleThemeChange={handleThemeChange}
              theme={theme}
            />
          </div>

          {/* Code Editor */}
          <CodeEditorWindow
            code={code}
            onChange={(action, data) => action === "code" && setCode(data)}
            language={language?.value}
            theme={theme.value}
          />

          {/* Console Area - Side by side layout for normal run, full width for submission */}
          <div className="mt-4 bg-[#262626] p-4 rounded">
            <div className="text-white text-lg mb-2 text-center">
              {submitting || submissionResult
                ? "Submission Result"
                : "Code Output"}
            </div>

            {submitting || submissionResult ? (
              // For submissions, show full-width output box with test case animation
              <div className="w-full">
                {/* Test Case Animation Area */}
                <div className="mb-4">
                  <h3 className="text-white font-semibold mb-2">Test Cases</h3>
                  <div className="bg-[#1e1e1e] p-4 rounded">
                    {submitting ? (
                      <p className="text-yellow-400">Running test cases...</p>
                    ) : testCaseResults.length > 0 ? (
                      <div className="flex flex-wrap gap-3 items-center">
                        {testCaseResults.map((testCase) => {
                          const { icon, color } = getTestCaseStatusInfo(
                            testCase.status
                          );
                          return (
                            <div
                              key={testCase.id}
                              className={`flex items-center gap-2 p-2 bg-[#262626] rounded-md animate-fadeIn ${color}`}
                            >
                              <span className="text-lg">{icon}</span>
                              <span>Test {testCase.id}</span>
                            </div>
                          );
                        })}

                        {/* Placeholder for test cases not yet shown */}
                        {animationComplete === false &&
                          Array(testCaseCount - testCaseResults.length)
                            .fill()
                            .map((_, idx) => (
                              <div
                                key={`pending-${idx}`}
                                className="flex items-center gap-2 p-2 bg-[#262626] rounded-md text-gray-400"
                              >
                                <span className="text-lg">⏳</span>
                                <span>Waiting...</span>
                              </div>
                            ))}
                      </div>
                    ) : animationComplete ? (
                      <p className="text-gray-400">
                        No test case details available.
                      </p>
                    ) : (
                      <p className="text-yellow-400">Preparing test cases...</p>
                    )}
                  </div>
                </div>

                {/* Submission Result Details */}
                <div className="w-full h-24 bg-[#1e1e1e] text-white p-2 rounded overflow-auto">
                  {submitting ? (
                    <p className="text-yellow-400">
                      Submitting and testing your solution...
                    </p>
                  ) : submissionResult ? (
                    <pre>{formatOutputForDisplay(submissionResult)}</pre>
                  ) : (
                    <p className="text-gray-400">
                      Submission results will appear here...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // For normal runs, show input & output side by side
              <div className="flex flex-col md:flex-row gap-4">
                {/* Input Box */}
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">Input</h3>
                  <textarea
                    className="w-full h-24 bg-[#1e1e1e] text-white p-2 rounded resize-none"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter your input here..."
                    disabled={processing}
                  ></textarea>
                </div>

                {/* Output Box */}
                <div className="flex-1 relative">
                  <h3 className="text-white font-semibold mb-2">Output</h3>
                  <div
                    className={`w-full bg-[#1e1e1e] text-white p-2 rounded 
                transition-all duration-300 ease-in-out
                ${
                  outputDetails && !outputDetails.isSubmission ? "h-48" : "h-32"
                }
                overflow-auto 
                scrollbar-thin scrollbar-thumb-[#86C232] scrollbar-track-[#262626]`}
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      lineHeight: "1.2",
                    }}
                  >
                    {processing ? (
                      <p className="text-yellow-400">Running code...</p>
                    ) : outputDetails && !outputDetails.isSubmission ? (
                      <pre className="w-full whitespace-pre-wrap break-words">
                        {formatOutputForDisplay(outputDetails)}
                      </pre>
                    ) : (
                      <p className="text-gray-400">
                        Output will appear here...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Run & Submit Buttons */}
          <div className="flex gap-4 mt-4">
            {/* Run Code Button */}
            <button
              className="flex-1 bg-[#86C232] hover:bg-[#61892F] text-white font-bold py-3 px-4 rounded"
              onClick={handleRunUserCode} // Run Code function
              disabled={!code || processing || submitting}
            >
              {processing ? "Running..." : "Run Code"}
            </button>

            {/* Submit Solution Button */}
            <button
              className="flex-1 bg-[#4B90FF] hover:bg-[#3575E0] text-white font-bold py-3 px-4 rounded"
              onClick={handleSubmitCode} // Submit Code function
              disabled={!code || submitting || processing}
            >
              {submitting ? "Submitting..." : "Submit Solution"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal to show submission code */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#262626] p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">
              Submission Code
            </h2>
            <pre className="bg-[#1e1e1e] p-4 rounded text-white overflow-x-auto">
              {decodeBase64(selectedSubmission.code)}
            </pre>
            <button
              className="mt-4 bg-[#86C232] hover:bg-[#61892F] text-white font-bold py-2 px-4 rounded"
              onClick={() => setSelectedSubmission(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add this CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out forwards;
        }
      `}</style>
      <ToastContainer />
    </>
  );
};

export default Layout;
