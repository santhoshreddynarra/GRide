const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// 🔐 Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (provider or seeker)
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ✅ Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Validate role
    if (!["provider", "seeker"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // ✅ Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 🔥 Hash password (FIXES MAJOR BUG)
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // 🔐 Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error); // 🔥 IMPORTANT DEBUG
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login and return JWT
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    // ✅ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 🔥 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 🔐 Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error); // 🔥 DEBUG
    res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("GETME ERROR:", error);
    res.status(500).json({
      message: "Error fetching user data",
    });
  }
};

module.exports = { register, login, getMe };