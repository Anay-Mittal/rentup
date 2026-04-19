const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../model/user.model.js');
require('dotenv').config();

// Register a new user
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, isAdmin = false } = req.body;

//     // Ensure only an existing admin can register another admin
//     if (isAdmin && (!req.user || !req.user.isAdmin)) {
//       return res.status(403).json({ message: "Unauthorized to register an admin user" });
//     }

//     // Check if the user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Hash the user's password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the new user with the isAdmin flag
//     const newUser = new User({ name, email, password: hashedPassword, isAdmin });
//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully', isAdmin: newUser.isAdmin });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

const registerUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin = false } = req.body;

    // Temporarily remove this authorization check for creating the first admin
    if (isAdmin && (!req.user || !req.user.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized to register an admin user" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, isAdmin });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', isAdmin: newUser.isAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, userId: user._id, isAdmin: user.isAdmin }); // Include isAdmin in the response
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    // Invalidate the token on client side by removing it
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Fetch external data
const fetchExternalData = async (req, res) => {
  try {
    const response = await axios.get('https://api.example.com/data');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching external data', error });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId, 'name email'); // Select relevant fields

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutUser, fetchExternalData ,getUserDetails };
