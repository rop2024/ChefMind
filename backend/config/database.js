import mongoose from 'mongoose';

const connectDB = async () => {
  console.log('[DEBUG] Attempting to connect to MongoDB...');
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DEBUG] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
