const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const todoRoutes = require("./routes/todoRoutes");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./config/logger");
const apiLogger = require("./middleware/apiLogger");

dotenv.config();

const app = express();

const fs = require("fs");
const path = require("path");
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

// Middleware
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true, // Allow credentials
  })
);
app.use(express.json());

// HTTP request logging
app.use(morgan("dev"));
app.use(
  morgan("combined", {
    stream: fs.createWriteStream(path.join(__dirname, "logs/access.log"), {
      flags: "a",
    }),
  })
);

// API logging
app.use(apiLogger);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60, // Session TTL (1 day)
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // Cookie TTL (1 day)
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;

// MongoDB connection with better error handling
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB.");

    // Start server only after successful database connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Error handling for MongoDB connection
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// Handle application shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  process.exit(1);
});
