import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

// Protect routes - verify JWT
export const protect = async (req, res, next) => {
  console.log('[DEBUG] Protect middleware called for path:', req.path, 'method:', req.method);
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[DEBUG] Token verified for user id:', decoded.id);
    
    // Get user from the token
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      console.log('[DEBUG] No user found with id:', decoded.id);
      return next(new ErrorResponse('No user found with this id', 404));
    }
    
    console.log('[DEBUG] User authenticated:', req.user.name);
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};