const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect routes — verifies JWT token and attaches user to req.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      const error = new Error("Not authorized — no token provided");
      error.statusCode = 401;
      throw error;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      const error = new Error("Not authorized — user not found");
      error.statusCode = 401;
      throw error;
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      error.message = "Not authorized — invalid token";
      error.statusCode = 401;
    }
    if (error.name === "TokenExpiredError") {
      error.message = "Not authorized — token expired";
      error.statusCode = 401;
    }
    next(error);
  }
};

/**
 * Restrict access to specific roles.
 * @param  {...string} roles - Allowed roles (e.g., "admin", "staff")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error(
        `Role '${req.user.role}' is not authorized to access this route`
      );
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

module.exports = { protect, authorize };
