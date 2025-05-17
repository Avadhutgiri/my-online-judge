import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiMenu, FiX, FiUser, FiLogOut } from "react-icons/fi";
import Modal from "../components/Modal";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const location = useLocation();
    const navigate = useNavigate();

    // Listen for login/logout changes using storage event
    useEffect(() => {
        const handleStorageChange = () => {
            setIsLoggedIn(!!localStorage.getItem("token"));
        };

        // Listen for storage changes
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const isOnCodingQuestionPage = () => {
        return /^\/coding\/question\/\d+/.test(location.pathname);
    };

    const openModalOrRedirect = () => {
        if (isOnCodingQuestionPage()) {
            setIsModalOpen(true);
        } else {
            navigate("/instructions");
        }
    };

    const handleAuthAction = () => {
        if (isLoggedIn) {
            // Logout
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            window.dispatchEvent(new Event("storage")); // Notify other tabs
            navigate("/");
        } else {
            // Redirect to login
            navigate("/");
        }
    };

    return (
        <>
            <div className="navbar h-[10vh] w-full md:w-[80%] mx-auto bg-[#292929] rounded-[40px] flex justify-between items-center z-[1000] px-6 shadow-lg">
                <div className="nav-left h-full flex items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="h-12 w-12 bg-[#86C232] rounded-full flex justify-center items-center">
                            <h1 className="text-[#191919] text-[22px] font-bold">RC</h1>
                        </div>
                        <span className="hidden md:block text-white text-xl font-bold">CodeChallenge</span>
                    </Link>
                </div>

                {/* Hamburger menu for smaller screens */}
                <div className="lg:hidden flex items-center">
                    <button onClick={toggleMenu} className="text-white text-2xl p-2 hover:bg-[#3a3a3a] rounded-full transition duration-200">
                        {isMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

                {/* Navbar Links for larger screens */}
                <div className="nav-mid hidden lg:flex h-full items-center">
                    <ul className="flex space-x-4 items-center">
                        <li>
                            <button 
                                onClick={openModalOrRedirect}
                                className="text-white font-medium py-2 px-4 hover:bg-[#3a3a3a] rounded-lg transition duration-200"
                            >
                                Instructions
                            </button>
                        </li>
                        <li>
                            <Link 
                                to="/questionhub"
                                className="text-white font-medium py-2 px-4 hover:bg-[#3a3a3a] rounded-lg transition duration-200"
                            >
                                Question Hub
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/leaderboard"
                                className="text-white font-medium py-2 px-4 hover:bg-[#3a3a3a] rounded-lg transition duration-200"
                            >
                                Leaderboards
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/result"
                                className="text-white font-medium py-2 px-4 hover:bg-[#3a3a3a] rounded-lg transition duration-200"
                            >
                                Results
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Auth Button (Login / Logout) */}
                <div className="nav-right hidden lg:flex items-center">
                    <button 
                        onClick={handleAuthAction}
                        className="h-10 px-6 flex items-center justify-center gap-2 bg-[#86C232] hover:bg-[#76b129] rounded-[30px] text-[#191919] font-bold transition duration-200"
                    >
                        {isLoggedIn ? (
                            <>
                                <FiLogOut /> Logout
                            </>
                        ) : (
                            <>
                                <FiUser /> Login
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu - slide in from the top */}
            {isMenuOpen && (
                <div className="lg:hidden fixed top-0 left-0 z-[999] w-full h-screen bg-[#1A1A1A]/95 flex flex-col items-center justify-center space-y-6 py-10 text-white animate-fadeIn">
                    <button onClick={toggleMenu} className="absolute top-6 right-6 text-white text-2xl">
                        <FiX />
                    </button>
                    
                    <div className="flex flex-col items-center space-y-8 w-full px-4">
                        <button onClick={() => { openModalOrRedirect(); toggleMenu(); }} className="w-full py-3 text-xl border-b border-[#333] hover:bg-[#333] rounded-lg transition duration-200">
                            Instructions
                        </button>
                        <Link to="/questionhub" onClick={toggleMenu} className="w-full py-3 text-xl border-b border-[#333] hover:bg-[#333] rounded-lg transition duration-200 text-center">
                            Question Hub
                        </Link>
                        <Link to="/leaderboard" onClick={toggleMenu} className="w-full py-3 text-xl border-b border-[#333] hover:bg-[#333] rounded-lg transition duration-200 text-center">
                            Leaderboards
                        </Link>
                        <Link to="/result" onClick={toggleMenu} className="w-full py-3 text-xl border-b border-[#333] hover:bg-[#333] rounded-lg transition duration-200 text-center">
                            Results
                        </Link>
                        
                        <button 
                            onClick={() => { handleAuthAction(); toggleMenu(); }}
                            className="mt-6 w-64 py-3 bg-[#86C232] hover:bg-[#76b129] text-[#191919] rounded-[30px] text-xl font-bold flex items-center justify-center gap-2 transition duration-200"
                        >
                            {isLoggedIn ? (
                                <>
                                    <FiLogOut /> Logout
                                </>
                            ) : (
                                <>
                                    <FiUser /> Login
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Component */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default Navbar;