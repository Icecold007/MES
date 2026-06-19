const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize application framework instance
const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware configurations
app.use(cors()); // Allow cross-origin client requests
app.use(express.json()); // Teach Express to cleanly parse incoming JSON payloads

// Mount structural application routing layers
const authRoutes = require("./routes/authRoutes");
const drawRoutes = require("./routes/drawRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/draw", drawRoutes);

// Base Diagnostic Route to quickly check if the engine is running
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Start listening for inbound connections
app.listen(PORT, () => {
  console.log(`>>> Server actively running on network interface port: ${PORT}`);
});
