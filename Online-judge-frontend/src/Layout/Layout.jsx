import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

const Layout = () => {
    return ( 
        <>
            <div className="layout bg-[#181818] h-screen w-full flex flex-col">
                {/* Navbar stays fixed at the top */}
                <div className="nav h-[15%] w-full flex justify-center items-center fixed top-0 left-0 bg-[#181818] z-50">
                    <Navbar/>
                </div>

                {/* Content area starts below navbar & scrolls properly */}
                <div className="content flex-grow w-full pt-[15%] overflow-y-auto overflow-x-hidden">
                    <Outlet/>
                </div>
            </div>
        </>
     );
}
 
export default Layout;
