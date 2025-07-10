import mongoose from "mongoose";

const connectMongo = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
    );
  }

  // If already connected, return silently
  if (mongoose.connections[0].readyState === 1) {
    return mongoose.connections[0];
  }

  try {
    console.log("Connecting to MongoDB...");
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 20000,
      maxIdleTimeMS: 30000,
    });
    
    const dbName = connection.connections[0].db?.databaseName;
    console.log(`✅ MongoDB connected successfully to database: ${dbName}`);
    
    return connection;
  } catch (error) {
    console.error("❌ Mongoose Client Error:", error);
    throw error;
  }
};

export default connectMongo;
