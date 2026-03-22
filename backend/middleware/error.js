const errorHandler = (err, req, res, next) => {
  console.log('[DEBUG] Error handler triggered for path:', req.path, 'method:', req.method);
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log('[DEBUG] Error details:', err);

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

export default errorHandler;