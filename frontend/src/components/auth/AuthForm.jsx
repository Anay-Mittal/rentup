// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Home, Mail, Lock, User, ArrowRight } from 'lucide-react';
// import axios from 'axios';
// import { useDispatch } from 'react-redux';
// import { login } from '../../store/authSlice.js';
// import './AuthForm.css';

// export default function AuthForm() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     name: '',
//   });
//   const [message, setMessage] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       if (isLogin) {
//         const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
//           email: formData.email,
//           password: formData.password,
//         });

//         setMessage('Login successful!');
//         const { token, userId } = response.data; // Extract both token and userId
//         dispatch(login({ token, userId })); // Dispatch both token and userId to Redux
//         navigate('/');
//       } else {
//         await axios.post(`${API_BASE_URL}/api/auth/register`, {
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//         });

//         setMessage('Registration successful! You can now log in.');
//         setIsLogin(true); // Switch to login form after successful registration
//       }
//     } catch (error) {
//       setMessage(error.response?.data.message || 'An error occurred. Please try again.');
//     }
//   };

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const toggleForm = () => {
//     setIsLogin(!isLogin);
//     setMessage('');
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-background" />
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="auth-box"
//       >
//         <div className="auth-header">
//           <Home className="auth-icon" />
//           <h1 className="auth-title">DreamHome</h1>
//         </div>

//         <AnimatePresence mode="wait">
//           <motion.form
//             key={isLogin ? 'login' : 'register'}
//             initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
//             transition={{ duration: 0.3 }}
//             onSubmit={handleSubmit}
//             className="auth-form"
//           >
//             <h2 className="auth-subtitle">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

//             {!isLogin && (
//               <div className="input-group">
//                 <User className="input-icon" />
//                 <input
//                   type="text"
//                   name="name"
//                   placeholder="Full Name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className="input-field"
//                   required
//                 />
//               </div>
//             )}

//             <div className="input-group">
//               <Mail className="input-icon" />
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email Address"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className="input-field"
//                 required
//               />
//             </div>

//             <div className="input-group">
//               <Lock className="input-icon" />
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 className="input-field"
//                 required
//               />
//             </div>

//             <motion.button
//               whileHover={{ scale: 1.01 }}
//               whileTap={{ scale: 0.99 }}
//               type="submit"
//               className="auth-button"
//             >
//               {isLogin ? 'Sign In' : 'Create Account'}
//               <ArrowRight className="auth-button-icon" />
//             </motion.button>
//           </motion.form>
//         </AnimatePresence>

//         <div className="auth-toggle">
//           <motion.button
//             onClick={toggleForm}
//             className="auth-toggle-button"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
//           </motion.button>
//         </div>

//         {message && <div className="auth-message">{message}</div>}

//         <div className="auth-footer">Find your dream home with our extensive real estate marketplace</div>
//       </motion.div>
//     </div>
//   );
// }
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Mail, Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../../store/authSlice.js';
import { API_BASE_URL } from '../../config';
import './AuthForm.css';

export default function AuthForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
        });

        setMessage('Login successful!');
        const { token, userId, isAdmin } = response.data; // Extract token, userId, and isAdmin from response
        dispatch(login({ token, userId, isAdmin })); // Dispatch all three to Redux
        navigate('/');
      } else {
        await axios.post(`${API_BASE_URL}/api/auth/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        setMessage('Registration successful! You can now log in.');
        setIsLogin(true); // Switch to login form after successful registration
      }
    } catch (error) {
      setMessage(error.response?.data.message || 'An error occurred. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setMessage('');
  };

  return (
    <div className="auth-container">
      <div className="auth-background" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-box"
      >
        <div className="auth-header">
          <Home className="auth-icon" />
          <h1 className="auth-title">DreamHome</h1>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <h2 className="auth-subtitle">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

            {!isLogin && (
              <div className="input-group">
                <User className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            )}

            <div className="input-group">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="auth-button"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="auth-button-icon" />
            </motion.button>
          </motion.form>
        </AnimatePresence>

        <div className="auth-toggle">
          <motion.button
            onClick={toggleForm}
            className="auth-toggle-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </motion.button>
        </div>

        {message && <div className="auth-message">{message}</div>}

        <div className="auth-footer">Find your dream home with our extensive real estate marketplace</div>
      </motion.div>
    </div>
  );
}
