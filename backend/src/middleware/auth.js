import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Optional auth middleware — allows requests to proceed even without a valid token
// Useful for development/testing. In production, use the regular 'auth' middleware
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // No token provided, but that's okay for optional auth
    req.user = { userId: "dev-user-123", email: "dev@agrifusion.com" };
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Invalid token, but proceed with mock user anyway
    req.user = { userId: "dev-user-123", email: "dev@agrifusion.com" };
    next();
  }
};