const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to protect routes — verifies JWT token.
 * Attaches the logged-in user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header has Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      return next(); // ✅ return prevents fall-through to the else block
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    // ✅ else ensures this only runs when no Bearer header was present
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

/**
 * Middleware to restrict access to specific roles.
 * Usage: restrictTo("provider")
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(", ")} can perform this action.`,
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
