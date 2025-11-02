import cors from 'cors';

// Allow the client URL from env plus a safe fallback. You can add more
// origins to this array for other dev hosts or staging URLs.
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5000'];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
