// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./header.css";
// import { nav } from "../../data/Data";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../../../store/authSlice.js"; // Import logout action

// const Header = () => {
//   const [navList, setNavList] = useState(false);
//   const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Check if user is logged in
//   const isAdmin = useSelector((state) => state.auth.isAdmin); // Check if user is admin
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleSignIn = () => {
//     navigate("/auth");
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(`${API_BASE_URL}/api/auth/logout`);
//       dispatch(logout()); // Dispatch logout action to update Redux state
//       navigate("/");
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   return (
//     <>
//       <header>
//         <div className="container flex">
//           <div className="logo">
//             <img src="./images/logo.png" alt="Logo" />
//           </div>
//           <div className="nav">
//             <ul className={navList ? "small" : "flex"}>
//               {/* If admin is logged in, show only "Verify Properties" and "All Properties" */}
//               {isAdmin && isLoggedIn ? (
//                 <>
//                   <li>
//                     <Link to="/verify-properties">Verify Properties</Link>
//                   </li>
//                   <li>
//                     <Link to="/all-property">All Properties</Link>
//                   </li>
//                 </>
//               ) : (
//                 // Otherwise, render the default nav items
//                 <>
//                   {nav.map((list, index) => (
//                     <li key={index}>
//                       <Link to={list.path}>{list.text}</Link>
//                     </li>
//                   ))}
//                   {/* Render "Register Property" link only if the user is logged in and not an admin */}
//                   {isLoggedIn && (
//                     <li>
//                       <Link to="/property">Register Property</Link>
//                     </li>
//                   )}
//                   <li>
//                     <Link to="/all-property">All Properties</Link>
//                   </li>
//                 </>
//               )}
//             </ul>
//           </div>
//           <div className="button flex">
//             {isLoggedIn ? (
//               <button className="btn1" onClick={handleLogout}>
//                 <i className="fa fa-sign-out"></i> Logout
//               </button>
//             ) : (
//               <button className="btn1" onClick={handleSignIn}>
//                 <i className="fa fa-sign-in"></i> Sign In
//               </button>
//             )}
//           </div>

//           <div className="toggle">
//             <button onClick={() => setNavList(!navList)}>
//               {navList ? <i className="fa fa-times"></i> : <i className="fa fa-bars"></i>}
//             </button>
//           </div>
//         </div>
//       </header>
//     </>
//   );
// };

// export default Header;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./header.css";
import { nav } from "../../data/Data";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../store/authSlice.js"; // Import logout action
import { API_BASE_URL } from "../../../config";

const Header = () => {
  const [navList, setNavList] = useState(false);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Check if user is logged in
  const isAdmin = useSelector((state) => state.auth.isAdmin); // Check if user is admin
  const userName = useSelector((state) => state.auth.user?.name || ""); // Get logged-in user's name
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/auth");
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`);
      dispatch(logout()); // Dispatch logout action to update Redux state
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDashboard = () => {
    navigate("/dashboard"); // Navigate to user dashboard
  };

  return (
    <>
      <header>
        <div className="container flex">
          <div className="logo">
            <img src="./images/logo.png" alt="Logo" />
          </div>
          <div className="nav">
            <ul className={navList ? "small" : "flex"}>
              {/* If admin is logged in, show only "Verify Properties" and "All Properties" */}
              {isAdmin && isLoggedIn ? (
                <>
                  <li>
                    <Link to="/verify-properties">Verify Properties</Link>
                  </li>
                  <li>
                    <Link to="/all-property">All Properties</Link>
                  </li>
                </>
              ) : (
                // Otherwise, render the default nav items
                <>
                  {nav.map((list, index) => (
                    <li key={index}>
                      <Link to={list.path}>{list.text}</Link>
                    </li>
                  ))}
                  {/* Render "Register Property" link only if the user is logged in and not an admin */}
                  {isLoggedIn && (
                    <li>
                      <Link to="/property">Register Property</Link>
                    </li>
                  )}
                  <li>
                    <Link to="/all-property">All Properties</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="button flex">
            {isLoggedIn ? (
              <>
                {/* Avatar Icon for User Dashboard */}
                <div className="avatar" onClick={handleDashboard}>
                  <img
                    src="data:image/png;base64,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" // Replace with a placeholder or user profile picture URL
                    alt="User Avatar"
                    className="avatar-icon"
                    title={`Go to ${userName}'s Dashboard`}
                  />
                </div>
                <button className="btn1" onClick={handleLogout}>
                  <i className="fa fa-sign-out"></i> Logout
                </button>
              </>
            ) : (
              <button className="btn1" onClick={handleSignIn}>
                <i className="fa fa-sign-in"></i> Sign In
              </button>
            )}
          </div>

          <div className="toggle">
            <button onClick={() => setNavList(!navList)}>
              {navList ? <i className="fa fa-times"></i> : <i className="fa fa-bars"></i>}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
