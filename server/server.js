const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("News Platform API is running!");
});

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is working perfectly!"
    });
});

// Start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();